import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, CircleAlert, Plus, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { avatarUrl } from '../data/community-users'
import { appendCorpusMembers, findMemberCandidates, type CorpusMember, type MemberPermission, type MemberPerson } from '../data/corpus-members'
import './member-management-dialog.css'

type Props = { members: CorpusMember[]; onCancel: () => void; onConfirm: (members: CorpusMember[]) => void }

function EmptyMembers({ search = false }: { search?: boolean }) {
  return <div className="cm-empty" role="status">
    <svg width="96" height="88" viewBox="0 0 96 88" fill="none" aria-hidden="true">
      {search ? <>
        <rect x="13" y="12" width="35" height="43" rx="4" fill="#e5e7ed" />
        <circle cx="21" cy="19" r="2" fill="white" /><circle cx="28" cy="19" r="2" fill="white" />
        <path d="M19 31 42 19h29l7 40H18z" fill="#eef0f5" />
        <path d="m25 28 57 0-6 40H18z" fill="white" stroke="#e2e5ed" />
        <circle cx="76" cy="56" r="12" fill="white" stroke="#e2e5eb" strokeWidth="5" />
        <path d="m85 65 9 11" stroke="#e2e5eb" strokeWidth="5" strokeLinecap="round" />
        <circle cx="24" cy="69" r="14" fill="#eceef4" stroke="white" strokeWidth="2" />
        <path d="m20 65 8 8m0-8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </> : <>
        <path d="m25 22 25-8 27 19-27 8z" fill="#eceef3" />
        <path d="m17 36 33-4 29 13-33 9z" fill="#e2e5ed" />
        <path d="m24 44 26 7 1 34-27-8z" fill="#f5f6f9" stroke="#dce1eb" />
        <path d="m51 51 30-9v34l-30 9z" fill="#e3e6ed" />
        <path d="m17 34-9 15 17 4 10-16m16 14 13 11 25-8-9-13" fill="white" stroke="#e1e5ed" />
        <path d="m26 24 5-9 12 17m10 0 20-4 10 8" fill="white" />
        <path d="M10 60h20v25L20 80l-10 5z" fill="#eef0f5" />
        <path d="m16 65 8 8m0-8-8 8" stroke="white" strokeWidth="2" />
      </>}
    </svg>
    <p>{search ? '搜索无结果' : '暂无成员'}</p>
  </div>
}

