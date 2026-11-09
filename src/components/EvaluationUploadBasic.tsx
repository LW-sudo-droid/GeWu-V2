import { useState, type ReactNode } from 'react'
import { ChevronDown, Info, Plus, Search, Trash2, X } from 'lucide-react'
import { EVALUATION_PARADIGMS, EVALUATION_SUBJECTS, EVALUATION_TASKS } from '../data/evaluation-catalog'
import { EVALUATION_LANGUAGES, EVALUATION_MODALITIES, normalizedName, type EvaluationUploadErrors, type EvaluationUploadTask } from '../data/evaluation-upload'
import { emptyUploadAuthor, type UploadAuthor } from '../data/upload-tasks'
import type { CorpusRecord } from '../pages/CorpusSearch'

export function EvaluationField({ id, label, error, children, hint, optional }: {
  id: string
  label: string
  error?: string
  children: ReactNode
  hint?: ReactNode
  optional?: boolean
}) {
  return <div className={`uf-field${error ? ' has-error' : ''}`}>
    <div className="uf-field-label"><label htmlFor={id} id={id + '-label'}>{label}{optional ? <small>（选填）</small> : <b>*</b>}</label>{hint}</div>
    {children}
    {error && <p id={id + '-error'} className="uf-error" role="alert">{error}</p>}
  </div>
}
type BasicProps = {
  task: EvaluationUploadTask
  errors: EvaluationUploadErrors
  corpora: CorpusRecord[]
  onChange: (patch: Partial<EvaluationUploadTask>) => void
  onBlur: (field: string) => void
  notify: (message: string) => void
}
const authorFields = [
  ['name', '姓名', '请输入作者姓名'],
  ['contact', '联系方式', '请输入邮箱或手机号'],
  ['organization', '所在单位或院系', '请输入所在单位或院系'],
] as const
const groups = [
  ['subjects', '学科领域', EVALUATION_SUBJECTS, null, ''],
  ['tasks', '任务类型', EVALUATION_TASKS, 'taskOther', '任务类型'],
  ['paradigms', '评测范式', EVALUATION_PARADIGMS, 'paradigmOther', '评测范式'],
  ['modalities', '模态', EVALUATION_MODALITIES, 'modalityOther', '模态'],
] as const

