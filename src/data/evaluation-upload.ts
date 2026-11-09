import { emptyUploadAuthor, type UploadAuthor } from './upload-tasks'
import { EVALUATION_DRAFT_KEY, EVALUATION_SUBMISSIONS_KEY } from './evaluation-catalog'

export const EVALUATION_LANGUAGES = ['中文', '英文', '中文/英文', '其他']
export const EVALUATION_MODALITIES = ['文本', '图片', '视频', '音频', '其他']
export const EVALUATION_SHARING = [
  { value: '公开', description: '在公开目录展示名称、简介及获准展示的样例，可下载完整的评测集。' },
  { value: '不公开', description: '上传者可在自己的上传记录中查看，详情页仅展示基本信息和样例。' },
]
export const EVALUATION_LICENSES = [
  ['CC0', '尽可能放弃版权及相关权利，允许自由使用'],
  ['CC BY 4.0', '保留作者署名'],
  ['CC BY-SA 4.0', '保留作者署名，以相同许可协议共享衍生作品'],
  ['CC BY-NC 4.0', '保留作者署名，仅限非商业用途'],
  ['CC BY-NC-SA 4.0', '保留作者署名，仅限非商业用途，以相同许可协议共享衍生作品'],
  ['CC BY-ND 4.0', '保留作者署名，仅可分发未改编的原始版本'],
  ['CC BY-NC-ND 4.0', '保留作者署名，仅限非商业用途，仅可分发未改编的原始版本'],
]

export type EvaluationFile = { path: string; file: File }
export type EvaluationSource = {
  mode: 'local' | 'link' | 'cli'
  files: EvaluationFile[]
  cliFiles: EvaluationFile[]
  linkKind: 'url' | 'github'
  url: string
  github: string
}
export type EvaluationUploadTask = {
  taskName: string
  authors: UploadAuthor[]
  name: string
  desc: string
  subjects: string[]
  tasks: string[]
  taskOther: string
  paradigms: string[]
  paradigmOther: string
  modalities: string[]
  modalityOther: string
  language: string
  languageOther: string
  amount: string
  unit: '题' | '任务'
  keywords: string[]
  relatedCorpora: { id: string; name: string }[]
  taskDescription: string
  inputExample: string
  expectedOutput: string
  metric: string
  sample: EvaluationSource
  complete: EvaluationSource
  attachments: EvaluationSource
  license: string
  permission: string
  authorized: boolean
  step: 1 | 2 | 3
}
export type EvaluationDraft = { id: string; account: string; savedAt: string; data: EvaluationUploadTask }
export type EvaluationUploadErrors = Record<string, string>
const emptySource = (): EvaluationSource => ({ mode: 'local', files: [], cliFiles: [], linkKind: 'url', url: '', github: '' })
export const emptyEvaluationTask = (): EvaluationUploadTask => ({
  taskName: '', authors: [emptyUploadAuthor()], name: '', desc: '', subjects: [], tasks: [], taskOther: '',
  paradigms: [], paradigmOther: '', modalities: [], modalityOther: '', language: '', languageOther: '',
  amount: '', unit: '题', keywords: [], relatedCorpora: [], taskDescription: '', inputExample: '',
  expectedOutput: '', metric: '', sample: emptySource(), complete: emptySource(), attachments: emptySource(),
  license: '', permission: '', authorized: false, step: 1,
})

export const normalizedName = (value: string) => value.normalize('NFKC').trim().toLowerCase()
const normalizedContact = (value: string) => value.includes('@') ? normalizedName(value) : value.replace(/[\s-]/g, '').replace(/^\+86(?=1\d{10}$)/, '')
export const validEvaluationContact = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || /^(?:1\d{10}|\+[1-9]\d{7,14})$/.test(normalizedContact(value))
export const evaluationLanguage = (task: EvaluationUploadTask) => task.language === '其他' ? task.languageOther.trim() : task.language
export const evaluationModalities = (task: EvaluationUploadTask) => task.modalities.map(value => value === '其他' ? task.modalityOther.trim() : value)
export const evaluationFiles = (source: EvaluationSource) => source.mode === 'cli' ? source.cliFiles : source.files
export const evaluationLink = (source: EvaluationSource) => (source.linkKind === 'github' ? source.github : source.url).trim()

