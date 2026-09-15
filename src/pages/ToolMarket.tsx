import { useMemo, useState } from 'react'
import { Search, X, LayoutGrid } from 'lucide-react'
import toolMarketData from '../data/tool-market.json'
import './tool-market-v2.css'

type Subject = '数学' | '物理' | '化学' | '天文' | '地理' | '生物'

type ToolRecord = {
  id: string
  subject: Subject
  name: string
  description: string
  sourceSheet: string
  sourceRow: number
}

const tools = toolMarketData as ToolRecord[]
const subjects: Array<'全部工具' | Subject> = ['全部工具', '数学', '物理', '化学', '天文', '地理', '生物']
const suggestedKeywords = ['实验', '训练', '抽取', '图像', '对齐', '标注']
const PAGE_SIZE = 12

// 方案C-几何现代 图标
const subjectIconPaths: Record<Subject, string> = {
  数学: 'M18 4H6l6 8-6 8h12',
  物理: 'M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5zM15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z',
  化学: 'M6 18h12M10 3h4M10 3v6l-4 9h12l-4-9V3',
  天文: 'M12 3a6 6 0 0 0-6 6c0 1.5.5 3 1.5 4l-4 7h17l-4-7c1-1 1.5-2.5 1.5-4a6 6 0 0 0-6-6zM12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  地理: 'M12 12a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20',
  生物: 'M6 3v6c0 1.5 1 3 2 4l4 3-4 3c-1 1-2 2.5-2 4v2h12v-2c0-1.5-1-3-2-4l-4-3 4-3c1-1 2-2.5 2-4V3M8 7h8M8 17h8',
}

