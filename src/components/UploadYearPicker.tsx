import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function UploadYearPicker({ id, value, onChange, invalid, label, min, max }: { id: string; value: string; onChange: (value: string) => void; invalid?: boolean; label: string; min?: number; max?: number }) {
  const [open, setOpen] = useState(false)
  const [decade, setDecade] = useState(() => Math.floor((Number(value) || new Date().getFullYear()) / 10) * 10)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return <div className="uf-year-picker" ref={root} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus() } }}>
    <button id={id} ref={trigger} type="button" className={`uf-year-trigger${value ? '' : ' is-placeholder'}`} aria-label={label} aria-expanded={open} aria-haspopup="dialog" aria-invalid={Boolean(invalid)} onClick={() => { if (!open) setDecade(Math.floor((Number(value) || new Date().getFullYear()) / 10) * 10); setOpen((current) => !current) }}>{value || '请选择年份'}<ChevronDown size={16} /></button>
    {open && <div className="uf-year-popover" role="dialog" aria-label={`${label}选择`}>
      <header><button type="button" aria-label="前十年" disabled={decade <= 10} onClick={() => setDecade((current) => current - 10)}><ChevronsLeft size={16} /></button><strong>{decade} - {decade + 10}</strong><button type="button" aria-label="后十年" disabled={decade >= 9980} onClick={() => setDecade((current) => current + 10)}><ChevronsRight size={16} /></button></header>
      <div>{Array.from({ length: 12 }, (_, index) => decade - 1 + index).map((year) => <button type="button" key={year} className={`${Number(value) === year ? 'is-selected' : ''}${year < decade || year >= decade + 10 ? ' is-adjacent' : ''}`} aria-pressed={Number(value) === year} disabled={year < 1 || year > 9999 || Boolean(min && year < min) || Boolean(max && year > max)} onClick={() => { onChange(String(year)); setOpen(false); trigger.current?.focus() }}>{year}</button>)}</div>
    </div>}
  </div>
}
