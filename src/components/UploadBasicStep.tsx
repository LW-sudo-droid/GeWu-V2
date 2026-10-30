import { useState, type ReactNode } from 'react'
import { Info, Plus, Trash2, X } from 'lucide-react'
import { pkuDepartments } from '../data/corpus-filters'
import { provinces, universities } from '../data/upload-options'
import { emptyUploadAuthor, normalizePositiveAmount, type UploadTask } from '../data/upload-tasks'
import UploadYearPicker from './UploadYearPicker'

type Props = { task: UploadTask; errors: Record<string, string>; onChange: (patch: Partial<UploadTask>) => void; onSave: () => void; onNext: () => void; notify: (message: string) => void }
function Field({ id, title, error, children, hint }: { id: string; title: string; error?: string; children: ReactNode; hint?: ReactNode }) {
  return <div className={`uf-field${error ? ' has-error' : ''}`} data-field={id}><div className="uf-field-label"><label htmlFor={id}>{title}<b>*</b></label>{hint}</div>{children}{error && <p className="uf-error" role="alert">{error}</p>}</div>
}
function Example({ source = false }: { source?: boolean }) {
  return <div className="uf-example"><button type="button" aria-label={`查看${source ? '主要数据来源' : '摘要'}填写样例`}><Info size={15} />填写样例</button><div role="tooltip"><p><strong>填写样例：</strong>{source ? '北京大学出版社、北京大学101计划、科学出版社、高等教育出版社；数学各二级学科教材；分类参考：GB/T 13745、NSFC数学学科分类' : '该数据集是面向天然产物结构信息整理的专业数据库，记录天然产物分子结构及相关基础信息，可支撑天然产物识别、检索和药物发现研究。来源于北京大学相关课题组自建数据。建设目的主要是服务天然产物相关模型的后训练、知识增强和检索应用，为天然产物结构知识调用提供基础数据支撑。'}</p><small>以上仅供参考，{source ? '请根据实际语料库建设的数据来源填写。' : '请使用一个或多个自然段组织提交。'}</small></div></div>
}
function TagInput({ id, values, onChange, placeholder, invalid, limit, notify }: { id: string; values: string[]; onChange: (values: string[]) => void; placeholder: string; invalid?: boolean; limit?: number; notify: (message: string) => void }) {
  const [input, setInput] = useState('')
  const add = () => {
    const value = input.trim()
    if (!value) return
    if (values.includes(value)) { setInput(''); return }
    if (limit && values.length >= limit) { notify(`已达到上限，最多添加${limit}个关键词`); return }
    onChange([...values, value]); setInput('')
  }
  return <div className="uf-tags" onClick={(event) => { if (event.target === event.currentTarget) document.getElementById(id)?.focus() }}>
    {values.map((value) => <span key={value}>{value}<button type="button" aria-label={`删除${value}`} onClick={() => onChange(values.filter((item) => item !== value))}><X size={12} /></button></span>)}
    <input id={id} aria-invalid={Boolean(invalid)} value={input} onChange={(event) => setInput(event.target.value)} placeholder={values.length ? '' : placeholder} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); add() } }} />
  </div>
}

