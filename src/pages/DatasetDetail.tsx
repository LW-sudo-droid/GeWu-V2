import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileJson,
  FileText,
  Folder,
  Info,
  MessageCircle,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trash2,
  Upload,
  UserPlus,
  Users,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useApp } from '../context/app-context'
import { readUserIdentity, useCommunity, useCurrentIdentity } from '../context/use-community'
import { avatarUrl, corpusAdministrator } from '../data/community-users'
import { readCorpusEdits } from '../data/corpus-edits'
import MemberManagementDialog from '../components/MemberManagementDialog'
import CorpusUploadDialog, { type CorpusUploadSubmission } from '../components/CorpusUploadDialog'
import CorpusJoinDialog from '../components/CorpusJoinDialog'
import { defaultCorpusMembers, readCorpusMembers, saveCorpusMembers, type CorpusMember, type MemberPermission } from '../data/corpus-members'
import { corpusAuditEvent, recordCorpusOperation, submitCorpusRequest } from '../data/corpus-audit'
import { corpusRecords, institutionLogo, recordCoverImage, recordDisplayMeta } from './CorpusSearch'
import './dataset-detail.css'

type DetailTab = 'intro' | 'download' | 'comments'
type CommentSort = 'time' | 'likes'
type DetailRole = 'admin' | 'uploader' | 'guest'
type CommentIdentity = { user: string; authorAccount?: string; avatar?: string }
type CommentReply = CommentIdentity & { id: number; date: string; text: string; replyingTo?: string; likes?: number; likedBy?: string[] }
type CorpusComment = CommentIdentity & { id: number; date: string; likes: number; liked: boolean; likedBy?: string[]; text: string }

const previewTree = [
  { name: 'metadata.json', file: 'metadata.json', path: '元数据 / metadata.json' },
  { name: 'sample.jsonl', file: 'sample.jsonl', path: '样例数据 / sample.jsonl' },
  { name: 'train.schema.json', file: 'schema.json', path: '训练规范 / train.schema.json' },
  { name: 'README.md', file: 'README.md', path: '说明文档 / README.md' },
]

const previewContent: Record<string, string> = {
  'metadata.json': `{
  "language": "zh-CN",
  "subject": "science",
  "license": "research-use",
  "version": "1.2.0",
  "fields": ["instruction", "context", "reasoning", "answer", "source"]
}`,
  'sample.jsonl': `{"id":"sample_0001","instruction":"分析该科学问题的关键变量","reasoning":"首先抽取研究对象、条件约束与可验证结论……","answer":"形成结构化推理链与结论。"}
{"id":"sample_0002","instruction":"给出可复现实验数据说明","reasoning":"依据数据来源、采样方式和质量控制步骤组织元数据……","answer":"输出标准化数据卡。"}`,
  'schema.json': `{
  "type": "object",
  "required": ["id", "instruction", "answer"],
  "properties": {
    "id": { "type": "string" },
    "reasoning": { "type": "string" },
    "source": { "type": "string" }
  }
}`,
  'README.md': `# 语料说明

本语料库按历史版本组织文件目录，提供公开样例、元数据、字段说明和数据质量记录。`,
}

const usageGuide = [
  {
    title: '1. 申请使用与协议签署',
    content: '用户申请使用，需要先阅读并签署用户协议。用户协议签约归档且可用 Token 充足后，您可通过 SDK，使用 APIKey 按照以下指南使用语料。',
  },
  { title: '2. Token 充值', content: '访问语料会消耗 Token。调用前，建议先确认可用 Token 是否充足；如 Token 不足，可进行充值。' },
  { title: '3. SDK 下载及安装', content: '本地调用前，需要安装 Python 环境和 corpusware SDK，并确保 Python 版本为 3.12 或更高版本。请将 corpusware_sdk-version.whl 替换为下载后的文件路径和文件名。', code: 'pip install corpusware_sdk-version.whl' },
  { title: '4. SDK 登录系统并鉴权', content: '调用 login 登录系统，并通过 YOUR_API_KEY 获取用户权益。具备相应权益后，即可加载语料件。', code: 'from corpusware_sdk import login\n\nlogin(token="YOUR_API_KEY")' },
  { title: '5. 加载语料件', content: '通过语料 ID 加载语料件。系统将根据语料 ID 校验您是否已完成该语料的协议签约。如未完成签约，加载将失败，无法继续。', code: 'cw = load_corpusware(id="语料ID")' },
  { title: '6. 获取语料件基础信息', content: '通过已加载的语料件获取语料基础信息。', code: 'print(cw.corpusware_id, cw.name, cw.abstract, cw.corpus_type)\nmetadata = cw.metadata\nmetadata_desc = cw.describe_metadata()\nschema = cw.get_schema()' },
  { title: '7. 获取语料示例数据', content: '获取该语料件的全部示例数据。获取语料数据时，系统会同步记录 Token 消耗。请确保可用 Token 充足，否则数据获取将失败。', code: 'examples = cw.get_examples()\n\nfor row in cw.iter_examples():\n    print(row)' },
  { title: '8. 获取语料数据记录', content: '根据语料件基础信息确定所需数据，并读取相应的数据记录。获取语料数据时，系统会同步记录 Token 消耗。请确保可用 Token 充足，否则数据获取将失败。', code: 'for record in cw.iter_records(limit=100):\n    print(record)\n\nrecords = cw.records(limit=100, offset=0)' },
  { title: '9. 获取语料数据引用文件', content: '从样本中自动获取引用文件路径，SDK 会根据 schema 和样本内容解析路径。获取语料数据时，系统会同步记录 Token 消耗。请确保可用 Token 充足，否则数据获取将失败。', code: 'for record in cw.iter_records(limit=100):\n    reference_path = cw.reference_path(record)\n    content = cw.get_reference_content(reference_path)' },
  { title: '10. 语料数据随机采样', content: '在探索阶段，可从语料件中随机抽取少量记录进行质量检查、字段熟悉和快速调试。正式批量读取前，建议先完成小样本验证。', code: 'samples = cw.sample_records(size=10, seed=42)\n\nfor sample in samples:\n    print(sample)' },
]

