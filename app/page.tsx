"use client";

import { useMemo, useState } from "react";

type View = "home" | "courses" | "path" | "tools" | "templates";
type LibraryItem = {
  id: string;
  kind: "课程" | "工具" | "练习" | "模板";
  title: string;
  summary: string;
  meta: string;
  accent?: "cream" | "green" | "rose";
  image?: string;
  tags: string[];
};

type ProductCheckItem = {
  prompt: string;
  yesScore: number;
  noScore: number;
};

const navigation: { id: View; label: string }[] = [
  { id: "home", label: "学习首页" },
  { id: "courses", label: "课程资料" },
  { id: "path", label: "学习路径" },
  { id: "tools", label: "工具中心" },
  { id: "templates", label: "模板库" },
];

const library: LibraryItem[] = [
  {
    id: "needs",
    kind: "课程",
    title: "客户需求诊断：从提问到判断",
    summary: "不急着介绍产品，先用三层提问看见客户真正担心的问题。",
    meta: "18分钟 · 当前推荐",
    accent: "cream",
    image: "/images/course-card.png",
    tags: ["需求", "诊断", "沟通", "课程"],
  },
  {
    id: "value",
    kind: "工具",
    title: "整装方案价值表达清单",
    summary: "把尺寸、配色、预算和落地风险，翻译成客户听得懂的购买理由。",
    meta: "可直接套用 · 6项检查",
    accent: "green",
    tags: ["价值", "表达", "方案", "工具"],
  },
  {
    id: "practice",
    kind: "练习",
    title: "用3句话说清方案价值",
    summary: "完成一次真实表达：接住顾虑、指出风险、推动下一步。",
    meta: "约8分钟 · 今日任务",
    accent: "rose",
    image: "/images/practice-card.png",
    tags: ["话术", "表达", "练习", "客户嫌贵"],
  },
  {
    id: "aesthetic",
    kind: "工具",
    title: "蓝筱玉美学体系打分表",
    summary: "从主题、色彩、比例、层次、纵深和平衡逐项判断空间。",
    meta: "8个维度 · 严格评分",
    accent: "green",
    tags: ["美学", "打分", "空间", "工具"],
  },
  {
    id: "color-strip",
    kind: "工具",
    title: "PCCS色彩条应用工具",
    summary: "用色彩条辅助判断配色关系和沟通偏好，结论仍需结合现场行为验证。",
    meta: "配色判断 · 现场辅助",
    accent: "rose",
    tags: ["PCCS", "色彩条", "配色", "工具"],
  },
  {
    id: "55387",
    kind: "工具",
    title: "55387方案预判工具",
    summary: "在方案进入深化前，提前发现比例、色彩与落地风险。",
    meta: "方案前置检查",
    accent: "cream",
    tags: ["55387", "方案", "预判", "工具"],
  },
  {
    id: "store-diagnosis",
    kind: "工具",
    title: "3分钟门店增长诊断",
    summary: "区分获客、信任、表达和成交断点，找到门店真正卡住的位置。",
    meta: "助教与老板适用",
    accent: "green",
    tags: ["门店", "增长", "诊断", "工具"],
  },
  {
    id: "two-axis",
    kind: "工具",
    title: "两轴一塔＋八大回应术",
    summary: "先判断客户所在位置，再选择回应方式，避免所有异议都用同一句话术。",
    meta: "诊断式销讲 · 场景训练",
    accent: "green",
    tags: ["两轴一塔", "回应术", "异议", "销讲", "工具"],
  },
  {
    id: "customer-segment",
    kind: "工具",
    title: "客户身份分层转化表",
    summary: "按老板、老板娘、设计师和导购区分痛点、动机、抗拒点与案例入口。",
    meta: "身份判断 · 私聊入口",
    accent: "cream",
    tags: ["客户身份", "分层", "转化", "工具"],
  },
  {
    id: "product-check",
    kind: "模板",
    title: "门店是否还在卖产品自检表",
    summary: "从进店、沟通、方案、成交和团队五个阶段，判断门店是在卖产品，还是在卖解决方案。",
    meta: "5个阶段 · 30分结果分层",
    accent: "cream",
    tags: ["门店", "卖产品", "解决方案", "顾问式销售", "30分", "自检", "模板"],
  },
  {
    id: "quote-check",
    kind: "模板",
    title: "报价前五项检查表",
    summary: "报价前确认价值是否讲清、信任是否建立、决策条件是否成熟。",
    meta: "可复制 · SOP",
    accent: "cream",
    tags: ["报价", "成交", "检查", "模板"],
  },
  {
    id: "silent-followup",
    kind: "模板",
    title: "沉默客户分阶段唤醒SOP",
    summary: "不用催促，用低压力、重价值、轻提问重新打开对话。",
    meta: "4阶段 · 微信跟进",
    accent: "rose",
    tags: ["沉默", "客户", "跟进", "模板"],
  },
  {
    id: "student-diagnosis",
    kind: "模板",
    title: "学员诊断与一人一策模板",
    summary: "先判断人，再经营人：证据、根因、信赖动作与下一步。",
    meta: "助教专用 · 完整版",
    accent: "green",
    tags: ["学员", "诊断", "作战方案", "模板"],
  },
  {
    id: "growth-plan",
    kind: "模板",
    title: "7天成长计划与复盘表",
    summary: "每天只设一个关键动作，用真实场景检验是否真正学会。",
    meta: "7天 · 可打印",
    accent: "cream",
    tags: ["成长", "计划", "复盘", "模板"],
  },
  {
    id: "case-library",
    kind: "模板",
    title: "经营结果案例库模板",
    summary: "按学前问题、学习动作、回店变化、老板原话和适配客户沉淀案例。",
    meta: "案例证明 · 5项结构",
    accent: "green",
    tags: ["经营结果", "案例库", "老板原话", "模板"],
  },
  {
    id: "objection-cards",
    kind: "模板",
    title: "十大异议处理训练卡",
    summary: "每道题固定训练真实话术、追问问题和明确下一步动作。",
    meta: "真实客户场景 · 逐题训练",
    accent: "rose",
    tags: ["异议", "训练卡", "话术", "追问", "模板"],
  },
  {
    id: "homework-review",
    kind: "模板",
    title: "学员课后作业点评SOP",
    summary: "从完成情况、真实应用、主要断点到下一次练习，形成反馈闭环。",
    meta: "助教执行 · 复盘",
    accent: "green",
    tags: ["作业点评", "助教", "SOP", "复盘", "模板"],
  },
  {
    id: "enrollment-followup",
    kind: "模板",
    title: "精华班报名转化跟进SOP",
    summary: "先诊断、再匹配、再推进，不用课程介绍和催促替代信赖建立。",
    meta: "招生转化 · 分层跟进",
    accent: "cream",
    tags: ["精华班", "招生", "跟进", "SOP", "模板"],
  },
  {
    id: "seventy-two-hours",
    kind: "模板",
    title: "课后72小时跟进记录表",
    summary: "记录学员原话、信赖变化、决策条件、下一步动作和备用动作。",
    meta: "72小时 · 助教承接",
    accent: "rose",
    tags: ["72小时", "课后", "跟进", "记录", "模板"],
  },
];

