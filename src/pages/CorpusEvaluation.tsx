import { useEffect, useRef } from 'react'
import template from './evaluation/evaluation-template.html?raw'
import prototypeStyles from './evaluation/evaluation-demo.css?inline'
import platformStyles from './evaluation/evaluation-platform.css?inline'
import { mountEvaluation } from './evaluation/evaluation-demo.js'

export default function CorpusEvaluation() {
  const containerRef = useRef<HTMLDivElement>(null)

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
    const unmount = mountEvaluation(root, import.meta.env.BASE_URL)

    return () => {
      unmount()
      root.replaceChildren()
      document.title = previousTitle
    }
  }, [])

  return <div ref={containerRef} aria-label="语料评测" />
}