type EvaluationSubmission = Record<string, unknown> & { id: string; name: string; status: string }
export function readEvaluationSubmissions(): EvaluationSubmission[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(EVALUATION_SUBMISSIONS_KEY) || '[]')
    return Array.isArray(records) ? records.filter((item): item is EvaluationSubmission => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string')) : []
  } catch { return [] }
}
export function duplicateEvaluationName(task: EvaluationUploadTask, account: string, id: string) {
  const name = normalizedName(task.name)
  if (!name) return false
  const contacts = task.authors.map(author => normalizedContact(author.contact)).filter(Boolean)
  return readEvaluationSubmissions().some(record => {
    if (record.id === id || normalizedName(record.name) !== name) return false
    if (!Array.isArray(record.authorContacts)) return record.account === account
    return record.authorContacts.some(contact => typeof contact === 'string' && contacts.includes(normalizedContact(contact)))
  })
}
export function validateEvaluationBasic(task: EvaluationUploadTask, account: string, id: string) {
  const errors: EvaluationUploadErrors = {}
  for (const [key, label] of [['taskName', '任务名称'], ['name', '评测集名称'], ['desc', '评测集简介']] as const) {
    if (!task[key].trim()) errors[key] = '请填写' + label
  }
  if (duplicateEvaluationName(task, account, id)) errors.name = '该评测集已存在'
  task.authors.forEach((author, index) => {
    if (!author.name.trim()) errors[`author-${index}-name`] = '请输入作者姓名'
    if (!author.contact.trim()) errors[`author-${index}-contact`] = '请输入邮箱或手机号'
    else if (!validEvaluationContact(author.contact)) errors[`author-${index}-contact`] = '请输入有效的邮箱或手机号'
    if (!author.organization.trim()) errors[`author-${index}-organization`] = '请输入所在单位或院系'
  })
  for (const [key, label] of [['subjects', '学科领域'], ['tasks', '任务类型'], ['paradigms', '评测范式'], ['modalities', '模态'], ['language', '语言']] as const) {
    if (!task[key].length) errors[key] = '请选择' + label
  }
  for (const [key, field, label] of [['tasks', 'taskOther', '任务类型'], ['paradigms', 'paradigmOther', '评测范式'], ['modalities', 'modalityOther', '模态'], ['language', 'languageOther', '语种']] as const) {
    if (task[key].includes('其他') && !task[field].trim()) errors[field] = '请填写具体' + label
  }
  if (!/^\d+$/.test(task.amount) || !Number.isSafeInteger(Number(task.amount)) || Number(task.amount) < 1) errors.amount = '请输入大于 0 的整数'
  if (!task.keywords.length) errors.keywords = '请添加关键词'
  return errors
}
export function validEvaluationLink(source: EvaluationSource) {
  try {
    const url = new URL(evaluationLink(source))
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false
    return source.linkKind === 'url' || (url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2)
  } catch { return false }
}
export function validateEvaluationData(task: EvaluationUploadTask) {
  const errors: EvaluationUploadErrors = {}
  for (const [key, label] of [['taskDescription', '任务说明'], ['inputExample', '输入示例'], ['expectedOutput', '预期输出'], ['metric', '评测指标']] as const) {
    if (!task[key].trim()) errors[key] = '请填写' + label
  }
  for (const [key, label] of [['sample', '评测集样例'], ['complete', '完整评测集']] as const) {
    const source = task[key]
    if (source.mode === 'link') {
      if (!validEvaluationLink(source)) errors[key] = source.linkKind === 'github' ? '请输入有效的 GitHub 仓库链接' : '请输入有效的远程 URL'
    } else if (!evaluationFiles(source).length) errors[key] = '请上传' + label
  }
  if (!EVALUATION_LICENSES.some(([license]) => license === task.license)) errors.license = '请选择许可协议'
  if (!EVALUATION_SHARING.some(({ value }) => value === task.permission)) errors.permission = '请选择共享范围'
  return errors
}

function openEvaluationStorage() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('science-evaluation-uploads', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('tasks', { keyPath: ['account', 'id'] }).createIndex('account', 'account')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function taskStorage<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const database = await openEvaluationStorage()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction('tasks', mode)
      const request = action(transaction.objectStore('tasks'))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onabort = () => reject(transaction.error || request.error)
    })
  } finally { database.close() }
}
export function readEvaluationTask(account: string, id: string) {
  return taskStorage<EvaluationDraft | undefined>('readonly', store => store.get([account, id]))
}
export async function readEvaluationDrafts(account: string) {
  const stored = await taskStorage<EvaluationDraft[]>('readonly', store => store.index('account').getAll(account))
  const submitted = new Set(readEvaluationSubmissions().filter(record => record.account === account).map(record => record.id))
  return stored.filter(record => !submitted.has(record.id)).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}
