import { useRef, useState } from 'react'
import { Info } from 'lucide-react'
import CorpusDialog from './CorpusDialog'
import CorpusRequestSuccessDialog from './CorpusRequestSuccessDialog'
import type { MemberPermission } from '../data/corpus-members'

export default function CorpusJoinDialog({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (permission: MemberPermission, remark: string) => boolean }) {
  const [permission, setPermission] = useState<MemberPermission>('可上传')
  const [remark, setRemark] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submitting = useRef(false)
  if (submitted) return <CorpusRequestSuccessDialog onClose={onCancel} />
  return <CorpusDialog title="申请加入语料库" className="cr-join-dialog" onClose={onCancel}>
    <form className="cr-form" onSubmit={(event) => { event.preventDefault(); if (submitting.current) return; submitting.current = true; try { if (onSubmit(permission, remark.trim())) setSubmitted(true) } finally { submitting.current = false } }}>
      <div className="cr-form-body">
        <div className="cr-field"><div className="cr-join-label"><label htmlFor="cr-join-permission">申请权限 <b>*</b></label><span><Info size={15} />当前账号未加入语料库，你可以向管理员申请权限</span></div><select id="cr-join-permission" aria-required="true" value={permission} onChange={(event) => setPermission(event.target.value as MemberPermission)}><option>可上传</option><option>可管理</option></select></div>
        <div className="cr-field"><label htmlFor="cr-join-remark">备注</label><textarea id="cr-join-remark" maxLength={1000} value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="添加备注（选填）" /></div>
      </div>
      <footer className="cr-footer"><button type="button" onClick={onCancel}>取消</button><button className="is-primary" type="submit">提交申请</button></footer>
    </form>
  </CorpusDialog>
}
