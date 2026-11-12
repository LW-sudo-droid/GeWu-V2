import { useMemo, useSyncExternalStore } from 'react'
import { initiallyUnread, type MessageCategory } from '../data/messages'

const changeEvent = 'gw-message-read-changed'
const memory = new Map<string, string>()

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(changeEvent, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(changeEvent, callback)
  }
}

function snapshotFor(key: string) {
  if (!key) return ''
  if (memory.has(key)) return memory.get(key) ?? ''
  try { return window.localStorage.getItem(key) ?? '' } catch { return '' }
}

function readIds(snapshot: string) {
  try {
    const value: unknown = JSON.parse(snapshot)
    return new Set<string>(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [])
  } catch { return new Set<string>() }
}

export function useMessageReadState(account?: string) {
  const key = account ? `gw-messages-read-${account}` : ''
  const snapshot = useSyncExternalStore(subscribe, () => snapshotFor(key), () => '')
  const read = useMemo(() => readIds(snapshot), [snapshot])
  const unreadCount = key ? [...initiallyUnread].filter(id => !read.has(id)).length : 0
  const isUnread = (category: MessageCategory, id: number) => {
    const messageId = `${category}:${id}`
    return Boolean(key && initiallyUnread.has(messageId) && !read.has(messageId))
  }
  const markRead = (category: MessageCategory, id: number) => {
    if (!isUnread(category, id)) return
    const next = JSON.stringify([...readIds(snapshotFor(key)).add(`${category}:${id}`)])
    try {
      window.localStorage.setItem(key, next)
      memory.delete(key)
    } catch { memory.set(key, next) }
    window.dispatchEvent(new Event(changeEvent))
  }
  return { unreadCount, isUnread, markRead }
}