const pathLevels = [
  {
    stage: "第1层",
    title: "听过课程",
    milestone: "我只是接触了",
    ability: "我参加了课程，知道了很多关键词。",
    warning: "知道不等于掌握，接触只是学习的开始。如果只停在这一层，其实还没有真正进入学习状态。",
    evidence: "列出目前知道的课程关键词。",
  },
  {
    stage: "第2层",
    title: "看懂案例",
    milestone: "我开始有感觉了",
    ability: "我能看懂老师拆解的空间案例、成交案例和门店案例。",
    warning: "看懂别人的案例，不代表自己能做出来；看懂老师的拆解，也不代表自己会拆解。现在只是有了感觉，能力还没有真正长出来。",
    evidence: "列出目前已经有感觉的空间、成交或门店案例。",
  },
  {
    stage: "第3层",
    title: "复述知识",
    milestone: "我能说出来了",
    ability: "我能复述课程里面的方法、模型、话术和工具。",
    warning: "会背不等于会用，能复述不等于真理解，记住知识不等于拥有能力。不能用到自己的客户、方案和门店里，就仍停留在表层学习。",
    evidence: "列出目前能够复述的课程方法、模型、话术或工具。",
  },
  {
    stage: "第4层",
    title: "讲清逻辑",
    milestone: "我开始真正理解了",
    ability: "我不只是重复老师的话，而是能用自己的语言讲清楚背后的逻辑。",
    warning: "不能只说“老师怎么说”，还要回答：为什么这样判断？背后的逻辑是什么？不用老师的原话，自己能不能讲明白？",
    evidence: "选一个课程判断，用自己的语言讲清背后的逻辑。",
  },
  {
    stage: "第5层",
    title: "套用工具",
    milestone: "我开始真正行动了",
    ability: "我开始把课堂工具用到真实客户、真实方案和真实门店动作里。",
    warning: "不能只听课、记笔记、写感受。没有使用工具，就还没有真正进入应用层。",
    evidence: "写清用了哪个工具、拿哪个客户做了诊断、发现了什么问题，以及下一步准备怎么改。",
  },
  {
    stage: "第6层",
    title: "独立诊断",
    milestone: "我开始会判断问题了",
    ability: "面对真实客户、真实门店、真实户型和真实成交卡点，我能先判断问题在哪里。",
    warning: "不再一遇到问题就先问老师“我该怎么办”。遇到问题先诊断，遇到客户先判断，遇到卡点先分析，遇到失败先找原因。",
    evidence: "列出自己先独立诊断过的真实问题。",
  },
  {
    stage: "第7层",
    title: "识别差异",
    milestone: "我不再机械套方法了",
    ability: "我知道不同客户、空间和成交问题，不能机械使用同一套话术或方法。",
    warning: "不会区分应用场景，学得越多反而越容易乱用。真正进入实战，必须学会辨析。",
    evidence: "列出自己辨析过的客户、空间、成交或经营场景。",
  },
  {
    stage: "第8层",
    title: "复盘提炼",
    milestone: "我开始从实战中长经验了",
    ability: "我不再把失败简单归因，而是能从一次经验里提炼出可复用的规律。",
    warning: "不复盘，就会一直重复犯错；会复盘，每一次失败都会变成下一次成交的筹码。",
    evidence: "列出做过的复盘，并写清失败、沉默或方案卡点背后的原因和规律。",
  },
  {
    stage: "第9层",
    title: "形成打法",
    milestone: "我开始长出自己的方法了",
    ability: "我能把蓝老师的方法，结合自己的城市、客户群体、门店情况和表达风格，变成自己的打法。",
    warning: "真正优秀的学习，不是永远复制老师。最终要拥有的不是别人的答案，而是自己的能力系统。",
    evidence: "列出已经形成的案例库、话术库、成交流程、审美表达或全案价值呈现方式。",
  },
  {
    stage: "第10层",
    title: "改变结果",
    milestone: "我真正内化了",
    ability: "学习不再停留在课堂笔记和作业，而是真的改变了我的行为和结果。",
    warning: "不是“学完了”，而是变强了；不是“听懂了”，而是做到了；不是“知道了”，而是结果变了。",
    evidence: "列出已经发生的行为变化、成交变化、方案变化或经营结果。",
  },
];

