export type UploadAuthor = { name: string; contact: string; organization: string }
export type UploadSource = { mode: 'local' | 'link' | 'cli'; files: string[]; link: string; linkKind: 'url' | 'github' }
export type UploadTask = {
  taskName: string; authors: UploadAuthor[]; corpusName: string; introduction: string; keywords: string[]; dataSource: string
  subject: string; otherSubject: string; corpusType: string; language: string; format: string; startYear: string; endYear: string
  orgType: string; organization: string; department: string; customOrganization: string; customDepartment: string; institutionNames: string[]
  province: string; corpusAmount: string; corpusUnit: string; storageAmount: string; storageUnit: string; supplyStatus: string; supplyMode: string
  license: string; openness: string; uploads: Record<'sample' | 'public' | 'all', UploadSource>; step: number; submittedId: string; editId: string
}
export type UploadDraft = { id: string; savedAt: string; data: UploadTask }

export const emptyUploadAuthor = (): UploadAuthor => ({ name: '', contact: '', organization: '' })
const emptySource = (): UploadSource => ({ mode: 'local', files: [], link: '', linkKind: 'url' })
export function emptyUploadTask(): UploadTask {
  return { taskName: '', authors: [emptyUploadAuthor()], corpusName: '', introduction: '', keywords: [], dataSource: '',
    subject: '', otherSubject: '', corpusType: '', language: '', format: '', startYear: '', endYear: '',
    orgType: '', organization: '', department: '', customOrganization: '', customDepartment: '', institutionNames: [], province: '',
    corpusAmount: '', corpusUnit: '万条', storageAmount: '', storageUnit: 'GB', supplyStatus: '', supplyMode: '', license: '', openness: '',
    uploads: { sample: emptySource(), public: emptySource(), all: emptySource() }, step: 1, submittedId: '', editId: '' }
}

export function normalizePositiveAmount(value: string): string | null {
  if (!/^\d+(?:\.\d*)?$/.test(value.trim())) return null
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0 || number >= 1e15) return null
  const rounded = Math.round((number + Number.EPSILON) * 10) / 10
  return rounded > 0 ? rounded.toFixed(1) : null
}

export function corpusAmountBucket(value: string, unit: string) {
  const amount = Number(value) * (unit === '千条' ? 1000 : 10000)
  return amount < 1000 ? '1千以下' : amount < 10000 ? '1千-1万' : amount < 100000 ? '1万-10万' : amount < 1000000 ? '10万-100万' : '100万及以上'
}
export function storageAmountBucket(value: string, unit: string) {
  const gb = Number(value) * ({ KB: 1 / 1024 ** 2, MB: 1 / 1024, GB: 1, TB: 1024, PB: 1024 ** 2 }[unit] ?? 1)
  return gb < 500 ? '500GB以下' : gb < 1024 ? '500GB-1TB' : gb < 2048 ? '1-2TB' : '2TB及以上'
}

export function effectiveUploadOrganization(task: UploadTask) {
  if (task.orgType === '个人') return '个人'
  if (task.orgType === '企业' || task.orgType === '新型研发机构') return task.institutionNames.join('、')
  return task.organization === '其他' ? task.customOrganization.trim() : task.organization
}
export function duplicateCorpusName(name: string, records: { id: string; title: string }[], editId = '') {
  const normalize = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase()
  return Boolean(name.trim() && records.some((record) => record.id !== editId && normalize(record.title) === normalize(name)))
}

