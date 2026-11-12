import { CircleCheckBig } from 'lucide-react'
import CorpusDialog from './CorpusDialog'

export default function CorpusRequestSuccessDialog({ onClose }: { onClose: () => void }) {
  return <CorpusDialog className="cr-join-success" labelledBy="cr-join-success-title" onClose={onClose}>
    <CircleCheckBig className="cr-success-icon" size={72} strokeWidth={2.2} />
    <h2 id="cr-join-success-title">申请已发送至管理员</h2>
    <p>请等待审核，审核结果可在<br />导航栏右侧的消息中心查看</p>
    <footer><button type="button" onClick={onClose}>关闭</button><button className="is-primary" type="button" onClick={onClose}>知道了</button></footer>
  </CorpusDialog>
}
