export default function DemandDraftThumbnail() {
  return (
    <div
      className="demand-draft-thumbnail"
      aria-label="医学语料库需求图片预览"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/demand-market/poster-tech/tech-stack.png)` }}
    >
      <span>医学语料库</span>
      <strong>寻找方言伙伴共建语音与转写语料</strong>
    </div>
  )
}
