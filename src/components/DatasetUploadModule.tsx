import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Check, Copy, FileImage, FileText, Github, LoaderCircle, Trash2 } from 'lucide-react'
import { maxDatasetUploadBytes, prepareDemoUpload, type DatasetUploadFile, type UploadSectionState } from '../data/dataset-upload'

type Props = {
  title: string
  state: UploadSectionState
  onChange: Dispatch<SetStateAction<UploadSectionState>>
  notify: (message: string) => void
  corpusId: string
  required?: boolean
}

function UploadIllustration() {
  return <svg className="edit-upload-illustration" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <rect x="15" y="12" width="48" height="48" rx="11" transform="rotate(-8 15 12)" fill="#DFE8F7" />
    <rect x="12" y="17" width="51" height="46" rx="9" fill="#CCD9F0" stroke="#C2D2EE" strokeWidth="1.5" />
    <rect x="15" y="20" width="45" height="39" rx="7" fill="#E8EEF9" />
    <circle cx="25" cy="30" r="5" fill="white" />
    <path d="m16 55 12-15a4 4 0 0 1 6 0l8 9 6-6a4 4 0 0 1 6 0l7 12v4H16v-4Z" fill="white" />
    <circle cx="61" cy="61" r="14" fill="#CAD5F3" stroke="#F4F7FE" strokeWidth="3" />
    <path d="M61 68V54m-5 5 5-5 5 5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export default function DatasetUploadModule({ title, state, onChange, notify, corpusId, required }: Props) {
  const moduleId = useId()
  const filesInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const jobs = useRef(new Map<string, AbortController>())
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)
  const command = `corpusware upload --corpus ${corpusId} --data ./corpus`
  const tabs = [{ mode: 'local', label: '本地上传' }, { mode: 'link', label: '外部链接导入' }, { mode: 'cli', label: '命令行上传' }] as const

  useEffect(() => {
    const pending = new Set(state.files.filter((file) => file.status === 'uploading').map((file) => file.id))
    for (const [id, controller] of jobs.current) {
      if (!pending.has(id)) { controller.abort(); jobs.current.delete(id) }
    }
    for (const file of state.files) {
      if (file.status !== 'uploading' || jobs.current.has(file.id)) continue
      const controller = new AbortController()
      jobs.current.set(file.id, controller)
      const finish = (status: 'success' | 'error', error?: string) => {
        if (controller.signal.aborted) return
        onChange((current) => ({ ...current, files: current.files.map((entry) => entry.id === file.id ? { ...entry, status, error } : entry) }))
      }
      void prepareDemoUpload(file.source, controller.signal)
        .then(() => finish('success'))
        .catch((error: unknown) => finish('error', error instanceof Error ? error.message : '文件读取失败，请重试'))
        .finally(() => { if (jobs.current.get(file.id) === controller) jobs.current.delete(file.id) })
    }
  }, [state.files, onChange])

  useEffect(() => {
    const activeJobs = jobs.current
    return () => {
      activeJobs.forEach((controller) => controller.abort())
      activeJobs.clear()
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  const handleFiles = (list: FileList | File[] | null) => {
    if (!list?.length) return
    const selected = Array.from(list)
    const total = state.files.reduce((sum, file) => sum + file.size, 0) + selected.reduce((sum, file) => sum + file.size, 0)
    if (total > maxDatasetUploadBytes) { notify('单次上传数据大小不超过 2GB，请压缩或分批上传'); return }
    const added: DatasetUploadFile[] = selected.map((file) => ({ id: crypto.randomUUID(), name: file.webkitRelativePath || file.name, size: file.size, source: file, status: 'uploading' }))
    onChange((current) => ({ ...current, files: [...current.files, ...added] }))
  }

  const retry = (id: string) => onChange((current) => ({ ...current, files: current.files.map((file) => file.id === id ? { ...file, status: 'uploading', error: undefined } : file) }))
  const remove = (id: string) => {
    jobs.current.get(id)?.abort()
    jobs.current.delete(id)
    onChange((current) => ({ ...current, files: current.files.filter((file) => file.id !== id) }))
  }
  const copyCommand = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(command)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch { notify('复制失败，请选择命令后手动复制') }
  }

  return <section className="edit-upload-module" aria-labelledby={`${moduleId}-title`}>
    <h3 id={`${moduleId}-title`}>{title}{required && <b> *</b>}</h3>
    <div className={`edit-upload-surface${dragging ? ' is-dragging' : ''}`}
      onDragEnter={(event) => { if (state.mode !== 'local') return; event.preventDefault(); dragDepth.current += 1; setDragging(true) }}
      onDragOver={(event) => { if (state.mode === 'local') event.preventDefault() }}
      onDragLeave={(event) => { if (state.mode !== 'local') return; event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false) }}
      onDrop={(event) => { if (state.mode !== 'local') return; event.preventDefault(); dragDepth.current = 0; setDragging(false); handleFiles(event.dataTransfer.files) }}>
      <div className="edit-upload-modes" role="tablist" aria-label={`${title}方式`}>
        {tabs.map((tab) => <button key={tab.mode} id={`${moduleId}-${tab.mode}-tab`} type="button" role="tab" aria-selected={state.mode === tab.mode} aria-controls={`${moduleId}-panel`} className={state.mode === tab.mode ? 'is-active' : ''} onClick={() => { setDragging(false); dragDepth.current = 0; onChange((current) => ({ ...current, mode: tab.mode })) }}>{tab.label}</button>)}
      </div>
      <div id={`${moduleId}-panel`} className={`edit-upload-content is-${state.mode}`} role="tabpanel" aria-labelledby={`${moduleId}-${state.mode}-tab`}>
        {state.mode === 'local' && <div className="edit-local-upload">
          <UploadIllustration />
          <strong>选择需要上传的语料文件</strong>
          <p>单次上传数据大小不超过 2GB，上传后将发送给管理员审核</p>
          <div className="edit-upload-browse-actions">
            <button className="is-primary" type="button" onClick={() => filesInput.current?.click()}>上传文件</button>
            <button type="button" onClick={() => folderInput.current?.click()}>上传文件夹</button>
          </div>
        </div>}
        {state.mode === 'link' && <div className="edit-link-import">
          <div className="edit-link-options" role="group" aria-label={`${title}链接来源`}>
            <button type="button" className={state.linkKind === 'url' ? 'is-active' : ''} aria-pressed={state.linkKind === 'url'} onClick={() => onChange((current) => ({ ...current, linkKind: 'url' }))}>
              <span className="edit-link-symbol"><FileText size={23} /></span><span className="edit-link-copy"><strong>远程 URL</strong><small>从远程 URL 创建语料资源，URL 需指向具体文件</small></span><span className="edit-link-radio">{state.linkKind === 'url' && <Check size={12} />}</span>
            </button>
            <button type="button" className={state.linkKind === 'github' ? 'is-active' : ''} aria-pressed={state.linkKind === 'github'} onClick={() => onChange((current) => ({ ...current, linkKind: 'github' }))}>
              <span className="edit-link-symbol is-github"><Github size={28} /></span><span className="edit-link-copy"><strong>GitHub 仓库</strong><small>从 GitHub 仓库归档导入，使用仓库地址或任意深层链接</small></span><span className="edit-link-radio">{state.linkKind === 'github' && <Check size={12} />}</span>
            </button>
          </div>
          <label className="edit-upload-url"><span>{state.linkKind === 'url' ? 'URL' : 'GitHub 仓库链接'}</span><input type="url" value={state.linkKind === 'github' ? state.githubUrl : state.remoteUrl} onChange={(event) => { const value = event.target.value; onChange((current) => ({ ...current, [current.linkKind === 'github' ? 'githubUrl' : 'remoteUrl']: value })) }} placeholder={state.linkKind === 'url' ? '请输入远程 URL，如 https://…/data.zip' : '请输入 GitHub 仓库链接，如 https://github.com/组织/仓库'} /></label>
        </div>}
        {state.mode === 'cli' && <div className="edit-cli-upload">
          <p><span>1</span>安装 CLI：<code>pip install corpusware-cli</code></p>
          <p><span>2</span>在终端运行以下命令上传语料：</p>
          <div className="edit-cli-command"><input aria-label={`${title}命令`} readOnly value={command} /><button type="button" onClick={() => void copyCommand()}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? '已复制' : '复制'}</button></div>
        </div>}
      </div>
    </div>
    <input ref={filesInput} hidden type="file" multiple aria-label={`${title}选择文件`} onChange={(event) => { handleFiles(event.target.files); event.currentTarget.value = '' }} />
    <input ref={(node) => { folderInput.current = node; node?.setAttribute('webkitdirectory', '') }} hidden type="file" multiple aria-label={`${title}选择文件夹`} onChange={(event) => { handleFiles(event.target.files); event.currentTarget.value = '' }} />
    {state.mode === 'local' && state.files.length > 0 && <ul className="edit-upload-files" aria-label={`${title}文件列表`} aria-live="polite">
      {state.files.map((file) => <li key={file.id}>
        <div className={`edit-upload-file is-${file.status}`}><FileImage size={18} /><span className="edit-upload-filename" title={file.name}>{file.name}</span>
          {file.status === 'uploading' && <LoaderCircle className="edit-upload-spinner" size={19} aria-label="上传中" />}
          {file.status === 'error' && <button type="button" className="edit-upload-retry" onClick={() => retry(file.id)} title={file.error} aria-label={`重新上传 ${file.name}`}>点击重试</button>}
          {file.status === 'success' && <span className="edit-upload-sr-only">上传成功</span>}
        </div>
        <button className="edit-upload-remove" type="button" aria-label={`删除 ${file.name}`} title="删除文件" onClick={() => remove(file.id)}><Trash2 size={17} /></button>
      </li>)}
    </ul>}
  </section>
}
