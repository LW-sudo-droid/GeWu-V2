export type CommunityUser = {
  id: string
  name: string
  role: string
  organization: string
  avatar: string
  followingCount: number
  fans: number
  collections: number
  followsYou: boolean
  following: boolean
}

// Shared demo identities: detail cards, visitor profiles and social lists use the same user IDs.
export const communityUsers: CommunityUser[] = [
  { id: 'user-lab', name: '医学语料联合实验室', role: '生物医学语料团队', organization: '北京大学健康医疗大数据国家研究院', avatar: 'images/demand-users/lab-director.jpg', followingCount: 9335, fans: 1141, collections: 1284, followsYou: true, following: true },
  { id: 'user-zheng', name: '郑以轩', role: '语言资源研究者', organization: '生命医学前沿创新中心', avatar: 'images/demand-users/language-researcher.jpg', followingCount: 93, fans: 84, collections: 77, followsYou: false, following: true },
  { id: 'user-zhao', name: '赵俊英', role: '人工智能研究者', organization: '北京大学物理学院', avatar: 'images/demand-users/computer-researcher.jpg', followingCount: 70, fans: 57, collections: 30, followsYou: false, following: true },
  { id: 'user-hui', name: '赵慧', role: '语料社区共建者', organization: '科学语料社区', avatar: 'images/demand-users/community-cat.jpg', followingCount: 21, fans: 20, collections: 1, followsYou: false, following: true },
  { id: 'user-lin', name: '林知远', role: '材料语料发起人', organization: '北京大学化学与分子工程学院', avatar: 'images/demand-users/computer-researcher.jpg', followingCount: 126, fans: 209, collections: 86, followsYou: true, following: false },
  { id: 'user-wang', name: '王溪蕾', role: '医学影像研究者', organization: '北京大学医学部', avatar: 'images/demand-users/lab-director.jpg', followingCount: 48, fans: 102, collections: 39, followsYou: true, following: false },
  { id: 'user-zhang', name: '张伟', role: '科学语料管理员', organization: '北京大学', avatar: 'images/demand-users/lab-director.jpg', followingCount: 22, fans: 168, collections: 342, followsYou: true, following: false },
  { id: 'user-chen', name: '陈明', role: '科学语料研究者', organization: '北京大学数学科学学院', avatar: 'images/demand-users/computer-researcher.jpg', followingCount: 72, fans: 311, collections: 760, followsYou: true, following: false },
]

// Each demo corpus has an explicit administrator, independent of its listed authors or viewer role.
const corpusAdministrators: Record<string, string> = {
  'math-01': 'user-zhang', 'math-02': 'user-chen', 'math-03': 'user-zhang', 'math-04': 'user-chen',
  'physics-01': 'user-zhao', 'physics-02': 'user-zhao', 'physics-03': 'user-zhao', 'physics-04': 'user-zhao',
  'chem-01': 'user-lin', 'chem-02': 'user-lin', 'chem-03': 'user-lin', 'chem-04': 'user-lin',
  'astro-01': 'user-zheng', 'astro-02': 'user-zheng', 'astro-03': 'user-zheng', 'astro-04': 'user-zheng',
  'geo-01': 'user-chen', 'geo-02': 'user-chen', 'geo-03': 'user-chen', 'geo-04': 'user-chen',
  'bio-01': 'user-lab', 'bio-02': 'user-lab', 'bio-03': 'user-lab', 'bio-04': 'user-lab',
}

export function corpusAdministrator(corpusId: string) {
  return communityUsers.find((person) => person.id === corpusAdministrators[corpusId]) ?? communityUsers[6]
}

export function avatarUrl(avatar: string) {
  return /^(data:|blob:|https?:|\/)/.test(avatar) ? avatar : `${import.meta.env.BASE_URL}${avatar}`
}
