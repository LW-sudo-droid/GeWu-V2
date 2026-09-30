export type DemandEditorTransferImage = {
  id: string
  kind: 'text' | 'upload'
  src?: string
  background?: string
  title?: string
  subtitle?: string
}

const transferKey = 'gewu-demand-editor-images'

export function saveDemandEditorImages(images: DemandEditorTransferImage[]) {
  try {
    window.sessionStorage.setItem(transferKey, JSON.stringify(images))
  } catch {
    // Storage may be unavailable in private browsing; the editor still opens with its demo content.
  }
}

export function takeDemandEditorImages(): DemandEditorTransferImage[] | null {
  try {
    const raw = window.sessionStorage.getItem(transferKey)
    if (!raw) return null
    window.sessionStorage.removeItem(transferKey)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : null
  } catch {
    return null
  }
}
