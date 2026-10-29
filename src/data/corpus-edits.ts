export type CorpusEdits = {
  authors: { name: string; contact: string; organization: string }[]
  subjectPaths: string[]
  corpusName: string; introduction: string; keywords: string[]; dataSource: string
  corpusType: string; orgType: string; organization: string; department: string
  customOrganization: string; customDepartment: string; province: string
  corpusSize: string; corpusSizeDetail: string; storageSize: string; storageSizeDetail: string
  supplyStatus: string; supplyMode: string; license: string; openness: string
  language: string; format: string; timeSpan: string; remark: string; updatedAt: string
}

export function readCorpusEdits(id: string): CorpusEdits | null {
  try {
    const value = JSON.parse(localStorage.getItem(`gw-corpus-edit-${id}`) ?? 'null')
    return value && typeof value.corpusName === 'string' && Array.isArray(value.authors) && Array.isArray(value.subjectPaths) ? value : null
  } catch { return null }
}

export function saveCorpusEdits(id: string, value: CorpusEdits) {
  localStorage.setItem(`gw-corpus-edit-${id}`, JSON.stringify(value))
}
