import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'
import { useApp } from '../context/app-context'
import { useCurrentIdentity } from '../context/use-community'
import { corpusRecords } from './CorpusSearch'
import { readCorpusEdits } from '../data/corpus-edits'
import { auditLogsCsv, auditTimestamp, corpusAuditEvent, decideCorpusRequest, inAuditDateRange, readCorpusAudit, type CorpusAuditTask } from '../data/corpus-audit'
import './dataset-audit.css'

type DateRangeProps = { label: string; from: string; to: string; onChange: (from: string, to: string) => void }
function DateRange({ label, from, to, onChange }: DateRangeProps) {
  const endRef = useRef<HTMLInputElement>(null)
  return <div className="ca-field ca-range-field"><span>{label}</span><div className="ca-date-range">
    <label><span className={from ? 'has-value' : ''}>{from || '开始日期'}</span><input aria-label={`${label}开始日期`} type="date" value={from} onInput={(event) => { const value = event.currentTarget.value; onChange(value, to && value > to ? value : to) }} onChange={(event) => { const value = event.target.value; onChange(value, to && value > to ? value : to) }} /></label>
    <i>−</i>
    <label><span className={to ? 'has-value' : ''}>{to || '结束日期'}</span><input ref={endRef} aria-label={`${label}结束日期`} type="date" value={to} min={from || undefined} onInput={(event) => { const value = event.currentTarget.value; onChange(from && value && value < from ? value : from, value) }} onChange={(event) => { const value = event.target.value; onChange(from && value && value < from ? value : from, value) }} /></label>
    <button type="button" aria-label={`选择${label}`} onClick={() => { try { endRef.current?.showPicker() } catch { endRef.current?.focus() } }}><CalendarDays size={17} /></button>
  </div></div>
}

function AuditEmpty() {
  return <div className="ca-empty" role="status"><svg width="88" height="82" viewBox="0 0 96 88" fill="none" aria-hidden="true"><rect x="13" y="12" width="35" height="43" rx="4" fill="#e5e7ed" /><circle cx="21" cy="19" r="2" fill="white" /><circle cx="28" cy="19" r="2" fill="white" /><path d="M19 31 42 19h29l7 40H18z" fill="#eef0f5" /><path d="m25 28 57 0-6 40H18z" fill="white" stroke="#e2e5ed" /><circle cx="76" cy="56" r="12" fill="white" stroke="#e2e5eb" strokeWidth="5" /><path d="m85 65 9 11" stroke="#e2e5eb" strokeWidth="5" strokeLinecap="round" /><circle cx="24" cy="69" r="14" fill="#eceef4" stroke="white" strokeWidth="2" /><path d="m20 65 8 8m0-8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg><p>暂无数据</p></div>
}

function RejectDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState(false)
  const dialogRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return createPortal(<div className="ca-reject-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
    <section className="ca-reject-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ca-reject-title" onKeyDown={(event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onCancel() }
      if (event.key !== 'Tab') return
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button,textarea')
      if (!controls?.length) return
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }}>
      <header><h2 id="ca-reject-title">拒绝申请</h2><button type="button" aria-label="关闭拒绝申请" onClick={onCancel}><X size={23} strokeWidth={1.8} /></button></header>
      <form onSubmit={(event) => { event.preventDefault(); if (!reason.trim()) { setError(true); inputRef.current?.focus(); return } onConfirm(reason.trim()) }}>
        <label htmlFor="ca-reject-reason">拒绝理由 <b>*</b></label>
        <textarea id="ca-reject-reason" ref={inputRef} value={reason} maxLength={1000} aria-required="true" aria-invalid={error} aria-describedby={error ? 'ca-reject-error' : undefined} onChange={(event) => { setReason(event.target.value); setError(false) }} placeholder="请输入拒绝理由" />
        {error && <p className="ca-reject-error" id="ca-reject-error" role="alert">请填写拒绝理由</p>}
        <footer><button type="button" onClick={onCancel}>取消</button><button className="is-primary" type="submit">确认</button></footer>
      </form>
    </section>
  </div>, document.body)
}

export default function DatasetAudit() {
  const { id } = useParams()
  return <DatasetAuditContent key={id} />
}

