import { Box, BriefcaseBusiness, ChartNoAxesColumnIncreasing, UserRound } from 'lucide-react'

const nodes = [
  { key: 'talent', icon: UserRound, title: '人才', detail: '多学科专业力量' },
  { key: 'model', icon: Box, title: '模型', detail: '智能模型' },
  { key: 'tools', icon: BriefcaseBusiness, title: '工具', detail: '智能化生产工具链' },
  { key: 'data', icon: ChartNoAxesColumnIncreasing, title: '数据', detail: '高质量科学语料' },
]

export default function HomeOrbit() {
  return (
    <div className="home-hero-orbit" tabIndex={0} role="img" aria-label="数据、工具、人才、模型共进化循环">
      <svg className="home-orbit-grid" viewBox="0 0 540 500" aria-hidden="true">
        <defs>
          <linearGradient id="home-orbit-line"><stop stopColor="#55dcff" /><stop offset="1" stopColor="#a58aff" /></linearGradient>
        </defs>
        <g fill="none" stroke="url(#home-orbit-line)">
          {[86, 120, 154, 188, 222].map((r, index) => <circle key={r} cx="270" cy="250" r={r} opacity={index % 2 ? '.5' : '.24'} />)}
          <circle cx="270" cy="250" r="205" strokeDasharray="11 11" opacity=".5" />
          <circle cx="270" cy="250" r="137" strokeDasharray="8 12" opacity=".4" />
          <path d="M270 12V488M32 250H508" opacity=".35" />
          <path d="M103 83L437 417M103 417L437 83" opacity=".15" />
        </g>
        <g fill="#d2deff">
          {[86, 120, 154, 188].flatMap(r => [[270-r,250],[270+r,250],[270,250-r],[270,250+r]]).map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="3" />)}
        </g>
        <g fill="#f3f7ff" stroke="#b8d1ff" strokeWidth="3">
          <circle cx="270" cy="62" r="4" /><circle cx="270" cy="28" r="5" />
          <circle cx="270" cy="438" r="4" /><circle cx="82" cy="250" r="4" />
          <circle cx="458" cy="250" r="4" /><circle cx="48" cy="250" r="5" stroke="#8edfff" />
          <circle cx="492" cy="250" r="5" stroke="#c1b1ff" />
        </g>
      </svg>
      <div className="orbit-center"><span>科学语料</span><strong>共进化</strong><i aria-hidden="true" /></div>
      <div className="orbit-spin">
        {nodes.map(({icon:Icon,...node}) => <div className={`orbit-node orbit-${node.key}`} key={node.key}>
          <span className="orbit-node-icon"><Icon size={36} strokeWidth={1.5} /></span>
          <span className="orbit-node-copy"><strong>{node.title}</strong><small>{node.detail}</small></span>
        </div>)}
      </div>
    </div>
  )
}
