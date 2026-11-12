import { Link, useLocation } from 'react-router'
import { avatarUrl } from '../data/community-users'
import { readSharedProfile } from '../data/profile-share'
import './profile-ui-v2.css'

export default function SharedProfile() {
  const profile = readSharedProfile(useLocation().hash)
  return (
    <main className="profile-page profile-guest-page">
      <section className="profile-guest-card profile-user-card-top">
        {profile.username && <span className="profile-avatar-button is-static">
          {profile.avatar ? <img src={avatarUrl(profile.avatar)} alt="" /> : <span>{profile.username.slice(0, 1)}</span>}
        </span>}
        <h1>{profile.username || '个人主页链接无效'}</h1>
        {profile.bio && <p style={{ overflowWrap: 'anywhere' }}>{profile.bio}</p>}
        <Link to="/">返回首页</Link>
      </section>
    </main>
  )
}
