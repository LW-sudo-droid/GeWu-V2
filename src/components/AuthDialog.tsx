import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeftRight, ChevronLeft, CircleAlert, CircleCheck, CircleX, Eye, EyeOff, LockKeyhole, Mail, RefreshCw, Smartphone, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useApp, type DemoUser } from '../context/app-context'
import {
  DEMO_CODE, findDemoAccount, findWeChatDemoAccount, hasDemoPassword, matchesDemoPassword,
  readRememberedPhone, registerDemoAccount, rememberPhone, setDemoPassword, validContact, type ContactMethod,
} from '../data/demo-auth'
import WeChatIcon from './WeChatIcon'
import './auth-dialog.css'

type Step = 'code' | 'password' | 'wechat' | 'bind' | 'recover' | 'reset'
type Binding = { email: string } | { wechat: true }
type Interruption = 'registered' | 'agreement' | 'privacy'
type Toast = { text: string; tone: 'success' | 'warning' | 'error' }
type Challenge = { contact: string; expiresAt: number }

const contactLabel = { phone: '手机号', email: '邮箱' }
const contactIcon = { phone: Smartphone, email: Mail }
const QR_LIFETIME = 120_000
const CODE_LIFETIME = 60_000

function formatPhone(phone: string) {
  return [phone.slice(0, 3), phone.slice(3, 7), phone.slice(7, 11)].filter(Boolean).join(' ')
}

function LoginField({ icon, children, action, error, errorId }: {
  icon: ReactNode; children: ReactNode; action?: ReactNode; error?: string; errorId?: string
}) {
  return (
    <div className="login-field">
      <div className="login-field-control" data-error={Boolean(error)}>
        <span className="login-field-icon">{icon}</span>
        {children}
        {action}
      </div>
      {error && <p id={errorId} className="login-field-error" role="alert"><CircleAlert size={12} />{error}</p>}
    </div>
  )
}

function CodeIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="2.5" y="3" width="19" height="18" rx="4.5" />
      <circle cx="9" cy="12" r="2.1" />
      <path d="M11.2 12h5.8m-1.5 0v2" strokeLinecap="round" />
    </svg>
  )
}

