import { EVALUATION_SUBJECTS, EVALUATION_TASKS, EVALUATION_PARADIGMS, EVALUATION_PERMISSIONS, normalizeEvaluationResource, readApprovedEvaluationUploads } from '../../data/evaluation-catalog'
import { downloadEvaluationFile, evaluationFiles, readEvaluationTask } from '../../data/evaluation-upload'
// Adapted from the supplied standalone evaluation demo.
// All UI queries are scoped to the page shadow root.
export function mountEvaluation(evaluationRoot, assetBase, options = {}) {
  const previousOverflow = document.body.style.overflow;

const paths={institution:'<path d="m3 9 9-6 9 6M4 10h16M5 10v10m5-10v10m4-10v10m5-10v10M3 21h18"/>',
 'chevron-up':'<path d="m6 15 6-6 6 6"/>',
 'chevron-down':'<path d="m6 9 6 6 6-6"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
 'upload':'<path d="M12 16V3m-4 4 4-4 4 4M4 14v6h16v-6"/>',
 'download':'<path d="M12 3v13m-4-4 4 4 4-4M4 15v5h16v-5"/>',
 'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
 'star':'<path d="m12 3 2.7 5.8 6.3.8-4.6 4.5 1.1 6.3-5.5-3-5.5 3 1.1-6.3L3 9.6l6.3-.8L12 3Z"/>',
 'share':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/>',
 'arrow-right':'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 'external':'<path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6"/>',
 'shield':'<path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
 'book':'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V6Z"/>',
 'table':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
 'chart':'<path d="M4 3v17h17M9 15V9m5 6V5m5 10v-4"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
 'atom':'<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1"/>',
 'flask':'<path d="M9 3h6m-5 0v7l-6 9a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2l-6-9V3M7 15h10"/>',
 'brain':'<path d="M12 5c-1-3-6-2-6 1-4 0-4 6-1 7-2 4 2 7 5 5 0 3 4 3 4 0 3 2 7-1 5-5 3-1 3-7-1-7 0-3-5-4-6-1Zm0 0v14M6 6l2 3m10-3-2 3M5 13l4-1m10 1-4-1"/>',
 'code':'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
 'dna':'<path d="M7 3c0 9 10 9 10 18M17 3c0 9-10 9-10 18M8 6h8M9 10h6m-6 4h6m-7 4h8"/>',
 'orbit':'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-30 12 12)"/><path d="M8 3a10 10 0 0 1 12 13M16 21A10 10 0 0 1 4 8"/>',
 'globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
 'math':'<path d="M5 5h14M7 5l6 7-6 7h12"/>',
 'layers':'<path d="m12 3 10 6-10 6L2 9l10-6Zm-10 11 10 6 10-6M2 19l10 5 10-5"/>',
 'chevron-left':'<path d="m14 6-6 6 6 6"/>','chevron-right':'<path d="m10 6 6 6-6 6"/>','sort':'<path d="m8 8 4-4 4 4m-8 8 4 4 4-4"/>','close':'<path d="m6 6 12 12M6 18 18 6"/>','check':'<path d="m5 12 4 4L19 6"/>','bookmark':'<path d="M6 3h12v18l-6-4-6 4V3Z"/>','calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>','more':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
function icon(name,size=15){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.atom}</svg>`}
evaluationRoot.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const benchmarks=[
 {id:'gpqa',name:'GPQA Diamond',icon:'brain',task:'科学问答与推理',subjects:'物理 · 化学 · 生物',desc:'研究生水平的科学问题，比较模型的专业知识与多步推理能力。',version:'Diamond',size:'198 题',metric:'准确率',unit:'%',coverage:'100+ 条历史成绩',source:'Vals AI',url:'https://vals-ai.com/benchmarks/gpqa',paper:'https://github.com/idavidrein/gpqa',fresh:'历史参考榜',published:'2026-09-01',method:'使用 GPQA 中难度更高的 Diamond 子集，以回答正确的问题占比衡量模型表现。比较时需要保持题目子集、提示方式与工具使用条件一致。',caveat:'参考来源已停止新增模型测试；可作为经典历史成绩参考。'},
 {id:'chembench',name:'ChemBench',icon:'flask',task:'化学知识与推理',subjects:'化学',desc:'从化学基础知识到专业推理，观察模型处理化学问题的能力。',version:'2.0.0',size:'2,700+ 问答',metric:'综合得分',unit:'分',coverage:'54 条公开成绩记录',source:'LamaLab',url:'https://jablonkagroup-chembench-leaderboard.hf.space/',paper:'https://huggingface.co/datasets/jablonkagroup/ChemBench-Results',fresh:'官方结果库',published:'2026-09-17',method:'覆盖多个化学主题，按照原项目的解析与评分规则统计综合表现。需要区分纯模型回答和使用工具、检索或智能体框架的结果。',caveat:'结果库包含模型与配置记录，不将不同版本或不同框架的结果混为一种测试。'},
 {id:'terminal',name:'Terminal-Bench-Science',icon:'code',task:'科研工作流',subjects:'跨学科',desc:'让模型在终端中完成科学计算、数据处理、仿真等真实科研工作。',version:'0.1.0',size:'70 项任务',metric:'任务通过率',unit:'%',coverage:'43 条模型／配置成绩',source:'Vals AI',url:'https://vals-ai.com/benchmarks/terminal-bench-science',paper:'https://www.terminal-bench-science.ai/announcement',fresh:'科研任务榜',published:'2026-10-25',method:'模型在终端环境中完成研究者提供的科学工作流，由任务测试检查输出产物。结果同时受到模型、智能体框架与测试预算影响。',caveat:'正式结果需同时保留模型名称、智能体框架、版本与测试次数。'},
 {id:'bixbench',name:'BixBench3',icon:'dna',task:'生物数据分析',subjects:'生物',desc:'从真实生物学研究的原始数据出发，完成计算分析并生成科研产物。',version:'BixBench3',size:'20 项研究任务',metric:'平均得分',unit:'分',coverage:'20 个模型结果',source:'Edison Scientific',url:'https://advances.edisonscientific.com/benchmarks/bixbench3/',paper:'https://arxiv.org/abs/2608.25286',fresh:'官方任务榜',published:'2026-10-16',method:'任务来自已发表的计算生物学研究。模型需要构建分析流程、处理原始数据并输出结构化产物，根据产物与参考结果的匹配情况评分。',caveat:'使用原始 0–1 平均得分。'},
 {id:'phybench',name:'PHYBench',icon:'atom',task:'物理推理',subjects:'物理',desc:'理解真实物理情境，运用物理规律完成多步骤推导与求解。',version:'论文发布版',size:'500 题',metric:'准确率',unit:'%',coverage:'作者公布 20 个模型',source:'PHYBench 团队',url:'https://www.phybench.cn/leaderboard',paper:'https://huggingface.co/blog/StarThomas1002/arxiv-2504-16074',fresh:'论文成绩参考',published:'2025-05-25',method:'围绕力学、电磁学、热学等物理问题，评估模型对情境的理解和推导能力。原项目同时提供准确率与表达式编辑距离评分，本页仅示意准确率。',caveat:'公开模型数量来自作者发布说明；历史测试不代表最新模型表现。'},
 {id:'astro',name:'AstroMMBench',icon:'orbit',task:'天文图像理解',subjects:'天文',desc:'结合天文图像与文字问题，理解天体物理现象、图表和观测信息。',version:'论文 v2',size:'621 题',metric:'准确率',unit:'%',coverage:'论文评测 25 个模型',source:'AstroMMBench 团队',url:'https://arxiv.org/abs/2510.00063v2',paper:'https://arxiv.org/abs/2510.00063v2',fresh:'论文成绩参考',published:'2025-10-21',method:'使用覆盖六个天体物理子领域的图像选择题，比较多模态模型的天文图像理解能力。论文评测了 25 个模型。',caveat:'该榜需使用支持图像输入的模型；不能与纯文本测试直接比较。'},
 {id:'geo',name:'GeoBenchX',icon:'globe',task:'地理空间分析',subjects:'地理 / GIS',desc:'查询地理数据、生成地图，并完成需要多步骤操作的 GIS 分析任务。',version:'公开评测版',size:'多步骤 GIS 任务',metric:'任务通过率',unit:'%',coverage:'81 条模型／配置成绩',source:'Axis Spatial',url:'https://www.axisspatial.com/arena/evaluations/geobenchx',paper:'https://arxiv.org/abs/2503.18129',fresh:'专项任务榜',published:'2026-11-04',method:'围绕地理数据查询、分析和制图等任务，统计成功完成任务的比例。展示时应保留模型、推理设置与智能体框架。',caveat:'地理信息处理是地理学的一类任务，不代表模型的全部地理学科能力。'},
 {id:'sciknow',name:'SciKnowEval',icon:'layers',task:'跨学科科学能力',subjects:'物理 · 化学 · 生物 · 材料',desc:'从科学知识的记忆与理解，到推理、判断和应用，考察多个科学领域。',version:'论文 v4 / 数据 V2',size:'28,392 样本',metric:'综合得分',unit:'分',coverage:'论文比较 20 个模型',source:'浙江大学 HICAI',url:'https://github.com/hicai-zju/sciknoweval',paper:'https://arxiv.org/abs/2406.09098v4',fresh:'论文成绩参考',published:'2025-10-07',method:'围绕记忆、理解、推理、辨别和应用五个层次，对生物、化学、物理与材料科学中的知识能力进行测试。',caveat:'本文采用最新论文版本报告的 20 个模型数量；不同论文或数据版本不混排。'},
 {id:'aime',name:'AIME 2025',icon:'math',task:'数学解题',subjects:'数学',desc:'使用数学竞赛题，比较模型的计算、逻辑分析与多步骤解题能力。',version:'2025 年试题',size:'30 题',metric:'准确率',unit:'%',coverage:'123 个模型条目',source:'LLM Stats 聚合',url:'https://llm-stats.com/benchmarks/aime-2025',paper:'https://matharena.ai/',fresh:'经典数学参考',published:'2026-11-04',method:'以 2025 年 AIME 竞赛题为测试对象，评价模型解题结果。不同采样次数、工具使用条件和提示方式需要分开比较。',caveat:'衡量数学竞赛解题能力，不直接代表数学研究能力；聚合成绩需按测试条件筛选。'},
 {id:'mmlu',name:'MMLU-Pro',icon:'book',task:'综合学科知识',subjects:'综合学科（含理科）',desc:'通过更有挑战性的多选项学术问题，比较模型的学科知识与推理表现。',version:'MMLU-Pro',size:'12,000+ 题',metric:'准确率',unit:'%',coverage:'142 个模型条目',source:'LLM Stats 聚合',url:'https://llm-stats.com/benchmarks/mmlu-pro',paper:'https://github.com/TIGER-AI-Lab/MMLU-Pro',fresh:'综合学术参考',published:'2026-11-03',method:'覆盖 14 个学科领域，题目最多有 10 个选项，注重知识与推理的结合。除自然科学外，也包含法律、经济、历史等学科。',caveat:'参考聚合页包含模型方自报成绩；上线时应核对原始出处和测试条件。'}
];
const realResults={"gpqa":[{"name":"Gemini 3.1 Pro Preview (02/26)","score":95.45,"setting":""},{"name":"GPT-5.6 Sol","score":95.2,"setting":""},{"name":"Grok 4.6","score":94.7,"setting":""},{"name":"Gemini 3.8 Flash","score":94.44,"setting":""},{"name":"Gemini 3.7 Flash","score":93.94,"setting":""},{"name":"Qwen 3.8 Max","score":93.69,"setting":""},{"name":"Gemini 3.6 Flash","score":93.43,"setting":""},{"name":"Claude Opus 5","score":93.43,"setting":""},{"name":"Claude Fable 5.1","score":93.43,"setting":""},{"name":"Claude Fable 5","score":93.18,"setting":""},{"name":"GPT 5.5","score":93.18,"setting":""},{"name":"Kimi K3","score":92.93,"setting":""},{"name":"Grok 4.5","score":92.93,"setting":""},{"name":"Gemini 3.5 Flash","score":92.68,"setting":""},{"name":"MiniMax-M3","score":92.68,"setting":""},{"name":"Claude Opus 4.8","score":92.42,"setting":""},{"name":"DeepSeek V4 Pro 0813","score":92.42,"setting":""},{"name":"GPT-5.6 Luna","score":91.67,"setting":""},{"name":"Gemini 3 Pro (11/25)","score":91.67,"setting":""},{"name":"GPT 5.2","score":91.67,"setting":""},{"name":"GPT 5.4 (xhigh)","score":91.67,"setting":""},{"name":"Grok 4.3","score":91.41,"setting":""},{"name":"Muse Spark 1.1","score":91.16,"setting":""},{"name":"GPT-5.6 Terra","score":90.91,"setting":""},{"name":"Qwen 3.7 Max","score":90.15,"setting":""},{"name":"Claude Opus 4.7","score":90.15,"setting":""},{"name":"DeepSeek V4 Flash 0731","score":89.9,"setting":""},{"name":"Muse Spark","score":89.65,"setting":""},{"name":"Claude Opus 4.6 (Thinking)","score":89.65,"setting":""},{"name":"DeepSeek V4","score":89.39,"setting":""},{"name":"Kimi K2.6","score":89.14,"setting":""},{"name":"Claude Sonnet 5","score":88.89,"setting":""},{"name":"Qwen 3.8 27B","score":88.89,"setting":""},{"name":"Grok 4.20 (Reasoning)","score":88.64,"setting":""},{"name":"Grok 4","score":88.13,"setting":""},{"name":"GLM 5.3","score":88.13,"setting":""},{"name":"Gemini 3 Flash (12/25)","score":87.88,"setting":""},{"name":"Qwen 3.5 Plus","score":87.37,"setting":""},{"name":"Qwen 3.6 Plus","score":87.37,"setting":""},{"name":"Inkling","score":87.12,"setting":""},{"name":"GPT 5.1","score":86.62,"setting":""},{"name":"MiniMax-M2.7","score":86.62,"setting":""},{"name":"GLM 5.3 Flash","score":86.36,"setting":""},{"name":"Nemotron 3 Ultra","score":86.11,"setting":""},{"name":"Claude Opus 4.5 (Thinking)","score":85.86,"setting":""},{"name":"GPT 5","score":85.61,"setting":""},{"name":"GLM 5.2","score":85.61,"setting":""},{"name":"Claude Sonnet 4.6","score":85.61,"setting":""},{"name":"Grok 4 Fast (Reasoning)","score":85.35,"setting":""},{"name":"Ling 3.0 Flash","score":84.85,"setting":""},{"name":"Qwen 3 Max Thinking","score":84.85,"setting":""},{"name":"GLM 5.1","score":84.52,"setting":""},{"name":"Grok 4.1 Fast (Reasoning)","score":84.34,"setting":""},{"name":"o3","score":84.09,"setting":""},{"name":"Kimi K2.5","score":84.09,"setting":""},{"name":"Gemini 3.5 Flash Lite","score":83.84,"setting":""},{"name":"Inkling Small","score":83.59,"setting":""},{"name":"GLM 5","score":83.33,"setting":""},{"name":"GPT 5.4 Mini","score":83.08,"setting":""},{"name":"Qwen 3.5 Flash","score":82.83,"setting":""},{"name":"MiMo V2.5 Pro","score":82.58,"setting":""},{"name":"MiniMax-M2.5","score":82.07,"setting":""},{"name":"Claude Sonnet 4.5 (Thinking)","score":81.63,"setting":""},{"name":"Gemini 2.5 Flash Preview (9/25) (Nonthinking)","score":81.57,"setting":""},{"name":"MiMo V2.5","score":81.57,"setting":""},{"name":"Gemini 3.1 Flash Lite Preview","score":81.06,"setting":""},{"name":"Gemini 2.5 Pro Exp","score":80.81,"setting":""},{"name":"GPT 5 Mini","score":80.3,"setting":""},{"name":"DeepSeek V3.2 (Thinking)","score":80.3,"setting":""},{"name":"GLM 4.7","score":80.05,"setting":""},{"name":"Claude Opus 4.5 (Nonthinking)","score":79.55,"setting":""},{"name":"Qwen 3 Max","score":79.55,"setting":""},{"name":"Grok 3 Mini Reasoning","score":79.29,"setting":""},{"name":"GPT OSS 120B","score":78.54,"setting":""},{"name":"MiniMax-M2.1","score":78.54,"setting":""},{"name":"Kimi K2 Thinking","score":78.54,"setting":""},{"name":"Qwen 3 Max Preview","score":77.78,"setting":""},{"name":"GPT 5.4 Nano","score":77.53,"setting":""},{"name":"Gemini 2.5 Flash Preview (9/25) (Thinking)","score":76.52,"setting":""},{"name":"Claude Opus 4.1 (Thinking)","score":76.26,"setting":""},{"name":"DeepSeek V3.2 (Nonthinking)","score":76.26,"setting":""},{"name":"o3 Mini","score":75.5,"setting":""},{"name":"Claude 3.7 Sonnet (Thinking)","score":75.25,"setting":""},{"name":"Claude Sonnet 4 (Thinking)","score":75.0,"setting":""},{"name":"o4 Mini","score":74.5,"setting":""},{"name":"GLM 4.6","score":74.5,"setting":""},{"name":"Grok 3","score":74.24,"setting":""},{"name":"o1","score":73.23,"setting":""},{"name":"Grok 3 Mini Reasoning","score":72.98,"setting":""},{"name":"Claude Haiku 4.5 (Thinking)","score":72.22,"setting":""},{"name":"GLM 4.5","score":72.22,"setting":""},{"name":"Claude Opus 4 (Nonthinking)","score":71.72,"setting":""},{"name":"Kimi K2 Instruct","score":71.46,"setting":""},{"name":"Gemini 2.5 Flash Lite (9/25) (Thinking)","score":70.2,"setting":""},{"name":"Qwen 3 (235B)","score":70.2,"setting":""},{"name":"Claude Opus 4.1 (Nonthinking)","score":69.95,"setting":""},{"name":"Llama 4 Maverick","score":69.44,"setting":""},{"name":"Claude Sonnet 4 (Nonthinking)","score":69.44,"setting":""},{"name":"GPT OSS 20B","score":68.94,"setting":""},{"name":"Mistral Large 3","score":68.43,"setting":""},{"name":"GPT 4.1 Mini","score":67.93,"setting":""},{"name":"Claude 3.7 Sonnet (Nonthinking)","score":67.42,"setting":""},{"name":"GPT 4.1","score":65.4,"setting":""},{"name":"Gemini 2.0 Flash (001)","score":65.15,"setting":""},{"name":"Grok 4.1 Fast Non-Reasoning","score":65.15,"setting":""},{"name":"Gemini 2.5 Flash Lite (9/25) (Nonthinking)","score":64.14,"setting":""},{"name":"GPT 5 Nano","score":63.38,"setting":""},{"name":"Llama 3.3 Nemotron Super (Thinking)","score":62.37,"setting":""},{"name":"Magistral Medium 1.2 (09/2025)","score":62.37,"setting":""},{"name":"Grok 4 Fast (Non-Reasoning)","score":62.12,"setting":""},{"name":"DeepSeek V3 (03/24/2025)","score":61.62,"setting":""},{"name":"Claude 3.5 Sonnet Latest","score":59.34,"setting":""},{"name":"MiMo V2 Flash","score":59.34,"setting":""},{"name":"Gemini 1.5 Pro (002)","score":58.33,"setting":""},{"name":"Magistral Small 1.2 (09/2025)","score":58.33,"setting":""},{"name":"Gemini 2.5 Flash Preview 4/17 (Nonthinking)","score":57.58,"setting":""},{"name":"Laguna XS.2","score":55.05,"setting":""},{"name":"DeepSeek V3","score":54.55,"setting":""},{"name":"GPT 4o (2024-11-20)","score":53.79,"setting":""},{"name":"GPT 4.1 Nano","score":50.76,"setting":""},{"name":"Mistral Small (02/2024)","score":50.76,"setting":""},{"name":"Grok 2","score":50.76,"setting":""},{"name":"GPT 4o (2024-05-13)","score":50.25,"setting":""},{"name":"Llama 3.3 Instruct Turbo (70B)","score":50.0,"setting":""},{"name":"Command A","score":48.48,"setting":""},{"name":"Mistral Large (11/2024)","score":47.73,"setting":""},{"name":"Llama 3.3 Nemotron Super (Nonthinking)","score":47.73,"setting":""},{"name":"Llama 4 Scout","score":46.97,"setting":""},{"name":"Gemini 1.5 Flash (002)","score":45.96,"setting":""},{"name":"Mistral Small 3.1 (03/2025)","score":44.19,"setting":""},{"name":"GPT 4o Mini","score":44.19,"setting":""},{"name":"Claude 3.5 Haiku Latest","score":37.88,"setting":""},{"name":"Jamba 1.6 Large","score":36.11,"setting":""},{"name":"Mistral Medium 3.5","score":34.85,"setting":""},{"name":"Jamba 1.6 Mini","score":32.07,"setting":""},{"name":"Command R+","score":31.06,"setting":""},{"name":"GPT 3.5","score":30.56,"setting":""},{"name":"Laguna M.1","score":27.02,"setting":""}],"terminal":[{"name":"GPT-6 Astra","score":62.86,"setting":"Mini-SWE-agent"},{"name":"GPT-6.1 Sol","score":52.86,"setting":"Mini-SWE-agent"},{"name":"Claude Opus 5.5","score":47.14,"setting":"Mini-SWE-agent"},{"name":"Claude Sonnet 5.5","score":47.14,"setting":"Mini-SWE-agent"},{"name":"Gemini 4 Argon","score":44.29,"setting":"Mini-SWE-agent"},{"name":"Claude Fable 5.1","score":40.0,"setting":"Mini-SWE-agent"},{"name":"Wonder Full","score":37.14,"setting":"Mini-SWE-agent"},{"name":"Kimi K3.1 Pro","score":31.43,"setting":"Mini-SWE-agent"},{"name":"GPT-6 Sol","score":30.0,"setting":"Mini-SWE-agent"},{"name":"Claude Opus 5","score":27.14,"setting":"Mini-SWE-agent"},{"name":"Wonder","score":22.86,"setting":"Mini-SWE-agent"},{"name":"GPT-5.6 Sol","score":20.0,"setting":"Mini-SWE-agent"},{"name":"Claude Fable 5","score":15.71,"setting":"Mini-SWE-agent"},{"name":"Qwen 3.8 Max","score":12.86,"setting":"Mini-SWE-agent"},{"name":"Grok 4.6","score":11.43,"setting":"Mini-SWE-agent"},{"name":"Muse Spark 1.3 Max","score":10.0,"setting":"Mini-SWE-agent"},{"name":"Grok 4.7","score":10.0,"setting":"Mini-SWE-agent"},{"name":"Claude Haiku 5.5","score":10.0,"setting":"Mini-SWE-agent"},{"name":"GPT-5.6 Terra","score":10.0,"setting":"Mini-SWE-agent"},{"name":"Gemini 3.8 Flash","score":8.57,"setting":"Mini-SWE-agent"},{"name":"Gemini 3.7 Flash","score":7.14,"setting":"Mini-SWE-agent"},{"name":"Gemini 3.5 Flash","score":5.71,"setting":"Mini-SWE-agent"},{"name":"GLM 5.3","score":5.71,"setting":"Mini-SWE-agent"},{"name":"Claude Sonnet 5","score":5.71,"setting":"Mini-SWE-agent"},{"name":"Ember-1","score":5.71,"setting":"Mini-SWE-agent"},{"name":"Muse Spark 1.3","score":4.29,"setting":"Mini-SWE-agent"},{"name":"GPT-6 Luna","score":4.29,"setting":"Mini-SWE-agent"},{"name":"DeepSeek V4 Flash 0731","score":4.29,"setting":"Mini-SWE-agent"},{"name":"Gemini 3.6 Flash","score":4.29,"setting":"Mini-SWE-agent"},{"name":"Claude Opus 4.8","score":4.29,"setting":"Mini-SWE-agent"},{"name":"DeepSeek V4 Pro 0813","score":4.29,"setting":"Mini-SWE-agent"},{"name":"MiMo V2.6 Flash","score":4.29,"setting":"Mini-SWE-agent"},{"name":"Step 5 Preview","score":2.86,"setting":"Mini-SWE-agent"},{"name":"MiMo V2.6 Pro","score":2.86,"setting":"Mini-SWE-agent"},{"name":"GLM 5.3 Flash","score":2.86,"setting":"Mini-SWE-agent"},{"name":"Gemini 3.1 Pro Preview (02/26)","score":1.43,"setting":"Mini-SWE-agent"},{"name":"Beam 1.0","score":1.43,"setting":"Mini-SWE-agent"},{"name":"Hy4 Preview","score":1.43,"setting":"Terminus 2"},{"name":"Kimi K3","score":1.43,"setting":"Mini-SWE-agent"},{"name":"Mercury 2.5","score":0.0,"setting":"Mini-SWE-agent"},{"name":"GPT-5.6 Luna","score":0.0,"setting":"Mini-SWE-agent"},{"name":"DeepSeek V4.1 Flash","score":0.0,"setting":"Mini-SWE-agent"},{"name":"Qwen 3.8 27B","score":0.0,"setting":"Mini-SWE-agent"}],"bixbench":[{"name":"gemini-4-argon","score":0.523,"setting":""},{"name":"claude-fable-5.1 (with fallback)","score":0.515,"setting":"with fallback"},{"name":"claude-opus-5.5","score":0.502,"setting":""},{"name":"gpt-6-astra","score":0.492,"setting":""},{"name":"grok-4.6","score":0.488,"setting":""},{"name":"gpt-5.6-sol","score":0.48,"setting":""},{"name":"kimi-k3","score":0.47,"setting":""},{"name":"gpt-6-sol","score":0.47,"setting":""},{"name":"glm-5.2","score":0.463,"setting":""},{"name":"claude-opus-4.8","score":0.46,"setting":""},{"name":"gpt-5.5","score":0.431,"setting":""},{"name":"gemini-3.5-flash","score":0.421,"setting":""},{"name":"claude-opus-5","score":0.406,"setting":""},{"name":"gpt-6-luna","score":0.369,"setting":""},{"name":"gpt-5.4-mini","score":0.364,"setting":""},{"name":"gpt-5.4-nano","score":0.275,"setting":""},{"name":"gemini-3.1-pro-preview","score":0.248,"setting":""},{"name":"claude-sonnet-4.6","score":0.153,"setting":""},{"name":"claude-haiku-4.5","score":0.015,"setting":""},{"name":"gemini-3.1-flash-lite","score":0.0,"setting":""}],"geo":[{"name":"Claude Opus 5.5 (xhigh), Claude Code","org":"Anthropic","score":83.0,"setting":""},{"name":"Claude Sonnet 5.5 (high), Claude Code","org":"Anthropic","score":81.0,"setting":""},{"name":"Claude Sonnet 5.5 (xhigh), Claude Code","org":"Anthropic","score":81.0,"setting":""},{"name":"Claude Opus 5.5 (medium), Claude Code","org":"Anthropic","score":79.0,"setting":""},{"name":"GPT-6.1 Sol (medium), Codex","org":"OpenAI","score":79.0,"setting":""},{"name":"GPT-6.1 Sol (xhigh), Codex","org":"OpenAI","score":79.0,"setting":""},{"name":"Claude Opus 5.5 (high), Claude Code","org":"Anthropic","score":79.0,"setting":""},{"name":"Claude Haiku 5.5 (xhigh), Claude Code","org":"Anthropic","score":77.0,"setting":""},{"name":"Claude Sonnet 5 (high), Claude Code","org":"Anthropic","score":77.0,"setting":""},{"name":"Claude Opus 5.5 (low), Claude Code","org":"Anthropic","score":77.0,"setting":""},{"name":"Claude Sonnet 5.5 (low), Claude Code","org":"Anthropic","score":77.0,"setting":""},{"name":"GPT-6.1 Sol (high), Codex","org":"OpenAI","score":77.0,"setting":""},{"name":"Claude Sonnet 5.5 (medium), Claude Code","org":"Anthropic","score":76.0,"setting":""},{"name":"Claude Opus 5 (high), Claude Code","org":"Anthropic","score":75.0,"setting":""},{"name":"GPT-6 Sol (high), Codex","org":"OpenAI","score":75.0,"setting":""},{"name":"Gemini 3.1 Pro (preview) (low), Terminus-2","org":"Google","score":74.0,"setting":""},{"name":"Gemini 3.8 Flash (low), Terminus-2","org":"Google","score":74.0,"setting":""},{"name":"GPT-6 Luna (high), Codex","org":"OpenAI","score":74.0,"setting":""},{"name":"Gemini 3.1 Pro (preview) (high), Terminus-2","org":"Google","score":73.0,"setting":""},{"name":"Claude Opus 4.8 (high), Claude Code","org":"Anthropic","score":73.0,"setting":""},{"name":"GPT-6 Luna (xhigh), Codex","org":"OpenAI","score":73.0,"setting":""},{"name":"Claude Haiku 5.5 (low), Claude Code","org":"Anthropic","score":73.0,"setting":""},{"name":"Claude Opus 4.7 (high), Claude Code","org":"Anthropic","score":73.0,"setting":""},{"name":"Claude Haiku 5.5 (high), Claude Code","org":"Anthropic","score":72.0,"setting":""},{"name":"Claude Haiku 5.5 (medium), Claude Code","org":"Anthropic","score":71.0,"setting":""},{"name":"GLM-5.3-Flash (max), Claude Code","org":"Z.ai","score":70.0,"setting":""},{"name":"GPT-5.6 Sol (high), Codex","org":"OpenAI","score":70.0,"setting":""},{"name":"GPT-5.6 Luna (xhigh), Codex","org":"OpenAI","score":68.0,"setting":""},{"name":"GLM-5.2 (max), Terminus-2","org":"Z.ai","score":67.0,"setting":""},{"name":"GPT-5.6 Luna (high), Codex","org":"OpenAI","score":67.0,"setting":""},{"name":"DeepSeek V4 Pro (max), Terminus-2","org":"DeepSeek","score":67.0,"setting":""},{"name":"GLM-5.2 (high), Terminus-2","org":"Z.ai","score":67.0,"setting":""},{"name":"Qwen 3.8 27B (xhigh), Terminus-2","org":"Alibaba (Qwen)","score":67.0,"setting":""},{"name":"GPT-5.6 Terra (high), Codex","org":"OpenAI","score":67.0,"setting":""},{"name":"GLM-5.2 (max), Claude Code","org":"Z.ai","score":66.0,"setting":""},{"name":"DeepSeek V4 Pro (high), Terminus-2","org":"DeepSeek","score":65.0,"setting":""},{"name":"DeepSeek V4 Flash (high), Terminus-2","org":"DeepSeek","score":65.0,"setting":""},{"name":"GLM-5.3 (max), Terminus-2","org":"Z.ai","score":65.0,"setting":""},{"name":"Nemotron 3 Ultra (high), Terminus-2","org":"NVIDIA","score":65.0,"setting":""},{"name":"GLM-5.3 (max), Claude Code","org":"Z.ai","score":65.0,"setting":""},{"name":"Kimi K2.6 (Reasoning), Terminus-2","org":"Moonshot AI","score":64.0,"setting":""},{"name":"Kimi K3 (Reasoning), Terminus-2","org":"Moonshot AI","score":64.0,"setting":""},{"name":"Kimi K2.6 (Reasoning), Kimi Code","org":"Moonshot AI","score":64.0,"setting":""},{"name":"Kimi K2.7 Code (Reasoning), Kimi Code","org":"Moonshot AI","score":64.0,"setting":""},{"name":"Gemma 4 26B A4B (Reasoning), Terminus-2","org":"Google","score":63.0,"setting":""},{"name":"GPT-5.6 Luna (medium), Codex","org":"OpenAI","score":63.0,"setting":""},{"name":"DeepSeek V4 Flash (max), Terminus-2","org":"DeepSeek","score":62.0,"setting":""},{"name":"Kimi K2.7 Code (Reasoning), Terminus-2","org":"Moonshot AI","score":62.0,"setting":""},{"name":"Qwen 3.8 27B (xhigh), Qwen Code","org":"Alibaba (Qwen)","score":62.0,"setting":""},{"name":"GPT-5.6 Luna (low), Codex","org":"OpenAI","score":62.0,"setting":""},{"name":"Gemini 3.1 Flash-Lite (high), Terminus-2","org":"Google","score":61.0,"setting":""},{"name":"GLM-5.2 (Non-reasoning), Terminus-2","org":"Z.ai","score":60.0,"setting":""},{"name":"GLM-5.3 (low), Terminus-2","org":"Z.ai","score":60.0,"setting":""},{"name":"GPT-6 Luna (medium), Codex","org":"OpenAI","score":57.0,"setting":""},{"name":"Claude Sonnet 4.6 (high), Terminus-2","org":"Anthropic","score":57.0,"setting":""},{"name":"GLM-5.3-Flash (low), Terminus-2","org":"Z.ai","score":57.0,"setting":""},{"name":"GLM-5.3-Flash (max), Terminus-2","org":"Z.ai","score":57.0,"setting":""},{"name":"DeepSeek V4.1 Flash (max), Codex","org":"DeepSeek","score":56.0,"setting":""},{"name":"gpt-oss-120b (high), Codex","org":"OpenAI","score":55.0,"setting":""},{"name":"Nemotron 3.5 Super VL 120B (Reasoning), Terminus-2","org":"NVIDIA","score":53.0,"setting":""},{"name":"Claude Haiku 4.5 (Reasoning), Claude Code","org":"Anthropic","score":53.0,"setting":""},{"name":"GPT-6 Luna (low), Codex","org":"OpenAI","score":51.0,"setting":""},{"name":"Gemini 3.1 Flash-Lite (low), Terminus-2","org":"Google","score":51.0,"setting":""},{"name":"Gemini 3.8 Flash (high), Terminus-2","org":"Google","score":51.0,"setting":""},{"name":"DeepSeek V4 Flash (high), Codex","org":"DeepSeek","score":47.0,"setting":""},{"name":"gpt-oss-120b (high), Terminus-2","org":"OpenAI","score":45.0,"setting":""},{"name":"Gemini 3.1 Flash-Lite (minimal), Terminus-2","org":"Google","score":44.0,"setting":""},{"name":"MiniMax M3.1 Flash (max), Terminus-2","org":"MiniMax","score":44.0,"setting":""},{"name":"GLM-4.7-Flash (Reasoning), Terminus-2","org":"Z.ai","score":42.0,"setting":""},{"name":"GLM-4.7-Flash (Reasoning), Claude Code","org":"Z.ai","score":39.0,"setting":""},{"name":"gpt-oss-20b (high), Terminus-2","org":"OpenAI","score":38.0,"setting":""},{"name":"gpt-oss-120b (low), Terminus-2","org":"OpenAI","score":37.0,"setting":""},{"name":"Mistral Large 3 (Non-reasoning), Terminus-2","org":"Mistral AI","score":29.0,"setting":""},{"name":"Nemotron 3 Nano Omni 30B (Reasoning), Terminus-2","org":"NVIDIA","score":23.0,"setting":""},{"name":"Nemotron 3.5 Lightning 30B (Reasoning), Terminus-2","org":"NVIDIA","score":20.0,"setting":""},{"name":"Step 5 Preview (Reasoning), Terminus-2","org":"StepFun","score":18.0,"setting":""},{"name":"gpt-oss-20b (high), Codex","org":"OpenAI","score":10.0,"setting":""},{"name":"Llama 3.3 70B (Non-reasoning), Terminus-2","org":"Meta","score":6.0,"setting":""}],"mmlu":[{"name":"Sakana Namazu","org":"Sakana AI","score":90.3,"setting":"来源聚合成绩"},{"name":"Qwen3.7 Max","org":"Alibaba Cloud / Qwen Team","score":89.6,"setting":"来源聚合成绩"},{"name":"Qwen3.6 Plus","org":"Alibaba Cloud / Qwen Team","score":88.5,"setting":"来源聚合成绩"},{"name":"Qwen3.7-Plus","org":"Alibaba Cloud / Qwen Team","score":88.5,"setting":"来源聚合成绩"},{"name":"MiniMax M2.1","org":"MiniMax","score":88.0,"setting":"来源聚合成绩"},{"name":"Qwen3.5-397B-A17B","org":"Alibaba Cloud / Qwen Team","score":87.8,"setting":"来源聚合成绩"},{"name":"DeepSeek-V4-Pro-Max","org":"DeepSeek","score":87.5,"setting":"来源聚合成绩"},{"name":"Kimi K2.5","org":"Moonshot AI","score":87.1,"setting":"来源聚合成绩"},{"name":"ERNIE 5.0","org":"Baidu","score":87.0,"setting":"来源聚合成绩"},{"name":"Nemotron 3 Ultra (550B A55B)","org":"NVIDIA","score":86.8,"setting":"来源聚合成绩"},{"name":"Qwen3.5-122B-A10B","org":"Alibaba Cloud / Qwen Team","score":86.7,"setting":"来源聚合成绩"},{"name":"DeepSeek-V4-Flash-0423","org":"DeepSeek","score":86.4,"setting":"来源聚合成绩"},{"name":"Solar Pro 4","org":"Upstage","score":86.3,"setting":"来源聚合成绩"},{"name":"Qwen3.6-27B","org":"Alibaba Cloud / Qwen Team","score":86.2,"setting":"来源聚合成绩"},{"name":"DeepSeek-V4-Flash-Max","org":"DeepSeek","score":86.2,"setting":"来源聚合成绩"},{"name":"Qwen3.5-27B","org":"Alibaba Cloud / Qwen Team","score":86.1,"setting":"来源聚合成绩"},{"name":"Qwen3 Max Thinking","org":"Alibaba Cloud / Qwen Team","score":85.7,"setting":"来源聚合成绩"},{"name":"Qwen3.5-35B-A3B","org":"Alibaba Cloud / Qwen Team","score":85.3,"setting":"来源聚合成绩"},{"name":"Gemma 4 31B","org":"Google","score":85.2,"setting":"来源聚合成绩"},{"name":"Qwen3.6-35B-A3B","org":"Alibaba Cloud / Qwen Team","score":85.2,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2-Exp","org":"DeepSeek","score":85.0,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2 (Thinking)","org":"DeepSeek","score":85.0,"setting":"来源聚合成绩"},{"name":"MAI-Thinking-1","org":"Microsoft","score":85.0,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2","org":"DeepSeek","score":85.0,"setting":"来源聚合成绩"},{"name":"DeepSeek-R1-0528","org":"DeepSeek","score":85.0,"setting":"来源聚合成绩"},{"name":"Seed 1.8","org":"ByteDance","score":84.9,"setting":"来源聚合成绩"},{"name":"MiMo-V2-Flash","org":"Xiaomi","score":84.9,"setting":"来源聚合成绩"},{"name":"GLM-4.5","org":"Zhipu AI","score":84.6,"setting":"来源聚合成绩"},{"name":"Kimi K2-Thinking-0905","org":"Moonshot AI","score":84.6,"setting":"来源聚合成绩"},{"name":"Qwen3-235B-A22B-Thinking-2507","org":"Alibaba Cloud / Qwen Team","score":84.4,"setting":"来源聚合成绩"},{"name":"GLM-4.7","org":"Zhipu AI","score":84.3,"setting":"来源聚合成绩"},{"name":"K-EXAONE-236B-A23B","org":"LG AI Research","score":83.8,"setting":"来源聚合成绩"},{"name":"Qwen3 VL 235B A22B Thinking","org":"Alibaba Cloud / Qwen Team","score":83.8,"setting":"来源聚合成绩"},{"name":"Nemotron 3 Super (120B A12B)","org":"NVIDIA","score":83.7,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.1","org":"DeepSeek","score":83.7,"setting":"来源聚合成绩"},{"name":"Seed 2.0 Mini","org":"ByteDance","score":83.6,"setting":"来源聚合成绩"},{"name":"EXAONE 4.5 33B","org":"LG AI Research","score":83.3,"setting":"来源聚合成绩"},{"name":"Qwen3-235B-A22B-Instruct-2507","org":"Alibaba Cloud / Qwen Team","score":83.0,"setting":"来源聚合成绩"},{"name":"Qwen3-Next-80B-A3B-Thinking","org":"Alibaba Cloud / Qwen Team","score":82.7,"setting":"来源聚合成绩"},{"name":"LongCat-Flash-Chat","org":"Meituan","score":82.7,"setting":"来源聚合成绩"},{"name":"Gemma 4 26B-A4B","org":"Google","score":82.6,"setting":"来源聚合成绩"},{"name":"LongCat-Flash-Thinking","org":"Meituan","score":82.6,"setting":"来源聚合成绩"},{"name":"Kimi K2 0905","org":"Moonshot AI","score":82.5,"setting":"来源聚合成绩"},{"name":"Qwen3.5-9B","org":"Alibaba Cloud / Qwen Team","score":82.5,"setting":"来源聚合成绩"},{"name":"Qwen3 VL 32B Thinking","org":"Alibaba Cloud / Qwen Team","score":82.1,"setting":"来源聚合成绩"},{"name":"MiniMax M2","org":"MiniMax","score":82.0,"setting":"来源聚合成绩"},{"name":"Nemotron 3.5 Lightning (30B A3B)","org":"NVIDIA","score":81.9,"setting":"来源聚合成绩"},{"name":"Qwen3 VL 235B A22B Instruct","org":"Alibaba Cloud / Qwen Team","score":81.8,"setting":"来源聚合成绩"},{"name":"Sarvam-105B","org":"Sarvam AI","score":81.7,"setting":"来源聚合成绩"},{"name":"Nova 2 Pro","org":"Amazon","score":81.6,"setting":"来源聚合成绩"}],"aime":[{"name":"Kimi K2-Thinking-0905","org":"Moonshot AI","score":100.0,"setting":"来源聚合成绩"},{"name":"Grok-4 Heavy","org":"xAI","score":100.0,"setting":"来源聚合成绩"},{"name":"GPT-5.2 Pro","org":"OpenAI","score":100.0,"setting":"来源聚合成绩"},{"name":"GPT-5.2","org":"OpenAI","score":100.0,"setting":"来源聚合成绩"},{"name":"Gemini 3 Pro","org":"Google","score":100.0,"setting":"来源聚合成绩"},{"name":"Claude Opus 4.6","org":"Anthropic","score":99.8,"setting":"来源聚合成绩"},{"name":"Gemini 3 Flash","org":"Google","score":99.7,"setting":"来源聚合成绩"},{"name":"LongCat-Flash-Thinking-2601","org":"Meituan","score":99.6,"setting":"来源聚合成绩"},{"name":"GPT-5.1 High","org":"OpenAI","score":99.6,"setting":"来源聚合成绩"},{"name":"Nemotron 3 Nano (30B A3B)","org":"NVIDIA","score":99.2,"setting":"来源聚合成绩"},{"name":"GPT OSS 20B High","org":"OpenAI","score":98.7,"setting":"来源聚合成绩"},{"name":"GPT-5.1 Medium","org":"OpenAI","score":98.4,"setting":"来源聚合成绩"},{"name":"Seed 2.0 Pro","org":"ByteDance","score":98.3,"setting":"来源聚合成绩"},{"name":"Step-3.5-Flash","org":"StepFun","score":97.3,"setting":"来源聚合成绩"},{"name":"MAI-Thinking-1","org":"Microsoft","score":97.0,"setting":"来源聚合成绩"},{"name":"GPT-5.1 Codex High","org":"OpenAI","score":96.7,"setting":"来源聚合成绩"},{"name":"Sarvam-105B","org":"Sarvam AI","score":96.7,"setting":"来源聚合成绩"},{"name":"Sarvam-30B","org":"Sarvam AI","score":96.7,"setting":"来源聚合成绩"},{"name":"Kimi K2.5","org":"Moonshot AI","score":96.1,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2-Speciale","org":"DeepSeek","score":96.0,"setting":"来源聚合成绩"},{"name":"GLM-4.7","org":"Zhipu AI","score":95.7,"setting":"来源聚合成绩"},{"name":"GPT-5","org":"OpenAI","score":94.6,"setting":"来源聚合成绩"},{"name":"GPT-5 High","org":"OpenAI","score":94.6,"setting":"来源聚合成绩"},{"name":"Seed 1.8","org":"ByteDance","score":94.3,"setting":"来源聚合成绩"},{"name":"MiMo-V2-Flash","org":"Xiaomi","score":94.1,"setting":"来源聚合成绩"},{"name":"GPT-5.1 Instant","org":"OpenAI","score":94.0,"setting":"来源聚合成绩"},{"name":"GPT-5.1","org":"OpenAI","score":94.0,"setting":"来源聚合成绩"},{"name":"GPT-5.1 Thinking","org":"OpenAI","score":94.0,"setting":"来源聚合成绩"},{"name":"GLM-4.6","org":"Zhipu AI","score":93.9,"setting":"来源聚合成绩"},{"name":"Grok-3","org":"xAI","score":93.3,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2 (Thinking)","org":"DeepSeek","score":93.1,"setting":"来源聚合成绩"},{"name":"DeepSeek-V3.2","org":"DeepSeek","score":93.1,"setting":"来源聚合成绩"},{"name":"Seed 2.0 Lite","org":"ByteDance","score":93.0,"setting":"来源聚合成绩"},{"name":"EXAONE 4.5 33B","org":"LG AI Research","score":92.9,"setting":"来源聚合成绩"},{"name":"K-EXAONE-236B-A23B","org":"LG AI Research","score":92.8,"setting":"来源聚合成绩"},{"name":"o4-mini","org":"OpenAI","score":92.7,"setting":"来源聚合成绩"},{"name":"GPT OSS 120B High","org":"OpenAI","score":92.5,"setting":"来源聚合成绩"},{"name":"Qwen3-235B-A22B-Thinking-2507","org":"Alibaba Cloud / Qwen Team","score":92.3,"setting":"来源聚合成绩"},{"name":"Nova 2 Pro","org":"Amazon","score":92.3,"setting":"来源聚合成绩"},{"name":"Nova 2 Omni","org":"Amazon","score":92.1,"setting":"来源聚合成绩"},{"name":"Grok 4 Fast","org":"xAI","score":92.0,"setting":"来源聚合成绩"},{"name":"Grok-4","org":"xAI","score":91.7,"setting":"来源聚合成绩"},{"name":"GLM-4.7-Flash","org":"Zhipu AI","score":91.6,"setting":"来源聚合成绩"},{"name":"GPT-5 mini","org":"OpenAI","score":91.1,"setting":"来源聚合成绩"},{"name":"Mercury 2","org":"Inception","score":91.1,"setting":"来源聚合成绩"},{"name":"Nova 2 Lite","org":"Amazon","score":91.0,"setting":"来源聚合成绩"},{"name":"Grok-3 Mini","org":"xAI","score":90.8,"setting":"来源聚合成绩"},{"name":"LongCat-Flash-Thinking","org":"Meituan","score":90.6,"setting":"来源聚合成绩"},{"name":"Nemotron 3 Super (120B A12B)","org":"NVIDIA","score":90.2,"setting":"来源聚合成绩"},{"name":"Command A+","org":"Cohere","score":90.0,"setting":"来源聚合成绩"}],"chembench":[{"name":"meta-llama/llama-4-maverick-17b-128e-instruct","score":0.6453697056712132,"setting":"","recordId":"groq_meta-llama/llama-4-maverick-17b-128e-instruct_e8a077d8"},{"name":"o1-preview","score":0.6434720229555236,"setting":"T=1.0","recordId":"o1-preview"},{"name":"gemini-2.5-flash-preview-04-17","score":0.6411362819129809,"setting":"T=0.0","recordId":"gemini-2.5-flash-preview-04-17-base-1750491557"},{"name":"GPT-5-nano","score":0.6343390804597702,"setting":"T=0.0","recordId":"GPT-5-nano-base-1764459351"},{"name":"gpt-oss-120b","score":0.6313711414213927,"setting":"T=0.0","recordId":"gpt-oss-120b-base-1760293341"},{"name":"Claude-3.5 (Sonnet)","score":0.6255380200860832,"setting":"T=0.0","recordId":"claude3.5"},{"name":"gpt-oss-20b","score":0.6116295764536971,"setting":"T=0.0","recordId":"gpt-oss-20b-base-1760359009"},{"name":"GPT-4o","score":0.610832137733142,"setting":"T=0.0","recordId":"gpt-4o"},{"name":"kimi-k2-instruct-0905","score":0.5965541995692749,"setting":"T=0.0","recordId":"kimi-k2-instruct-0905-base-1760364223"},{"name":"Llama-3.1-405B-Instruct","score":0.5792682926829268,"setting":"T=0.0","recordId":"llama3.1-405b-instruct"},{"name":"Mistral-Large-2","score":0.5699426111908178,"setting":"T=0.0","recordId":"mistral-large-2-123b"},{"name":"Claude-3 (Opus)","score":0.569583931133429,"setting":"T=0.0","recordId":"claude3"},{"name":"Llama-3.1-70B-Instruct","score":0.533715925394548,"setting":"T=0.0","recordId":"llama3.1-70b-instruct"},{"name":"Qwen-2.5-32B","score":0.5287150035893754,"setting":"T=0.0","recordId":"Qwen-2.5-32B-base-1740920072"},{"name":"Llama-3-70B-Instruct","score":0.5179340028694405,"setting":"T=0.0","recordId":"llama3-70b-instruct"},{"name":"Llama-3-70B-Instruct (Temperature 1.0)","score":0.5164992826398852,"setting":"T=1.0","recordId":"llama3-70b-instruct-T-one"},{"name":"Llama-3.1-70B-Instruct (Temperature 1.0)","score":0.5111190817790531,"setting":"T=1.0","recordId":"llama3.1-70b-instruct-T-one"},{"name":"GPT-4o-mini","score":0.5032304379038047,"setting":"T=0.0","recordId":"GPT-4o-mini-base-1764283510"},{"name":"Gemma-2-9B-it","score":0.48242467718794835,"setting":"T=0.0","recordId":"gemma-2-9b-it"},{"name":"Gemma-2-9B-it (Temperature 1.0)","score":0.4802725968436155,"setting":"T=1.0","recordId":"gemma-2-9b-it-T-one"},{"name":"Phi-3-Medium-4k-Instruct","score":0.47453371592539456,"setting":"T=0.0","recordId":"phi-3-medium-4k-instruct"},{"name":"Claude-2","score":0.4734576757532281,"setting":"T=0.0","recordId":"claude2"},{"name":"Llama-3.1-8B-Instruct","score":0.4716642754662841,"setting":"T=0.0","recordId":"llama3.1-8b-instruct"},{"name":"GPT-3.5 Turbo","score":0.46628407460545196,"setting":"T=0.0","recordId":"gpt-3.5-turbo"},{"name":"ChemPile-LoRA-Ensemble","score":0.4662598707824838,"setting":"T=0.0","recordId":"ChemPile-LoRA-Ensemble-Qwen2.5-7B-Instruct-1753950951"},{"name":"Llama-3.1-8B-Instruct (Temperature 1.0)","score":0.4612625538020086,"setting":"T=1.0","recordId":"llama3.1-8b-instruct-T-one"},{"name":"Llama-3-8B-Instruct (Temperature 1.0)","score":0.4565997130559541,"setting":"T=1.0","recordId":"llama3-8b-instruct-T-one"},{"name":"Llama-3-8B-Instruct","score":0.45552367288378764,"setting":"T=0.0","recordId":"llama3-8b-instruct"},{"name":"Gemini-Pro","score":0.45265423242467717,"setting":"T=0.0","recordId":"gemini-pro"},{"name":"Command-R+","score":0.44763271162123386,"setting":"T=0.0","recordId":"command-r+"},{"name":"qwen2.5-instruct","score":0.4271356783919598,"setting":"T=0.0","recordId":"qwen2.5-instruct-base-1751944608"},{"name":"Mixtral-8x7b-Instruct","score":0.42395982783357244,"setting":"T=0.0","recordId":"mixtral-8x7b-instruct"},{"name":"Mixtral-8x7b-Instruct (Temperature 1.0)","score":0.4182209469153515,"setting":"T=1.0","recordId":"mixtral-8x7b-instruct-T-one"},{"name":"GPT-4","score":0.41284074605451937,"setting":"T=0.0","recordId":"gpt-4"},{"name":"Llama-2-70B Chat","score":0.2661406025824964,"setting":"T=0.01","recordId":"llama2-70b-chat"},{"name":"Llama-2-13B Chat","score":0.25538020086083213,"setting":"T=0.0","recordId":"llama2-13b-chat"},{"name":"Gemma-1.1-7B-it","score":0.19225251076040173,"setting":"T=0.0","recordId":"gemma-1-1-7b-it"},{"name":"Gemma-1.1-7B-it (Temperature 1.0)","score":0.1908177905308465,"setting":"T=1.0","recordId":"gemma-1-1-7b-it-T-one"},{"name":"Llama-2-7b-chat-hf","score":0.040207522697795074,"setting":"T=0.0","recordId":"Llama-2-7b-chat-hf -base-1741273893"},{"name":"Galactica-120b","score":0.015066573230553609,"setting":"T=0.0","recordId":"galactica_120b"}],"sciknow":[{"name":"o4-mini","score":0.71,"setting":"Zero-shot · 论文 v4"},{"name":"o3-mini","score":0.696,"setting":"Zero-shot · 论文 v4"},{"name":"GPT-4.1","score":0.679,"setting":"Zero-shot · 论文 v4"},{"name":"GPT-4o","score":0.65,"setting":"Zero-shot · 论文 v4"},{"name":"Claude-4-Sonnet-thinking","score":0.634,"setting":"Zero-shot · 论文 v4"},{"name":"GPT-4o-mini","score":0.617,"setting":"Zero-shot · 论文 v4"},{"name":"Claude-4-Sonnet","score":0.616,"setting":"Zero-shot · 论文 v4"},{"name":"DeepSeek-V3","score":0.657,"setting":"Zero-shot · 论文 v4"},{"name":"DeepSeek-R1","score":0.647,"setting":"Zero-shot · 论文 v4"},{"name":"QwQ-32B","score":0.655,"setting":"Zero-shot · 论文 v4"},{"name":"Qwen2.5-72B-Instruct","score":0.638,"setting":"Zero-shot · 论文 v4"},{"name":"Qwen2-7B-Instruct","score":0.564,"setting":"Zero-shot · 论文 v4"},{"name":"Llama4-Scout","score":0.633,"setting":"Zero-shot · 论文 v4"},{"name":"Qwen3-8B-thinking","score":0.619,"setting":"Zero-shot · 论文 v4"},{"name":"Llama3-8B-Instruct","score":0.479,"setting":"Zero-shot · 论文 v4"},{"name":"ChemDFM-13B","score":0.521,"setting":"Zero-shot · 论文 v4"},{"name":"ChemLLM-20B-Chat","score":0.481,"setting":"Zero-shot · 论文 v4"},{"name":"MolInst-Llama3-8B","score":0.475,"setting":"Zero-shot · 论文 v4"},{"name":"SciGLM-6B","score":0.399,"setting":"Zero-shot · 论文 v4"},{"name":"LlaSMol-Mistral-7B","score":0.235,"setting":"Zero-shot · 论文 v4"}],"astro":[{"name":"ChatGPT-4o","score":69.07,"setting":"多模态 · 论文 v2"},{"name":"Doubao-1.5-vision-pro","score":68.12,"setting":"多模态 · 论文 v2"},{"name":"QwenVLMax","score":66.83,"setting":"多模态 · 论文 v2"},{"name":"Ovis2-34B","score":70.53,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-38B","score":67.63,"setting":"多模态 · 论文 v2"},{"name":"Qwen2.5-VL-72B","score":67.47,"setting":"多模态 · 论文 v2"},{"name":"Ovis2-16B","score":67.31,"setting":"多模态 · 论文 v2"},{"name":"Qwen2.5-VL-32B","score":64.25,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-78B","score":64.25,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-14B","score":63.77,"setting":"多模态 · 论文 v2"},{"name":"SAIL-VL-1.6-8B","score":62.32,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-8B","score":61.03,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-9B","score":60.55,"setting":"多模态 · 论文 v2"},{"name":"DeepSeek_VL2","score":59.9,"setting":"多模态 · 论文 v2"},{"name":"Qwen2.5-VL-3B","score":58.94,"setting":"多模态 · 论文 v2"},{"name":"MiniCPM-o-2.6","score":57.97,"setting":"多模态 · 论文 v2"},{"name":"Qwen2.5-VL-7B","score":57.33,"setting":"多模态 · 论文 v2"},{"name":"Kimi-VL-A3B-Instruct","score":56.68,"setting":"多模态 · 论文 v2"},{"name":"LLaVA_Onevision_72B","score":55.39,"setting":"多模态 · 论文 v2"},{"name":"Gemma3-12B","score":52.82,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-2B","score":51.69,"setting":"多模态 · 论文 v2"},{"name":"Kimi-VL-A3B-Thinking","score":50.08,"setting":"多模态 · 论文 v2"},{"name":"GLM-4v-9B","score":49.76,"setting":"多模态 · 论文 v2"},{"name":"InternVL3-1B","score":45.73,"setting":"多模态 · 论文 v2"},{"name":"Gemma3-4B","score":42.51,"setting":"多模态 · 论文 v2"}],"phybench":[{"name":"Gemini 2.5 Pro","score":36.9,"setting":"论文 v2 · Figure 1"},{"name":"o3 (high)","score":34.8,"setting":"论文 v2 · Figure 1"},{"name":"o4-mini (high)","score":29.4,"setting":"论文 v2 · Figure 1"},{"name":"DeepSeek-R1","score":25,"setting":"论文 v2 · Figure 1"},{"name":"o3-mini (high)","score":25,"setting":"论文 v2 · Figure 1"},{"name":"o4-mini","score":24.9,"setting":"论文 v2 · Figure 1"},{"name":"o3-mini","score":21.3,"setting":"论文 v2 · Figure 1"},{"name":"Grok 3 Beta","score":21.2,"setting":"论文 v2 · Figure 1"},{"name":"Gemini 2.0 Flash Thinking","score":18.2,"setting":"论文 v2 · Figure 1"},{"name":"o1","score":18,"setting":"论文 v2 · Figure 1"},{"name":"Claude 3.7 Sonnet Thinking","score":15.3,"setting":"论文 v2 · Figure 1"},{"name":"o3-mini (low)","score":13.7,"setting":"论文 v2 · Figure 1"},{"name":"DeepSeek-V3","score":13.6,"setting":"论文 v2 · Figure 1"},{"name":"GPT-4.1","score":12.9,"setting":"论文 v2 · Figure 1"},{"name":"Claude 3.7 Sonnet","score":13.2,"setting":"论文 v2 · Figure 1"},{"name":"GPT-4o","score":7,"setting":"论文 v2 · Figure 1"},{"name":"Qwen2.5-max","score":6.1,"setting":"论文 v2 · Figure 1"},{"name":"DeepSeek-R1-Distill-Qwen-32B","score":2.6,"setting":"论文 v2 · Figure 1"},{"name":"QwQ-32B","score":1.2,"setting":"论文 v2 · Figure 1"}]};
const resultConfig={"gpqa": {"sourceUpdated": "2026-09-01", "decimals": 2, "scale": 100, "resultNote": "收录 Vals AI 公开成绩；该榜已归档，不再测试新模型。"}, "terminal": {"sourceUpdated": "2026-10-25", "decimals": 2, "scale": 100, "resultNote": "收录 Vals AI 43 条模型／框架配置成绩；保留 Mini-SWE-agent 等框架信息。"}, "bixbench": {"sourceUpdated": "2026-10-16", "decimals": 3, "scale": 1, "unit": "0–1 分", "resultNote": "收录官方默认榜单 20 条成绩；保留 fallback 等配置。", "caveat": "按原始 0–1 平均得分展示，不换算为百分制。"}, "chembench": {"sourceUpdated": "", "decimals": 3, "scale": 1, "unit": "0–1 分", "resultUrl": "https://huggingface.co/datasets/jablonkagroup/ChemBench-Results/viewer/default/2.0.0", "resultNote": "使用官方结果库 2.0.0 分区。仅收录 verified=true、未使用 harness 的模型记录，排除测试条目。", "coverage": "40 条筛选后成绩", "caveat": "结果库的模型元信息可能缺失。分数保留原始尺度，展示时四舍五入为三位小数。"}, "phybench": {"sourceUpdated": "2025-05-18", "version": "论文 v2", "resultUrl": "https://arxiv.org/html/2504.16074v2#S1.F1", "decimals": 1, "scale": 100, "resultNote": "收录论文 v2 Figure 1 的 19 个模型准确率；不使用错误分析子集或人类基线分数。", "method": "使用论文 v2 Figure 1 的全量 PHYBench 平均准确率。论文同时报告 EED 得分，本页只展示准确率。"}, "astro": {"sourceUpdated": "2025-10-21", "decimals": 2, "scale": 100, "resultUrl": "https://arxiv.org/html/2510.00063v2#S4.T1", "resultNote": "收录论文 v2 Table 1 的 25 个模型 Overall 列。"}, "sciknow": {"sourceUpdated": "2025-10-07", "decimals": 3, "scale": 1, "unit": "0–1 分", "resultUrl": "https://arxiv.org/html/2406.09098v4#S3.T1", "resultNote": "收录论文 v4 Table 1 的 20 个模型 Overall 列，零样本测试。"}, "geo": {"sourceUpdated": "", "decimals": 0, "scale": 100, "resultNote": "收录 Axis Spatial 页面可核对的 78 条配置成绩；无成绩记录不收录。保留推理设置与框架。"}, "aime": {"sourceUpdated": "", "decimals": 1, "scale": 100, "resultNote": "收录 LLM Stats 页面前 50 条公开成绩。原网页的 0–1 准确率乘以 100 后按百分数展示；包含模型方自报结果。"}, "mmlu": {"sourceUpdated": "", "decimals": 1, "scale": 100, "resultNote": "收录 LLM Stats 页面前 50 条公开成绩。原网页的 0–1 准确率乘以 100 后按百分数展示；包含模型方自报结果。"}};
benchmarks.forEach(b=>Object.assign(b,resultConfig[b.id]));
const $=id=>evaluationRoot.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={id:'gpqa',query:'',access:'all',view:'table',direction:-1,page:1,selected:[],module:'catalog'},lastFocus=null,toastTimer;
const pageSize=10,current=()=>benchmarks.find(b=>b.id===state.id);
function modelMeta(name){const n=name.toLowerCase();let org='未披露',mark='◈',color='#8b79c7',open=null;
 const labs=[[/gemini|gemma/,'Google','✦','#5f8de3'],[/gpt|^o[134](?:[- (]|$)|chatgpt/,'OpenAI','◎','#658d82'],[/claude/,'Anthropic','✳','#bf9a82'],[/deepseek/,'DeepSeek','≈','#6d8ce5'],[/qwen|qwq/,'Alibaba / Qwen','✧','#8b6bd9'],[/kimi/,'Moonshot AI','K','#626b85'],[/glm/,'Z.ai','Z','#8395c0'],[/grok/,'xAI','𝕏','#555c70'],[/minimax/,'MiniMax','M','#dc939e'],[/llama|galactica/,'Meta','∞','#7b9dd1'],[/mistral|mixtral|magistral/,'Mistral AI','M','#799aad'],[/ovis/,'AIDC-AI','O','#7187bf'],[/internvl/,'OpenGVLab','I','#779da1'],[/doubao|seed/,'ByteDance','D','#7795c0'],[/phi-/,'Microsoft','Φ','#7aa5b4'],[/nemotron/,'NVIDIA','N','#7ea268']];
 for(const [rx,o,m,c] of labs)if(rx.test(n)){org=o;mark=m;color=c;break;}
 if(/gemma|llama|galactica|gpt[- ]oss|deepseek|qwq|qwen.*(?:\d+b|instruct)|qwen.*vl|ovis|internvl|sail-vl|minicpm|llava|mistral|mixtral|phi-|chemdfm|chemllm|molinst|sciglm|llasmol|kimi.*k2|nemotron/.test(n))open=true;
 else if(/gpt|chatgpt|^o[134](?:[- (]|$)|gemini|claude|grok|doubao|qwen.*(?:max|plus)|kimi.*k3|command/.test(n))open=false;
 return {org,mark,color,open};}
function scoreText(row){return row.score.toFixed(current().decimals??2);}
function scoreWidth(row){return Math.max(0,Math.min(100,row.score/(current().scale||100)*100));}
function modelType(row){return row.open===true?'开源':row.open===false?'闭源':'未披露';}
function allRows(){
 const benchmark=current();
 const ranked=(realResults[benchmark.id]||[]).map((row,index)=>({
  ...modelMeta(row.name),...row,key:String(index),source:benchmark.source,url:benchmark.resultUrl||benchmark.url,
 })).sort((a,b)=>b.score-a.score);
 let rank=0;
 return ranked.map((row,index)=>{
  if(index===0||row.score!==ranked[index-1].score)rank=index+1;
  return {...row,rank};
 });
}
function sortedRows(rows){
 return state.direction===-1?rows:rows.sort((a,b)=>a.score-b.score);
}
function filteredRows(){
 const query=state.query.trim().toLowerCase();
 return sortedRows(allRows().filter(row=>
  (state.access==='all'||(state.access==='open'?row.open===true:row.open===false))
  &&[row.name,row.org].some(value=>value.toLowerCase().includes(query))
 ));
}
function syncBenchmarkArrows(){
 const tabs=$('benchmarkTabs');
 if(!tabs)return;
 const limit=tabs.scrollWidth-tabs.clientWidth;
 $('benchmarkArrows').classList.toggle('hidden',limit<=1);
 $('benchmarkPrev').disabled=tabs.scrollLeft<=1;
 $('benchmarkNext').disabled=tabs.scrollLeft>=limit-1;
}
function revealBenchmarkTab(){
 const tabs=$('benchmarkTabs'),active=tabs.querySelector('.active');
 if(!active||!tabs.clientWidth)return;
 const viewport=tabs.getBoundingClientRect(),item=active.getBoundingClientRect();
 if(item.left<viewport.left)tabs.scrollBy({left:item.left-viewport.left});
 else if(item.right>viewport.right)tabs.scrollBy({left:item.right-viewport.right});
 syncBenchmarkArrows();
}
function renderBenchmarkTabs(){
 const tabs=$('benchmarkTabs');
 if(!tabs.firstElementChild){
  $('benchmarkCount').textContent=benchmarks.length;
  tabs.innerHTML=benchmarks.map(b=>`<button type="button" class="benchmark-chip" id="benchmark-tab-${b.id}" role="tab" aria-controls="benchmarkPanel" data-benchmark="${b.id}">${icon(b.icon,16)}${esc(b.name)}</button>`).join('');
  tabs.querySelectorAll('button').forEach(button=>button.onclick=()=>selectBenchmark(button.dataset.benchmark));
  tabs.onkeydown=event=>{
   const index=benchmarks.findIndex(b=>b.id===state.id);
   const next={ArrowLeft:(index-1+benchmarks.length)%benchmarks.length,ArrowRight:(index+1)%benchmarks.length,Home:0,End:benchmarks.length-1}[event.key];
   if(next===undefined)return;
   event.preventDefault();
   const id=benchmarks[next].id;
   selectBenchmark(id);
   $('benchmark-tab-'+id).focus({preventScroll:true});
  };
 }
 tabs.querySelectorAll('button').forEach(button=>{
  const active=button.dataset.benchmark===state.id;
  button.classList.toggle('active',active);
  button.setAttribute('aria-selected',String(active));
  button.tabIndex=active?0:-1;
 });
 $('benchmarkPanel').setAttribute('aria-labelledby','benchmark-tab-'+state.id);
 revealBenchmarkTab();
}
function selectBenchmark(id){
 if(id!==state.id){
  state.id=id;
  state.page=1;
  state.selected=[];
  renderBenchmarkTabs();
  renderSummary();
  renderResults();
 }
 if(state.module!=='leaderboard')switchModule('leaderboard');
}
const benchmarkOfficialSources={
 chembench:'https://chembench.lamalab.org/',
 terminal:'https://www.terminal-bench-science.ai/',
 bixbench:'https://advances.edisonscientific.com/benchmarks/bixbench3/',
 phybench:'https://www.phybench.cn/',
 geo:'https://github.com/Solirinai/GeoBenchX',
 sciknow:'https://github.com/hicai-zju/sciknoweval',
 aime:'https://maa.org/maa-invitational-competitions/',
};
function renderSummary(){
 const b=current(),details=catalogMeta[b.id];
 $('benchmarkTitle').textContent=b.name;
 $('benchmarkDesc').textContent=b.desc;
 $('taskTag').innerHTML=details.subjects.map(tag=>`<span class="tag">${esc(tag)}</span>`).join('');
 $('benchmarkIcon').innerHTML=icon(b.icon,25);
 $('sourceLink').href=benchmarkOfficialSources[b.id]||b.paper;
 const fields=[
  ['评测指标',`${b.metric}（${b.unit}）`,'chart'],
  ['评测集规模',b.size,'layers'],
  ['发布机构',details.team,'institution'],
  ['更新时间',b.sourceUpdated||'来源未标注','calendar'],
 ];
 $('metadata').innerHTML=fields.map(([label,value,symbol])=>`<div class="meta-item"><div class="meta-symbol">${icon(symbol,17)}</div><div><dt>${label}</dt><dd>${esc(value)}</dd></div></div>`).join('');
}
function renderModelTable(rows){
 const selected=new Set(state.selected);
 const picked=rows.filter(row=>selected.has(row.key)).length;
 const ascending=state.direction===1;
 $('results').innerHTML=`<div class="table-scroll"><table aria-label="${esc(current().name)} 模型榜单">
 <thead><tr>
  <th scope="col"><input type="checkbox" id="selectAll" aria-label="选择本页全部模型" ${picked===rows.length?'checked':''}></th>
  <th scope="col">排名</th>
  <th scope="col">模型</th>
  <th scope="col" aria-sort="${ascending?'ascending':'descending'}"><button type="button" id="sortScore" aria-label="成绩，点击${ascending?'降序':'升序'}">成绩 ${icon(ascending?'chevron-up':'chevron-down',14)}</button></th>
  <th scope="col">模型开放类型</th><th scope="col">来源</th>
 </tr></thead>
 <tbody>${rows.map(row=>`<tr class="data-row ${row.rank===1?'rank-first':''} ${selected.has(row.key)?'selected':''}">
  <td><input type="checkbox" data-select="${row.key}" aria-label="选择 ${esc(row.name)}" ${selected.has(row.key)?'checked':''}></td>
  <td><span class="rank ${row.rank<4?'top'+row.rank:''}">${String(row.rank).padStart(2,'0')}</span></td>
  <td><div class="model-cell"><div class="model-avatar" style="color:${row.color}" aria-hidden="true">${row.mark}</div><div class="model-copy">
   <div class="model-name" title="${esc(row.name)}">${esc(row.name)}</div><div class="model-meta" title="${esc(row.setting||row.org)}">${esc(row.org)}</div>
  </div></div></td>
  <td><div class="score-cell"><span class="score-number">${scoreText(row)}${current().unit==='%'?'%':''}</span><span class="score-track" aria-hidden="true"><span class="score-fill" style="width:${scoreWidth(row)}%"></span></span></div></td>
  <td><span class="weight-tag ${row.open===true?'open':row.open===false?'closed':''}"><i></i>${modelType(row)}</span></td>
  <td><a class="result-source source-link" href="${esc(row.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(row.name)} 成绩来源">${esc(row.source)} ${icon('external',13)}</a></td>
 </tr>`).join('')}</tbody></table></div>`;
 $('sortScore').onclick=()=>{state.direction*=-1;state.page=1;renderResults();};
 const selectAll=$('selectAll');
 selectAll.indeterminate=picked>0&&picked<rows.length;
 selectAll.onchange=()=>{
  for(const row of rows){
   if(selectAll.checked)selected.add(row.key);
   else selected.delete(row.key);
  }
  state.selected=[...selected];
  renderResults();
 };
 $('results').querySelectorAll('[data-select]').forEach(input=>input.onchange=()=>{
  if(input.checked)selected.add(input.dataset.select);
  else selected.delete(input.dataset.select);
  state.selected=[...selected];
  renderResults();
 });
}
function renderModelChart(rows){
 const benchmark=current();
 $('results').innerHTML=`<div class="chart-view">
  <div class="chart-info"><span>${esc(benchmark.metric)} · 越高越好</span><span>单位 ${esc(benchmark.unit)}</span></div>
  ${rows.map(row=>`<div class="chart-row"><span class="chart-name" title="${esc(row.name)}">${esc(row.name)}</span><div class="chart-track" aria-hidden="true"><div class="chart-fill" style="width:${scoreWidth(row)}%"></div></div><span class="chart-val">${scoreText(row)}${benchmark.unit==='%'?'%':''}</span></div>`).join('')}
  <div class="chart-axis" aria-hidden="true"><span>0</span>${[.25,.5,.75,1].map(value=>`<span>${value*(benchmark.scale||100)}</span>`).join('')}</div>
 </div>`;
}
function renderBoardPagination(maxPage){
 const pagination=$('pagination');
 pagination.innerHTML=`<button type="button" ${state.page===1?'disabled':''} id="prevPage" aria-label="上一页">${icon('chevron-left',14)}</button>
  ${Array.from({length:maxPage},(_,index)=>index+1).filter(number=>number===1||number===maxPage||Math.abs(number-state.page)<=1).map((number,index,pages)=>`${index&&number-pages[index-1]>1?'<span class="page-gap">…</span>':''}<button type="button" class="${state.page===number?'active':''}" ${state.page===number?'aria-current="page"':''} data-page="${number}" aria-label="第 ${number} 页">${number}</button>`).join('')}
  <button type="button" ${state.page===maxPage?'disabled':''} id="nextPage" aria-label="下一页">${icon('chevron-right',14)}</button>`;
 $('prevPage').onclick=()=>{state.page--;renderResults();};
 $('nextPage').onclick=()=>{state.page++;renderResults();};
 pagination.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderResults();});
}
function renderResults(){
 const focused=evaluationRoot.activeElement;
 const rows=filteredRows(),maxPage=Math.max(1,Math.ceil(rows.length/pageSize));
 state.page=Math.min(state.page,maxPage);
 const start=(state.page-1)*pageSize,paged=rows.slice(start,start+pageSize);
 $('clearSearch').classList.toggle('hidden',!state.query);
 $('resetBtn').classList.toggle('hidden',!state.query&&state.access==='all');
 $('resultSummary').textContent=rows.length?`第 ${start+1}–${start+paged.length} 条，共 ${rows.length} 条成绩`:'共 0 条成绩';
 $('pagination').classList.toggle('hidden',!rows.length);
 if(!rows.length){
  $('results').innerHTML=`<div class="empty-state">${icon('search',30)}<strong>没有找到匹配的模型</strong><span>试试其他名称，或重置筛选条件。</span><button type="button" class="btn" id="emptyReset">重置筛选</button></div>`;
  $('emptyReset').onclick=resetFilters;
 }else if(state.view==='table')renderModelTable(paged);
 else renderModelChart(paged);
 renderBoardPagination(maxPage);
 renderTray();
 if(focused&&!focused.isConnected){
  const replacement=focused.id?$(focused.id):focused.dataset.select!==undefined?$('results').querySelector(`[data-select="${focused.dataset.select}"]`):null;
  replacement?.focus({preventScroll:true});
 }
}
function renderTray(){
 const tray=$('compareTray');
 const count=state.selected.length;
 tray.classList.toggle('hidden',!count||state.module!=='leaderboard');
 if(!count)return;
 const canCompare=count>=2&&count<=3;
 const names=allRows().filter(row=>state.selected.includes(row.key)).slice(0,3).map(row=>row.name);
 tray.innerHTML=`<span>已选 <strong>${count}</strong> 条成绩</span><span class="tray-models">${names.map(esc).join(' / ')}${count>3?'…':''}</span><button type="button" class="clear" id="clearSelection">清空</button><button type="button" class="btn btn-primary" id="compareBtn" ${canCompare?'':'disabled'} title="可对比 2 至 3 个模型">对比模型 ${icon('arrow-right',13)}</button>`;
 $('clearSelection').onclick=()=>{state.selected=[];renderResults();};
 $('compareBtn').onclick=showComparison;
}
function resetFilters(){
 state.query='';
 state.access='all';
 state.page=1;
 $('modelSearch').value='';
 evaluationRoot.querySelectorAll('[data-access]').forEach(button=>{
  const active=button.dataset.access==='all';
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 renderResults();
}
function setView(view){
 state.view=view;
 for(const item of ['table','chart']){
  $(item+'ViewBtn').classList.toggle('active',item===view);
  $(item+'ViewBtn').setAttribute('aria-pressed',String(item===view));
 }
 renderResults();
}
function modal(title,body,actions='',wide=false){closeModal();lastFocus=evaluationRoot.activeElement;$('modalRoot').innerHTML=`<div class="modal-overlay" id="modalOverlay"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-header"><h3 id="modalTitle">${title}</h3><button class="modal-close" id="closeModal" aria-label="关闭弹窗">${icon('close',18)}</button></div><div class="modal-body">${body}</div><div class="modal-footer">${actions||'<button class="btn btn-primary" id="modalDone">知道了</button>'}</div></section></div>`;document.body.style.overflow='hidden';$('closeModal').onclick=closeModal;$('modalOverlay').onclick=e=>{if(e.target===$('modalOverlay'))closeModal()};if($('modalDone'))$('modalDone').onclick=closeModal;$('closeModal').focus();}
function closeModal(){if(!$('modalRoot').firstElementChild)return;$('modalRoot').innerHTML='';document.body.style.overflow=catalogState.detail?'hidden':previousOverflow;if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else if(catalogState.detail)$('catalogDrawerClose')?.focus({preventScroll:true});}
function toast(message){clearTimeout(toastTimer);$('toastRoot').innerHTML=`<div class="toast">${icon('check',16)}${esc(message)}</div>`;toastTimer=setTimeout(()=>$('toastRoot').innerHTML='',3200);}
function showDetail(){openCatalogDetail(state.id,$('detailBtn'));}
function showComparison(){const rows=allRows().filter(r=>state.selected.includes(r.key));if(rows.length<2||rows.length>3)return;modal('模型对比',`<p>在 <strong>${esc(current().name)}</strong> 中比较所选模型的公开成绩。</p><div class="compare-grid" style="grid-template-columns:repeat(${rows.length},minmax(0,1fr))">${rows.map(r=>`<div class="compare-card"><div class="model-avatar" style="color:${r.color}">${r.mark}</div><h4>${esc(r.name)}</h4><div class="small">${esc(r.org)}</div><div class="big-score">${scoreText(r)}</div><div class="small">${esc(current().metric)}</div><div style="margin-top:16px;font-size:10px">${modelType(r)}</div></div>`).join('')}</div><div class="note-box">仅对比当前评测集，不计算跨评测集综合分。</div>`,'',true);}
async function exportLeaderboard(){
 const benchmark=current(),button=$('exportBtn');
 const rows=sortedRows(allRows().filter(row=>!state.selected.length||state.selected.includes(row.key)));
 if(!rows.length){toast('没有可以导出的成绩');return;}
 button.disabled=true;
 try{
  const {default:writeExcelFile}=await import('write-excel-file/browser');
  const headers=['评测集','排名','模型名称','模型厂商','成绩','单位','模型开放类型','评测配置','来源','来源链接'];
  const decimals=benchmark.decimals??2;
  const scoreFormat=decimals?'0.'+'0'.repeat(decimals):'0';
  const data=[
   headers.map(value=>({value,fontWeight:'bold',textColor:'#303852',backgroundColor:'#EDF1FF'})),
   ...rows.map(row=>[
    benchmark.name,row.rank,row.name,row.org,{value:row.score,format:scoreFormat},benchmark.unit,
    modelType(row),row.setting||null,row.source,row.url,
   ]),
  ];
  await writeExcelFile(data,{
   sheet:'模型表现',stickyRowsCount:1,
   columns:[26,9,49,26,12,12,18,28,23,70].map(width=>({width})),
  }).toFile(benchmark.name+'-评测榜单.xlsx');
  if(button.isConnected)toast(`已导出 ${rows.length} 条成绩`);
 }catch{
  if(button.isConnected)toast('导出失败，请重试');
 }finally{button.disabled=false;}
}
function switchModule(module){if(catalogState.detail)closeCatalogDrawer(false);state.module=module;const isBoard=module==='leaderboard';$('leaderboardPage').classList.toggle('hidden',!isBoard);$('catalogPage').classList.toggle('hidden',isBoard);$('catalogTab').classList.toggle('active',!isBoard);$('leaderboardTab').classList.toggle('active',isBoard);$('catalogTab').setAttribute('aria-selected',!isBoard);$('leaderboardTab').setAttribute('aria-selected',isBoard);if(isBoard)revealBenchmarkTab();else{catalogState.detail=null;renderCatalog();}renderTray();}
const catalogMeta={
 gpqa:{year:2023,team:'GPQA 团队',subjects:['物理','化学','生物'],tasks:['科学问答','科学推理'],paradigms:['静态问答'],keywords:['研究生','专业知识','多步推理']},
 chembench:{year:2024,team:'LamaLab',subjects:['化学'],tasks:['科学问答','科学推理'],paradigms:['静态问答'],keywords:['化学知识','分子','安全']},
 terminal:{year:2026,team:'Terminal-Bench-Science 团队',subjects:['跨学科'],tasks:['科研任务','科学计算'],paradigms:['代码或产物验证','智能体任务'],keywords:['终端','仿真','科研工作流']},
 bixbench:{year:2026,team:'Edison Scientific',subjects:['生物'],tasks:['数据分析','科研任务'],paradigms:['代码或产物验证','智能体任务'],keywords:['计算生物学','原始数据','分析流程']},
 phybench:{year:2025,team:'PHYBench 团队',subjects:['物理'],tasks:['科学推理','科学计算'],paradigms:['静态问答'],keywords:['力学','电磁学','多步推导']},
 astro:{year:2025,team:'AstroMMBench 团队',subjects:['天文'],tasks:['科学问答','文献理解'],paradigms:['静态问答'],keywords:['多模态','图像','天体物理']},
 geo:{year:2025,team:'Axis Spatial',subjects:['地理'],tasks:['数据分析','科研任务'],paradigms:['代码或产物验证','智能体任务'],keywords:['GIS','地理空间','制图']},
 sciknow:{year:2024,team:'浙江大学 HICAI',subjects:['物理','化学','生物','跨学科'],tasks:['科学问答','科学推理'],paradigms:['静态问答','模型或人工评分'],keywords:['材料科学','科学知识','多层次']},
 aime:{year:2025,team:'MAA / AIME',subjects:['数学'],tasks:['科学推理','科学计算'],paradigms:['静态问答'],keywords:['数学竞赛','计算','逻辑']},
 mmlu:{year:2024,team:'TIGER-AI-Lab',subjects:['跨学科'],tasks:['科学问答','科学推理'],paradigms:['静态问答'],keywords:['学科知识','多项选择','综合推理']}
};
const extraCatalogResources=[{"id":"math500","name":"MATH-500","subjects":["数学"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答"],"desc":"从 MATH 中选取的 500 道数学题，覆盖代数、几何、数论等方向，用于比较多步骤解题能力。","paper":"https://huggingface.co/datasets/HuggingFaceH4/MATH-500","url":"https://huggingface.co/datasets/HuggingFaceH4/MATH-500","year":2024,"size":"500 题","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"Hugging Face H4","version":"项目公开版","icon":"math","keywords":["MATH-500","数学","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"从 MATH 中选取的 500 道数学题，覆盖代数、几何、数论等方向，用于比较多步骤解题能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"gsm8k","name":"GSM8K","subjects":["数学"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答"],"desc":"以数学应用题考察数量关系理解、算术计算和分步推理，适合作为基础能力评测。","paper":"https://huggingface.co/datasets/openai/gsm8k","url":"https://huggingface.co/datasets/openai/gsm8k","year":2021,"size":"训练与测试划分见数据卡","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"OpenAI","version":"项目公开版","icon":"math","keywords":["GSM8K","数学","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"以数学应用题考察数量关系理解、算术计算和分步推理，适合作为基础能力评测。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"olympiad","name":"OlympiadBench","subjects":["数学","物理"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答","模型或人工评分"],"desc":"收录数学与物理竞赛题，包含文字和图像输入，支持中英文开放式解题与证明任务。","paper":"https://github.com/OpenBMB/OlympiadBench","url":"https://github.com/OpenBMB/OlympiadBench","year":2024,"size":"8,476 题","language":"中文/英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"OpenBMB / OlympiadBench 团队","version":"项目公开版","icon":"math","keywords":["OlympiadBench","数学","物理","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"收录数学与物理竞赛题，包含文字和图像输入，支持中英文开放式解题与证明任务。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"minif2f","name":"miniF2F","subjects":["数学"],"tasks":["科学推理"],"paradigms":["代码或产物验证"],"desc":"将竞赛与课程数学题转为形式化命题，通过 Lean 等证明系统验证自动定理证明结果。","paper":"https://github.com/openai/miniF2F","url":"https://github.com/openai/miniF2F","year":2021,"size":"Lean / Metamath：验证与测试各 244 题","language":"英文","caveat":"不同形式化系统与版本需分别配置环境；自然语言解答不能直接代替形式化证明。","team":"miniF2F 作者团队","version":"项目公开版","icon":"math","keywords":["miniF2F","数学","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"将竞赛与课程数学题转为形式化命题，通过 Lean 等证明系统验证自动定理证明结果。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"omnimath","name":"Omni-MATH","subjects":["数学"],"tasks":["科学推理"],"paradigms":["静态问答","模型或人工评分"],"desc":"覆盖多个子领域和难度层级的奥赛数学题，考察高难度解题与长链条推理能力。","paper":"https://github.com/KbsdJames/Omni-MATH","url":"https://github.com/KbsdJames/Omni-MATH","year":2024,"size":"4,428 题","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"Omni-MATH 团队","version":"项目公开版","icon":"math","keywords":["Omni-MATH","数学","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"覆盖多个子领域和难度层级的奥赛数学题，考察高难度解题与长链条推理能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"ugphysics","name":"UGPhysics","subjects":["物理"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答","模型或人工评分"],"desc":"覆盖本科物理多个核心学科，考察物理概念、规律运用和计算求解能力。","paper":"https://github.com/YangLabHKUST/UGPhysics","url":"https://github.com/YangLabHKUST/UGPhysics","year":2025,"size":"5,520 道不同问题","language":"中文/英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"YangLab / HKUST","version":"项目公开版","icon":"atom","keywords":["UGPhysics","物理","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"覆盖本科物理多个核心学科，考察物理概念、规律运用和计算求解能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"physreason","name":"PhysReason","subjects":["物理"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答","模型或人工评分"],"desc":"将物理知识题与分难度的推理题结合，分别评估最终答案和分步解题过程。","paper":"https://github.com/zhang-xinyu-1204/PhysReason","url":"https://github.com/zhang-xinyu-1204/PhysReason","year":2025,"size":"1,200 题","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"PhysReason 团队","version":"项目公开版","icon":"atom","keywords":["PhysReason","物理","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"将物理知识题与分难度的推理题结合，分别评估最终答案和分步解题过程。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"physalign","name":"PhysAlign","subjects":["物理"],"tasks":["科学推理"],"paradigms":["静态问答"],"desc":"结合物理题目与图示，区分模型是否识别了符号，以及是否把物理量对应到正确对象。","paper":"https://github.com/HCPLab-SYSU/PhysAlign","url":"https://github.com/HCPLab-SYSU/PhysAlign","year":2026,"size":"3,341 个局部探针","language":"英文","caveat":"示例代码中的合成样例不等于正式数据；正式分布通过仓库链接的 Hugging Face 数据集获取。","team":"HCPLab / SYSU","version":"项目公开版","icon":"atom","keywords":["PhysAlign","物理","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"结合物理题目与图示，区分模型是否识别了符号，以及是否把物理量对应到正确对象。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"chemllmbench","name":"ChemLLMBench","subjects":["化学"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答","代码或产物验证"],"desc":"覆盖分子性质、反应预测、逆合成与分子描述等化学任务，提供任务数据和评测代码。","paper":"https://github.com/ChemFoundationModels/ChemLLMBench","url":"https://github.com/ChemFoundationModels/ChemLLMBench","year":2023,"size":"8 类任务","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"ChemFoundationModels","version":"项目公开版","icon":"flask","keywords":["ChemLLMBench","化学","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"覆盖分子性质、反应预测、逆合成与分子描述等化学任务，提供任务数据和评测代码。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"chemeval","name":"ChemEval","subjects":["化学"],"tasks":["科学问答","科学推理"],"paradigms":["静态问答","模型或人工评分"],"desc":"从化学基础知识到专业应用，综合考察文本与多模态化学理解、推理和生成能力。","paper":"https://github.com/USTC-StarTeam/ChemEval","url":"https://github.com/USTC-StarTeam/ChemEval","year":2024,"size":"具体任务划分见项目","language":"英文","caveat":"项目包含文本和多模态任务，应使用对应子集的评分脚本。","team":"USTC-StarTeam","version":"项目公开版","icon":"flask","keywords":["ChemEval","化学","科学问答","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"从化学基础知识到专业应用，综合考察文本与多模态化学理解、推理和生成能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"chemcot","name":"ChemCoTBench","subjects":["化学"],"tasks":["科学推理"],"paradigms":["静态问答","代码或产物验证"],"desc":"通过分子理解、编辑优化和反应预测等任务，评估模型能否逐步完成化学操作与推理。","paper":"https://github.com/IDEA-XL/ChemCoTBench","url":"https://github.com/IDEA-XL/ChemCoTBench","year":2025,"size":"任务划分见项目","language":"英文","caveat":"训练用思维链数据与正式测试集应分开使用。","team":"IDEA-XL","version":"项目公开版","icon":"flask","keywords":["ChemCoTBench","化学","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"通过分子理解、编辑优化和反应预测等任务，评估模型能否逐步完成化学操作与推理。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"astrobench","name":"AstroBench MCQ","subjects":["天文"],"tasks":["科学问答","文献理解"],"paradigms":["静态问答"],"desc":"基于天文与天体物理研究综述构建的选择题，考察专业知识记忆和研究内容理解。","paper":"https://huggingface.co/datasets/AstroMLab/Astrobench_MCQ_v1_Public","url":"https://huggingface.co/datasets/AstroMLab/Astrobench_MCQ_v1_Public","year":2024,"size":"约 3.85k 条公开记录","language":"英文","caveat":"公开版本不包含答案键；需按照数据卡的官方流程获取评分，不能直接完成本地自动判分。","team":"AstroMLab","version":"MCQ v1 Public","icon":"orbit","keywords":["AstroBench MCQ","天文","科学问答","文献理解"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"基于天文与天体物理研究综述构建的选择题，考察专业知识记忆和研究内容理解。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"astrovis","name":"AstroVisBench","subjects":["天文"],"tasks":["科学计算","数据分析","科研任务"],"paradigms":["代码或产物验证","模型或人工评分"],"desc":"让模型编写代码处理天文数据并生成科学图表，分别检查计算结果与可视化表现。","paper":"https://github.com/NSF-Simons-CosmicAI-Institute/AstroVisBench","url":"https://github.com/NSF-Simons-CosmicAI-Institute/AstroVisBench","year":2025,"size":"计算与可视化任务","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"NSF-Simons CosmicAI Institute","version":"项目公开版","icon":"orbit","keywords":["AstroVisBench","天文","科学计算","数据分析","科研任务"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"让模型编写代码处理天文数据并生成科学图表，分别检查计算结果与可视化表现。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"astroqa","name":"Astro-QA","subjects":["天文"],"tasks":["科学问答","科学推理"],"paradigms":["静态问答","模型或人工评分"],"desc":"覆盖天体物理、天体力学和天文观测方法等主题，比较模型回答不同类型天文问题的能力。","paper":"https://github.com/ACMISLab/Astro-QA","url":"https://github.com/ACMISLab/Astro-QA","year":2024,"size":"2,709 题","language":"中文/英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"ACMISLab","version":"项目公开版","icon":"orbit","keywords":["Astro-QA","天文","科学问答","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"覆盖天体物理、天体力学和天文观测方法等主题，比较模型回答不同类型天文问题的能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"usaaao","name":"USAAAO QA","subjects":["天文","物理"],"tasks":["科学推理","科学计算"],"paradigms":["静态问答"],"desc":"以天文奥林匹克题目和图像材料，考察天文知识运用与定量解题能力。","paper":"https://huggingface.co/datasets/AstroMLab/USAAAO_QA","url":"https://huggingface.co/datasets/AstroMLab/USAAAO_QA","year":2026,"size":"见官方数据卡","language":"英文","caveat":"Hugging Face 仓库设有访问条件，需自行登录并接受项目条件后获取数据。","team":"AstroMLab","version":"项目公开版","icon":"orbit","keywords":["USAAAO QA","天文","物理","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"以天文奥林匹克题目和图像材料，考察天文知识运用与定量解题能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"部分开放","checkedAt":"2026-11-04"},{"id":"geobenchllm","name":"GeoBenchLLM","subjects":["地理"],"tasks":["科学问答","科学推理"],"paradigms":["静态问答"],"desc":"汇集地理相关子数据集，比较模型对地理知识、位置关系和空间任务的理解与推理能力。","paper":"https://github.com/Rfr2003/GeoBenchLLM","url":"https://github.com/Rfr2003/GeoBenchLLM","year":null,"size":"17 个子数据集、8 类任务","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"GeoBenchLLM 团队","version":"项目公开版","icon":"globe","keywords":["GeoBenchLLM","地理","科学问答","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"汇集地理相关子数据集，比较模型对地理知识、位置关系和空间任务的理解与推理能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"geovlm","name":"GEOBench-VLM","subjects":["地理"],"tasks":["科学问答","数据分析"],"paradigms":["静态问答","代码或产物验证"],"desc":"面向遥感与地理空间图像，覆盖场景理解、目标计数定位及时间变化等视觉任务。","paper":"https://github.com/Tarekbouamer/GEOBench-VLM","url":"https://github.com/Tarekbouamer/GEOBench-VLM","year":2024,"size":"31 类细分任务","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"GEOBench-VLM 团队","version":"项目公开版","icon":"globe","keywords":["GEOBench-VLM","地理","科学问答","数据分析"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"面向遥感与地理空间图像，覆盖场景理解、目标计数定位及时间变化等视觉任务。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"geoexpert","name":"GeoExpertQueries","subjects":["地理"],"tasks":["数据分析","科研任务"],"paradigms":["智能体任务","代码或产物验证","模型或人工评分"],"desc":"由地理专家编写并交叉核对的 GIS 分析工作流，考察多工具地理空间分析能力。","paper":"https://github.com/google-research/geospatial-reasoning-benchmarks","url":"https://github.com/google-research/geospatial-reasoning-benchmarks","year":2026,"size":"公开开发集 25 项任务","language":"英文","caveat":"公开仓库提供开发划分及工作流；保留测试集不等同于已公开下载。","team":"Google Research","version":"Development split","icon":"globe","keywords":["GeoExpertQueries","地理","数据分析","科研任务"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"由地理专家编写并交叉核对的 GIS 分析工作流，考察多工具地理空间分析能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"geoguess","name":"GeoBench · 图像定位","subjects":["地理"],"tasks":["科学推理"],"paradigms":["静态问答"],"desc":"根据街景等图像线索预测国家与经纬度，衡量模型的视觉地理定位和空间推断能力。","paper":"https://github.com/ccmdi/geobench","url":"https://github.com/ccmdi/geobench","year":2025,"size":"按所选地图构建测试样本","language":"英文","caveat":"这是地理图像定位评测，区别于同名的几何、遥感或搜索优化项目。","team":"CCMDI","version":"项目公开版","icon":"globe","keywords":["GeoBench · 图像定位","地理","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"根据街景等图像线索预测国家与经纬度，衡量模型的视觉地理定位和空间推断能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"labbench","name":"LAB-Bench","subjects":["生物"],"tasks":["科学问答","文献理解","科学推理"],"paradigms":["静态问答"],"desc":"覆盖生物研究中的文献、图表、实验流程和序列相关问题，侧重实际研究技能。","paper":"https://huggingface.co/datasets/futurehouse/lab-bench","url":"https://huggingface.co/datasets/futurehouse/lab-bench","year":2024,"size":"公开子集见数据卡","language":"英文","caveat":"公开子集与完整评测范围需区分；按原数据卡许可使用，不能作为训练材料。","team":"FutureHouse","version":"项目公开版","icon":"dna","keywords":["LAB-Bench","生物","科学问答","文献理解","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"覆盖生物研究中的文献、图表、实验流程和序列相关问题，侧重实际研究技能。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"bixbench1","name":"BixBench","subjects":["生物"],"tasks":["数据分析","科研任务"],"paradigms":["智能体任务","代码或产物验证"],"desc":"让智能体探索真实生物数据、执行多步分析并解释结果，提供容器环境与评测工具。","paper":"https://github.com/Future-House/BixBench","url":"https://github.com/Future-House/BixBench","year":2025,"size":"v1.5 记录见原项目","language":"英文","caveat":"BixBench 与 BixBench3 为不同版本与任务范围，应分别配置和报告成绩。","team":"FutureHouse","version":"v1.5","icon":"dna","keywords":["BixBench","生物","数据分析","科研任务"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"让智能体探索真实生物数据、执行多步分析并解释结果，提供容器环境与评测工具。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"biopro","name":"BioProBench","subjects":["生物"],"tasks":["科学问答","科学推理","文献理解"],"paradigms":["静态问答","模型或人工评分"],"desc":"围绕生物实验流程，评估问答、步骤排序、错误修正、流程生成和程序性推理。","paper":"https://github.com/YuyangSunshine/bioprobench","url":"https://github.com/YuyangSunshine/bioprobench","year":2025,"size":"5 类核心任务","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"BioProBench 团队","version":"项目公开版","icon":"dna","keywords":["BioProBench","生物","科学问答","科学推理","文献理解"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"围绕生物实验流程，评估问答、步骤排序、错误修正、流程生成和程序性推理。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"geneturing","name":"GeneTuring","subjects":["生物"],"tasks":["科学问答","科学推理"],"paradigms":["静态问答","检索评测"],"desc":"围绕基因名称、位置、关联和序列等问题，测试模型的基因组学知识及工具辅助能力。","paper":"https://github.com/Winnie09/GeneTuring","url":"https://github.com/Winnie09/GeneTuring","year":2023,"size":"基因组学问答模块","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"GeneTuring 团队","version":"项目公开版","icon":"dna","keywords":["GeneTuring","生物","科学问答","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"围绕基因名称、位置、关联和序列等问题，测试模型的基因组学知识及工具辅助能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"pubmedqa","name":"PubMedQA","subjects":["生物"],"tasks":["文献理解","科学问答"],"paradigms":["静态问答"],"desc":"阅读生物医学论文摘要中的证据，对研究问题给出 yes、no 或 maybe 判断。","paper":"https://github.com/pubmedqa/pubmedqa","url":"https://github.com/pubmedqa/pubmedqa","year":2019,"size":"PQA-L 等划分见项目","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"PubMedQA 团队","version":"项目公开版","icon":"dna","keywords":["PubMedQA","生物","文献理解","科学问答"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"阅读生物医学论文摘要中的证据，对研究问题给出 yes、no 或 maybe 判断。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"scibench","name":"SciBench","subjects":["数学","物理","化学","跨学科"],"tasks":["科学计算","科学推理"],"paradigms":["静态问答"],"desc":"以大学教材中的科学问题，考察数学、物理和化学领域的定量推理与复杂求解能力。","paper":"https://github.com/mandyyyyii/scibench","url":"https://github.com/mandyyyyii/scibench","year":2023,"size":"各教材与子集见项目","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"SciBench 团队","version":"项目公开版","icon":"math","keywords":["SciBench","数学","物理","化学","跨学科","科学计算","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"以大学教材中的科学问题，考察数学、物理和化学领域的定量推理与复杂求解能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"scieval","name":"SciEval","subjects":["物理","化学","生物","跨学科"],"tasks":["科学问答","科学推理","科学计算"],"paradigms":["静态问答"],"desc":"从科学基础知识、知识应用、计算和研究能力多个层次，评价模型在科学内容上的表现。","paper":"https://github.com/OpenDFM/SciEval","url":"https://github.com/OpenDFM/SciEval","year":2023,"size":"约 18,000 道客观题及少量主观题","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"OpenDFM","version":"项目公开版","icon":"atom","keywords":["SciEval","物理","化学","生物","跨学科","科学问答","科学推理","科学计算"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"从科学基础知识、知识应用、计算和研究能力多个层次，评价模型在科学内容上的表现。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"sciassess","name":"SciAssess","subjects":["化学","生物","跨学科"],"tasks":["文献理解","科学推理"],"paradigms":["静态问答","模型或人工评分"],"desc":"针对科学文献中的信息提取、图表理解和分析推理，覆盖化学、生物与材料等领域。","paper":"https://github.com/sci-assess/SciAssess","url":"https://github.com/sci-assess/SciAssess","year":2024,"size":"任务划分见项目","language":"英文","caveat":"原始论文 PDF 不随仓库分发，需根据 DOI 自行合法获取并按文档组织文件。","team":"SciAssess 团队","version":"项目公开版","icon":"flask","keywords":["SciAssess","化学","生物","跨学科","文献理解","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"针对科学文献中的信息提取、图表理解和分析推理，覆盖化学、生物与材料等领域。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"scicode","name":"SciCode","subjects":["数学","物理","化学","生物","跨学科"],"tasks":["科学计算","科研任务"],"paradigms":["代码或产物验证"],"desc":"将真实科学问题拆解为可编程任务，通过测试用例检验模型生成的计算与仿真代码。","paper":"https://github.com/scicode-bench/SciCode","url":"https://github.com/scicode-bench/SciCode","year":2024,"size":"80 个主问题、338 个子问题","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"SciCode 团队","version":"项目公开版","icon":"math","keywords":["SciCode","数学","物理","化学","生物","跨学科","科学计算","科研任务"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"将真实科学问题拆解为可编程任务，通过测试用例检验模型生成的计算与仿真代码。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"sab","name":"ScienceAgentBench","subjects":["化学","生物","地理","跨学科"],"tasks":["科研任务","数据分析"],"paradigms":["智能体任务","代码或产物验证"],"desc":"基于论文中的真实分析任务，要求智能体读取数据、编写程序并生成可验证的研究结果。","paper":"https://github.com/OSU-NLP-Group/ScienceAgentBench","url":"https://github.com/OSU-NLP-Group/ScienceAgentBench","year":2024,"size":"原版 102 项任务；最新划分见项目","language":"英文","caveat":"项目已发布 verified 划分；正式使用时请配套下载该划分对应的评测材料。","team":"OSU-NLP-Group","version":"Verified split","icon":"flask","keywords":["ScienceAgentBench","化学","生物","地理","跨学科","科研任务","数据分析"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"基于论文中的真实分析任务，要求智能体读取数据、编写程序并生成可验证的研究结果。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"},{"id":"scicueval","name":"SciCUEval","subjects":["物理","化学","生物","跨学科"],"tasks":["文献理解","科学推理"],"paradigms":["静态问答"],"desc":"通过文本、表格与知识图谱，评价科学上下文中的信息识别、信息整合和证据推理能力。","paper":"https://github.com/HICAI-ZJU/SciCUEval","url":"https://github.com/HICAI-ZJU/SciCUEval","year":2025,"size":"10 个子数据集","language":"英文","caveat":"请使用原项目指定的数据划分、评分代码和环境，按原始许可获取并使用。","team":"浙江大学 HICAI","version":"项目公开版","icon":"atom","keywords":["SciCUEval","物理","化学","生物","跨学科","文献理解","科学推理"],"metric":"原项目任务指标","unit":"见评分文档","direction":"按原项目定义比较","method":"通过文本、表格与知识图谱，评价科学上下文中的信息识别、信息整合和证据推理能力。具体输入、输出格式和评分方式参见原项目文档。","permission":"仅展示元信息","checkedAt":"2026-11-04"}];
extraCatalogResources.push({"id": "platform-physics-demo", "name": "基础物理计算评测集（模拟上传）", "subjects": ["物理"], "tasks": ["科学推理", "科学计算"], "paradigms": ["静态问答"], "desc": "面向基础力学计算，检验模型提取题目条件、运用物理公式并按规定格式输出结果的能力。", "paper": assetBase + "evaluation/sample-upload/README.md", "url": assetBase + "evaluation/sample-upload/README.md", "year": 2026, "size": "3 道演示题 · test 划分", "language": "中文", "team": "科学计算实验室（虚构）", "authors": "林知、陈序（虚构）", "version": "v1.0.0", "updatedAt": "2026年11月05日", "icon": "atom", "keywords": ["基础力学", "数值计算", "结构化输出"], "metric": "Accuracy", "unit": "%", "direction": "越高越好", "method": "按数值误差与单位匹配计算正确率。", "permission": "公开共享", "checkedAt": "2026-11-05", "origin": "platform", "status": "approved", "caveat": "模拟上传资源，仅用于页面与流程演示。"});
const catalogDefaults = () => ({query:'',subjects:[],tasks:[],paradigms:[],permissions:[],taskOthers:[],paradigmOthers:[],yearFrom:'',yearTo:'',sort:'year',page:1,detail:null});
let catalogState=catalogDefaults();
try { const saved=JSON.parse(sessionStorage.getItem('science-evaluation-catalog-state')||'null'); if(saved && typeof saved==='object') { if(typeof saved.query==='string')catalogState.query=saved.query;
 for(const key of ['yearFrom','yearTo']){
  const year=saved[key]??saved.year;
  if(typeof year==='string'&&/^\d{1,4}$/.test(year)&&Number(year)>0)catalogState[key]=year;
 } for(const key of ['subjects','tasks','paradigms','permissions','taskOthers','paradigmOthers'])if(Array.isArray(saved[key]))catalogState[key]=saved[key].filter(x=>typeof x==='string'); if(['year','name','views','favorites'].includes(saved.sort))catalogState.sort=saved.sort;if(Number.isInteger(saved.page)&&saved.page>0)catalogState.page=saved.page; }}catch{}
let catalogPlan=[];try{const plan=JSON.parse(localStorage.getItem('science-demo-plan')||'[]');if(Array.isArray(plan))catalogPlan=[...new Set(plan)].filter(id=>[...benchmarks,...extraCatalogResources,...readApprovedEvaluationUploads()].some(b=>b.id===id));}catch{}
const featuredCatalog=['math500','ugphysics','chembench','astrovis','geobenchllm','labbench','scicode','scibench','sciassess'];
const catalogActivity = {
 views: { key: 'science-evaluation-views', fallback: {} },
 downloads: { key: 'science-evaluation-downloads', fallback: {} },
};
const catalogFavoritesKey='science-evaluation-favorites';
let temporaryFavorites;
function readCatalogFavorites(){
 if(temporaryFavorites)return new Set(temporaryFavorites);
 try{
  const saved=JSON.parse(localStorage.getItem(catalogFavoritesKey)||'[]');
  return new Set(Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[]);
 }catch{return new Set();}
}
function updateActivityDisplay(type,id,total){
 evaluationRoot.querySelectorAll(`[data-resource-id="${CSS.escape(id)}"] [data-activity="${type}"]`).forEach(value=>{
  const count=Number(value.dataset.baseCount)+total;
  value.textContent=count.toLocaleString('zh-CN');
  const card=value.closest('.catalog-card');
  if(card&&type==='views')card.dataset.viewCount=String(count);
  if(card&&type==='favorites')card.dataset.favoriteCount=String(count);
 });
}
function syncCatalogFavorite(id,saved){
 updateActivityDisplay('favorites',id,Number(saved));
 if($('catalogDrawerBody')?.dataset.resourceId!==id)return;
 const button=$('catalogDetailFavorite');
 button.setAttribute('aria-pressed',String(saved));
 button.classList.toggle('is-active',saved);
 button.querySelector('span').textContent=saved?'已收藏':'收藏';
}
function toggleCatalogFavorite(id){
 const toggle=()=>{
  const favorites=readCatalogFavorites(),saved=!favorites.has(id);
  if(saved)favorites.add(id);
  else favorites.delete(id);
  try{
   localStorage.setItem(catalogFavoritesKey,JSON.stringify([...favorites]));
   temporaryFavorites=undefined;
  }catch{temporaryFavorites=favorites;}
  syncCatalogFavorite(id,saved);
  if($('toastRoot'))toast(saved?'已收藏评测集':'已取消收藏');
 };
 if(navigator.locks)void navigator.locks.request(catalogFavoritesKey,toggle).catch(toggle);
 else toggle();
}
function syncCatalogFavoritesFromStorage(event){
 if(event.key!==catalogFavoritesKey&&event.key!==null)return;
 const favorites=readCatalogFavorites();
 evaluationRoot.querySelectorAll('[data-resource-id]').forEach(({dataset})=>{
  if(dataset.resourceId)syncCatalogFavorite(dataset.resourceId,favorites.has(dataset.resourceId));
 });
}
window.addEventListener('storage',syncCatalogFavoritesFromStorage);

function readCatalogActivity(type){
 const {key,fallback}=catalogActivity[type];
 try{return {...JSON.parse(localStorage.getItem(key)||'{}'),...fallback};}catch{return {...fallback};}
}
function catalogActivityCount(counters,id){
 const count=Number(counters[id]);
 return Number.isSafeInteger(count)&&count>0?count:0;
}
function recordCatalogActivity(type,id){
 const {key,fallback}=catalogActivity[type];
 const increment=()=>{
  const counters=readCatalogActivity(type);
  const total=catalogActivityCount(counters,id)+1;
  try{
   localStorage.setItem(key,JSON.stringify({...counters,[id]:total}));
   delete fallback[id];
  }catch{fallback[id]=total;}
  updateActivityDisplay(type,id,total);
 };
 if(navigator.locks)void navigator.locks.request(key,increment).catch(increment);
 else increment();
}
const catalogItems=()=>{
 const views=readCatalogActivity('views'),downloads=readCatalogActivity('downloads');
 const favorites=readCatalogFavorites();
 const items=[...benchmarks.map(b=>({...b,...catalogMeta[b.id],permission:'仅展示元信息',language:'英文',checkedAt:'2026-11-04',hasLeaderboard:true})),...extraCatalogResources.filter(b=>b.origin!=='platform'||b.status==='approved'),...readApprovedEvaluationUploads()];
 return [...new Map(items.map(b=>[b.id,b])).values()].map((raw,i)=>{
  const b=normalizeEvaluationResource(raw);
  const favorite=favorites.has(b.id);
  return {...b,favorite,baseFavorites:b.favoriteCount,baseViews:b.viewCount,baseDownloads:b.downloadCount,favoriteCount:b.favoriteCount+Number(favorite),viewCount:b.viewCount+catalogActivityCount(views,b.id),downloadCount:b.downloadCount+catalogActivityCount(downloads,b.id),order:featuredCatalog.includes(b.id)?featuredCatalog.indexOf(b.id):featuredCatalog.length+i};
 });
};
function catalogMatches(){
 const q=catalogState.query.toLocaleLowerCase();
 const rows=catalogItems().filter(b=>(!q||[b.name,b.desc,b.team,b.paper,b.paperTitle||'',b.method||'',...b.keywords,...b.tasks,...b.paradigms,...b.taskOthers,...b.paradigmOthers].join(' ').toLocaleLowerCase().includes(q))
  &&['subjects','tasks','paradigms'].every(key=>!catalogState[key].length||catalogState[key].some(t=>b[key].includes(t)))
  &&['taskOthers','paradigmOthers'].every(key=>!catalogState[key].length||catalogState[key].some(t=>b[key].includes(t)))
  &&(!catalogState.permissions.length||catalogState.permissions.includes(b.permission))&&(!catalogState.yearFrom||b.year>=Number(catalogState.yearFrom))
  &&(!catalogState.yearTo||(b.year>0&&b.year<=Number(catalogState.yearTo))));
 rows.sort((a,b)=>catalogState.sort==='name'?a.name.localeCompare(b.name,'en',{numeric:true}):catalogState.sort==='views'?b.viewCount-a.viewCount||a.order-b.order:catalogState.sort==='favorites'?b.favoriteCount-a.favoriteCount||a.order-b.order:(b.year||0)-(a.year||0)||a.order-b.order);
 return rows;
}
function catalogHighlight(text){text=String(text||'');const q=catalogState.query;if(!q)return esc(text);let start=0,out='',at=0,lower=text.toLocaleLowerCase(),needle=q.toLocaleLowerCase();while((at=lower.indexOf(needle,start))!==-1){out+=esc(text.slice(start,at))+'<mark>'+esc(text.slice(at,at+q.length))+'</mark>';start=at+q.length;}return out+esc(text.slice(start));}
function catalogExcerpt(text){const q=catalogState.query.toLocaleLowerCase(),at=q?text.toLocaleLowerCase().indexOf(q):-1;return catalogHighlight(at>40?'…'+text.slice(Math.max(0,at-20)):text);}
const catalogYearBounds=[['yearFrom','起始年份','起始年'],['yearTo','结束年份','结束年']];
const yearTrigger=key=>$('catalog-'+key);
const yearOptions=key=>$('catalog-'+key+'-options');

function closeCatalogYears(){
 for(const [key] of catalogYearBounds){
  yearOptions(key).classList.add('hidden');
  yearTrigger(key).setAttribute('aria-expanded','false');
 }
}
function syncCatalogYears(){
 for(const [key,label,placeholder] of catalogYearBounds){
  const year=catalogState[key];
  yearTrigger(key).querySelector('span').textContent=year||placeholder;
  yearTrigger(key).setAttribute('aria-label',year?`${label}：${year} 年`:label);
  yearOptions(key).querySelectorAll('[data-catalog-year]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.catalogYear===year)));
 }
}
function initCatalogYears(){
 const max=Math.max(new Date().getFullYear(),...catalogItems().map(b=>b.year),Number(catalogState.yearFrom),Number(catalogState.yearTo));
 for(const [key] of catalogYearBounds){
  const trigger=yearTrigger(key),list=yearOptions(key);
  let min=max+1;
  function addYears(count){
   const next=Math.max(1,min-count);
   for(let year=min-1;year>=next;year--)list.insertAdjacentHTML('beforeend',`<button type="button" role="option" tabindex="-1" data-catalog-year="${year}">${year} 年</button>`);
   min=next;
  }
  addYears(25);
  function open(){
   closeCatalogYears();
   list.classList.remove('hidden');
   trigger.setAttribute('aria-expanded','true');
   const year=Number(catalogState[key]);
   if(year&&year<min)addYears(min-year);
   syncCatalogYears();
   const option=list.querySelector('[aria-selected="true"]')||list.firstElementChild;
   option.focus({preventScroll:true});
   list.scrollTop=option.offsetTop-Math.max(0,(list.clientHeight-option.offsetHeight)/2);
  }
  trigger.onclick=()=>{
   if(list.classList.contains('hidden'))open();
   else closeCatalogYears();
  };
  trigger.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();open();}};
  list.onscroll=()=>{
   if(!list.classList.contains('hidden')&&list.scrollTop+list.clientHeight>=list.scrollHeight-40&&min>1){
    addYears(20);
    syncCatalogYears();
   }
  };
  list.onclick=e=>{
   const option=e.target.closest('[data-catalog-year]');
   if(!option)return;
   catalogState[key]=option.dataset.catalogYear;
   if(catalogState.yearFrom&&catalogState.yearTo&&Number(catalogState.yearFrom)>Number(catalogState.yearTo)){
    [catalogState.yearFrom,catalogState.yearTo]=[catalogState.yearTo,catalogState.yearFrom];
   }
   catalogState.page=1;
   closeCatalogYears();
   renderCatalog();
   trigger.focus({preventScroll:true});
  };
  list.onkeydown=e=>{
   const option=e.target.closest('[data-catalog-year]');
   if(!option||!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   e.preventDefault();
   if(e.key==='ArrowDown'&&!option.nextElementSibling&&min>1){addYears(20);syncCatalogYears();}
   const target={ArrowDown:option.nextElementSibling,ArrowUp:option.previousElementSibling,Home:list.firstElementChild,End:list.lastElementChild}[e.key];
   target?.focus();
  };
 }
}
const handleYearOutside=e=>{if(!e.composedPath().includes($('catalogYearRange')))closeCatalogYears();};
document.addEventListener('pointerdown',handleYearOutside);

function initCatalog(){
 const groups=[['subjects','学科领域',EVALUATION_SUBJECTS],['tasks','任务类型',EVALUATION_TASKS],['paradigms','评测范式',EVALUATION_PARADIGMS],['permissions','权限范围',EVALUATION_PERMISSIONS]];
 const custom=(key,label)=>{
  const values=[...new Set(catalogItems().filter(b=>b.origin==='platform').flatMap(b=>b[key]))].sort();
  return `<details class="other-filter hidden" id="${key}Filter"><summary>选择${label}</summary><div>${values.length?values.map(v=>`<label class="catalog-check"><input type="checkbox" data-catalog-filter="${key}" value="${esc(v)}" aria-label="${label}：${esc(v)}">${esc(v)}</label>`).join(''):`<p>暂无${label}</p>`}</div></details>`;
 };
 $('catalogFilters').innerHTML=groups.map(([key,label,values])=>`<fieldset class="filter-group"><legend>${label}</legend><label class="catalog-check"><input type="checkbox" data-filter-all="${key}" aria-label="${label}：全部" checked>全部</label>${values.map(v=>`<label class="catalog-check"><input type="checkbox" data-catalog-filter="${key}" value="${esc(v)}" aria-label="${label}：${esc(v)}">${esc(v)}</label>`).join('')}${key==='tasks'?custom('taskOthers','其他任务类型'):key==='paradigms'?custom('paradigmOthers','其他评测范式'):''}</fieldset>`).join('')+
 `<fieldset class="filter-group catalog-year-filter"><legend>发布年份</legend><div class="catalog-year-range" id="catalogYearRange">${catalogYearBounds.map(([key,label,placeholder])=>`<div class="catalog-year-picker"><button type="button" class="catalog-year-trigger" id="catalog-${key}" aria-label="${label}" aria-controls="catalog-${key}-options" aria-haspopup="listbox" aria-expanded="false"><span>${placeholder}</span>${icon('chevron-down',12)}</button><div class="catalog-year-options hidden" id="catalog-${key}-options" role="listbox" aria-label="${label}"></div></div>`).join('<span class="catalog-year-dash" aria-hidden="true">–</span>')}</div></fieldset>`;
 evaluationRoot.querySelectorAll('[data-catalog-filter]').forEach(el=>el.onchange=()=>{
  const key=el.dataset.catalogFilter;catalogState[key]=el.checked?[...new Set([...catalogState[key],el.value])]:catalogState[key].filter(v=>v!==el.value);
  if(key==='tasks'&&!catalogState.tasks.includes('其他'))catalogState.taskOthers=[];
  if(key==='paradigms'&&!catalogState.paradigms.includes('其他'))catalogState.paradigmOthers=[];
  catalogState.page=1;renderCatalog();
 });
 evaluationRoot.querySelectorAll('[data-filter-all]').forEach(el=>el.onchange=()=>{const key=el.dataset.filterAll;catalogState[key]=[];if(key==='tasks')catalogState.taskOthers=[];if(key==='paradigms')catalogState.paradigmOthers=[];catalogState.page=1;renderCatalog();});
 initCatalogYears();
 $('catalogSort').onchange=e=>{catalogState.sort=e.target.value;catalogState.page=1;renderCatalog();};
 $('catalogSearchForm').onsubmit=e=>{e.preventDefault();catalogState.query=$('catalogSearch').value.trim();$('catalogSearch').value=catalogState.query;catalogState.page=1;switchModule('catalog');};
 $('catalogClearAll').onclick=clearCatalogFilters;$('catalogFilterReset').onclick=clearCatalogFilters;
 $('catalogSearch').value=catalogState.query;
}
function clearCatalogFilters(){catalogState=catalogDefaults();$('catalogSearch').value='';renderCatalog();}
function removeCatalogFilter(key,value){
 if(key==='query'){catalogState.query='';$('catalogSearch').value='';}
 else if(key==='year'){catalogState.yearFrom='';catalogState.yearTo='';}else catalogState[key]=catalogState[key].filter(x=>x!==value);
 if(!catalogState.tasks.includes('其他'))catalogState.taskOthers=[];
 if(!catalogState.paradigms.includes('其他'))catalogState.paradigmOthers=[];
 catalogState.page=1;renderCatalog();
}
let drawerOpener;
function openCatalogDetail(id,opener=evaluationRoot.activeElement){
 if(!catalogState.detail)drawerOpener=opener;
 catalogState.detail=id;
 closeCatalogYears();
 renderCatalogDetail();
 if($('catalogDrawerBody')?.dataset.resourceId===id)recordCatalogActivity('views',id);
}
function renderCatalog(){
 if(catalogState.detail){renderCatalogDetail();return;}
 const pageSize=12,rows=catalogMatches(),totalPages=Math.max(1,Math.ceil(rows.length/pageSize));catalogState.page=Math.max(1,Math.min(catalogState.page,totalPages));
 const paged=rows.slice((catalogState.page-1)*pageSize,catalogState.page*pageSize);
 try{sessionStorage.setItem('science-evaluation-catalog-state',JSON.stringify({...catalogState,detail:null}))}catch{}
 $('catalogTotal').textContent=`共 ${rows.length} 个评测集`;
 syncCatalogYears();$('catalogSort').value=catalogState.sort;
 evaluationRoot.querySelectorAll('[data-catalog-filter]').forEach(el=>el.checked=catalogState[el.dataset.catalogFilter].includes(el.value));
 evaluationRoot.querySelectorAll('[data-filter-all]').forEach(el=>el.checked=!catalogState[el.dataset.filterAll].length);
 $('taskOthersFilter').classList.toggle('hidden',!catalogState.tasks.includes('其他'));$('paradigmOthersFilter').classList.toggle('hidden',!catalogState.paradigms.includes('其他'));
 const active=[];if(catalogState.query)active.push(['query',catalogState.query,'搜索：'+catalogState.query]);
 const labels={subjects:'学科领域',tasks:'任务类型',paradigms:'评测范式',permissions:'权限范围',taskOthers:'其他任务',paradigmOthers:'其他范式'};
 for(const key of Object.keys(labels))catalogState[key].forEach(v=>active.push([key,v,labels[key]+'：'+v]));const {yearFrom,yearTo}=catalogState;
 if(yearFrom||yearTo){
  const range=yearFrom&&yearTo?yearFrom===yearTo?`${yearFrom} 年`:`${yearFrom}–${yearTo} 年`:yearFrom?`${yearFrom} 年及以后`:`${yearTo} 年及以前`;
  active.push(['year','','发布年份：'+range]);
 }
 $('catalogActiveRow').classList.toggle('hidden',!active.length);
 $('catalogActiveTags').innerHTML=active.map(([key,v,label],i)=>`<button class="applied-tag" data-remove-filter="${i}" aria-label="移除筛选：${esc(label)}">${esc(label)} ${icon('close',12)}</button>`).join('');
 evaluationRoot.querySelectorAll('[data-remove-filter]').forEach(el=>el.onclick=()=>{const[key,v]=active[Number(el.dataset.removeFilter)];removeCatalogFilter(key,v);});
 $('catalog').innerHTML=paged.map(b=>{const official=b.origin==='platform'?'':safeResourceUrl(officialSource(b));return `<article class="catalog-card ${catalogPlan.includes(b.id)?'in-plan':''}" data-resource-id="${esc(b.id)}" data-view-count="${b.viewCount}" data-favorite-count="${b.favoriteCount}">
  <div class="card-top"><div class="benchmark-icon">${icon(b.icon,21)}</div><h3 title="${esc(b.name)}">${catalogHighlight(b.name)}</h3><span class="catalog-permission permission-${b.permission==='公开'?'public':b.permission==='受限'?'restricted':'private'}" title="${esc(b.permissionNote||b.permission)}">${b.permission}</span></div>
  <div class="catalog-tags">${b.subjects.map(t=>`<span class="catalog-tag tag-subject" aria-label="学科领域：${esc(t)}">${esc(t)}</span>`).join('')}${[...new Set([...b.tasks.filter(t=>t!=='其他'||!b.taskOthers.length),...b.taskOthers])].map(t=>`<span class="catalog-tag tag-task" aria-label="任务类型：${esc(t)}" title="${esc(t)}">${esc(t)}</span>`).join('')}${[...new Set([...b.paradigms.filter(t=>t!=='其他'||!b.paradigmOthers.length),...b.paradigmOthers])].map(t=>`<span class="catalog-tag tag-paradigm" aria-label="评测范式：${esc(t)}" title="${esc(t)}">${esc(t)}</span>`).join('')}</div>
  <p class="catalog-summary" title="${esc(b.desc)}">${catalogExcerpt(b.desc)}</p>${catalogState.query&&b.team.toLocaleLowerCase().includes(catalogState.query.toLocaleLowerCase())?`<div class="catalog-team" title="${esc(b.team)}">提供团队：${catalogHighlight(b.team)}</div>`:''}
  <div class="catalog-card-meta"><time class="catalog-updated" ${b.updatedAt?`datetime="${b.updatedAt}"`:''}>${b.updatedAt?b.updatedAt+' 更新':'更新时间暂未提供'}</time>${official?`<a class="catalog-resource-link" href="${esc(official)}" target="_blank" rel="noopener noreferrer">官方链接 ${icon('external',11)}</a>`:''}</div>
  ${evaluationActivity(b,'catalog-card-activity')}
  <div class="catalog-card-actions"><button type="button" class="btn" data-catalog-detail="${esc(b.id)}">${icon('book',13)}查看详情</button><button class="btn ${catalogPlan.includes(b.id)?'is-saved':''}" data-plan-toggle="${esc(b.id)}" aria-pressed="${catalogPlan.includes(b.id)}" aria-label="${catalogPlan.includes(b.id)?'移出清单':'加入清单'}：${esc(b.name)}">${icon(catalogPlan.includes(b.id)?'check':'plus',13)}${catalogPlan.includes(b.id)?'已加入清单':'加入清单'}</button></div></article>`;}).join('')||`<div class="catalog-empty" role="status">${icon('search',40)}<h3>暂无匹配的评测集</h3><p>试试其他搜索词，或调整筛选条件。</p><button class="btn" id="catalogEmptyReset">重置</button></div>`;
 if($('catalogEmptyReset'))$('catalogEmptyReset').onclick=clearCatalogFilters;
 evaluationRoot.querySelectorAll('[data-catalog-detail]').forEach(el=>el.onclick=()=>openCatalogDetail(el.dataset.catalogDetail,el));bindCatalogPlanButtons();
 const first=Math.max(1,catalogState.page-5),last=Math.min(totalPages,catalogState.page+5);
 $('catalogPagination').innerHTML=rows.length?`<button id="catalogPrev" aria-label="评测集上一页" ${catalogState.page===1?'disabled':''}>${icon('chevron-left',14)}</button>${Array.from({length:last-first+1},(_,i)=>first+i).map(n=>`<button data-catalog-page="${n}" ${n===catalogState.page?'aria-current="page"':''} class="${n===catalogState.page?'active':''}">${n}</button>`).join('')}<button id="catalogNext" aria-label="评测集下一页" ${catalogState.page===totalPages?'disabled':''}>${icon('chevron-right',14)}</button>`:'';
 evaluationRoot.querySelectorAll('[data-catalog-page]').forEach(el=>el.onclick=()=>{catalogState.page=Number(el.dataset.catalogPage);renderCatalog();});if($('catalogPrev'))$('catalogPrev').onclick=()=>{catalogState.page--;renderCatalog();};if($('catalogNext'))$('catalogNext').onclick=()=>{catalogState.page++;renderCatalog();};renderCatalogPlan();
}

function persistCatalogPlan(){try{localStorage.setItem('science-demo-plan',JSON.stringify(catalogPlan));}catch{toast('当前浏览器无法保存清单，仍可下载本次选择');}}
function toggleCatalogPlan(id){catalogPlan=catalogPlan.includes(id)?catalogPlan.filter(v=>v!==id):[...catalogPlan,id];persistCatalogPlan();renderCatalog();}
function bindCatalogPlanButtons(){evaluationRoot.querySelectorAll('[data-plan-toggle]').forEach(el=>el.onclick=()=>toggleCatalogPlan(el.dataset.planToggle));}
function renderCatalogPlan(){const n=catalogPlan.length;const markup=`<button class="btn ${n?'btn-primary':''} catalog-plan-entry" data-open-plan aria-label="我的评测清单（${n}）">${icon('bookmark',14)}我的评测清单 <span class="plan-count">${n}</span></button>`;$('catalogPlanTop').innerHTML=markup;if($('catalogDetailPlanTop'))$('catalogDetailPlanTop').innerHTML=markup;evaluationRoot.querySelectorAll('[data-open-plan]').forEach(el=>el.onclick=showCatalogPlan);}
function closeCatalogDrawer(restoreFocus=true){
 if(!catalogState.detail)return;
 const opener=drawerOpener;
 drawerOpener=null;
 catalogState.detail=null;
 $('catalogDrawerRoot').innerHTML='';
 $('evaluation').inert=false;
 document.body.style.overflow=$('modalRoot').firstElementChild?'hidden':previousOverflow;
 if(options.detailId&&restoreFocus&&options.onBack){options.onBack();return;}
 if(state.module==='catalog')renderCatalog();
 if(restoreFocus){
  const cardId=opener?.dataset.catalogDetail;
  const target=opener?.isConnected?opener:cardId?evaluationRoot.querySelector(`[data-catalog-detail="${CSS.escape(cardId)}"]`):null;
  (target||$('catalogTab')).focus({preventScroll:true});
 }
}
const externalDetailInfo={
 math500:{modality:'文本',scope:'test 划分 · 500 题',conditions:'固定提示词、答案抽取与等价判定规则；比较成绩时注明推理设置。',size:'500 题',data:'https://huggingface.co/datasets/HuggingFaceH4/MATH-500',download:'https://huggingface.co/datasets/HuggingFaceH4/MATH-500/resolve/main/test.jsonl?download=true'},
 gsm8k:{modality:'文本',scope:'test 划分 · 1,319 题',size:'训练 7,473 题；测试 1,319 题',data:'https://huggingface.co/datasets/openai/gsm8k'},
 scicode:{project:'https://scicode-bench.github.io/',authors:'Minyang Tian、Luyu Gao 等',paper:'https://arxiv.org/abs/2407.13168',data:'https://huggingface.co/datasets/SciCode1/SciCode',modality:'文本、代码',size:'80 个主问题、338 个子问题',metric:'主问题 / 子问题解决率',unit:'比例或百分比 · 越高越好',scope:'区分主问题、子问题及是否提供背景知识的设置。',conditions:'Python 环境、测试数据与依赖；原项目推荐 Inspect。'},
 sab:{modality:'文本、数据文件、代码',scope:'Verified split，具体任务范围以当前项目文档为准。',conditions:'配套科研数据、Python 依赖与任务评测脚本。'},
 gpqa:{modality:'文本',code:'https://github.com/idavidrein/gpqa'},
 bixbench:{project:'https://advances.edisonscientific.com/benchmarks/bixbench3/'},
 geo:{project:'https://www.axisspatial.com/arena/evaluations/geobenchx'},
 sciknow:{project:'https://github.com/hicai-zju/sciknoweval'},
 astro:{modality:'文本、图像'},olympiad:{modality:'文本、图像'},astrovis:{modality:'文本、代码、图像'},
 mmlu:{modality:'文本'},aime:{modality:'文本'},phybench:{authors:'Shi Qiu、Shaoyang Guo 等',paper:'https://arxiv.org/abs/2504.16074v2',modality:'文本'}
};
function sourceBrand(url,size=18){
 let host='';try{host=new URL(url,location.href).hostname;}catch{}
 if(host==='github.com'||host.endsWith('.github.io'))return `<span class="source-brand github-brand" title="GitHub" aria-label="GitHub"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.08c-3.12.68-3.78-1.33-3.78-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.15 1.72 1.15 1 .1 1.5 2.17 3.27 1.22.1-.72.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.54 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.22 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg></span>`;
 if(host==='huggingface.co')return `<span class="source-brand huggingface-brand" title="Hugging Face" aria-label="Hugging Face">🤗</span>`;
 if(host==='arxiv.org')return `<span class="source-brand arxiv-brand" title="arXiv" aria-label="arXiv"><svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 12 18M18 3 6 21" stroke="#b5393a" stroke-width="2.4" stroke-linecap="round"/><path d="m8 3 10 18" stroke="#7e282b" stroke-width="1.2"/></svg></span>`;
 return `<span class="source-brand">${icon('external',size-3)}</span>`;
}
function institutionValue(name){if(!name)return '暂未提供';return `<span class="institution-value">${name.includes('Hugging Face')?sourceBrand('https://huggingface.co'):icon('institution',17)}<span>${esc(name)}</span></span>`;}
function safeResourceUrl(value){
 if(typeof value!=='string'||!/^https?:\/\/|^\/(?!\/)/i.test(value.trim()))return '';
 try {
  const url=new URL(value,location.origin);
  return /^https?:$/.test(url.protocol)?url.href:'';
 }catch{return '';}
}
function isPaperUrl(value){
 return /^https?:\/\/(?:arxiv\.org|doi\.org|openreview\.net|aclanthology\.org)\//i.test(value);
}
function officialSource(b,v=externalDetailInfo[b.id]||{}){
 return [b.officialUrl,b.projectUrl,v.project,b.paper,v.data].find(url=>safeResourceUrl(url)&&!isPaperUrl(url))||'';
}
function catalogDetailContent(b){
 const uploaded=b.origin==='platform',demo=b.id==='platform-physics-demo',v=externalDetailInfo[b.id]||{};
 const display=value=>Array.isArray(value)?value.join('、'):value;
 const row=(label,value)=>`<dt>${esc(label)}</dt><dd>${label==='机构'?institutionValue(display(value)):esc(display(value)||'暂未提供')}</dd>`;
 const section=(title,body)=>`<section class="detail-module"><h3>${title}</h3>${body}</section>`;
 const source=(label,value)=>{
  const url=safeResourceUrl(value);
  return url?`<a class="detail-source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="source-link-label">${sourceBrand(url)}${esc(label)}</span>${icon('external',13)}</a>`:`<div class="detail-source-empty"><span>${esc(label)}</span><span>暂未提供</span></div>`;
 };
 const downloadLink=(label,url,primary=false)=>`<a class="btn${primary?' btn-primary':''}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" download data-evaluation-download-link>${icon('download',13)}${label}</a>`;
 const tags=(values,others)=>[...new Set([...values.filter(value=>value!=='其他'||!others.length),...others])];
 const sample=value=>value&&typeof value==='object'?JSON.stringify(value,null,2):value;
 const code=(label,value)=>`<details class="detail-code"><summary>${esc(label)}</summary><pre>${esc(sample(value)||'暂未提供')}</pre></details>`;
 const note=(label,value)=>`<h4>${esc(label)}</h4><p class="detail-text">${esc(value||'暂未提供')}</p>`;
 const paper=b.paperUrl||v.paper||[b.paper,b.resultUrl].find(isPaperUrl);
 const official=officialSource(b,v);
 const repository=[b.sourceCodeUrl,b.codeUrl,v.code, /^https?:\/\/github\.com\/[^/]+\/[^/#?]+\/?$/i.test(official)?official:''].find(safeResourceUrl);
 const metric=demo?'准确率（Accuracy）':v.metric||(b.metric!=='原项目任务指标'&&b.metric)||'';
 const related=catalogItems().filter(item=>item.id!==b.id).map(item=>({
  item,
  relevance:3*item.subjects.filter(value=>b.subjects.includes(value)).length
   +2*item.tasks.filter(value=>value!=='其他'&&b.tasks.includes(value)).length
   +item.paradigms.filter(value=>value!=='其他'&&b.paradigms.includes(value)).length,
 })).filter(({relevance})=>relevance>0).sort((a,c)=>c.relevance-a.relevance).slice(0,3);
 const relatedSection=related.length?section('相关评测集',related.map(({item})=>`<button type="button" class="detail-related" data-related-detail="${esc(item.id)}"><span>${esc(item.name)}</span>${icon('arrow-right',13)}</button>`).join('')):'';
 let html=section('基本信息',`<dl class="evaluation-detail-meta">
  ${uploaded?row('更新时间',b.updatedAt):''}
  ${row('作者',b.authors||v.authors)}
  ${row('机构',b.institution||b.team)}
  ${row('学科领域',b.subjects)}
  ${row('任务类型',tags(b.tasks,b.taskOthers))}
  ${row('评测范式',tags(b.paradigms,b.paradigmOthers))}
  ${uploaded?'':row('发布年份',b.year?`${b.year} 年`:'')}
  ${row('模态',demo?'文本':b.modality||v.modality)}
  ${row('语言',b.language)}
  ${row('规模',v.size||b.size)}
  ${row('关键词',b.keywords)}
 </dl>`);
 html+=section('评测指标',`<p>${esc(metric||(uploaded?'暂未提供':'详见官方评测说明'))}</p>${b.method&&metric?`<p class="detail-text">${esc(b.method)}</p>`:''}`);
 if(!uploaded){
  const datasetFile=safeResourceUrl(v.download||b.downloadUrl);
  html+=section('相关来源',source('论文链接',paper)+source('官方链接',official)+source('官方源代码',repository)
   +(datasetFile?downloadLink('下载评测集',datasetFile):'')
   +(benchmarks.some(item=>item.id===b.id)?`<button type="button" class="btn btn-primary" id="catalogToLeaderboard">查看站内榜单 ${icon('arrow-right',13)}</button>`:''));
  return html+relatedSection;
 }

 const sampleRoot=assetBase+'evaluation/sample-upload/';
 const exampleInput='物体从静止开始做匀加速直线运动，加速度为 2 m/s²，运动 3 s。求末速度。';
 const exampleOutput={answer:6,unit:'m/s'};
 html+=section('任务与样例',
  note('任务说明',demo?'阅读基础力学题，提取已知条件并计算结果。输出包含 answer 和 unit 的 JSON 对象。':b.taskDescription)
  +`<div class="io-example"><div class="io-panel"><div class="io-panel-title">输入示例</div><pre>${esc(sample(demo?exampleInput:b.inputExample)||'暂未提供')}</pre></div><span class="io-arrow" aria-hidden="true">→</span><div class="io-panel"><div class="io-panel-title">预期输出</div><pre>${esc(sample(demo?exampleOutput:b.expectedOutput)||'暂未提供')}</pre></div></div>`
  +(b.sampleUrl?source('查看评测集样例',b.sampleUrl):code('评测集样例',demo?{id:'mechanics-001',split:'test',input:exampleInput,expected_output:exampleOutput}:b.sample))
  +(b.hasLocalSample?`<button type="button" class="btn" data-evaluation-files="sample">${icon('download',13)}下载评测集样例</button>`:''));

 const download=safeResourceUrl(demo?sampleRoot+'physics-demo-v1.0.0.zip':b.downloadUrl);
 const api=safeResourceUrl(demo?sampleRoot+'dataset.json':b.apiUrl);
 const repositoryDownload=download&&new URL(download).hostname==='github.com'&&!/\/(?:archive|releases\/download)\//.test(new URL(download).pathname);
 const downloadCode=b.downloadCode||(api?`from urllib.request import urlretrieve

urlretrieve(${JSON.stringify(api)}, ${JSON.stringify(new URL(api).pathname.split('/').pop()||'evaluation-data')})`:'');
 const direct=download
  ? repositoryDownload?source('查看数据仓库',download):downloadLink('直接下载',download,true)
  : b.hasLocalDownload?`<button type="button" class="btn btn-primary" data-evaluation-files="complete">${icon('download',13)}直接下载</button>`:'<p>暂未提供完整评测集文件。</p>';
 html+=section('评测集下载和使用',
  '<h4>下载方式</h4>'
  +(b.permission==='公开'
   ?`<div class="evaluation-download-methods"><div><h5>直接下载</h5>${direct}</div><div><h5>接口</h5>${api?downloadLink('下载接口数据',api):'<p>暂未提供下载接口。</p>'}${code('下载代码示例',downloadCode)}</div></div>`
   :`<p>当前资源${esc(b.permission)}，详情页暂不提供数据下载。</p>`)
  +note('使用教程',demo?'下载并解压资源包，读取 dataset.json 中的题目，将模型输出保存为 predictions.json，再运行评分脚本获取准确率。':b.usageGuide)
  +code('评测代码示例',demo?'python evaluate.py --data dataset.json --predictions predictions-example.json':b.evaluationCode));
 html+=section('相关来源',source('论文链接',paper)+source('项目链接',b.projectUrl||official));
 html+=section('许可协议',`<p class="detail-text">${esc(demo?'CC0 1.0 · 适用于本条目的原创演示题、说明与代码。':b.license||'暂未提供')}</p>`);

 html+=relatedSection;
 const corpora=Array.isArray(b.relatedCorpora)?b.relatedCorpora.filter(c=>typeof c?.id==='string'&&c.id&&typeof c.name==='string'&&c.name):[];
 if(corpora.length)html+=section('关联语料库',corpora.map(c=>`<a class="detail-related" href="${esc(assetBase)}search/datasets/${encodeURIComponent(c.id)}"><span>${esc(c.name)}</span>${icon('arrow-right',13)}</a>`).join(''));
 return html;
}

function evaluationActivity(b,className){
 const metrics=[
  ['downloads','下载量','download',b.downloadCount,b.baseDownloads],
  ['views','浏览量','eye',b.viewCount,b.baseViews],
  ['favorites','收藏量','star',b.favoriteCount,b.baseFavorites],
 ];
 return `<dl class="evaluation-activity ${className}" aria-label="评测集使用统计">${metrics.map(([key,label,symbol,count,base])=>`<div><dt>${icon(symbol,14)}${label}</dt><dd data-activity="${key}" data-base-count="${base}">${count.toLocaleString('zh-CN')}</dd></div>`).join('')}</dl>`;
}

async function shareCatalogDetail(id){
 const url=new URL(assetBase+'evaluation/datasets/'+encodeURIComponent(id),location.origin).href;
 try{
  await navigator.clipboard.writeText(url);
  if($('toastRoot'))toast('已复制评测集链接，可转发');
 }catch{
  if($('catalogDrawerBody')?.dataset.resourceId!==id)return;
  modal('分享评测集',`<label class="form-field">评测集链接<input id="catalogShareUrl" value="${esc(url)}" readonly></label>`);
  $('catalogShareUrl').focus();
  $('catalogShareUrl').select();
 }
}

function renderCatalogDetail(){
 const b=catalogItems().find(item=>item.id===catalogState.detail);
 const root=$('catalogDrawerRoot'),previous=$('catalogDrawerBody');
 const changed=previous?.dataset.resourceId!==b?.id;
 const scroll=changed?0:previous?.scrollTop||0;
 const focusedId=evaluationRoot.activeElement?.id;
 const content=b?`<section class="catalog-detail-overview">
  <div class="catalog-detail-top">
   <div class="catalog-detail-heading"><div class="benchmark-icon">${icon(b.icon,26)}</div><h2>${esc(b.name)}</h2></div>
   <div class="catalog-detail-actions">
    <button type="button" id="catalogDetailFavorite" aria-pressed="${b.favorite}" class="${b.favorite?'is-active':''}">${icon('star',15)}<span>${b.favorite?'已收藏':'收藏'}</span></button>
    <button type="button" id="catalogDetailShare">${icon('share',15)}分享</button>
   </div>
  </div>
  ${evaluationActivity(b,'evaluation-detail-activity')}
  <h3 class="detail-intro-label">简介</h3><p class="catalog-detail-intro">${esc(b.desc||'暂未提供')}</p>
 </section>${catalogDetailContent(b)}`:'<section class="catalog-detail-overview"><h2>未找到该评测集</h2><p>该资源可能尚未审核通过或已移除。</p></section>';
 root.innerHTML=`<div class="catalog-drawer-overlay${previous?' drawer-open':''}" id="catalogDrawerOverlay">
  <section class="catalog-drawer" role="dialog" aria-modal="true" aria-labelledby="catalogDrawerTitle">
   <header class="catalog-drawer-header"><h2 id="catalogDrawerTitle">评测集详情</h2><div id="catalogDetailPlanTop"></div><button type="button" class="modal-close" id="catalogDrawerClose" aria-label="关闭评测集详情">${icon('close',19)}</button></header>
   <div class="catalog-drawer-body" id="catalogDrawerBody" data-resource-id="${esc(b?.id||'')}">${content}</div>
   <footer class="catalog-drawer-footer"><button type="button" class="btn" id="catalogDrawerDone">关闭</button>${b?`<button type="button" class="btn btn-primary" id="catalogDrawerAdd" aria-pressed="${catalogPlan.includes(b.id)}">${icon(catalogPlan.includes(b.id)?'check':'plus',13)}${catalogPlan.includes(b.id)?'已加入清单':'加入清单'}</button>`:''}</footer>
  </section>
 </div>`;
 document.body.style.overflow='hidden';
 $('evaluation').inert=true;
 $('catalogDrawerClose').onclick=()=>closeCatalogDrawer();
 $('catalogDrawerDone').onclick=()=>closeCatalogDrawer();
 $('catalogDrawerOverlay').onclick=e=>{if(e.target===$('catalogDrawerOverlay'))closeCatalogDrawer();};
 if(b){
  $('catalogDrawerAdd').onclick=()=>toggleCatalogPlan(b.id);
  $('catalogDetailFavorite').onclick=()=>toggleCatalogFavorite(b.id);
  $('catalogDetailShare').onclick=()=>void shareCatalogDetail(b.id);
 }
 root.querySelectorAll('[data-evaluation-download-link]').forEach(link=>link.addEventListener('click',()=>recordCatalogActivity('downloads',b.id)));
 root.querySelectorAll('[data-evaluation-files]').forEach(button=>button.onclick=async()=>{
  const key=button.dataset.evaluationFiles;
  try {
   const record=await readEvaluationTask(b.account,b.id);
   if(!button.isConnected)return;
   const files=record?evaluationFiles(record.data[key]):[];
   if(!files.length){toast('当前浏览器中没有可下载的文件');return;}
   let counted=false;
   const downloadFile=file=>{
    downloadEvaluationFile(file);
    if(key==='complete'&&!counted){counted=true;recordCatalogActivity('downloads',b.id);}
   };
   if(files.length===1){downloadFile(files[0]);return;}
   modal(key==='sample'?'下载评测集样例':'下载完整评测集',files.map(({path},index)=>`<button type="button" class="detail-related" data-evaluation-download="${index}"><span>${esc(path)}</span>${icon('download',13)}</button>`).join(''));
   $('modalRoot').querySelectorAll('[data-evaluation-download]').forEach(el=>el.onclick=()=>downloadFile(files[Number(el.dataset.evaluationDownload)]));
  }catch{if(button.isConnected)toast('读取文件失败，请重试');}
 });
 if($('catalogToLeaderboard'))$('catalogToLeaderboard').onclick=()=>{
  if(options.detailId&&options.onLeaderboard){options.onLeaderboard(b.id);return;}
  closeCatalogDrawer(false);
  selectBenchmark(b.id);
  evaluationRoot.querySelector('[data-benchmark].active')?.focus();
 };
 root.querySelectorAll('[data-related-detail]').forEach(el=>el.onclick=()=>openCatalogDetail(el.dataset.relatedDetail));
 renderCatalogPlan();
 $('catalogDrawerBody').scrollTop=scroll;
 if(!previous||changed)$('catalogDrawerClose').focus({preventScroll:true});
 else if(focusedId)$(focusedId)?.focus({preventScroll:true});
}
const planConfig={model:'',harness:''};
try{Object.assign(planConfig,JSON.parse(localStorage.getItem('science-demo-plan-config')||'{}'));}catch{}
function savePlanConfig(){if($('planModel'))planConfig.model=$('planModel').value;if($('planHarness'))planConfig.harness=$('planHarness').value;try{localStorage.setItem('science-demo-plan-config',JSON.stringify(planConfig));}catch{}}
function showCatalogPlan(){const list=catalogPlan.map(id=>catalogItems().find(b=>b.id===id)).filter(Boolean);modal('我的评测清单',`<div class="plan-modal-intro"><span>已添加 <strong>${list.length}</strong> 个评测集</span>${list.length?'<button class="text-btn" id="planModalClear">清空清单</button>':''}</div><div class="plan-config"><label class="form-field">模型名称<input id="planModel" placeholder="填写待评测模型名称与版本" value="${esc(planConfig.model)}"></label><label class="form-field">Harness<input id="planHarness" placeholder="例如：lm-evaluation-harness、Inspect 或自定义" value="${esc(planConfig.harness)}"></label></div><div class="plan-review-list">${list.length?list.map((b,i)=>`<div><span class="plan-row-index">${i+1}</span><span class="plan-review-icon">${icon(b.icon,19)}</span><span class="plan-row-name"><strong>${esc(b.name)}</strong><small>${esc(b.version)} · ${b.subjects.map(esc).join(' / ')}</small></span><a class="text-btn" href="${esc(b.paper||assetBase+'evaluation/datasets/'+encodeURIComponent(b.id))}" target="_blank" rel="noopener noreferrer">来源 ${icon('external',11)}</a><button class="plan-remove" data-modal-remove="${b.id}" aria-label="从清单移除：${esc(b.name)}">${icon('close',14)}</button></div>`).join(''):'<div class="plan-empty">'+icon('bookmark',28)+'<strong>还没有添加评测集</strong><span>从目录卡片点击“加入清单”，开始整理你的评测计划。</span></div>'}</div><p class="plan-download-note">清单包含所选评测集、来源链接，以及填写的模型和 Harness；不包含原始数据文件。</p>`,`<button class="btn btn-primary" id="planDownloadJson" ${!list.length?'disabled':''}>${icon('download',13)}下载评测清单</button>`,true);$('planModel').oninput=savePlanConfig;$('planHarness').oninput=savePlanConfig;$('planDownloadJson').onclick=()=>{savePlanConfig();downloadCatalogPlan('json')};evaluationRoot.querySelectorAll('[data-modal-remove]').forEach(el=>el.onclick=()=>{savePlanConfig();toggleCatalogPlan(el.dataset.modalRemove);showCatalogPlan();});if($('planModalClear'))$('planModalClear').onclick=()=>{savePlanConfig();catalogPlan=[];persistCatalogPlan();renderCatalog();showCatalogPlan();};}
function catalogPlanData(){return catalogPlan.map(id=>catalogItems().find(b=>b.id===id)).filter(Boolean).map(b=>({id:b.id,name:b.name,version:b.version,subjects:b.subjects,tasks:b.tasks,taskOthers:b.taskOthers,paradigms:b.paradigms,paradigmOthers:b.paradigmOthers,description:b.desc,team:b.team,year:b.year,updatedAt:b.updatedAt,permission:b.permission,source:b.paper||new URL(assetBase+'evaluation/datasets/'+encodeURIComponent(b.id),location.origin).href,results:b.hasLeaderboard?(b.resultUrl||b.url):'',model:planConfig.model,harness:planConfig.harness}));}
function downloadCatalogPlan(format){const rows=catalogPlanData();if(!rows.length)return;let content,type;if(format==='json'){content=JSON.stringify({schemaVersion:'1.0',exportedAt:new Date().toISOString(),model:planConfig.model,harness:planConfig.harness,evaluations:rows},null,2);type='application/json;charset=utf-8';}else{const labels=['评测集','版本','学科','任务类型','评测范式','提供团队','发布年份','权限说明','项目地址','成绩来源','待评测模型','运行框架与配置'];const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';content='\uFEFF'+[labels,...rows.map(b=>Object.values(b))].map(r=>r.map(quote).join(',')).join('\r\n');type='text/csv;charset=utf-8';}const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download='科学评测清单.'+format;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('评测清单已导出');}

function showUpload(){modal('共建科学评测集',`<p>登记你的评测资源，后续可补充数据、运行方式和评分规则。</p><form id="uploadForm"><label class="form-field">评测集名称 <span style="color:#af96d9">*</span><input name="name" placeholder="例如：大学物理多步推理评测集" required maxlength="80"></label><label class="form-field">主要学科<select name="subject"><option>物理</option><option>数学</option><option>化学</option><option>天文</option><option>地理</option><option>生物</option><option>跨学科</option></select></label><label class="form-field">简介<textarea name="description" placeholder="简要说明评测的科学任务和适用场景" maxlength="500"></textarea></label><label class="form-field file-upload">${icon('upload',21)}<div style="margin:7px 0">选择评测材料（选填）</div><input type="file" name="material" accept=".json,.jsonl,.csv,.zip,.pdf,.txt"></label><div class="note-box">演示模式：这里只保存草稿信息到当前浏览器，文件不会上传，数据不会发送至服务器。</div></form>`,`<button class="btn" id="modalDone">取消</button><button class="btn btn-primary" id="saveDraft">保存演示草稿</button>`);try{const draft=JSON.parse(localStorage.getItem('science-demo-draft')||'null');if(draft){const form=$('uploadForm');form.elements.name.value=draft.name||'';form.elements.subject.value=draft.subject||'物理';form.elements.description.value=draft.description||'';}}catch{}$('saveDraft').onclick=()=>{const form=$('uploadForm');if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));delete data.material;try{localStorage.setItem('science-demo-draft',JSON.stringify(data));closeModal();toast('演示草稿已保存到当前浏览器')}catch{toast('浏览器未允许本地保存，请复制填写内容保留')}};}
$('modelSearch').oninput=e=>{state.query=e.target.value;state.page=1;renderResults()};$('clearSearch').onclick=()=>{state.query='';$('modelSearch').value='';state.page=1;renderResults();$('modelSearch').focus()};evaluationRoot.querySelectorAll('[data-access]').forEach(el=>el.onclick=()=>{state.access=el.dataset.access;state.page=1;evaluationRoot.querySelectorAll('[data-access]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',b===el)});renderResults()});$('resetBtn').onclick=resetFilters;$('tableViewBtn').onclick=()=>setView('table');$('chartViewBtn').onclick=()=>setView('chart');$('exportBtn').onclick=()=>void exportLeaderboard();$('detailBtn').onclick=showDetail;$('catalogTab').onclick=()=>switchModule('catalog');$('leaderboardTab').onclick=()=>switchModule('leaderboard');$('uploadBtn').onclick=()=>options.onUpload?options.onUpload():showUpload();
const handleKeyDown = e=>{if(e.key==='Escape'){const open=catalogYearBounds.find(([key])=>yearTrigger(key).getAttribute('aria-expanded')==='true');if(open){closeCatalogYears();yearTrigger(open[0]).focus();return;}}const root=$('modalRoot').firstElementChild?$('modalRoot'):$('catalogDrawerRoot').firstElementChild?$('catalogDrawerRoot'):null;if(e.key==='Escape'){if($('modalRoot').firstElementChild)closeModal();else closeCatalogDrawer();}if(e.key==='Tab'&&root){const f=[...root.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,summary')].filter(el=>el.offsetParent!==null);if(!f.length)return;if(e.shiftKey&&evaluationRoot.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&evaluationRoot.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}}};
evaluationRoot.addEventListener('keydown', handleKeyDown);
const benchmarkTabs=$('benchmarkTabs');
benchmarkTabs.onscroll=syncBenchmarkArrows;
$('benchmarkPrev').onclick=()=>benchmarkTabs.scrollBy({left:-benchmarkTabs.clientWidth*.75,behavior:'smooth'});
$('benchmarkNext').onclick=()=>benchmarkTabs.scrollBy({left:benchmarkTabs.clientWidth*.75,behavior:'smooth'});
const benchmarkResizeObserver=new ResizeObserver(syncBenchmarkArrows);
benchmarkResizeObserver.observe(benchmarkTabs);
initCatalog();renderBenchmarkTabs();renderSummary();renderResults();switchModule('catalog');if(options.benchmarkId&&benchmarks.some(b=>b.id===options.benchmarkId))selectBenchmark(options.benchmarkId);if(options.detailId)openCatalogDetail(options.detailId);
  return () => {
    evaluationRoot.removeEventListener('keydown', handleKeyDown);
    benchmarkResizeObserver.disconnect();
    window.removeEventListener('storage',syncCatalogFavoritesFromStorage);
    document.removeEventListener('pointerdown', handleYearOutside);
    clearTimeout(toastTimer);
    document.body.style.overflow = previousOverflow;
  };
}
