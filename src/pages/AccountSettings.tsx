import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, LockKeyhole, Mail, Smartphone } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useSearchParams } from 'react-router'
import CorpusDialog from '../components/CorpusDialog'
import WeChatIcon from '../components/WeChatIcon'
import { useApp } from '../context/app-context'
import './account-settings.css'

const privacyGroups = [
  { key: 'favorites', title: '我收藏的', options: ['全部公开', '仅公开我收藏的语料库', '仅公开我收藏的需求', '全部私密'] },
  { key: 'comments', title: '我评论的', options: ['全部公开', '仅公开我评论的语料库', '仅公开我评论的需求', '全部私密'] },
  { key: 'social', title: '关注与粉丝列表', options: ['全部公开', '仅公开关注列表', '仅公开粉丝列表', '全部私密'] },
] as const

type PrivacyKey = (typeof privacyGroups)[number]['key']
type ContactKind = 'phone' | 'email'
type DialogKind = ContactKind | 'password' | 'bind' | 'unbind'
type Settings = { phone: string; email: string; wechat: string; privacy: Record<PrivacyKey, string> }

const phonePattern = /^1[3-9]\d{9}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const contactNames = { phone: '手机号', email: '邮箱' }
const storeKey = (account: string) => `gw-account-settings-${account}`

function loadSettings(account: string): Settings {
  const defaults = {
    phone: phonePattern.test(account) ? account : '15300000004',
    email: emailPattern.test(account) ? account : '321demo@zju.edu.cn',
    wechat: '张小崔',
    privacy: { favorites: '全部公开', comments: '全部公开', social: '全部公开' },
  }
  try {
    const value = JSON.parse(window.localStorage.getItem(storeKey(account)) ?? '{}') as Partial<Settings>
    return { ...defaults, ...value, privacy: { ...defaults.privacy, ...value.privacy } }
  } catch { return defaults }
}

function SettingsRow({ kind, icon, label, value, action = '修改', onClick }: { kind: string; icon: ReactNode; label: string; value: string; action?: string; onClick: () => void }) {
  return <div className="account-method-row">
    <span className={`account-method-icon is-${kind}`}>{icon}</span>
    <span className="account-method-label">{label}</span>
    <span className={`account-method-value${value ? '' : ' is-unbound'}`}>{value && <CircleCheck size={15} strokeWidth={1.8} />}{value || '未绑定'}</span>
    <button type="button" aria-label={`${action}${label}`} onClick={onClick}>{action}</button>
  </div>
}

