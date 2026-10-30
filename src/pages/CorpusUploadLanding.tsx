import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, ClipboardList, Database, FileCheck2, FileInput, FolderCheck, Info, Send, Server, ShieldCheck, Upload } from 'lucide-react'
import { useApp } from '../context/app-context'
import CorpusDialog from '../components/CorpusDialog'
import './corpus-upload-landing.css'

const flowSteps = [
  { title: '语料准备', description: '整理语料文件及权益说明，确保格式正确、内容完整', icon: FolderCheck },
  { title: '提交申请', description: '在线填写语料基本信息，确保提交内容完整、准确，并根据要求上传示例数据、公开数据', icon: FileInput },
  { title: '审核与反馈', description: '平台管理员对提交的申请进行审核，请及时反馈需要补充或调整的内容', icon: ClipboardList },
  { title: '成功入库', description: '语料入库成功后将完成质量与结构复核，确认开放范围与存储信息无误，等待发布上架', icon: Database },
  { title: '发布成功', description: '完成语料发布，让建设成果被发现、使用和持续完善', icon: Send },
]

const responsibilities = [
  { title: '内容与权属', icon: FileCheck2, paragraphs: ['提交人应如实填写作者、联系方式、所在单位、发布机构和语料基本信息，保证提交信息与实际语料内容一致，并确认对所提交语料拥有合法权利或已经取得必要授权。涉及合作单位、第三方数据库、出版物、图片、音视频、代码等内容时，应确保汇交、加工、存储和共享行为符合相应授权范围，不得提交来源不明或侵犯他人合法权益的内容。'] },
  { title: '安全与合规', icon: ShieldCheck, paragraphs: ['不得上传、处理或传播涉及国家秘密、工作秘密以及法律法规禁止公开的内容。涉及个人信息、医疗健康、人类遗传资源、敏感地理位置、未公开科研成果或其他受限制数据时，应提前完成必要的脱敏、匿名化、授权或伦理审查，并根据实际情况设置合适的开放范围。'] },
  { title: '文件质量与开放使用', icon: Server, paragraphs: ['提交的语料应真实、完整并能够正常读取，文件结构和命名应保持清晰，语料介绍应与实际内容一致。建议同时提供README、数据来源等辅助材料。提交人应根据语料权属和共享条件选择许可协议及公开或不公开的开放程度。所有开放程度均需提供不含敏感信息的示例数据。'] },
  { title: '审核与持续维护', icon: FileCheck2, paragraphs: ['平台管理员可以对申请信息、文件完整性、权属说明、安全要求和开放范围进行审核，并要求提交人补充或修改材料。', '语料库管理员可以对上传的语料进行审核，并要求提交人补充或修改材料。', '审核通过后的语料可以继续补充和更新，基本信息变更、文件替换等调整应重新进入审核流程。发现语料存在权属争议、安全风险或严重质量问题时，平台可以暂停展示、限制访问或启动下架处理。'] },
]

