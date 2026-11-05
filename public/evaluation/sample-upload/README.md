# 基础物理计算评测集（模拟上传）

本资源为科学语料平台的原创演示材料，包含 3 道基础力学题。作者与机构为虚构信息。许可为 CC0 1.0。

读取 dataset.json 中每道题的 input，让待测模型输出包含 answer（有限数值）和 unit 的 JSON，再按题目 ID 组织 predictions.json。

运行评分

    python evaluate.py --data dataset.json --predictions predictions-example.json

单位一致、数值绝对误差不超过 1e-6 时判定正确。缺失答案、格式错误或非有限数值判定错误。准确率为正确题数 / 全部题数 × 100%。示例 predictions-example.json 为完整正确答案，仅用于验证评分流程。
