import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CheckCircle2, FileText, Plus, Trash2, X } from 'lucide-react'
import { corpusRecords, recordDisplayMeta } from './CorpusSearch'
import { provinces, pkuDepartments, subjectChildren, subjects, universities } from './CorpusUpload'
import { readCorpusEdits, saveCorpusEdits } from '../data/corpus-edits'
import { recordCorpusOperation } from '../data/corpus-audit'
import { useCurrentIdentity } from '../context/use-community'
import DatasetUploadModule from '../components/DatasetUploadModule'
import { emptyUploadSection, type UploadSectionState } from '../data/dataset-upload'
import './dataset-edit.css'

type Author = { name: string; contact: string; organization: string }
const emptyAuthor = (): Author => ({ name: '', contact: '', organization: '' })

export default function DatasetEdit() {
  const { id } = useParams()
  return <DatasetEditContent key={id} />
}

function DatasetEditContent() {
  const identity = useCurrentIdentity()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const item = corpusRecords.find((record) => record.id === id) ?? corpusRecords[0]
  const meta = recordDisplayMeta(item)
  const [saved] = useState(() => readCorpusEdits(item.id))
  const [authors, setAuthors] = useState<Author[]>(saved?.authors ?? [{ name: '张伟', contact: '', organization: item.authors }])
  const [subjectPaths, setSubjectPaths] = useState<string[]>(saved?.subjectPaths ?? [item.subject])
  const [subject, setSubject] = useState(saved?.subjectPaths[0]?.split('/')[0] ?? item.subject)
  const [corpusName, setCorpusName] = useState(saved?.corpusName ?? (item.title))
  const [introduction, setIntroduction] = useState(saved?.introduction ?? (item.summary))
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>(saved?.keywords ?? (item.keywords.slice(0, 10)))
  const [dataSource, setDataSource] = useState(saved?.dataSource ?? ('高校专业教材、科研文献、课程资源及经专家校验的领域数据'))
  const [corpusType, setCorpusType] = useState(saved?.corpusType ?? (item.corpusType.includes('后训练') ? '后训练' : item.corpusType.includes('RAG') || item.corpusType.includes('检索') ? 'RAG' : item.corpusType.includes('微调') ? '微调' : '预训练'))
  const [orgType, setOrgType] = useState(saved?.orgType ?? (item.organization.includes('大学') ? '高校' : item.organization.includes('研究院') ? '新型研发机构' : '企业'))
  const [organization, setOrganization] = useState(saved?.organization ?? (item.organization))
  const [department, setDepartment] = useState(saved?.department ?? (item.organization === '北京大学' ? item.authors.replace('北京大学', '') : ''))
  const [customOrganization, setCustomOrganization] = useState(saved?.customOrganization ?? (''))
  const [customDepartment, setCustomDepartment] = useState(saved?.customDepartment ?? (''))
  const [province, setProvince] = useState(saved?.province ?? (item.organization.includes('北京') ? '北京市' : ''))
  const [corpusSize, setCorpusSize] = useState(saved?.corpusSize ?? (meta.corpusSize))
  const [corpusSizeDetail, setCorpusSizeDetail] = useState(saved?.corpusSizeDetail ?? (''))
  const [storageSize, setStorageSize] = useState(saved?.storageSize ?? (meta.storageSize))
  const [storageSizeDetail, setStorageSizeDetail] = useState(saved?.storageSizeDetail ?? (''))
  const [supplyStatus, setSupplyStatus] = useState(saved?.supplyStatus ?? (item.openness === '依申请开放' || item.openness === '定向开放' ? '依申请开放' : '已公开提供'))
  const [supplyMode, setSupplyMode] = useState(saved?.supplyMode ?? ('开源'))
  const [license, setLicense] = useState(saved?.license ?? ('CC BY 4.0 保留作者署名'))
  const [openness, setOpenness] = useState(saved?.openness ?? (item.openness === '不公开' ? '不公开' : '公开'))
  const [language, setLanguage] = useState(saved?.language ?? (item.subject === '数学' || item.subject === '物理' ? '中文/英文' : '中文'))
  const [format, setFormat] = useState(saved?.format ?? (item.subject === '化学' ? '反应SMARTS + 结构化文本' : item.subject === '地理' || item.subject === '天文' ? 'CSV、JSON、XML、API接口' : 'CSV / JSON / SQL'))
  const [timeSpan, setTimeSpan] = useState(saved?.timeSpan ?? (item.subject === '数学' ? '2000年-至今' : '2020年-至今'))
  const [sampleUpload, setSampleUpload] = useState<UploadSectionState>(emptyUploadSection)
  const [allUpload, setAllUpload] = useState<UploadSectionState>(emptyUploadSection)
  const [remark, setRemark] = useState(saved?.remark ?? (''))
  const [toast, setToast] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [editTab, setEditTab] = useState<'basic' | 'upload'>('basic')
  const toastTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const successDialogRef = useRef<HTMLElement>(null)

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    if (!showSaved) return
    const previousOverflow = document.body.style.overflow
    const returnFocusTarget = saveButtonRef.current
    document.body.style.overflow = 'hidden'
    successDialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSaved(false)
      if (event.key !== 'Tab') return
      const controls = successDialogRef.current?.querySelectorAll<HTMLButtonElement>('button')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === successDialogRef.current)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === successDialogRef.current)) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusTarget?.focus()
    }
  }, [showSaved])

  const flashToast = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  const updateAuthor = (index: number, key: keyof Author, value: string) => setAuthors((current) => current.map((author, i) => i === index ? { ...author, [key]: value } : author))

  const addKeyword = () => {
    const value = keywordInput.trim()
    if (!value) return
    if (keywords.includes(value)) {
      setKeywordInput('')
      return
    }
    if (keywords.length >= 10) {
      flashToast('最多添加 10 个关键词')
      return
    }
    setKeywords((current) => [...current, value])
    setKeywordInput('')
  }

  const saveEdit = () => {
    if (!corpusName.trim() || !introduction.trim() || !corpusType || !format.trim() || !timeSpan.trim()) {
      flashToast('请完善必填信息')
      return
    }
    if (!subjectPaths.length || authors.some((author) => !author.name.trim() || !author.contact.trim() || !author.organization.trim())) {
      flashToast('请完善联系人信息及学科领域')
      setEditTab('basic')
      return
    }
    try {
      saveCorpusEdits(item.id, { authors, subjectPaths, corpusName: corpusName.trim(), introduction: introduction.trim(), keywords, dataSource, corpusType, orgType, organization, department, customOrganization, customDepartment, province, corpusSize, corpusSizeDetail, storageSize, storageSizeDetail, supplyStatus, supplyMode, license, openness, language, format, timeSpan, remark, updatedAt: new Date().toISOString() })
    } catch {
      flashToast('保存失败，请检查浏览器存储空间后重试')
      return
    }
    recordCorpusOperation(item.id, identity.username, '编辑语料', '编辑语料：更新基本信息、联系人及数据说明')
    setShowSaved(true)
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(`/search/datasets/${item.id}`)
  }

  return (
    <div className="dataset-edit-page dataset-edit-design">
      <header className="edit-page-toolbar">
        <button className="edit-return" type="button" onClick={goBack}><span className="edit-return-icon"><ArrowLeft size={17} /></span><span><strong>返回</strong><small>语料编辑</small></span></button>
      </header>

      <section className="dataset-edit-shell">
        <nav className="dataset-edit-tabs" role="tablist" aria-label="编辑页分类">
          <button type="button" role="tab" id="edit-basic-tab" aria-selected={editTab === 'basic'} aria-controls="edit-basic-panel" className={editTab === 'basic' ? 'is-active' : ''} onClick={() => setEditTab('basic')}>基本信息</button>
          <button type="button" role="tab" id="edit-upload-tab" aria-selected={editTab === 'upload'} aria-controls="edit-upload-panel" className={editTab === 'upload' ? 'is-active' : ''} onClick={() => setEditTab('upload')}>上传数据</button>
        </nav>

        {editTab === 'basic' && (
          <div className="edit-form-body" role="tabpanel" id="edit-basic-panel" aria-labelledby="edit-basic-tab">
        <div className="edit-author-list">
          {authors.map((author, index) => (
            <div className="edit-author-row" key={index}>
              <label><span>姓名 <b>*</b></span><input aria-label={`作者${index + 1}姓名`} value={author.name} onChange={(event) => updateAuthor(index, 'name', event.target.value)} placeholder="作者姓名" /></label>
              <label><span>联系方式 <b>*</b></span><input aria-label={`作者${index + 1}联系方式`} value={author.contact} onChange={(event) => updateAuthor(index, 'contact', event.target.value)} placeholder="邮箱或手机号" /></label>
              <label><span>所在单位 <b>*</b></span><input aria-label={`作者${index + 1}所在单位`} value={author.organization} onChange={(event) => updateAuthor(index, 'organization', event.target.value)} placeholder="作者所在单位" /></label>
              <div className="edit-author-controls">
                {index > 0 && <button type="button" aria-label={`删除作者${index + 1}`} onClick={() => setAuthors((current) => current.filter((_, i) => i !== index))}><Trash2 size={15} /></button>}
                {index === 0 && <button type="button" aria-label="添加作者" onClick={() => setAuthors((current) => [...current, emptyAuthor()])}><Plus size={18} /></button>}
              </div>
            </div>
          ))}
        </div>

        <div className="edit-form-section is-first">
          <label className="dataset-edit-field"><span>语料库名称 <b>*</b></span><textarea rows={2} value={corpusName} onChange={(event) => setCorpusName(event.target.value)} placeholder="请填写语料库的名称" /></label>
          <label className="dataset-edit-field"><span>语料库摘要 <b>*</b></span><textarea rows={2} value={introduction} onChange={(event) => setIntroduction(event.target.value)} placeholder="请给出语料库的简要介绍" /></label>
          <div className="dataset-edit-field"><label htmlFor="edit-keyword-input">语料库关键词 <b>*</b></label>
            <div className="edit-keywords" onClick={() => document.getElementById('edit-keyword-input')?.focus()}>
              {keywords.map((keyword) => <span key={keyword}>{keyword}<button type="button" aria-label={`删除关键词 ${keyword}`} onClick={(event) => { event.stopPropagation(); setKeywords((current) => current.filter((item) => item !== keyword)) }}><X size={11} /></button></span>)}
              <input id="edit-keyword-input" aria-label="语料库关键词" value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addKeyword() } }} onBlur={addKeyword} placeholder={keywords.length ? '' : '输入后按回车添加关键词'} />
            </div>
          </div>
          <label className="dataset-edit-field"><span>语料库主要数据来源 <b>*</b></span><textarea rows={2} value={dataSource} onChange={(event) => setDataSource(event.target.value)} placeholder="请说明语料库的主要数据来源" /></label>
        </div>

        <div className="edit-form-section">
          <div className="dataset-edit-field"><label htmlFor="edit-subject">学科领域 <b>*</b></label><select id="edit-subject" value="" onChange={(event) => { const next = event.target.value; setSubject(next); if (!subjectChildren[next]) setSubjectPaths((current) => current.includes(next) ? current.filter((path) => path !== next) : [...current, next]) }}><option value="" disabled>{subjectPaths.join('；') || '请选择学科领域'}</option>{subjects.map((value) => <option key={value} value={value}>{subjectPaths.some((path) => path === value || path.startsWith(`${value}/`)) ? '✓ ' : ''}{value}</option>)}</select>
            {subjectChildren[subject] && <select className="edit-sub-field" aria-label="细分方向（可多选，再次选择可取消）" value="" onChange={(event) => { const path = `${subject}/${event.target.value}`; setSubjectPaths((current) => current.includes(path) ? current.filter((value) => value !== path) : [...current.filter((value) => value !== subject), path]) }}><option value="" disabled>选择细分方向（再次选择可取消）</option>{subjectChildren[subject].map((child) => <option key={child} value={child}>{subjectPaths.includes(`${subject}/${child}`) ? '✓ ' : ''}{child}</option>)}</select>}
          </div>
          <label className="dataset-edit-field"><span>语料类型 <b>*</b></span><select value={corpusType} onChange={(event) => setCorpusType(event.target.value)}>{['预训练', '后训练', 'RAG', '微调'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="dataset-edit-field"><span>语种类别 <b>*</b></span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>中文/英文</option><option>中文</option><option>英文</option></select></label>
          <label className="dataset-edit-field"><span>语料格式 <b>*</b></span><input value={format} onChange={(event) => setFormat(event.target.value)} placeholder="如 CSV / JSON / SQL" /></label>
          <label className="dataset-edit-field"><span>时间跨度 <b>*</b></span><input value={timeSpan} onChange={(event) => setTimeSpan(event.target.value)} placeholder="如 2000年-至今" /></label>
        </div>

        <div className="edit-form-section">
          <label className="dataset-edit-field"><span>发布机构类型 <b>*</b></span><select value={orgType} onChange={(event) => { setOrgType(event.target.value); setOrganization(''); setDepartment('') }}><option>高校</option><option>企业</option><option>新型研发机构</option><option>个人</option></select></label>
          {orgType && orgType !== '个人' ? (
            <div className="dataset-edit-field"><label htmlFor="edit-organization">发布机构 <b>*</b></label><select id="edit-organization" value={organization} onChange={(event) => { setOrganization(event.target.value); setDepartment('') }}><option value="">请选择</option>{(orgType === '高校' ? universities : orgType === '企业' ? ['深势科技', '其他'] : ['北京科学智能研究院', '其他']).map((item) => <option key={item}>{item}</option>)}</select>
              {orgType === '高校' && organization === '北京大学' && <select className="edit-sub-field" aria-label="院系单位" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">请选择院系单位</option>{pkuDepartments.map((item) => <option key={item}>{item}</option>)}</select>}
              {organization === '其他' && <input className="edit-sub-field" aria-label="其他机构名称" value={customOrganization} onChange={(event) => setCustomOrganization(event.target.value)} placeholder="请输入机构名称" />}
              {department === '其他' && <input className="edit-sub-field" aria-label="其他院系名称" value={customDepartment} onChange={(event) => setCustomDepartment(event.target.value)} placeholder="请输入院系名称" />}
            </div>
          ) : <div />}
          <label className="dataset-edit-field"><span>发布机构所在省份 <b>*</b></span><select value={province} onChange={(event) => setProvince(event.target.value)}><option value="">请选择省份</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="dataset-edit-field"><label htmlFor="edit-corpus-size">语料规模 <b>*</b></label><div className="edit-inline-controls"><select id="edit-corpus-size" value={corpusSize} onChange={(event) => setCorpusSize(event.target.value)}><option value="">请选择</option>{['1千以下', '1千-1万', '1万-10万', '10万-100万', '100万及以上'].map((item) => <option key={item}>{item}</option>)}</select><input aria-label="具体语料条数" value={corpusSizeDetail} onChange={(event) => setCorpusSizeDetail(event.target.value)} placeholder="请填写具体语料条数如1000" /></div></div>
          <div className="dataset-edit-field"><label htmlFor="edit-storage-size">存储容量 <b>*</b></label><div className="edit-inline-controls"><select id="edit-storage-size" value={storageSize} onChange={(event) => setStorageSize(event.target.value)}><option value="">请选择</option>{['500GB以下', '500GB-1TB', '1-2TB', '2TB及以上'].map((item) => <option key={item}>{item}</option>)}</select><input aria-label="具体存储容量" value={storageSizeDetail} onChange={(event) => setStorageSizeDetail(event.target.value)} placeholder="请填写具体语料规模如15GB" /></div></div>
          <label className="dataset-edit-field"><span>对外供给情况 <b>*</b></span><select value={supplyStatus} onChange={(event) => setSupplyStatus(event.target.value)}><option value="">请选择</option>{['部分提供公开检索服务', '提供对外供给服务', '提供公开检索服务', '无对外供给', '依申请开放', '已公开提供'].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="edit-form-section">
          <label className="dataset-edit-field"><span>供给方式 <b>*</b></span><select value={supplyMode} onChange={(event) => setSupplyMode(event.target.value)}><option>开源</option><option>闭源</option><option>定向</option></select></label>
          <label className="dataset-edit-field"><span>许可协议 <b>*</b></span><select value={license} onChange={(event) => setLicense(event.target.value)}>{['CC0（完全开放无版权限制）', 'CC BY 4.0 保留作者署名', 'CC BY-SA 4.0 保留作者署名并要求使用者以相同许可协议分发其衍生作品', 'CC BY-NC 4.0 保留作者署名并禁止该数据用于任何商业目的', 'CC BY-NC-SA 4.0 保留作者署名，禁止该数据用于任何商业目的，并要求使用者以相同许可协议分发其衍生作品', 'CC BY-ND 4.0 保留作者署名并禁止使用者对数据进行修改、转换或创作', 'CC BY-NC-ND 4.0 保留作者署名，禁止该数据用于任何商业目的，并禁止使用者对数据进行修改、转换或创作'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="dataset-edit-field"><span>开放程度 <b>*</b></span><select value={openness} onChange={(event) => setOpenness(event.target.value)}><option>公开</option><option>不公开</option></select></label>
        </div>
          </div>
        )}
        {editTab === 'upload' && (
          <div className="edit-form-body edit-upload-body" role="tabpanel" id="edit-upload-panel" aria-labelledby="edit-upload-tab">
        <DatasetUploadModule title="上传示例数据" state={sampleUpload} onChange={setSampleUpload} notify={flashToast} corpusId={item.id} />
        <DatasetUploadModule title="上传全部数据" state={allUpload} onChange={setAllUpload} notify={flashToast} corpusId={item.id} />
        <label className="edit-upload-remark">
          <span>上传备注</span>
          <input value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="说明本次更新的数据内容（选填）" />
        </label>

          </div>
        )}
        <footer className="dataset-edit-actions">
          <button ref={saveButtonRef} className="dataset-edit-save" type="button" onClick={saveEdit}>确定修改</button>
          <button className="dataset-edit-cancel" type="button" onClick={goBack}>取消</button>
        </footer>
      </section>

      {showSaved && (
        <div className="edit-success-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSaved(false) }}>
          <section ref={successDialogRef} tabIndex={-1} className="edit-success-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-success-title" aria-describedby="edit-success-description">
            <button type="button" className="edit-success-close" aria-label="关闭修改成功弹窗" onClick={() => setShowSaved(false)}><X size={20} strokeWidth={1.5} /></button>
            <CheckCircle2 className="edit-success-check" size={40} strokeWidth={1.7} aria-hidden="true" />
            <h2 id="edit-success-title">修改成功</h2>
            <p id="edit-success-description">语料信息已更新，可在语料详情页<br />查看修改结果</p>
            <div className="edit-success-actions">
              <button type="button" onClick={() => navigate(`/search/datasets/${item.id}`)}>查看详情</button>
                <button type="button" className="is-primary" onClick={() => setShowSaved(false)}>继续编辑</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="dataset-toast"><FileText size={16} />{toast}</div>}
    </div>
  )
}
