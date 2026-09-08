import { useEffect, useMemo, useState } from 'react'
import {
  Atom,
  CalendarDays,
  Calculator,
  Database,
  Download,
  Dna,
  Earth,
  FlaskConical,
  HardDrive,
  Eye,
  Layers3,
  Sparkles,
  Star,
  Telescope,
} from 'lucide-react'

const mathFeatureSlides = [
  {
    title: '数学教材与论文原始语料',
    detail: '覆盖数学全领域教材、专著与论文，完成OCR优化和章节、公式、定理、证明等结构化解析。',
    organization: '北京大学数学科学学院',
    publishedAt: '2026-08-16',
    tags: ['数学'],
  },
  {
    title: 'Matlas 定理与陈述语料',
    detail: '抽取大规模数学陈述，连接定义、定理、证明与知识依赖，支撑跨领域语义关联。',
    organization: '北京大学数学科学学院',
    publishedAt: '2026-07-19',
    tags: ['数学'],
  },
  {
    title: '形式化数学语料',
    detail: '建立自然语言陈述、数学公式与 Lean 等形式语言之间的对应关系，服务证明复用与自动验证。',
    organization: '北京大学数学科学学院',
    publishedAt: '2026-07-19',
    tags: ['数学'],
  },
  {
    title: 'Agentic 推理轨迹语料',
    detail: '沉淀智能体在研究级数学问题中的候选步骤、搜索分支、成功路径和失败轨迹。',
    organization: '北京大学数学科学学院',
    publishedAt: '2026-07-19',
    tags: ['数学'],
  },
]

