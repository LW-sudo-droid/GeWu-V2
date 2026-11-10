import mechanics from '../../public/evaluation/sample-upload/dataset.json'
import algebra from './evaluation-demo-samples/algebra-equations.json'
import algebraUrl from './evaluation-demo-samples/algebra-equations.json?url&no-inline'
import rivers from './evaluation-demo-samples/river-monitoring.json'
import riversUrl from './evaluation-demo-samples/river-monitoring.json?url&no-inline'

const usageGuide = '下载 JSON 后，用每道题的 input 测试模型。把模型返回的 JSON 对象按题目 id 保存到 predictions.json，再按下方示例评分。'
const localCode = `import json
from pathlib import Path

data_path = Path("dataset.json")  # 替换为下载或解压后的 JSON 文件路径
data = json.loads(data_path.read_text(encoding="utf-8"))
for sample in data["samples"]:
    print(sample["id"], sample["input"])`

const evaluationCode = `import json
from pathlib import Path

data = json.loads(Path("dataset.json").read_text(encoding="utf-8"))
predictions = json.loads(Path("predictions.json").read_text(encoding="utf-8"))
samples = data["samples"]
correct = sum(
    json.dumps(predictions.get(row["id"]), sort_keys=True)
    == json.dumps(row["expected_output"], sort_keys=True)
    for row in samples
)
print(f"准确率 {correct / len(samples):.1%}")`

export function platformDemoResources(assetBase) {
  const sampleRoot = assetBase + 'evaluation/sample-upload/'
  return [
    {
      id: 'platform-physics-demo',
      dataset: mechanics,
      subjects: ['物理'],
      icon: 'atom',
      desc: '面向基础力学计算，检验模型提取题目条件、运用物理公式并按规定格式输出结果的能力。',
      team: '科学计算实验室（虚构）',
      authors: '林知、陈序（虚构）',
      updatedAt: '2026-11-05',
      keywords: ['基础力学', '数值计算', '结构化输出'],
      method: '按数值误差与单位匹配计算正确率。',
      taskDescription: '阅读基础力学题，提取已知条件并计算结果。输出包含 answer 和 unit 的 JSON 对象。',
      projectUrl: sampleRoot + 'README.md',
      paper: sampleRoot + 'README.md',
      downloadUrl: sampleRoot + 'physics-demo-v1.0.0.zip',
      usageGuide: '下载并解压资源包。可先用附带的 predictions-example.json 验证评分流程，再换成按题目 ID 整理的模型输出文件。',
      evaluationCode: 'python evaluate.py --data dataset.json --predictions predictions-example.json',
    },
    {
      id: 'platform-algebra-demo',
      dataset: algebra,
      subjects: ['数学'],
      icon: 'math',
      desc: '用含括号、移项和合并同类项的一元一次方程，检验模型的符号运算与结构化输出能力。',
      team: '数学推理实验组（虚构）',
      authors: '周宁（虚构）',
      updatedAt: '2026-11-10',
      keywords: ['一元一次方程', '符号运算', '结构化输出'],
      taskDescription: '求出方程的唯一整数解，输出只包含整数 x 的 JSON 对象。',
      downloadUrl: algebraUrl,
    },
    {
      id: 'platform-river-demo',
      dataset: rivers,
      subjects: ['地理'],
      icon: 'globe',
      desc: '用虚构河流的监测记录，检验模型能否区分上下游关系并根据已知流量计算汇合和区段变化。',
      team: '地理数据实验组（虚构）',
      authors: '许澄（虚构）',
      updatedAt: '2026-11-10',
      keywords: ['河网', '流量', '水文数据'],
      taskDescription: '根据虚构监测站的上下游关系计算流量，输出含整数 flow 和单位 unit 的 JSON 对象。',
      downloadUrl: riversUrl,
    },
  ].map(({ dataset, ...entry }) => {
    const sample = dataset.samples[0]
    return {
      origin: 'platform',
      status: 'approved',
      permission: '公开',
      language: '中文',
      modality: '文本',
      tasks: ['科学推理与证明', '定量与计算'],
      paradigms: ['静态问答'],
      metric: '准确率（Accuracy）',
      method: '按结构化输出与参考答案是否完全一致计算正确率。',
      license: 'CC0 1.0 · 适用于原创演示数据。',
      size: `${dataset.samples.length} 道演示题 · test 划分`,
      name: dataset.name,
      version: dataset.version,
      year: Number(entry.updatedAt.slice(0, 4)),
      sample,
      inputExample: sample.input,
      expectedOutput: sample.expected_output,
      usageGuide: usageGuide + '将下载的数据文件保存为 dataset.json。',
      localCode,
      evaluationCode,
      ...entry,
    }
  })
}
