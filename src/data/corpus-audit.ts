import { corpusAdministrator } from './community-users'
import { appendCorpusMembers, defaultCorpusMembers, memberDirectory, readCorpusMembers, saveCorpusMembers, type MemberPermission, type MemberPerson } from './corpus-members'

export type AuditTaskType = '加入申请' | '数据上传'
export type AuditStatus = '待审批' | '已通过' | '已拒绝'
export type OperationType = '成员管理' | '编辑语料' | '审批任务' | '数据上传'
export type CorpusAuditTask = {
  id: string; type: AuditTaskType; content: string; applicant: string; applicantAccount: string
  appliedAt: string; remark: string; reason: string; status: AuditStatus
  permission?: MemberPermission; person?: MemberPerson; source?: string
  license?: string; files?: { name: string; size: number }[]
  approver?: string; approvedAt?: string; rejectionReason?: string
}
export type CorpusOperation = { id: string; operator: string; time: string; actionType: OperationType; content: string }
export type CorpusAuditState = { tasks: CorpusAuditTask[]; logs: CorpusOperation[]; completedExamplesVersion?: number }
export const corpusAuditEvent = 'gw-corpus-audit-change'

const uploadRemarks = ['补充 680 条代数证明样例，已完成去重', '新增几何图形标注及题目解析，附字段说明', '更新数值实验数据，已校验文件完整性', '补充中英双语术语对照，统一实体命名', '修复上一版本缺失字段，保留原始数据索引', '新增模型评测集，训练集与测试集已分离', '补充微积分推导过程，附数据来源说明', '上传 32 份开放教材样例，已核对许可协议']
const joinRemarks = ['申请参与数学语料清洗与质量校验', '负责补充长思维链样例及推导过程', '希望协助维护元数据与字段说明', '申请共建课程题库，已备好示例数据', '参与语料标注复核，协助修正异常样本']

export function auditTimestamp() {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date())
  return parts.replace('T', ' ')
}

function completedExampleTasks(): CorpusAuditTask[] {
  const people = memberDirectory.filter((person) => person.account.startsWith('zhang_'))
  const rejectionReasons = ['数据来源与许可证明不完整，请补充授权材料后重新提交', '样例缺少题目、推导过程及答案字段，请按规范补充', '申请说明未明确共建任务，请补充研究方向与具体分工', '部分数据存在重复和编码异常，请完成清洗后重新上传']
  return Array.from({ length: 12 }, (_, index) => {
    const person = people[index % people.length]
    const upload = index % 2 === 0
    const rejected = index % 3 === 1
    const management = !upload && index % 4 === 3
    const day = String(25 + Math.floor(index / 4)).padStart(2, '0')
    return {
      id: `REQ-202608${day}-${101 + index}`,
      type: upload ? '数据上传' : '加入申请',
      content: upload ? index % 4 === 0 ? '数据URL' : '本地文件' : management ? '管理权限' : '上传权限',
      applicant: person.name, applicantAccount: person.account, person,
      appliedAt: `2026-08-${day} 09:${String(10 + index).padStart(2, '0')}:00`,
      remark: upload ? uploadRemarks[index % uploadRemarks.length] : joinRemarks[index % joinRemarks.length],
      reason: upload ? '申请补充经过校验的数学领域样例与元数据' : '参与语料共建，协助数据清洗、标注及质量复核',
      permission: management ? '可管理' : '可上传',
      status: rejected ? '已拒绝' : '已通过',
      approver: ['张海军', '郑以轩', '张伟'][index % 3],
      approvedAt: `2026-08-${day} 16:${String(20 + index).padStart(2, '0')}:00`,
      rejectionReason: rejected ? rejectionReasons[Math.floor(index / 3) % rejectionReasons.length] : undefined,
    }
  })
}

function withCompletedExamples(state: CorpusAuditState): CorpusAuditState {
  if ((state.completedExamplesVersion ?? 0) >= 1) return state
  const examples = completedExampleTasks().filter((example) => !state.tasks.some((task) => task.id === example.id))
  const logs = examples.map((task): CorpusOperation => ({
    id: `demo-completed-${task.id}`, operator: task.approver!, time: task.approvedAt!, actionType: '审批任务',
    content: `${task.status === '已通过' ? '通过' : '拒绝'}${task.type}：${task.id}${task.rejectionReason ? `；拒绝理由：${task.rejectionReason}` : ''}`,
  })).filter((example) => !state.logs.some((log) => log.id === example.id))
  return { ...state, tasks: [...state.tasks, ...examples], logs: [...state.logs, ...logs], completedExamplesVersion: 1 }
}