const buildDownloadExampleCode = (corpusId: string) => `from corpusware_sdk import load_corpusware, login

login(token="YOUR_API_KEY")

cw = load_corpusware(id="${corpusId}")

print(cw.name)
print(cw.abstract)
print(cw.get_schema())
print(cw.describe_metadata())

example_rows = cw.get_examples()
print(example_rows)

for row in cw.iter_records(limit=5):
    print(row)
    reference_path = cw.reference_path(row)
    if reference_path:
        content = cw.get_reference_content(reference_path)
        print(f"内容大小: {len(content)} bytes")
        text = content.decode("utf-8", errors="replace")
        print(text[:1000])`

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1))
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const part of parts) {
    out.set(part, pos)
    pos += part.length
  }
  return out
}

const zipU16 = (value: number) => new Uint8Array([value & 255, (value >>> 8) & 255])
const zipU32 = (value: number) => new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255])

/** 生成最小可解压的 ZIP（store 无压缩）供前端直接下载 */
function buildZip(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)

    const local = new Uint8Array(30 + name.length)
    local.set([80, 75, 3, 4], 0)
    local.set(zipU16(20), 4)
    local.set(zipU16(0), 6)
    local.set(zipU16(0), 8)
    local.set(zipU16(0), 10)
    local.set(zipU16(0), 12)
    local.set(zipU32(crc), 14)
    local.set(zipU32(data.length), 18)
    local.set(zipU32(data.length), 22)
    local.set(zipU16(name.length), 26)
    local.set(zipU16(0), 28)
    local.set(name, 30)
    const full = concatBytes([local, data])
    locals.push(full)

    const central = new Uint8Array(46 + name.length)
    central.set([80, 75, 1, 2], 0)
    central.set(zipU16(20), 4)
    central.set(zipU16(20), 6)
    central.set(zipU16(0), 8)
    central.set(zipU16(0), 10)
    central.set(zipU16(0), 12)
    central.set(zipU16(0), 14)
    central.set(zipU32(crc), 16)
    central.set(zipU32(data.length), 20)
    central.set(zipU32(data.length), 24)
    central.set(zipU16(name.length), 28)
    central.set(zipU16(0), 30)
    central.set(zipU16(0), 32)
    central.set(zipU16(0), 34)
    central.set(zipU16(0), 36)
    central.set(zipU32(0), 38)
    central.set(zipU32(offset), 42)
    central.set(name, 46)
    centrals.push(central)
    offset += full.length
  }

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0)
  const eocd = new Uint8Array(22)
  eocd.set([80, 75, 5, 6], 0)
  eocd.set(zipU16(0), 4)
  eocd.set(zipU16(0), 6)
  eocd.set(zipU16(files.length), 8)
  eocd.set(zipU16(files.length), 10)
  eocd.set(zipU32(centralSize), 12)
  eocd.set(zipU32(offset), 16)
  eocd.set(zipU16(0), 20)

  return new Blob([concatBytes([...locals, ...centrals, eocd]).buffer as ArrayBuffer], { type: 'application/zip' })
}

const commentsSeed: CorpusComment[] = [
  { id: 4, user: '王磊', date: '2026-08-20', likes: 9, liked: false, text: '这套语料在长上下文推理任务上表现稳定，但跨学科场景下的泛化效果还比较有限。我们在小范围评测后发现，部分指令的格式约定不够统一，建议在下一版本中补充字段口径说明与质量校验标注；同时希望能进一步细化推理链的难度分级，并在许可范围允许的前提下，开放更多难度分层的样例样本，方便不同水平的模型评测团队按需取用、评估不同量级的推理能力。整体而言质量值得肯定，字段覆盖与 README 说明基本一致，对于领域内多步推理与知识检索结合的评测场景具有较高的参考价值，后续会持续关注更新进度并反馈使用问题。' },
  { id: 1, user: '林知远', date: '2026-08-18', likes: 24, liked: false, text: '样例数据结构很清楚，适合快速接入模型评测流程，希望后续补充更多字段说明。' },
  { id: 2, user: '医学语料联合实验室', date: '2026-08-12', likes: 18, liked: false, text: '对科研问答和推理链训练很有帮助，下载目录划分也比较明确。' },
  { id: 3, user: '陈明', date: '2026-08-02', likes: 31, liked: false, text: '建议增加数据质量报告和版本间差异说明，方便长期引用。' },
]

const repliesSeed: Record<number, CommentReply[]> = {
  1: [
    { id: 101, user: '张伟', date: '2026-08-19', text: '感谢反馈，下一版会补充字段口径和质量校验说明。' },
    { id: 102, user: '李娜', date: '2026-08-20', text: '我们也在整理更适合评测任务的样例切分。' },
  ],
  2: [
    { id: 201, user: '语料管理员', date: '2026-08-13', text: '下载目录后续会按任务类型继续细分。' },
  ],
  3: [
    { id: 301, user: '王磊', date: '2026-08-03', text: '版本差异说明已经进入维护计划。' },
  ],
}

function detailOpennessLabel(openness: string) {
  if (openness === '开放共享') return '公开'
  if (openness === '不公开' || openness === '暂不开放') return '不公开'
  return '公开'
}

function languageForSubject(subject: string) {
  if (subject === '数学' || subject === '物理') return '中文/英文'
  if (subject === '化学' || subject === '生物') return '中文'
  return '中文/英文'
}

function formatForSubject(subject: string) {
  if (subject === '化学') return '反应SMARTS + 结构化文本'
  if (subject === '地理' || subject === '天文') return 'CSV、JSON、XML、API接口'
  return 'CSV / JSON / SQL'
}

function CommentBody({ text, expanded, onToggle }: { text: string; expanded: boolean; onToggle: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [clipAt, setClipAt] = useState<number | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const updateClip = () => {
      const paragraph = wrap.querySelector('p')
      if (!paragraph || !wrap.clientWidth) return
      const probe = paragraph.cloneNode(false) as HTMLParagraphElement
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', width: `${wrap.clientWidth}px`, height: 'auto', maxHeight: 'none', display: 'block', overflow: 'visible', WebkitLineClamp: 'unset' })
      wrap.appendChild(probe)
      const lineHeight = parseFloat(getComputedStyle(probe).lineHeight) || 24
      probe.textContent = text
      let limit: number | null = null
      if (probe.getBoundingClientRect().height > lineHeight * 3 + 1) {
        let low = 0; let high = text.length
        while (low < high) {
          const mid = Math.ceil((low + high) / 2)
          probe.textContent = `${text.slice(0, mid)}…展开全部`
          if (probe.getBoundingClientRect().height <= lineHeight * 3 + 1) low = mid
          else high = mid - 1
        }
        limit = low
      }
      probe.remove()
      setClipAt(limit)
    }
    updateClip()
    const observer = new ResizeObserver(updateClip)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [text])

  const collapsed = clipAt !== null && !expanded
  return (
    <div ref={wrapRef} className="comment-text-wrap">
      <p className={`comment-text${expanded ? ' is-expanded' : ''}`}>
        {collapsed ? `${text.slice(0, clipAt).trimEnd()}....` : text}
        {collapsed && (
          <button className="comment-more-inline" type="button" onClick={(event) => { event.stopPropagation(); onToggle() }}>展开全部</button>
        )}
      </p>
      {clipAt !== null && expanded && (
        <button className="comment-more" type="button" onClick={(event) => { event.stopPropagation(); onToggle() }}>收起</button>
      )}
    </div>
  )
}

