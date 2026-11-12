export type Notice = {
  id: number
  role: 'admin' | 'uploader' | 'member' | 'creator' | 'platform'
  kind: 'pending' | 'approved' | 'rejected' | 'returned' | 'failed' | 'published' | 'modified' | 'withdrawn'
  corpusId: string
  corpusName: string
  userName: string
  time: string
  reason?: string
  permission?: '可管理' | '可上传'
  createdAt?: string
}
export type CommentNotice = { id: number; user: string; avatar: string; text: string; time: string; kind: 'corpus' | 'demand'; targetId: string }
export type MessageCategory = 'audit' | 'comment'

export const notices: Notice[] = [
  { id: 1, role: 'admin', kind: 'pending', corpusId: 'math-01', corpusName: '基础数学定理证明长思维链语料', userName: '李思远', time: '2026-09-17 18:49:25' },
  { id: 3, role: 'uploader', kind: 'approved', corpusId: 'math-02', corpusName: '概率论与数理统计问题求解语料', userName: '王磊', time: '2026-09-17 17:09:23' },
  { id: 5, role: 'member', kind: 'approved', corpusId: 'geo-04', corpusName: '城市空间结构与功能区识别语料', userName: '许青', time: '2026-09-16 20:33:13', permission: '可上传' },
  { id: 2, role: 'admin', kind: 'pending', corpusId: 'math-01', corpusName: '基础数学定理证明长思维链语料', userName: '林知远', time: '2026-09-16 20:29:02', permission: '可上传' },
  { id: 9, role: 'creator', kind: 'failed', corpusId: 'geo-03', corpusName: '极端天气事件语料库', userName: '我', time: '2026-09-16 14:22:27', createdAt: '2026-09-01 09:40', reason: '系统发布服务超时，自动发布失败，请稍后重试' },
  { id: 4, role: 'uploader', kind: 'rejected', corpusId: 'physics-01', corpusName: '量子力学问题求解与推理过程语料', userName: '何静', time: '2026-09-16 10:47:21', reason: '数据样例不足，请补充字段口径说明' },
  { id: 10, role: 'creator', kind: 'published', corpusId: 'astro-04', corpusName: '天文观测语料库', userName: '我', time: '2026-09-14 08:21:28', createdAt: '2026-08-25 11:30' },
  { id: 7, role: 'creator', kind: 'returned', corpusId: 'math-01', corpusName: '数学教育教学语料库', userName: '我', time: '2026-09-14 01:39:35', createdAt: '2026-08-28 10:00', reason: '请补充字段口径说明' },
  { id: 6, role: 'member', kind: 'rejected', corpusId: 'bio-02', corpusName: '代谢小分子化合物结构语料', userName: '张伟', time: '2026-09-13 00:40:05', reason: '单位与实名信息不符', permission: '可管理' },
  { id: 8, role: 'creator', kind: 'rejected', corpusId: 'chem-02', corpusName: '天然产物结构语料库', userName: '我', time: '2026-09-12 13:46:30', createdAt: '2026-08-29 15:20', reason: '数据样例不足，请补充字段口径说明' },
]

export const commentNotices: CommentNotice[] = [
  { id: 1, user: '王溪蕾', avatar: 'images/demand-users/lab-director.jpg', text: '建议增加数据质量报告和版本间差异说明，方便长期引用。如果能提供典型样本的筛选条件，也有助于我们复现语料处理流程。', time: '4小时前', kind: 'corpus', targetId: 'math-01' },
  { id: 2, user: '林知远', avatar: 'images/demand-users/computer-researcher.jpg', text: '样例数据结构很清楚，期待后续补充更多字段说明。', time: '4小时前', kind: 'corpus', targetId: 'physics-01' },
  { id: 3, user: '陈明', avatar: 'images/demand-users/language-researcher.jpg', text: '已经按建议提交了联合申请，感谢答疑！', time: '5小时前', kind: 'demand', targetId: 'demand-math-001' },
  { id: 4, user: '赵慧', avatar: 'images/demand-users/community-cat.jpg', text: '这份需求的共建方向很清楚。我们有一些相关数据，可以先提供小批量样例，方便大家一起确认字段和使用场景。', time: '昨天', kind: 'demand', targetId: 'demand-geo-001' },
  { id: 5, user: '郑以轩', avatar: 'images/demand-users/language-researcher.jpg', text: '请问语料库会保留版本记录吗？我们计划在后续的评测报告里引用这批数据。', time: '昨天', kind: 'corpus', targetId: 'chem-01' },
  { id: 6, user: '赵俊英', avatar: 'images/demand-users/computer-researcher.jpg', text: '已查看补充说明，数据来源和授权范围都很清晰。感谢更新。', time: '2天前', kind: 'corpus', targetId: 'bio-02' },
]

