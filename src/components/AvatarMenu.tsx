import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { CircleCheck, LogOut, Settings, Share2, UserRound } from 'lucide-react'
import { useApp } from '../context/app-context'
import { useCommunity, useCurrentIdentity } from '../context/use-community'
import { avatarUrl } from '../data/community-users'
import { copyText, profileShareUrl } from '../data/profile-share'
import './avatar-menu.css'

export default function AvatarMenu() {
  const { signOut } = useApp()
  const identity = useCurrentIdentity()
  const { people, isFollowing } = useCommunity()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      if (root.current?.contains(document.activeElement)) trigger.current?.focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const share = async () => {
    setToast(await copyText(profileShareUrl(identity)) ? '已复制链接 可以分享' : '复制失败，请重试')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(''), 2400)
  }

  return (
    <div className="user-menu" ref={root}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setOpen(false) }}
      onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
    >
      <button type="button" className="user-trigger" ref={trigger} aria-label={`${identity.username}的账号菜单`} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(true)}>
        <span className="user-avatar">{identity.avatar ? <img src={avatarUrl(identity.avatar)} alt="" /> : identity.username.slice(0, 1)}</span>
      </button>
      {open && (
        <section className="avatar-popover" id={id} aria-label="账号菜单">
          <div className="avatar-popover-profile">
            <div className="avatar-popover-summary">
              <span className="user-avatar">{identity.avatar ? <img src={avatarUrl(identity.avatar)} alt="" /> : identity.username.slice(0, 1)}</span>
              <div className="avatar-popover-identity">
                <div><strong title={identity.username}>{identity.username}</strong><button type="button" aria-label="分享个人主页" title="分享个人主页" onClick={() => void share()}><Share2 size={17} strokeWidth={1.7} /></button></div>
                <p title={identity.bio}>{identity.bio || '暂无个人简介'}</p>
              </div>
            </div>
            <div className="avatar-popover-stats">
              <span><b>{people.filter(person => isFollowing(person.id)).length.toLocaleString()}</b> 关注</span>
              <span><b>{people.filter(person => person.followsYou).length.toLocaleString()}</b> 粉丝</span>
              <span><b>1.2w</b> 被收藏</span>
            </div>
          </div>
          <div className="avatar-popover-actions">
            <Link to="/profile" onClick={() => setOpen(false)}><UserRound />个人主页</Link>
            <Link to="/settings" onClick={() => setOpen(false)}><Settings />设置</Link>
            <hr />
            <button type="button" onClick={() => { setOpen(false); signOut() }}><LogOut />退出登录</button>
          </div>
        </section>
      )}
      {toast && createPortal(<div className="avatar-share-toast" role="status">{toast.startsWith('已复制') && <CircleCheck size={18} fill="currentColor" />}<span>{toast}</span></div>, document.body)}
    </div>
  )
}
