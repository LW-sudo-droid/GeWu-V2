export type EvaluationMountOptions = {
  detailId?: string
  benchmarkId?: string
  onUpload?: () => void
  onDetail?: (id: string) => void
  onBack?: () => void
  onLeaderboard?: (id: string) => void
}
export declare function mountEvaluation(root: ShadowRoot, assetBase: string, options?: EvaluationMountOptions): () => void
