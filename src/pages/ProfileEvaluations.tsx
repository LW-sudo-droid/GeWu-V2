import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import prototypeStyles from './evaluation/evaluation-demo.css?inline'
import platformStyles from './evaluation/evaluation-platform.css?inline'
import { mountEvaluation } from './evaluation/evaluation-demo.js'

const profileStyles = `
  .profile-evaluation-cards { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; grid-template-columns: repeat(2,minmax(0,1fr)); }
  .catalog-upload-status { color: #6257c0; font-size: 11px; }
  @media (max-width: 620px) { .profile-evaluation-cards { grid-template-columns: 1fr; } }
`

export default function ProfileEvaluations({ account, collection }: {
  account: string
  collection: 'uploaded' | 'favorite'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const root = container.shadowRoot ?? container.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = prototypeStyles + '\n' + platformStyles + '\n' + profileStyles
    const grid = document.createElement('div')
    grid.id = 'profileEvaluationCards'
    grid.className = 'catalog profile-evaluation-cards'
    root.replaceChildren(style, grid)

    const unmount = mountEvaluation(root, import.meta.env.BASE_URL, {
      account,
      profile: {
        collection,
        onDetail: id => collection === 'uploaded'
          ? navigate('/evaluation/upload?record=' + encodeURIComponent(id))
          : navigate('/evaluation/datasets/' + encodeURIComponent(id), { state: { fromProfileEvaluations: true } }),
      },
    })

    return () => {
      unmount()
      root.replaceChildren()
    }
  }, [account, collection, navigate])

  return <div ref={containerRef} />
}