export default function EvaluationUploadBasic({ task, errors, corpora, onChange, onBlur, notify }: BasicProps) {
  const [keyword, setKeyword] = useState('')
  const [corpusQuery, setCorpusQuery] = useState('')
  const matchingCorpora = corpusQuery.trim() ? corpora.filter(item =>
    !task.relatedCorpora.some(corpus => corpus.id === item.id) && normalizedName(item.title + ' ' + item.organization).includes(normalizedName(corpusQuery))
  ).slice(0, 8) : []
  const changeAuthor = (index: number, key: keyof UploadAuthor, value: string) =>
    onChange({ authors: task.authors.map((author, position) => position === index ? { ...author, [key]: value } : author) })
  const control = (key: 'taskName' | 'name' | 'desc' | 'taskOther' | 'paradigmOther' | 'modalityOther' | 'languageOther', placeholder: string, area = false) => {
    const props = {
      id: 'eu-' + key, value: task[key], placeholder,
      'aria-required': true as const, 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? 'eu-' + key + '-error' : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [key]: event.target.value }),
      onBlur: key === 'name' ? () => onBlur(key) : undefined,
    }
    return area ? <textarea {...props} /> : <input {...props} />
  }
  const addKeyword = () => {
    const value = keyword.trim()
    if (!value) return
    if (task.keywords.some(item => normalizedName(item) === normalizedName(value))) { setKeyword(''); return }
    if (task.keywords.length >= 10) { notify('最多添加10个关键词'); return }
    onChange({ keywords: [...task.keywords, value] })
    setKeyword('')
  }

  return <>
    <section className="uf-section">
      <h2>任务名称</h2>
      <div className="uf-field-grid">
        <EvaluationField id="eu-taskName" label="任务名称" error={errors.taskName}>{control('taskName', '如：物理推理评测集共建（2026-11）')}</EvaluationField>
      </div>
    </section>
    <section className="uf-section">
      <h2>作者及联系人信息</h2>
      <div className="uf-authors">{task.authors.map((author, index) => <div className="uf-author-row" key={index}>
        {authorFields.map(([key, label, placeholder]) => {
          const field = `author-${index}-${key}`
          const id = 'eu-' + field
          return <div className="uf-author-field" key={key}><label htmlFor={id}>{label}<b>*</b></label><div>
            <input id={id} aria-label={`作者${index + 1}${label}`} aria-required="true" aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? id + '-error' : undefined} value={author[key]} placeholder={placeholder}
              onChange={event => changeAuthor(index, key, event.target.value)} onBlur={key === 'contact' ? () => onBlur(field) : undefined} />
            {errors[field] && <p id={id + '-error'} className="uf-error" role="alert">{errors[field]}</p>}
          </div></div>
        })}
        <div className="uf-author-actions">{index === 0
          ? <button type="button" className="uf-author-action" aria-label="添加作者" onClick={() => onChange({ authors: [...task.authors, emptyUploadAuthor()] })}><Plus size={21} /></button>
          : <button type="button" className="uf-author-action" aria-label={`删除作者${index + 1}`} onClick={() => onChange({ authors: task.authors.filter((_, position) => position !== index) })}><Trash2 size={18} /></button>}
        </div>
      </div>)}</div>
    </section>
    <section className="uf-section">
      <h2>评测集信息</h2>
      <div className="uf-field-grid">
        <EvaluationField id="eu-name" label="评测集名称" error={errors.name}>{control('name', '请填写评测集名称，如大学物理推理评测集', true)}</EvaluationField>
        <EvaluationField id="eu-desc" label="评测集简介" error={errors.desc} hint={
          <div className="uf-example"><button type="button" aria-label="查看评测集简介填写样例"><Info size={15} />填写样例</button>
            <div role="tooltip"><p>本评测集面向物理专业问答与推理任务，提供问题、参考解答和评分说明，用于比较模型在指定知识范围内的表现，也可用于验证相关物理语料接入后的应用效果。</p><small>以上仅供参考，请根据实际内容填写。</small></div>
          </div>
        }>{control('desc', '请说明评测集的评测对象、希望检验的能力及适用场景', true)}</EvaluationField>
      </div>
      <div className="uf-field-grid uf-separated">
        {groups.map(([key, label, choices, other, otherLabel]) => {
          const id = 'eu-' + key
          return <div key={key}>
            <EvaluationField id={id} label={label} error={errors[key]}>
              <details className="eu-multiselect" name="evaluation-classification" onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false
              }} onKeyDown={event => {
                if (event.key !== 'Escape' || !event.currentTarget.open) return
                event.currentTarget.open = false
                event.currentTarget.querySelector('summary')?.focus()
              }}>
                <summary id={id} className="uf-year-trigger" aria-labelledby={id + '-label'} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? id + '-error' : undefined}>
                  <span className={task[key].length ? '' : 'is-placeholder'}>{task[key].join('、') || '请选择（可多选）'}</span><ChevronDown size={16} />
                </summary>
                <div className="eu-multi-options">{choices.map(choice => <label key={choice}><input type="checkbox" checked={task[key].includes(choice)} onChange={() => {
                  onChange({ [key]: task[key].includes(choice) ? task[key].filter(value => value !== choice) : [...task[key], choice] })
                }} />{choice}</label>)}</div>
              </details>
            </EvaluationField>
            {other && task[key].includes('其他') && <div className="uf-sub-field"><EvaluationField id={'eu-' + other} label={'其他' + otherLabel} error={errors[other]}>{control(other, '请填写具体' + otherLabel)}</EvaluationField></div>}
          </div>
        })}
        <div>
          <EvaluationField id="eu-language" label="语言" error={errors.language}>
            <select id="eu-language" aria-required="true" aria-invalid={Boolean(errors.language)} value={task.language} onChange={event => onChange({ language: event.target.value })}>
              <option value="">请选择</option>{EVALUATION_LANGUAGES.map(value => <option key={value}>{value}</option>)}
            </select>
          </EvaluationField>
          {task.language === '其他' && <div className="uf-sub-field"><EvaluationField id="eu-languageOther" label="具体语种" error={errors.languageOther}>{control('languageOther', '请输入具体语种')}</EvaluationField></div>}
        </div>
        <EvaluationField id="eu-amount" label="规模" error={errors.amount}>
          <div className="uf-amount"><input id="eu-amount" inputMode="numeric" aria-required="true" aria-invalid={Boolean(errors.amount)} value={task.amount} placeholder="请输入大于 0 的整数" onChange={event => {
            if (/^\d*$/.test(event.target.value)) onChange({ amount: event.target.value })
          }} /><select aria-label="规模单位" value={task.unit} onChange={event => onChange({ unit: event.target.value === '任务' ? '任务' : '题' })}><option>题</option><option>任务</option></select></div>
        </EvaluationField>
        <EvaluationField id="eu-keywords" label="关键词" error={errors.keywords}>
          <div className="uf-tags">
            {task.keywords.map(value => <span key={value} title={value}><span>{value}</span><button type="button" aria-label={'删除关键词 ' + value} onClick={() => onChange({ keywords: task.keywords.filter(item => item !== value) })}><X size={13} /></button></span>)}
            <input id="eu-keywords" aria-required="true" aria-invalid={Boolean(errors.keywords)} value={keyword} placeholder="输入后回车添加，最多添加10个关键词" onChange={event => setKeyword(event.target.value)} onKeyDown={event => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); addKeyword() }
            }} />
          </div>
        </EvaluationField>
        <EvaluationField id="eu-corpus-search" label="关联科学语料库" optional>
          <div className="eu-corpus-search"><Search size={16} /><input id="eu-corpus-search" type="search" value={corpusQuery} onChange={event => setCorpusQuery(event.target.value)} placeholder="搜索语料库名称或机构" onKeyDown={event => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault()
          }} /></div>
          {corpusQuery.trim() && <div className="eu-corpus-results" aria-label="语料库搜索结果">{matchingCorpora.length ? matchingCorpora.map(corpus => <button type="button" key={corpus.id} onClick={() => {
            onChange({ relatedCorpora: [...task.relatedCorpora, { id: corpus.id, name: corpus.title }] }); setCorpusQuery('')
          }}><span>{corpus.title}</span><small>{corpus.organization}</small></button>) : <p role="status">暂无匹配的语料库</p>}</div>}
          {task.relatedCorpora.length > 0 && <div className="uf-tags eu-linked-corpora">{task.relatedCorpora.map(({ id, name }) => <span key={id} title={name}><span>{name}</span><button type="button" aria-label={'移除关联 ' + name} onClick={() => onChange({ relatedCorpora: task.relatedCorpora.filter(corpus => corpus.id !== id) })}><X size={13} /></button></span>)}</div>}
        </EvaluationField>
      </div>
    </section>
  </>
}