function AgreementIllustration() {
  return <svg className="ul-agreement-illustration" width="100" height="100" viewBox="0 0 112 112" fill="none" aria-hidden="true">
    <defs><linearGradient id="ul-paper" x1="30" y1="12" x2="93" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#edf1ff" /></linearGradient><linearGradient id="ul-ink" x1="44" y1="19" x2="103" y2="101" gradientUnits="userSpaceOnUse"><stop stopColor="#a5d5ff" /><stop offset="1" stopColor="#6451ff" /></linearGradient></defs>
    <rect x="13" y="22" width="61" height="77" rx="11" transform="rotate(-9 13 22)" fill="#dce6ff" />
    <rect x="25" y="10" width="62" height="83" rx="10" fill="url(#ul-paper)" stroke="#dce5ff" strokeWidth="1.5" />
    <path d="M39 27h19" stroke="url(#ul-ink)" strokeWidth="6" strokeLinecap="round" />
    <path d="M38 42h37M38 54h29M38 66h22M38 80h2m8 0h2m8 0h2" stroke="#b7c5dc" strokeWidth="3" strokeLinecap="round" />
    <path d="m65 69 7-17 27-29a4 4 0 0 1 6 6L79 61 65 69Z" fill="url(#ul-ink)" /><path d="m65 69 4-10 7 6-11 4Z" fill="#a8b8d2" /><path d="m76 54 25-28" stroke="#e5ecff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="60" y="80" width="46" height="27" rx="13.5" fill="url(#ul-ink)" /><g fill="white"><circle cx="72" cy="93.5" r="2.5" /><circle cx="83" cy="93.5" r="2.5" /><circle cx="94" cy="93.5" r="2.5" /></g>
  </svg>
}

export default function CorpusUploadLanding() {
  const navigate = useNavigate()
  const { user, openAuth } = useApp()
  const [agreementOpen, setAgreementOpen] = useState(false)
  const startSubmission = () => {
    if (!user) { openAuth('/upload/form'); return }
    navigate('/upload/form')
    window.scrollTo({ top: 0 })
  }
  const closeAgreement = () => setAgreementOpen(false)

  return <main className="ul-page">
    <section className="ul-hero" aria-labelledby="ul-title">
      <div className="ul-container ul-hero-content">
        <h1 id="ul-title">汇聚高质量科学语料<br /><span>共建共享科学语料资源</span></h1>
        <p>汇交您的科学语料，凝聚共建力量，共同推动科学智能发展</p>
        <div className="ul-hero-actions">
          <button type="button" className="ul-start" onClick={startSubmission}><Upload size={17} />开始汇交</button>
          <button type="button" className="ul-agreement" onClick={() => setAgreementOpen(true)}>服务协议<ArrowRight size={17} /></button>
        </div>
      </div>
    </section>

    <section className="ul-flow" aria-labelledby="ul-flow-title">
      <div className="ul-container">
        <h2 id="ul-flow-title">语料汇交<span>流程</span></h2>
        <ol className="ul-steps">
          {flowSteps.map(({ title, description, icon: Icon }, index) => <li key={title}>
            <div className="ul-step-icon"><Icon size={42} strokeWidth={1.6} aria-hidden="true" /></div>
            <h3><span>{String(index + 1).padStart(2, '0')}</span>{title}</h3>
            <p>{description}</p>
            {index < flowSteps.length - 1 && <ArrowRight className="ul-step-arrow" size={24} strokeWidth={1.6} aria-hidden="true" />}
          </li>)}
        </ol>
      </div>
    </section>

    <section className="ul-responsibilities" aria-labelledby="ul-responsibility-title">
      <div className="ul-container">
        <h2 id="ul-responsibility-title">汇交规范与<span>责任说明</span></h2>
        <div className="ul-responsibility-grid">
          {responsibilities.map(({ title, paragraphs, icon: Icon }) => <article key={title}>
            <header><span className="ul-responsibility-icon"><Icon size={27} strokeWidth={1.8} aria-hidden="true" /></span><h3>{title}</h3></header>
            <div>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </article>)}
        </div>
        <p className="ul-note"><Info size={16} aria-hidden="true" /><span><strong>重要提示：</strong>提交数据即表示您已阅读并同意以上所有条款</span></p>
      </div>
    </section>

    {agreementOpen && <CorpusDialog className="ul-agreement-dialog" labelledBy="ul-agreement-title" closeLabel="关闭服务协议弹窗" onClose={closeAgreement}>
      <AgreementIllustration />
      <h2 id="ul-agreement-title">服务协议</h2>
      <p>服务协议正在拟定中，正式发布后将在<br className="ul-dialog-linebreak" />本弹窗中完整展示，敬请期待。</p>
      <footer><button type="button" onClick={closeAgreement}>取消</button><button type="button" className="is-primary" onClick={closeAgreement}>知道了</button></footer>
    </CorpusDialog>}
  </main>
}
