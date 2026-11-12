import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import LogoMark from './LogoMark'
import MessageCenter from './MessageCenter'
import AvatarMenu from './AvatarMenu'
import './header-layout.css'
import { useApp } from '../context/app-context'

const navItems = [
  { label: '首页', to: '/' },
  { label: '语料检索', to: '/search' },
  { label: '语料上传', to: '/upload' },
  { label: '语料评测', to: '/evaluation' },
  { label: '需求广场', to: '/demands' },
  { label: '工具链', to: '/tools' },
  { label: '关于我们', to: '/about' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarReset, setAvatarReset] = useState(0)
  const location = useLocation()
  const isSettings = location.pathname === '/settings'
  const showPlatformBrand = location.pathname === '/' || isSettings
  const { user, openAuth } = useApp()

  return (
    <header className={`site-header${isSettings ? ' account-site-header' : ''}`}>
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="格物·科学语料库首页">
          {showPlatformBrand ? <img className="home-brand-image" src={`${import.meta.env.BASE_URL}images/home/brand.svg`} alt="格物·科学语料库" /> : <LogoMark size={44} />}
          <span className="brand-copy" hidden={showPlatformBrand}>
            <strong>格物 · 科学语料库</strong>
            <small>科学语料共建共享平台</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <MessageCenter key={user.account} account={user.account} onOpen={() => { setAvatarReset(value => value + 1); setMobileOpen(false) }} />
              <AvatarMenu key={`${user.account}:${location.key}:${avatarReset}`} />
            </>
          ) : (
            <button type="button" className="login-trigger" onClick={() => openAuth()}>
              登录体验
            </button>
          )}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? '收起导航' : '展开导航'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="移动端导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
