import { useMemo, useSyncExternalStore } from 'react'
import { useApp, type DemoUser } from './app-context'
import { communityUsers, type CommunityUser } from '../data/community-users'

const CHANGE_EVENT = 'gw-community-changed'

function storedValue(key: string) {
  try { return window.localStorage.getItem(key) ?? '' } catch { return '' }
}

function parseObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch { return {} }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function notifyCommunityChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function identityFromProfile(user: DemoUser | null, profile: Record<string, unknown>) {
  return {
    username: typeof profile.username === 'string' && profile.username.trim() ? profile.username : user?.name || '科学语料用户',
    avatar: typeof profile.avatar === 'string' ? profile.avatar : 'images/demand-users/lab-director.jpg',
  }
}

export function readUserIdentity(user: DemoUser | null) {
  return identityFromProfile(user, user ? parseObject(storedValue(`gw-profile-${user.account}`)) : {})
}

export function useCurrentIdentity() {
  const { user } = useApp()
  const snapshot = useSyncExternalStore(subscribe, () => user ? storedValue(`gw-profile-${user.account}`) : '', () => '')
  return useMemo(() => identityFromProfile(user, parseObject(snapshot)), [user, snapshot])
}

export function useCommunity() {
  const { user } = useApp()
  const key = user ? `gw-user-following-${user.account}` : ''
  const snapshot = useSyncExternalStore(subscribe, () => key ? storedValue(key) : '', () => '')
  const overrides = useMemo(() => parseObject(snapshot), [snapshot])
  const isFollowing = (id: string) => Boolean(user && (typeof overrides[id] === 'boolean' ? overrides[id] : communityUsers.find((person) => person.id === id)?.following))
  const followLabel = (person: CommunityUser) => isFollowing(person.id) ? person.followsYou ? '相互关注' : '已关注' : '关注'
  const followerCount = (person: CommunityUser) => person.fans + (isFollowing(person.id) ? 1 : 0) - (person.following && user ? 1 : 0)
  const toggleFollow = (id: string) => {
    if (!user || !key || !communityUsers.some((person) => person.id === id)) return
    // Read latest state before updating so separate tabs cannot toggle a stale snapshot.
    const latest = parseObject(storedValue(key))
    const following = typeof latest[id] === 'boolean' ? latest[id] : communityUsers.find((person) => person.id === id)?.following ?? false
    window.localStorage.setItem(key, JSON.stringify({ ...latest, [id]: !following }))
    notifyCommunityChanged()
  }
  return { people: communityUsers, isFollowing, followLabel, followerCount, toggleFollow }
}
