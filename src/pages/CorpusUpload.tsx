import { useEffect, useRef, useState } from 'react'
import { Archive, ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, CloudCheck, ContactRound, Upload } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useApp } from '../context/app-context'
import { corpusRecords } from './CorpusSearch'
import { saveCorpusSubmission, useCorpusCatalog } from '../data/corpus-catalog'
import { corpusAmountBucket, deleteUploadDraft, duplicateCorpusName, effectiveUploadOrganization, emptyUploadTask, normalizePositiveAmount, readUploadDrafts, saveUploadDraft, storageAmountBucket, validateUploadBasic, type UploadDraft, type UploadTask } from '../data/upload-tasks'
import UploadBasicStep from '../components/UploadBasicStep'
import UploadDraftDialog from '../components/UploadDraftDialog'
import CorpusUploadFiles from '../components/CorpusUploadFiles'
import './corpus-upload-form.css'

const steps = [
  { title: '基本信息', description: '填写作者与语料库信息', icon: ContactRound },
  { title: '上传语料库', description: '设置开放范围并上传文件', icon: Upload },
  { title: '确认信息', description: '核对全部提交内容', icon: ClipboardList },
  { title: '上传成功', description: '查看审核和上传结果', icon: CloudCheck },
]
const licenses = ['CC0（完全开放无版权限制）', 'CC BY 4.0 保留作者署名', 'CC BY-SA 4.0 保留作者署名并要求使用者以相同许可协议分发其衍生作品', 'CC BY-NC 4.0 保留作者署名并禁止该数据用于任何商业目的', 'CC BY-NC-SA 4.0 保留作者署名，禁止商业使用，并以相同许可协议分发', 'CC BY-ND 4.0 保留作者署名并禁止修改', 'CC BY-NC-ND 4.0 保留作者署名，禁止商业使用和修改']

export default function CorpusUpload() {
  const { user, openAuth } = useApp()
  const [params] = useSearchParams()
  useEffect(() => { if (!user) openAuth(`/upload/form${params.toString() ? `?${params.toString()}` : ''}`) }, [user, openAuth, params])
  return user ? <UploadEditor key={user.account} account={user.account} /> : <main className="uf-page"><div className="uf-auth-required">请登录后填写语料信息</div></main>
}

