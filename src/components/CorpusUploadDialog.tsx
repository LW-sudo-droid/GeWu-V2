import { useRef, useState } from 'react'
import DatasetUploadModule from './DatasetUploadModule'
import CorpusDialog from './CorpusDialog'
import CorpusRequestSuccessDialog from './CorpusRequestSuccessDialog'
import { emptyUploadSection, type UploadSectionState } from '../data/dataset-upload'
import '../pages/dataset-edit.css'

export type CorpusUploadSubmission = { license: string; remark: string; content: string; source: string; files: { name: string; size: number }[] }
type Errors = { license?: string; remark?: string; data?: string; agreement?: string }
const licenses = ['CC0（完全开放无版权限制）', 'CC BY 4.0 保留作者署名', 'CC BY-SA 4.0 保留作者署名并以相同方式共享', 'CC BY-NC 4.0 保留作者署名并禁止商业使用', 'CC BY-NC-SA 4.0 保留作者署名、非商业使用、相同方式共享', 'CC BY-ND 4.0 保留作者署名并禁止演绎', 'CC BY-NC-ND 4.0 保留作者署名、非商业使用、禁止演绎']

export default function CorpusUploadDialog({ corpusId, onCancel, onSubmit, notify }: { corpusId: string; onCancel: () => void; onSubmit: (values: CorpusUploadSubmission) => boolean; notify: (message: string) => void }) {
  const [license, setLicense] = useState('')
  const [remark, setRemark] = useState('')
  const [upload, setUpload] = useState<UploadSectionState>(emptyUploadSection)
  const [agreement, setAgreement] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [attempted, setAttempted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const dataError = () => {
    if (upload.mode === 'local') {
      if (!upload.files.length) return '请上传数据'
      if (upload.files.some((file) => file.status === 'uploading')) return '文件正在上传，请等待完成'
      if (upload.files.some((file) => file.status === 'error')) return '存在上传失败的文件，请重试或删除'
    } else if (upload.mode === 'link' && !(upload.linkKind === 'github' ? upload.githubUrl : upload.remoteUrl).trim()) return '请输入要导入的数据链接'
    else if (upload.mode === 'cli') return '请先通过命令行完成上传，上传任务将进入审批列表'
    return undefined
  }
  const currentDataError = attempted ? dataError() : undefined
  if (submitted) return <CorpusRequestSuccessDialog onClose={onCancel} />
  return <CorpusDialog title="上传语料" className="cr-upload-dialog" onClose={onCancel}>
    <form className="cr-form" ref={form} noValidate onSubmit={(event) => {
      event.preventDefault()
      if (submitting.current) return
      const next = { license: !license ? '请选择协议' : undefined, remark: !remark.trim() ? '请填写备注' : undefined, data: dataError(), agreement: !agreement ? '如果要继续，请选中此复选框' : undefined }
      setErrors(next); setAttempted(true)
      if (Object.values(next).some(Boolean)) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return }
      submitting.current = true
      try { if (onSubmit({ license, remark: remark.trim(), content: upload.mode === 'local' ? '本地文件' : upload.linkKind === 'github' ? 'GitHub仓库' : '数据URL', source: upload.mode === 'local' ? upload.files.map((file) => file.name).join('；') : (upload.linkKind === 'github' ? upload.githubUrl : upload.remoteUrl).trim(), files: upload.mode === 'local' ? upload.files.map(({ name, size }) => ({ name, size })) : [] })) setSubmitted(true) } finally { submitting.current = false }
    }}>
      <div className="cr-form-body">
        <div className="cr-field"><label htmlFor="cr-upload-license">许可协议 <b>*</b></label><select id="cr-upload-license" value={license} aria-required="true" aria-invalid={Boolean(errors.license)} aria-describedby={errors.license ? 'cr-license-error' : undefined} onChange={(event) => { setLicense(event.target.value); setErrors((current) => ({ ...current, license: undefined })) }}><option value="" disabled>请选择许可协议</option>{licenses.map((value) => <option key={value}>{value}</option>)}</select>{errors.license && <p id="cr-license-error" className="cr-field-error" role="alert">{errors.license}</p>}</div>
        <div className="cr-field"><label htmlFor="cr-upload-remark">备注 <b>*</b></label><textarea id="cr-upload-remark" maxLength={1000} value={remark} aria-required="true" aria-invalid={Boolean(errors.remark)} aria-describedby={errors.remark ? 'cr-remark-error' : undefined} onChange={(event) => { setRemark(event.target.value); if (event.target.value.trim()) setErrors((current) => ({ ...current, remark: undefined })) }} placeholder="请填写本次上传内容说明、数据来源或变更备注" />{errors.remark && <p id="cr-remark-error" className="cr-field-error" role="alert">{errors.remark}</p>}</div>
        <div className={`cr-upload-data${currentDataError ? ' is-invalid' : ''}`} role="group" aria-label="上传数据" aria-invalid={Boolean(currentDataError)} aria-describedby={currentDataError ? 'cr-data-error' : undefined} tabIndex={-1}>
          <DatasetUploadModule title="上传数据" required state={upload} onChange={setUpload} notify={notify} corpusId={corpusId} />
          {currentDataError && <p id="cr-data-error" className="cr-field-error" role="alert">{currentDataError}</p>}
        </div>
        <div className="cr-agreement"><label><input type="checkbox" checked={agreement} aria-required="true" aria-invalid={Boolean(errors.agreement)} aria-describedby={errors.agreement ? 'cr-agreement-error' : undefined} onChange={(event) => { setAgreement(event.target.checked); setErrors((current) => ({ ...current, agreement: undefined })) }} /><span>我已确认上传内容符合许可协议及平台合规要求 <b>*</b></span></label>{errors.agreement && <div id="cr-agreement-error" className="cr-agreement-hint" role="alert">{errors.agreement}</div>}</div>
      </div>
      <footer className="cr-footer"><button type="button" onClick={onCancel}>取消</button><button className="is-primary" type="submit">提交审核</button></footer>
    </form>
  </CorpusDialog>
}
