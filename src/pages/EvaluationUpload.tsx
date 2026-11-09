import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Archive, ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, CloudCheck, ContactRound, Upload } from 'lucide-react'
import { useApp } from '../context/app-context'
import { corpusRecords } from './CorpusSearch'
import { useCorpusCatalog } from '../data/corpus-catalog'
import { EVALUATION_DRAFT_KEY } from '../data/evaluation-catalog'
import {
  deleteEvaluationDraft, downloadEvaluationFile, emptyEvaluationTask, evaluationFiles, evaluationLanguage, evaluationLink, evaluationModalities,
  legacyEvaluationDraft, readEvaluationDrafts, readEvaluationSubmissions, readEvaluationTask, saveEvaluationDraft,
  saveEvaluationSubmission, validEvaluationLink, validateEvaluationBasic, validateEvaluationData, EVALUATION_LICENSES, EVALUATION_SHARING,
  type EvaluationDraft, type EvaluationSource, type EvaluationUploadErrors, type EvaluationUploadTask,
} from '../data/evaluation-upload'
import CorpusDialog from '../components/CorpusDialog'
import UploadDraftDialog from '../components/UploadDraftDialog'
import EvaluationUploadBasic, { EvaluationField } from '../components/EvaluationUploadBasic'
import EvaluationUploadFiles from '../components/EvaluationUploadFiles'
import './corpus-upload-form.css'
import './dataset-edit.css'
import './evaluation/evaluation-upload.css'

const steps = [
  { title: '基本信息', description: '填写作者与评测集信息', icon: ContactRound },
  { title: '评测说明与数据上传', description: '填写任务说明并添加数据', icon: Upload },
  { title: '确认信息', description: '核对全部提交内容', icon: ClipboardList },
  { title: '提交成功', description: '查看提交结果', icon: CloudCheck },
]
const instructions = [
  ['taskDescription', '任务说明', '请简要说明任务的定义及相关内容'],
  ['inputExample', '输入示例', '请说明模型接收什么内容'],
  ['expectedOutput', '预期输出', '请说明模型需要返回答案、代码、报告或其他什么产物'],
  ['metric', '评测指标', '如准确率、任务完成率'],
] as const
const uploads = [['sample', '评测集样例'], ['complete', '完整评测集'], ['attachments', '评测集说明附件']] as const
const backToEvaluation = '/evaluation'
const uploadHistory = '/profile?tab=submit'
const saveError = '保存失败，请检查浏览器存储空间后重试'
const newTaskId = () => 'upload-' + crypto.randomUUID()
const top = () => window.scrollTo({ top: 0, behavior: 'instant' })

export default function EvaluationUpload() {
  const { user } = useApp()
  const [params] = useSearchParams()
  const recordId = params.get('record')
  if (!user) return null
  return recordId
    ? <EvaluationRecord key={user.account + recordId} account={user.account} id={recordId} />
    : <EvaluationEditor key={user.account} account={user.account} />
}

