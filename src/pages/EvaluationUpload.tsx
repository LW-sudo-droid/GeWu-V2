import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, CheckCircle2, Save, UploadCloud } from 'lucide-react'
import { EVALUATION_SUBJECTS, EVALUATION_TASKS, EVALUATION_PARADIGMS, EVALUATION_PERMISSIONS, EVALUATION_DRAFT_KEY, EVALUATION_SUBMISSIONS_KEY } from '../data/evaluation-catalog'
import './evaluation/evaluation-upload.css'

type Draft = { name: string; desc: string; team: string; year: string; version: string; permission: string; paper: string; keywords: string; subjects: string[]; tasks: string[]; paradigms: string[]; taskOther: string; paradigmOther: string }
const empty: Draft = { name:'',desc:'',team:'',year:String(new Date().getFullYear()),version:'v1.0',permission:'公开',paper:'',keywords:'',subjects:[],tasks:[],paradigms:[],taskOther:'',paradigmOther:'' }
function loadDraft(): Draft {
  try {
    const saved = JSON.parse(localStorage.getItem(EVALUATION_DRAFT_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return { ...empty }
    return { ...empty, ...saved, desc:saved.desc || saved.description || '', subjects:Array.isArray(saved.subjects)?saved.subjects:saved.subject?[saved.subject]:[], tasks:Array.isArray(saved.tasks)?saved.tasks:[], paradigms:Array.isArray(saved.paradigms)?saved.paradigms:[] }
  } catch { return { ...empty } }
}
export default function EvaluationUpload() {
  const [draft,setDraft] = useState<Draft>(loadDraft)
  const [message,setMessage] = useState('')
  const [submitted,setSubmitted] = useState(false)
  const set = (key: keyof Draft,value: string) => setDraft(current=>({...current,[key]:value}))
  const toggle = (key:'subjects'|'tasks'|'paradigms',value:string) => setDraft(current=>({...current,[key]:current[key].includes(value)?current[key].filter(item=>item!==value):[...current[key],value]}))
  const saveDraft = () => {
    try { localStorage.setItem(EVALUATION_DRAFT_KEY,JSON.stringify(draft));setMessage('当前内容已保存至草稿箱') } catch { setMessage('保存失败，请检查浏览器存储空间') }
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.subjects.length||!draft.tasks.length||!draft.paradigms.length) { setMessage('请选择学科领域、任务类型和评测范式');return }
    if (draft.paper && !/^https?:\/\//i.test(draft.paper)) { setMessage('官方链接请使用 http 或 https 地址');return }
    try {
      const stored: unknown=JSON.parse(localStorage.getItem(EVALUATION_SUBMISSIONS_KEY)||'[]')
      const records=Array.isArray(stored)?stored:[]
      const updatedAt=new Date().toISOString().slice(0,10)
      records.push({...draft,id:`upload-${crypto.randomUUID()}`,year:Number(draft.year),keywords:draft.keywords.split(/[,，;；]/).map(x=>x.trim()).filter(Boolean),taskOthers:draft.tasks.includes('其他')?[draft.taskOther.trim()].filter(Boolean):[],paradigmOthers:draft.paradigms.includes('其他')?[draft.paradigmOther.trim()].filter(Boolean):[],updatedAt,origin:'platform',status:'pending',icon:'book'})
      localStorage.setItem(EVALUATION_SUBMISSIONS_KEY,JSON.stringify(records));localStorage.removeItem(EVALUATION_DRAFT_KEY);setSubmitted(true)
    } catch { setMessage('提交失败，请检查浏览器存储空间') }
  }
  return <div className="evaluation-upload-page"><div className="eu-inner">
    <Link className="eu-back" to="/evaluation"><ArrowLeft size={18}/>返回评测集</Link>
    {submitted ? <section className="eu-success"><CheckCircle2 size={52}/><h1>评测集已提交审核</h1><p>审核通过后将展示在科学评测集目录中。</p><Link to="/evaluation">返回评测集</Link></section> : <section className="eu-panel"><header><UploadCloud size={24}/><div><h1>上传科学评测集</h1><p>填写评测资源信息，保存草稿或提交审核。</p></div></header><form onSubmit={submit}>
      <div className="eu-grid">
        <label>评测集名称 <b>*</b><input value={draft.name} onChange={e=>set('name',e.target.value)} placeholder="请填写评测集名称" maxLength={100} required/></label>
        <label>提供团队 <b>*</b><input value={draft.team} onChange={e=>set('team',e.target.value)} placeholder="请填写提供团队或机构" required/></label>
        <label className="eu-wide">简介 <b>*</b><textarea value={draft.desc} onChange={e=>set('desc',e.target.value)} placeholder="介绍评测目标、任务和适用场景" maxLength={2000} required/></label>
        {([['subjects','学科领域',EVALUATION_SUBJECTS],['tasks','任务类型',EVALUATION_TASKS],['paradigms','评测范式',EVALUATION_PARADIGMS]] as const).map(([key,label,values])=><fieldset className="eu-wide" key={key}><legend>{label} <b>*</b></legend><div className="eu-choices">{values.map(value=><label key={value}><input type="checkbox" checked={draft[key].includes(value)} onChange={()=>toggle(key,value)}/>{value}</label>)}</div>{key==='tasks'&&draft.tasks.includes('其他')&&<input aria-label="其他任务类型" placeholder="请填写具体的其他任务类型" value={draft.taskOther} onChange={e=>set('taskOther',e.target.value)} required/>}{key==='paradigms'&&draft.paradigms.includes('其他')&&<input aria-label="其他评测范式" placeholder="请填写具体的其他评测范式" value={draft.paradigmOther} onChange={e=>set('paradigmOther',e.target.value)} required/>}</fieldset>)}
        <label>权限范围 <b>*</b><select value={draft.permission} onChange={e=>set('permission',e.target.value)}>{EVALUATION_PERMISSIONS.map(value=><option key={value}>{value}</option>)}</select></label>
        <label>发布年份 <b>*</b><input type="number" min={1900} max={2100} value={draft.year} onChange={e=>set('year',e.target.value)} required/></label>
        <label>版本<input value={draft.version} onChange={e=>set('version',e.target.value)} placeholder="如 v1.0"/></label>
        <label>关键词<input value={draft.keywords} onChange={e=>set('keywords',e.target.value)} placeholder="多个关键词用逗号分隔"/></label>
        <label className="eu-wide">官方链接／论文链接<input type="url" value={draft.paper} onChange={e=>set('paper',e.target.value)} placeholder="https://..."/></label>
      </div><p className="eu-note">当前为演示流程，草稿和提交记录保存在本机浏览器；待审核内容不会进入公开目录。</p>{message&&<p role="status" className="eu-message">{message}</p>}<footer><button type="submit" className="eu-primary">提交审核</button><button type="button" onClick={saveDraft}><Save size={15}/>保存草稿</button><Link to="/evaluation">取消</Link></footer>
    </form></section>}
  </div></div>
}