/** 语料类型统一为 4 种取值：预训练 / 后训练 / RAG / 微调 */
function detailCorpusTypeLabel(corpusType: string) {
  if (corpusType.includes('后训练')) return '后训练'
  if (corpusType.includes('RAG') || corpusType.includes('检索')) return 'RAG'
  if (corpusType.includes('微调')) return '微调'
  return '预训练'
}

export default function DatasetDetail() {
  const { id } = useParams()
  return <DatasetDetailContent key={id} />
}

function DatasetDetailContent() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, openAuth, favorites, toggleFavorite } = useApp()
  const currentIdentity = useCurrentIdentity()
  const { isFollowing, followLabel, followerCount, toggleFollow } = useCommunity()
  const baseItem = corpusRecords.find((record) => record.id === id) ?? corpusRecords[0]
  const [savedEdit] = useState(() => readCorpusEdits(baseItem.id))
  const item = savedEdit ? { ...baseItem, title: savedEdit.corpusName, summary: savedEdit.introduction, keywords: savedEdit.keywords, subject: savedEdit.subjectPaths[0]?.split('/')[0] ?? baseItem.subject, corpusType: savedEdit.corpusType, openness: savedEdit.openness, organization: savedEdit.organization === '其他' ? savedEdit.customOrganization : savedEdit.organization, authors: (savedEdit.department === '其他' ? savedEdit.customDepartment : savedEdit.department) || savedEdit.authors[0]?.organization || baseItem.authors } : baseItem
  const displayMeta = { ...recordDisplayMeta(baseItem), ...(savedEdit ? { corpusSize: savedEdit.corpusSize, storageSize: savedEdit.storageSize } : {}) }
  const administrator = corpusAdministrator(item.id)
  const [members, setMembers] = useState<CorpusMember[]>(() => readCorpusMembers(item.id, defaultCorpusMembers(administrator)))
  const authorFollowed = isFollowing(administrator.id)
  // 前三个语料库依次演示：管理员 / 可上传成员 / 非语料库成员
  const firstThreeRoles: DetailRole[] = ['admin', 'uploader', 'guest']
  const roleIndex = corpusRecords.findIndex((record) => record.id === item.id)
  const currentMembership = user ? members.find((member) => member.account === user.account) : undefined
  const detailRole: DetailRole = currentMembership ? currentMembership.permission === '可管理' ? 'admin' : 'uploader' : roleIndex >= 0 && roleIndex < firstThreeRoles.length ? firstThreeRoles[roleIndex] : 'guest'
  const openness = detailOpennessLabel(item.openness)
  const favorite = favorites.some((record) => record.id === item.id)

  const [activeTab, setActiveTab] = useState<DetailTab>(() => searchParams.get('tab') === 'comments' ? 'comments' : 'intro')
  const [downloadMethod, setDownloadMethod] = useState<'cli' | 'sdk'>('sdk')
  const [metadataMenuOpen, setMetadataMenuOpen] = useState(false)
  const metadataMenuRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState('metadata.json')
  const [previewSidebarCollapsed, setPreviewSidebarCollapsed] = useState(false)
  const [fullscreenBrowser, setFullscreenBrowser] = useState<'intro' | 'download' | null>(null)
  const [memberOpen, setMemberOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [joinRequestOpen, setJoinRequestOpen] = useState(false)
  const [commentSort, setCommentSort] = useState<CommentSort>('time')
  const [commentDraft, setCommentDraft] = useState('')
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null)
  const [replyTargetUser, setReplyTargetUser] = useState('')
  const [replyTargetText, setReplyTargetText] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [storedDiscussion] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`gw-corpus-comments-${baseItem.id}`) ?? 'null')
      return stored && Array.isArray(stored.comments) && stored.replies && typeof stored.replies === 'object' ? stored as { comments: CorpusComment[]; replies: Record<number, CommentReply[]> } : null
    } catch { return null }
  })
  const [commentReplies, setCommentReplies] = useState(storedDiscussion?.replies ?? repliesSeed)
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState('')
  const [comments, setComments] = useState(storedDiscussion?.comments ?? commentsSeed)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const toastTimer = useRef<number | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const refreshMembers = () => setMembers(readCorpusMembers(item.id, defaultCorpusMembers(administrator)))
    window.addEventListener(corpusAuditEvent, refreshMembers)
    window.addEventListener('storage', refreshMembers)
    return () => { window.removeEventListener(corpusAuditEvent, refreshMembers); window.removeEventListener('storage', refreshMembers) }
  }, [item.id, administrator])

  useEffect(() => {
    try { localStorage.setItem(`gw-corpus-comments-${baseItem.id}`, JSON.stringify({ comments, replies: commentReplies })) } catch { /* Keep the discussion usable if browser storage is full. */ }
  }, [baseItem.id, comments, commentReplies])

  const resizeComposer = (input: HTMLTextAreaElement) => {
    input.style.height = '98px'
    input.style.height = `${Math.min(400, Math.max(98, input.scrollHeight))}px`
    input.style.overflowY = input.scrollHeight > 400 ? 'auto' : 'hidden'
  }

  useEffect(() => {
    if (activeReplyCommentId !== null) replyInputRef.current?.focus()
  }, [activeReplyCommentId, replyTargetUser, replyTargetText])

  const updatedAt = (() => {
    if (savedEdit) return savedEdit.updatedAt.slice(0, 10)
    const date = new Date(item.publishedAt)
    date.setDate(date.getDate() + 16)
    return date.toISOString().slice(0, 10)
  })()

  const relatedRecords = (() => {
    const sameSubject = corpusRecords.filter((record) => record.id !== item.id && record.subject === item.subject)
    const fallback = corpusRecords.filter((record) => record.id !== item.id && record.subject !== item.subject)
    return [...sameSubject, ...fallback].slice(0, 4)
  })()

  const sortedComments = useMemo(() => {
    const copied = [...comments]
    if (commentSort === 'likes') return copied.sort((a, b) => b.likes - a.likes)
    return copied.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  }, [commentSort, comments])

  useEffect(() => {
    if (!metadataMenuOpen) return
    const dismiss = (event: MouseEvent) => {
      if (!metadataMenuRef.current?.contains(event.target as Node)) setMetadataMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMetadataMenuOpen(false)
    }
    document.addEventListener('mousedown', dismiss)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', dismiss)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [metadataMenuOpen])

  useEffect(() => {
    if (!fullscreenBrowser) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreenBrowser(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [fullscreenBrowser])

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  const notify = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }

  const ensureVerified = (next: () => void) => {
    if (!user) {
      openAuth(`/search/datasets/${item.id}`)
      notify('请先登录后继续操作')
      return
    }
    next()
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('已复制链接 可以转发')
    } catch {
      notify('链接已准备好，请从地址栏复制')
    }
  }

  const downloadBlob = (filename: string, content: string, type = 'application/json;charset=utf-8') => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadSampleFile = (file = selectedFile) => {
    if (openness === '不公开') {
      notify('该语料库暂为非公开，如需要请联系作者')
      return
    }
    const scope = openness === '公开' ? '全部数据' : '作者公开的数据'
    downloadBlob(`${item.id}-${file}.json`, JSON.stringify({ corpus: item.title, scope, file, sample: previewContent[file] }, null, 2))
    notify('已开始下载当前样例数据')
  }

  const downloadAllSamples = () => {
    if (openness === '不公开') {
      notify('该语料库暂为非公开，如需要请联系作者')
      return
    }
    const scope = openness === '公开' ? '全部数据' : '作者公开的数据'
    downloadBlob(`${item.id}-latest-examples.json`, JSON.stringify({
      corpus: item.title,
      version: 'Version X',
      updatedAt,
      scope,
      files: previewTree.map((file) => ({
        name: file.name,
        path: file.path,
        sample: previewContent[file.file],
      })),
    }, null, 2))
    notify('已开始下载全部样例数据')
  }

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      notify(label)
    } catch {
      notify('复制失败，请手动选择代码')
    }
  }

  const copyDownloadCode = () => copyText(buildDownloadExampleCode(item.id), '示例代码已复制')

  const downloadZip = () => {
    if (openness === '不公开') {
      notify('该语料库暂为非公开，如需要请联系作者')
      return
    }
    const blob = buildZip([
      { name: 'README.md', content: `# ${item.title}\n\n${item.summary}\n\n版本：Version X · ${updatedAt}\n发布机构：${item.organization} - ${item.authors}` },
      { name: 'metadata.json', content: JSON.stringify({ corpus: item.title, id: item.id, subject: item.subject, corpusType: item.corpusType, openness, publishedAt: item.publishedAt, updatedAt }, null, 2) },
    ])
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${item.id}-latest.zip`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('已开始下载语料压缩包')
  }

  const exportMetadata = (metadataFormat: 'JSON' | 'CSV') => {
    setMetadataMenuOpen(false)
    const metadata = {
      语料集名称: item.title,
      URL: window.location.href,
      学科领域: item.subject,
      语料类型: item.corpusType,
      开放程度: openness,
      上传状态: displayMeta.status,
      作者: ['张伟', '李娜', '王磊'].join('、'),
      发布机构: `${item.organization} - ${item.authors}`,
      发布时间: item.publishedAt,
      更新时间: updatedAt,
      语料规模: displayMeta.corpusSize,
      存储容量: displayMeta.storageSize,
      其他: {
        浏览量: item.views,
        下载量: item.usage,
        收藏: item.favorites + (favorite ? 1 : 0),
      },
    }

    if (metadataFormat === 'CSV') {
      const escapeCsv = (value: unknown) => `"${String(typeof value === 'object' ? JSON.stringify(value) : value).replace(/"/g, '""')}"`
      const csv = Object.entries(metadata).map(([field, value]) => `${escapeCsv(field)},${escapeCsv(value)}`).join('\n')
      downloadBlob(`${item.id}-metadata.csv`, `字段,内容\n${csv}`, 'text/csv;charset=utf-8')
    } else {
      downloadBlob(`${item.id}-metadata.json`, JSON.stringify(metadata, null, 2))
    }
    notify('元数据已导出')
  }

  const confirmMembers = (nextMembers: CorpusMember[]) => {
    try {
      saveCorpusMembers(item.id, nextMembers)
      const added = nextMembers.filter((member) => !members.some((previous) => previous.account === member.account)).length
      const removed = members.filter((member) => !nextMembers.some((next) => next.account === member.account)).length
      const changed = nextMembers.filter((member) => members.some((previous) => previous.account === member.account && previous.permission !== member.permission)).length
      const content = [added && `新增 ${added} 名成员`, removed && `移除 ${removed} 名成员`, changed && `调整 ${changed} 名成员权限`].filter(Boolean).join('；')
      if (content) recordCorpusOperation(item.id, currentIdentity.username, '成员管理', content)
      setMembers(nextMembers)
      setMemberOpen(false)
      notify('成员设置已保存')
    } catch {
      notify('保存失败，请检查浏览器存储空间后重试')
    }
  }

  const submitUpload = (values: CorpusUploadSubmission) => {
    if (!user) { openAuth(`/search/datasets/${item.id}`); return false }
    try {
      submitCorpusRequest(item.id, { type: '数据上传', content: values.content, applicant: currentIdentity.username, applicantAccount: user.account, remark: values.remark, reason: values.remark, source: values.source, license: values.license, files: values.files })
    } catch { notify('提交失败，请稍后重试'); return false }
    return true
  }

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = commentDraft.trim()
    if (!value) {
      notify('请输入内容后提交评论')
      return
    }
    if (!user) { openAuth(`/search/datasets/${item.id}?tab=comments`); return }
    const identity = readUserIdentity(user)
    setComments((current) => [{ id: current.reduce((next, entry) => Math.max(next, entry.id + 1), Date.now()), user: identity.username, authorAccount: user.account, avatar: identity.avatar, date: new Date().toISOString(), likes: 0, liked: false, text: value }, ...current])
    setCommentDraft('')
    if (commentInputRef.current) commentInputRef.current.style.height = '98px'
    notify('评论已发布')
  }

  const toggleCommentExpanded = (id: number) => {
    setExpandedComments((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openReplyPanel = (commentId: number, targetUser: string, targetText: string) => {
    if (!user) { openAuth(`/search/datasets/${item.id}?tab=comments`); return }
    setReplyDraft('')
    setActiveReplyCommentId(commentId)
    setReplyTargetUser(targetUser)
    setReplyTargetText(targetText)
  }

  const submitReply = (commentId: number) => {
    if (!user) { openAuth(`/search/datasets/${item.id}?tab=comments`); return }
    const value = replyDraft.trim()
    if (!value) { notify('请输入内容后提交评论'); return }
    const identity = readUserIdentity(user)
    setCommentReplies((current) => ({
      ...current,
      [commentId]: [
        ...(current[commentId] ?? []),
        { id: (current[commentId] ?? []).reduce((next, entry) => Math.max(next, entry.id + 1), Date.now()), user: identity.username, authorAccount: user.account, avatar: identity.avatar, date: new Date().toISOString(), text: value, replyingTo: replyTargetUser, likes: 0, likedBy: [] },
      ],
    }))
    setReplyDraft('')
    setReplyTargetUser('')
    setReplyTargetText('')
    setActiveReplyCommentId(null)
    setExpandedReplies((current) => new Set(current).add(commentId))
    notify('回复已发布')
  }

  const submitJoinRequest = (permission: MemberPermission, remark: string) => {
    if (!user) { openAuth(`/search/datasets/${item.id}`); return false }
    try {
      submitCorpusRequest(item.id, { type: '加入申请', content: permission === '可管理' ? '管理权限' : '上传权限', applicant: currentIdentity.username, applicantAccount: user.account, permission, person: { account: user.account, name: currentIdentity.username, organization: '', avatar: currentIdentity.avatar }, reason: remark, remark })
    } catch { notify('提交失败，请稍后重试'); return false }
    return true
  }

  const goEditUpload = () => {
    ensureVerified(() => navigate(`/search/datasets/${item.id}/edit`))
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/search')
  }

  return (
    <div className="dataset-detail-page dataset-detail-v2 dataset-detail-design">
      <header className="detail-page-toolbar">
        <button className="detail-return" type="button" onClick={goBack}>
          <span className="detail-return-icon"><ArrowLeft size={18} /></span>
          <span><strong>返回</strong><small>{item.title}</small></span>
        </button>
        <div className="detail-management-actions">
          {detailRole === 'admin' && <>
            <button type="button" onClick={goEditUpload}><Pencil size={15} />编辑</button>
            <button type="button" onClick={() => ensureVerified(() => setMemberOpen(true))}><Users size={15} />管理成员</button>
            <button type="button" onClick={() => ensureVerified(() => navigate(`/search/datasets/${item.id}/audit`))}><FileText size={15} />审批</button>
          </>}
          {detailRole === 'uploader' && <button type="button" onClick={() => ensureVerified(() => setUploadOpen(true))}><Upload size={15} />上传</button>}
          {detailRole === 'guest' && <button type="button" onClick={() => ensureVerified(() => setJoinRequestOpen(true))}><UserPlus size={15} />申请加入语料库</button>}
          <div className="detail-metadata-menu" ref={metadataMenuRef}>
            <button className="is-primary" type="button" aria-haspopup="menu" aria-expanded={metadataMenuOpen} onClick={() => setMetadataMenuOpen((open) => !open)}>导出元数据<ChevronDown size={15} /></button>
            {metadataMenuOpen && <div className="detail-export-options" role="menu" aria-label="元数据导出格式">
              <button type="button" role="menuitem" onClick={() => exportMetadata('JSON')}><FileJson size={15} />导出 JSON</button>
              <button type="button" role="menuitem" onClick={() => exportMetadata('CSV')}><FileText size={15} />导出 CSV</button>
            </div>}
          </div>
        </div>
      </header>

      <section className="detail-overview" aria-label="语料基本信息">
          <img className="detail-cover" src={recordCoverImage(item.id)} alt={`${item.subject}语料封面`} />
          <div className="detail-overview-copy">
            <div className="detail-title-row">
              <h1>{item.title}</h1>
              <div className="detail-overview-actions">
                <button type="button" aria-pressed={favorite} className={favorite ? 'is-active' : ''} onClick={() => { toggleFavorite({ id: item.id, title: item.title }); notify(favorite ? '已取消收藏' : '已收藏，可在个人主页查看') }}><Star size={15} />{favorite ? '已收藏' : '收藏'}</button>
                <button type="button" onClick={copyShareLink}><Share2 size={15} />分享</button>
              </div>
            </div>
            <div className="detail-badges">
              <span>{item.subject}</span><span className="is-type">{detailCorpusTypeLabel(item.corpusType)}</span>
              <span className={openness === '不公开' ? 'is-private' : ''}>{openness}</span>
              <span className="is-status">{displayMeta.status}</span>
            </div>
            <div className="detail-attribution">
              <span><UserRound size={13} /><em>作者：</em>{savedEdit ? savedEdit.authors.map((author) => author.name).join('；') : '张伟；李娜；王磊'}</span>
              <span><Building2 size={13} /><em>发布机构：</em>{item.organization} - {item.authors}</span>
            </div>
            <div className="detail-facts-row">
              <dl className="detail-facts">
                <div><dt>发布时间：</dt><dd>{item.publishedAt}</dd></div>
                <div><dt>更新时间：</dt><dd>{updatedAt}</dd></div>
                <div><dt>语料规模：</dt><dd>{displayMeta.corpusSize}</dd></div>
                <div><dt>存储容量：</dt><dd>{displayMeta.storageSize}</dd></div>
              </dl>
              <div className="detail-stats" aria-label="语料使用统计">
                <span title="下载量"><Download size={14} />{item.usage.toLocaleString()}</span>
                <span title="浏览量"><Eye size={14} />{item.views.toLocaleString()}</span>
                <span title="收藏量"><Star size={14} />{(item.favorites + (favorite ? 1 : 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
      </section>

      <section className="detail-main-panel" aria-label="语料详情内容">
        <div className="detail-tabs" role="tablist" aria-label="语料详情">
          {([{ id: 'intro', label: '语料介绍' }, { id: 'download', label: '语料下载' }, { id: 'comments', label: `评论 ${comments.length}` }] as const).map((tab) => (
            <button key={tab.id} id={`detail-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`detail-panel-${tab.id}`} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)} onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const tabs: DetailTab[] = ['intro', 'download', 'comments']
              const index = tabs.indexOf(tab.id)
              const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : tabs[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]
              setActiveTab(next)
              document.getElementById(`detail-tab-${next}`)?.focus()
            }} tabIndex={activeTab === tab.id ? 0 : -1}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'intro' && (
          <div className="detail-tab-content" id="detail-panel-intro" role="tabpanel" aria-labelledby="detail-tab-intro">
            <section className="detail-abstract">
              <h2>摘要</h2>
              <p>{item.summary} 平台围绕数据来源、结构化处理、质量校验和版本管理沉淀元数据，支持科研、教学和模型训练场景复用。</p>
              <div className="detail-keywords">{item.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            </section>
            <section className={`detail-preview ${previewSidebarCollapsed ? 'is-sidebar-collapsed' : ''} ${fullscreenBrowser === 'intro' ? 'is-fullscreen' : ''}`} aria-label="语料预览">
              <header className="detail-preview-heading">
                <div><strong>语料预览</strong><small>Version X · {updatedAt} 更新</small></div>
                <div className="detail-preview-actions">
                  <button type="button" onClick={downloadAllSamples}><Download size={15} />下载全部数据</button>
                  <button type="button" className="detail-icon-button" aria-label={fullscreenBrowser === 'intro' ? '退出全屏预览' : '全屏预览'} onClick={() => setFullscreenBrowser((current) => current === 'intro' ? null : 'intro')}>{fullscreenBrowser === 'intro' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
                </div>
              </header>
              <div className="detail-preview-body">
                <nav className="detail-file-tree" aria-label="浏览最新样例数据">
                  {previewTree.map((node) => (
                    <button
                      className={selectedFile === node.file ? 'is-active' : ''}
                      key={node.file}
                      onClick={() => setSelectedFile(node.file)}
                      type="button"
                      aria-pressed={selectedFile === node.file}
                    >
                      <Folder size={16} /><span>{node.path}</span>
                    </button>
                  ))}
                </nav>
                <div className="detail-file-content">
                  <div className="detail-file-toolbar">
                    <button type="button" className="detail-icon-button" aria-label={previewSidebarCollapsed ? '展开文件目录' : '收起文件目录'} onClick={() => setPreviewSidebarCollapsed((collapsed) => !collapsed)}>{previewSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
                    <strong>{previewTree.find((file) => file.file === selectedFile)?.name}</strong>
                    <button type="button" className="detail-text-download" onClick={() => downloadSampleFile()}><Download size={13} />{selectedFile === 'metadata.json' ? '下载元数据' : '下载文件'}</button>
                  </div>
                  <pre><code>{previewContent[selectedFile]}</code></pre>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'download' && (
          <div className="detail-tab-content" id="detail-panel-download" role="tabpanel" aria-labelledby="detail-tab-download">
            {openness === '不公开' ? (
              <div className="private-dataset-note">该语料库暂为非公开，如需要请联系作者</div>
            ) : (
              <section className="detail-download-surface">
                  <header className="detail-zip-heading">
                    <h2>压缩包下载</h2>
                    <button className="detail-text-download" type="button" onClick={downloadZip}>
                      <Download size={14} />下载语料压缩包（{displayMeta.storageSize}）
                    </button>
                  </header>
                  <nav className="detail-download-tabs" aria-label="下载方式">
                    <button type="button" className={downloadMethod === 'cli' ? 'is-active' : ''} aria-pressed={downloadMethod === 'cli'} onClick={() => setDownloadMethod('cli')}>CLI 命令行</button>
                    <button type="button" className={downloadMethod === 'sdk' ? 'is-active' : ''} aria-pressed={downloadMethod === 'sdk'} onClick={() => setDownloadMethod('sdk')}>SDK</button>
                  </nav>
                  {downloadMethod === 'cli' && (
                  <article className="usage-guide-section" id="download-cli">
                    <h2>CLI 命令行下载</h2>
                    <p>在命令行中通过 CLI 工具下载完整数据集或单个文件，先通过如下命令安装。</p>
                    <h3>安装 CLI 工具</h3>
                    <div className="download-code-block">
                      <div className="download-code-head">
                        <button type="button" onClick={() => copyText('pip install corpusware-cli', '安装命令已复制')}><Copy size={15} />复制</button>
                      </div>
                      <pre><code>pip install corpusware-cli</code></pre>
                    </div>
                    <h3>下载完整数据集</h3>
                    <div className="download-code-block">
                      <div className="download-code-head">
                        <button type="button" onClick={() => copyText(`corpusware login\ncorpusware download --corpus ${item.id} --output ./corpus`, '下载命令已复制')}><Copy size={15} />复制</button>
                      </div>
                      <pre><code>{`corpusware login
corpusware download --corpus ${item.id} --output ./corpus`}</code></pre>
                    </div>
                    <h3>下载单个文件到指定本地文件夹（以下载 README.md 为例）</h3>
                    <div className="download-code-block">
                      <div className="download-code-head">
                        <button type="button" onClick={() => copyText(`corpusware download --corpus ${item.id} --file README.md --output ./corpus`, '下载命令已复制')}><Copy size={15} />复制</button>
                      </div>
                      <pre><code>{`corpusware download --corpus ${item.id} --file README.md --output ./corpus`}</code></pre>
                    </div>
                  </article>
                  )}
                  {downloadMethod === 'sdk' && (
                  <article className="usage-guide-section" id="download-sdk">
                    <h2>SDK 下载</h2>
                    <p>在 Python 环境中安装官方 SDK，按照以下步骤完成登录、鉴权并加载语料件。</p>
                    {usageGuide.slice(0, 7).map((section, index) => (
                      <article className="usage-guide-step" id={`usage-guide-${index + 1}`} key={section.title}>
                        <h3>{section.title}</h3>
                        <p>{section.content}</p>
                        {section.code && (
                          <div className="download-code-block">
                            <div className="download-code-head">
                              <button type="button" onClick={() => copyText(section.code as string, '命令已复制')}><Copy size={15} />复制</button>
                            </div>
                            <pre><code>{section.code}</code></pre>
                          </div>
                        )}
                      </article>
                    ))}
                    <details className="detail-sdk-more">
                    <summary>更多 SDK 用法与完整示例</summary>
                    {usageGuide.slice(7).map((section) => <article className="usage-guide-step" key={section.title}>
                      <h3>{section.title}</h3><p>{section.content}</p>
                      {section.code && <div className="download-code-block"><div className="download-code-head"><button type="button" onClick={() => copyText(section.code as string, '命令已复制')}><Copy size={15} />复制</button></div><pre><code>{section.code}</code></pre></div>}
                    </article>)}
                    <h3>完整的下载示例代码</h3>
                    <p>以下代码可直接复制使用，其中语料 ID 为当前语料库标识。</p>
                    <section className={`download-code-section ${fullscreenBrowser === 'download' ? 'is-fullscreen' : ''}`}>
                      <div className="preview-code-panel">
                        <div className="dataset-code-toolbar">
                          <div className="dataset-code-title">
                            <span>download_examples.py</span>
                          </div>
                          <div className="dataset-code-actions">
                            <button className="dataset-code-download" type="button" onClick={copyDownloadCode}><Copy size={18} />复制代码</button>
                            <button
                              type="button"
                              aria-label={fullscreenBrowser === 'download' ? '缩小预览' : '放大预览'}
                              onClick={() => setFullscreenBrowser((current) => current === 'download' ? null : 'download')}
                            >
                              {fullscreenBrowser === 'download' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                          </div>
                        </div>
                        <pre><code>{buildDownloadExampleCode(item.id)}</code></pre>
                      </div>
                    </section>
                    </details>
                  </article>
                  )}
              </section>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="detail-tab-content" id="detail-panel-comments" role="tabpanel" aria-labelledby="detail-tab-comments">
           <div className="detail-comments-surface">
            <div className="detail-comments-heading">
              <h2>评论 {comments.length}</h2>
              <label><span className="sr-only">评论排序</span>
                <select value={commentSort} onChange={(event) => setCommentSort(event.target.value as CommentSort)}>
                  <option value="time" label="按时间">按时间（由近到远）</option>
                  <option value="likes" label="按点赞量">点赞量（由高到低）</option>
                </select>
              </label>
            </div>
              <form className="detail-comment-composer" onSubmit={submitComment}>
                {currentIdentity.avatar ? <img className="detail-comment-avatar" src={avatarUrl(currentIdentity.avatar)} alt={`${currentIdentity.username}的头像`} /> : <span className="detail-comment-avatar" aria-hidden="true">{currentIdentity.username.slice(0, 1)}</span>}
                <textarea ref={commentInputRef} aria-label="评论内容" maxLength={1000} value={commentDraft} onChange={(event) => { setCommentDraft(event.target.value); resizeComposer(event.target) }} onFocus={(event) => resizeComposer(event.target)} onBlur={(event) => { event.target.style.height = '98px'; event.target.style.overflowY = 'auto' }} placeholder="请输入评论内容，最多1000字" />
                <button type="submit">发布评论</button>
              </form>
            <div className="comment-list">
              {sortedComments.map((comment) => {
                const ownComment = Boolean(user && comment.authorAccount === user.account)
                const commentLiked = Boolean(user && comment.likedBy?.includes(user.account))
                const commentName = ownComment ? currentIdentity.username : comment.user
                const commentAvatar = ownComment ? currentIdentity.avatar : comment.avatar ?? `images/demand-users/${comment.id % 3 === 0 ? 'community-cat' : comment.id % 2 === 0 ? 'computer-researcher' : 'lab-director'}.jpg`
                const replies = commentReplies[comment.id] ?? []
                const visibleReplies = replies.length > 2 && !expandedReplies.has(comment.id) ? [...replies].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || b.date.localeCompare(a.date)).slice(0, 1) : replies
                return (
                <article
                  className={`comment-card ${activeReplyCommentId === comment.id ? 'is-open' : ''}`}
                  key={comment.id}
                >
                  {commentAvatar ? <img className="detail-comment-avatar" src={avatarUrl(commentAvatar)} alt={`${commentName}的头像`} /> : <span className="detail-comment-avatar">{commentName.slice(0, 1)}</span>}
                  <div>
                    <header><strong>{commentName}</strong><span>{comment.date.replace('T', ' ').slice(0, 16)}</span></header>
                    <CommentBody
                      text={comment.text}
                      expanded={expandedComments.has(comment.id)}
                      onToggle={() => toggleCommentExpanded(comment.id)}
                    />
                    <div className="comment-card-actions">
                      <button
                        className={commentLiked ? 'is-active' : ''}
                        data-tooltip={commentLiked ? '取消点赞' : '点赞'}
                        aria-label={commentLiked ? `取消点赞 ${comment.likes}` : `点赞 ${comment.likes}`}
                        aria-pressed={commentLiked}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!user) { openAuth(`/search/datasets/${item.id}?tab=comments`); return }
                          setComments((current) => current.map((entry) => {
                            if (entry.id !== comment.id) return entry
                            const alreadyLiked = entry.likedBy?.includes(user.account)
                            return { ...entry, likes: Math.max(0, entry.likes + (alreadyLiked ? -1 : 1)), likedBy: alreadyLiked ? entry.likedBy?.filter((account) => account !== user.account) : [...(entry.likedBy ?? []), user.account] }
                          }))
                        }}
                      >
                        <ThumbsUp size={15} />{comment.likes}
                      </button>
                      <button
                        className="comment-reply-count-button"
                        type="button"
                        aria-label={`查看并回复 ${commentReplies[comment.id]?.length ?? 0} 条回复`}
                        onClick={(event) => {
                          event.stopPropagation()
                          openReplyPanel(comment.id, commentName, comment.text)
                        }}
                      >
                        <MessageCircle size={15} />回复
                      </button>
                    </div>
                    {replies.length > 0 && <div className="comment-reply-list">
                      {visibleReplies.map((reply) => {
                        const ownReply = Boolean(user && reply.authorAccount === user.account)
                        const replyName = ownReply ? currentIdentity.username : reply.user
                        const replyAvatar = ownReply ? currentIdentity.avatar : reply.avatar
                        const liked = Boolean(user && reply.likedBy?.includes(user.account))
                        return <article className="comment-reply-item" key={reply.id}>
                          {replyAvatar ? <img className="detail-comment-avatar" src={avatarUrl(replyAvatar)} alt={replyName} /> : <span>{replyName.slice(0, 1)}</span>}
                          <div>
                            <strong>{replyName}</strong><small>{reply.date.replace('T', ' ').slice(0, 16)}</small>
                            <p>{reply.replyingTo && <em>回复 {reply.replyingTo}：</em>}{reply.text}</p>
                            <div className="comment-reply-actions">
                              {ownReply ? <button type="button" aria-label="删除我的回复" onClick={() => {
                                setCommentReplies((current) => ({ ...current, [comment.id]: current[comment.id].filter((entry) => entry.id !== reply.id || entry.authorAccount !== user?.account) }))
                                notify('回复已删除')
                              }}><Trash2 size={14} />删除</button> : <button type="button" aria-pressed={liked} onClick={() => {
                                if (!user) { openAuth(`/search/datasets/${item.id}?tab=comments`); return }
                                setCommentReplies((current) => ({ ...current, [comment.id]: current[comment.id].map((entry) => entry.id !== reply.id ? entry : { ...entry, likes: Math.max(0, (entry.likes ?? 0) + (liked ? -1 : 1)), likedBy: liked ? entry.likedBy?.filter((account) => account !== user.account) : [...(entry.likedBy ?? []), user.account] }) }))
                              }}><ThumbsUp size={14} />{reply.likes ?? 0}</button>}
                              <button type="button" onClick={() => openReplyPanel(comment.id, replyName, reply.text)}><MessageCircle size={14} />回复</button>
                            </div>
                          </div>
                        </article>
                      })}
                      {replies.length > 2 && <button className="comment-more" type="button" onClick={() => setExpandedReplies((current) => { const next = new Set(current); if (next.has(comment.id)) next.delete(comment.id); else next.add(comment.id); return next })}>{expandedReplies.has(comment.id) ? '收起回复' : `展开 ${replies.length} 条回复`}</button>}
                    </div>}
                    {activeReplyCommentId === comment.id && (
                      <div className="comment-reply-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="comment-reply-target">
                          <strong>回复 @{replyTargetUser || comment.user}</strong>
                          <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{replyTargetText || comment.text}</p>
                        </div>
                        <textarea
                          ref={replyInputRef}
                          maxLength={1000}
                          value={replyDraft}
                          onChange={(event) => { setReplyDraft(event.target.value); resizeComposer(event.target) }}
                          onFocus={(event) => resizeComposer(event.target)}
                          onBlur={(event) => { event.target.style.height = '98px'; event.target.style.overflowY = 'auto' }}
                          aria-label={`回复 ${replyTargetUser || comment.user}`}
                          placeholder="请输入回复内容"
                        />
                        <div className="comment-reply-actions">
                          <small>{replyDraft.length}/1000</small>
                          <button type="button" onClick={() => { setActiveReplyCommentId(null); setReplyTargetUser(''); setReplyTargetText(''); setReplyDraft('') }}>取消</button>
                          <button type="button" className="is-primary" onClick={() => submitReply(comment.id)}>回复评论</button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )})}
            </div>
           </div>
          </div>
        )}
      </section>

      <aside className="detail-sidebar" aria-label="作者信息与相关语料库">
        <section className="detail-info-card">
          <div className="detail-author">
            <img src={avatarUrl(administrator.avatar)} alt={`${administrator.name}的头像`} />
            <div><h2>{administrator.name}</h2><p>{administrator.organization}</p>
              <div className="detail-author-stats"><span>{administrator.followingCount.toLocaleString()} 关注</span><span>{followerCount(administrator).toLocaleString()} 粉丝</span><span>{administrator.collections.toLocaleString()} 被收藏</span></div>
              <div className="detail-author-actions">
                <button className={authorFollowed ? 'is-followed' : ''} type="button" aria-pressed={authorFollowed} title={authorFollowed ? '取消关注' : undefined} data-tooltip={authorFollowed ? '取消关注' : undefined} onClick={() => ensureVerified(() => { toggleFollow(administrator.id); notify(authorFollowed ? '已取消关注' : '已关注，可在个人主页查看') })}>{authorFollowed ? <Check size={13} /> : <Plus size={13} />}{followLabel(administrator)}</button>
                <Link to={`/profile/${administrator.id}`}>查看主页</Link>
              </div>
            </div>
          </div>
          <section className="detail-info-section">
            <h2><ShieldCheck size={16} />权益信息</h2>
            <dl><div><dt>权益主体</dt><dd>{item.organization}</dd></div><div><dt>许可协议</dt><dd>{savedEdit?.license ?? 'CC BY 4.0'}</dd></div></dl>
          </section>
          <section className="detail-info-section">
            <h2><Info size={16} />其他信息</h2>
            <dl><div><dt>语种类别</dt><dd>{savedEdit?.language ?? languageForSubject(item.subject)}</dd></div><div><dt>语料格式</dt><dd>{savedEdit?.format ?? formatForSubject(item.subject)}</dd></div><div><dt>时间跨度</dt><dd>{savedEdit?.timeSpan ?? (item.subject === '数学' ? '2000年-至今' : '2020年-至今')}</dd></div></dl>
          </section>
        </section>
      <section className="detail-related">
        <h2>相关语料库</h2>
        <div className="detail-related-list">
          {relatedRecords.map((record) => (
            <Link className="detail-related-card" to={`/search/datasets/${record.id}`} key={record.id}>
              <div className="detail-related-org">{institutionLogo(record.organization) ? <img src={institutionLogo(record.organization)} alt="" /> : <Building2 size={15} />}<span title={`${record.organization} - ${record.authors}`}>{record.organization} - {record.authors}</span></div>
              <h3>{record.title}</h3>
              <p>{record.summary}</p>
              <div className="detail-related-tags"><span>{record.subject}</span><span>{detailCorpusTypeLabel(record.corpusType)}</span></div>
              <footer><time dateTime={record.publishedAt}>{record.publishedAt}</time><span><Download size={13} />{record.usage.toLocaleString()}</span><span><Eye size={13} />{record.views.toLocaleString()}</span><span><Star size={13} />{record.favorites.toLocaleString()}</span></footer>
            </Link>
          ))}
        </div>
      </section>
      </aside>

      {memberOpen && <MemberManagementDialog members={members} onCancel={() => setMemberOpen(false)} onConfirm={confirmMembers} />}

      {joinRequestOpen && <CorpusJoinDialog onCancel={() => setJoinRequestOpen(false)} onSubmit={submitJoinRequest} />}
      {uploadOpen && <CorpusUploadDialog corpusId={item.id} onCancel={() => setUploadOpen(false)} onSubmit={submitUpload} notify={notify} />}

      {toast && <div className="dataset-toast"><Check size={16} />{toast}</div>}
    </div>
  )
}
