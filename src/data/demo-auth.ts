import type { DemoUser } from '../context/app-context'

export type ContactMethod = 'phone' | 'email'
type DemoPassword = { salt: string; hash: string }
type DemoAccount = DemoUser & {
  phone?: string
  email?: string
  wechat?: boolean
  password?: DemoPassword
}

export const DEMO_CODE = '338869'
const ACCOUNTS_KEY = 'gw-demo-auth-accounts'
const REMEMBERED_PHONE_KEY = 'gw-demo-auth-remembered-phone'
const sampleAccount: DemoAccount = {
  account: '13800000000',
  phone: '13800000000',
  email: 'demo@example.com',
  name: '科学语料演示用户',
}

export const validContact = (method: ContactMethod, value: string) =>
  (method === 'phone' ? /^1[3-9]\d{9}$/ : /^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(value)

function readAccounts(): DemoAccount[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(record => record && typeof record.account === 'string') : []
  } catch {
    return []
  }
}

function saveAccount(account: DemoAccount) {
  const accounts = readAccounts().filter(entry => entry.account !== account.account)
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return account
}

export function findDemoAccount(method: ContactMethod, value: string) {
  const accounts = readAccounts()
  const account = accounts.find(entry => entry[method] === value)
  if (account) return account
  return sampleAccount[method] === value && !accounts.some(entry => entry.account === sampleAccount.account)
    ? sampleAccount
    : undefined
}

export function findWeChatDemoAccount() {
  return readAccounts().find(entry => entry.wechat)
}

export function registerDemoAccount(phone: string, source?: { email: string } | { wechat: true }) {
  if (findDemoAccount('phone', phone)) throw new Error('该手机号已注册账号')
  if (source && 'email' in source && findDemoAccount('email', source.email)) throw new Error('该邮箱已注册账号')
  return saveAccount({ account: source && 'email' in source ? source.email : phone, name: `科学语料用户${phone.slice(-4)}`, phone, ...source })
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function passwordHash(password: string, salt: string) {
  const encode = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encode.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: encode.encode(salt),
    iterations: 100_000,
  }, key, 256)
  return toHex(new Uint8Array(bits))
}

export function hasDemoPassword(account: DemoAccount) {
  return Boolean(account.password) || account.account === sampleAccount.account
}

export async function matchesDemoPassword(account: DemoAccount, password: string) {
  if (!account.password) return account.account === sampleAccount.account && password === 'Demo1234'
  return (await passwordHash(password, account.password.salt)) === account.password.hash
}

export async function setDemoPassword(account: DemoAccount, password: string) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await passwordHash(password, salt)
  const current = readAccounts().find(entry => entry.account === account.account) ?? account
  saveAccount({ ...current, password: { salt, hash } })
}

export function readRememberedPhone() {
  try { return window.localStorage.getItem(REMEMBERED_PHONE_KEY) ?? '' } catch { return '' }
}

export function rememberPhone(phone: string) {
  try {
    if (phone) window.localStorage.setItem(REMEMBERED_PHONE_KEY, phone)
    else window.localStorage.removeItem(REMEMBERED_PHONE_KEY)
  } catch {
    // The optional preference can be unavailable in private browsing.
  }
}