function PasswordField({ id, label, value, onChange, error, isNew }: {
  id: string; label: string; value: string; onChange: (value: string) => void; error?: string; isNew?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <LoginField icon={<LockKeyhole size={21} />} error={error} errorId={`${id}-error`} action={
      <button type="button" className="login-icon-button login-password-toggle" aria-label={`${visible ? '隐藏' : '显示'}${label}`} onClick={() => setVisible(!visible)}>
        {visible ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    }>
      <input id={id} name={id} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        type={visible ? 'text' : 'password'} autoComplete={isNew ? 'new-password' : 'current-password'}
        placeholder={label === '确认密码' ? '请再次输入密码' : '请输入密码'} value={value} onChange={event => onChange(event.target.value)} />
    </LoginField>
  )
}

export default function AuthDialog() {
  const { authOpen, authReturnTo, closeAuth, signIn } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const closeDialog = () => {
    closeAuth()
    const path = location.pathname
    if (path === '/upload/form') navigate('/upload')
    else if (path === '/evaluation/upload') navigate('/evaluation')
    else if (path === '/settings') navigate('/')
    else if (path.startsWith('/search/results') || path.startsWith('/search/datasets/')) navigate('/search')
  }

  const complete = ({ account, name }: DemoUser) => {
    signIn({ account, name })
    if (authReturnTo) navigate(authReturnTo)
  }

  return (
    <Dialog.Root open={authOpen} onOpenChange={open => { if (!open) closeDialog() }}>
      {authOpen && <LoginPanel onComplete={complete} />}
    </Dialog.Root>
  )
}

function LoginPanel({ onComplete }: { onComplete: (user: DemoUser) => void }) {
  const [step, setStep] = useState<Step>('code')
  const [method, setMethod] = useState<ContactMethod>('phone')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [remember, setRemember] = useState(true)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [binding, setBinding] = useState<Binding | null>(null)
  const [contactError, setContactError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [interruption, setInterruption] = useState<Interruption | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [now, setNow] = useState(Date.now)
  const [qr, setQr] = useState({ version: 1, expiresAt: 0, scanned: false, failed: false })
  const [busy, setBusy] = useState(false)
  const mounted = useRef(false)
  const contactInput = useRef<HTMLInputElement>(null)
  const dialogContent = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    mounted.current = true
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      mounted.current = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeMethod = step === 'bind' ? 'phone' : method
  const label = contactLabel[activeMethod]
  const ContactIcon = contactIcon[activeMethod]
  const contact = activeMethod === 'email' ? value.trim().toLowerCase() : value
  const login = step === 'code' || step === 'password' || step === 'wechat'
  const existing = step === 'recover' || step === 'bind' ? findDemoAccount(activeMethod, contact) : undefined
  const secondsLeft = challenge?.contact === contact ? Math.max(0, Math.ceil((challenge.expiresAt - now) / 1000)) : 0
  const validPassword = password.length >= 8 && /[a-z]/i.test(password) && /\d/.test(password)
  const qrUnavailable = qr.failed || (now >= qr.expiresAt && !qr.scanned)
  const showNotice = (text: string, tone: Toast['tone'] = 'success') => setToast({ text, tone })

  const goTo = (next: Step, nextValue = '') => {
    setStep(next)
    setValue(nextValue)
    setCode('')
    setPassword('')
    setConfirm('')
    setChallenge(null)
    setContactError('')
    setCodeError('')
    setPasswordError('')
    setToast(null)
  }

  const chooseContact = (next: ContactMethod) => {
    setMethod(next)
    setAgreed(false)
    setBinding(null)
    goTo('code')
  }

  const refreshQr = () => {
    const timestamp = Date.now()
    setNow(timestamp)
    setQr(previous => ({ version: previous.version === 1 ? 2 : 1, expiresAt: timestamp + QR_LIFETIME, scanned: false, failed: false }))
  }

  const openWeChat = () => {
    goTo('wechat')
    setBinding(null)
    setAgreed(true)
    refreshQr()
  }

  const toggleAgreement = (next: boolean) => {
    setAgreed(next)
    if (step === 'wechat') {
      setToast(null)
      if (next) refreshQr()
      else setQr(current => ({ ...current, scanned: false }))
    }
  }

  const changeContact = (next: string) => {
    setValue(next)
    setContactError('')
    const shouldCheckRegistration = step === 'recover' || (step === 'bind' && binding && 'email' in binding)
    const nextContact = next.trim().toLowerCase()
    if (shouldCheckRegistration && validContact(activeMethod, nextContact) && !findDemoAccount(activeMethod, nextContact)) {
      showNotice(`该${label}还未注册过账号`, 'warning')
    }
    if (next.trim().toLowerCase() !== contact) {
      setCode('')
      setCodeError('')
      setChallenge(null)
    }
  }

  const requestCode = () => {
    if (!validContact(activeMethod, contact)) {
      setContactError(`该${label}不存在`)
      return
    }
    if (step === 'recover' && !existing) return
    const timestamp = Date.now()
    setNow(timestamp)
    setChallenge({ contact, expiresAt: timestamp + CODE_LIFETIME })
    setCode('')
    setCodeError('')
    setContactError('')
    showNotice(`${activeMethod === 'phone' ? '短信' : '邮箱'}验证码已发送 · 演示码 ${DEMO_CODE}`)
  }

  const verifyCode = () => {
    if (challenge?.contact === contact && challenge.expiresAt > Date.now() && code === DEMO_CODE) return true
    setCodeError(`${activeMethod === 'phone' ? '手机' : '邮箱'}验证码错误`)
    return false
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const account = findDemoAccount(activeMethod, contact)

    if (step === 'password' || step === 'reset') {
      setBusy(true)
      try {
        if (!account) {
          setContactError(`该${label}未注册账户，请先注册`)
        } else if (step === 'reset') {
          if (!validPassword || password !== confirm) return
          await setDemoPassword(account, password)
          if (mounted.current) {
            goTo('password', contact)
            showNotice('新密码设置成功')
          }
        } else if (!hasDemoPassword(account)) {
          setPasswordError('该账号尚未设置密码，请先设置')
        } else if (await matchesDemoPassword(account, password)) {
          if (mounted.current) {
            if (method === 'phone') rememberPhone(remember ? contact : '')
            onComplete(account)
          }
        } else if (mounted.current) {
          setPasswordError('密码错误')
        }
      } catch {
        if (mounted.current) showNotice('操作未完成，请重试', 'error')
      } finally {
        if (mounted.current) setBusy(false)
      }
      return
    }

    if (!validContact(activeMethod, contact)) {
      setContactError(`该${label}不存在`)
      return
    }
    if (!verifyCode()) return

    if (step === 'recover') {
      if (account) goTo('reset', contact)
      else showNotice(`该${label}还未注册过账号`, 'warning')
      return
    }
    if (step === 'bind' && account) {
      setToast(null)
      setInterruption('registered')
      return
    }
    if (step === 'code' && method === 'email' && !account) {
      setBinding({ email: contact })
      goTo('bind')
      return
    }
    try {
      onComplete(account ?? registerDemoAccount(contact, binding ?? undefined))
    } catch {
      showNotice('账号未创建，请重试', 'error')
    }
  }

  const allowWeChat = () => {
    const account = findWeChatDemoAccount()
    if (account) onComplete(account)
    else {
      setBinding({ wechat: true })
      goTo('bind')
    }
  }

  const goBack = () => {
    if (step === 'reset') goTo('recover', contact)
    else if (step === 'recover') goTo('password', contact)
    else if (binding && 'email' in binding) {
      goTo('code', binding.email)
      setBinding(null)
    } else {
      openWeChat()
    }
  }

  const description = step === 'code' ? `未注册的${label}验证后自动创建账号`
    : step === 'password' ? '已注册且设置过密码的账号可使用密码登录'
      : step === 'bind' && binding && 'wechat' in binding ? '新注册账号需绑定手机号'
        : step === 'reset' ? '密码需包含字母和数字且不少于 8 位' : ''
  const title = step === 'wechat' ? '微信扫码登录'
    : step === 'bind' && binding && 'wechat' in binding ? '绑定手机号'
      : step === 'bind' || step === 'recover' ? `验证${label}`
        : step === 'reset' ? '设置新密码' : `${label}登录`
  const action = step === 'reset' ? '确定' : login ? '登录' : `验证${label}`
  const canSubmit = step === 'reset' ? validPassword && password === confirm
    : Boolean(contact && (step === 'password' ? password : code.length === 6) && (!login || agreed))
  const showCodeField = step === 'code' || step === 'bind' || step === 'recover'
  const ToastIcon = toast?.tone === 'warning' ? CircleAlert : toast?.tone === 'error' ? CircleX : CircleCheck

  const agreement = (
    <div className="login-consent">
      <label className="login-check">
        <input type="checkbox" aria-label="同意用户协议和隐私协议" checked={agreed} onChange={event => toggleAgreement(event.target.checked)} />
        <span>我已阅读并同意</span>
      </label>
      <button type="button" onClick={() => setInterruption('agreement')}>《用户协议》</button>
      <span>和</span>
      <button type="button" onClick={() => setInterruption('privacy')}>《隐私协议》</button>
    </div>
  )

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="login-shade" />
      <Dialog.Content ref={dialogContent} className="login-dialog"
        onOpenAutoFocus={event => {
          event.preventDefault()
          previousFocus.current = document.activeElement as HTMLElement | null
          dialogContent.current?.focus()
        }}
        onCloseAutoFocus={event => {
          event.preventDefault()
          if (previousFocus.current?.isConnected) previousFocus.current.focus()
        }}>
        <Dialog.Close className="login-dismiss" aria-label="关闭登录窗口"><X size={18} /></Dialog.Close>
        <div className="login-card" data-step={step} data-interrupted={Boolean(interruption)}>
          {!login && <button type="button" className="login-back" onClick={goBack} disabled={busy}><ChevronLeft size={18} />返回</button>}
          <header className="login-heading">
            <Dialog.Title>{title}</Dialog.Title>
            {step === 'wechat' ? <Dialog.Description>使用 <span className="login-wechat-text"><WeChatIcon size={14} />微信</span> 扫码登录</Dialog.Description>
              : <Dialog.Description className={description ? undefined : 'login-sr-only'}>{description || '请完成验证后继续'}</Dialog.Description>}
          </header>

          {step === 'wechat' ? (
            <div className="login-wechat">
              <div className="login-qr" data-blocked={!agreed || qrUnavailable}>
                <img key={qr.version} src={`${import.meta.env.BASE_URL}images/login-wechat-${qr.version}.svg`} alt="微信登录演示二维码" onError={() => {
                  setQr(current => ({ ...current, failed: true, scanned: false }))
                  showNotice('二维码加载失败，请点击刷新', 'error')
                }} />
                {!agreed ? <div className="login-qr-cover"><button type="button" onClick={() => toggleAgreement(true)}>同意并继续</button></div>
                  : qrUnavailable ? <div className="login-qr-cover"><button type="button" onClick={refreshQr}><RefreshCw size={14} />刷新</button></div> : null}
              </div>
              <div className="login-wechat-actions">
                {agreed && qr.scanned ? <>
                  <button type="button" onClick={() => { refreshQr(); showNotice('本次登录已取消，可再次扫码登录', 'error') }}>拒绝登录</button>
                  <button type="button" onClick={allowWeChat}>允许登录</button>
                </> : agreed && !qrUnavailable && <button type="button" onClick={() => {
                  if (Date.now() >= qr.expiresAt) { setNow(Date.now()); return }
                  setQr(current => ({ ...current, scanned: true }))
                  showNotice('扫码成功，在微信中点击允许即可登录')
                }}>模拟微信扫码</button>}
              </div>
              {agreement}
            </div>
          ) : (
            <form className="login-fields" onSubmit={submit} noValidate>
              {step !== 'reset' && (
                <LoginField icon={<ContactIcon size={21} />} error={contactError} errorId="login-contact-error" action={value && (
                  <button type="button" className="login-icon-button login-clear-contact" aria-label={`清空${label}`} onClick={() => { changeContact(''); contactInput.current?.focus() }}>
                    <X size={13} />
                  </button>
                )}>
                  <input ref={contactInput} name={activeMethod} aria-label={label} aria-invalid={Boolean(contactError)} aria-describedby={contactError ? 'login-contact-error' : undefined}
                    type={activeMethod === 'phone' ? 'tel' : 'email'} inputMode={activeMethod === 'phone' ? 'numeric' : 'email'}
                    autoComplete={step === 'password' ? 'username' : activeMethod === 'phone' ? 'tel-national' : 'email'}
                    placeholder={`请输入${label}`} value={activeMethod === 'phone' ? formatPhone(value) : value}
                    onChange={event => changeContact(activeMethod === 'phone' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value)} />
                </LoginField>
              )}
              {showCodeField && (
                <LoginField icon={<CodeIcon />} error={codeError} errorId="login-code-error" action={
                  <button type="button" className="login-get-code" disabled={!contact || secondsLeft > 0 || (step === 'recover' && !existing)} onClick={requestCode}>
                    {secondsLeft > 0 ? `重新获取 (${secondsLeft}s)` : '获取验证码'}
                  </button>
                }>
                  <input aria-label="验证码" aria-invalid={Boolean(codeError)} aria-describedby={codeError ? 'login-code-error' : undefined}
                    inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" value={code}
                    onChange={event => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError('') }} />
                </LoginField>
              )}
              {(step === 'password' || step === 'reset') && <PasswordField key={step} id="login-password" label={step === 'reset' ? '新密码' : '密码'}
                value={password} onChange={next => { setPassword(next); setPasswordError('') }} isNew={step === 'reset'}
                error={step === 'reset' && password && !validPassword ? '密码需包含字母和数字且不少于8位' : passwordError} />}
              {step === 'reset' && <PasswordField id="login-password-confirm" label="确认密码" value={confirm} onChange={setConfirm} isNew
                error={confirm && confirm !== password ? '密码不一致' : undefined} />}

              {login && <div className="login-preferences">
                {step === 'password' && method === 'phone' && <label className="login-check">
                  <input type="checkbox" checked={remember} onChange={event => {
                    setRemember(event.target.checked)
                    if (!event.target.checked) rememberPhone('')
                  }} />
                  <span>记住账号密码</span>
                </label>}
                {agreement}
              </div>}

              <button type="submit" className="login-primary" disabled={!canSubmit || busy}>{action}</button>
              {login && <div className="login-mode-actions">
                <button type="button" disabled={busy} onClick={() => {
                  if (step === 'password') goTo('code', contact)
                  else goTo('password', contact || (method === 'phone' ? readRememberedPhone() : ''))
                }}><ArrowLeftRight size={14} />{step === 'password' ? '验证码登录' : '密码登录'}</button>
                {step === 'password' && <button type="button" disabled={busy} onClick={() => goTo('recover', contact)}>忘记密码</button>}
              </div>}
            </form>
          )}

          {login && <footer className="login-alternatives">
            <p>其他登录方式</p>
            <div>
              {(step === 'wechat' || method === 'email') && <button type="button" disabled={busy} onClick={() => chooseContact('phone')}>
                <span className="login-alt-phone"><Smartphone size={23} fill="white" stroke="#a4a7ff" /></span>手机号
              </button>}
              {(step === 'wechat' || method === 'phone') && <button type="button" disabled={busy} onClick={() => chooseContact('email')}>
                <span className="login-alt-email"><span className="login-envelope"><Mail size={13} /></span></span>邮箱
              </button>}
              {step !== 'wechat' && <button type="button" disabled={busy} onClick={openWeChat}>
                <span className="login-alt-wechat"><WeChatIcon size={29} /></span>微信
              </button>}
            </div>
          </footer>}

          {toast && <div className="login-toast" data-tone={toast.tone} role="status"><ToastIcon size={18} />{toast.text}</div>}
        </div>

        <Dialog.Root open={Boolean(interruption)} onOpenChange={open => { if (!open) setInterruption(null) }}>
          <Dialog.Portal>
            <Dialog.Overlay className="login-interruption-overlay" />
            <Dialog.Content className="login-interruption">
              {interruption === 'registered' ? <>
                <CircleAlert className="login-conflict-icon" size={38} />
                <Dialog.Title>此手机号已注册账号</Dialog.Title>
                <Dialog.Description>若需创建新账号<br />请更换未使用的手机号</Dialog.Description>
                <div className="login-interruption-actions">
                  <Dialog.Close>取消</Dialog.Close>
                  <button type="button" onClick={() => {
                    setInterruption(null)
                    chooseContact('phone')
                    setValue(contact)
                  }}>去登录</button>
                </div>
              </> : <>
                <Dialog.Title>{interruption === 'privacy' ? '隐私协议' : '用户协议'}</Dialog.Title>
                <Dialog.Description>正式协议正文将在平台发布时提供。</Dialog.Description>
                <div className="login-interruption-actions"><Dialog.Close>返回</Dialog.Close></div>
              </>}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
