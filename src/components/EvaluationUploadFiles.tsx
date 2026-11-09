import { useId, useRef, useState } from 'react'
import { Copy, FileText, Github, Link2, Trash2, UploadCloud } from 'lucide-react'
import { maxDatasetUploadBytes } from '../data/dataset-upload'
import { evaluationFiles, type EvaluationFile, type EvaluationSource } from '../data/evaluation-upload'

const archiveFormat = /\.zip$/i
const attachmentFormat = /\.(pdf|docx|txt|md|markdown)$/i
const dataExtensions = [
  '.json', '.jsonl', '.csv', '.parquet', '.txt', '.text', '.arrow',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff',
  '.wav', '.mp3', '.flac', '.ogg', '.opus', '.m4a', '.aac', '.aif', '.aiff',
  '.tar', '.tar.gz', '.tgz',
]
const dataAccept = [...dataExtensions, '.zip'].join(',')
const dataFormatsLabel = 'JSON、JSONL、CSV、ZIP、parquet、optimized-parquet、imagefolder、soundfolder、webdataset、text、arrow'
function isDataFile(path: string) {
  const name = path.toLowerCase()
  return dataExtensions.some(extension => name.endsWith(extension))
}
const modes = [['local', '本地上传'], ['link', '外部链接导入'], ['cli', '命令行上传']] as const

// The central directory lists entry names without loading or extracting file contents.
async function validDataZip(file: File) {
  const tail = new DataView(await file.slice(-65557).arrayBuffer())
  let end = tail.byteLength - 22
  while (end >= 0 && (tail.getUint32(end, true) !== 0x06054b50 || end + 22 + tail.getUint16(end + 20, true) !== tail.byteLength)) end--
  if (end < 0 || tail.getUint16(end + 4, true) || tail.getUint16(end + 6, true)) return false
  const centralSize = tail.getUint32(end + 12, true)
  const centralStart = tail.getUint32(end + 16, true)
  const centralEnd = centralStart + centralSize
  if (!centralSize || centralEnd > file.size - tail.byteLength + end) return false
  let position = centralStart
  let windowStart = 0
  let chunk = new DataView(new ArrayBuffer(0))
  const decoder = new TextDecoder()
  let fileCount = 0
  let entryCount = 0
  while (position + 46 <= centralEnd) {
    if (position < windowStart || position + 46 > windowStart + chunk.byteLength) {
      windowStart = position
      chunk = new DataView(await file.slice(position, Math.min(position + 131072, centralEnd)).arrayBuffer())
    }
    const entry = position - windowStart
    if (chunk.getUint32(entry, true) !== 0x02014b50) return false
    const nameLength = chunk.getUint16(entry + 28, true)
    const nameEnd = position + 46 + nameLength
    if (!nameLength || nameEnd > centralEnd) return false
    const name = decoder.decode(nameEnd <= windowStart + chunk.byteLength
      ? new Uint8Array(chunk.buffer, entry + 46, nameLength)
      : await file.slice(position + 46, nameEnd).arrayBuffer())
    if (!name.endsWith('/')) {
      if (!isDataFile(name)) return false
      fileCount++
    }
    entryCount++
    position = nameEnd + chunk.getUint16(entry + 30, true) + chunk.getUint16(entry + 32, true)
  }
  return fileCount > 0 && position === centralEnd && entryCount === tail.getUint16(end + 10, true)
}