function ContactDialog({ kind, current, close, save }: { kind: ContactKind; current: string; close: () => void; save: (value: string) => boolean }) {
  const [value, setValue] = useState(current)
  const [code, setCode] = useState('')
  const [verifiedTarget, setVerifiedTarget] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<{ field: 'value' | 'code' | 'save'; message: string } | null>(null)
  const label = contactNames[kind]
  const valid = (kind === 'phone' ? phonePattern : emailPattern).test(value.trim())
  useEffect(() => {
    if (!countdown) return
    const timer = window.setTimeout(() => setCountdown(value => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const changeValue = (next: string) => {
    setValue(next)
    setCode('')
    setError(null)
    if (next.trim() !== verifiedTarget) {
      setVerifiedTarget('')
      setCountdown(0)
    }
  }

  const requestCode = () => {
    if (!valid) return setError({ field: 'value', message: `请输入有效的${label}` })
    setVerifiedTarget(value.trim())
    setCountdown(60)
    setError(null)
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return setError({ field: 'value', message: `请输入有效的${label}` })
    if (verifiedTarget !== value.trim()) return setError({ field: 'code', message: '请先获取当前账号信息的验证码' })
    if (code.length !== 6) return setError({ field: 'code', message: '请输入6位验证码' })
    if (!save(value.trim())) setError({ field: 'save', message: '保存失败，请重试' })
  }
  return <CorpusDialog title={`修改${label}`} className="account-dialog account-form-dialog" onClose={close}>
    <form onSubmit={submit} noValidate>
      <div className="account-dialog-fields">
        <label htmlFor="account-contact-value">{label} <b>*</b></label>
        <input id="account-contact-value" aria-required="true" aria-invalid={error?.field === 'value'} type={kind === 'phone' ? 'tel' : 'email'} autoComplete={kind === 'phone' ? 'tel' : 'email'} placeholder={`请输入新${label}`} value={value} onChange={event => changeValue(event.target.value)} />
        <label htmlFor="account-contact-code">验证码 <b>*</b></label>
        <div className="account-code-field" data-invalid={error?.field === 'code'}>
          <input id="account-contact-code" aria-required="true" aria-invalid={error?.field === 'code'} inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(null) }} />
          <button type="button" onClick={requestCode} disabled={countdown > 0}>{countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}</button>
        </div>
        {error ? <p className="account-form-error" role="alert">{error.message}</p> : verifiedTarget === value.trim() && verifiedTarget && <p className="account-demo-hint" role="status">演示模式，请输入任意 6 位数字</p>}
      </div>
      <div className="account-dialog-actions"><button type="button" onClick={close}>取消</button><button type="submit" className="is-primary">确认</button></div>
    </form>
  </CorpusDialog>
}

function PasswordDialog({ close, complete }: { close: () => void; complete: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 6) return setError('密码至少为6位')
    if (confirm !== password) return setError('两次输入的密码不一致')
    complete()
  }
  return <CorpusDialog title="修改密码" className="account-dialog account-form-dialog" onClose={close}>
    <form onSubmit={submit}>
      <div className="account-dialog-fields">
        <label htmlFor="account-new-password">新密码 <b>*</b></label>
        <input id="account-new-password" type="password" autoComplete="new-password" placeholder="请输入新密码" value={password} onChange={event => { setPassword(event.target.value); setError('') }} />
        <label htmlFor="account-confirm-password">确认密码 <b>*</b></label>
        <input id="account-confirm-password" type="password" autoComplete="new-password" placeholder="请再次输入新密码" value={confirm} onChange={event => { setConfirm(event.target.value); setError('') }} />
        {error ? <p role="alert" className="account-form-error">{error}</p> : <p className="account-demo-hint">演示模式，请勿填写真实密码</p>}
      </div>
      <div className="account-dialog-actions"><button type="button" onClick={close}>取消</button><button type="submit" className="is-primary">确认</button></div>
    </form>
  </CorpusDialog>
}

function AccountSettingsContent({ account, name }: { account: string; name: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'privacy' ? 'privacy' : 'security'
  const [settings, setSettings] = useState(() => loadSettings(account))
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [toast, setToast] = useState('')
  const close = () => setDialog(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const save = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    try { window.localStorage.setItem(storeKey(account), JSON.stringify(next)) } catch { return false }
    setSettings(next)
    return true
  }
  const update = (patch: Partial<Settings>, message: string) => {
    if (!save(patch)) { setToast('保存失败，请重试'); return false }
    close()
    setToast(message)
    return true
  }
  const [localPart, domain] = settings.email.split('@')
  const phone = settings.phone ? `${settings.phone.slice(0, 3)} ****** ${settings.phone.slice(-2)}` : ''
  const email = domain ? `${localPart.slice(0, 3)} *** @${domain}` : ''

  return (
    <section className="account-settings-page" aria-label="设置">
      <Tabs.Root className="account-settings-panel" value={tab} onValueChange={next => setSearchParams(next === 'privacy' ? { tab: 'privacy' } : {}, { replace: true })}>
        <Tabs.List className="account-settings-tabs" aria-label="账号设置">
          <Tabs.Trigger value="security">账号与安全</Tabs.Trigger>
          <Tabs.Trigger value="privacy">隐私设置</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="account-settings-content" value="security">
          <h1>登录方式</h1>
          <div className="account-methods">
            <SettingsRow kind="phone" icon={<Smartphone size={14} />} label="手机号" value={phone} onClick={() => setDialog('phone')} />
            <SettingsRow kind="email" icon={<Mail size={14} />} label="邮箱" value={email} onClick={() => setDialog('email')} />
            <SettingsRow kind="wechat" icon={<WeChatIcon size={17} />} label="微信" value={settings.wechat} action={settings.wechat ? '解绑' : '绑定'} onClick={() => setDialog(settings.wechat ? 'unbind' : 'bind')} />
            <SettingsRow kind="password" icon={<LockKeyhole size={14} />} label="密码" value="已设置" onClick={() => setDialog('password')} />
          </div>
        </Tabs.Content>
        <Tabs.Content className="account-settings-content account-privacy" value="privacy">
          {privacyGroups.map(group => <fieldset key={group.key}>
            <legend>{group.title}</legend>
            <div className="account-privacy-options">{group.options.map(option => <label key={option}>
              <input type="radio" name={group.key} value={option} checked={settings.privacy[group.key] === option} onChange={() => {
                setToast(save({ privacy: { ...settings.privacy, [group.key]: option } }) ? '隐私设置已保存' : '保存失败，请重试')
              }} />{option}
            </label>)}</div>
          </fieldset>)}
        </Tabs.Content>
      </Tabs.Root>
      {(dialog === 'phone' || dialog === 'email') && <ContactDialog key={dialog} kind={dialog} current={settings[dialog]} close={close} save={value => update({ [dialog]: value }, `${contactNames[dialog]}已更新`)} />}
      {dialog === 'password' && <PasswordDialog close={close} complete={() => { close(); setToast('演示验证完成，未修改登录密码') }} />}
      {dialog === 'unbind' && <CorpusDialog className="account-dialog account-wechat-dialog" onClose={close} labelledBy="account-wechat-unbind-title" closeLabel="关闭微信解绑">
        <CircleAlert className="account-wechat-alert" size={38} color="#ff8100" strokeWidth={2.2} />
        <h2 id="account-wechat-unbind-title">微信解绑</h2>
        <p>解绑微信后，您将无法使用该微信扫码登录，也无法在微信内接收任务、节点等异常消息，是否确认解绑？</p>
        <div className="account-dialog-actions"><button type="button" onClick={close}>取消</button><button type="button" className="is-primary" onClick={() => update({ wechat: '' }, '微信已解绑')}>确定</button></div>
      </CorpusDialog>}
      {dialog === 'bind' && <CorpusDialog className="account-dialog account-wechat-dialog account-wechat-bind" onClose={close} labelledBy="account-wechat-bind-title" closeLabel="关闭微信绑定">
        <h2 id="account-wechat-bind-title">微信绑定</h2>
        <p>使用 <span className="account-wechat-brand"><WeChatIcon size={17} />微信</span> 扫码绑定</p>
        <img src={`${import.meta.env.BASE_URL}images/wechat-demo-qr.svg`} alt="微信绑定演示二维码" width="168" height="168" />
        <button type="button" className="account-simulate-link" onClick={() => update({ wechat: name }, '演示绑定成功')}>模拟扫码绑定</button>
      </CorpusDialog>}
      {toast && <div className="avatar-share-toast account-settings-toast" role="status">{toast}</div>}
    </section>
  )
}

export default function AccountSettings() {
  const { user } = useApp()
  return user ? <AccountSettingsContent key={user.account} account={user.account} name={user.name} /> : null
}
