export type EvaluationMountOptions = {
  detailId?: string
  benchmarkId?: string
  onUpload?: () => void
  onBack?: () => void
  onLeaderboard?: (id: string) => void
}
export declare function mountEvaluation(root: ShadowRoot, assetBase: string, options?: EvaluationMountOptions): () => void