export default function MemberManagementDialog({ members, onCancel, onConfirm }: Props) {
  const [draftMembers, setDraftMembers] = useState(() => members.map((member) => ({ ...member })))
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<MemberPerson[]>([])
  const [permission, setPermission] = useState<MemberPermission>('可上传')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [menuUp, setMenuUp] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState(0)
  const [message, setMessage] = useState('')
  const dialogRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const candidates = findMemberCandidates(keyword, draftMembers)
  const showResults = searchOpen && Boolean(query.trim() || selected.length)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const dismiss = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!searchRef.current?.contains(target)) setSearchOpen(false)
      if (!target.closest('.cm-permission')) { setMenu(null); setRemoving(null) }
    }
    document.addEventListener('mousedown', dismiss)
    return () => {
      document.removeEventListener('mousedown', dismiss)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  const selectPerson = (person: MemberPerson) => {
    setSelected((current) => current.some((entry) => entry.account === person.account) ? current.filter((entry) => entry.account !== person.account) : [...current, person])
    setQuery('')
    setHighlighted(0)
    setMessage('')
    inputRef.current?.focus()
  }
  const addSelected = () => {
    if (!selected.length) return
    setDraftMembers((current) => appendCorpusMembers(current, selected, permission))
    setSelected([])
    setQuery('')
    setKeyword('')
    setSearchOpen(false)
    setMenu(null)
    setMessage('')
  }
  const choosePermission = (value: MemberPermission, account: string) => {
    if (account === '$new') setPermission(value)
    else setDraftMembers((current) => current.map((member) => member.account === account ? { ...member, permission: value } : member))
    setMenu(null)
  }
  const renderPermission = (account: string, value: MemberPermission) => <div className="cm-permission">
    <button className="cm-permission-trigger" type="button" aria-label={account === '$new' ? '新增成员权限' : `设置${draftMembers.find((member) => member.account === account)?.name}的权限`} aria-haspopup="menu" aria-expanded={menu === account} onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const body = event.currentTarget.closest('.cm-body')?.getBoundingClientRect(); setMenuUp(account !== '$new' && rect.bottom + 180 > (body?.bottom ?? window.innerHeight - 24)); setMenu(menu === account ? null : account); setRemoving(null) }}><span>{value}</span><ChevronDown size={16} /></button>
    {menu === account && <div className={`cm-permission-menu${menuUp ? ' is-upward' : ''}`} role="menu" aria-label="成员权限">
      {(['可上传', '可管理'] as const).map((option) => <button role="menuitemradio" aria-checked={value === option} type="button" key={option} onClick={() => choosePermission(option, account)}>{option}</button>)}
      {account !== '$new' && <button className="cm-remove-option" role="menuitem" type="button" onClick={() => setRemoving(account)}>移除</button>}
    </div>}
    {removing === account && <div className={`cm-remove-popover${menuUp ? ' is-upward' : ''}`} role="alertdialog" aria-label="确认移除成员">
      <p><CircleAlert size={17} fill="#ff8700" color="white" /><span>确认要移除该成员？</span></p>
      <div><button type="button" onClick={() => setRemoving(null)}>取消</button><button className="cm-remove-confirm" type="button" onClick={() => { setDraftMembers((current) => current.filter((member) => member.account !== account)); setRemoving(null); setMenu(null) }}>移除</button></div>
    </div>}
  </div>

  return createPortal(<div className="corpus-members-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
    <section className="corpus-members-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="corpus-members-title" onKeyDown={(event) => {
      if (event.key === 'Escape') { event.stopPropagation(); if (removing) setRemoving(null); else if (menu) setMenu(null); else if (searchOpen) setSearchOpen(false); else onCancel() }
      if (event.key !== 'Tab') return
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]')
      if (!controls?.length) return
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus() }
    }}>
      <header className="cm-header"><h2 id="corpus-members-title">管理成员</h2><button className="cm-close" type="button" aria-label="关闭管理成员" onClick={onCancel}><X size={23} strokeWidth={1.7} /></button></header>
      <div className={`cm-body${showResults ? ' is-searching' : ''}`}>
        <div className="cm-search" ref={searchRef}>
          <div className="cm-search-control">
            <div className="cm-selected-input" onClick={() => inputRef.current?.focus()}>
              {selected.map((person) => <span className="cm-selected-person" key={person.account}>{person.name}<button type="button" aria-label={`取消选择${person.name}`} onClick={(event) => { event.stopPropagation(); setSelected((current) => current.filter((entry) => entry.account !== person.account)) }}><X size={12} /></button></span>)}
              <input ref={inputRef} value={query} placeholder={selected.length ? '' : '搜索用户账号'} aria-label="搜索用户账号" role="combobox" aria-expanded={showResults} aria-controls={showResults ? 'cm-search-results' : undefined} aria-activedescendant={showResults && candidates[highlighted] ? `cm-result-${candidates[highlighted].account}` : undefined} autoComplete="off" onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setKeyword(event.target.value); setSearchOpen(true); setHighlighted(0); setMessage('') }} onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setSearchOpen(true); setHighlighted((index) => candidates.length ? (index + (event.key === 'ArrowDown' ? 1 : -1) + candidates.length) % candidates.length : 0) }
                if (event.key === 'Enter') { event.preventDefault(); if (showResults && candidates[highlighted]) selectPerson(candidates[highlighted]); else if (selected.length) addSelected() }
                if (event.key === 'Backspace' && !query && selected.length) setSelected((current) => current.slice(0, -1))
              }} />
            </div>
            {selected.length > 0 && renderPermission('$new', permission)}
            <button className="cm-add" type="button" disabled={!selected.length} aria-label="添加选中的成员" onClick={addSelected}><Plus size={26} strokeWidth={1.4} /></button>
          </div>
          {showResults && <div className="cm-search-results" id="cm-search-results" role="listbox" aria-label="用户搜索结果" aria-multiselectable="true" onMouseDown={(event) => event.preventDefault()}>
            {candidates.length ? candidates.map((person, index) => <button type="button" role="option" id={`cm-result-${person.account}`} aria-selected={selected.some((entry) => entry.account === person.account)} className={`cm-person cm-result${highlighted === index ? ' is-highlighted' : ''}`} key={person.account} onMouseEnter={() => setHighlighted(index)} onClick={() => selectPerson(person)}>
              <img src={avatarUrl(person.avatar)} alt="" /><span className="cm-person-text"><strong>{person.name}</strong><small>{person.organization}</small></span>{selected.some((entry) => entry.account === person.account) && <Check className="cm-selected-check" size={17} />}
            </button>) : <EmptyMembers search />}
          </div>}
        </div>
        <div className="cm-member-list" aria-label="当前成员">
          {draftMembers.length ? draftMembers.map((member) => <div className="cm-person cm-member" key={member.account}><img src={avatarUrl(member.avatar)} alt={`${member.name}的头像`} /><span className="cm-person-text"><strong>{member.name}</strong><small>{member.organization}</small></span>{renderPermission(member.account, member.permission)}</div>) : <EmptyMembers />}
        </div>
      </div>
      <footer className="cm-footer">
        <span className="cm-feedback" role="status">{message}</span>
        <button type="button" onClick={onCancel}>取消</button>
        <button type="button" className="cm-confirm" onClick={() => { if (selected.length) { setMessage('请先点击 + 添加已选成员'); return } onConfirm(draftMembers) }}>确认</button>
      </footer>
    </section>
  </div>, document.body)
}
