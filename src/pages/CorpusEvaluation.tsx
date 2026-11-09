import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useApp } from '../context/app-context'
import template from './evaluation/evaluation-template.html?raw'
import prototypeStyles from './evaluation/evaluation-demo.css?inline'
import platformStyles from './evaluation/evaluation-platform.css?inline'
import { mountEvaluation } from './evaluation/evaluation-demo.js'
import './evaluation/evaluation-shell.css'

export default function CorpusEvaluation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { user, openAuth } = useApp()
  const userRef = useRef(user)
  const navigate = useNavigate()
  const { datasetId } = useParams()
  const [searchParams] = useSearchParams()
  const benchmarkId = searchParams.get('benchmark') || undefined
  useEffect(() => { userRef.current = user }, [user])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Isolate the supplied demo's styles and selectors from existing pages.
    const root = container.shadowRoot ?? container.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = prototypeStyles + '\n' + platformStyles
    root.innerHTML = template
    root.prepend(style)
    container.style.setProperty(
      '--evaluation-hero-image',
      `url("${import.meta.env.BASE_URL}images/search-hero-reference.png")`,
    )

    const previousTitle = document.title
    document.title = '语料评测 · 科学语料平台'
    const unmount = mountEvaluation(root, import.meta.env.BASE_URL, {
      detailId: datasetId,
      benchmarkId,
      onUpload: () => userRef.current ? navigate('/evaluation/upload') : openAuth('/evaluation/upload'),
      onDetail: id => { navigate(`/evaluation/datasets/${encodeURIComponent(id)}`); window.scrollTo(0,0) },
      onBack: () => navigate('/evaluation'),
      onLeaderboard: id => { navigate(`/evaluation?benchmark=${encodeURIComponent(id)}`); window.scrollTo(0,0) },
    })

    return () => {
      unmount()
      root.replaceChildren()
      document.title = previousTitle
    }
  }, [datasetId, benchmarkId, navigate, openAuth])

  return <div className="corpus-evaluation-page" ref={containerRef} aria-label="语料评测" />
}
