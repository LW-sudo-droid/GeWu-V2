import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  MessageCircle,
  Search,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { loadPublishedPosts } from '../data/demand-posts'
import './demand-square-v2.css'

export type DemandStatus = '招募中' | '共建中' | '已完成'
type DemandTab = '综合排序' | '招募中' | '共建中' | '已完成'
type SearchTab = '需求' | '用户'

export type DemandPost = {
  id: string
  title: string
  field: string
  corpusName: string
  author: string
  organization: string
  bio: string
  status: DemandStatus
  tags: string[]
  content: string
  likes: number
  bookmarks: number
  comments: number
  template: 'blue' | 'mint' | 'violet'
  image?: 'finance' | 'industry'
  cover?: string
  contact: {
    name: string
    unit: string
    email: string
  }
}

type CommunityUser = {
  id: string
  name: string
  role: string
  organization: string
  avatar: string
  keywords?: string[]
  following: number
  fans: number
  collections: number
  mutual?: boolean
}

export const initialDemandPosts: DemandPost[] = [
  {
    id: 'demand-chem-001',
    title: '有没有伙伴一起建设一个医学影像语料',
    field: '格物 · 语料共建',
    corpusName: '多模态医学影像—报告配对语料',
    author: '北',
    organization: '北京大学医学部',
    bio: '关注医学影像、临床报告结构化与多模态语料建设。',
    status: '招募中',
    tags: ['文字需求', '医学影像', '多模态', '深势科技'],
    content: '希望寻找医学影像与临床报告配对数据伙伴，共同沉淀可用于模型训练、报告生成和辅助诊断评测的语料。',
    likes: 236,
    bookmarks: 84,
    comments: 31,
    template: 'blue',
    cover: 'images/demand-market/public-domain/brain-mri.jpg',
    contact: { name: '医学语料联合实验室', unit: '北京大学医学部', email: 'medical-corpus@pku.edu.cn' },
  },
  {
    id: 'demand-math-001',
    title: '中国上市公司公告事件语料',
    field: '格物 · 语料共建',
    corpusName: '上市公司公告事件语料',
    author: '复',
    organization: '复旦大学',
    bio: '研究金融文本、事件抽取与行业知识图谱。',
    status: '共建中',
    tags: ['文字需求', '金融文本', '深势科技'],
    content: '围绕上市公司公告中的并购、处罚、业绩预告等事件，构建可检索、可抽取、可追踪的结构化语料。',
    likes: 184,
    bookmarks: 57,
    comments: 26,
    template: 'violet',
    image: 'finance',
    cover: 'images/demand-market/public-domain/stock-exchange.jpg',
    contact: { name: '复旦大学金融文本团队', unit: '复旦大学', email: 'finance-corpus@fudan.edu.cn' },
  },
  {
    id: 'demand-geo-001',
    title: '寻找方言伙伴共建语音与转写语料',
    field: '格物 · 语料共建',
    corpusName: '长三角方言语音与转写语料',
    author: '南',
    organization: '南京大学',
    bio: '关注语音语言学、方言保护与语音模型训练。',
    status: '招募中',
    tags: ['文字需求', '语音转写', '深势科技'],
    content: '面向长三角方言采集、音频切分、文本转写与说话人信息标注，邀请高校和地方团队共同参与。',
    likes: 161,
    bookmarks: 42,
    comments: 18,
    template: 'mint',
    cover: 'images/demand-market/public-domain/microphone.jpg?v=2',
    contact: { name: '南京大学语言语音团队', unit: '南京大学', email: 'dialect@nju.edu.cn' },
  },
  {
    id: 'demand-bio-001',
    title: '工业设备故障知识图谱语料',
    field: '格物 · 语料共建',
    corpusName: '工业设备故障知识图谱语料',
    author: '交',
    organization: '上海交通大学',
    bio: '建设工业设备运维、故障识别与知识推理语料。',
    status: '共建中',
    tags: ['图像语料', '故障识别'],
    content: '汇聚设备图像、检修记录、传感器波形和故障原因文本，建设面向工业场景的知识图谱与多模态训练语料。',
    likes: 149,
    bookmarks: 39,
    comments: 21,
    template: 'blue',
    image: 'industry',
    cover: 'images/demand-market/public-domain/nist-robot.jpg',
    contact: { name: '上海交通大学工业智能团队', unit: '上海交通大学', email: 'industry-ai@sjtu.edu.cn' },
  },
  {
    id: 'demand-bio-002',
    title: '征集珍稀植物四季生长图像语料',
    field: '格物 · 语料共建',
    corpusName: '珍稀植物多季相图像语料',
    author: '中',
    organization: '中国科学院',
    bio: '关注生物多样性监测、植物识别与生态语料共建。',
    status: '已完成',
    tags: ['文字需求', '植物图像'],
    content: '面向珍稀植物四季生长过程，征集连续观测图像、物候记录和环境信息，用于植物识别与生态变化分析。',
    likes: 132,
    bookmarks: 35,
    comments: 16,
    template: 'mint',
    cover: 'images/demand-market/public-domain/rare-plant.jpg',
    contact: { name: '中国科学院生态团队', unit: '中国科学院', email: 'plant-corpus@cas.cn' },
  },
  {
    id: 'demand-medical-002',
    title: '共建脑影像病灶分割与报告语料',
    field: '格物 · 医学语料',
    corpusName: '脑影像病灶分割与诊断报告配对语料',
    author: '华',
    organization: '华中科技大学同济医学院',
    bio: '关注脑影像智能分析、病灶分割与临床多模态学习。',
    status: '招募中',
    tags: ['医学影像', '病灶分割', '临床报告'],
    content: '征集经过脱敏的脑部影像、病灶区域标注和结构化诊断报告，建设面向病灶识别与报告生成的多模态语料。',
    likes: 128,
    bookmarks: 41,
    comments: 22,
    template: 'blue',
    cover: 'images/demand-market/public-domain/brain-mri.jpg',
    contact: { name: '华中科技大学医学影像团队', unit: '华中科技大学', email: 'brain-corpus@hust.edu.cn' },
  },
  {
    id: 'demand-finance-002',
    title: '招募伙伴标注债券违约事件链',
    field: '格物 · 金融语料',
    corpusName: '债券违约事件与风险传导语料',
    author: '上',
    organization: '上海财经大学',
    bio: '研究金融风险、事件链抽取与财经大模型评测。',
    status: '共建中',
    tags: ['金融事件', '风险传播'],
    content: '围绕债券发行、评级调整、违约处置和风险传导构建事件链标注语料，邀请金融与自然语言处理团队参与。',
    likes: 119,
    bookmarks: 38,
    comments: 19,
    template: 'violet',
    cover: 'images/demand-market/public-domain/market-crash.jpg',
    contact: { name: '上海财经大学金融语料团队', unit: '上海财经大学', email: 'bond-corpus@sufe.edu.cn' },
  },
  {
    id: 'demand-dialect-002',
    title: '西南地区少数民族语言语音征集',
    field: '格物 · 语言语料',
    corpusName: '西南少数民族语言语音与转写语料',
    author: '云',
    organization: '云南大学',
    bio: '关注民族语言保护、语音识别与跨语言建模。',
    status: '招募中',
    tags: ['民族语言', '语音转写'],
    content: '征集多地区、多年龄说话人的自然语音，并开展音素、词句和语义层级转写，支持民族语言保护与模型训练。',
    likes: 112,
    bookmarks: 46,
    comments: 25,
    template: 'mint',
    cover: 'images/demand-market/public-domain/waveform.jpg',
    contact: { name: '云南大学民族语言团队', unit: '云南大学', email: 'language-corpus@ynu.edu.cn' },
  },
  {
    id: 'demand-industry-002',
    title: '高端装备预测性维护数据共建',
    field: '格物 · 工业语料',
    corpusName: '高端装备故障时序与维修记录语料',
    author: '哈',
    organization: '哈尔滨工业大学',
    bio: '聚焦装备健康管理、故障预测与工业智能。',
    status: '共建中',
    tags: ['传感器时序', '预测维护'],
    content: '汇聚振动、温度、电流等传感器时序及维修记录，建立可追溯的故障类型、部件和处置方案关联语料。',
    likes: 105,
    bookmarks: 33,
    comments: 17,
    template: 'blue',
    cover: 'images/demand-market/public-domain/nist-robot.jpg',
    contact: { name: '哈尔滨工业大学智能制造团队', unit: '哈尔滨工业大学', email: 'maintenance@hit.edu.cn' },
  },
  {
    id: 'demand-plant-003',
    title: '高山植物物候连续观测图像征集',
    field: '格物 · 生态语料',
    corpusName: '高山植物物候与环境观测语料',
    author: '兰',
    organization: '兰州大学',
    bio: '关注高山生态、植物物候与气候变化响应。',
    status: '招募中',
    tags: ['植物物候', '生态图像'],
    content: '征集高山植物萌芽、开花、结实和休眠过程的连续图像及气象信息，支撑物候识别和生态变化研究。',
    likes: 101,
    bookmarks: 37,
    comments: 14,
    template: 'mint',
    cover: 'images/demand-market/public-domain/alpine-plants.jpg',
    contact: { name: '兰州大学高山生态团队', unit: '兰州大学', email: 'alpine-plant@lzu.edu.cn' },
  },
  {
    id: 'demand-medical-003',
    title: '胸部影像随访变化描述语料合作',
    field: '格物 · 医学语料',
    corpusName: '胸部影像纵向随访与变化描述语料',
    author: '浙',
    organization: '浙江大学医学院',
    bio: '研究医学影像随访、变化检测与临床报告生成。',
    status: '已完成',
    tags: ['医学影像', '随访报告'],
    content: '建设同一患者多时间点影像与变化描述配对语料，形成面向纵向比较和辅助报告生成的高质量样本。',
    likes: 96,
    bookmarks: 31,
    comments: 12,
    template: 'violet',
    cover: 'images/demand-market/public-domain/chest-xray.jpg',
    contact: { name: '浙江大学医学影像团队', unit: '浙江大学', email: 'followup-imaging@zju.edu.cn' },
  },
  {
    id: 'demand-finance-003',
    title: '财经政策影响关系抽取语料共建',
    field: '格物 · 金融语料',
    corpusName: '财经政策—行业影响关系语料',
    author: '央',
    organization: '中央财经大学',
    bio: '关注财经政策理解、行业影响分析与知识图谱。',
    status: '招募中',
    tags: ['政策文本', '关系抽取'],
    content: '面向公开财经政策文本标注政策对象、作用机制、影响行业和时间范围，服务政策理解与行业研究。',
    likes: 92,
    bookmarks: 29,
    comments: 13,
    template: 'violet',
    cover: 'images/demand-market/public-domain/stock-exchange.jpg',
    contact: { name: '中央财经大学政策语料团队', unit: '中央财经大学', email: 'policy-corpus@cufe.edu.cn' },
  },
  {
    id: 'demand-dialect-003',
    title: '城市多口音普通话对话语料招募',
    field: '格物 · 语言语料',
    corpusName: '城市多口音普通话自然对话语料',
    author: '北',
    organization: '北京语言大学',
    bio: '研究口音适配、自然对话与语音识别。',
    status: '共建中',
    tags: ['口音语音', '自然对话'],
    content: '采集不同地区说话人的自然任务对话，完成说话人、口音、情绪和语义意图标注，提升语音模型适配能力。',
    likes: 88,
    bookmarks: 34,
    comments: 15,
    template: 'mint',
    cover: 'images/demand-market/public-domain/microphone.jpg?v=2',
    contact: { name: '北京语言大学语音团队', unit: '北京语言大学', email: 'accent-speech@blcu.edu.cn' },
  },
  {
    id: 'demand-industry-003',
    title: '工业机器人异常动作视频语料征集',
    field: '格物 · 工业语料',
    corpusName: '工业机器人异常动作与故障视频语料',
    author: '华',
    organization: '华南理工大学',
    bio: '关注工业视觉、机器人安全与异常检测。',
    status: '招募中',
    tags: ['工业视频', '异常检测'],
    content: '征集机器人碰撞、偏移、夹持失败等异常动作视频及故障日志，构建工业现场视觉异常检测语料。',
    likes: 84,
    bookmarks: 28,
    comments: 11,
    template: 'blue',
    cover: 'images/demand-market/public-domain/bend-press-robot.jpg',
    contact: { name: '华南理工大学工业视觉团队', unit: '华南理工大学', email: 'robot-video@scut.edu.cn' },
  },
  {
    id: 'demand-plant-004',
    title: '城市树木病虫害图像与诊断语料',
    field: '格物 · 生态语料',
    corpusName: '城市树木病虫害图像诊断语料',
    author: '林',
    organization: '北京林业大学',
    bio: '研究森林保护、植物病理与生态智能监测。',
    status: '共建中',
    tags: ['植物图像', '病虫害'],
    content: '收集城市树木叶片、枝干和冠层病虫害图像，配套物种、病因、严重程度及治理建议标注。',
    likes: 79,
    bookmarks: 26,
    comments: 10,
    template: 'mint',
    cover: 'images/demand-market/public-domain/apple-scab.jpg',
    contact: { name: '北京林业大学植物保护团队', unit: '北京林业大学', email: 'tree-health@bjfu.edu.cn' },
  },
]

