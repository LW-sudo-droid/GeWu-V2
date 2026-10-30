import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './corpus-request-dialogs.css'

export default function CorpusDialog({ title, onClose, children, className = '', labelledBy = 'corpus-dialog-title', closeLabel = '关闭申请成功弹窗' }: { title?: string; onClose: () => void; children: ReactNode; className?: string; labelledBy?: string; closeLabel?: string }) {
  const dialog = useRef<HTMLElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    return () => { document.body.style.overflow = overflow; previousFocus?.focus() }
  }, [labelledBy])
  return createPortal(<div className="cr-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={`cr-dialog ${className}`} ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onKeyDown={(event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose() }
      if (event.key !== 'Tab') return
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not([hidden]):not(:disabled),textarea,select') ?? []).filter((control) => control.getClientRects().length)
      if (!controls.length) return
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus() }
    }}>
      {title ? <header className="cr-header"><h2 id={labelledBy}>{title}</h2><button type="button" aria-label={`关闭${title}`} onClick={onClose}><X size={23} strokeWidth={1.7} /></button></header> : <button type="button" className="cr-success-close" aria-label={closeLabel} onClick={onClose}><X size={23} strokeWidth={1.7} /></button>}
      {children}
    </section>
  </div>, document.body)
}
