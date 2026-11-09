export const EVALUATION_SUBJECTS = ['数学', '物理', '化学', '天文', '地理', '生物', '跨学科']
export const EVALUATION_TASKS = ['科学推理与证明', '代码与执行', '文献与证据', 'Agent与工具', '多模态理解', '定量与计算', '生成与设计', '知识与问答', '科学预测', '可复现与审计', '科学交流', '安全与校准', '模拟与控制', '其他']
export const EVALUATION_PARADIGMS = ['产物验证', 'Agent执行', '生成质量', '多模态理解', '静态问答', '回归与排名', '检索排序', '仿真控制', '安全拒答', '规则量表', '其他']
export const EVALUATION_PERMISSIONS = ['公开', '受限', '不公开']
export const EVALUATION_SUBMISSIONS_KEY = 'science-evaluation-submissions'
export const EVALUATION_DRAFT_KEY = 'science-demo-draft'
const taskAliases: Record<string, string> = { '科学推理': '科学推理与证明', '科学计算': '定量与计算', '科学问答': '知识与问答', '文献理解': '文献与证据', '数据分析': '定量与计算', '科研任务': 'Agent与工具' }
const paradigmAliases: Record<string, string> = { '代码或产物验证': '产物验证', '智能体任务': 'Agent执行', '模型或人工评分': '规则量表', '检索评测': '检索排序' }
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && !!x.trim()).map(x => x.trim()) : typeof value === 'string' ? value.split(/[,，;；]/).map(x => x.trim()).filter(Boolean) : []
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const resourceUrl = (value: unknown) => { const url=text(value);return /^(https?:\/\/|\/(?!\/))/.test(url)?url:'' }
const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
const date = (value: unknown, fallback = '') => {
  const match = text(value).match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})/)
  return match ? `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}` : fallback
}
export function normalizeEvaluationResource(raw: Record<string, unknown>) {
  const taskOthers = strings(raw.taskOthers ?? raw.otherTasks)
  const paradigmOthers = strings(raw.paradigmOthers ?? raw.otherParadigms)
  const normalize = (values: unknown, allowed: string[], aliases: Record<string,string>, other: string[]) => [...new Set(strings(values).map(value => {
    const mapped = aliases[value] || value
    if (allowed.includes(mapped)) return mapped
    if (!other.includes(value)) other.push(value)
    return '其他'
  }))]
  const tasks = normalize(raw.tasks, EVALUATION_TASKS, taskAliases, taskOthers)
  const paradigms = normalize(raw.paradigms, EVALUATION_PARADIGMS, paradigmAliases, paradigmOthers)
  if (taskOthers.length && !tasks.includes('其他')) tasks.push('其他')
  if (paradigmOthers.length && !paradigms.includes('其他')) paradigms.push('其他')
  const originalPermission = text(raw.permission)
  const permission = ['公开','公开共享','开放共享'].includes(originalPermission) ? '公开' : ['不公开','暂不开放'].includes(originalPermission) ? '不公开' : '受限'
  return {
    ...raw,
    id: text(raw.id), name: text(raw.name), desc: text(raw.desc ?? raw.description), team: text(raw.team),
    icon: text(raw.icon, 'book'), version: text(raw.version, 'v1.0'),
    subjects: strings(raw.subjects ?? raw.subject).filter(value => EVALUATION_SUBJECTS.includes(value)),
    tasks, paradigms, taskOthers, paradigmOthers, permission,
    permissionNote: text(raw.permissionNote, originalPermission),
    keywords: strings(raw.keywords), year: Number(raw.year) || 0,
    updatedAt: date(raw.updatedAt, date(raw.checkedAt)),
    downloadCount: count(raw.downloadCount),
    viewCount: count(raw.viewCount ?? raw.views), favoriteCount: count(raw.favoriteCount ?? raw.favorites),
    paper: resourceUrl(raw.paper ?? raw.officialUrl ?? raw.url), url: resourceUrl(raw.url ?? raw.officialUrl ?? raw.paper),
    origin: text(raw.origin, 'external'),
  }
}
export function readApprovedEvaluationUploads() {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(EVALUATION_SUBMISSIONS_KEY) || '[]')
    return Array.isArray(records) ? records.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && entry.status === 'approved' && typeof entry.id === 'string' && typeof entry.name === 'string').map(entry => normalizeEvaluationResource({ ...entry, origin: 'platform' })).filter(entry => entry.permission !== '不公开') : []
  } catch { return [] }
}