const communityUsers: CommunityUser[] = [
  {
    id: 'user-medical-lab',
    name: '医学语料联合实验室',
    role: '生物医学语料团队',
    organization: '北京大学健康医疗大数据国家研究院',
    avatar: 'images/demand-users/lab-director.jpg',
    keywords: ['深势科技', '医学语料', '实验室'],
    following: 9335,
    fans: 1141,
    collections: 1284,
    mutual: true,
  },
  {
    id: 'user-zheng-yixuan',
    name: '郑以轩',
    role: '语言资源研究者',
    organization: '北京大学中国语言学研究中心',
    avatar: 'images/demand-users/language-researcher.jpg',
    keywords: ['深势科技', '语言语料', '语音研究'],
    following: 93,
    fans: 84,
    collections: 77,
  },
  {
    id: 'user-zhao-junying',
    name: '赵俊英',
    role: '人工智能研究者',
    organization: '北京大学计算机学院',
    avatar: 'images/demand-users/computer-researcher.jpg',
    keywords: ['深势科技', '人工智能', '多模态'],
    following: 70,
    fans: 57,
    collections: 30,
  },
  {
    id: 'user-zhao-hui',
    name: '赵慧',
    role: '语料社区共建者',
    organization: '格物语料共建社区',
    avatar: 'images/demand-users/community-cat.jpg',
    keywords: ['深势科技', '社区共建', '语料标注'],
    following: 21,
    fans: 20,
    collections: 1,
  },
]

