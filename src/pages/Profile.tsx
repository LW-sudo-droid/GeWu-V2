import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useApp } from '../context/app-context'
import { corpusRecords, type CorpusRecord } from './CorpusSearch'
import { DemandPoster, initialDemandPosts, type DemandPost } from './DemandSquare'

type MainTab = 'corpora' | 'demands' | 'privacy'
type CorpusTab = 'managed' | 'joined' | 'favorite'
type DemandTab = 'published' | 'favorited' | 'commented' | 'following' | 'followers'
type NoticeTab = 'audit' | 'comment'
type ModalType = 'avatar' | 'basic' | null
type PrivacyKey = '我管理的语料库' | '我加入的语料库' | '我收藏的语料库' | '已发布的需求' | '已收藏的需求' | '已评论的需求' | '我的关注' | '我的粉丝'
type PrivacyValue = '公开' | '仅关注我的人可见' | '仅自己可见'

type UserProfile = {
  username: string
  institution: string
  contact: string
  researchField: string
  position: string
  bio: string
  avatar: string
}

type CommunityUser = { id: string; name: string; role: string; mutual?: boolean; following: boolean }
type Notice = {
  id: number
  role: 'admin' | 'uploader' | 'member' | 'creator' | 'platform'
  kind: 'pending' | 'approved' | 'rejected'
  corpusId: string
  corpusName: string
  userName: string
  time: string
  reason?: string
  permission?: '可管理' | '可上传'
  createdAt?: string
}
type CommentNotice = { id: number; user: string; text: string; time: string; kind: 'corpus' | 'demand'; targetId: string }

const emptyProfile = (username = ''): UserProfile => ({
  username,
  institution: '',
  contact: '',
  researchField: '',
  position: '',
  bio: '',
  avatar: '',
})

function loadProfile(account: string, username: string) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(`gw-profile-${account}`) ?? '{}')
    return { ...emptyProfile(username), ...stored, username: stored.username || username } as UserProfile
  } catch {
    return emptyProfile(username)
  }
}

function corpusByIds(ids: string[]) {
  return ids.map((id) => corpusRecords.find((item) => item.id === id)).filter((item): item is CorpusRecord => Boolean(item))
}

const managedIds = ['math-01', 'physics-01', 'chem-01']
const joinedIds = ['geo-04', 'bio-02', 'astro-02', 'math-03', 'physics-02', 'chem-04', 'astro-04', 'geo-03', 'physics-04', 'geo-01', 'math-02', 'bio-01']
const favoriteDefaultIds = ['chem-01', 'physics-02', 'geo-01', 'bio-02', 'math-02', 'astro-01', 'geo-04', 'physics-03']

const communityUsers: CommunityUser[] = [
  { id: 'user-lin', name: '林知远', role: '材料语料发起人 · 北京大学化学与分子工程学院', following: true },
  { id: 'user-lab', name: '医学语料联合实验室', role: '生物医学语料团队 · 健康医疗大数据国家研究院', mutual: true, following: true },
  { id: 'user-chen', name: '陈明', role: '形式化数学研究者 · 北京大学数学科学学院', mutual: true, following: true },
  { id: 'user-wang', name: '王磊', role: '地理时空数据研究者 · 南京大学', following: false },
  { id: 'user-li', name: '李思远', role: '医学影像方向 · 中南大学湘雅医院', following: false },
  { id: 'user-zhang', name: '张伟', role: '语料平台科研用户 · 北京大学', mutual: true, following: true },
  { id: 'user-xu', name: '许青', role: '天文观测数据研究者 · 厦门大学', following: false },
  { id: 'user-he', name: '何静', role: '材料计算方向 · 北京石墨烯研究院', following: false },
]

