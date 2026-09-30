import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, ChevronLeft, ClipboardList, FileText, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react'
import DemandDraftThumbnail from '../components/DemandDraftThumbnail'
import { loadDrafts, removeDraft, type DemandDraft } from '../data/demand-drafts'
import { saveDemandEditorImages } from '../data/demand-editor-transfer'

export default function DemandCreate() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [drafts, setDrafts] = useState<DemandDraft[]>(loadDrafts)
  const [showDrafts, setShowDrafts] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DemandDraft | null>(null)

  const confirmDelete = () => {
    if (!deleteTarget) return
    removeDraft(deleteTarget.id)
    refreshDrafts()
    setDeleteTarget(null)
  }

  const refreshDrafts = () => setDrafts(loadDrafts())

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      saveDemandEditorImages([{
        id: `img-upload-${Date.now()}`,
        kind: 'upload',
        src: String(reader.result),
      }])
      navigate('/demands/new/edit')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <div className="demand-create-page">
      <section className="demand-create-hero">
        <div className="demand-create-hero-copy">
          <button className="demand-create-back" type="button" aria-label="返回需求广场首页" onClick={() => navigate('/demands')}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1>生成需求图片</h1>
            <p>选择适合的图片制作方式，完成需求发布前的视觉内容</p>
          </div>
        </div>
        <button className="demand-create-drafts-btn" type="button" onClick={() => setShowDrafts(true)}>
          <ClipboardList size={18} />
          草稿箱 {drafts.length}
        </button>
      </section>

      <section className="demand-create-stage">
        <div className="demand-create-upload-zone">
          <span className="demand-create-image-slot"><ImageIcon size={54} /><Upload className="demand-create-upload-icon" size={25} /></span>
          <p>上传图片，或生成文字图片</p>
          <div className="demand-create-actions">
            <button className="demand-create-upload" type="button" onClick={() => fileRef.current?.click()}>上传图片</button>
            <button className="demand-create-generate" type="button" onClick={() => navigate('/demands/new/poster')}>
              <FileText size={16} />
              生成文字图片
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>
        <footer className="demand-create-tips">
          <article>
            <h3>图片比例</h3>
            <p>推荐 4:3 比例，优选 1200×900px；分辨率720px以上，更适配需求广场展示</p>
          </article>
          <article>
            <h3>图片格式</h3>
            <p>支持上传的图片格式：png、jpg、jpeg、webp；不支持 gif 格式</p>
          </article>
          <article>
            <h3>内容规范</h3>
            <p>请勿上传无关、水印或侵权图片</p>
          </article>
        </footer>
      </section>

      {showDrafts && (
        <div className="demand-modal-backdrop" role="presentation" onMouseDown={() => setShowDrafts(false)}>
          <section className="demand-draft-modal demand-create-draft-modal" role="dialog" aria-modal="true" aria-labelledby="demand-create-drafts-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="demand-modal-close" type="button" aria-label="关闭草稿箱" onClick={() => setShowDrafts(false)}><X /></button>
            <h2 id="demand-create-drafts-title">草稿箱</h2>
            {drafts.length ? drafts.map((draft) => (
              <article key={draft.id}>
                <DemandDraftThumbnail />
                <div className="demand-create-draft-copy">
                  <h3>{draft.corpusName}</h3>
                  <p>保存于 {draft.savedAt}</p>
                </div>
                <div className="demand-create-draft-actions">
                  <button type="button" onClick={() => navigate('/demands/new/edit')}>继续编辑</button>
                  <button type="button" onClick={() => setDeleteTarget(draft)}><Trash2 size={15} />删除</button>
                </div>
              </article>
            )) : <div className="demand-create-draft-empty" aria-label="暂无草稿" />}
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="demand-modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section className="demand-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="demand-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="demand-confirm-mark"><AlertCircle size={14} /></span>
            <h2 id="demand-confirm-title">草稿删除后不可找回</h2>
            <div className="demand-confirm-actions">
              <button className="demand-confirm-cancel" type="button" onClick={() => setDeleteTarget(null)}>取消</button>
              <button className="demand-confirm-primary" type="button" onClick={confirmDelete}>删除</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