export const initiallyUnread = new Set(['audit:1', 'audit:3', 'audit:5', 'audit:2', 'audit:9', 'audit:4', 'comment:1', 'comment:2'])

export function commentNoticeTarget(notice: CommentNotice) {
  return notice.kind === 'corpus' ? `/search/datasets/${notice.targetId}?tab=comments` : `/demands/${notice.targetId}`
}

export function noticeView(notice: Notice) {
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
    return { title: '您的语料上传申请未通过', body: `您向“${notice.corpusName}”提交的语料上传申请未通过审核，请根据审核意见修改后重新提交。审核意见：${notice.reason}。`, action: '继续申请', to: `/search/datasets/${notice.corpusId}?upload=1` }
  }
  if (notice.role === 'member' && notice.kind === 'approved') {
    return { title: `您的加入${notice.corpusName}（${notice.permission}）审核已通过`, body: `您向“${notice.corpusName}”提交的加入申请已通过审核`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'member' && notice.kind === 'rejected') {
    return { title: `您的加入${notice.corpusName}（${notice.permission}）未通过审核`, body: `您向“${notice.corpusName}”提交的加入申请未通过审核；审核意见：${notice.reason}；`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'creator') {
    if (notice.kind === 'returned') return { title: `您申请创建的${notice.corpusName}待修改`, body: `您于${notice.createdAt}创建的“${notice.corpusName}”提交内容需要补充或修改材料，请根据审核意见调整后重新提交。审核意见：${notice.reason}`, action: '查看意见', to: '/profile?tab=submit&sstatus=待修改' }
    if (notice.kind === 'rejected') return { title: `您申请创建的${notice.corpusName}未通过审核`, body: `您于${notice.createdAt}创建的“${notice.corpusName}”申请未通过，请查看审核意见。审核意见：${notice.reason}`, action: '查看原因', to: '/profile?tab=submit&sstatus=未通过' }
    if (notice.kind === 'failed') return { title: `您申请创建的${notice.corpusName}发布异常`, body: `您于${notice.createdAt}创建的“${notice.corpusName}”已通过审核，但发布未完成，请查看处理进度。`, action: '查看进度', to: '/profile?tab=submit&sstatus=发布异常' }
    return { title: `您创建的${notice.corpusName}已正式发布`, body: `您于${notice.createdAt}创建的“${notice.corpusName}”已通过审核并发布成功，可在个人主页和语料详情页查看。`, action: '查看语料', to: `/search/datasets/${notice.corpusId}` }
  }
  if (notice.role === 'platform') {
    if (notice.kind === 'modified') return { title: '语料申请已修改并重新提交', body: `用户“${notice.userName}”已根据审核意见修改“${notice.corpusName}”的申请，请重新审核。`, action: '前往审核', to: '/profile?tab=audit' }
    if (notice.kind === 'withdrawn') return { title: '语料申请已撤回', body: `用户“${notice.userName}”已撤回“${notice.corpusName}”的申请，该申请无需继续审核。`, action: '查看记录', to: '/profile?tab=audit' }
    if (notice.kind === 'failed') return { title: '语料发布异常', body: `“${notice.corpusName}”的申请已通过审核，但发布未完成，请查看原因并处理。`, action: '查看异常', to: '/profile?tab=audit' }
  }
  return { title: '您有一条语料申请待审核', body: `“${notice.userName}”提交了“${notice.corpusName}”的创建申请，请查看申请内容并进行审核。`, action: '查看申请', to: '/profile?tab=audit' }
}
