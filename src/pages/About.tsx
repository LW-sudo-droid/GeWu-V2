import { useState, type ReactNode } from 'react'
import { ArrowRight, BookOpen, Building2, GraduationCap, Microscope, Network, RefreshCw, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import LogoMark from '../components/LogoMark'
import { ecosystemGroups, type EcosystemKey } from '../data/ecosystem'
import './about-page.css'

const philosophyNodes = [
  { key: 'open', icon: Network, title: '开放协同', text: '汇聚高校、科研机构、企业和个人建设力量，形成多方参与、优势互补的语料建设机制', keywords: '多方参与 · 共建共享' },
  { key: 'subject', icon: BookOpen, title: '学科组织', text: '依托六大基础学科体系和专业人才队伍，保障科学语料的专业性、系统性与知识深度', keywords: '六大学科 · 共同参与' },
  { key: 'governance', icon: ShieldCheck, title: '规范治理', text: '对语料来源、加工过程、权益信息、开放范围和版本变化进行规范记录与管理', keywords: '可治理 · 可追溯 · 可复用' },
  { key: 'iteration', icon: RefreshCw, title: '持续迭代', text: '推动数据、工具、人才和模型协同演化，通过建设与使用反馈不断提升语料质量', keywords: '协同演化 · 持续更新' },
]

const ecosystemIcons: Record<EcosystemKey, typeof GraduationCap> = {
  高校: GraduationCap,
  科研机构: Microscope,
  企业: Building2,
  个人: UserRound,
}

const ecosystemKeys = Object.keys(ecosystemGroups) as EcosystemKey[]

function AboutOrbit({ label, description, steps, children }: {
  label: string
  description?: string
  steps: string[]
  children: ReactNode
}) {
  return <div className="about-orbit">
    <div className="about-orbit-visual">
      <div className="about-orbit-lines" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="about-orbit-core" aria-label="格物 · 科学语料库">
        <Sparkles size={20} aria-hidden="true" />
        <strong>格物</strong><span>科学语料库</span>
      </div>
      <div className="about-orbit-nodes" role="group" aria-label={label}>{children}</div>
    </div>
    <div className="about-orbit-caption">
      <strong>{label}</strong>
      {description && <span>{description}</span>}
      <div className="about-v2-flow">{steps.map(step => <span key={step}>{step}</span>)}</div>
    </div>
  </div>
}

export default function About() {
  const [activeGroup, setActiveGroup] = useState<EcosystemKey>('高校')
  const active = ecosystemGroups[activeGroup]

  return (
    <div className="about-v2-page">
      <section className="about-v2-hero">
        <div className="about-v2-container">
          <header className="about-v2-page-title"><h1>关于<span>我们</span></h1></header>
          <div className="about-v2-brand"><LogoMark size={72} /><div><strong>格物 · 科学语料库</strong><span>科学语料共建共享平台</span></div></div>
          <div className="about-v2-intro-grid">
            <article>
              <p><strong>格物 · 科学语料库</strong>——面向科学智能发展的高质量科学语料共建共享平台。聚焦数学、物理、化学、天文、地理、生物六大基础学科，持续汇聚高校、科研机构、企业和个人建设的科学语料资源。</p>
              <p>平台按照“1+6+N”开放协同机制推进，依托完整的学科体系和多方建设力量，以“可治理、可追溯、可复用、可迭代”为建设理念，贯通多源多模态语料汇聚、专业加工、质量评估、开放共享与持续迭代，推动人类专家、智能模型和语料加工工具协同参与科学语料建设。</p>
            </article>
            <aside className="about-v2-relation">
              <div className="about-v2-relation-flow"><span><UserRound size={18} />语料贡献者</span><ArrowRight size={18} /><strong><LogoMark size={34} />格物 · 科学语料库</strong><ArrowRight size={18} /><span><Sparkles size={18} />科研、教学与模型应用</span></div>
              <div className="about-v2-audience"><b>服务对象</b><p>高校、科研机构、科技企业、教师、科研人员、学生及模型研发人员</p></div>
            </aside>
          </div>
        </div>
      </section>

      <section className="about-v2-section about-v2-strategy">
        <div className="about-v2-container">
          <header className="about-v2-heading"><div><h2>战略<span>背景</span></h2><p>面向科学智能发展需求，建设开放协同、规范可信的科学语料基础设施</p></div></header>
          <div className="about-v2-strategy-grid">
            <article className="about-v2-card">
              <div className="about-v2-card-heading"><Sparkles size={28} /><h3>国家战略定位</h3></div>
              <p>AI for Science（AI4S）是一种全新的科研范式，也是我国实现科技自立自强、建设科技强国的必经之路。习近平总书记强调要“以人工智能引领科研范式变革”“体系化布局建设重大科技基础设施，建设智能化科研平台系统”，《国务院关于深入实施“人工智能+”行动的意见》明确要求加快科学大模型建设应用、打造开放共享的高质量科学数据集。</p>
              <p>高质量科学数据不仅是人工智能理解科学知识、开展复杂推理的重要基础，也是科学大模型建设和科研智能化发展的关键支撑。面向国家人工智能与科技创新战略需求，格物 · 科学语料库着力建设开放协同、规范可信的科学语料基础设施，推动基础学科数据资源转化为可服务科研创新、教育教学和模型发展的高质量科学语料。</p>
            </article>
            <article className="about-v2-card">
              <div className="about-v2-card-heading"><Network size={28} /><h3>当前困境与挑战</h3></div>
              <p>当前，我国基础学科语料资源分散于高校、科研院所和行业机构，统一的汇交治理机制与数据标准尚不完善，“数据孤岛”问题突出。数学公式、实验图谱、生物分子结构等复杂科学数据具有显著的专业性和多模态特征，深度解析、语义对齐和质量评价难度较高。</p>
              <div className="about-v2-challenge-tags"><span>资源分散</span><span>标准不一</span><span>多模态对齐困难</span><span>专业语料不足</span></div>
              <p>高质量专业语料、领域推理过程和长思维链数据仍存在结构性缺口，语料来源、权益边界、加工过程和更新版本也需要更加规范的记录与管理。格物 · 科学语料库将通过多方语料汇聚、专业加工、规范治理与开放协同，推动解决科学数据分散、标准不一、多模态对齐困难和高质量专业语料不足等问题。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-v2-section about-v2-philosophy">
        <div className="about-v2-container">
          <header className="about-v2-heading"><h2>建设<span>理念</span></h2><p>以开放协同汇聚建设力量，以学科体系保障专业质量，以规范治理建立可信基础，以持续迭代释放语料价值</p></header>
          <div className="about-orbit-layout">
            <AboutOrbit label="科学语料共建共享平台" description="连接学科资源、专业人才、加工工具与智能模型" steps={['汇聚', '治理', '共享', '反馈']}>
              {philosophyNodes.map(({ key, title, icon: Icon }) => <span key={key} className="about-orbit-node" aria-hidden="true">
                <Icon size={20} /><span>{title}</span>
              </span>)}
            </AboutOrbit>
            <div className="about-v2-principles">
              {philosophyNodes.map((node, index) => <article key={node.key} className="about-v2-card">
                <i>0{index + 1}</i><h3>{node.title}</h3><p>{node.text}</p><span>{node.keywords}</span>
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="about-v2-section about-v2-community">
        <div className="about-v2-container">
          <header className="about-v2-heading"><div><h2>共建<span>生态</span></h2><p>连接高校、科研机构、企业和个人贡献者，汇聚学科资源、科研数据、技术工具与专业知识，共同建设持续演化的科学语料生态</p></div></header>
          <div className="about-orbit-layout">
            <AboutOrbit label="科学语料共建共享枢纽" steps={['汇聚', '治理', '共享', '使用', '反馈', '迭代']}>
              {ecosystemKeys.map(key => {
                const Icon = ecosystemIcons[key]
                return <button type="button" key={key} className="about-orbit-node" aria-pressed={activeGroup === key} aria-controls="about-v2-members"
                  onMouseEnter={() => setActiveGroup(key)} onFocus={() => setActiveGroup(key)} onClick={() => setActiveGroup(key)}>
                  <Icon size={20} aria-hidden="true" /><span>{key}</span>
                </button>
              })}
            </AboutOrbit>
            <div className="about-ecosystem-side">
              <div className="about-ecosystem-tabs" role="group" aria-label="共建成员分类">
                {ecosystemKeys.map(key => <button type="button" key={key} aria-pressed={activeGroup === key}
                  aria-controls="about-v2-members" onMouseEnter={() => setActiveGroup(key)} onClick={() => setActiveGroup(key)}>{key}</button>)}
              </div>
              <div className="about-v2-members" id="about-v2-members">
                <div className="about-ecosystem-member-heading"><strong>{activeGroup}</strong><p>{active.summary}</p></div>
                <div className="about-v2-member-list">
                  {active.members.map((member) => activeGroup === '个人'
                    ? <span key={member.name}><i aria-hidden="true">{member.name.slice(0, 1)}</i>{member.name}</span>
                    : <Link className={member.name === '北京大学' ? 'is-lead' : ''} key={member.name} to={`/search/results?publisher=${encodeURIComponent(member.name)}`}>
                      {member.logo ? <img src={member.logo} alt="" /> : <i aria-hidden="true">{member.name.slice(0, 2)}</i>}
                      <b>{member.name}</b>
                    </Link>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
