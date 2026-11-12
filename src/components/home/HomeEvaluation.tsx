import { ArrowRight, Atom, ChevronRight, Dna, FlaskConical, Layers3, Orbit, Sigma, Sparkles, Trophy, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import featuredResults from '../../data/evaluation-featured-results.json'
import './home-evaluation.css'

const datasets = [
  { id: 'phybench', name: 'PHYBench', description: '物理 · 多步物理推理', icon: Atom, tone: 'violet' },
  { id: 'astro', name: 'AstroMMBench', description: '天文 · 天文图像理解', icon: Orbit, tone: 'blue' },
  { id: 'bixbench', name: 'BixBench3', description: '生物 · 生物数据分析', icon: Dna, tone: 'cyan' },
]

const boards = [
  { id: 'phybench', name: 'PHYBench', icon: Atom },
  { id: 'chembench', name: 'ChemBench', icon: FlaskConical },
  { id: 'aime', name: 'AIME 2025', icon: Sigma },
] as const

const modelMarks = [
  { pattern: /^gemini/i, file: 'gemini.svg' },
  { pattern: /^(?:gpt-|o[134](?:[- (]|$))/i, file: 'openai.svg' },
  { pattern: /^meta-llama\//i, file: 'meta.svg' },
  { pattern: /^kimi/i, file: 'kimi.svg' },
  { pattern: /^grok/i, file: 'xai.svg' },
]

export default function HomeEvaluation() {
  const [board, setBoard] = useState<keyof typeof featuredResults>('phybench')
  const { rows, decimals, scale, unit } = featuredResults[board]
  const topModels = [...rows].sort((a, b) => b.score - a.score).slice(0, 3)

  return (
    <section id="home-evaluation" className="home-evaluation" aria-labelledby="home-evaluation-title">
      <div className="home-evaluation-inner">
        <header className="home-evaluation-heading">
          <h2 id="home-evaluation-title">探索<span className="text-gradient-alt">科学评测</span></h2>
          <div className="home-evaluation-actions">
            <Link className="home-btn-dark" to="/evaluation">进入语料评测<ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="home-btn-gradient" to="/evaluation/upload"><Upload size={18} aria-hidden="true" />上传评测集</Link>
          </div>
        </header>

        <div className="home-evaluation-grid">
          <section className="home-evaluation-panel" aria-labelledby="home-evaluation-datasets">
            <header className="home-evaluation-panel-heading">
              <span className="home-evaluation-symbol"><Layers3 size={26} aria-hidden="true" /></span>
              <div>
                <h3 id="home-evaluation-datasets">科学评测集</h3>
                <p>按学科查找评测资源</p>
              </div>
            </header>
            <ul className="home-evaluation-rows">
              {datasets.map(({ id, name, description, icon: Icon, tone }) => (
                <li key={id}>
                  <Link className="home-evaluation-row home-evaluation-dataset" to={`/evaluation/datasets/${id}`}>
                    <span className={`home-evaluation-dataset-icon is-${tone}`}><Icon size={24} aria-hidden="true" /></span>
                    <span><strong>{name}</strong><small>{description}</small></span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <footer><Link to="/evaluation">浏览全部评测集<ArrowRight size={17} aria-hidden="true" /></Link></footer>
          </section>

          <section className="home-evaluation-panel" aria-labelledby="home-evaluation-leaderboard">
            <header className="home-evaluation-panel-heading">
              <span className="home-evaluation-symbol is-blue"><Trophy size={26} aria-hidden="true" /></span>
              <div>
                <h3 id="home-evaluation-leaderboard">评测榜单</h3>
                <div className="home-evaluation-switch" role="group" aria-label="选择预览榜单">
                  {boards.map(({ id, name, icon: Icon }) => (
                    <button key={id} type="button" aria-pressed={board === id} onClick={() => setBoard(id)}>
                      <Icon size={15} aria-hidden="true" />{name}
                    </button>
                  ))}
                </div>
              </div>
            </header>
            <ol className="home-evaluation-rows" aria-label={`${boards.find(item => item.id === board)?.name} 榜单预览`} aria-live="polite">
              {topModels.map(({ name, score }) => {
                const logo = modelMarks.find(({ pattern }) => pattern.test(name))
                const rank = topModels.findIndex(model => model.score === score) + 1
                return (
                  <li className={`home-evaluation-row home-evaluation-model${rank === 1 ? ' is-first' : ''}`} key={name}>
                    <span className="home-evaluation-rank">
                      {String(rank).padStart(2, '0')}
                      {rank === 1 && <Sparkles size={13} aria-hidden="true" />}
                    </span>
                    <span className="home-evaluation-model-name">
                      {logo && <span className="home-evaluation-logo"><img src={`${import.meta.env.BASE_URL}images/evaluation-models/${logo.file}`} alt="" /></span>}
                      <strong title={name}>{name}</strong>
                    </span>
                    <span className="home-evaluation-score">
                      <strong>{score.toFixed(decimals)}{unit === '%' ? '%' : ''}</strong>
                      <span className="home-evaluation-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, score / scale * 100))}%` }} /></span>
                    </span>
                  </li>
                )
              })}
            </ol>
            <footer><Link to={`/evaluation?benchmark=${board}`}>查看完整榜单<ArrowRight size={17} aria-hidden="true" /></Link></footer>
          </section>
        </div>
      </div>
    </section>
  )
}