function EvaluationEditor({ account }: { account: string }) {
  const navigate = useNavigate()
  const corpora = useCorpusCatalog(corpusRecords)
  const [task, setTask] = useState(emptyEvaluationTask)
  const [savedTask, setSavedTask] = useState(task)
  const [taskId, setTaskId] = useState(newTaskId)
  const [drafts, setDrafts] = useState<EvaluationDraft[]>([])
  const [draftOpen, setDraftOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<EvaluationUploadErrors>({})
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(false)
  const lock = useRef(false)
  const fileCheck = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const form = useRef<HTMLFormElement>(null)
  const step = submitted ? 4 : task.step
  const notify = (message: string) => {
    if (timer.current) clearTimeout(timer.current)
    setToast(message)
    timer.current = setTimeout(() => setToast(''), 3000)
  }
  useEffect(() => {
    let live = true
    const refresh = () => {
      void readEvaluationDrafts(account).then(items => {
        if (!live) return
        const legacy = legacyEvaluationDraft(account)
        setDrafts(legacy && !items.some(item => item.id === legacy.id) ? [...items, legacy] : items)
      }).catch(() => { if (live) setDrafts([]) })
    }
    refresh()
    window.addEventListener('storage', refresh)
    return () => {
      live = false
      window.removeEventListener('storage', refresh)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [account])
  const update = (patch: Partial<EvaluationUploadTask>) => {
    setTask(current => ({ ...current, ...patch }))
    setErrors(current => Object.fromEntries(Object.entries(current).filter(([key]) => {
      if (key in patch) return false
      if (!patch.authors) return true
      if (key === 'name') return !patch.authors.some((author, index) => author.contact !== task.authors[index]?.contact)
      if (!key.startsWith('author-')) return true
      const [, index, field] = key.split('-')
      const property = field as keyof EvaluationUploadTask['authors'][number]
      return patch.authors[Number(index)]?.[property] === task.authors[Number(index)]?.[property]
    })))
  }
  const goTo = (next: EvaluationUploadTask['step'], nextErrors: EvaluationUploadErrors = {}) => {
    setTask(current => ({ ...current, step: next }))
    setErrors(nextErrors)
    top()
  }
  const focusInvalid = () => requestAnimationFrame(() => {
    const control = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    control?.focus({ preventScroll: true })
    control?.scrollIntoView({ block: 'center' })
  })
  const checkField = (field: string) => {
    const value = validateEvaluationBasic(task, account, taskId)[field]
    setErrors(current => {
      const next = { ...current }
      if (value) next[field] = value
      else delete next[field]
      return next
    })
  }
  const leave = () => { navigate(backToEvaluation); top() }
  const back = () => {
    if (lock.current) return
    if (fileCheck.current) return notify('请等待文件校验完成')
    if (!submitted && task !== savedTask) setLeaveOpen(true)
    else leave()
  }
  const run = async (action: () => Promise<void>, onError: () => void) => {
    if (lock.current) return
    if (fileCheck.current) return notify('请等待文件校验完成')
    lock.current = true
    setBusy(true)
    try {
      if (navigator.locks) await navigator.locks.request('science-evaluation-uploads', action)
      else await action()
    } catch { onError() } finally { lock.current = false; setBusy(false) }
  }
  const forgetLegacy = () => {
    if (taskId !== 'legacy-evaluation-draft') return
    try { localStorage.removeItem(EVALUATION_DRAFT_KEY) } catch { /* The saved task is already durable. */ }
  }
  const save = (exit = false) => run(async () => {
    const record = await saveEvaluationDraft(account, taskId, task)
    forgetLegacy()
    setSavedTask(task)
    setDrafts(current => [record, ...current.filter(item => item.id !== record.id)])
    if (exit) leave()
    else notify('当前内容已保存至草稿箱')
  }, () => notify(saveError))
  const openDrafts = () => run(async () => {
    const items = await readEvaluationDrafts(account)
    const legacy = legacyEvaluationDraft(account)
    setDrafts(legacy && !items.some(item => item.id === legacy.id) ? [...items, legacy] : items)
    setDraftOpen(true)
  }, () => notify('草稿箱读取失败，请重试'))
  const resume = (record: EvaluationDraft) => {
    if (lock.current) return
    setTask(record.data); setSavedTask(record.data); setTaskId(record.id)
    setErrors({}); setSubmitted(false); setDraftOpen(false); top()
  }
  const remove = async (id: string) => {
    let removed = false
    await run(async () => {
      await deleteEvaluationDraft(account, id)
      if (id === 'legacy-evaluation-draft') localStorage.removeItem(EVALUATION_DRAFT_KEY)
      setDrafts(current => current.filter(item => item.id !== id))
      if (taskId === id) {
        setTaskId(newTaskId())
        setSavedTask(emptyEvaluationTask())
      }
      removed = true
    }, () => notify('删除失败，请重试'))
    return removed
  }
  const submit = () => run(async () => {
    const basic = validateEvaluationBasic(task, account, taskId)
    const data = validateEvaluationData(task)
    if (Object.keys(basic).length) { goTo(1, basic); focusInvalid(); return }
    if (Object.keys(data).length) { goTo(2, data); focusInvalid(); return }
    if (!task.authorized) {
      setErrors({ authorized: '请确认您具有提交及共享所需的授权' })
      focusInvalid()
      return
    }
    const record = await saveEvaluationDraft(account, taskId, task)
    if (validateEvaluationBasic(task, account, taskId).name) {
      setDrafts(current => [record, ...current.filter(item => item.id !== taskId)])
      goTo(1, { name: '该评测集已存在' }); focusInvalid(); return
    }
    try { saveEvaluationSubmission(account, taskId, task) }
    catch (error) {
      setDrafts(current => [record, ...current.filter(item => item.id !== taskId)])
      setSavedTask(task)
      throw error
    }
    forgetLegacy()
    setDrafts(current => current.filter(item => item.id !== taskId))
    setSubmitted(true)
    top()
  }, () => notify('提交失败，请检查浏览器存储空间后重试'))
  const next = () => {
    if (fileCheck.current) return notify('请等待文件校验完成')
    if (task.step === 3) { void submit(); return }
    const nextErrors = task.step === 1 ? validateEvaluationBasic(task, account, taskId) : validateEvaluationData(task)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) focusInvalid()
    else goTo(task.step === 1 ? 2 : 3)
  }
  const startAgain = () => {
    const empty = emptyEvaluationTask()
    setTask(empty); setSavedTask(empty); setTaskId(newTaskId()); setErrors({}); setSubmitted(false); top()
  }

  return <main className="uf-page evaluation-upload-page">
    <div className="uf-heading">
      <div><button type="button" className="uf-back" aria-label="返回语料评测首页" disabled={busy} onClick={back}><ArrowLeft size={19} /></button>
        <div><h1>上传评测集</h1><p>请按照步骤完善评测集信息并提交审核</p></div></div>
      <button type="button" className="uf-drafts-trigger" disabled={busy || checking} onClick={() => void openDrafts()}><Archive size={18} />草稿箱 {drafts.length || ''}</button>
    </div>
    <div className="uf-card">
      <ol className="uf-stepper">{steps.map(({ title, description, icon: Icon }, index) => <li key={title} className={step === index + 1 ? 'is-active' : step > index + 1 ? 'is-complete' : ''} aria-current={step === index + 1 ? 'step' : undefined}>
        <i>{step > index + 1 ? <Check size={25} /> : <Icon size={27} strokeWidth={1.6} />}</i>
        <div><h2>{title}</h2><p>{description}</p></div>{index < steps.length - 1 && <ArrowRight className="uf-step-arrow" size={23} />}
      </li>)}</ol>
      {submitted ? <div className="uf-success">
        <CheckCircle2 size={64} /><h2>评测集已提交审核</h2>
        <p>可在<Link to={uploadHistory}>个人主页</Link>查看审核进度，审核通过后按所选范围展示与共享。</p>
        <div className="uf-actions"><Link to={backToEvaluation} onClick={top}>返回首页</Link><button className="is-primary" type="button" onClick={startAgain}>继续上传</button></div>
      </div> : <form className={step === 1 ? 'uf-basic-form' : step === 2 ? 'uf-later-form' : 'uf-confirm'} ref={form} noValidate onSubmit={event => { event.preventDefault(); if (!busy) next() }}>
        <fieldset className="eu-step-fields" disabled={busy}>
          {step === 1 && <EvaluationUploadBasic key={taskId} task={task} errors={errors} corpora={corpora} onChange={update} onBlur={checkField} notify={notify} />}
          {step === 2 && <>
            <section className="uf-section"><h2>评测说明</h2><div className="uf-field-grid">
              {instructions.map(([key, title, placeholder]) => <EvaluationField id={'eu-' + key} key={key} label={title} error={errors[key]}>
                <textarea id={'eu-' + key} aria-required="true" aria-invalid={Boolean(errors[key])} value={task[key]} placeholder={placeholder} onChange={event => update({ [key]: event.target.value })} />
              </EvaluationField>)}
            </div></section>
            <section className="uf-section uf-separated"><h2>数据上传</h2>
              {uploads.map(([key, title]) => <EvaluationUploadFiles key={key} title={title} state={task[key]} attachments={key === 'attachments'} error={errors[key]}
                busy={busy || checking} onChange={value => update({ [key]: value })} onChecking={value => { fileCheck.current = value; setChecking(value) }} notify={notify} />)}
            </section>
            <section className="uf-section uf-separated"><h2>许可与共享</h2>
              <div className="uf-field-grid">
                <EvaluationField id="eu-license" label="许可协议" error={errors.license}>
                  <select id="eu-license" aria-required="true" aria-invalid={Boolean(errors.license)} value={task.license} onChange={event => update({ license: event.target.value })}>
                    <option value="">请选择许可协议</option>{EVALUATION_LICENSES.map(([code, description]) => <option key={code} value={code}>{code} · {description}</option>)}
                  </select>
                </EvaluationField>
                <EvaluationField id="eu-permission" label="共享范围" error={errors.permission}>
                  <select id="eu-permission" aria-required="true" aria-invalid={Boolean(errors.permission)} value={task.permission} onChange={event => update({ permission: event.target.value })}>
                    <option value="">请选择共享范围</option>{EVALUATION_SHARING.map(({ value }) => <option key={value}>{value}</option>)}
                  </select>
                  {task.permission && <p className="eu-muted">{EVALUATION_SHARING.find(({ value }) => value === task.permission)?.description}</p>}
                </EvaluationField>
              </div>
            </section>
          </>}
          {step === 3 && <>
            <EvaluationReview task={task} onEdit={goTo} />
            <label className="eu-authorization"><input type="checkbox" checked={task.authorized} aria-required="true" aria-invalid={Boolean(errors.authorized)} onChange={event => update({ authorized: event.target.checked })} />
              <span>我已确认提交材料来源清楚，并具有本次提交及按所选范围共享所需的授权</span></label>
            {errors.authorized && <p className="uf-error" role="alert">{errors.authorized}</p>}
          </>}
          <div className={`uf-actions${step === 3 ? ' eu-confirm-actions' : ''}`}>
            {step === 3 && <button type="button" onClick={() => goTo(2)}>上一步</button>}
            <button type="submit" className="is-primary" disabled={checking}>{step === 3 ? '提交审核' : '下一步'}</button>
            <button type="button" disabled={checking} onClick={() => void save()}>保存草稿</button>
            {step === 2 && <button type="button" disabled={checking} onClick={() => goTo(1)}>上一步</button>}
          </div>
        </fieldset>
      </form>}
    </div>
    {leaveOpen && <CorpusDialog title="当前内容尚未保存，是否离开？" labelledBy="eu-leave-title" className="eu-leave-dialog" onClose={() => { if (!lock.current) setLeaveOpen(false) }}>
      <div className="cr-footer">
        <button type="button" disabled={busy} onClick={() => setLeaveOpen(false)}>继续编辑</button>
        <button type="button" className="is-primary" disabled={busy} onClick={() => void save(true)}>保存草稿并离开</button>
      </div>
    </CorpusDialog>}
    {draftOpen && <UploadDraftDialog drafts={drafts} onClose={() => setDraftOpen(false)} onContinue={resume} onDelete={remove} />}
    {toast && <div className="uf-toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
  </main>
}

function EvaluationReview({ task, onEdit }: { task: EvaluationUploadTask; onEdit?: (step: 1 | 2) => void }) {
  const privateView = !onEdit && task.permission === '不公开'
  const details = (items: [string, ReactNode][]) => <dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
  const section = (title: string, step: 1 | 2, content: ReactNode) => <section className="eu-review-section">
    <div className="eu-review-heading"><h3>{title}</h3>{onEdit && <button type="button" aria-label={'修改' + title} onClick={() => onEdit(step)}>修改</button>}</div>{content}
  </section>
  const selections = (values: string[], other: string) => values.map(value => value === '其他' ? other.trim() : value).join('、')
  const source = (data: EvaluationSource) => {
    if (data.mode === 'link') {
      const url = evaluationLink(data)
      return <><span>{data.linkKind === 'github' ? 'GitHub 仓库' : '远程 URL'}</span><br />
        {!onEdit && validEvaluationLink(data) ? <a href={url} target="_blank" rel="noreferrer">{url}</a> : url}</>
    }
    const files = evaluationFiles(data)
    return files.length ? <><span>{data.mode === 'cli' ? '命令行生成文件' : '本地文件'}</span><ul>{files.map(item =>
      <li key={item.path}>{onEdit ? item.path : <button type="button" className="eu-review-file" onClick={() => downloadEvaluationFile(item)}>{item.path}</button>}</li>
    )}</ul></> : '未添加附件'
  }
  return <>
    {section('基本信息', 1, <>
      {details([
        ['任务名称', task.taskName], ['评测集名称', task.name], ['评测集简介', task.desc], ['学科领域', task.subjects.join('、')],
        ['任务类型', selections(task.tasks, task.taskOther)], ['评测范式', selections(task.paradigms, task.paradigmOther)],
        ['模态', evaluationModalities(task).join('、')], ['语言', evaluationLanguage(task)], ['规模', `${task.amount} ${task.unit}`],
        ['关键词', task.keywords.join('、')], ['关联科学语料库', task.relatedCorpora.map(corpus => corpus.name).join('、')],
      ])}
      <h4>作者及联系人信息</h4>
      <div className="eu-review-authors">{task.authors.map((author, index) => <p key={index}><strong>{author.name}</strong><span>{author.contact}</span><span>{author.organization}</span></p>)}</div>
    </>)}
    {!privateView && section('评测说明', 2, details(instructions.map(([key, label]) => [label, task[key]])))}
    {section(privateView ? '评测集样例' : '数据上传', 2, details(uploads.filter(([key]) => !privateView || key === 'sample').map(([key, label]) => [label, source(task[key])])))}
    {!privateView && section('许可与共享', 2, details([['许可协议', task.license], ['共享范围', task.permission]]))}
  </>
}

function EvaluationRecord({ account, id }: { account: string; id: string }) {
  const [record] = useState(() => readEvaluationSubmissions().find(item => item.account === account && item.id === id))
  const [data, setData] = useState<EvaluationUploadTask | null | undefined>(undefined)
  useEffect(() => {
    if (!record) return
    let active = true
    void readEvaluationTask(account, id).then(entry => { if (active) setData(entry?.data ?? null) }).catch(() => { if (active) setData(null) })
    return () => { active = false }
  }, [account, id, record])
  return <main className="uf-page evaluation-upload-page">
    <div className="uf-heading"><div><Link className="uf-back" to={uploadHistory} aria-label="返回汇交记录"><ArrowLeft size={19} /></Link>
      <div><h1>评测集上传记录</h1><p>{record ? record.name : '暂无记录'}</p></div></div></div>
    <div className="uf-card"><div className="uf-confirm">
      {record && data ? <EvaluationReview task={data} /> : <p role="status">{record && data === undefined ? '正在读取上传记录…' : '未找到可查看的上传记录'}</p>}
    </div></div>
  </main>
}