const demandTabs: DemandTab[] = ['综合排序', '招募中', '共建中', '已完成']
const DEMAND_PAGE_COUNT = 12
const DEMAND_PAGE_SIZE = 15
const DEMAND_PAGE_WINDOW = 5

const institutionLogos: Record<string, string> = {
  北京大学医学部: 'images/partners/pku.svg',
  复旦大学: 'images/partners/fudan.png',
  南京大学: 'images/partners/nanjing.webp',
  上海交通大学: 'images/partners/sjtu.jpg',
  中国科学院: 'images/institutions/cas.png',
  华中科技大学同济医学院: 'images/institutions/hust.ico',
  上海财经大学: 'images/institutions/sufe.ico',
  云南大学: 'images/institutions/ynu-mark.png',
  哈尔滨工业大学: 'images/institutions/hit.ico',
  兰州大学: 'images/institutions/lzu.svg',
  浙江大学医学院: 'images/institutions/zju.ico',
  北京语言大学: 'images/institutions/blcu.ico',
  中央财经大学: 'images/institutions/cufe.png',
  华南理工大学: 'images/institutions/scut.ico',
  北京林业大学: 'images/institutions/bjfu.ico',
}

const demandAuthorAvatars: Record<string, string> = {
  北京大学医学部: 'images/demand-users/lab-director.jpg',
  复旦大学: 'images/demand-users/computer-researcher.jpg',
  南京大学: 'images/demand-users/language-researcher.jpg',
  上海交通大学: 'images/demand-users/computer-researcher.jpg',
}

