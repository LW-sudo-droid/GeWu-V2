export const primarySubjects = ['数学', '物理', '化学', '天文', '地理', '生物']

export function normalizeOtherSubjects(value: string) {
  return Array.from(new Set(value.split(/[、，,；;\n]/).map((item) => item.trim()).filter((item) => item && item !== '其他' && !primarySubjects.includes(item))))
}

export function otherSubjectsForRecord(record: { subject: string; subjectPaths?: string[] }) {
  return Array.from(new Set((record.subjectPaths?.length ? record.subjectPaths : [record.subject]).flatMap((path) => {
    const [parent, ...children] = path.split('/')
    if (parent === '其他') return children.join('/').trim() ? [children.join('/').trim()] : []
    return primarySubjects.includes(parent) ? [] : [path.trim()].filter(Boolean)
  })))
}

export function matchesSubjectFilters(record: { subject: string; subjectPaths?: string[] }, subjects: string[], otherSubjects: string[]) {
  if (!subjects.length) return true
  const paths = record.subjectPaths?.length ? record.subjectPaths : [record.subject]
  if (paths.some((path) => subjects.includes(path.split('/')[0]) && path.split('/')[0] !== '其他')) return true
  if (!subjects.includes('其他')) return false
  const custom = otherSubjectsForRecord(record)
  return otherSubjects.length ? custom.some((subject) => otherSubjects.includes(subject)) : custom.length > 0 || paths.includes('其他')
}
