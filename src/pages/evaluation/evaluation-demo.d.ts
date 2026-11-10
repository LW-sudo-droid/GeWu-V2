export type EvaluationMountOptions = {
  account?: string
  profile?: { collection: 'uploaded' | 'favorite'; onDetail: (id: string) => void }
  detailId?: string
  benchmarkId?: string
  onUpload?: () => void
  onBack?: () => void
  onLeaderboard?: (id: string) => void
}
export declare function mountEvaluation(root: ShadowRoot, assetBase: string, options?: EvaluationMountOptions): () => void
