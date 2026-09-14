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

const subjectIconPaths: Record<Subject, string> = {
  数学: 'M4.75 3.5h14.5v1.3H4.75V3.5Zm1.85 5.2h2.65l2.1 4.55 2.1-4.55h2.65l-4.55 9.6h-1.85L6.6 8.7Zm10.2 0h2.35v9.6h-2.35V8.7Z',
  物理: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-2.9 4.2a.75.75 0 1 0-1.2.9l1.2-.9Zm2.9 1.8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm0 1.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Zm4.35-3.6a.75.75 0 1 0-1.2.9l1.2-.9Z',
  化学: 'M12 4.5a1.5 1.5 0 0 1 1.5 1.5h-3A1.5 1.5 0 0 1 12 4.5Zm-3 2.25h6v.75h-6v-.75Zm.75 1.5h4.5l.75 6.75c.15 1.2-.75 2.25-1.95 2.25h-2.1c-1.2 0-2.1-1.05-1.95-2.25l.75-6.75Zm1.65 8.25h1.2v-6h-1.2v6Z',
  天文: 'M12 3a6 6 0 0 0-5.92 5.02 4.5 4.5 0 0 0-.08 8.48h12a4.5 4.5 0 0 0-.08-8.48A6 6 0 0 0 12 3Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-3 10.5h6v1.5H9v-1.5Z',
  地理: 'M12 2.25a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm0 1.5a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Zm0 3a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 1.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z',
  生物: 'M12 3.75c-2.9 0-5.25 2.1-5.25 5.25 0 1.65.75 3.15 2.1 4.05-.45 1.2-1.35 2.1-2.55 2.55-.3.15-.45.45-.3.75.15.3.45.45.75.3 1.65-.6 2.85-1.8 3.45-3.45.15.015.3 0 .45 0h1.5c1.65 1.65 3.45 2.55 5.25 2.55.3 0 .6-.15.6-.45s-.3-.45-.6-.45c-1.5 0-2.85-.6-4.05-1.65-.75-.75-1.35-1.65-1.8-2.7 1.05-.9 1.8-2.25 1.8-3.75 0-3.15-2.35-5.25-5.25-5.25Zm0 1.5c2.1 0 3.75 1.5 3.75 3.75s-1.65 3.75-3.75 3.75S8.25 10.5 8.25 9c0-2.25 1.65-3.75 3.75-3.75Z',
}

const subjectStyle: Record<Subject, { gradient: string; tagBg: string; tagText: string }> = {
  数学: { gradient: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)', tagBg: '#ede9fe', tagText: '#7c3aed' },
  物理: { gradient: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)', tagBg: '#dbeafe', tagText: '#2563eb' },
  化学: { gradient: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)', tagBg: '#cffafe', tagText: '#0891b2' },
  天文: { gradient: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)', tagBg: '#e0e7ff', tagText: '#4f46e5' },
  地理: { gradient: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)', tagBg: '#dcfce7', tagText: '#16a34a' },
  生物: { gradient: 'linear-gradient(135deg, #f0abfc 0%, #d946ef 100%)', tagBg: '#fae8ff', tagText: '#c026d3' },
}

function visiblePageNumbers(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
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
    return keywordMatchedTools.filter((tool) => subject === '全部工具' || tool.subject === subject)
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
              <h2>全部工具</h2>
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
                          <path d={subjectIconPaths[tool.subject]} fill="currentColor" />
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
              {visiblePageNumbers(page, pageCount).map((pageNumber) => (
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
