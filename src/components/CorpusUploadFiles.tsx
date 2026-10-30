import { Check, Copy, FileArchive, Github, Link2 } from 'lucide-react'
import type { UploadSource } from '../data/upload-tasks'

const cli_upload_cmd = 'corpusware upload --corpus <语料ID> --data ./corpus'

export default function UploadGroup({ title, required, description, state, onChange }: { title: string; required?: boolean; description: string; state: UploadSource; onChange: (value: UploadSource) => void }) {
  const inputKey = title.replace(/\s/g, '')
  const updateFiles = (files: FileList | null) => onChange({ ...state, files: files ? Array.from(files).map((file) => file.name) : [] })
  return (
    <section className="upload-file-group">
      <div className="upload-file-group-head"><div><h3>{title}{required && <b> *</b>}</h3><p>{description}</p></div><div className="upload-source-tabs"><button type="button" className={state.mode === 'local' ? 'is-active' : ''} onClick={() => onChange({ ...state, mode: 'local' })}>本地文件</button><button type="button" className={state.mode === 'link' ? 'is-active' : ''} onClick={() => onChange({ ...state, mode: 'link' })}>链接</button><button type="button" className={state.mode === 'cli' ? 'is-active' : ''} onClick={() => onChange({ ...state, mode: 'cli' })}>命令行</button></div></div>
      {state.mode === 'local' && (
        <div className="upload-file-drop upload-drop-v2" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); updateFiles(event.dataTransfer.files) }}>
          <span className="upload-drop-icon"><FileArchive size={30} /></span>
          <div className="upload-drop-copy">
            <strong>{state.files.length ? `已选择 ${state.files.length} 个文件` : '拖拽文件到此处上传'}</strong>
            <span>{state.files.length ? state.files.slice(0, 3).join('、') : '支持单个文件、多个文件或整个文件夹'}</span>
            <div>
              <label className="upload-browse-btn" htmlFor={`${inputKey}-files`}>浏览文件</label>
              <input id={`${inputKey}-files`} hidden type="file" multiple onChange={(event) => { updateFiles(event.target.files); event.currentTarget.value = '' }} />
              <label className="upload-browse-btn is-ghost" htmlFor={`${inputKey}-folder`}>选择文件夹</label>
              <input id={`${inputKey}-folder`} hidden type="file" multiple ref={(node) => node?.setAttribute('webkitdirectory', '')} onChange={(event) => { updateFiles(event.target.files); event.currentTarget.value = '' }} />
            </div>
          </div>
        </div>
      )}
      {state.mode === 'link' && (
        <div className="upload-link-panel">
          <div className="upload-link-cards">
            <button type="button" className={`upload-link-card${state.linkKind === 'url' ? ' is-active' : ''}`} onClick={() => onChange({ ...state, linkKind: 'url' })}>
              <span className="upload-link-dot">{state.linkKind === 'url' && <Check size={14} />}</span>
              <i className="upload-link-icon"><Link2 size={18} /></i>
              <strong>远程 URL</strong><small>从远程 URL 创建语料资源，URL 需指向具体文件</small>
            </button>
            <button type="button" className={`upload-link-card${state.linkKind === 'github' ? ' is-active' : ''}`} onClick={() => onChange({ ...state, linkKind: 'github' })}>
              <span className="upload-link-dot">{state.linkKind === 'github' && <Check size={14} />}</span>
              <i className="upload-link-icon"><Github size={18} /></i>
              <strong>GitHub 仓库</strong><small>从 GitHub 仓库归档导入，使用仓库地址或任意深层链接</small>
            </button>
          </div>
          <label className="upload-link-input"><span>{state.linkKind === 'url' ? 'URL' : 'GitHub 仓库链接'}</span><input value={state.link} onChange={(event) => onChange({ ...state, link: event.target.value })} placeholder={state.linkKind === 'url' ? '请输入远程 URL，如 https://…/data.zip' : '请输入 GitHub 仓库链接'} /></label>
        </div>
      )}
      {state.mode === 'cli' && (
        <div className="upload-cli-panel">
          <p className="cli-guide-intro">1. 安装 CLI：<code>pip install corpusware-cli</code><br />2. 在终端运行以下命令上传语料：</p>
          <div className="download-code-block">
            <div className="download-code-head"><button type="button" onClick={() => navigator.clipboard?.writeText(cli_upload_cmd)}><Copy size={15} />复制</button></div>
            <pre><code>{cli_upload_cmd}</code></pre>
          </div>
          <p className="cli-guide-more">更多更丰富的命令行上传选项，可参见 <a>具体文档</a>。</p>
        </div>
      )}
    </section>
  )
}

