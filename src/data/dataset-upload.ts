export type UploadStatus = 'uploading' | 'success' | 'error'
export type DatasetUploadFile = {
  id: string
  name: string
  size: number
  source: File
  status: UploadStatus
  error?: string
}
export type UploadSectionState = {
  mode: 'local' | 'link' | 'cli'
  files: DatasetUploadFile[]
  linkKind: 'url' | 'github'
  remoteUrl: string
  githubUrl: string
}

export const maxDatasetUploadBytes = 2 * 1024 * 1024 * 1024

export const emptyUploadSection = (): UploadSectionState => ({ mode: 'local', files: [], linkKind: 'url', remoteUrl: '', githubUrl: '' })

function abortError() {
  return new DOMException('Upload cancelled', 'AbortError')
}

/** Demo adapter: check that a selected file is readable, without sending it to a server. */
export async function prepareDemoUpload(file: File, signal: AbortSignal): Promise<void> {
  if (signal.aborted) throw abortError()
  await new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, 650)
    signal.addEventListener('abort', onAbort, { once: true })
  })
  if (signal.aborted) throw abortError()
  if (file.size > maxDatasetUploadBytes) throw new Error('单次上传数据大小不超过 2GB')
  // Sample a small slice so a 2GB selection never needs to be loaded into memory.
  await file.slice(0, 64 * 1024).arrayBuffer()
  if (signal.aborted) throw abortError()
}