const demandDetailTagGroups: Record<string, string[]> = {
  医学: ['文字需求', '医学影像', '多模态', '临床报告', '影像标注', '报告生成', '辅助诊断', '脱敏数据', '病灶分割', 'DICOM', '医学术语', '质量评估', '纵向随访', '科研合作'],
  金融: ['文字需求', '金融文本', '事件抽取', '关系抽取', '风险传播', '知识图谱', '政策文本', '公告解析', '时序数据', '质量评估', '模型评测'],
  语言: ['文字需求', '语音转写', '方言语音', '自然对话', '说话人标注', '口音识别', '情绪标注', '语义意图', '民族语言', '语音识别', '质量评估'],
  工业: ['图像语料', '工业视频', '故障识别', '异常检测', '传感器时序', '维修记录', '知识图谱', '预测维护', '数据标注', '质量评估'],
  生态: ['植物图像', '生态图像', '植物物候', '物种识别', '环境观测', '病虫害', '连续观测', '图像标注', '气候变化', '质量评估'],
}

function getDemandDetailTags(post: DemandPost) {
  const group = Object.entries(demandDetailTagGroups).find(([keyword]) => (
    post.field.includes(keyword)
    || post.corpusName.includes(keyword)
    || post.title.includes(keyword)
  ))?.[1] ?? ['文字需求', '多模态', '语料共建', '数据标注', '质量评估', '模型训练', '科研合作']
  return Array.from(new Set([...post.tags, ...group]))
}

