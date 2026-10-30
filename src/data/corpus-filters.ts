import type { CorpusFilterState } from '../components/CorpusFilterSidebar'
import { primarySubjects } from './corpus-subjects'

export const pkuDepartments = [
  { label: '数学科学学院', count: 52 }, { label: '物理学院', count: 50 },
  { label: '物理学院大气与海洋科学系', count: 12 }, { label: '物理学院技术物理系', count: 11 },
  { label: '物理学院现代光学研究所', count: 10 }, { label: '物理学院电子显微镜专业实验室', count: 8 },
  { label: '化学与分子工程学院', count: 45 }, { label: '地球与空间科学学院', count: 24 },
  { label: '材料科学与工程学院', count: 16 }, { label: '生命科学学院', count: 35 },
  { label: '现代农学院', count: 9 }, { label: '基础医学院', count: 14 }, { label: '药学院', count: 21 },
  { label: '药学院天然药物及仿生药物全国重点实验室', count: 8 }, { label: '公共卫生学院', count: 12 },
  { label: '人工智能研究院', count: 13 }, { label: '定量生物学中心', count: 7 },
  { label: '生物医学前沿创新中心', count: 8 }, { label: '健康医疗大数据国家研究院', count: 17 },
  { label: '核糖核酸北京研究中心', count: 6 }, { label: '国际机器学习研究中心', count: 9 },
  { label: '北京国际数学研究中心', count: 15 }, { label: '遥感与地理信息系统研究所', count: 28 },
  { label: '科维理天文与天体物理研究所', count: 19 }, { label: '国际癌症研究院', count: 7 },
  { label: '肿瘤医院', count: 10 }, { label: '第一医院肾内科', count: 6 },
  { label: '鄞州数智健康联合研究院', count: 5 }, { label: '深圳研究生院新材料学院', count: 8 },
  { label: '其他', count: 8, custom: true },
]

export function createCorpusFilters(initialSubject = '', initialPublisher = ''): CorpusFilterState {
  return {
    subjects: primarySubjects.includes(initialSubject) || initialSubject === '其他' ? [initialSubject] : [],
    otherSubjects: [], corpusTypes: [],
    institutions: initialPublisher === '北京大学' ? pkuDepartments.filter((item) => !item.custom).map((item) => item.label) : initialPublisher ? [initialPublisher] : [],
    corpusSizes: [], storageSizes: [], openness: [],
  }
}