function UploadEditor({ account }: { account: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const records = useCorpusCatalog(corpusRecords)
  const [task, setTask] = useState<UploadTask>(() => {
    const item = records.find((record) => record.id === params.get('edit'))
    return item ? { ...emptyUploadTask(), editId: item.id, corpusName: item.title, introduction: item.summary, keywords: item.keywords, subject: item.subject, corpusType: item.corpusType.includes('后训练') ? '后训练' : '预训练', organization: item.organization, orgType: item.organization.includes('大学') ? '高校' : '企业' } : emptyUploadTask()
  })
  const [draftId, setDraftId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState(() => readUploadDrafts(account))
  const [draftOpen, setDraftOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')
  const [editorVersion, setEditorVersion] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const refresh = () => setDrafts(readUploadDrafts(account))
    window.addEventListener('storage', refresh)
    window.addEventListener('gw-upload-drafts-changed', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('gw-upload-drafts-changed', refresh); if (timer.current) clearTimeout(timer.current) }
  }, [account])
  const notify = (message: string) => {
    if (timer.current) clearTimeout(timer.current)
    setToast(message); timer.current = setTimeout(() => setToast(''), 2800)
  }
  const update = (patch: Partial<UploadTask>) => {
    setTask((current) => ({ ...current, ...patch }))
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !Object.keys(patch).some((field) => key === field || field === 'authors' && key.startsWith('author-') || field === 'orgType' && ['organization', 'department', 'customOrganization', 'customDepartment', 'institutionNames'].includes(key) || ['startYear', 'endYear'].includes(field) && ['startYear', 'endYear'].includes(key)))))
  }
  const setStep = (step: number) => { update({ step }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const save = () => {
    try { const draft = saveUploadDraft(account, task, draftId); setDraftId(draft.id); setDrafts(readUploadDrafts(account)); notify('当前内容已保存至草稿箱') }
    catch { notify('保存失败，请检查浏览器存储空间后重试') }
  }
  const continueDraft = (draft: UploadDraft) => {
    setTask(structuredClone(draft.data)); setDraftId(draft.id); setErrors({}); setEditorVersion((current) => current + 1); setDraftOpen(false); window.scrollTo({ top: 0 })
  }
  const removeDraft = (id: string) => {
    try {
      deleteUploadDraft(account, id)
      setDrafts(readUploadDrafts(account))
      if (draftId === id) setDraftId(null)
      return true
    } catch { notify('删除失败，请重试'); return false }
  }
  const nextBasic = () => {
    const nextErrors = validateUploadBasic(task, records)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.querySelector('.uf-basic-form [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return
    }
    update({ corpusAmount: normalizePositiveAmount(task.corpusAmount)!, storageAmount: normalizePositiveAmount(task.storageAmount)!, step: 2 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const nextFiles = () => {
    if (!task.license || !task.openness) return notify('请选择许可协议和开放程度')
    for (const key of ['sample', 'all'] as const) {
      const source = task.uploads[key]
      if (source.mode === 'local' && !source.files.length || source.mode === 'link' && !source.link.trim()) return notify(key === 'sample' ? '请上传示例数据' : '请上传全部数据')
    }
    setStep(3)
  }
  const submit = () => {
    const nextErrors = validateUploadBasic(task, records)
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setStep(1); notify('请完善基本信息后提交'); return }
    const id = task.editId || task.submittedId || `upload-${crypto.randomUUID()}`
    try {
      saveCorpusSubmission({ id, title: task.corpusName.trim(), summary: task.introduction.trim(), organization: effectiveUploadOrganization(task),
        subject: task.subject, subjectPaths: [task.subject === '其他' ? `其他/${task.otherSubject.trim()}` : task.subject], corpusType: task.corpusType, openness: task.openness,
        keywords: task.keywords, authors: [(task.department === '其他' ? task.customDepartment : task.department), ...task.authors.map((author) => author.name)].filter(Boolean).join('、'),
        publishedAt: new Date().toLocaleDateString('sv-SE'), views: 0, favorites: 0, usage: 0, status: '建设中', corpusSize: corpusAmountBucket(task.corpusAmount, task.corpusUnit), storageSize: storageAmountBucket(task.storageAmount, task.storageUnit),
        uploadInfo: { language: task.language, format: task.format, startYear: task.startYear, endYear: task.endYear, taskName: task.taskName, corpusAmount: task.corpusAmount, corpusUnit: task.corpusUnit, storageAmount: task.storageAmount, storageUnit: task.storageUnit },
      })
      if (draftId) { deleteUploadDraft(account, draftId); setDraftId(null) }
      update({ submittedId: id, step: 4 }); window.scrollTo({ top: 0 })
    } catch { notify('保存失败，请重试') }
  }
  const visibleErrors = duplicateCorpusName(task.corpusName, records, task.editId || task.submittedId) ? { ...errors, corpusName: '已重名' } : errors
  const subjectLabel = task.subject === '其他' ? `其他 / ${task.otherSubject}` : task.subject
  return <main className="uf-page">
    <div className="uf-heading"><div><button type="button" className="uf-back" aria-label="返回语料上传落地页" onClick={() => { navigate('/upload'); window.scrollTo({ top: 0 }) }}><ArrowLeft size={19} /></button><div><h1>上传语料库</h1><p>请按照步骤完善语料库信息并提交审核</p></div></div><button type="button" className="uf-drafts-trigger" onClick={() => { setDrafts(readUploadDrafts(account)); setDraftOpen(true) }}><Archive size={18} />草稿箱 {drafts.length || ''}</button></div>
    <div className="uf-card">
      <ol className="uf-stepper">{steps.map(({ title, description, icon: Icon }, index) => <li key={title} className={`${task.step === index + 1 ? 'is-active' : ''}${task.step > index + 1 ? ' is-complete' : ''}`} aria-current={task.step === index + 1 ? 'step' : undefined}><i>{task.step > index + 1 ? <Check size={25} /> : <Icon size={27} strokeWidth={1.6} />}</i><div><h2>{title}</h2><p>{description}</p></div>{index < 3 && <ArrowRight className="uf-step-arrow" size={23} />}</li>)}</ol>
      {task.step === 1 && <UploadBasicStep key={editorVersion} task={task} errors={visibleErrors} onChange={update} onNext={nextBasic} onSave={save} notify={notify} />}
      {task.step === 2 && <form className="uf-later-form" onSubmit={(event) => { event.preventDefault(); nextFiles() }}>
        <h2>上传语料库</h2><div className="uf-field-grid"><label>许可协议 <b>*</b><select value={task.license} onChange={(event) => update({ license: event.target.value })}><option value="">请选择许可协议</option>{licenses.map((value) => <option key={value}>{value}</option>)}</select></label><label>开放程度 <b>*</b><select value={task.openness} onChange={(event) => update({ openness: event.target.value })}><option value="">请选择</option><option>公开</option><option>不公开</option></select></label></div>
        <CorpusUploadFiles title="示例数据上传" required description="所有开放程度均需提供不含敏感信息的示例数据" state={task.uploads.sample} onChange={(sample) => update({ uploads: { ...task.uploads, sample } })} />
        <CorpusUploadFiles title="全部数据" required description="上传语料库完整数据，实际下载范围依据权限和开放程度控制" state={task.uploads.all} onChange={(all) => update({ uploads: { ...task.uploads, all } })} />
        <div className="uf-actions"><button type="submit" className="is-primary">下一步</button><button type="button" onClick={save}>保存草稿</button><button type="button" onClick={() => setStep(1)}>上一步</button></div>
      </form>}
      {task.step === 3 && <div className="uf-confirm"><h2>确认信息</h2><h3>{task.taskName}</h3><dl>{[
        ['语料库名称', task.corpusName], ['语料库摘要', task.introduction], ['语料库关键词', task.keywords.join('、')], ['主要数据来源', task.dataSource],
        ['学科领域', subjectLabel], ['语料类型', task.corpusType], ['语种类别', task.language], ['语料格式', task.format], ['时间跨度', `${task.startYear}—${task.endYear}`],
        ['发布机构', [effectiveUploadOrganization(task), task.department === '其他' ? task.customDepartment : task.department].filter(Boolean).join(' - ')], ['所在省份', task.province],
        ['语料规模', `${task.corpusAmount}${task.corpusUnit}`], ['存储容量', `${task.storageAmount}${task.storageUnit}`], ['对外供给情况', task.supplyStatus], ['供给方式', task.supplyMode], ['许可协议', task.license], ['开放程度', task.openness],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>作者信息</h3>{task.authors.map((author, index) => <p key={index}>{author.name} · {author.contact} · {author.organization}</p>)}<div className="uf-actions"><button type="button" className="is-primary" onClick={submit}>提交审核</button><button type="button" onClick={save}>保存草稿</button><button type="button" onClick={() => setStep(2)}>上一步</button></div></div>}
      {task.step === 4 && <div className="uf-success"><CheckCircle2 size={64} /><h2>语料库上传成功</h2><p>平台已收到您的语料库信息，审核进度与结果可在个人主页查看。</p><div className="uf-actions"><Link to="/profile">前往个人主页</Link><Link to={`/search/datasets/${task.submittedId}`}>查看语料详情</Link></div></div>}
    </div>
    {draftOpen && <UploadDraftDialog drafts={drafts} onClose={() => setDraftOpen(false)} onContinue={continueDraft} onDelete={removeDraft} />}
    {toast && <div className="uf-toast" role="status"><InfoToast />{toast}</div>}
  </main>
}
function InfoToast() { return <CheckCircle2 size={18} /> }