function seedAuditState(): CorpusAuditState {
  const people = memberDirectory.filter((person) => person.account.startsWith('zhang_'))
  return withCompletedExamples({
    tasks: Array.from({ length: 26 }, (_, index) => {
      const person = people[index % people.length]
      const upload = index % 3 !== 0
      return { id: `REQ-202608${String(30 - Math.floor(index / 10)).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`, type: upload ? '数据上传' : '加入申请', content: upload ? '数据URL' : '上传权限', applicant: person.name, applicantAccount: person.account, person, appliedAt: `2026-08-${String(30 - Math.floor(index / 10)).padStart(2, '0')} 14:${String(22 - index % 10).padStart(2, '0')}:00`, remark: upload ? uploadRemarks[index % uploadRemarks.length] : joinRemarks[Math.floor(index / 3) % joinRemarks.length], reason: upload ? '补充经过校验的领域样例数据' : '申请参与语料共建', permission: '可上传', status: '待审批' }
    }),
    logs: Array.from({ length: 24 }, (_, index) => ({ id: `demo-log-${index}`, operator: index % 5 === 0 ? '张海军' : '微信用户d4md0', time: `2026-08-${String(30 - Math.floor(index / 8)).padStart(2, '0')} 14:${String(22 - index % 8).padStart(2, '0')}:00`, actionType: index % 3 === 0 ? '成员管理' : '编辑语料', content: index % 3 === 0 ? '调整 1 名成员权限' : '编辑语料：修改语料摘要、关键词' })),
  })
}

const keyFor = (id: string) => `gw-corpus-audit-${id}`
export function readCorpusAudit(id: string): CorpusAuditState {
  try {
    const raw = localStorage.getItem(keyFor(id))
    if (!raw) return seedAuditState()
    const state = JSON.parse(raw) as CorpusAuditState
    if (Array.isArray(state.tasks) && Array.isArray(state.logs) && state.tasks.every((task) => typeof task.id === 'string' && typeof task.appliedAt === 'string' && ['加入申请', '数据上传'].includes(task.type) && ['待审批', '已通过', '已拒绝'].includes(task.status)) && state.logs.every((log) => typeof log.id === 'string' && typeof log.time === 'string')) return withCompletedExamples(state)
  } catch { /* Recover the demo list when local storage is unavailable or invalid. */ }
  return seedAuditState()
}

function writeCorpusAudit(id: string, state: CorpusAuditState) {
  localStorage.setItem(keyFor(id), JSON.stringify(state))
  window.dispatchEvent(new Event(corpusAuditEvent))
}

function uniqueId(prefix: string) { return `${prefix}-${crypto.randomUUID()}` }

export function recordCorpusOperation(id: string, operator: string, actionType: OperationType, content: string): boolean {
  try {
    const state = readCorpusAudit(id)
    writeCorpusAudit(id, { ...state, logs: [{ id: uniqueId('LOG'), operator, actionType, content, time: auditTimestamp() }, ...state.logs] })
    return true
  } catch { return false }
}

export function submitCorpusRequest(id: string, values: Omit<CorpusAuditTask, 'id' | 'status' | 'appliedAt'>): CorpusAuditTask {
  const state = readCorpusAudit(id)
  const task: CorpusAuditTask = { ...values, id: uniqueId(`REQ-${auditTimestamp().slice(0, 10).replaceAll('-', '')}`), status: '待审批', appliedAt: auditTimestamp() }
  writeCorpusAudit(id, { ...state, tasks: [task, ...state.tasks] })
  return task
}

export function decideCorpusRequest(id: string, taskId: string, decision: '已通过' | '已拒绝', operator: string, reason = ''): CorpusAuditState {
  const state = readCorpusAudit(id)
  const task = state.tasks.find((entry) => entry.id === taskId)
  if (!task || task.status !== '待审批') throw new Error('该申请已处理，请刷新列表')
  if (decision === '已拒绝' && !reason.trim()) throw new Error('请填写拒绝理由')
  const time = auditTimestamp()
  const next = { ...state, tasks: state.tasks.map((entry) => entry.id === taskId ? { ...entry, status: decision, approver: operator, approvedAt: time, rejectionReason: decision === '已拒绝' ? reason.trim() : undefined } : entry), logs: [{ id: uniqueId('LOG'), operator, time, actionType: '审批任务' as const, content: `${decision === '已通过' ? '通过' : '拒绝'}${task.type}：${task.id}${decision === '已拒绝' ? `；拒绝理由：${reason.trim()}` : ''}` }, ...state.logs] }
  const previousMembers = readCorpusMembers(id, defaultCorpusMembers(corpusAdministrator(id)))
  const changesMembers = decision === '已通过' && task.type === '加入申请'
  if (changesMembers) {
    const person = task.person ?? memberDirectory.find((entry) => entry.account === task.applicantAccount) ?? { account: task.applicantAccount, name: task.applicant, organization: '', avatar: 'images/demand-users/lab-director.jpg' }
    // Approving a duplicate request preserves any existing administrator permission.
    saveCorpusMembers(id, appendCorpusMembers(previousMembers, [person], task.permission ?? '可上传'))
  }
  try { writeCorpusAudit(id, next) } catch (error) { if (changesMembers) saveCorpusMembers(id, previousMembers); throw error }
  return next
}

export function inAuditDateRange(value: string, from: string, to: string) {
  const day = value.slice(0, 10)
  return (!from || day >= from) && (!to || day <= to)
}

export function auditLogsCsv(logs: CorpusOperation[]) {
  const cell = (value: string) => `"${(/^[\s]*[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
  return '\uFEFF' + [['操作人', '操作类型', '操作内容', '操作时间'], ...logs.map((log) => [log.operator, log.actionType, log.content, log.time])].map((row) => row.map(cell).join(',')).join('\r\n')
}