const courseItems = [
  { day: "DAY 1", title: "认知重建", action: "从卖产品升级为卖整体方案", tool: "《门店是否还在卖产品自检表》", practice: "识别门店当前最大的经营卡点", pass: "能说清门店为什么必须从产品表达升级为方案价值", openId: "product-check" },
  { day: "DAY 2", title: "定位选择", action: "判断门店适合小全案、大全案还是整装路径", tool: "定位选择相关资料待从原始课程导入", practice: "对照现状，明确门店下一阶段的主攻方向", pass: "能结合团队、客群和交付能力说明定位选择", openId: "store-diagnosis" },
  { day: "DAY 3", title: "客户读心", action: "从客户原话识别显性需求、隐性顾虑与决策阻力", tool: "55387客户预判＋客户身份分层转化表", practice: "拿一个真实客户完成预判，并提出追问", pass: "能给出真实话术、追问问题和明确下一步", openId: "55387" },
  { day: "DAY 4", title: "美学能力", action: "把“凭感觉”升级为从色、形、质进行专业判断", tool: "美学打分表＋PCCS色彩条", practice: "找一张空间图，从色、形、质写出好看的原因", pass: "能说明空间哪里好、为什么好、如何优化", openId: "aesthetic" },
  { day: "DAY 5", title: "全案流程", action: "把需求、方案、预算、产品和落地串成完整交付", tool: "全案设计六要素＋经营结果案例库", practice: "拆解一个真实方案的流程、话术与团队断点", pass: "能指出方案最容易翻车的环节及前置动作", openId: "case-library" },
  { day: "DAY 6", title: "配色升级", action: "用比例和色彩关系替代单品式配色", tool: "PCCS色彩条＋美学打分表", practice: "用现有项目完成一次配色比例复盘", pass: "能把配色逻辑讲成客户听得懂的方案价值", openId: "color-strip" },
  { day: "DAY 7", title: "成交系统", action: "把诊断、影响、优化、结果和推进变成固定动作", tool: "报价前五项检查＋十大异议处理训练卡", practice: "完成一道真实客户场景表达并明确推进动作", pass: "能做到不硬推、不空讲，并推动客户进入下一步", openId: "objection-cards" },
];

