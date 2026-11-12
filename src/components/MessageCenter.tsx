import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { Bell, CircleAlert, CircleCheckBig, CircleX, Clock, Megaphone, Rocket, X } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useMessageReadState } from '../context/use-message-read-state'
import { avatarUrl } from '../data/community-users'
import { commentNotices, commentNoticeTarget, notices, noticeView, type Notice } from '../data/messages'
import './message-center.css'

const statusIcons = {
  pending: Clock,
  approved: CircleCheckBig,
  failed: CircleAlert,
  rejected: CircleX,
  returned: CircleX,
  published: Rocket,
  modified: CircleAlert,
  withdrawn: CircleX,
}

function MessageEmpty() {
  return (
    <div className="message-empty" role="status">
      <svg viewBox="0 0 120 96" fill="none" aria-hidden="true">
        <path d="m15 40 46-7 43 7-44 9z" fill="#f1f2f5" stroke="#d8dbe3" />
        <path d="m15 40 45 9v38l-45-9z" fill="#f8f9fb" stroke="#d8dbe3" />
        <path d="m60 49 44-9v38l-44 9z" fill="#e0e2e8" />
        <g transform="rotate(27 75 26)">
          <rect x="58" y="5" width="34" height="39" rx="2" fill="#e9ebef" />
          <path d="M65 15h18m-18 7h14m-14 7h15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d="m15 40 45 9-15 15L2 54zm89 0-44 9 13 13 44-8z" fill="#fcfcfd" stroke="#d8dbe3" />
        <path d="m15 41 24 21L2 54z" fill="#e1e3e9" />
        <circle cx="12" cy="52" r="2" fill="white" /><circle cx="20" cy="54" r="2" fill="white" />
        <circle cx="19" cy="73" r="16" fill="#ebedf1" stroke="white" strokeWidth="2" />
        <path d="m14 68 10 10m0-10L14 78" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>暂无消息</span>
    </div>
  )
}

function MessageRow({ title, time, body, tooltip, unread, comment, icon, onClick }: {
  title: string
  time: string
  body: string
  tooltip?: string
  unread: boolean
  comment?: boolean
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <li>
      <button type="button" className={`message-row${comment ? ' is-comment' : ''}`} title={tooltip ?? body} onClick={onClick}>
        <span className="message-row-avatar">
          {icon}
          {unread && <span className="message-unread-dot" aria-label="未读" />}
        </span>
        <span className="message-row-copy">
          <span className="message-row-heading"><strong>{title}</strong><span className="message-row-time">{time}</span></span>
          <span className="message-row-body">{body}</span>
        </span>
      </button>
    </li>
  )
}

export function SystemMessageDialog({ notice, onClose, onFollow, restoreFocus }: {
  notice: Notice | null
  onClose: () => void
  onFollow: (to: string) => void
  restoreFocus?: () => void
}) {
  const view = notice ? noticeView(notice) : null
  const StatusIcon = notice ? statusIcons[notice.kind] : Clock
  return (
    <Dialog.Root open={Boolean(notice)} onOpenChange={open => { if (!open) onClose() }}>
      {notice && view && (
        <Dialog.Portal>
          <Dialog.Overlay className="message-overlay message-detail-overlay" />
          <Dialog.Content className="message-detail" onCloseAutoFocus={event => {
            if (restoreFocus) {
              event.preventDefault()
              restoreFocus()
            }
          }}>
            <Dialog.Close className="message-close" aria-label="关闭系统消息"><X size={21} strokeWidth={1.7} /></Dialog.Close>
            <StatusIcon className={`message-status-icon is-${notice.kind}`} size={38} strokeWidth={2} aria-hidden="true" />
            <Dialog.Title>{view.title}</Dialog.Title>
            <Dialog.Description>{view.body}</Dialog.Description>
            <footer className="message-detail-actions">
              <button type="button" onClick={() => onFollow(view.to)}>{view.action}</button>
              <Dialog.Close className="is-primary">知道了</Dialog.Close>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default function MessageCenter({ account, onOpen }: { account: string; onOpen: () => void }) {
  const [open, setOpen] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selected, setSelected] = useState<Notice | null>(null)
  const { unreadCount, isUnread, markRead } = useMessageReadState(account)
  const navigate = useNavigate()
  const opener = useRef<HTMLElement | null>(null)
  const unreadInput = useRef<HTMLInputElement>(null)
  const systemItems = notices.filter(item => !unreadOnly || isUnread('audit', item.id))
  const commentItems = commentNotices.filter(item => !unreadOnly || isUnread('comment', item.id))

  function changeOpen(next: boolean) {
    setOpen(next)
    if (next) {
      setUnreadOnly(false)
      onOpen()
    }
    setSelected(null)
  }

  function follow(to: string) {
    changeOpen(false)
    navigate(to)
    window.scrollTo({ top: 0 })
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger className="message-trigger" title="消息中心" aria-label={unreadCount ? `消息中心，${unreadCount} 条未读消息` : '消息中心'}>
        <Bell size={24} strokeWidth={1.75} aria-hidden="true" />
        {unreadCount > 0 && <span className="message-count" aria-hidden="true">{unreadCount > 100 ? '99+' : unreadCount}</span>}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="message-overlay" />
        <Dialog.Content className="message-drawer" aria-describedby={undefined}>
          <header className="message-drawer-header">
            <Dialog.Title>消息中心</Dialog.Title>
            <Dialog.Close className="message-close" aria-label="关闭消息中心"><X size={19} strokeWidth={1.7} /></Dialog.Close>
          </header>
          <Tabs.Root className="message-tabs" defaultValue="audit">
            <div className="message-toolbar">
              <Tabs.List aria-label="消息分类">
                <Tabs.Trigger value="audit">系统通知</Tabs.Trigger>
                <Tabs.Trigger value="comment">评论</Tabs.Trigger>
              </Tabs.List>
              <label className="message-filter">
                <input ref={unreadInput} type="checkbox" checked={unreadOnly} onChange={event => setUnreadOnly(event.target.checked)} />
                只看未读
              </label>
            </div>
            <Tabs.Content className="message-list-panel" value="audit">
              {systemItems.length === 0 ? <MessageEmpty /> : (
                <ul className="message-list">
                  {systemItems.map(item => {
                    const view = noticeView(item)
                    return <MessageRow key={item.id} title="系统消息" time={item.time} body={view.title} tooltip={view.body} unread={isUnread('audit', item.id)} icon={<Megaphone size={20} strokeWidth={1.7} aria-hidden="true" />} onClick={() => {
                      opener.current = document.activeElement as HTMLElement | null
                      markRead('audit', item.id)
                      setSelected(item)
                    }} />
                  })}
                </ul>
              )}
            </Tabs.Content>
            <Tabs.Content className="message-list-panel" value="comment">
              {commentItems.length === 0 ? <MessageEmpty /> : (
                <ul className="message-list">
                  {commentItems.map(item => <MessageRow key={item.id} comment title={item.user} time={item.time} body={item.text} unread={isUnread('comment', item.id)} icon={<img src={avatarUrl(item.avatar)} alt="" />} onClick={() => {
                    markRead('comment', item.id)
                    follow(commentNoticeTarget(item))
                  }} />)}
                </ul>
              )}
            </Tabs.Content>
          </Tabs.Root>
          <SystemMessageDialog notice={selected} onClose={() => setSelected(null)} onFollow={follow} restoreFocus={() => {
            const target = opener.current?.isConnected ? opener.current : unreadInput.current
            target?.focus({ preventScroll: true })
          }} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
