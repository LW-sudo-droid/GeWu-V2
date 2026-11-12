import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CloudUpload,
  ClipboardCheck,
  Crosshair,
  Database,
  Edit3,
  FolderOpen,
  Globe,
  HeartHandshake,
  Layers3,
  MessageCircle,
  Network,
  Orbit,
  Sigma,
  ThumbsUp,
  UploadCloud,
  UsersRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import '../home-v2.css'
import '../home-design.css'
import HomeOrbit from '../components/home/HomeOrbit'
import HomeSectionNav from '../components/home/HomeSectionNav'
import HomeMetricIcon from '../components/home/HomeMetricIcon'
import HomeEvaluation from '../components/home/HomeEvaluation'
import CorpusCommunity, { PartnersSection } from '../components/CorpusCommunity'
import SubjectShowcase from '../components/SubjectShowcase'
import QualityCorpusDiscovery from '../components/QualityCorpusDiscovery'

const heroMetrics = [
  { icon: Layers3, value: '92', unit: '亿条', label: '语料条数', tone: 'violet' },
  { icon: FolderOpen, value: '900', unit: '个', label: '语料库', tone: 'blue' },
  { icon: Database, value: '38', unit: 'PB', label: '语料规模', tone: 'indigo' },
  { icon: UsersRound, value: '400', unit: '万', label: '服务用户', tone: 'purple' },
]

const flowSteps = [
  { icon: Crosshair, title: '语料检索', description: '精准发现科学语料' },
  { icon: CloudUpload, title: '语料上传', description: '开放汇交·持续共建' },
  { icon: ClipboardCheck, title: '语料评测', description: '科学评测集 · 展示模型表现' },
  { icon: Orbit, title: '需求广场', description: '发布语料需求' },
  { icon: Briefcase, title: '工具市场', description: '专业加工工具' },
]

const demandCards = [
  {
    icon: Network,
    tone: 'blue',
    title: '分子-工艺-性能构效关系预测与逆向设计',
    status: '招募中',
    tags: ['科学数据', '知识语料'],
    summary: '需要分子的组成、理化性质与合成工艺数据，包含 CAS 号、分子结构、SMILES、InChI 及工艺参数。',
    replies: 24,
    likes: 24,
    bookmarks: 234,
  },
  {
    icon: Globe,
    tone: 'teal',
    title: 'CMIP6 全球气候模型数据',
    status: '招募中',
    tags: ['CMIP6', 'NetCDF'],
    summary: '全量气候模型输出数据，覆盖大气、海洋与陆地变量，遵循 CF 元数据规范。',
    replies: 533,
    likes: 678,
    bookmarks: 98,
  },
  {
    icon: Sigma,
    tone: 'violet',
    title: '组合数学、数论的形式化知识',
    status: '共建中',
    tags: ['数学定理证明', '知识语料'],
    summary: '包含问题自然语言描述、Lean 形式化描述、Lean header 与证明 COT 等。',
    replies: 231,
    likes: 120,
    bookmarks: 653,
  },
]

const demandSteps = [
  { icon: Edit3, label: '发起需求' },
  { icon: UsersRound, label: '寻找伙伴' },
  { icon: HeartHandshake, label: '协作共建' },
]

export default function Home() {
  const navigate = useNavigate()
  const handleUpload = () => {
    navigate('/upload')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1>
              高质量科学语料
              <br />
              <span className="text-gradient">共建共享平台</span>
            </h1>
            <p>汇聚高校、企业、新型研发机构与个人建设成果，连接语料贡献者与使用者，服务科研创新、教育教学与模型训练</p>
            <div className="home-hero-actions">
              <button className="home-btn-dark" type="button" onClick={handleUpload}>
                <UploadCloud size={18} />语料上传
              </button>
              <Link className="home-btn-gradient" to="/search/results">
                查看语料库<ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <HomeOrbit />
        </div>

        <div className="home-metrics">
          {heroMetrics.map((item) => (
            <div className="home-metric-card" key={item.label}>
              <span className={`home-metric-icon tone-${item.tone}`}><HomeMetricIcon kind={item.tone} /></span>
              <div className="home-metric-copy">
                <p><strong>{item.value}</strong><em>{item.unit}</em></p>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeSectionNav />

      <section id="home-flow" className="home-flow" aria-labelledby="home-flow-title">
        <div className="home-flow-inner">
          <h2 id="home-flow-title">连接科学语料的<span className="text-gradient-alt">每一步</span></h2>
          <div className="home-flow-row" aria-label="平台能力列表">
            {flowSteps.map((step, index) => (
              <div className="home-flow-item" key={step.title}>
                {index > 0 && <span className="flow-connector" aria-hidden="true" />}
                <article className="home-flow-card">
                  <span className="home-flow-icon"><step.icon size={26} /></span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SubjectShowcase />
      <HomeEvaluation />

      <section id="home-demand" className="home-demand" aria-labelledby="home-demand-title">
        <div className="home-demand-inner">
          <div className="home-demand-copy">
            <h2 id="home-demand-title">
              <span className="text-gradient">让每一个语料需求</span>
              <br />
              被看见，被响应
            </h2>
            <p>发布语料库建设需求，通过回复、点赞与评论，让好想法汇聚成可落地的共建项目。</p>
            <div className="home-demand-steps" aria-label="需求广场协作流程">
              {demandSteps.map((step, index) => (
                <div className="home-demand-step" key={step.label}>
                  {index > 0 && <ArrowRight className="step-arrow" size={16} aria-hidden="true" />}
                  <span className="home-demand-step-icon"><step.icon size={22} /></span>
                  <strong>{step.label}</strong>
                </div>
              ))}
            </div>
            <Link className="home-btn-dark demand-link" to="/demands">
              去需求广场<ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-demand-stage" aria-label="需求广场示例需求">
            {demandCards.map((card, index) => (
              <article className={`home-demand-card card-${index + 1}`} key={card.title}>
                <header>
                  <span className={`demand-card-icon tone-${card.tone}`}><card.icon size={22} /></span>
                  <h3>{card.title}</h3>
                  <em className={`demand-status ${card.status === '共建中' ? 'is-building' : ''}`}>{card.status}</em>
                </header>
                <div className="demand-card-tags">
                  {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <p>{card.summary}</p>
                <footer>
                  <span><MessageCircle size={15} />{card.replies} 回复</span>
                  <span><ThumbsUp size={15} />{card.likes} 点赞</span>
                  <span><Bookmark size={15} />{card.bookmarks} 收藏</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CorpusCommunity />
      <QualityCorpusDiscovery />
      <PartnersSection />
    </div>
  )
}