const productCheckSections = [
  {
    title: "一、客户进店阶段：我们卖的是产品，还是解决方案？",
    items: [
      { prompt: "客户进店后，第一句话是否是在介绍产品品牌、价格、优惠？", yesScore: 0, noScore: 1 },
      { prompt: "是否经常出现客户问：“这个多少钱？”“有没有便宜一点的？”", yesScore: 0, noScore: 1 },
      { prompt: "是否有明确了解客户家庭成员、生活习惯、装修需求？", yesScore: 1, noScore: 0 },
      { prompt: "是否先帮助客户规划未来生活场景，而不是直接推荐产品？", yesScore: 1, noScore: 0 },
      { prompt: "是否有一套标准化需求诊断流程？", yesScore: 1, noScore: 0 },
    ],
    note: "如果前三项经常发生，说明门店大概率仍停留在产品销售模式。",
  },
  {
    title: "二、销售沟通阶段：客户为什么选择我们？",
    items: [
      { prompt: "销售是否能讲清楚产品背后的生活价值？", yesScore: 1, noScore: 0 },
      { prompt: "是否能够解释“为什么这样搭配，而不是简单推荐单品”？", yesScore: 1, noScore: 0 },
      { prompt: "是否有自己的设计理念、搭配方法或服务体系？", yesScore: 1, noScore: 0 },
      { prompt: "客户比较价格时，是否只能强调质量和品牌？", yesScore: 0, noScore: 1 },
      { prompt: "是否能让客户理解选择我们的核心原因不是低价？", yesScore: 1, noScore: 0 },
    ],
  },
  {
    title: "三、方案呈现阶段：展示的是产品，还是家的结果？",
    items: [
      { prompt: "给客户看的是否只是产品图片、样册、价格表？", yesScore: 0, noScore: 1 },
      { prompt: "是否能够呈现完整空间效果？", yesScore: 1, noScore: 0 },
      { prompt: "是否有针对客户家的个性化搭配方案？", yesScore: 1, noScore: 0 },
      { prompt: "是否能够展示真实落地案例？", yesScore: 1, noScore: 0 },
      { prompt: "是否能够讲清楚设计、材质、预算之间的关系？", yesScore: 1, noScore: 0 },
    ],
  },
  {
    title: "四、成交阶段：客户买的是产品，还是信任？",
    items: [
      { prompt: "客户成交主要原因是不是“价格合适”？", yesScore: 0, noScore: 1 },
      { prompt: "是否经常需要靠优惠、赠品推动成交？", yesScore: 0, noScore: 1 },
      { prompt: "客户是否认可专业能力，而不是只关注产品价格？", yesScore: 1, noScore: 0 },
      { prompt: "是否有客户主动转介绍？", yesScore: 1, noScore: 0 },
      { prompt: "是否建立了长期客户关系，而不是一次交易？", yesScore: 1, noScore: 0 },
    ],
  },
  {
    title: "五、团队能力阶段：员工是在卖货，还是在做顾问？",
    items: [
      { prompt: "员工是否具备空间搭配能力？", yesScore: 1, noScore: 0 },
      { prompt: "员工是否懂客户需求分析？", yesScore: 1, noScore: 0 },
      { prompt: "员工是否能主动创造客户需求？", yesScore: 1, noScore: 0 },
      { prompt: "员工是否有自己的案例讲解能力？", yesScore: 1, noScore: 0 },
      { prompt: "员工是否能解决客户装修过程中的顾虑？", yesScore: 1, noScore: 0 },
    ],
  },
];

const productCheckItems: ProductCheckItem[] = productCheckSections.flatMap((section) => section.items);