const subjectStyle: Record<Subject, { gradient: string; tagBg: string; tagText: string }> = {
  数学: { gradient: 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%)', tagBg: '#f3e8ff', tagText: '#9333ea' },
  物理: { gradient: 'linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%)', tagBg: '#e0e7ff', tagText: '#4f46e5' },
  化学: { gradient: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 100%)', tagBg: '#cffafe', tagText: '#0891b2' },
  天文: { gradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)', tagBg: '#ede9fe', tagText: '#7c3aed' },
  地理: { gradient: 'linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)', tagBg: '#dcfce7', tagText: '#16a34a' },
  生物: { gradient: 'linear-gradient(135deg, #f5d0fe 0%, #e879f9 100%)', tagBg: '#fae8ff', tagText: '#c026d3' },
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightKeyword(text: string, keyword: string) {
  const searchTerm = keyword.trim()
  if (!searchTerm) return text

  const normalizedSearchTerm = searchTerm.toLocaleLowerCase('zh-CN')
  const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'))

  return parts.map((part, index) => {
    if (part.toLocaleLowerCase('zh-CN') !== normalizedSearchTerm) return part
    return (
      <mark className="tool-search-highlight" key={`${part}-${index}`}>
        {part}
      </mark>
    )
  })
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ToolMarket() {
  const [subject, setSubject] = useState<(typeof subjects)[number]>('全部工具')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const normalizedKeyword = keyword.trim().toLocaleLowerCase('zh-CN')

  const keywordMatchedTools = useMemo(() => {
    return tools.filter((tool) => {
      const keywordMatched = !normalizedKeyword || [tool.name, tool.description, tool.subject]
        .some((value) => value.toLocaleLowerCase('zh-CN').includes(normalizedKeyword))
      return keywordMatched
    })
  }, [normalizedKeyword])

  const subjectCounts = useMemo(() => {
    const counts = new Map<string, number>([['全部工具', keywordMatchedTools.length]])
    subjects.slice(1).forEach((item) => {
      counts.set(item, keywordMatchedTools.filter((tool) => tool.subject === item).length)
    })
    return counts
  }, [keywordMatchedTools])

  const filteredTools = useMemo(() => {
    let result = keywordMatchedTools
    if (subject !== '全部工具') {
      result = result.filter((tool) => tool.subject === subject)
    } else {
      // 全部工具时随机混排
      result = shuffleArray(result)
    }
    return result
  }, [keywordMatchedTools, subject])

  const pageCount = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE))
  const pageTools = filteredTools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const chooseSubject = (nextSubject: (typeof subjects)[number]) => {
    setSubject(nextSubject)
    setPage(1)
  }

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setKeyword(keywordInput.trim())
    setPage(1)
  }

  const clearSearch = () => {
    setKeywordInput('')
    setKeyword('')
    setPage(1)
  }

  const searchSuggestedKeyword = (nextKeyword: string) => {
    setKeywordInput(nextKeyword)
    setKeyword(nextKeyword)
    setPage(1)
  }

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), pageCount))
    document.querySelector('.tool-market-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 计算显示的页码范围（最多5个，不显示尾页）
  const getVisiblePages = () => {
    let start = Math.max(1, page - 2)
    let end = Math.min(pageCount, start + 4)
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="tool-market-page">
      <section className="tool-market-hero">
        <div className="tool-market-hero-inner">
          <span className="tool-market-hero-kicker">六大学科语料加工工具汇聚平台</span>
          <h1><span className="tool-market-title-accent">工具链</span>市场</h1>
          <p>汇聚六大学科语料加工工具，服务科学语料采集、解析、清洗、标注、对齐与质量评估</p>

          <form className="tool-market-search" onSubmit={submitSearch} role="search">
            <Search aria-hidden="true" />
            <input
              aria-label="搜索工具链"
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="搜索工具链"
              type="search"
              value={keywordInput}
            />
            {keywordInput && (
              <button className="tool-market-search-clear" type="button" onClick={clearSearch} aria-label="清空搜索">
                <X aria-hidden="true" />
              </button>
            )}
            <button className="tool-market-search-submit" type="submit">搜索</button>
          </form>

          <div className="tool-search-suggestions" aria-label="建议检索词">
            {suggestedKeywords.map((item) => (
              <button
                className={keyword === item ? 'is-active' : ''}
                key={item}
                onClick={() => searchSuggestedKeyword(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="tool-market-content">
        <aside className="tool-subject-sidebar" aria-label="按学科领域筛选">
          <h2>
            <LayoutGrid aria-hidden="true" />
            按学科领域
          </h2>
          <div className="tool-subject-list">
            {subjects.map((item) => (
              <button
                className={subject === item ? 'is-active' : ''}
                key={item}
                onClick={() => chooseSubject(item)}
                type="button"
              >
                <span>{item}</span>
                <small>{subjectCounts.get(item) ?? 0}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="tool-results-panel">
          <header className="tool-results-header">
            <div>
              <h2>{subject === '全部工具' ? '全部工具' : subject}</h2>
              <p>共收录 <strong>{filteredTools.length}</strong> 条工具链</p>
            </div>
          </header>

          {pageTools.length > 0 ? (
            <div className="tool-card-grid">
              {pageTools.map((tool) => {
                const style = subjectStyle[tool.subject]
                return (
                  <article
                    className="tool-market-card"
                    key={tool.id}
                    tabIndex={0}
                  >
                    <div className="tool-card-heading">
                      <span className="tool-card-icon" style={{ background: style.gradient }}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d={subjectIconPaths[tool.subject]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="tool-card-meta">
                        <h3>{highlightKeyword(tool.name, keyword)}</h3>
                        <span
                          className="tool-subject-tag"
                          style={{ background: style.tagBg, color: style.tagText }}
                        >
                          {tool.subject}
                        </span>
                      </div>
                    </div>
                    <div className="tool-card-description">
                      <strong>处理场景</strong>
                      <p>{highlightKeyword(tool.description, keyword)}</p>
                    </div>

                    <div className="tool-card-hover-detail" role="tooltip">
                      <div className="tool-card-hover-title">
                        <strong>{highlightKeyword(tool.name, keyword)}</strong>
                        <span style={{ background: style.tagBg, color: style.tagText }}>{tool.subject}</span>
                      </div>
                      <p>{highlightKeyword(tool.description, keyword)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="tool-market-empty">
              <Search aria-hidden="true" />
              <h3>暂未找到符合条件的工具链</h3>
              <p>请尝试更换关键词</p>
              <button type="button" onClick={clearSearch}>清空搜索</button>
            </div>
          )}

          {filteredTools.length > PAGE_SIZE && (
            <nav className="tool-market-pagination" aria-label="工具链分页">
              <button disabled={page === 1} onClick={() => goToPage(page - 1)} type="button">上一页</button>
              {getVisiblePages().map((pageNumber) => (
                <button
                  aria-current={page === pageNumber ? 'page' : undefined}
                  className={page === pageNumber ? 'is-active' : ''}
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ))}
              <button disabled={page === pageCount} onClick={() => goToPage(page + 1)} type="button">下一页</button>
            </nav>
          )}
        </div>
      </section>

    </div>
  )
}
