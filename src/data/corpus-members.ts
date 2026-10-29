import { communityUsers, type CommunityUser } from './community-users'

export type MemberPermission = '可管理' | '可上传'
export type MemberPerson = { account: string; name: string; organization: string; avatar: string }
export type CorpusMember = MemberPerson & { permission: MemberPermission }

const portrait = (name: string) => `images/demand-users/${name}.jpg`
const designPeople: MemberPerson[] = [
  { account: 'wang_dunqiang', name: '王敦强', organization: '吉林师范大学', avatar: portrait('lab-director') },
  { account: 'li_yi', name: '李毅', organization: '沈阳建筑大学', avatar: portrait('language-researcher') },
  { account: 'zhou_beibei', name: '周蓓蓓', organization: '惠州学院', avatar: portrait('community-cat') },
  { account: 'li_shuping', name: '李淑萍', organization: '辽宁师范大学', avatar: portrait('language-researcher') },
  { account: 'he_mengying', name: '何梦影', organization: '太原科技大学', avatar: portrait('computer-researcher') },
  { account: 'wang_xianpu', name: '王鲑埔', organization: '汉江师范学院', avatar: portrait('community-cat') },
  { account: 'zhang_guanghong', name: '张光洪', organization: '河北农业大学', avatar: portrait('community-cat') },
  { account: 'zhang_haiying', name: '张海鹰', organization: '上海海关学院', avatar: portrait('language-researcher') },
  { account: 'zhang_xiaohui', name: '张晓珲', organization: '中央财经大学', avatar: portrait('computer-researcher') },
  { account: 'zhang_xuemei', name: '张雪梅', organization: '北京印刷学院', avatar: portrait('lab-director') },
  { account: 'zhang_boxi', name: '张博西', organization: '吉林工商学院', avatar: portrait('computer-researcher') },
  { account: 'zhang_wanyuan', name: '张婉宛', organization: '天津城建大学', avatar: portrait('language-researcher') },
]

export const memberDirectory: MemberPerson[] = [
  ...designPeople,
  ...communityUsers.map((person) => ({ account: person.id, name: person.name, organization: person.organization, avatar: person.avatar })),
]

export function defaultCorpusMembers(administrator: CommunityUser): CorpusMember[] {
  return [
    { account: administrator.id, name: administrator.name, organization: administrator.organization, avatar: administrator.avatar, permission: '可管理' },
    ...designPeople.slice(1, 6).map((person, index): CorpusMember => ({ ...person, permission: index % 2 === 0 ? '可上传' : '可管理' })),
  ]
}

export function readCorpusMembers(id: string, fallback: CorpusMember[]): CorpusMember[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(`gw-corpus-members-${id}`) ?? 'null')
    if (Array.isArray(stored) && stored.every((member) => member && typeof member.account === 'string' && typeof member.name === 'string' && typeof member.organization === 'string' && typeof member.avatar === 'string' && ['可管理', '可上传'].includes(member.permission))) {
      return stored.filter((member, index) => stored.findIndex((entry) => entry.account === member.account) === index)
    }
  } catch { /* Use the initial demo members when storage is unavailable. */ }
  return fallback
}

export function saveCorpusMembers(id: string, members: CorpusMember[]) {
  localStorage.setItem(`gw-corpus-members-${id}`, JSON.stringify(members))
}

export function findMemberCandidates(query: string, members: CorpusMember[], directory = memberDirectory): MemberPerson[] {
  const keyword = query.trim().toLocaleLowerCase()
  const existing = new Set(members.map((member) => member.account))
  return directory.filter((person) => !existing.has(person.account) && `${person.name} ${person.account} ${person.organization}`.toLocaleLowerCase().includes(keyword))
}

export function appendCorpusMembers(current: CorpusMember[], people: MemberPerson[], permission: MemberPermission): CorpusMember[] {
  const accounts = new Set(current.map((person) => person.account))
  return [...current, ...people.filter((person) => { if (accounts.has(person.account)) return false; accounts.add(person.account); return true }).map((person) => ({ ...person, permission }))]
}