const productCheckResults = [
  {
    minScore: 0,
    maxScore: 8,
    range: "0-8分",
    title: "产品销售型门店",
    points: ["客户主要问价格", "成交依靠优惠", "容易被同行比价", "利润空间越来越低"],
    next: "核心问题：不是产品不好，而是客户看不到你的价值。",
  },
  {
    minScore: 9,
    maxScore: 16,
    range: "9-16分",
    title: "正在转型阶段",
    points: ["开始重视设计和服务", "有案例、有方案", "但成交逻辑仍偏产品"],
    next: "下一步：建立标准化设计服务流程，让客户从“比较价格”转向“认可价值”。",
  },
  {
    minScore: 17,
    maxScore: 25,
    range: "17-25分",
    title: "顾问式销售门店",
    points: ["能诊断客户需求", "能提供整体解决方案", "客户购买的是专业和信任"],
    next: "下一步：强化品牌影响力，提高客单价和转介绍。",
  },
];

const productCheckQuestions = [
  "客户为什么一定要选择我们，而不是去隔壁？",
  "如果客户只比较价格，我们有没有能力改变他的比较标准？",
  "我们卖出去的是：一个产品、一套空间方案、一种生活方式，还是一个值得信任的解决方案？",
  "如果明天同行拿出同样产品，我们还能靠什么赢？",
];

const productCheckText = `门店是否还在卖产品自检表

本表共25题，满分25分。计分规则：体现顾问式销售能力的正向题，是=1分、否=0分；暴露仍在卖产品的反向题，是=0分、否=1分。分数越高，代表门店越接近顾问式销售。

请按五个阶段逐项回答“是/否”，并记录得分。

一、客户进店阶段：我们卖的是产品，还是解决方案？
${productCheckSections[0].items.map((item, index) => `${index + 1}. ${item.prompt}（是=${item.yesScore}分，否=${item.noScore}分）`).join("\n")}

二、销售沟通阶段：客户为什么选择我们？
${productCheckSections[1].items.map((item, index) => `${index + 1}. ${item.prompt}（是=${item.yesScore}分，否=${item.noScore}分）`).join("\n")}

三、方案呈现阶段：展示的是产品，还是家的结果？
${productCheckSections[2].items.map((item, index) => `${index + 1}. ${item.prompt}（是=${item.yesScore}分，否=${item.noScore}分）`).join("\n")}

四、成交阶段：客户买的是产品，还是信任？
${productCheckSections[3].items.map((item, index) => `${index + 1}. ${item.prompt}（是=${item.yesScore}分，否=${item.noScore}分）`).join("\n")}

五、团队能力阶段：员工是在卖货，还是在做顾问？
${productCheckSections[4].items.map((item, index) => `${index + 1}. ${item.prompt}（是=${item.yesScore}分，否=${item.noScore}分）`).join("\n")}

结果判断：0-8分产品销售型门店；9-16分正在转型阶段；17-25分顾问式销售门店。

最终判断：如果客户离开门店后只记住“你家某某产品多少钱”，说明你还在卖产品；如果客户记住“这家店懂我的需求，能帮我打造适合我的家”，说明你已经开始卖价值。`;