const notices: Notice[] = [
  { id: 1, role: 'admin', kind: 'pending', corpusId: 'math-01', corpusName: '基础数学定理证明长思维链语料', userName: '李思远', time: '2026-09-05 14:22', permission: '可上传' },
  { id: 2, role: 'admin', kind: 'pending', corpusId: 'physics-01', corpusName: '量子力学问题求解与推理过程语料', userName: '建设编辑', time: '2026-09-06 09:10' },
  { id: 3, role: 'uploader', kind: 'approved', corpusId: 'math-02', corpusName: '概率论与数理统计问题求解语料', userName: '王磊', time: '2026-09-04 16:40' },
  { id: 4, role: 'uploader', kind: 'rejected', corpusId: 'chem-04', corpusName: '环境化学专业问答与推理语料', userName: '何静', time: '2026-09-03 11:05', reason: '数据样例不足，请补充字段口径说明' },
  { id: 5, role: 'member', kind: 'approved', corpusId: 'geo-04', corpusName: '城市空间结构与功能区识别语料', userName: '许青', time: '2026-09-02 10:18', permission: '可上传' },
  { id: 6, role: 'member', kind: 'rejected', corpusId: 'bio-02', corpusName: '代谢小分子化合物结构语料', userName: '张伟', time: '2026-09-01 15:47', reason: '单位与实名信息不符', permission: '可管理' },
  { id: 7, role: 'creator', kind: 'approved', corpusId: 'astro-04', corpusName: '射电天文观测数据与说明语料', userName: '许青', time: '2026-08-30 09:32', createdAt: '2026-08-28 10:00' },
  { id: 8, role: 'platform', kind: 'pending', corpusId: 'geo-01', corpusName: '中国典型城市高分辨率遥感影像语料', userName: '王磊', time: '2026-09-06 17:20' },
]

const commentNotices: CommentNotice[] = [
  { id: 1, user: '医学语料联合实验室', text: '建议增加数据质量报告和版本间差异说明，方便长期引用。', time: '2026-09-05', kind: 'corpus', targetId: 'math-01' },
  { id: 2, user: '林知远', text: '样例数据结构很清楚，期待后续补充更多字段说明。', time: '2026-09-03', kind: 'corpus', targetId: 'physics-01' },
  { id: 3, user: '陈明', text: '已经按建议提交了联合申请，感谢答疑！', time: '2026-09-02', kind: 'demand', targetId: 'demand-math-001' },
  { id: 4, user: '李思远', text: '请问可以扩展语音方言类的共建需求吗？', time: '2026-08-30', kind: 'demand', targetId: 'demand-geo-001' },
]

const privacyOptions: PrivacyValue[] = ['公开', '仅关注我的人可见', '仅自己可见']
const privacyKeys: PrivacyKey[] = ['我管理的语料库', '我加入的语料库', '我收藏的语料库', '已发布的需求', '已收藏的需求', '已评论的需求', '我的关注', '我的粉丝']

const demandPageSize = 6