export default function UploadBasicStep({ task, errors, onChange, onSave, onNext, notify }: Props) {
  const text = (key: keyof UploadTask, placeholder: string, area = false) => {
    const props = { id: key, value: String(task[key]), placeholder, 'aria-required': true as const, 'aria-invalid': Boolean(errors[key]), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [key]: event.target.value }) }
    return area ? <textarea {...props} rows={2} /> : <input {...props} />
  }
  const select = (key: keyof UploadTask, options: string[], placeholder = '请选择', patch?: (value: string) => Partial<UploadTask>) => <select id={key} aria-required="true" aria-invalid={Boolean(errors[key])} value={String(task[key])} onChange={(event) => onChange(patch ? patch(event.target.value) : { [key]: event.target.value })}><option value="">{placeholder}</option>{options.map((value) => <option key={value}>{value}</option>)}</select>
  const authorChange = (index: number, key: 'name' | 'contact' | 'organization', value: string) => onChange({ authors: task.authors.map((author, position) => position === index ? { ...author, [key]: value } : author) })
  const amount = (kind: 'corpus' | 'storage') => {
    const key = kind === 'corpus' ? 'corpusAmount' : 'storageAmount'
    const unitKey = kind === 'corpus' ? 'corpusUnit' : 'storageUnit'
    return <div className="uf-amount"><input id={key} aria-required="true" aria-invalid={Boolean(errors[key])} inputMode="decimal" value={task[key]} placeholder="请输入大于 0 的数值" onChange={(event) => onChange({ [key]: event.target.value })} onBlur={() => { const value = normalizePositiveAmount(task[key]); if (value) onChange({ [key]: value }) }} /><select aria-label={`${kind === 'corpus' ? '语料规模' : '存储容量'}单位`} value={task[unitKey]} onChange={(event) => onChange({ [unitKey]: event.target.value })}>{(kind === 'corpus' ? ['千条', '万条'] : ['KB', 'MB', 'GB', 'PB', 'TB']).map((unit) => <option key={unit}>{unit}</option>)}</select></div>
  }
  return <form className="uf-basic-form" noValidate onSubmit={(event) => { event.preventDefault(); onNext() }}>
    <section className="uf-section"><h2>任务名称</h2><div className="uf-field-grid"><Field id="taskName" title="任务名称" error={errors.taskName}>{text('taskName', '如：天然产物结构语料汇交（2026-09）')}</Field></div></section>
    <section className="uf-section"><h2>作者信息</h2><div className="uf-authors">{task.authors.map((author, index) => <div className="uf-author-row" key={index}>
      {([{ key: 'name', label: '姓名', placeholder: index ? '请输入姓名' : '作者姓名' }, { key: 'contact', label: '联系方式', placeholder: '邮箱或手机号' }, { key: 'organization', label: '所在单位', placeholder: index ? '请输入单位' : '作者所在单位' }] as const).map(({ key, label, placeholder }) => <div className={`uf-author-field${errors[`author-${index}-${key}`] ? ' has-error' : ''}`} key={key}><label htmlFor={`author-${index}-${key}`}>{label}<b>*</b></label><div><input id={`author-${index}-${key}`} aria-label={`作者${index + 1}${label}`} aria-required="true" aria-invalid={Boolean(errors[`author-${index}-${key}`])} value={author[key]} onChange={(event) => authorChange(index, key, event.target.value)} placeholder={placeholder} />{errors[`author-${index}-${key}`] && <p className="uf-error" role="alert">{errors[`author-${index}-${key}`]}</p>}</div></div>)}
      <div className="uf-author-actions">{index === 0 ? <button type="button" className="uf-author-action" aria-label="添加作者" onClick={() => onChange({ authors: [...task.authors, emptyUploadAuthor()] })}><Plus size={21} /></button> : <button type="button" className="uf-author-action" aria-label={`删除作者${index + 1}`} onClick={() => onChange({ authors: task.authors.filter((_, position) => position !== index) })}><Trash2 size={18} /></button>}</div>
    </div>)}</div></section>
    <section className="uf-section"><h2>语料库信息</h2>
      <div className="uf-field-grid">
        <Field id="corpusName" title="语料库名称" error={errors.corpusName}>{text('corpusName', '请填写语料库的名称，如天然产物语料库', true)}</Field>
        <Field id="introduction" title="语料库摘要" error={errors.introduction} hint={<Example />}>{text('introduction', '请给出语料库的简要介绍', true)}</Field>
        <Field id="keywords" title="语料库关键词" error={errors.keywords}><TagInput id="keywords" values={task.keywords} invalid={Boolean(errors.keywords)} placeholder="输入后回车添加，最多添加10个关键词" limit={10} onChange={(keywords) => onChange({ keywords })} notify={notify} /></Field>
        <Field id="dataSource" title="语料库主要数据来源" error={errors.dataSource} hint={<Example source />}>{text('dataSource', '请说明语料库的主要数据来源', true)}</Field>
      </div>
      <div className="uf-field-grid uf-separated">
        <Field id="subject" title="学科领域" error={errors.subject}>{select('subject', ['数学', '物理', '化学', '天文', '地理', '生物', '其他'])}{task.subject === '其他' && <div className={`uf-sub-field${errors.otherSubject ? ' has-error' : ''}`}>{text('otherSubject', '请输入具体学科')}{errors.otherSubject && <p className="uf-error">{errors.otherSubject}</p>}</div>}</Field>
        <Field id="corpusType" title="语料类型" error={errors.corpusType}>{select('corpusType', ['预训练', '后训练', 'RAG', '微调'])}</Field>
        <Field id="language" title="语种类别" error={errors.language}>{select('language', ['中文/英文', '中文', '英文'])}</Field>
        <Field id="format" title="语料格式" error={errors.format}>{text('format', '如CSV/JSON/SQL')}</Field>
        <Field id="startYear" title="时间跨度" error={errors.startYear || errors.endYear}><div className="uf-year-range"><UploadYearPicker id="startYear" label="开始年份" value={task.startYear} invalid={Boolean(errors.startYear)} max={Number(task.endYear) || undefined} onChange={(startYear) => onChange({ startYear })} /><span>至</span><UploadYearPicker id="endYear" label="结束年份" value={task.endYear} invalid={Boolean(errors.endYear)} min={Number(task.startYear) || undefined} onChange={(endYear) => onChange({ endYear })} /></div></Field>
      </div>
      <div className="uf-field-grid uf-separated">
        <Field id="orgType" title="发布机构类型" error={errors.orgType}>{select('orgType', ['高校', '企业', '新型研发机构', '个人'], '请选择', (orgType) => ({ orgType, organization: '', department: '', customOrganization: '', customDepartment: '', institutionNames: [] }))}</Field>
        {task.orgType === '个人' ? <div className="uf-field"><div className="uf-field-label"><label htmlFor="organization">发布机构</label></div><input id="organization" value="个人" readOnly disabled /></div> : <Field id={['企业', '新型研发机构'].includes(task.orgType) ? 'institutionNames' : 'organization'} title="发布机构" error={errors.organization || errors.institutionNames}>
          {['企业', '新型研发机构'].includes(task.orgType) ? <TagInput id="institutionNames" values={task.institutionNames} invalid={Boolean(errors.institutionNames)} placeholder="输入机构名称后回车添加，至少添加一个" onChange={(institutionNames) => onChange({ institutionNames })} notify={notify} /> : select('organization', task.orgType === '高校' ? universities : [], '请选择', (organization) => ({ organization, department: '', customDepartment: '' }))}
          {task.orgType === '高校' && task.organization === '其他' && <div className={`uf-sub-field${errors.customOrganization ? ' has-error' : ''}`}>{text('customOrganization', '请输入机构名称')}{errors.customOrganization && <p className="uf-error">{errors.customOrganization}</p>}</div>}
          {task.orgType === '高校' && task.organization === '北京大学' && <div className={`uf-sub-field${errors.department ? ' has-error' : ''}`}>{select('department', pkuDepartments.map((item) => item.label), '请选择具体院系或机构')}{errors.department && <p className="uf-error">{errors.department}</p>}{task.department === '其他' && <div className={`uf-sub-field${errors.customDepartment ? ' has-error' : ''}`}>{text('customDepartment', '请输入具体机构')}{errors.customDepartment && <p className="uf-error">{errors.customDepartment}</p>}</div>}</div>}
        </Field>}
        <Field id="province" title="发布机构所在省份" error={errors.province}>{select('province', provinces)}</Field>
        <Field id="corpusAmount" title="语料规模" error={errors.corpusAmount || errors.corpusUnit}>{amount('corpus')}</Field>
        <Field id="storageAmount" title="存储容量" error={errors.storageAmount || errors.storageUnit}>{amount('storage')}</Field>
        <Field id="supplyStatus" title="对外供给情况" error={errors.supplyStatus}>{select('supplyStatus', ['部分提供公开检索服务', '提供对外供给服务', '提供公开检索服务', '无对外供给', '依申请开放', '已公开提供'])}</Field>
        <Field id="supplyMode" title="供给方式" error={errors.supplyMode}>{select('supplyMode', ['开源', '闭源', '定向'])}</Field>
      </div>
    </section>
    <div className="uf-actions"><button type="submit" className="is-primary">下一步</button><button type="button" onClick={onSave}>保存草稿</button></div>
  </form>
}