const templateText = `姐，我注意到你现在真正卡住的，不是没有学过方法，而是还没有把方法练成客户听得懂的表达。\n\n我们先不急着谈课程。你把最近一次最难推进的客户情况发给我，我先帮你判断：问题出在需求没问透、价值没讲清，还是下一步没有推动。`;

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [storeAnswers, setStoreAnswers] = useState<Record<number, boolean>>({});
  const [taskDone, setTaskDone] = useState(false);
  const [toast, setToast] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return library.filter((item) =>
      [item.title, item.summary, item.kind, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const answeredStoreItems = Object.keys(storeAnswers).length;
  const storeScore = productCheckItems.reduce((total, item, index) => {
    const answer = storeAnswers[index];
    if (answer === undefined) return total;
    return total + (answer ? item.yesScore : item.noScore);
  }, 0);
  const storeResult = answeredStoreItems === productCheckItems.length
    ? productCheckResults.find((result) => storeScore >= result.minScore && storeScore <= result.maxScore)
    : null;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(selected?.id === "product-check" ? productCheckText : templateText);
      notify(selected?.id === "product-check" ? "自检表文字已复制" : "模板已复制，可直接修改使用");
    } catch {
      notify("复制未成功，请在预览中手动选择文字");
    }
  };

  const openItem = (id: string) => {
    const item = library.find((entry) => entry.id === id);
    if (item) setSelected(item);
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("home")} aria-label="返回学习首页">
          <span className="brand-name">蓝筱玉整装学堂</span>
          <span className="brand-subtitle">学习成长中心</span>
        </button>

        <nav className="primary-nav" aria-label="主要栏目">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "nav-link active" : "nav-link"}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="搜索课程、工具或模板"
              placeholder="搜索课程、工具或模板"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <div className="search-results">
                <p>{results.length ? `找到 ${results.length} 项内容` : "暂未找到相关内容"}</p>
                {results.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelected(item);
                      setQuery("");
                    }}
                  >
                    <span>{item.kind}</span>
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="avatar" aria-label="个人学习档案">罗</button>
        </div>
      </header>

      {view === "home" && (
        <div className="page home-page">
          <section className="hero-stage">
            <div className="hero-copy">
              <div className="stage-label">当前学习阶段</div>
              <div className="stage-title"><strong>第5层 · 套用工具</strong><span>我开始真正行动了</span></div>
              <h1>把学过的知识，<br />练成客户听得懂的成交能力</h1>
              <p>今天只做一个完整闭环：学一节课、用一个工具、完成一次真实表达。</p>
              <div className="continue-row">
                <button className="primary-cta" onClick={() => openItem("needs")}>
                  继续学习 <span>→</span>
                </button>
                <span className="continue-meta"><small>上次学到</small><strong>客户需求诊断 · 第2节</strong></span>
              </div>
            </div>

            <div className="focus-panel" aria-label="本周成长计划">
              <div className="focus-header">
                <div><span>本周成长计划</span><strong>{taskDone ? "本周任务已完成" : "完成2项，还差1项"}</strong></div>
                <div className={taskDone ? "progress-ring complete" : "progress-ring"}><b>{taskDone ? 3 : 2}</b><small>/3</small></div>
              </div>
              <div className="progress-track"><span style={{ width: taskDone ? "100%" : "66.66%" }} /></div>
              <div className="focus-tasks">
                <div className="focus-task complete"><span>✓</span><div><strong>看懂客户需求三层拆解</strong><small>课程 · 已完成</small></div></div>
                <div className="focus-task complete"><span>✓</span><div><strong>使用方案价值表达清单</strong><small>工具 · 已完成</small></div></div>
                <button
                  className={taskDone ? "focus-task active complete" : "focus-task active"}
                  onClick={() => {
                    if (taskDone) {
                      setTaskDone(false);
                      notify("练习已恢复为待完成");
                    } else {
                      openItem("practice");
                    }
                  }}
                >
                  <span>{taskDone ? "✓" : "3"}</span><div><strong>{taskDone ? "完成一次客户异议表达练习" : "下一步：完成客户异议表达练习"}</strong><small>{taskDone ? "练习 · 已完成" : "练习 · 约8分钟"}</small></div><b>→</b>
                </button>
              </div>
              <button className="path-shortcut" onClick={() => setView("path")}>查看完整10层学习路径 <span>→</span></button>
            </div>
          </section>

          <section className="recommend-section">
            <div className="section-heading">
              <div><span>今日学习闭环</span><h2>按顺序完成：课程 → 工具 → 练习</h2></div>
              <button onClick={() => setView("courses")}>查看全部内容 →</button>
            </div>
            <div className="recommend-grid">
              {library.slice(0, 3).map((item, index) => (
                <button
                  key={item.id}
                  className={`recommend-card ${item.accent ?? "cream"}`}
                  onClick={() => setSelected(item)}
                >
                  <span className="card-step">0{index + 1}</span>
                  <span className="card-visual" style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}>
                    {!item.image && <span className="tool-glyph">▦</span>}
                  </span>
                  <span className="card-content">
                    <span className="card-kind">{index === 0 ? "先学课程" : index === 1 ? "再用工具" : "最后练习"}</span>
                    <strong>{item.title}</strong>
                    <small>{item.summary}</small>
                    <em>{index === 0 ? "继续学习 · 18分钟" : index === 1 ? "打开清单 · 可直接套用" : "开始练习 · 约8分钟"}</em>
                  </span>
                  <span className="card-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {view === "courses" && (
        <div className="page content-page">
          <PageIntro eyebrow="7天业绩倍增突击营" title="从经营认知，到可复制的成交系统" description="七天不是堆知识点，而是完成一次认知、定位、读心、美学、全案、配色与成交的连续训练。" />
          <div className="course-layout">
            <aside className="filter-panel">
              <span>课程体系</span><button className="selected">7天业绩倍增突击营</button><button>全案色彩美学精华班</button><button>助教实战训练</button>
              <span>学习方式</span><button>课程＋工具</button><button>真实案例</button><button>作业与通关</button>
              <div className="course-rule"><strong>通关规则</strong><p>看完不算完成。必须用真实客户、门店或方案完成一次应用。</p></div>
            </aside>
            <div className="course-list">
              {courseItems.map((course) => (
                <button key={course.day} className="course-module" onClick={() => openItem(course.openId)}>
                  <span className="module-day">{course.day}</span>
                  <span className="module-main"><small>课程主题</small><strong>{course.title}</strong><p>{course.action}</p></span>
                  <span className="module-detail"><small>配套工具</small><strong>{course.tool}</strong></span>
                  <span className="module-detail"><small>实战作业</small><strong>{course.practice}</strong></span>
                  <span className="module-pass"><small>通关标准</small><strong>{course.pass}</strong></span>
                  <b className="module-arrow">→</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "path" && (
        <div className="page content-page">
          <PageIntro eyebrow="蓝筱玉整装学堂 · 学员成长10阶梯" title="从“听过课程”走到“改变结果”" description="听过、看懂、会说都不等于真正掌握。十层阶梯用真实动作与结果，帮助学员看清自己现在在哪一层、下一步该练什么。" />
          <div className="path-principle"><strong>成长判断不只问“听懂了吗”</strong><span>改问：能不能讲清逻辑？用了哪个工具？先诊断了什么问题？复盘出了什么规律？最终改变了什么结果？</span></div>
          <div className="path-grid">
            {pathLevels.map((level, index) => (
              <button
                key={level.stage}
                className={index === selectedLevel ? "level-card active" : "level-card"}
                onClick={() => setSelectedLevel(index)}
                aria-pressed={index === selectedLevel}
              >
                <span>{index === selectedLevel ? "查看中" : String(index + 1).padStart(2, "0")}</span>
                <small>{level.stage}</small>
                <strong>{level.title}</strong>
                <p>{level.milestone}</p>
              </button>
            ))}
          </div>
          <section className="level-detail" aria-live="polite">
            <div className="level-detail-heading">
              <span>{pathLevels[selectedLevel].stage} / 10</span>
              <div><small>{pathLevels[selectedLevel].milestone}</small><h2>{pathLevels[selectedLevel].title}</h2></div>
              <div className="level-detail-nav">
                <button disabled={selectedLevel === 0} onClick={() => setSelectedLevel((level) => Math.max(0, level - 1))}>上一层</button>
                <button disabled={selectedLevel === pathLevels.length - 1} onClick={() => setSelectedLevel((level) => Math.min(pathLevels.length - 1, level + 1))}>下一层</button>
              </div>
            </div>
            <div className="level-detail-grid">
              <article><span>01</span><small>能力表现</small><p>{pathLevels[selectedLevel].ability}</p></article>
              <article><span>02</span><small>判断提醒</small><p>{pathLevels[selectedLevel].warning}</p></article>
              <article><span>03</span><small>自检证据</small><p>{pathLevels[selectedLevel].evidence}</p></article>
            </div>
          </section>
        </div>
      )}

      {view === "tools" && (
        <LibraryView
          eyebrow="工具中心"
          title="把知识变成现场可执行动作"
          description="每个工具都写清使用场景、输入资料、执行步骤与判断结果。"
          items={library.filter((item) => item.kind === "工具")}
          onOpen={setSelected}
        />
      )}

      {view === "templates" && (
        <LibraryView
          eyebrow="模板库"
          title="复制的不是文字，是经过验证的推进结构"
          description="按课前诊断、客户沟通、成交跟进和课后复盘分类使用。"
          items={library.filter((item) => item.kind === "模板" || item.kind === "练习")}
          onOpen={setSelected}
        />
      )}

      {selected && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={(event) => event.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
            <span className="drawer-kind">{selected.kind}</span>
            <h2>{selected.title}</h2>
            <p className="drawer-summary">{selected.summary}</p>
            {selected.id === "product-check" ? (
              <div className="store-checklist-preview">
                <div className="store-checklist-tip"><strong>25分制自动计算规则</strong><span>正向能力题：是=1分、否=0分；反向风险题：是=0分、否=1分。分数越高，代表门店越接近顾问式销售。</span></div>
                <div className="store-checklist-scorebar">
                  <div><small>阶段得分</small><strong>{answeredStoreItems ? storeScore : "—"}<em>/25</em></strong></div>
                  <div><small>已完成</small><strong>{answeredStoreItems}<em>/{productCheckItems.length}</em></strong></div>
                  <span>{storeResult ? `当前判断：${storeResult.title}` : `完成全部${productCheckItems.length}题后显示结果`}</span>
                  {answeredStoreItems > 0 && <button type="button" onClick={() => setStoreAnswers({})}>清空重做</button>}
                </div>
                {productCheckSections.map((section, sectionIndex) => {
                  const sectionOffset = productCheckSections.slice(0, sectionIndex).reduce((total, current) => total + current.items.length, 0);
                  return (
                  <section className="store-checklist-section" key={section.title}>
                    <h3>{section.title}</h3>
                    <ol className="store-checklist-items">
                      {section.items.map((item, itemIndex) => {
                        const answerIndex = sectionOffset + itemIndex;
                        const answer = storeAnswers[answerIndex];
                        return (
                          <li key={item.prompt}>
                            <div className="store-checklist-item-copy"><span>{item.prompt}</span><small>计分：是 {item.yesScore} 分 · 否 {item.noScore} 分</small></div>
                            <div className="store-checklist-answer">
                              <button type="button" className={answer === true ? "selected yes" : "yes"} onClick={() => setStoreAnswers((current) => ({ ...current, [answerIndex]: true }))}>是</button>
                              <button type="button" className={answer === false ? "selected no" : "no"} onClick={() => setStoreAnswers((current) => ({ ...current, [answerIndex]: false }))}>否</button>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                    {section.note && <p className="store-checklist-note">{section.note}</p>}
                  </section>
                  );
                })}
                <section className="store-checklist-section">
                  <h3>六、结果判断</h3>
                  {storeResult && <div className="store-checklist-live-result"><strong>你的结果：{storeScore}分 · {storeResult.title}</strong><p>{storeResult.next}</p></div>}
                  <div className="store-checklist-results">
                    {productCheckResults.map((result) => (
                      <article key={result.range}>
                        <strong>{result.range}：{result.title}</strong>
                        <ul>{result.points.map((point) => <li key={point}>{point}</li>)}</ul>
                        <p>{result.next}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="store-checklist-section">
                  <h3>门店升级思考题</h3>
                  <ol className="store-checklist-questions">{productCheckQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
                </section>
                <section className="store-checklist-final">
                  <small>最终判断</small>
                  <p>如果客户离开你的门店后，只记住“你家某某产品多少钱”，说明你还在卖产品。</p>
                  <p>如果客户离开后记住“这家店懂我的需求，能帮我打造适合我的家”，说明你已经开始卖价值。</p>
                </section>
              </div>
            ) : selected.kind === "模板" || selected.kind === "练习" ? (
              <div className="template-preview"><small>模板预览</small><p>{templateText}</p></div>
            ) : (
              <ol className="lesson-steps"><li>先看案例，判断问题</li><li>使用配套工具拆解</li><li>完成一次真实练习</li></ol>
            )}
            <button className="drawer-cta" onClick={selected.kind === "模板" || selected.kind === "练习" ? copyTemplate : () => notify("已加入你的继续学习列表")}>
              {selected.id === "product-check" ? "复制自检表文字" : selected.kind === "模板" || selected.kind === "练习" ? "复制并使用" : "开始学习"} <span>→</span>
            </button>
          </aside>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-intro"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></section>;
}

function LibraryView({ eyebrow, title, description, items, onOpen }: { eyebrow: string; title: string; description: string; items: LibraryItem[]; onOpen: (item: LibraryItem) => void }) {
  return (
    <div className="page content-page">
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="library-grid">
        {items.map((item, index) => (
          <button key={item.id} className="library-card" onClick={() => onOpen(item)}>
            <span className="library-index">{String(index + 1).padStart(2, "0")}</span>
            <span className={`library-icon ${item.accent ?? "cream"}`}>{item.kind === "模板" ? "◇" : item.kind === "练习" ? "✦" : "▦"}</span>
            <small>{item.kind}</small><strong>{item.title}</strong><p>{item.summary}</p><em>{item.meta}</em><b>→</b>
          </button>
        ))}
      </div>
    </div>
  );
}