const subjectFeatureSlides: Record<string, typeof mathFeatureSlides> = {
  数学: mathFeatureSlides,
  物理: [
    {
      title: 'Principia物理建模与计算数据库',
      detail: '物理领域首个论文推理类语料库，包含长上下文理解、物理推理、复杂问题求解等高质量数据。',
      organization: '北京大学物理学院',
      publishedAt: '2026-08-06',
      tags: ['物理'],
    },
    {
      title: 'PVolution 实验+模拟语料库',
      detail: '构建首次系统覆盖介观、纳米、原子及亚原子等多尺度，蕴含物理基本规律的超大规模结构化物理语料库。',
      organization: '北京大学物理学院',
      publishedAt: '2026-08-06',
      tags: ['物理'],
    },
  ],
  化学: [
    {
      title: 'CarbonMat 碳材料横向关联语料库',
      detail: '面向碳材料研究的横向证据链组织，将文献中的工艺、结构、表征、性能与机理解释关联成可推理的多模态知识单元。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
    {
      title: 'NMR 高质量实验数据库',
      detail: '目前世界最大的高质量实验数据库，“主动出击”的新谱学工具突破真实场景结构解析瓶颈。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
    {
      title: '中国自主晶体结构数据库',
      detail: '以人工智能结构预测为特征的数据库，集查询与预测一体，支撑晶体结构检索、生成与验证。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
    {
      title: '原子级催化剂计算模型数据库',
      detail: '可检索、可训练、可追溯的原子结构与计算属性数据底座，支撑材料大模型预训练、结构表征学习和高通量催化剂筛选。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
    {
      title: '金属离子电池材料数据库',
      detail: '结构化连接材料结构与电化学性能，支撑AI驱动的电池材料筛选与性能预测模型训练。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
    {
      title: '放射性药物体内评价数据库',
      detail: '为放射性药物和新型配体的体内药效、安全性评价提供数据支撑。',
      organization: '北京大学化学与分子工程学院',
      publishedAt: '2026-07-14',
      tags: ['化学'],
    },
  ],
  天文: [
    {
      title: '多源多模态观测与宇宙学模拟数据',
      detail: '包含多波段图像、光谱、时序、星表等类型，构成面向星系物理、宇宙学、时域天文学等基础科学研究的数据资源。',
      organization: '北京大学天文学系',
      publishedAt: '2026-07-14',
      tags: ['天文'],
    },
    {
      title: '斯隆数字巡天（SDSS Legacy）成像数据',
      detail: 'SDSS 是国际上近 30 年里影响力最大的天文巡天项目，可广泛用于研究宇宙学、星系物理、银河系及恒星物理等。',
      organization: '北京大学天文学系',
      publishedAt: '2026-07-14',
      tags: ['天文'],
    },
    {
      title: 'ZTF源表和光变数据',
      detail: '包含差分测光、历史检测和图像切片，是暂现源实时分类的重要训练语料。',
      organization: '北京大学天文学系',
      publishedAt: '2026-07-14',
      tags: ['天文'],
    },
    {
      title: 'ALMA分子与原子谱线数据立方',
      detail: '提供空间-速度三维信息，可研究气体动力学、化学和质量分布。',
      organization: '北京大学天文学系',
      publishedAt: '2026-07-14',
      tags: ['天文'],
    },
    {
      title: 'Kratos代码测试、标准问题与基准算例库',
      detail: '沉淀可复现测试和典型算例，适合训练AI理解物理方程、数值方法和结果验证。',
      organization: '北京大学天文学系',
      publishedAt: '2026-07-14',
      tags: ['天文'],
    },
  ],
  地理: [
    {
      title: '全球无缝数据立方体',
      detail: '以全球 30 米无缝数据立方体（SDC）地表反射率数据集（2000–2024）为代表，可提供PB级观测数据。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
    {
      title: '地球与行星领域多天体数据语料库',
      detail: '包含地球、金星、火星、水星、月球的遥感、地质、化学、物理多学科信息，以及跨天体对比与推理能力。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
    {
      title: '全球公开 M>5 地震事件波形数据',
      detail: '标注P、S及面波到时，服务震相识别、地震事件检测和地球内部结构研究。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
    {
      title: 'InSight火震波形数据库',
      detail: '将地球地震研究方法拓展到火星，与地震数据形成跨天体对照。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
    {
      title: '全球高分光学遥感语料',
      detail: '代表全球地表观测与多尺度空间表征，可服务地物识别、变化检测、城市环境分析和地理基础模型训练。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
    {
      title: '真实城市环境中的空间智能评测基准数据',
      detail: '评测模型在真实城市中的空间定位、方向关系、路线理解和推理能力。',
      organization: '北京大学地球与空间科学学院',
      publishedAt: '2026-07-14',
      tags: ['地理'],
    },
  ],
  生物: [
    {
      title: '跨物种细胞调控图谱',
      detail: '跨物种、多模态，内容最全。基于自主研发数据解析管线，实现从数据下载-质控-清洗-治理全链条自动化。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
    {
      title: '作物多模态育种',
      detail: '跨越245年、总量达2835余万篇全球生物专业中英文文献，覆盖10+主粮和经济作物。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
    {
      title: '中国人群肿瘤基因组',
      detail: '覆盖15种常见肿瘤（每种500例），全部使用国产测序平台自测，实现全自主产权所有。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
    {
      title: '植物天然药物综合语料库',
      detail: '构建全世界最大规模植物天然药物综合语料库，赋能生物合成途径解析与绿色生物制造。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
    {
      title: 'AI大数据驱动的创新药物筛选系统',
      detail: '亿级知识图谱数据库与药物研发大模型，16家高校企业应用，推动候选药物15+。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
    {
      title: '临床科研大数据特征提取与安全计算系统',
      detail: '在试点临床机构部署与示范应用，集成TB级临床科研数据集。',
      organization: '北京大学生命科学学院',
      publishedAt: '2026-07-14',
      tags: ['生物'],
    },
  ],
}

function featureMetrics(index: number) {
  return {
    views: [231, 468, 352, 586, 421, 319][index % 6],
    favorites: [120, 156, 94, 211, 137, 88][index % 6],
    downloads: [653, 428, 286, 714, 339, 196][index % 6],
  }
}

const subjectData = [
  {
    name: '数学',
    icon: Calculator,
    cover: 'math',
    lead: '围绕数学知识、定理证明、形式化验证与智能推理，建设可检索、可验证、可训练的数学语料基础设施。',
    scale: { sets: '175+', setsUnit: '个', size: '0.15', sizeUnit: 'PB', items: '1.10', itemsUnit: '亿条' },
    services: ['AI4Math：数学研究赋能', 'Math4AI：反哺人工智能', '教育与应用', '跨学科应用(AI4S战略)'],
  },
  {
    name: '物理',
    icon: Atom,
    cover: 'physics',
    lead: '以重大物理问题为牵引，贯通文献、公式、实验数据、计算程序与科研工作流，支撑 AI for Physics。',
    scale: { sets: '147+', setsUnit: '个', size: '0.29', sizeUnit: 'PB', items: '0.53', itemsUnit: '亿条' },
    services: ['AI辅助科研', '科研自动化平台', '教育与人才培养', 'AI评测与基准'],
  },
  {
    name: '化学',
    icon: FlaskConical,
    cover: 'chem',
    lead: '面向分子、反应、材料与实验过程，建设连接结构、性质、谱图和实验记录的化学语料资源。',
    scale: { sets: '169+', setsUnit: '个', size: '5.69', sizeUnit: 'PB', items: '1.68', itemsUnit: '亿条' },
    services: ['科学研究与模型训练', '教学与人才培养', '科学模拟与实验验证', '产业研发与创新'],
  },
  {
    name: '天文',
    icon: Telescope,
    cover: 'astro',
    lead: '整合多波段观测、星表、巡天图像与天体物理模拟，服务天文智能发现。',
    scale: { sets: '132+', setsUnit: '个', size: '27.52', sizeUnit: 'PB', items: '37.77', itemsUnit: '亿条' },
    services: ['大模型训练与智能问答', '天文数据分析与AI辅助研究', '课堂与研究性教学', '平台化服务于科研写作'],
  },
  {
    name: '地理',
    icon: Earth,
    cover: 'geo',
    lead: '围绕空间数据、遥感影像、地理文本与城市运行信息，建设面向空间智能的语料体系。',
    scale: { sets: '149+', setsUnit: '个', size: '2.57', sizeUnit: 'PB', items: '6.11', itemsUnit: '亿条' },
    services: ['科学大模型训练', '灾害预测与应急响应', '气候变化与碳中和研究', '资源环境管理与生态保护'],
  },
  {
    name: '生物',
    icon: Dna,
    cover: 'bio',
    lead: '连接生物分子、组学数据、实验记录与生态观测，支撑生命科学智能分析。',
    scale: { sets: '128+', setsUnit: '个', size: '1.78', sizeUnit: 'PB', items: '44.83', itemsUnit: '亿条' },
    services: ['AI辅助科研', '科研自动化平台', '教育与人才培养', '跨学科应用(AI4S战略)'],
  },
]

export default function SubjectShowcase() {
  const [activeSubject, setActiveSubject] = useState(subjectData[0].name)
  const [activeFeature, setActiveFeature] = useState(0)
  const subject = useMemo(
    () => subjectData.find((item) => item.name === activeSubject) ?? subjectData[0],
    [activeSubject],
  )
  const featureSlides = subjectFeatureSlides[subject.name] ?? mathFeatureSlides
  const Icon = subject.icon
  const feature = featureSlides[activeFeature] ?? featureSlides[0]
  const metrics = featureMetrics(activeFeature)
  const coverSrc = `${import.meta.env.BASE_URL}images/home/subject-${subject.cover}-${(activeFeature % 4) + 1}.jpg`

  useEffect(() => {
    setActiveFeature(0)
    const timer = window.setInterval(() => {
      setActiveFeature((current) => (current + 1) % featureSlides.length)
    }, 3600)

    return () => window.clearInterval(timer)
  }, [featureSlides])

  return (
    <section className="home-subjects" aria-labelledby="home-subjects-title">
      <div className="home-subjects-inner">
        <h2 id="home-subjects-title">六大<span className="text-gradient">学科领域</span>建设特色</h2>

        <div className="home-subject-tabs" aria-label="学科切换">
          {subjectData.map((item) => (
            <button
              className={item.name === subject.name ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveSubject(item.name)}
              aria-pressed={item.name === subject.name}
              key={item.name}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="home-subject-panel">
          <article className="home-subject-corpus" key={`${subject.name}-${activeFeature}`}>
            <div className="home-subject-cover">
              <img src={coverSrc} alt="" loading="lazy" />
              <span className="cover-badge">部分公开</span>
            </div>
            <div className="home-subject-corpus-body">
              <div className="corpus-meta-row">
                <span className="corpus-domain-tag">{feature.tags[0]}</span>
                <time dateTime={feature.publishedAt}><CalendarDays size={13} />{feature.publishedAt}</time>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.detail}</p>
              <footer>
                <span className="card-org-mark" aria-hidden="true">北</span>
                <strong className="card-organization-name">{feature.organization}</strong>
                <span><Download size={14} />{metrics.downloads}</span>
                <span><Eye size={14} />{metrics.views}</span>
                <span><Star size={14} />{metrics.favorites}</span>
              </footer>
            </div>
            <div className="home-subject-progress" aria-label={`${subject.name}特色语料轮播进度`}>
              {featureSlides.map((item, index) => (
                <button
                  className={index === activeFeature ? 'is-active' : ''}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  aria-label={`查看${item.title}`}
                  key={item.title}
                />
              ))}
            </div>
          </article>

          <div className="home-subject-info">
            <div className="home-subject-head">
              <span className="home-subject-icon"><Icon size={22} /></span>
              <div>
                <h3>{subject.name}</h3>
                <p>{subject.lead}</p>
              </div>
            </div>

            <article className="home-subject-card">
              <header><Layers3 size={18} /><h4>建设规模</h4></header>
              <div className="home-subject-scale">
                <div><p><strong>{subject.scale.sets}</strong><em>{subject.scale.setsUnit}</em></p><span><Database size={13} />语料集</span></div>
                <div><p><strong>{subject.scale.size}</strong><em>{subject.scale.sizeUnit}</em></p><span><HardDrive size={13} />语料规模</span></div>
                <div><p><strong>{subject.scale.items}</strong><em>{subject.scale.itemsUnit}</em></p><span><Layers3 size={13} />语料条数</span></div>
              </div>
            </article>

            <article className="home-subject-card">
              <header><Sparkles size={18} /><h4>服务场景</h4></header>
              <ul className="home-subject-services">
                {subject.services.map((item) => <li key={item}><i />{item}</li>)}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
