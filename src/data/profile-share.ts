type PublicProfile = { username: string; bio: string; avatar: string }

function publicAvatar(avatar: string) {
  // Uploaded images and account data are never embedded in the public link.
  return /^images\/[\w/.-]+\.(?:png|jpe?g|webp|svg)$/i.test(avatar) && !avatar.includes('..') ? avatar : ''
}

export function profileShareUrl(profile: PublicProfile) {
  const url = new URL(`${import.meta.env.BASE_URL}profile/shared`, window.location.origin)
  const params = new URLSearchParams({ name: profile.username.slice(0, 80) })
  if (profile.bio) params.set('bio', profile.bio.slice(0, 240))
  const avatar = publicAvatar(profile.avatar)
  if (avatar) params.set('avatar', avatar)
  url.hash = params.toString()
  return url.href
}

export function readSharedProfile(hash: string): PublicProfile {
  const params = new URLSearchParams(hash.slice(1))
  return {
    username: params.get('name')?.trim().slice(0, 80) || '',
    bio: params.get('bio')?.slice(0, 240) || '',
    avatar: publicAvatar(params.get('avatar') ?? ''),
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    const previousFocus = document.activeElement as HTMLElement | null
    field.value = text
    field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    field.setAttribute('readonly', '')
    document.body.append(field)
    field.select()
    try { return document.execCommand('copy') } catch { return false } finally {
      field.remove()
      previousFocus?.focus()
    }
  }
}