function Pager({ total, pageSize, current, onChange }: { total: number; pageSize: number; current: number; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const pages: number[] = []
  const start = Math.max(1, current - 5)
  const end = Math.min(pageCount, start + 10)
  for (let page = start; page <= end; page++) pages.push(page)
  return (
    <div className="profile-pager">
      <button type="button" disabled={current === 1} onClick={() => onChange(current - 1)}>上一页</button>
      {pages.map((page) => <button type="button" className={page === current ? 'is-active' : ''} key={page} onClick={() => onChange(page)}>{page}</button>)}
      <button type="button" disabled={current === pageCount} onClick={() => onChange(current + 1)}>下一页</button>
    </div>
  )
}

function noticeView(notice: Notice) {
  if (notice.role === 'admin' && notice.kind === 'pending') {
    const title = notice.permission ? '您有一条加入语料库的申请待审核' : '您有一条上传语料的申请待审核'
    const body = notice.permission
      ? `“${notice.userName}”向您管理的“${notice.corpusName}”提交了${notice.permission}权限的加入语料库申请，请查看申请内容并进行审核。`
      : `“${notice.userName}”向您管理的“${notice.corpusName}”提交了语料上传申请，请查看上传内容并进行审核。`
    return { title, body, action: '查看申请', to: `/search/datasets/${notice.corpusId}/audit` }
  }
  if (notice.role === 'uploader' && notice.kind === 'approved') {
    return { title: '您的语料上传审核已通过', body: `您向“${notice.corpusName}”提交的语料上传申请已通过审核，相关语料已成功加入该语料库`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'uploader' && notice.kind === 'rejected') {
    return { title: '您的语料上传申请未通过', body: `您向“${notice.corpusName}”提交的语料上传申请未通过审核，请根据审核意见修改后重新提交。审核意见：${notice.reason}；`, action: '查看申请', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'member' && notice.kind === 'approved') {
    return { title: `您的加入${notice.corpusName}（${notice.permission}）审核已通过`, body: `您向“${notice.corpusName}”提交的加入申请已通过审核`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'member' && notice.kind === 'rejected') {
    return { title: `您的加入${notice.corpusName}（${notice.permission}）未通过审核`, body: `您向“${notice.corpusName}”提交的加入申请未通过审核；审核意见：${notice.reason}；`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'creator') {
    return { title: `您于${notice.createdAt}创建的${notice.corpusName}已通过审核`, body: `您于${notice.createdAt}创建的${notice.corpusName}已通过审核`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  return { title: '您有一条创建语料库的申请待审核', body: `“${notice.userName}”提交了${notice.corpusName}的创建申请，请查看申请内容并进行审核。`, action: '查看申请', to: `/search/datasets/${notice.corpusId}/audit` }
}

export default function Profile() {
  const { user, openAuth, favorites } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MainTab>('corpora')
  const [corpusTab, setCorpusTab] = useState<CorpusTab>('managed')
  const [demandTab, setDemandTab] = useState<DemandTab>('published')
  const [noticeTab, setNoticeTab] = useState<NoticeTab>('audit')
  const [modal, setModal] = useState<ModalType>(null)
  const [noticeItem, setNoticeItem] = useState<Notice | null>(null)
  const [profile, setProfile] = useState<UserProfile>(() => user ? loadProfile(user.account, user.name) : emptyProfile())
  const [draft, setDraft] = useState<UserProfile>(profile)
  const [avatarDraft, setAvatarDraft] = useState('')
  const [corpusPage, setCorpusPage] = useState(1)
  const [demandPage, setDemandPage] = useState(1)
  const [userFollowed, setUserFollowed] = useState<Record<string, boolean>>(() => Object.fromEntries(communityUsers.map((u) => [u.id, u.following])))
  const [privacy, setPrivacy] = useState<Record<PrivacyKey, PrivacyValue>>(() => Object.fromEntries(privacyKeys.map((key) => [key, '公开' as PrivacyValue])) as Record<PrivacyKey, PrivacyValue>)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      setProfile(emptyProfile())
      return
    }
    const nextProfile = loadProfile(user.account, user.name)
    setProfile(nextProfile)
    setDraft(nextProfile)
  }, [user])

  const favoriteIds = useMemo(() => [...new Set([...favorites.map((item) => item.id), ...favoriteDefaultIds])], [favorites])

  const managedCorpora = corpusByIds(managedIds)
  const joinedCorpora = corpusByIds(joinedIds)
  const favoriteCorpora = corpusByIds(favoriteIds)

  const corpusList = corpusTab === 'managed' ? managedCorpora : corpusTab === 'joined' ? joinedCorpora : favoriteCorpora
  const visibleCorpora = corpusList.slice((corpusPage - 1) * 6, corpusPage * 6)

  const demandMap: Record<'published' | 'favorited' | 'commented', DemandPost[]> = {
    published: initialDemandPosts.slice(0, 7),
    favorited: [...initialDemandPosts].reverse().slice(0, 7),
    commented: initialDemandPosts.slice(2, 9),
  }
  const visibleDemands = demandTab === 'published' || demandTab === 'favorited' || demandTab === 'commented'
    ? demandMap[demandTab].slice((demandPage - 1) * demandPageSize, demandPage * demandPageSize)
    : []
  const filteredUsers = demandTab === 'following' ? communityUsers.filter((item) => userFollowed[item.id]) : communityUsers
  const visibleUsers = filteredUsers.slice((demandPage - 1) * demandPageSize, demandPage * demandPageSize)

  const persistProfile = (nextProfile: UserProfile) => {
    if (!user) return
    window.localStorage.setItem(`gw-profile-${user.account}`, JSON.stringify(nextProfile))
    setProfile(nextProfile)
    setDraft(nextProfile)
  }

  const openModal = (type: Exclude<ModalType, null>) => {
    if (type === 'avatar') setAvatarDraft(profile.avatar)
    else setDraft(profile)
    setModal(type)
  }

  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setAvatarDraft(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const confirmAvatar = () => {
    persistProfile({ ...profile, avatar: avatarDraft })
    setModal(null)
  }

  const submitBasic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.username.trim() || !draft.institution.trim() || !draft.contact.trim()) return
    const next = { ...profile }
    for (const key of ['username', 'institution', 'contact', 'researchField', 'position', 'bio'] as const) {
      next[key] = draft[key]
    }
    persistProfile(next)
    setModal(null)
  }

  if (!user) {
    return (
      <main className="profile-page profile-guest-page">
        <section className="profile-guest-card">
          <div className="profile-guest-icon"><UserRound size={35} /></div>
          <h1>个人主页</h1>
          <p>登录后可管理个人资料，以及已认领、已上传和已收藏的语料库</p>
          <button type="button" onClick={() => openAuth('/profile')}>登录平台</button>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <aside className="profile-side">
          <section className="profile-user-card-top">
            <button className="profile-avatar-button" type="button" onClick={() => openModal('avatar')} aria-label="编辑头像">
              {profile.avatar ? <img src={profile.avatar} alt="" /> : <span>{profile.username.slice(0, 1)}</span>}
              <i><Camera size={13} /></i>
            </button>
            <h1>{profile.username || '未设置用户名'}</h1>
            <p><Building2 size={14} />{profile.institution || '暂未填写机构'}</p>
            {profile.contact && <p className="profile-contact"><UserRound size={14} />{profile.contact}</p>}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <span><b>12</b>关注</span>
              <span><b>128</b>粉丝</span>
              <span><b>356</b>被收藏</span>
            </div>
            <button className="profile-edit-basic" type="button" onClick={() => openModal('basic')}><Pencil size={15} />编辑基本信息</button>
          </section>

          <section className="profile-messages">
            <header><Bell size={17} /><h2>消息</h2></header>
            <nav className="profile-notice-tabs">
              <button type="button" className={noticeTab === 'audit' ? 'is-active' : ''} onClick={() => setNoticeTab('audit')}><ShieldCheck size={14} />审核通知</button>
              <button type="button" className={noticeTab === 'comment' ? 'is-active' : ''} onClick={() => setNoticeTab('comment')}><MessageCircle size={14} />评论</button>
            </nav>
            {noticeTab === 'audit' ? (
              <div className="profile-notice-list">
                {notices.map((notice) => (
                  <button type="button" className="profile-notice-item" key={notice.id} onClick={() => setNoticeItem(notice)}>
                    <strong>系统通知</strong>
                    <p>{notice.role === 'admin' && notice.kind === 'pending' ? `您有一条${notice.permission ? '加入语料库' : '上传语料'}的申请待审核` : noticeView(notice).title}</p>
                    <small>{notice.time}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="profile-notice-list">
                {commentNotices.map((item) => (
                  <button type="button" className="profile-comment-item" key={item.id} onClick={() => navigate(item.kind === 'corpus' ? `/search/datasets/${item.targetId}` : `/demands/${item.targetId}`)}>
                    <span className="profile-comment-avatar">{item.user.slice(0, 1)}</span>
                    <div>
                      <strong>{item.user}</strong>
                      <p>{item.text}</p>
                      <small>{item.time}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>

        <section className="profile-main">
          <nav className="profile-main-tabs">
            <button type="button" className={activeTab === 'corpora' ? 'is-active' : ''} onClick={() => { setActiveTab('corpora'); setCorpusPage(1) }}>我的语料库</button>
            <button type="button" className={activeTab === 'demands' ? 'is-active' : ''} onClick={() => { setActiveTab('demands'); setDemandPage(1) }}>需求动态</button>
            <button type="button" className={activeTab === 'privacy' ? 'is-active' : ''} onClick={() => setActiveTab('privacy')}>隐私设置</button>
          </nav>

          {activeTab === 'corpora' && (
            <>
              <div className="profile-sub-tabs">
                {([['managed', '我管理的'], ['joined', '我加入的'], ['favorite', '我收藏的']] as Array<[CorpusTab, string]>).map(([key, label]) => (
                  <button type="button" className={corpusTab === key ? 'is-active' : ''} key={key} onClick={() => { setCorpusTab(key); setCorpusPage(1) }}>{label}</button>
                ))}
              </div>
              <div className="profile-corpus-grid">
                {visibleCorpora.map((item) => (
                  <Link className="catalog-corpus-card" to={`/search/datasets/${item.id}`} target="_blank" rel="noreferrer" key={item.id}>
                    <div className="quality-card-visual catalog-card-visual" aria-hidden="true">
                      <span className={`card-status-overlay ${item.openness === '不公开' ? 'is-private' : 'is-partial'}`}>{item.openness === '不公开' ? '不公开' : '公开'}</span>
                      <span className="visual-line visual-line-one" />
                      <span className="visual-line visual-line-two" />
                      <span className="visual-node node-one" />
                      <span className="visual-node node-two" />
                      <span className="visual-node node-three" />
                      <span className="visual-node node-four" />
                      <span className="visual-bar bar-one" />
                      <span className="visual-bar bar-two" />
                      <span className="visual-bar bar-three" />
                      <span className="visual-bar bar-four" />
                    </div>
                    <div className="catalog-card-meta-row">
                      <div className="catalog-card-tags"><span className="catalog-subject-tag">{item.subject}</span></div>
                      <time dateTime={item.publishedAt}><CalendarDays size={13} />{item.publishedAt}</time>
                    </div>
                    <h3>{item.title}</h3>
                    <div className="catalog-card-metadata"><span><Building2 size={14} />{item.organization} - {item.authors}</span></div>
                    <p>{item.summary}</p>
                    <footer>
                      <span className="card-org-mark" aria-hidden="true">{item.organization.slice(0, 1)}</span>
                      <strong className="card-organization-name">{item.organization} - {item.authors}</strong>
                      <span><Download size={14} />{item.usage.toLocaleString()}</span>
                      <span><Eye size={14} />{item.views.toLocaleString()}</span>
                      <span><Star size={14} />{item.favorites.toLocaleString()}</span>
                    </footer>
                  </Link>
                ))}
              </div>
              <Pager total={corpusList.length} pageSize={6} current={corpusPage} onChange={setCorpusPage} />
            </>
          )}

          {activeTab === 'demands' && (
            <>
              <div className="profile-sub-tabs">
                {([['published', '已发布'], ['favorited', '已收藏'], ['commented', '已评论'], ['following', '关注'], ['followers', '粉丝']] as Array<[DemandTab, string]>).map(([key, label]) => (
                  <button type="button" className={demandTab === key ? 'is-active' : ''} key={key} onClick={() => { setDemandTab(key); setDemandPage(1) }}>{label}</button>
                ))}
              </div>
              {(demandTab === 'published' || demandTab === 'favorited' || demandTab === 'commented') && (
                <>
                  <div className="profile-demand-grid">
                    {visibleDemands.map((post) => (
                      <Link className="demand-post-card" to={`/demands/${post.id}`} key={post.id}>
                        <button className="demand-card-main" type="button" aria-label={`查看${post.title}详情`}>
                          <DemandPoster demand={post} />
                          <div className="demand-post-body">
                            <h2>{post.corpusName}</h2>
                            <footer>
                              <span className="demand-avatar small"><span>{post.author.slice(0, 1)}</span></span>
                              <small>{post.organization}</small>
                            </footer>
                          </div>
                        </button>
                        <div className="demand-post-actions" aria-hidden="true">
                          <span><Heart size={17} />{post.likes}</span>
                          <span><Star size={17} />{post.bookmarks}</span>
                          <span><MessageCircle size={17} />{post.comments}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Pager total={demandMap[demandTab as 'published'].length} pageSize={demandPageSize} current={demandPage} onChange={setDemandPage} />
                </>
              )}
              {(demandTab === 'following' || demandTab === 'followers') && (
                <>
                  <div className="profile-user-grid">
                    {visibleUsers.map((item) => {
                      const followed = userFollowed[item.id]
                      const label = item.mutual ? '互相关注' : followed ? '已关注' : '关注'
                      return (
                        <article className="profile-user-card" key={item.id}>
                          <span className="profile-user-avatar">{item.name.slice(0, 1)}</span>
                          <div><strong>{item.name}</strong><small>{item.role}</small></div>
                          <button type="button" className={followed ? 'is-followed' : ''} onClick={() => setUserFollowed((current) => ({ ...current, [item.id]: !current[item.id] }))}>{label}</button>
                        </article>
                      )
                    })}
                  </div>
                  <Pager total={filteredUsers.length} pageSize={demandPageSize} current={demandPage} onChange={setDemandPage} />
                </>
              )}
            </>
          )}

          {activeTab === 'privacy' && (
            <div className="profile-privacy">
              <p className="profile-privacy-intro">设置个人主页对外展示内容的可见范围</p>
              {privacyKeys.map((key) => (
                <label className="profile-privacy-row" key={key}>
                  <span>{key}</span>
                  <select value={privacy[key]} onChange={(event) => setPrivacy((current) => ({ ...current, [key]: event.target.value as PrivacyValue }))}>
                    {privacyOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      {modal === 'avatar' && (
        <div className="dataset-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className="dataset-modal profile-avatar-modal" role="dialog" aria-modal="true">
            <div className="dataset-modal-title"><div><Camera size={21} /><h2>编辑头像</h2></div><button type="button" onClick={() => setModal(null)} aria-label="关闭"><X size={18} /></button></div>
            <div className="profile-avatar-preview">{avatarDraft ? <img src={avatarDraft} alt="" /> : <span>{profile.username.slice(0, 1)}</span>}</div>
            <div className="profile-avatar-actions">
              <button type="button" onClick={() => avatarInputRef.current?.click()}><Camera size={15} />上传头像</button>
              <button type="button" onClick={() => setModal(null)}>取消</button>
              <button type="button" className="is-primary" onClick={confirmAvatar}>确认</button>
            </div>
            <input ref={avatarInputRef} hidden type="file" accept="image/*" onChange={uploadAvatar} />
          </section>
        </div>
      )}

      {modal === 'basic' && (
        <div className="dataset-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <form className="dataset-modal profile-edit-modal" onSubmit={submitBasic}>
            <div className="dataset-modal-title"><div><Pencil size={21} /><h2>编辑基本信息</h2></div><button type="button" onClick={() => setModal(null)} aria-label="关闭"><X size={18} /></button></div>
            <p>更新个人主页对外展示的名称与机构信息</p>
            <div className="profile-form-grid">
              <label><span>用户名 <b>*</b></span><input required value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="请输入用户名" /></label>
              <label><span>所在单位 <b>*</b></span><input required value={draft.institution} onChange={(event) => setDraft({ ...draft, institution: event.target.value })} placeholder="请输入所在机构" /></label>
              <label className="is-wide"><span>联系方式（手机号/邮箱）<b>*</b></span><input required value={draft.contact} onChange={(event) => setDraft({ ...draft, contact: event.target.value })} placeholder="请输入手机号或邮箱" /></label>
              <label><span>研究领域</span><input value={draft.researchField} onChange={(event) => setDraft({ ...draft, researchField: event.target.value })} placeholder="如：计算数学" /></label>
              <label><span>职务</span><input value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })} placeholder="如：教师、科研人员" /></label>
              <label className="is-wide"><span>个人简介</span><textarea rows={4} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} placeholder="简要介绍您的研究方向或语料建设经历" /></label>
            </div>
            <div className="dataset-modal-actions"><button type="button" onClick={() => setModal(null)}>取消</button><button type="submit" className="is-primary">确认</button></div>
          </form>
        </div>
      )}

      {noticeItem && (
        <div className="dataset-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoticeItem(null) }}>
          <section className="dataset-modal profile-notice-modal" role="dialog" aria-modal="true">
            <div className="dataset-modal-title"><div><ShieldCheck size={21} /><h2>审核通知</h2></div><button type="button" onClick={() => setNoticeItem(null)} aria-label="关闭"><X size={18} /></button></div>
            {(() => {
              const view = noticeView(noticeItem)
              return (
                <>
                  <h3 className="profile-notice-title">{view.title}</h3>
                  <p className="profile-notice-body">{view.body}</p>
                  <div className="dataset-modal-actions">
                    <button type="button" onClick={() => { setNoticeItem(null); navigate(view.to) }}>{view.action}</button>
                    <button type="button" className="is-primary" onClick={() => setNoticeItem(null)}>知道了</button>
                  </div>
                </>
              )
            })()}
          </section>
        </div>
      )}
    </main>
  )
}