export async function saveEvaluationDraft(account: string, id: string, data: EvaluationUploadTask) {
  if (readEvaluationSubmissions().some(record => record.account === account && record.id === id)) throw new Error('Task already submitted')
  const record: EvaluationDraft = { account, id, savedAt: new Date().toISOString(), data }
  await taskStorage('readwrite', store => store.put(record))
  return record
}
export function deleteEvaluationDraft(account: string, id: string) {
  if (readEvaluationSubmissions().some(record => record.account === account && record.id === id)) throw new Error('Task already submitted')
  return taskStorage('readwrite', store => store.delete([account, id]))
}
export function legacyEvaluationDraft(account: string): EvaluationDraft | null {
  try {
    const raw = JSON.parse(localStorage.getItem(EVALUATION_DRAFT_KEY) || 'null')
    if (!raw || typeof raw.name !== 'string' || !raw.name.trim()) return null
    const data = emptyEvaluationTask()
    data.name = raw.name
    data.desc = raw.desc || raw.description || ''
    data.authors[0].organization = typeof raw.team === 'string' ? raw.team : ''
    for (const field of ['subjects', 'tasks', 'paradigms'] as const) if (Array.isArray(raw[field])) data[field] = raw[field].filter((value: unknown) => typeof value === 'string')
    data.keywords = typeof raw.keywords === 'string' ? [...new Set<string>(raw.keywords.split(/[,，;；]/).map((value: string) => value.trim()).filter(Boolean))].slice(0, 10) : []
    data.taskOther = typeof raw.taskOther === 'string' ? raw.taskOther : ''
    data.paradigmOther = typeof raw.paradigmOther === 'string' ? raw.paradigmOther : ''
    data.permission = EVALUATION_SHARING.some(({ value }) => value === raw.permission) ? raw.permission : ''
    return { account, id: 'legacy-evaluation-draft', savedAt: '1970-01-01T00:00:00.000Z', data }
  } catch { return null }
}
export function saveEvaluationSubmission(account: string, id: string, task: EvaluationUploadTask) {
  const timestamp = new Date()
  const record = {
    id, account, status: 'pending', origin: 'platform', icon: 'book', submittedAt: timestamp.toISOString(),
    year: timestamp.getFullYear(), updatedAt: timestamp.toISOString().slice(0, 10),
    taskName: task.taskName.trim(), name: task.name.trim(), desc: task.desc.trim(),
    authors: task.authors.map(author => author.name.trim()).join('、'),
    authorContacts: task.authors.map(author => author.contact.trim()),
    team: [...new Set(task.authors.map(author => author.organization.trim()))].join('、'),
    subjects: task.subjects, tasks: task.tasks, paradigms: task.paradigms,
    taskOthers: task.tasks.includes('其他') ? [task.taskOther.trim()] : [],
    paradigmOthers: task.paradigms.includes('其他') ? [task.paradigmOther.trim()] : [],
    modality: evaluationModalities(task).join('、'), language: evaluationLanguage(task), size: `${Number(task.amount)} ${task.unit}`,
    keywords: task.keywords, relatedCorpora: task.relatedCorpora, license: task.license, permission: task.permission,
    taskDescription: task.taskDescription.trim(), inputExample: task.inputExample.trim(), expectedOutput: task.expectedOutput.trim(), metric: task.metric.trim(),
    sample: task.sample.mode === 'link' ? '' : evaluationFiles(task.sample).map(({ path }) => path).join('、'),
    sampleUrl: task.sample.mode === 'link' ? evaluationLink(task.sample) : '',
    hasLocalSample: task.sample.mode !== 'link' && evaluationFiles(task.sample).length > 0,
    hasLocalDownload: task.permission === '公开' && task.complete.mode !== 'link' && evaluationFiles(task.complete).length > 0,
    downloadUrl: task.permission === '公开' && task.complete.mode === 'link' ? evaluationLink(task.complete) : '',
  }
  localStorage.setItem(EVALUATION_SUBMISSIONS_KEY, JSON.stringify([record, ...readEvaluationSubmissions().filter(item => item.id !== id || item.account !== account)]))
}

export function downloadEvaluationFile({ file }: EvaluationFile) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
