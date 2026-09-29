import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import DemandDraftThumbnail from '../components/DemandDraftThumbnail'
import { loadDrafts, removeDraft, type DemandDraft } from '../data/demand-drafts'

type TextPoster = {
  id: string
  template: number
  title: string
  subtitle: string
}

type PosterTemplate = { kind: 'color' | 'image'; value: string }

const posterThemes: PosterTemplate[] = [
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-wave.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #dfe9ff, #cfd9ff 55%, #dff0ff)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-stack.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #e0f4ee, #cfeee9 55%, #e7f6ff)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-panel.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #e8e4fb, #d4cdf7 55%, #dff0ff)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-orbit.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #fdeede, #fbdcc0 55%, #fff2e3)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-cube.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #f3e3f8, #e6cef2 55%, #fff0f6)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-crystal.png' },
  { kind: 'color', value: 'linear-gradient(135deg, #d9ecfb, #bfe0fa 55%, #e7f4ff)' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-sphere.png' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-dna.png' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-molecule.png' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-space.png' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-math.png' },
  { kind: 'image', value: 'images/demand-market/poster-tech/tech-plant.png' },
]

const initialTemplateOrder = posterThemes.map((_, index) => index)

function shuffleTemplateOrder() {
  const next = [...initialTemplateOrder]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function templateStyle(template: PosterTemplate) {
  return template.kind === 'image'
    ? { backgroundImage: `url(${import.meta.env.BASE_URL}${template.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: template.value }
}

export default function DemandPosterMaker() {
  const navigate = useNavigate()
  const [posters, setPosters] = useState<TextPoster[]>([
    { id: 'poster-1', template: 0, title: '', subtitle: '' },
  ])
  const [activeIndex, setActiveIndex] = useState(0)
  const [toast, setToast] = useState('')
  const [drafts, setDrafts] = useState<DemandDraft[]>(loadDrafts)
  const [showDrafts, setShowDrafts] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DemandDraft | null>(null)
  const [templateOrder, setTemplateOrder] = useState(initialTemplateOrder)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)

  const flashToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const updatePoster = (index: number, patch: Partial<TextPoster>) => {
    setPosters((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addBlank = () => {
    setPosters((current) => [...current, { id: `poster-${current.length + 1}`, template: 0, title: '', subtitle: '' }])
    setActiveIndex(posters.length)
  }

  const removePoster = (id: string) => {
    setPosters((current) => {
      const next = current.filter((item) => item.id !== id)
      setActiveIndex((prev) => Math.min(prev, next.length - 1))
      return next
    })
  }

  const confirmRemovePoster = () => {
    if (!removeTargetId) return
    if (posters.length <= 1) {
      flashToast('至少保留一张海报')
    } else {
      removePoster(removeTargetId)
    }
    setRemoveTargetId(null)
  }

  const confirmDeleteDraft = () => {
    if (!deleteTarget) return
    removeDraft(deleteTarget.id)
    setDrafts(loadDrafts())
    setDeleteTarget(null)
  }

  const resetPosters = () => {
    setPosters([{ id: `poster-${Date.now()}`, template: 0, title: '', subtitle: '' }])
    setActiveIndex(0)
    setRemoveTargetId(null)
    flashToast('已重置模板')
  }

  const generate = () => {
    flashToast('文字海报已生成')
    window.setTimeout(() => navigate('/demands/new/edit'), 600)
  }

  return (
    <div className="demand-create-page demand-poster-maker-page">
      <section className="demand-create-hero">
        <div className="demand-create-hero-copy">
          <button className="demand-create-back" type="button" aria-label="返回生成需求图片" onClick={() => navigate('/demands/new')}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1>生成文字图片</h1>
            <p>输入画面文字描述，右侧挑选心仪的风格模板</p>
          </div>
        </div>
        <button className="demand-create-drafts-btn" type="button" onClick={() => setShowDrafts(true)}>
          <ClipboardList size={18} />
          草稿箱 {drafts.length}
        </button>
      </section>

      <section className="demand-create-stage poster-maker-stage">
        <div className="poster-maker-layout">
          <div className="poster-maker-preview-col">
            <div className="poster-maker-stack">
              {activeIndex > 0 && (
                <button className="poster-maker-switch is-left" type="button" aria-label="上一张" onClick={() => setActiveIndex((index) => index - 1)}>
                  <ChevronLeft size={20} />
                </button>
              )}
              {activeIndex < posters.length - 1 && (
                <button className="poster-maker-switch is-right" type="button" aria-label="下一张" onClick={() => setActiveIndex((index) => index + 1)}>
                  <ChevronRight size={20} />
                </button>
              )}
              <div className="poster-maker-track" style={{ transform: `translateX(${-activeIndex * 100}%)` }}>
                {posters.map((item, index) => (
                  <div className={`poster-maker-slide${index === activeIndex ? ' is-active' : ''}`} key={item.id}>
                    <button className="poster-maker-remove" type="button" aria-label="删除图片" onClick={() => setRemoveTargetId(item.id)}>
                      <Trash2 size={14} />
                    </button>
                    {removeTargetId === item.id && (
                      <div className="poster-remove-bubble" role="dialog" aria-label="确认删除图片">
                        <p>图片删除后不可找回</p>
                        <div>
                          <button className="poster-remove-cancel" type="button" onClick={() => setRemoveTargetId(null)}>取消</button>
                          <button className="poster-remove-confirm" type="button" onClick={confirmRemovePoster}>删除</button>
                        </div>
                      </div>
                    )}
                    <div className={`poster-preview${posterThemes[item.template].kind === 'image' ? ' is-image' : ''}`} style={templateStyle(posterThemes[item.template])}>
                      <textarea
                        className="poster-preview-title"
                        rows={3}
                        maxLength={40}
                        placeholder="点击输入：邀请感兴趣的朋友一起共建语料库"
                        value={item.title}
                        onChange={(event) => updatePoster(index, { title: event.target.value })}
                      />
                      <textarea
                        className="poster-preview-sub"
                        rows={1}
                        maxLength={60}
                        placeholder="点击输入简单介绍你的设想"
                        value={item.subtitle}
                        onChange={(event) => updatePoster(index, { subtitle: event.target.value })}
                      />
                      <div className="poster-preview-dots" aria-hidden="true">
                        <i className="is-active" />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="poster-maker-new" type="button" onClick={addBlank}>
              <span><Plus size={20} /></span>
              再写一张
            </button>
          </div>

          <div className="poster-maker-side">
            <div className="poster-maker-side-head">
              <h3>选择一款喜欢的模板</h3>
              <button className="poster-maker-refresh" type="button" onClick={() => setTemplateOrder(shuffleTemplateOrder())}><RefreshCw size={16} />换一批</button>
            </div>
            <div className="poster-template-grid">
              {templateOrder.map((index) => (
                <button
                  className={index === posters[activeIndex].template ? 'is-active' : ''}
                  key={index}
                  style={templateStyle(posterThemes[index])}
                  type="button"
                  aria-label={`模板 ${index + 1}`}
                  onClick={() => updatePoster(activeIndex, { template: index })}
                />
              ))}
            </div>
            <div className="poster-maker-actions">
              <button className="poster-maker-reset" type="button" onClick={resetPosters}>重置</button>
              <button className="poster-maker-submit" type="button" onClick={generate}>生成海报</button>
            </div>
          </div>
        </div>
      </section>

      {showDrafts && (
        <div className="demand-modal-backdrop" role="presentation" onMouseDown={() => setShowDrafts(false)}>
          <section className="demand-draft-modal demand-create-draft-modal" role="dialog" aria-modal="true" aria-labelledby="poster-maker-drafts-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="demand-modal-close" type="button" aria-label="关闭草稿箱" onClick={() => setShowDrafts(false)}><X /></button>
            <h2 id="poster-maker-drafts-title">草稿箱</h2>
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
          <section className="demand-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="poster-maker-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="demand-confirm-mark"><AlertCircle size={14} /></span>
            <h2 id="poster-maker-confirm-title">草稿删除后不可找回</h2>
            <div className="demand-confirm-actions">
              <button className="demand-confirm-cancel" type="button" onClick={() => setDeleteTarget(null)}>取消</button>
              <button className="demand-confirm-primary" type="button" onClick={confirmDeleteDraft}>删除</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="demand-toast">{toast}</div>}
    </div>
  )
}
