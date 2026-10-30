import { useMemo, useSyncExternalStore } from 'react'
import type { CorpusRecord } from '../pages/CorpusSearch'
import { readCorpusEdits } from './corpus-edits'

const submissionsKey = 'gw-corpus-submissions'
const changeEvent = 'gw-corpus-catalog-changed'

export function readCorpusSubmissions(): CorpusRecord[] {
  try {
    const entries: unknown = JSON.parse(localStorage.getItem(submissionsKey) ?? '[]')
    return Array.isArray(entries) ? entries.filter((entry): entry is CorpusRecord => Boolean(entry && typeof entry.id === 'string' && typeof entry.title === 'string' && typeof entry.subject === 'string' && Array.isArray(entry.subjectPaths))) : []
  } catch { return [] }
}

export function saveCorpusSubmission(record: CorpusRecord) {
  localStorage.setItem(submissionsKey, JSON.stringify([record, ...readCorpusSubmissions().filter((item) => item.id !== record.id)]))
  window.dispatchEvent(new Event(changeEvent))
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(changeEvent, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(changeEvent, callback)
  }
}

export function readCorpusCatalog(baseRecords: CorpusRecord[]): CorpusRecord[] {
  const records = new Map(baseRecords.map((item) => [item.id, item]))
  readCorpusSubmissions().forEach((item) => records.set(item.id, item))
  return Array.from(records.values()).map((item) => {
    const edits = readCorpusEdits(item.id)
    return edits ? { ...item, title: edits.corpusName, summary: edits.introduction, keywords: edits.keywords,
      subject: edits.subjectPaths[0]?.split('/')[0] || item.subject, subjectPaths: edits.subjectPaths,
      corpusType: edits.corpusType, openness: edits.openness,
      organization: edits.organization === '其他' ? edits.customOrganization : edits.organization,
      authors: (edits.department === '其他' ? edits.customDepartment : edits.department) || edits.authors[0]?.organization || item.authors,
      corpusSize: edits.corpusSize, storageSize: edits.storageSize,
    } : item
  })
}

export function useCorpusCatalog(baseRecords: CorpusRecord[]) {
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify(readCorpusCatalog(baseRecords)), () => '[]')
  return useMemo(() => JSON.parse(snapshot) as CorpusRecord[], [snapshot])
}