function getDemandDetailDescription(post: DemandPost) {
  return `${post.content} 项目将同步沉淀统一的数据规范、脱敏流程、标注准则与质量评估说明，方便参与团队协作建设，并支持后续科研分析、模型训练和可信评测。`
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}

function matchesDemand(demand: DemandPost, keyword: string) {
  const normalized = keyword.trim().toLocaleLowerCase('zh-CN')
  if (!normalized) return true
  return [demand.title, demand.field, demand.corpusName, demand.content, demand.author, ...demand.tags]
    .some((value) => value.toLocaleLowerCase('zh-CN').includes(normalized))
}

export function DemandPoster({ demand, compact = false }: { demand: DemandPost; compact?: boolean }) {
  const coverSrc = demand.cover ? `${import.meta.env.BASE_URL}${demand.cover}` : ''

  return (
    <div className={`demand-poster demand-poster-${demand.template}${demand.image ? ` demand-poster-image demand-poster-image-${demand.image}` : ''}${demand.cover ? ' has-cover' : ''}${compact ? ' is-compact' : ''}`}>
      <span className="poster-status">{demand.status}</span>
      {demand.cover ? (
        <img className="demand-poster-cover" src={coverSrc} alt="" />
      ) : (
        <>
          <span className="poster-orbit orbit-a" />
          <span className="poster-orbit orbit-b" />
          <span className="poster-dot dot-a" />
          <span className="poster-dot dot-b" />
          <strong>{demand.title}</strong>
          <p>{demand.field}</p>
          <div>
            <span>{demand.tags[0] ?? '文字需求'}</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </div>
        </>
      )}
    </div>
  )
}