function DatasetAuditContent() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, openAuth } = useApp()
  const identity = useCurrentIdentity()
  const item = corpusRecords.find((record) => record.id === id) ?? corpusRecords[0]
  const title = readCorpusEdits(item.id)?.corpusName ?? item.title
  const [state, setState] = useState(() => readCorpusAudit(item.id))
  const [activeTab, setActiveTab] = useState<'审批任务' | '操作记录'>('审批任务')
  const [subTab, setSubTab] = useState<'待审批' | '已办结'>('待审批')
  const [filterId, setFilterId] = useState('')
  const [filterType, setFilterType] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [status, setStatus] = useState('')
  const [approver, setApprover] = useState('')
  const [approvedFrom, setApprovedFrom] = useState('')
  const [approvedTo, setApprovedTo] = useState('')
  const [operator, setOperator] = useState('')
  const [operationType, setOperationType] = useState('')
  const [operationFrom, setOperationFrom] = useState('')
  const [operationTo, setOperationTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rejectTarget, setRejectTarget] = useState<CorpusAuditTask | null>(null)
  const [toast, setToast] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const refresh = () => setState(readCorpusAudit(item.id))
    window.addEventListener(corpusAuditEvent, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(corpusAuditEvent, refresh); window.removeEventListener('storage', refresh); if (timer.current) clearTimeout(timer.current) }
  }, [item.id])
  const notify = (message: string) => { setToast(message); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 2600) }
  const resetTasks = () => { setFilterId(''); setFilterType(''); setAppliedFrom(''); setAppliedTo(''); setStatus(''); setApprover(''); setApprovedFrom(''); setApprovedTo(''); setPage(1) }
  const resetLogs = () => { setOperator(''); setOperationType(''); setOperationFrom(''); setOperationTo(''); setPage(1) }
  const tasks = state.tasks.filter((task) => (subTab === '待审批' ? task.status === '待审批' : task.status !== '待审批') && task.id.toLowerCase().includes(filterId.trim().toLowerCase()) && (!filterType || task.type === filterType) && inAuditDateRange(task.appliedAt, appliedFrom, appliedTo) && (subTab === '待审批' || ((!status || task.status === status) && (task.approver ?? '').includes(approver.trim()) && inAuditDateRange(task.approvedAt ?? '', approvedFrom, approvedTo)))).sort((a, b) => (subTab === '待审批' ? b.appliedAt.localeCompare(a.appliedAt) : (b.approvedAt ?? '').localeCompare(a.approvedAt ?? '')))
  const logs = state.logs.filter((log) => log.operator.toLowerCase().includes(operator.trim().toLowerCase()) && (!operationType || log.actionType === operationType) && inAuditDateRange(log.time, operationFrom, operationTo)).sort((a, b) => b.time.localeCompare(a.time))
  const total = activeTab === '审批任务' ? tasks.length : logs.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pages)
  const start = (currentPage - 1) * pageSize
  const visibleTasks = tasks.slice(start, start + pageSize)
  const visibleLogs = logs.slice(start, start + pageSize)
  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 2)
  const decide = (task: CorpusAuditTask, decision: '已通过' | '已拒绝', reason = '') => {
    if (!user) { openAuth(`/search/datasets/${item.id}/audit`); return }
    try {
      setState(decideCorpusRequest(item.id, task.id, decision, identity.username, reason))
      setRejectTarget(null)
      notify(decision === '已通过' ? '审批已通过' : '已拒绝该申请')
    } catch (error) { setState(readCorpusAudit(item.id)); notify(error instanceof Error ? error.message : '审批保存失败，请重试') }
  }
  const exportLogs = () => {
    if (!logs.length) { notify('暂无可导出的日志'); return }
    const url = URL.createObjectURL(new Blob([auditLogsCsv(logs)], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${item.id}-操作日志-${auditTimestamp().slice(0, 10)}.csv`
    document.body.appendChild(anchor); anchor.click(); anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('操作日志已导出')
  }
  const updateText = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(event.target.value); setPage(1) }

  return <main className="corpus-audit-page">
    <header className="ca-toolbar"><button type="button" className="ca-back" onClick={() => navigate(`/search/datasets/${item.id}`)}><span><ArrowLeft size={19} /></span><span><strong>返回</strong><small>数据审批 | 语料库：{title}</small></span></button></header>
    <section className="ca-shell">
      <nav className="ca-tabs" aria-label="审批页分类" role="tablist">{(['审批任务', '操作记录'] as const).map((tab) => <button type="button" role="tab" id={tab === '审批任务' ? 'ca-task-tab' : 'ca-log-tab'} aria-selected={activeTab === tab} aria-controls="ca-panel" className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}>{tab}</button>)}</nav>
      <div className="ca-panel" role="tabpanel" id="ca-panel" aria-labelledby={activeTab === '审批任务' ? 'ca-task-tab' : 'ca-log-tab'}>
        {activeTab === '审批任务' ? <>
          <div className="ca-subtabs" aria-label="审批任务状态">{(['待审批', '已办结'] as const).map((tab) => <button type="button" aria-pressed={subTab === tab} className={subTab === tab ? 'is-active' : ''} key={tab} onClick={() => { setSubTab(tab); setPage(1) }}>{tab}</button>)}</div>
          <div className="ca-filters">
            <label className="ca-field">ID<input value={filterId} onChange={updateText(setFilterId)} placeholder="请输入ID" /></label>
            <label className="ca-field">类型<select value={filterType} onChange={updateText(setFilterType)}><option value="">请选择</option><option>加入申请</option><option>数据上传</option></select></label>
            <DateRange label="申请时间" from={appliedFrom} to={appliedTo} onChange={(from, to) => { setAppliedFrom(from); setAppliedTo(to); setPage(1) }} />
            {subTab === '已办结' && <><label className="ca-field">状态<select value={status} onChange={updateText(setStatus)}><option value="">请选择</option><option>已通过</option><option>已拒绝</option></select></label><label className="ca-field">审批人<input value={approver} onChange={updateText(setApprover)} placeholder="请输入审批人" /></label><DateRange label="审批时间" from={approvedFrom} to={approvedTo} onChange={(from, to) => { setApprovedFrom(from); setApprovedTo(to); setPage(1) }} /></>}
            <button className="ca-reset" type="button" onClick={resetTasks}>重置</button>
          </div>
        </> : <div className="ca-filters ca-log-filters">
          <label className="ca-field">操作人<input value={operator} onChange={updateText(setOperator)} placeholder="请输入审批人" /></label>
          <DateRange label="操作时间" from={operationFrom} to={operationTo} onChange={(from, to) => { setOperationFrom(from); setOperationTo(to); setPage(1) }} />
          <label className="ca-field">类型<select value={operationType} onChange={updateText(setOperationType)}><option value="">请选择</option>{['成员管理', '编辑语料', '审批任务', '数据上传'].map((type) => <option key={type}>{type}</option>)}</select></label>
          <button className="ca-reset" type="button" onClick={resetLogs}>重置</button><button className="ca-export" type="button" onClick={exportLogs}><Upload size={17} />导出日志</button>
        </div>}
        <div className="ca-table-scroll">
          {activeTab === '审批任务' ? <table className={`ca-table${subTab === '已办结' ? ' ca-finished-table' : ''}`}>
            <colgroup>{(subTab === '待审批' ? ['14%', '12%', '18%', '10%', '13%', '24%', '9%'] : ['210px', '110px', '150px', '105px', '160px', '240px', '90px', '110px', '160px', '240px']).map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
            <thead><tr><th>ID</th><th>类型</th><th>申请内容</th><th>申请人</th><th>申请时间</th><th>{subTab === '待审批' ? '备注' : '申请理由'}</th>{subTab === '待审批' ? <th>操作</th> : <><th>状态</th><th>审批人</th><th>审批时间</th><th>审批备注</th></>}</tr></thead>
            <tbody>{visibleTasks.map((task) => <tr key={task.id}><td title={task.id}>{task.id}</td><td>{task.type}</td><td title={task.source || task.content}>{task.content}</td><td>{task.applicant}</td><td>{task.appliedAt.slice(0, 16)}</td><td title={subTab === '待审批' ? task.remark : task.reason}>{(subTab === '待审批' ? task.remark : task.reason) || '−'}</td>{subTab === '待审批' ? <td><span className="ca-row-actions"><button type="button" onClick={() => decide(task, '已通过')}>通过</button><button type="button" className="is-reject" onClick={() => setRejectTarget(task)}>拒绝</button></span></td> : <><td><span className={task.status === '已通过' ? 'ca-status-pass' : 'ca-status-reject'}>{task.status}</span></td><td>{task.approver}</td><td>{task.approvedAt?.slice(0, 16)}</td><td title={task.rejectionReason}>{task.rejectionReason || '−'}</td></>}</tr>)}{!visibleTasks.length && <tr><td className="ca-empty-cell" colSpan={subTab === '待审批' ? 7 : 10}><AuditEmpty /></td></tr>}</tbody>
          </table> : <table className="ca-table ca-log-table"><colgroup><col style={{ width: '24%' }} /><col style={{ width: '17%' }} /><col style={{ width: '36%' }} /><col style={{ width: '23%' }} /></colgroup><thead><tr><th>操作人</th><th>操作类型</th><th>操作内容</th><th>操作时间</th></tr></thead><tbody>{visibleLogs.map((log) => <tr key={log.id}><td title={log.operator}>{log.operator}</td><td>{log.actionType}</td><td title={log.content}>{log.content}</td><td>{log.time.slice(0, 16)}</td></tr>)}{!visibleLogs.length && <tr><td className="ca-empty-cell" colSpan={4}><AuditEmpty /></td></tr>}</tbody></table>}
        </div>
      </div>
      <footer className="ca-pagination"><span role="status">共 {total} 条数据</span><nav aria-label="审批列表分页"><button type="button" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{pageNumbers.map((number, index) => <span key={number}>{index > 0 && number - pageNumbers[index - 1] > 1 && <span className="ca-page-ellipsis">…</span>}<button type="button" aria-label={`第${number}页`} aria-current={currentPage === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button></span>)}<button type="button" aria-label="下一页" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></nav><select value={pageSize} aria-label="每页条数" onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map((size) => <option value={size} key={size}>{size}条/页</option>)}</select></footer>
    </section>
    {rejectTarget && <RejectDialog key={rejectTarget.id} onCancel={() => setRejectTarget(null)} onConfirm={(reason) => decide(rejectTarget, '已拒绝', reason)} />}
    {toast && <div className="ca-toast" role="status"><Check size={16} />{toast}</div>}
  </main>
}
