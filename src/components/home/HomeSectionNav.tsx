import { useEffect, useRef, useState } from 'react'

const homeSections = [
  { id: 'home-flow', label: '语料流程' },
  { id: 'home-subjects', label: '学科特色' },
  { id: 'home-evaluation', label: '语料评测' },
  { id: 'home-demand', label: '需求广场' },
  { id: 'home-community', label: '数据社区' },
  { id: 'home-quality', label: '优质语料' },
  { id: 'home-partners', label: '合作伙伴' },
] as const

type SectionId = (typeof homeSections)[number]['id']

export default function HomeSectionNav() {
  const toolbar = useRef<HTMLElement>(null)
  const links = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<SectionId>(homeSections[0].id)

  useEffect(() => {
    const nav = toolbar.current
    if (!nav) return

    const sections = homeSections.flatMap(({ id }) => {
      const element = document.getElementById(id)
      return element ? [{ id, element }] : []
    })
    if (!sections.length) return

    let frame = 0
    const updateActive = () => {
      frame = 0
      const activationLine = nav.getBoundingClientRect().bottom + 4
      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2

      let current: SectionId = homeSections[0].id
      for (const { id, element } of sections) {
        if (element.getBoundingClientRect().top > activationLine) break
        current = id
      }
      setActive(atPageEnd ? sections[sections.length - 1].id : current)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActive)
    }

    const initialSection = sections.find(({ id }) => window.location.hash === `#${id}`)
    initialSection?.element.scrollIntoView({ behavior: 'instant' })
    scheduleUpdate()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(nav)
    sections.forEach(({ element }) => observer.observe(element))
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const row = links.current
    const link = row?.querySelector<HTMLAnchorElement>('[aria-current="location"]')
    if (!row || !link) return
    const rowBounds = row.getBoundingClientRect()
    const linkBounds = link.getBoundingClientRect()
    if (linkBounds.left < rowBounds.left + 4) {
      row.scrollLeft += linkBounds.left - rowBounds.left - 4
    } else if (linkBounds.right > rowBounds.right - 4) {
      row.scrollLeft += linkBounds.right - rowBounds.right + 4
    }
  }, [active])

  return (
    <nav className="home-section-nav" aria-label="首页板块导航" ref={toolbar}>
      <div className="home-section-nav-inner">
        <div className="home-section-nav-links" ref={links}>
          {homeSections.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={id === active ? 'location' : undefined}>{label}</a>
          ))}
        </div>
      </div>
    </nav>
  )
}