export default function DemandSquare() {
  const navigate = useNavigate()
  const [posts] = useState<DemandPost[]>(() => [...loadPublishedPosts(), ...initialDemandPosts])
  const [activeTab, setActiveTab] = useState<DemandTab>('综合排序')
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [isSearchPage, setIsSearchPage] = useState(false)
  const [searchTab, setSearchTab] = useState<SearchTab>('需求')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<DemandPost | null>(null)
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set())
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['user-medical-lab', 'user-zhao-hui']))
  const [showContact, setShowContact] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [toast, setToast] = useState('')
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedPost) return undefined
    setShowContact(false)
    setTagsExpanded(false)
    setDescriptionExpanded(false)
    setIsComposing(false)
    setReplyTo(null)
    setCommentText('')
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPost(null)
        setShowContact(false)
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedPost])

  const visiblePosts = useMemo(() => {
    const filteredByStatus = activeTab === '综合排序'
      ? [...posts].sort((a, b) => (b.likes + b.bookmarks) - (a.likes + a.bookmarks))
      : posts.filter((post) => post.status === activeTab)
    return filteredByStatus.filter((post) => matchesDemand(post, keyword))
  }, [activeTab, keyword, posts])

  const pagePosts = useMemo(() => {
    if (visiblePosts.length === 0) return []
    if (isSearchPage) return visiblePosts.slice(0, DEMAND_PAGE_SIZE)
    const offset = (currentPage - 1) * 3
    return Array.from(
      { length: DEMAND_PAGE_SIZE },
      (_, index) => visiblePosts[(offset + index) % visiblePosts.length],
    )
  }, [currentPage, isSearchPage, visiblePosts])

  const paginationPages = useMemo(() => {
    let startPage = Math.max(1, currentPage - Math.floor(DEMAND_PAGE_WINDOW / 2))
    const endPage = Math.min(DEMAND_PAGE_COUNT, startPage + DEMAND_PAGE_WINDOW - 1)
    startPage = Math.max(1, endPage - DEMAND_PAGE_WINDOW + 1)
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
  }, [currentPage])

  const matchedUsers = useMemo(() => {
    const normalized = keyword.trim().toLocaleLowerCase('zh-CN')
    if (!normalized) return communityUsers
    return communityUsers.filter((user) => [user.name, user.role, user.organization, ...(user.keywords ?? [])]
      .some((value) => value.toLocaleLowerCase('zh-CN').includes(normalized)))
  }, [keyword])

  const detailTags = useMemo(() => selectedPost ? getDemandDetailTags(selectedPost) : [], [selectedPost])
  const detailDescription = useMemo(() => selectedPost ? getDemandDetailDescription(selectedPost) : '', [selectedPost])

  const flashToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setKeyword(searchInput.trim())
    setSearchTab('需求')
    setIsSearchPage(Boolean(searchInput.trim()))
    setCurrentPage(1)
  }

  const changePage = (page: number) => {
    setCurrentPage(Math.min(DEMAND_PAGE_COUNT, Math.max(1, page)))
    window.requestAnimationFrame(() => {
      document.querySelector('.demand-board-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const toggleId = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) => {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="demand-square-page">
      <section className="demand-square-hero">
        <img
          className="demand-square-hero-bg"
          src={`${import.meta.env.BASE_URL}images/demand-market/hero-bg.png`}
          alt=""
        />
        <div className="demand-square-hero-copy">
          <span>语料需求 · 共建协作</span>
          <h1>让每一个语料需求 <b>被看见&nbsp; 被响应</b></h1>
          <p>发布语料建设需求，寻找同行伙伴，让数据资源与真实科研问题高效连接。</p>
          <form className="demand-search" role="search" onSubmit={submitSearch}>
            <div className="demand-search-field">
              <Search size={18} />
              <input
                aria-label="搜索需求"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="搜索需求 / 用户"
                value={searchInput}
              />
              {searchInput && <button type="button" aria-label="清空搜索" onClick={() => { setSearchInput(''); setKeyword(''); setSearchTab('需求'); setIsSearchPage(false); setCurrentPage(1) }}><X size={17} /></button>}
            </div>
            <button type="submit">搜索</button>
          </form>
        </div>
      </section>

      <section className={`demand-board-section${isSearchPage ? ' is-search-results' : ''}`}>
        {isSearchPage && keyword && (
          <div className="demand-search-tabs" aria-label="搜索结果类型">
            {(['需求', '用户'] as SearchTab[]).map((tab) => (
              <button className={searchTab === tab ? 'is-active' : ''} key={tab} onClick={() => setSearchTab(tab)} type="button">
                {tab} {tab === '需求' ? visiblePosts.length : matchedUsers.length}
              </button>
            ))}
          </div>
        )}

        {searchTab === '需求' ? (
          <>
            <header className="demand-board-heading">
              <div>
                <h2>{isSearchPage ? '相关需求' : '热门建设需求'}</h2>
                <p>{isSearchPage ? `与“${keyword}”相关的共建线索` : '按互动热度展示社区最受关注的需求'}</p>
              </div>
              <div>
                <button className="demand-primary-action" type="button" onClick={() => navigate('/demands/new')}>
                  + 发布需求
                </button>
              </div>
            </header>
            <div className="demand-board-toolbar">
              <div className="demand-status-tabs">
                {demandTabs.map((tab) => (
                  <button className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1) }} type="button">
                    {tab === '综合排序' ? '全部' : tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="demand-card-grid">
            {pagePosts.map((post, index) => (
              <article className="demand-post-card" key={`${post.id}-${currentPage}-${index}`}>
                <button className="demand-card-main" type="button" onClick={() => setSelectedPost(post)} aria-label={`查看${post.title}详情`}>
                  <DemandPoster demand={post} />
                  <div className="demand-post-body">
                    <h2>{post.corpusName}</h2>
                    <footer className="demand-card-institution">
                      <span className={`demand-institution-logo${['中央财经大学', '兰州大学'].includes(post.organization) ? ' is-wide' : ''}${post.organization === '兰州大学' ? ' is-inverted' : ''}`}>
                        {institutionLogos[post.organization]
                          ? <img src={`${import.meta.env.BASE_URL}${institutionLogos[post.organization]}`} alt="" />
                          : <span>{post.author.slice(0, 1)}</span>}
                      </span>
                      <small title={post.organization}>{post.organization}</small>
                    </footer>
                  </div>
                </button>
                <div className="demand-post-actions" aria-hidden="true">
                  <span><Heart size={17} />{post.likes}</span>
                  <span><Star size={17} />{post.bookmarks}</span>
                  <span><MessageCircle size={17} />{post.comments}</span>
                </div>
              </article>
            ))}
            </div>
            {!isSearchPage && (
              <nav className="demand-pagination" aria-label="需求分页">
                <button type="button" aria-label="上一页" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {paginationPages.map((page) => (
                  <button className={currentPage === page ? 'is-active' : ''} type="button" key={page} onClick={() => changePage(page)}>
                    {page}
                  </button>
                ))}
                <button type="button" aria-label="下一页" disabled={currentPage === DEMAND_PAGE_COUNT} onClick={() => changePage(currentPage + 1)}>
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="demand-user-results">
            {matchedUsers.map((user) => {
              const followed = followedUsers.has(user.id)
              return (
                <article className="demand-user-card" key={user.id}>
                  <button className="demand-user-avatar-button" type="button" onClick={() => navigate('/profile')} aria-label={`进入${user.name}个人主页`}>
                    <img className="demand-user-photo" src={`${import.meta.env.BASE_URL}${user.avatar}`} alt="" />
                  </button>
                  <div className="demand-user-summary">
                    <h3>{user.name}</h3>
                    <div className="demand-user-stats">
                      <span><strong>{user.following.toLocaleString('en-US')}</strong> 关注</span>
                      <span><strong>{user.fans.toLocaleString('en-US')}</strong> 粉丝</span>
                      <span><strong>{user.collections.toLocaleString('en-US')}</strong> 被收藏</span>
                    </div>
                  </div>
                  <button className={`${followed ? 'is-followed' : ''}${user.mutual ? ' is-mutual' : ''}`} type="button" onClick={() => toggleId(setFollowedUsers, user.id)}>
                    {user.mutual ? '互相关注' : followed ? '已关注' : '+ 关注'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {selectedPost && (
        <div className="demand-modal-backdrop" role="presentation" onMouseDown={() => { setSelectedPost(null); setShowContact(false) }}>
          <section className="demand-detail-modal demand-detail-v2" role="dialog" aria-modal="true" aria-labelledby="demand-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="demand-modal-close" type="button" aria-label="关闭详情" onClick={() => { setSelectedPost(null); setShowContact(false) }}><X /></button>
            <div className="demand-detail-layout">
              <div className="demand-detail-left">
                <div className="demand-detail-poster-wrap">
                  <span className="demand-detail-page-count">1/6</span>
                  <button className="demand-detail-slide-control is-left" type="button" aria-label="上一张"><ChevronLeft size={22} /></button>
                  <DemandPoster demand={{ ...selectedPost, image: undefined }} />
                  <button className="demand-detail-slide-control is-right" type="button" aria-label="下一张"><ChevronRight size={22} /></button>
                  <div className="demand-detail-poster-foot">
                    <i className="is-active" /><i /><i /><i /><i /><i />
                  </div>
                </div>
              </div>
              <div className="demand-detail-right">
                <aside className="demand-detail-author">
                  <img
                    className="demand-detail-author-photo"
                    src={`${import.meta.env.BASE_URL}${demandAuthorAvatars[selectedPost.organization] ?? 'images/demand-users/community-cat.jpg'}`}
                    alt=""
                  />
                  <div className="demand-detail-author-info">
                    <h3>{selectedPost.contact.name}</h3>
                    <p title={selectedPost.bio}>{selectedPost.bio}</p>
                    <span className="demand-author-bio-tooltip" role="tooltip">{selectedPost.bio}</span>
                  </div>
                  <button
                    className={`demand-follow-button${followedUsers.has(selectedPost.contact.name) ? ' is-following' : ''}`}
                    type="button"
                    onClick={() => toggleId(setFollowedUsers, selectedPost.contact.name)}
                  >
                    <span className="demand-follow-default">{followedUsers.has(selectedPost.contact.name) ? '已关注' : '+ 关注'}</span>
                    {followedUsers.has(selectedPost.contact.name) && <span className="demand-follow-cancel">取消关注</span>}
                  </button>
                  <button type="button" onClick={() => setShowContact((current) => !current)}>联系方式</button>
                  <button type="button" onClick={() => { void copyText(window.location.href); flashToast('已复制链接 可以分享') }}>分享</button>
                </aside>
                <div className="demand-detail-content">
                  <p className="demand-detail-meta">应用领域：{selectedPost.field}</p>
                  <h2 id="demand-detail-title">{selectedPost.corpusName}</h2>
                  <div className={`demand-detail-tags${tagsExpanded ? ' is-expanded' : ''}`}>
                    {(tagsExpanded ? detailTags : detailTags.slice(0, 9)).map((tag) => <small key={tag}>{tag}</small>)}
                    {detailTags.length > 9 && (
                      <button className="demand-tags-toggle" type="button" onClick={() => setTagsExpanded((current) => !current)}>
                        {tagsExpanded ? '收起' : '更多'}
                      </button>
                    )}
                  </div>
                  <div className={`demand-detail-description${descriptionExpanded ? ' is-expanded' : ''}`}>
                    <p>{detailDescription}</p>
                    <button type="button" onClick={() => setDescriptionExpanded((current) => !current)}>
                      {descriptionExpanded ? '收起' : '展开'}
                    </button>
                  </div>
                  <div className="demand-comments">
                    <h3>共 {selectedPost.comments + 6} 条评论</h3>
                    {[
                      { id: 'comment-wang', avatar: 'images/demand-users/computer-researcher.jpg', name: '王溪蕾', text: '语料质量很高，对我们医院影像科的多模态诊断模型训练帮助很大，期待后续合作！', time: '4小时前', likes: 56 },
                      { id: 'comment-qian', avatar: 'images/demand-users/community-cat.jpg', name: '钱泊雯', text: '这批多模态语料标注严谨，影像和报告匹配度高，省去我们大量数据清洗工作，微调后的模型效果提升很明显。', time: '4小时前', likes: 56 },
                      { id: 'comment-wu', avatar: 'images/demand-users/community-cat.jpg', name: '吴萍兰', text: '样本覆盖的临床场景比较全面，常见病、部分疑难病例都有涉及，非常适合我们做影像辅助诊断的科研实验。', time: '3小时前', likes: 33 },
                      { id: 'comment-xiao', avatar: 'images/demand-users/language-researcher.jpg', name: '小公子', text: '回复 吴萍兰：对比过不少公开数据集，这套语料噪声少、结构也更清晰。', time: '2小时前', likes: 18, reply: true },
                    ].map((comment) => {
                      const liked = likedCommentIds.has(comment.id)
                      return (
                        <article className={comment.reply ? 'is-reply' : ''} key={comment.id}>
                          <img className="demand-comment-photo" src={`${import.meta.env.BASE_URL}${comment.avatar}`} alt="" />
                          <div>
                            <p title={comment.text}><strong>{comment.name}</strong>{comment.reply && <em>作者</em>} {comment.text}</p>
                            <footer>
                              <span>{comment.time}</span>
                              <button className={liked ? 'is-active' : ''} type="button" onClick={() => toggleId(setLikedCommentIds, comment.id)}><ThumbsUp size={14} />{comment.likes + (liked ? 1 : 0)}</button>
                              <button type="button" onClick={() => { setReplyTo(comment.name); setCommentText(''); setIsComposing(true) }}><MessageCircle size={14} />回复</button>
                            </footer>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                  <div className={`demand-reply-bar${isComposing ? ' is-composing' : ''}`}>
                    {isComposing ? (
                      <div className="demand-reply-editor">
                        {replyTo && <p>回复 {replyTo}：</p>}
                        <textarea
                          autoFocus
                          value={commentText}
                          maxLength={1000}
                          onChange={(event) => setCommentText(event.target.value)}
                          placeholder={replyTo ? `回复 ${replyTo}…` : '说点什么…'}
                        />
                        <div className="demand-reply-actions">
                          <button
                            className="is-primary"
                            disabled={!commentText.trim()}
                            type="button"
                            onClick={() => { flashToast(replyTo ? `已回复 ${replyTo}` : '评论已发送'); setCommentText(''); setReplyTo(null); setIsComposing(false) }}
                          >发送</button>
                          <button type="button" onClick={() => { setCommentText(''); setReplyTo(null); setIsComposing(false) }}>取消</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={`${import.meta.env.BASE_URL}images/demand-users/community-cat.jpg`} alt="" />
                        <button className="demand-reply-trigger" type="button" onClick={() => { setReplyTo(null); setIsComposing(true) }}>说点什么...</button>
                        <button type="button"><ThumbsUp size={17} />35</button>
                        <button type="button"><Star size={17} />31</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showContact && (
              <div className="demand-contact-popover">
                <strong>联系方式</strong>
                <button className="demand-contact-close" type="button" aria-label="关闭联系方式" onClick={() => setShowContact(false)}><X size={15} /></button>
                <p>联系人：{selectedPost.contact.name}</p>
                <p>单位：{selectedPost.contact.unit}</p>
                <p>邮箱：{selectedPost.contact.email}</p>
                <button type="button" onClick={() => { void copyText(`${selectedPost.contact.name} ${selectedPost.contact.unit} ${selectedPost.contact.email}`); flashToast('复制成功') }}><Copy size={15} />复制联系方式</button>
              </div>
            )}
          </section>
        </div>
      )}

      {toast && <div className="demand-toast">{toast}</div>}
    </div>
  )
}