export function validateUploadBasic(task: UploadTask, records: { id: string; title: string }[]) {
  const errors: Record<string, string> = {}
  const required = (key: keyof UploadTask, message = '请输入') => { if (typeof task[key] === 'string' && !task[key].trim()) errors[key] = message }
  for (const key of ['taskName', 'corpusName', 'introduction', 'dataSource', 'format'] as const) required(key)
  if (duplicateCorpusName(task.corpusName, records, task.editId || task.submittedId)) errors.corpusName = '已重名'
  task.authors.forEach((author, index) => {
    if (!author.name.trim()) errors[`author-${index}-name`] = '请输入姓名'
    if (!author.contact.trim()) errors[`author-${index}-contact`] = '请输入邮箱或手机号'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author.contact.trim()) && !/^\+?\d[\d\s-]{6,19}$/.test(author.contact.trim())) errors[`author-${index}-contact`] = '请输入有效的邮箱或手机号'
    if (!author.organization.trim()) errors[`author-${index}-organization`] = '请输入所在单位'
  })
  if (!task.authors.length) errors.authors = '请至少添加一位作者'
  if (!task.keywords.length) errors.keywords = '请添加关键词'
  if (task.keywords.length > 10) errors.keywords = '最多添加10个关键词'
  if (!['数学', '物理', '化学', '天文', '地理', '生物', '其他'].includes(task.subject)) errors.subject = '请选择学科领域'
  if (task.subject === '其他') {
    if (!task.otherSubject.trim()) errors.otherSubject = '请输入具体学科'
    else if (/[、，,；;\n/]/.test(task.otherSubject) || ['数学', '物理', '化学', '天文', '地理', '生物', '其他'].includes(task.otherSubject.trim())) errors.otherSubject = '请填写一个其他学科，六大学科请直接选择'
  }
  if (!['预训练', '后训练', 'RAG', '微调'].includes(task.corpusType)) errors.corpusType = '请选择语料类型'
  if (!['中文/英文', '中文', '英文'].includes(task.language)) errors.language = '请选择语种类别'
  for (const key of ['startYear', 'endYear'] as const) if (!/^\d{1,4}$/.test(task[key]) || Number(task[key]) < 1) errors[key] = '请选择年份'
  if (!errors.startYear && !errors.endYear && Number(task.startYear) > Number(task.endYear)) errors.endYear = '结束年份不能早于开始年份'
  if (!['高校', '企业', '新型研发机构', '个人'].includes(task.orgType)) errors.orgType = '请选择发布机构类型'
  if (task.orgType === '高校') {
    required('organization', '请选择发布机构')
    if (task.organization === '其他') required('customOrganization', '请输入机构名称')
    if (task.organization === '北京大学') {
      required('department', '请选择具体院系或机构')
      if (task.department === '其他') required('customDepartment', '请输入具体机构')
    }
  }
  if (['企业', '新型研发机构'].includes(task.orgType) && !task.institutionNames.length) errors.institutionNames = '请至少添加一个机构名称'
  required('province', '请选择省份')
  if (!normalizePositiveAmount(task.corpusAmount)) errors.corpusAmount = '请输入大于0的数值，保留一位小数'
  if (!normalizePositiveAmount(task.storageAmount)) errors.storageAmount = '请输入大于0的数值，保留一位小数'
  if (!['千条', '万条'].includes(task.corpusUnit)) errors.corpusUnit = '请选择单位'
  if (!['KB', 'MB', 'GB', 'PB', 'TB'].includes(task.storageUnit)) errors.storageUnit = '请选择单位'
  required('supplyStatus', '请选择对外供给情况')
  required('supplyMode', '请选择供给方式')
  return errors
}

function normalizeDraftData(value: Partial<UploadTask>): UploadTask {
  const defaults = emptyUploadTask()
  return { ...defaults, ...value, authors: Array.isArray(value.authors) && value.authors.length ? value.authors.map((author) => ({ ...emptyUploadAuthor(), ...author })) : defaults.authors,
    keywords: Array.isArray(value.keywords) ? value.keywords : [], institutionNames: Array.isArray(value.institutionNames) ? value.institutionNames : [],
    uploads: { ...defaults.uploads, ...value.uploads }, step: Math.min(3, Math.max(1, Math.trunc(Number(value.step) || 1))) }
}
const keyFor = (account: string) => `gw-upload-drafts-${account}`
export function readUploadDrafts(account: string): UploadDraft[] {
  try {
    const stored = localStorage.getItem(keyFor(account))
    if (stored !== null) {
      const entries: unknown = JSON.parse(stored)
      return Array.isArray(entries) ? entries.filter((item): item is UploadDraft => Boolean(item && typeof item.id === 'string' && typeof item.savedAt === 'string' && item.data && typeof item.data === 'object')).map((item) => ({ ...item, data: normalizeDraftData(item.data) })).sort((a, b) => b.savedAt.localeCompare(a.savedAt)) : []
    }
    const legacy = JSON.parse(localStorage.getItem(`gw-upload-draft-${account}`) ?? 'null')
    if (!legacy || typeof legacy !== 'object') return []
    const data = normalizeDraftData({ ...legacy, taskName: legacy.taskName || legacy.corpusName || '未命名任务', subject: legacy.subject || legacy.selectedSubjects?.[0] || '', otherSubject: legacy.otherSubjectInput || '', corpusAmount: legacy.corpusSizeDetail || '', storageAmount: legacy.storageSizeDetail || '' })
    return [{ id: 'legacy-upload-draft', savedAt: '1970-01-01T00:00:00.000Z', data }]
  } catch { return [] }
}
export function saveUploadDraft(account: string, data: UploadTask, id: string | null): UploadDraft {
  const draft = { id: id || crypto.randomUUID(), savedAt: new Date().toISOString(), data: normalizeDraftData(data) }
  localStorage.setItem(keyFor(account), JSON.stringify([draft, ...readUploadDrafts(account).filter((item) => item.id !== draft.id)]))
  window.dispatchEvent(new Event('gw-upload-drafts-changed'))
  return draft
}
export function deleteUploadDraft(account: string, id: string) {
  localStorage.setItem(keyFor(account), JSON.stringify(readUploadDrafts(account).filter((item) => item.id !== id)))
  window.dispatchEvent(new Event('gw-upload-drafts-changed'))
}
