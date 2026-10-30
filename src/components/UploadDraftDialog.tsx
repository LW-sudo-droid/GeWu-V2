import { useState } from 'react'
import { Archive, CircleAlert } from 'lucide-react'
import CorpusDialog from './CorpusDialog'
import type { UploadDraft } from '../data/upload-tasks'

export default function UploadDraftDialog({ drafts, onClose, onContinue, onDelete }: { drafts: UploadDraft[]; onClose: () => void; onContinue: (draft: UploadDraft) => void; onDelete: (id: string) => boolean }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  return <CorpusDialog title="草稿箱" labelledBy="uf-drafts-title" className="uf-drafts-dialog" onClose={onClose}>
    <div className="uf-draft-list">
      {!drafts.length && <div className="uf-draft-empty"><Archive size={54} strokeWidth={1} /><p>暂无草稿</p></div>}
      {drafts.map((draft) => <article key={draft.id}>
        <h3>{draft.data.taskName.trim() || '未命名任务'}</h3>
        <p>保存于 {draft.savedAt.startsWith('1970') ? '历史保存' : new Date(draft.savedAt).toLocaleString('zh-CN', { hour12: false })}</p>
        <div className="uf-draft-actions"><button type="button" className="is-primary" onClick={() => onContinue(draft)}>继续编辑</button><div className="uf-delete-wrap"><button type="button" aria-expanded={deleting === draft.id} onClick={() => setDeleting((current) => current === draft.id ? null : draft.id)}>删除</button>
          {deleting === draft.id && <div className="uf-delete-confirm" role="alertdialog" aria-label="确认删除草稿" onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setDeleting(null) } }}><p><CircleAlert size={17} fill="#ff8800" stroke="white" />草稿删除后不可找回</p><div><button type="button" onClick={() => setDeleting(null)}>取消</button><button type="button" className="is-danger" onClick={() => { if (onDelete(draft.id)) setDeleting(null) }}>删除</button></div></div>}
        </div></div>
      </article>)}
    </div>
  </CorpusDialog>
}