type Props = {
  title: string
  state: EvaluationSource
  attachments?: boolean
  error?: string
  busy: boolean
  onChange: (source: EvaluationSource) => void
  onChecking: (value: boolean) => void
  notify: (message: string) => void
}
export default function EvaluationUploadFiles({ title, state, attachments, error, busy, onChange, onChecking, notify }: Props) {
  const id = useId()
  const filesInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const checking = useRef(false)
  const [dragging, setDragging] = useState(false)
  const files = evaluationFiles(state)
  const fileKey = state.mode === 'cli' ? 'cliFiles' : 'files'
  const command = state.mode === 'cli' && title === '完整评测集'
    ? 'python3 -m zipfile -c evaluation.zip ./evaluation-data'
    : 'python3 -m zipfile -c sample.zip ./sample-data'

  const addFiles = async (selected: FileList | null) => {
    if (!selected?.length || busy || checking.current) return
    const entries = Array.from(selected, file => ({ path: file.webkitRelativePath || file.name, file }))
    const combined = [...new Map([...files, ...entries].map(entry => [entry.path, entry])).values()]
    if (combined.reduce((total, entry) => total + entry.file.size, 0) > maxDatasetUploadBytes) return notify('文件总大小超过2 GB')
    const allowed = (entry: EvaluationFile) => attachments ? attachmentFormat.test(entry.path) : isDataFile(entry.path) || archiveFormat.test(entry.path)
    const invalid = entries.find(entry => !allowed(entry))
    if (invalid) return notify(`不支持此文件格式：${invalid.path}`)
    checking.current = true
    onChecking(true)
    try {
      for (const { file, path } of entries) {
        if (!attachments && archiveFormat.test(path) && !await validDataZip(file)) {
          notify(`ZIP 无法读取或包含不支持的内容：${path}`)
          return
        }
        await file.slice(0, 64 * 1024).arrayBuffer()
      }
      onChange({ ...state, [fileKey]: combined })
    } catch {
      notify('文件读取失败，请重新选择')
    } finally {
      checking.current = false
      onChecking(false)
    }
  }

  return <section className="edit-upload-module eu-files" aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>{title}{attachments ? <small>（选填）</small> : <b>*</b>}</h3>
    <div className={`edit-upload-surface${dragging ? ' is-dragging' : ''}${attachments ? ' eu-attachment-surface' : ''}`}
      tabIndex={error ? -1 : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : undefined}
      onDragOver={event => { if (state.mode === 'link') return; event.preventDefault(); if (!busy) setDragging(true) }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }}
      onDrop={event => { if (state.mode === 'link') return; event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files) }}>
      {!attachments && <div className="edit-upload-modes" role="group" aria-label={title + '上传方式'}>
        {modes.map(([mode, label]) => <button key={mode} type="button" disabled={busy} className={state.mode === mode ? 'is-active' : ''} aria-pressed={state.mode === mode} onClick={() => onChange({ ...state, mode })}>{label}</button>)}
      </div>}
      <div className={`edit-upload-content is-${state.mode}`}>
        {state.mode === 'local' && <div className="edit-local-upload">
          <span className="eu-upload-icon"><UploadCloud size={35} strokeWidth={1.5} /></span>
          <strong>拖拽文件到此处上传</strong>
          <p>{attachments ? '支持 PDF、DOCX、TXT、Markdown' : <>本地支持 {dataFormatsLabel} 格式，单组文件合计不超过 2 GB</>}</p>
          <div className="edit-upload-browse-actions">
            <button type="button" className="is-primary" disabled={busy} onClick={() => filesInput.current?.click()}>上传文件</button>
            <button type="button" disabled={busy} onClick={() => folderInput.current?.click()}>上传文件夹</button>
          </div>
        </div>}
        {state.mode === 'link' && <div className="edit-link-import">
          <div className="edit-link-options" role="group" aria-label={title + '链接来源'}>
            {([['url', '远程 URL', '链接需指向具体数据文件', Link2], ['github', 'GitHub 仓库', '使用仓库地址或仓库中的数据文件链接', Github]] as const).map(([kind, name, description, Icon]) =>
              <button key={kind} type="button" className={state.linkKind === kind ? 'is-active' : ''} aria-pressed={state.linkKind === kind} disabled={busy} onClick={() => onChange({ ...state, linkKind: kind })}>
                <span className="edit-link-symbol"><Icon size={22} /></span><span className="edit-link-copy"><strong>{name}</strong><small>{description}</small></span>
              </button>)}
          </div>
          <label className="edit-upload-url"><span>{state.linkKind === 'url' ? '远程 URL' : 'GitHub 仓库链接'}</span><input type="url" value={state[state.linkKind]} disabled={busy} aria-invalid={Boolean(error)} onChange={event => onChange({ ...state, [state.linkKind]: event.target.value })} placeholder={state.linkKind === 'url' ? '如 https://example.com/data.jsonl' : '如 https://github.com/组织/仓库'} /></label>
        </div>}
        {state.mode === 'cli' && <div className="edit-cli-upload">
          <p><span>1</span>将本地上传支持的数据文件放入数据目录，在终端运行以下命令生成 ZIP。</p>
          <div className="edit-cli-command"><input aria-label={title + '命令示例'} readOnly value={command} /><button type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(command); notify('命令已复制') } catch { notify('复制失败，请手动复制命令') }
          }}><Copy size={15} />复制</button></div>
          <p><span>2</span>选择命令生成的 ZIP，将其添加到当前任务。</p>
          <div className="edit-upload-browse-actions"><button type="button" className="is-primary" disabled={busy} onClick={() => filesInput.current?.click()}>选择生成的文件</button></div>
        </div>}
      </div>
    </div>
    <input ref={filesInput} hidden type="file" multiple disabled={busy} aria-label={title + '选择文件'} accept={attachments ? '.pdf,.docx,.txt,.md,.markdown' : dataAccept} onChange={event => { void addFiles(event.currentTarget.files); event.currentTarget.value = '' }} />
    <input ref={node => { folderInput.current = node; node?.setAttribute('webkitdirectory', '') }} hidden type="file" multiple disabled={busy} aria-label={title + '选择文件夹'} onChange={event => { void addFiles(event.currentTarget.files); event.currentTarget.value = '' }} />
    {error && <p className="uf-error" id={id + '-error'} role="alert">{error}</p>}
    {state.mode !== 'link' && files.length > 0 && <ul className="edit-upload-files" aria-label={title + '文件列表'}>
      {files.map(({ path, file }) => <li key={path}>
        <div className="edit-upload-file"><FileText size={18} /><span className="edit-upload-filename" title={path}>{path}</span><small>{(file.size / 1024).toLocaleString('zh-CN', { maximumFractionDigits: 1 })} KB</small></div>
        <button className="edit-upload-remove" type="button" disabled={busy} aria-label={`删除 ${path}`} onClick={() => onChange({ ...state, [fileKey]: files.filter(item => item.path !== path) })}><Trash2 size={17} /></button>
      </li>)}
    </ul>}
  </section>
}
