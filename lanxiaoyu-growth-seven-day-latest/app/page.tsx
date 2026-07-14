"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

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
  courseId?: string;
  courseIds?: string[];
};

type ProductCheckItem = {
  prompt: string;
  yesScore: number;
  noScore: number;
};

type CustomerIdentityOption = {
  score: 1 | 3 | 5;
  label: string;
};

type CustomerIdentityDimension = {
  name: string;
  options: CustomerIdentityOption[];
};

type CustomerIdentityTier = {
  minScore: number;
  maxScore: number;
  code: "S" | "A" | "B" | "C" | "D";
  title: string;
  focus: string;
  action: string;
  caution: string;
};

type AestheticDimension = {
  name: string;
  weight: number;
  core: string;
  judgment: string;
};

type AuthMethod = "email" | "phone-password" | "phone-otp";

type ResponseTechnique = {
  index: number;
  name: string;
  english: string;
  concept: string;
  insight: string;
  example?: string;
  effect?: string;
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
    courseId: "growth-day-1",
  },
  {
    id: "value",
    kind: "工具",
    title: "整装方案价值表达清单",
    summary: "把尺寸、配色、预算和落地风险，翻译成客户听得懂的购买理由。",
    meta: "可直接套用 · 6项检查",
    accent: "green",
    tags: ["价值", "表达", "方案", "工具"],
    courseId: "growth-day-1",
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
    courseId: "growth-day-7",
  },
  {
    id: "aesthetic",
    kind: "工具",
    title: "蓝筱玉美学体系打分表",
    summary: "按主题、色彩、比例、层次、纵深、平衡、质感、呼应和记忆点，严格客观完成100分评估。",
    meta: "9个维度 · 100分严格评分",
    accent: "green",
    tags: ["美学", "打分", "空间", "100分", "严格评分", "工具"],
    courseId: "aesthetic-day-4",
  },
  {
    id: "color-strip",
    kind: "工具",
    title: "PCCS色彩条应用工具",
    summary: "用色彩条辅助判断配色关系和沟通偏好，结论仍需结合现场行为验证。",
    meta: "配色判断 · 现场辅助",
    accent: "rose",
    tags: ["PCCS", "色彩条", "配色", "工具"],
    courseId: "aesthetic-day-4",
  },
  {
    id: "55387",
    kind: "工具",
    title: "55387方案预判工具",
    summary: "在方案进入深化前，提前发现比例、色彩与落地风险。",
    meta: "方案前置检查",
    accent: "cream",
    tags: ["55387", "方案", "预判", "工具"],
    courseIds: ["growth-day-3", "aesthetic-day-3"],
  },
  {
    id: "store-diagnosis",
    kind: "工具",
    title: "3分钟门店增长诊断",
    summary: "区分获客、信任、表达和成交断点，找到门店真正卡住的位置。",
    meta: "助教与老板适用",
    accent: "green",
    tags: ["门店", "增长", "诊断", "工具"],
    courseId: "growth-day-2",
  },
  {
    id: "two-axis",
    kind: "工具",
    title: "8大回应术",
    summary: "从客户原话出发，选择重定义、上推、下切等回应方法，先理解再推进下一步。",
    meta: "8种回应方法 · 18类实战场景",
    accent: "green",
    tags: ["8大回应术", "回应术", "异议", "销讲", "实战", "工具"],
    courseId: "growth-day-7",
  },
  {
    id: "customer-segment",
    kind: "工具",
    title: "客户身份分层转化表",
    summary: "从项目真实性、决策权、装修时间、预算清晰度和行动意愿，判断客户身份与下一步转化动作。",
    meta: "5项判断 · 25分自动分层",
    accent: "cream",
    tags: ["客户身份", "分层", "转化", "25分", "业主", "工具"],
    courseId: "growth-day-3",
  },
  {
    id: "product-check",
    kind: "模板",
    title: "门店是否还在卖产品自检表",
    summary: "从进店、沟通、方案、成交和团队五个阶段，判断门店是在卖产品，还是在卖解决方案。",
    meta: "5个阶段 · 25分自动分层",
    accent: "cream",
    tags: ["门店", "卖产品", "解决方案", "顾问式销售", "30分", "自检", "模板"],
    courseId: "growth-day-1",
  },
  {
    id: "quote-check",
    kind: "模板",
    title: "报价前五项检查表",
    summary: "报价前确认价值是否讲清、信任是否建立、决策条件是否成熟。",
    meta: "可复制 · SOP",
    accent: "cream",
    tags: ["报价", "成交", "检查", "模板"],
    courseId: "growth-day-7",
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
    courseId: "growth-day-7",
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

const requiredCourseIds = (item: LibraryItem) => item.courseIds ?? (item.courseId ? [item.courseId] : []);

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
  { id: "growth-day-1", day: "DAY 1", title: "认知重建｜从卖产品到卖整体解决方案", action: "看见客户真正购买的是美而走心的整体生活结果，而不是孤立产品", tool: "《门店是否还在卖产品自检表》＋心道术器认知框架", practice: "完成门店进店、沟通、方案、成交、团队五阶段自检；选一个真实产品，把参数表达改写成一段整体空间价值表达", pass: "能说清客户为什么不只为产品买单，明确门店当前最主要的经营卡点，并提出一个从卖产品转向卖整体方案的可执行动作", openId: "product-check" },
  { id: "growth-day-2", day: "DAY 2", title: "模式突围｜找到业绩倍增快车道", action: "结合品类、城市、资源、团队与资金，选择适合自己的转型路径", tool: "门店模式四路径定位表＋3分钟门店增长诊断", practice: "在“全案思维卖单品、小全案轻资产、大全案整体解决、整装全能”四条路径中完成定位，写出当前最缺的能力和未来30天第一步动作", pass: "能用现状证据说明为什么选择这条路径，讲清资源与能力差距，并确定一个不盲目扩张、可以马上执行的破局动作", openId: "store-diagnosis" },
  { id: "growth-day-3", day: "DAY 3", title: "客户读心术｜别急着卖，先看懂人", action: "从客户原话、行为与决策方式识别性格、接待、需求和价值排序", tool: "小蓝飞镖法4大十字坐标＋55387客户预判＋客户身份分层转化表", practice: "选一个最近未成交客户，记录原话和行为，完成考拉、孔雀、老虎、猫头鹰的初步判断，写出适配接待方式、三条追问和价值排序", pass: "不把坐标当人格标签，能用观察证据判断沟通入口，明确客户真正关注的效果、服务、质量或价格，并给出下一步话术", openId: "customer-segment" },
  { id: "growth-day-4", day: "DAY 4", title: "美 × 走心｜把感觉变成专业判断", action: "用色、形、质和PCCS色彩体系解释空间为什么高级、和谐或翻车", tool: "蓝筱玉美学体系打分表＋PCCS色彩条＋色形质十字坐标", practice: "找一张“好看但说不清原因”的空间图，完成色、形、质、光拆解，定位色彩印象并写出客户可能喜欢的感觉", pass: "能从色相、明度、纯度、造型、图案、材质和光泽说明空间问题，不再只凭感觉搭配，并给出一条可验证的优化建议", openId: "aesthetic" },
  { id: "growth-day-5", day: "DAY 5", title: "流程成交｜用6大要素打造接待路径", action: "把AIDMA触点和全案设计6大要素转成可复制、可训练的门店流程", tool: "AIDMA法则＋全案设计6大要素（人、感觉、功能、经济、建筑、环境）", practice: "围绕6大要素各写3—5条真实问题或话术，设计一次从吸引注意到购买行动的接待流程，并让团队演练一轮", pass: "能用AIDMA组织注意、兴趣、欲望、记忆和行动；能通过6大要素问出客户真实顾虑，不再依赖临场发挥", openId: "case-library" },
  { id: "growth-day-6", day: "DAY 6", title: "高手进阶｜从配色翻车到高级出彩", action: "用距离、纯度、比例、主次和关系控制配色，让空间稳定出彩", tool: "PCCS色球＋配色翻车三件套（狗屁法则）＋美搭法则＋恋爱式搭配法则", practice: "拿一张配色翻车的空间图，找出“颜色太远太艳、比例接近1:1、缺少中间过渡”三个问题，再按色彩距离、主次、中间色以及年龄/性格/见识共鸣完成重配", pass: "能判断配色翻车的具体原因，讲清和谐与张力的关系，并用主次、纯度、比例和过渡做出一版客户听得懂的高级配色方案", openId: "aesthetic" },
  { id: "growth-day-7", day: "DAY 7", title: "硬核系统｜精准销售7步法", action: "把前6天的全案、美学、客户、流程和配色收束成可复制的成交路径", tool: "精准销售7步法＋客户6大要素＋可视化证据链清单", practice: "选一个最近未成交客户，按建立信赖、找痛点、撕痛点、提供解决方案、塑造梦想、提供证据、成交七步逐项复盘，写出当前卡点和下一步推进话术", pass: "能明确客户卡在第几步，不靠降价逼单；能用专业、需求、方案、梦想和证据组成一条完整推进链，并让客户自然进入下一步", openId: "two-axis" },
];

// “精华班课后打卡 7+3”属于全案色彩美学精华班，不属于7天业绩倍增突击营。
// 两套课程使用独立的 growth-day-* 与 aesthetic-day-* 权限 ID，避免课程权限串线。
const aestheticCourseItems = [
  { id: "aesthetic-day-1", day: "DAY 1", title: "经营认知", action: "看懂行业趋势，从卖产品升级为卖确定性", tool: "《门店是否还在卖产品自检表》＋经营模式选择清单", practice: "盘点自己的门店模式，选一个真实客户，写出从卖产品到卖确定性的转型动作，并画出一次销售七步法路径", pass: "能说清行业为什么变、客户为什么不只比价格，并明确门店下一阶段的经营模式和一个可执行动作", openId: "product-check" },
  { id: "aesthetic-day-2", day: "DAY 2", title: "审美判断", action: "把“感觉”翻译成主题、色、形、质与比例", tool: "蓝筱玉美学体系打分表＋PCCS色彩条＋十字坐标工具", practice: "选一张真实空间图，完成印象坐标、主题定位、色形质拆解、比例判断和一次 AI 优化", pass: "能用工具客观说明空间哪里好、为什么好、如何优化，并达到课程要求的坐标判断准确度", openId: "aesthetic" },
  { id: "aesthetic-day-3", day: "DAY 3", title: "诊断成交", action: "从客户原话识别决策人、客户类型、生活痛点与成交路径", tool: "55387客户预判＋客户身份分层转化表＋销售七步法", practice: "拿一个真实客户完成信息记录、六大要素诊断和四型客户判断，写出三条追问、适配表达和下一步推进动作", pass: "不凭主观判断，能明确决策人和使用人，判断客户类型，围绕六大要素给出有证据的方案与下一步", openId: "customer-segment" },
  { id: "aesthetic-day-4", day: "DAY 4", title: "色彩沟通与成交", action: "用色彩四区理解沟通需要，把八大谈单痛点转成诊断式回应", tool: "色彩四区交集图＋六大要素＋8大回应术", practice: "选一个真实客户，完成一次色彩沟通假设、一个谈单痛点回应和下一步推进，并把结果沉淀为可发布的案例内容", pass: "能说明四大色彩区的特点与交集，知道色彩只是沟通假设而非人格定论；能用六大要素回应客户痛点，完成从内容引流到诊断、局部方案和下一步推进", openId: "aesthetic" },
];

const aftercareDays = [
  { day: 1, phase: "专业知识点", title: "色彩基础知识", focus: "色环形成、四大区、PCCS色彩密码", assignment: "画色环和色调图，并解释12色环到10色环的成因、四大区和PCCS数字含义。", checkin: "录视频，一边画一边说；有条件可拿色卡讲解。" },
  { day: 2, phase: "专业知识点", title: "色彩家族心理印象", focus: "10个色彩家族与无彩色的正反面意义", assignment: "选择一个色彩家族，讲清它的心理印象、正面意义和负面意义。", checkin: "录视频指着颜色讲解，视频较长可分段发送。" },
  { day: 3, phase: "专业知识点", title: "12色调色彩人生", focus: "用生活图片和事件表达色调的人生阶段", assignment: "结合图片或真实事件，对每一个色调代表的人生阶段进行解说。", checkin: "参考课本第19页录视频讲解，可插入辅助图片。" },
  { day: 4, phase: "专业知识点", title: "四大区性格特点", focus: "正反性格、生活案例与沟通方式", assignment: "从正反两个方面解释四大区性格，并举例说明如何扬长避短、有效沟通。", checkin: "参考课本第12页录视频表达。" },
  { day: 5, phase: "专业知识点", title: "三个比例与三种法则", focus: "五感比例、色形质比例、空间色彩规划比例", assignment: "画出三个比例圆盘，并选择一个法则举例说明在工作中的应用。", checkin: "一边画比例圆盘一边讲，完成至少一个法则的案例表达。" },
  { day: 6, phase: "专业知识点", title: "小蓝飞镖与十字坐标", focus: "色形质光、性格接待价值与消费时代坐标", assignment: "把色形质光和形容词放入十字坐标，并描述性格接待价值排序和消费时代特点。", checkin: "录视频边画边讲，也可以选择一个动物性格进行详细说明。" },
  { day: 7, phase: "专业知识点", title: "分色与蓝氏表达法", focus: "男性色、女性色、自然色与同学色彩条表达", assignment: "为130个颜色分色，任选3位同学的色彩条做坐标表达，并用蓝氏表达法说明其喜欢的感觉。", checkin: "录视频边分色边表达；有条件可进行扔色卡。" },
  { day: 8, phase: "综合练习", title: "美图拆解练习一", focus: "综合运用四步骤拆解一张美图", assignment: "根据助教提供的美图，完成一次完整拆解和讲解。", checkin: "录视频发送到群里，打卡后查看助教参考答案。" },
  { day: 9, phase: "综合练习", title: "美图拆解练习二", focus: "提升观察、判断与表达的准确度", assignment: "换一张新美图，再按四步骤完成独立分析，重点说明判断依据。", checkin: "录视频发送到群里，对照参考答案修正表达。" },
  { day: 10, phase: "综合练习", title: "美图拆解练习三", focus: "完成一次可复用的专业表达", assignment: "完成第三张美图拆解，形成自己的观察顺序、表达结构和复盘记录。", checkin: "录视频发送到群里；疑问由研发老师和助教在群内答疑。" },
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

const customerIdentityDimensions: CustomerIdentityDimension[] = [
  {
    name: "项目真实性",
    options: [
      { score: 1, label: "没有具体房子，只是随便看看" },
      { score: 3, label: "已经买房，但小区、面积或户型信息不完整" },
      { score: 5, label: "房屋、小区、面积、户型等信息明确" },
    ],
  },
  {
    name: "决策权",
    options: [
      { score: 1, label: "只是代看、代问或帮忙询价" },
      { score: 3, label: "能参与意见，但不能最终决定" },
      { score: 5, label: "本人是主要决策人或主要出资人" },
    ],
  },
  {
    name: "装修时间",
    options: [
      { score: 1, label: "一年以上，没有明确装修时间" },
      { score: 3, label: "计划在3—12个月内装修" },
      { score: 5, label: "3个月内启动，或已经进入装修阶段" },
    ],
  },
  {
    name: "预算清晰度",
    options: [
      { score: 1, label: "不愿谈预算，只问最低价格" },
      { score: 3, label: "有大致预算范围" },
      { score: 5, label: "预算明确，并关注如何合理分配" },
    ],
  },
  {
    name: "行动意愿",
    options: [
      { score: 1, label: "只拿资料，不愿进一步沟通" },
      { score: 3, label: "愿意持续了解、比较和沟通" },
      { score: 5, label: "愿意到店、量房、带家人沟通或确认方案" },
    ],
  },
];

const customerIdentityTiers: CustomerIdentityTier[] = [
  {
    minScore: 22,
    maxScore: 25,
    code: "S",
    title: "核心决策业主",
    focus: "尽快推进具体行动",
    action: "24小时内推动到店、量房、方案沟通或收定。",
    caution: "不要只讲产品、反复报价，要深挖家庭需求、预算、决策标准和时间节点。",
  },
  {
    minScore: 18,
    maxScore: 21,
    code: "A",
    title: "共同决策业主",
    focus: "补齐决策人、预算或时间信息",
    action: "邀请关键决策人共同沟通，确认下一步时间。",
    caution: "不要只服务眼前这一个人，要尽快连接背后的关键家庭成员。",
  },
  {
    minScore: 13,
    maxScore: 17,
    code: "B",
    title: "信息收集业主",
    focus: "建立选择标准和专业信赖",
    action: "用案例、诊断和专业建议替代直接报价，帮助客户明确判断标准。",
    caution: "不要大量发图片、发报价单，把客户推入单纯比价。",
  },
  {
    minScore: 8,
    maxScore: 12,
    code: "C",
    title: "潜在业主",
    focus: "按装修节点持续培育",
    action: "记录交房时间和关注重点，分阶段发送有价值的内容。",
    caution: "不要高频催单，要根据项目节点安排跟进节奏。",
  },
  {
    minScore: 5,
    maxScore: 7,
    code: "D",
    title: "非直接业主",
    focus: "判断真实价值",
    action: "确认背后是否存在真实业主；有合作或转介绍价值则保留，否则降低优先级。",
    caution: "不要把所有咨询者都当成直接成交客户，先确认身份、目的和决策关系。",
  },
];

const customerIdentityQuestions = [
  ["判断真实居住人", "这套房子是您自己住，还是帮家里人提前了解？"],
  ["判断项目进度", "房子现在是在等交房、做设计，还是已经开始施工了？"],
  ["判断主要决策人", "家里装修这件事，目前主要由谁来做决定？"],
  ["判断共同决策关系", "除了您之外，还有哪位家人需要一起确认方案？"],
  ["判断装修时间", "大概计划什么时候开始选产品或者正式装修？"],
  ["判断核心关注点", "您目前更关注整体效果、预算控制、环保、收纳，还是后期落地省心？"],
] as const;

const aestheticDimensions: AestheticDimension[] = [
  { name: "主题统一", weight: 15, core: "空间是否有明确主题和统一气质", judgment: "一眼能看出是优雅、温馨、高级、自然、时尚，家具、墙面、灯具、窗帘、软装像一套方案" },
  { name: "色彩比例", weight: 20, core: "基础色70%、主题色25%、点缀色5%是否合理", judgment: "大面积颜色稳定舒服，主题色有记忆点，点缀色少而精，不花乱、不廉价" },
  { name: "空间比例", weight: 15, core: "家具尺度、留白、动线是否舒服", judgment: "沙发、床、茶几、地毯、装饰画、灯具大小合适，空间不挤、不空、不压抑" },
  { name: "上中下层次", weight: 12, core: "顶面、墙面、地面是否完整协调", judgment: "吊顶有精致感，墙面有气质，地面能托住空间，不头重脚轻" },
  { name: "前中后纵深", weight: 12, core: "空间是否有画面层次和景深", judgment: "前景有精致物，中景有生活主体，背景有完整设计，画面不扁平" },
  { name: "左中右平衡", weight: 10, core: "左右视觉重量是否平衡", judgment: "不一定完全对称，但两边高度、颜色、体量、装饰感受舒服，不偏、不歪、不失重" },
  { name: "材质与质感", weight: 8, core: "材质是否真实、高级、有层次", judgment: "木、布、皮、石、金属、玻璃之间有对比，哑光、柔光、细腻感协调" },
  { name: "细节呼应", weight: 5, core: "色彩、线条、材质、造型是否有连接", judgment: "灯具、画框、五金、抱枕、花艺、地毯之间有呼应，不是孤立存在" },
  { name: "记忆点", weight: 3, core: "空间是否有一个让人记住的亮点", judgment: "有一个主角：背景墙、沙发、床头、吊灯、装饰画、窗帘或色彩组合" },
];

const responseTechniques: ResponseTechnique[] = [
  {
    index: 1,
    name: "重定义",
    english: "Reframing",
    concept: "给同一个行为或事件赋予不同的意义，从而改变其情绪色彩和价值判断。意义不是固定的，取决于背景框架。",
    insight: "重定义不是自欺欺人，而是提供另一种真实的视角，让对方看到更多可能性。",
  },
  {
    index: 2,
    name: "另一个结果",
    english: "Another Outcome",
    concept: "指出当前行为或信息，除了带来对方预期的结果外，还会带来另一个不想要的后果，或者把注意力引向一个更重要的结果。",
    insight: "不要否定对方的原结果，而是温和地并列出另一个结果，让他自己权衡。",
  },
  {
    index: 3,
    name: "上推",
    english: "Chunking Up",
    concept: "从具体的、细节的行为或事物，上升到更抽象、更广义的类别、价值或意图。",
    insight: "上推要找到对方真正在乎的价值词（如安全、尊重、自由、效率），而不是随意上推。",
    example: "红色椅子 → 家具 → 居住舒适 → 安全感",
  },
  {
    index: 4,
    name: "下切",
    english: "Chunking Down",
    concept: "从抽象的、概括的表达，下移到具体的细节、例子、可感知的操作步骤。",
    insight: "下切后的细节越生动、越贴近对方的感官经验，效果越好。",
    example: "“他不尊重我” → “他具体做了什么？”",
  },
  {
    index: 5,
    name: "反例",
    english: "Counter Example",
    concept: "找出不符合对方概括的一个或几个实例，从而打破绝对化的信念（如“总是”“从不”“所有”）。",
    insight: "反例必须是真实的、对方承认的。如果没有现成反例，可以问“假如有……你会怎么想？”",
  },
  {
    index: 6,
    name: "比喻",
    english: "Metaphor / Analogy",
    concept: "用一个类似结构的故事、场景或类比来间接说明道理，绕过对方的意识防御。",
    insight: "比喻要贴切，不能牵强；最好用对方熟悉的领域。",
  },
  {
    index: 7,
    name: "现实检验",
    english: "Reality Check",
    concept: "要求对方用事实证据来验证他的信念，而不是停留在想象或假设中。类似于元模型中的“失当表现”和“心智阅读”。",
    insight: "语气要平和，不是审问，而是“我们一起看看事实是怎样的”。",
    effect: "戳破虚假假设：很多信念经不起事实推敲；迫使对方具体化：把模糊的恐惧变成可检验的命题。",
  },
  {
    index: 8,
    name: "价值重新排序",
    english: "Value Evaluation",
    concept: "质疑或重新评估对方判断所依据的价值观本身，而不是事件。比如：“完美真的那么重要吗？”“省钱是你装修最高的追求吗？”",
    insight: "价值重评要小心，不要否定对方的核心价值观，而是引导他看到价值的另一面或局限性。",
  },
];

const responseScenarios = [
  "为什么这么贵",
  "同样的东西为什么这么贵",
  "给我最低价",
  "预算就这么多",
  "你们为什么要这么多钱",
  "网上便宜很多",
  "大品牌更放心",
  "看实地效果",
  "看图片心里没底",
  "实际效果差谁负责",
  "怕增项",
  "环保怎么证明",
  "收设计费",
  "先量房",
  "没交房，多对比",
  "做不了主",
  "随便逛逛",
  "微信先报价",
];

const buildResponseDraft = (technique: ResponseTechnique, objection: string) => {
  const source = objection.trim() || "客户当前的顾虑";
  const drafts: Record<number, { response: string; question: string }> = {
    1: {
      response: `我理解你现在在意的是“${source}”。我们可以换个角度看：这里不只是比较一项价格，而是一起确认这套方案能不能把整体效果、落地过程和后续省心都考虑进去。`,
      question: "对你来说，效果、预算控制和落地省心，哪一项最需要先确认？",
    },
    2: {
      response: `预算先压低，确实可能减少当下支出；同时也需要一起确认，是否会带来后续搭配、落地或增项的不确定性。我们把两个结果都摆出来，再看哪个更符合你的优先级。`,
      question: "你更希望先降低当下支出，还是把后期返工和落地风险控制住？",
    },
    3: {
      response: `我听到你在问“${source}”，背后可能不只是一个价格数字，还关系到你想要的居住舒适、安全感和整体效果。我们先确认你最想守住的价值是什么。`,
      question: "如果价格之外只能优先保留一项，你最在意哪一项？",
    },
    4: {
      response: `你提到“${source}”，我们先不急着下结论。具体是哪个环节、哪一项材料或哪一个交付节点让你担心？把它拆开后，我们才能准确比较。`,
      question: "你最担心的是价格、材质、效果，还是施工落地的哪一步？",
    },
    5: {
      response: `你说“${source}”，我们可以先找一个真实例子核对一下：有没有出现过与这个判断不同的情况？如果有，差别发生在哪个条件？`,
      question: "你愿意拿一个真实案例或反例一起对照吗？",
    },
    6: {
      response: `如果把装修比作一套长期使用的系统，单看一个部件的价格，就像只看车轮的价格；真正要看的是整体匹配，以及最后能不能稳定使用。我们可以用你熟悉的例子一起对照。`,
      question: "除了单项价格，你希望用哪一个熟悉的标准来比较整体方案？",
    },
    7: {
      response: `你提到“${source}”，我们一起把它变成可验证的问题：具体担心哪一项？目前有什么事实、案例或合同条款可以核对？先把假设变成事实，再决定下一步。`,
      question: "我们先核对哪一条事实或哪一项交付约定？",
    },
    8: {
      response: `我理解你把“${source}”放在前面。我们不否定这个标准，只是一起确认：除了它，你还希望同时守住什么？如果只追求单一标准，可能会牺牲哪些结果？`,
      question: "在预算、效果、环保和落地省心之间，你会怎么排序？",
    },
  };
  return drafts[technique.index];
};

const templateText = `姐，我注意到你现在真正卡住的，不是没有学过方法，而是还没有把方法练成客户听得懂的表达。\n\n我们先不急着谈课程。你把最近一次最难推进的客户情况发给我，我先帮你判断：问题出在需求没问透、价值没讲清，还是下一步没有推动。`;

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [storeAnswers, setStoreAnswers] = useState<Record<number, boolean>>({});
  const [customerAnswers, setCustomerAnswers] = useState<Record<number, 1 | 3 | 5>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerCoreConcern, setCustomerCoreConcern] = useState("");
  const [aestheticScores, setAestheticScores] = useState<Record<number, number>>({});
  const [aestheticNotes, setAestheticNotes] = useState<Record<number, string>>({});
  const [aestheticSuggestions, setAestheticSuggestions] = useState<Record<number, string>>({});
  const [aestheticProject, setAestheticProject] = useState("");
  const [aestheticEvaluator, setAestheticEvaluator] = useState("");
  const [responseTechniqueIndex, setResponseTechniqueIndex] = useState(0);
  const [responseScenario, setResponseScenario] = useState(responseScenarios[0]);
  const [responseObjection, setResponseObjection] = useState("");
  const [taskDone, setTaskDone] = useState(false);
  const [toast, setToast] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [courseAccessIds, setCourseAccessIds] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [selectedCourseTrack, setSelectedCourseTrack] = useState<"growth" | "aesthetic">("growth");
  const [aftercareOpen, setAftercareOpen] = useState(false);
  const [aftercareDay, setAftercareDay] = useState(0);
  const [aftercareDone, setAftercareDone] = useState<Record<number, boolean>>({});
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const authConfigured = Boolean(supabase);

  const loadAccess = useCallback(async () => {
    if (!supabase) {
      setCourseAccessIds([]);
      return;
    }

    try {
      const response = await fetch("/api/access", { cache: "no-store" });
      if (!response.ok) {
        setCourseAccessIds([]);
        return;
      }
      const payload = await response.json() as { courseIds?: string[] };
      setCourseAccessIds(payload.courseIds ?? []);
    } catch {
      setCourseAccessIds([]);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setAuthUser(data.user);
      void loadAccess();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      void loadAccess();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadAccess, supabase]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return library
      .filter((item) => {
        const requiredIds = requiredCourseIds(item);
        return requiredIds.length === 0 || Boolean(authUser && requiredIds.some((courseId) => courseAccessIds.includes(courseId)));
      })
      .filter((item) =>
        [item.title, item.summary, item.kind, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      );
  }, [authUser, courseAccessIds, query]);

  const answeredStoreItems = Object.keys(storeAnswers).length;
  const storeScore = productCheckItems.reduce((total, item, index) => {
    const answer = storeAnswers[index];
    if (answer === undefined) return total;
    return total + (answer ? item.yesScore : item.noScore);
  }, 0);
  const storeResult = answeredStoreItems === productCheckItems.length
    ? productCheckResults.find((result) => storeScore >= result.minScore && storeScore <= result.maxScore)
    : null;
  const answeredCustomerItems = Object.keys(customerAnswers).length;
  const customerScore = customerIdentityDimensions.reduce((total, _dimension, index) => total + (customerAnswers[index] ?? 0), 0);
  const customerResult = answeredCustomerItems === customerIdentityDimensions.length
    ? customerIdentityTiers.find((tier) => customerScore >= tier.minScore && customerScore <= tier.maxScore)
    : null;
  const answeredAestheticItems = Object.keys(aestheticScores).length;
  const aestheticScore = aestheticDimensions.reduce((total, dimension, index) => total + Math.min(dimension.weight, Math.max(0, aestheticScores[index] ?? 0)), 0);
  const aestheticWeakest = answeredAestheticItems === aestheticDimensions.length
    ? [...aestheticDimensions].sort((left, right) => {
      const leftIndex = aestheticDimensions.indexOf(left);
      const rightIndex = aestheticDimensions.indexOf(right);
      return ((aestheticScores[leftIndex] ?? 0) / left.weight) - ((aestheticScores[rightIndex] ?? 0) / right.weight);
    }).slice(0, 3)
    : [];
  const selectedResponseTechnique = responseTechniques[responseTechniqueIndex];
  const responseDraft = buildResponseDraft(selectedResponseTechnique, responseObjection || responseScenario);
  const aftercareCompleted = Object.values(aftercareDone).filter(Boolean).length;
  const selectedAftercareDay = aftercareDays[aftercareDay];
  const visibleCourseItems = selectedCourseTrack === "aesthetic" ? aestheticCourseItems : courseItems;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const updateAestheticScore = (index: number, rawValue: string) => {
    setAestheticScores((current) => {
      const next = { ...current };
      if (rawValue === "") {
        delete next[index];
        return next;
      }
      const value = Number(rawValue);
      if (!Number.isFinite(value)) return next;
      next[index] = Math.min(aestheticDimensions[index].weight, Math.max(0, Math.round(value)));
      return next;
    });
  };

  const normalizePhone = (value: string) => {
    const compact = value.trim().replace(/[()\s-]/g, "");
    if (/^1\d{10}$/.test(compact)) return `+86${compact}`;
    return compact;
  };

  const finishAuth = async (user: User | null, successMessage: string) => {
    if (!user) {
      setAuthMessage("验证成功，但登录会话尚未建立，请重新登录。");
      return;
    }
    setAuthUser(user);
    await loadAccess();
    setAuthOpen(false);
    setAuthOtpSent(false);
    setAuthOtp("");
    notify(successMessage);
  };

  const openAuth = (mode: "login" | "signup" | "forgot" = "login", message = "") => {
    setAuthMode(mode);
    setAuthMethod("email");
    setAuthOtpSent(false);
    setAuthOtp("");
    setAuthMessage(message);
    setAuthOpen(true);
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setAuthMessage("Supabase 尚未配置，请先在 Vercel 添加环境变量。");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });
        if (error) throw error;
        setAuthMessage("重置密码邮件已发送，请检查邮箱。");
        return;
      }

      if (authMode === "signup" && !authName.trim()) {
        throw new Error("请输入姓名，姓名为必填项。");
      }

      const phone = normalizePhone(authPhone);
      const phoneRequired = authMethod === "phone-password" || authMethod === "phone-otp";
      if (phoneRequired && !/^\+[1-9]\d{7,14}$/.test(phone)) {
        throw new Error("请输入完整手机号，例如 +8613800138000。");
      }

      if (authMethod === "email") {
        if (authMode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
            options: { data: { display_name: authName.trim() } },
          });
          if (error) throw error;
          if (data.session?.user) {
            await finishAuth(data.session.user, "注册并登录成功");
          } else {
            setAuthMessage("注册成功，请检查邮箱并完成验证，再登录。");
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          if (error) throw error;
          await finishAuth(data.user, "登录成功");
        }
        return;
      }

      if (authMode === "signup" && authMethod === "phone-password" && !authOtpSent) {
        const { data, error } = await supabase.auth.signUp({
          phone,
          password: authPassword,
          options: { channel: "sms", data: { display_name: authName.trim() } },
        });
        if (error) throw error;
        if (data.session?.user) {
          await finishAuth(data.session.user, "注册并登录成功");
        } else {
          setAuthOtpSent(true);
          setAuthMessage("验证码已发送到手机号，请输入6位验证码完成注册。");
        }
        return;
      }

      if (authMethod === "phone-otp" && !authOtpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            channel: "sms",
            shouldCreateUser: authMode === "signup",
            data: authMode === "signup" ? { display_name: authName.trim() } : undefined,
          },
        });
        if (error) throw error;
        setAuthOtpSent(true);
        setAuthMessage("验证码已发送，请输入6位验证码。");
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: authOtp.trim(),
        type: "sms",
      });
      if (error) throw error;
      await finishAuth(data.user, authMode === "signup" ? "手机号注册成功" : "手机号登录成功");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "操作失败，请稍后重试。");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthUser(null);
    setCourseAccessIds([]);
    setSelected(null);
    notify("已退出登录");
  };

  const downloadCourseFile = async (courseId: string) => {
    if (!authUser) {
      openAuth("login", "请先登录，再下载课程资料。");
      return;
    }
    if (!courseAccessIds.includes(courseId)) {
      notify("当前账号暂无该课程资料权限");
      return;
    }

    try {
      const response = await fetch(`/api/download/${encodeURIComponent(courseId)}`);
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        notify(payload.error || "下载链接生成失败");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      notify("下载服务暂时不可用");
    }
  };

  const copyTemplate = async () => {
    try {
      if (selected?.id === "product-check") {
        await navigator.clipboard.writeText(productCheckText);
        notify("自检表文字已复制");
      } else if (selected?.id === "customer-segment") {
        const resultText = customerResult
          ? `门店客户身份分层诊断\n客户：${customerName || "未填写"}\n联系方式：${customerContact || "未填写"}\n核心关注：${customerCoreConcern || "未填写"}\n\n总分：${customerScore}/25\n客户层级：${customerResult.code}级·${customerResult.title}\n跟进重点：${customerResult.focus}\n建议动作：${customerResult.action}\n注意：${customerResult.caution}`
          : `门店客户身份分层判断\n已完成：${answeredCustomerItems}/5项\n当前分数：${customerScore}/25\n请完成五项判断后，再确定客户层级和下一步动作。`;
        await navigator.clipboard.writeText(resultText);
        notify(customerResult ? "诊断结果已复制" : "当前诊断进度已复制");
      } else if (selected?.id === "aesthetic") {
        const scoreLines = aestheticDimensions.map((dimension, index) => `${index + 1}. ${dimension.name}：${aestheticScores[index] ?? "未评分"}/${dimension.weight}分\n问题记录：${aestheticNotes[index] || "未填写"}\n优化建议：${aestheticSuggestions[index] || "未填写"}`).join("\n\n");
        const resultText = `蓝筱玉美学体系打分表\n项目：${aestheticProject || "未填写"}\n评估人：${aestheticEvaluator || "未填写"}\n\n总分：${aestheticScore}/100\n已完成：${answeredAestheticItems}/${aestheticDimensions.length}项\n\n${scoreLines}${aestheticWeakest.length ? `\n\n优先优化：${aestheticWeakest.map((dimension) => dimension.name).join("、")}` : ""}`;
        await navigator.clipboard.writeText(resultText);
        notify("美学评分结果已复制");
      } else if (selected?.id === "two-axis") {
        const technique = selectedResponseTechnique;
        const resultText = `8大回应术｜${technique.index}. ${technique.name}（${technique.english}）\n实战场景：${responseScenario}\n客户原话：${responseObjection || "未填写"}\n\n生成的回应：\n${responseDraft.response}\n\n下一步追问：\n${responseDraft.question}\n\n概念：${technique.concept}\n关键认知：${technique.insight}${technique.example ? `\n资料示例：${technique.example}` : ""}${technique.effect ? `\n作用：${technique.effect}` : ""}`;
        await navigator.clipboard.writeText(resultText);
        notify("生成的回应术已复制");
      } else {
        await navigator.clipboard.writeText(templateText);
        notify("模板已复制，可直接修改使用");
      }
    } catch {
      notify("复制未成功，请在预览中手动选择文字");
    }
  };

  const openItem = (entry: string | LibraryItem) => {
    const item = typeof entry === "string" ? library.find((candidate) => candidate.id === entry) : entry;
    if (!item) return;
    const requiredIds = requiredCourseIds(item);
    if (requiredIds.length > 0 && !authUser) {
      openAuth("login", "请先登录，登录后系统会按课程权限显示资料。");
      return;
    }
    if (requiredIds.length > 0 && !requiredIds.some((courseId) => courseAccessIds.includes(courseId))) {
      notify("当前账号暂无该课程权限");
      return;
    }
    setSelected(item);
  };

  const openCourse = (course: (typeof courseItems)[number]) => {
    if (!authUser) {
      openAuth("login", "请先登录，登录后系统会显示你已开通的课程。");
      return;
    }
    if (!courseAccessIds.includes(course.id)) {
      notify("当前账号暂无该课程权限");
      return;
    }
    openItem(course.openId);
  };

  const selectedDownloadCourseId = selected ? requiredCourseIds(selected).find((courseId) => courseAccessIds.includes(courseId)) : undefined;

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
          {authUser ? (
            <div className="account-menu">
              <button className="avatar" aria-label="打开个人学习档案" onClick={() => notify(`当前账号：${authUser.email ?? "学员"}`)}>{(authUser.user_metadata?.display_name || authUser.email || "学").slice(0, 1)}</button>
              <button className="account-action" onClick={() => void signOut()}>退出</button>
            </div>
          ) : (
            <button className="account-action" onClick={() => openAuth("login")}>{authConfigured ? "登录" : "登录（待配置）"}</button>
          )}
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
          <PageIntro
            eyebrow={selectedCourseTrack === "aesthetic" ? "全案色彩美学精华班" : "7天业绩倍增突击营"}
            title={selectedCourseTrack === "aesthetic" ? "从审美判断，到全案方案表达" : "从经营认知，到可复制的成交系统"}
            description={selectedCourseTrack === "aesthetic" ? "把色彩、空间、全案与表达连成一套专业方法，并用课后7+3打卡完成巩固与输出。" : "七天不是堆知识点，而是完成一次认知、定位、读心、美学、全案、配色与成交的连续训练。"}
          />
          <div className="course-layout">
            <aside className="filter-panel">
              <span>课程体系</span>
              <button className={selectedCourseTrack === "growth" ? "selected" : ""} onClick={() => setSelectedCourseTrack("growth")}>7天业绩倍增突击营</button>
              <button className={selectedCourseTrack === "aesthetic" ? "selected" : ""} onClick={() => setSelectedCourseTrack("aesthetic")}>全案色彩美学精华班</button>
              <button>助教实战训练</button>
              <span>学习方式</span><button>课程＋工具</button><button>真实案例</button>
              <button className={aftercareOpen || selectedCourseTrack === "aesthetic" ? "selected" : ""} onClick={() => { setSelectedCourseTrack("aesthetic"); setAftercareDay(0); setAftercareOpen(true); }}>作业与通关</button>
              <div className="course-rule"><strong>通关规则</strong><p>看完不算完成。必须用真实客户、门店或方案完成一次应用。</p></div>
            </aside>
            <div className="course-list">
              {visibleCourseItems.map((course) => {
                const canAccess = Boolean(authUser && courseAccessIds.includes(course.id));
                const showAestheticAftercare = selectedCourseTrack === "aesthetic" && course.id === "aesthetic-day-4";
                return (
                  <button key={course.day} className={canAccess ? "course-module" : "course-module locked"} onClick={() => openCourse(course)}>
                    <span className="module-day">{course.day}</span>
                    {canAccess ? (
                      <>
                        <span className="module-main"><small>课程主题</small><strong>{course.title}</strong><p>{course.action}</p></span>
                        <span className="module-detail"><small>配套工具</small><strong>{course.tool}</strong></span>
                        <span className="module-detail"><small>实战作业</small><strong>{course.practice}</strong></span>
                        <span className="module-pass">
                          <small>{showAestheticAftercare ? "作业与通关" : "通关标准"}</small>
                          {showAestheticAftercare ? (
                            <>
                              <strong>精华班课后打卡 7+3模式</strong>
                              <span className="module-pass-extra">7天专业知识点＋3天综合练习</span>
                              <span
                                className="module-pass-link"
                                role="button"
                                tabIndex={0}
                                onClick={(event) => { event.stopPropagation(); setAftercareOpen(true); }}
                                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); setAftercareOpen(true); } }}
                              >
                                查看打卡计划 · {aftercareCompleted}/10 →
                              </span>
                            </>
                          ) : <strong>{course.pass}</strong>}
                        </span>
                      </>
                    ) : (
                      <span className="module-locked"><small>{authUser ? "课程权限" : "登录后查看"}</small><strong>{authUser ? "当前账号暂无该课程权限" : "登录后查看你已开通的课程"}</strong><p>{authUser ? "如需开通，请联系课程助教。" : "登录后系统会按账号权限显示内容。"}</p></span>
                    )}
                    <b className="module-arrow">→</b>
                  </button>
                );
              })}
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
          onOpen={openItem}
        />
      )}

      {view === "templates" && (
        <LibraryView
          eyebrow="模板库"
          title="复制的不是文字，是经过验证的推进结构"
          description="按课前诊断、客户沟通、成交跟进和课后复盘分类使用。"
          items={library.filter((item) => {
            if (item.kind !== "模板" && item.kind !== "练习") return false;
            const requiredIds = requiredCourseIds(item);
            return requiredIds.length === 0 || Boolean(authUser && requiredIds.some((courseId) => courseAccessIds.includes(courseId)));
          })}
          onOpen={openItem}
        />
      )}

      {aftercareOpen && (
        <div className="aftercare-backdrop" role="presentation" onMouseDown={() => setAftercareOpen(false)}>
          <section className="aftercare-panel" role="dialog" aria-modal="true" aria-label="精华班课后打卡7+3计划" onMouseDown={(event) => event.stopPropagation()}>
            <button className="aftercare-close" type="button" aria-label="关闭打卡计划" onClick={() => setAftercareOpen(false)}>×</button>
            <span className="drawer-kind">作业与通关 · 精华班</span>
            <h2>课后打卡 7+3 模式</h2>
            <p className="aftercare-intro">前7天巩固专业知识，后3天完成综合美图拆解。每天学习、作业、录视频、群内反馈，完成10天形成一次完整闭环。</p>
            <div className="aftercare-progress">
              <div><small>完成进度</small><strong>{aftercareCompleted}<em>/10天</em></strong></div>
              <span><i style={{ width: `${aftercareCompleted * 10}%` }} /></span>
              <b>{aftercareCompleted === 10 ? "已通关" : "进行中"}</b>
            </div>
            <div className="aftercare-phase-tabs">
              <span className={selectedAftercareDay.day <= 7 ? "active" : ""}>前7天 · 专业知识点</span>
              <span className={selectedAftercareDay.day > 7 ? "active" : ""}>后3天 · 综合练习</span>
            </div>
            <div className="aftercare-day-grid">
              {aftercareDays.map((item, index) => (
                <button type="button" key={item.day} className={index === aftercareDay ? "active" : ""} onClick={() => setAftercareDay(index)}>
                  <b>DAY {item.day}</b><span>{item.title}</span><em>{aftercareDone[item.day] ? "已完成" : item.phase}</em>
                </button>
              ))}
            </div>
            <section className="aftercare-detail">
              <div className="aftercare-detail-heading"><span>DAY {selectedAftercareDay.day}</span><div><small>{selectedAftercareDay.phase}</small><h3>{selectedAftercareDay.title}</h3></div></div>
              <div className="aftercare-detail-block"><small>训练重点</small><p>{selectedAftercareDay.focus}</p></div>
              <div className="aftercare-detail-block"><small>作业内容</small><p>{selectedAftercareDay.assignment}</p></div>
              <div className="aftercare-detail-block aftercare-checkin"><small>打卡要求</small><p>{selectedAftercareDay.checkin}</p></div>
              <button type="button" className={aftercareDone[selectedAftercareDay.day] ? "aftercare-done complete" : "aftercare-done"} onClick={() => setAftercareDone((current) => ({ ...current, [selectedAftercareDay.day]: !current[selectedAftercareDay.day] }))}>
                {aftercareDone[selectedAftercareDay.day] ? "已完成本日打卡 · 点击撤销" : "标记本日已完成"}<span>✓</span>
              </button>
            </section>
            <p className="aftercare-note">综合练习第8—10天：助教每天发一张美图，学员按照美图拆解四步骤录视频讲解；打卡后由助教发送参考答案，群内统一答疑。</p>
          </section>
        </div>
      )}

      {authOpen && (
        <div className="auth-backdrop" role="presentation" onMouseDown={() => setAuthOpen(false)}>
          <section className="auth-panel" role="dialog" aria-modal="true" aria-label="学员账户" onMouseDown={(event) => event.stopPropagation()}>
            <button className="auth-close" type="button" aria-label="关闭登录窗口" onClick={() => setAuthOpen(false)}>×</button>
            <span className="drawer-kind">学员账户</span>
            <h2>{authMode === "signup" ? "注册学员账户" : authMode === "forgot" ? "找回密码" : "登录学习中心"}</h2>
            <p className="auth-intro">登录后，系统会按你的课程权限显示学习内容和资料下载入口。</p>
            {!authConfigured ? (
              <div className="auth-config-warning"><strong>Supabase 尚未配置</strong><p>前端代码已经准备好，但需要在 Vercel 添加 Supabase 环境变量后，注册和登录才会生效。</p></div>
            ) : (
              <>
              {authMode !== "forgot" && (
                <div className="auth-method-switches" role="tablist" aria-label="注册或登录方式">
                  <button type="button" className={authMethod === "email" ? "active" : ""} onClick={() => { setAuthMethod("email"); setAuthOtpSent(false); setAuthOtp(""); }}>邮箱密码</button>
                  <button type="button" className={authMethod === "phone-password" ? "active" : ""} onClick={() => { setAuthMethod("phone-password"); setAuthOtpSent(false); setAuthOtp(""); }}>手机号＋密码</button>
                  <button type="button" className={authMethod === "phone-otp" ? "active" : ""} onClick={() => { setAuthMethod("phone-otp"); setAuthOtpSent(false); setAuthOtp(""); }}>手机号验证码</button>
                </div>
              )}
              <form className="auth-form" onSubmit={submitAuth}>
                {authMode === "signup" && <label><span>姓名（必填）</span><input required value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="请输入姓名" autoComplete="name" /></label>}
                {(authMethod === "email" || authMode === "forgot") && <label><span>邮箱</span><input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="请输入邮箱" autoComplete="email" /></label>}
                {authMode !== "forgot" && authMethod !== "email" && <label><span>手机号</span><input required type="tel" value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} placeholder="例如 +8613800138000" autoComplete="tel" /></label>}
                {authMode !== "forgot" && (authMethod === "email" || authMethod === "phone-password") && <label><span>密码</span><input required minLength={6} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="至少6位" autoComplete={authMode === "signup" ? "new-password" : "current-password"} /></label>}
                {authOtpSent && authMethod !== "email" && <label><span>短信验证码</span><input required inputMode="numeric" pattern="\d{6}" maxLength={6} value={authOtp} onChange={(event) => setAuthOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="请输入6位验证码" autoComplete="one-time-code" /></label>}
                {authOtpSent && authMethod !== "email" && <p className="auth-otp-hint">验证码通常有效1小时；如未收到，请确认手机号包含国家区号。</p>}
                {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
                <button className="auth-submit" type="submit" disabled={authBusy}>
                  {authBusy ? "处理中…" : authMode === "forgot" ? "发送重置邮件" : authOtpSent && authMethod !== "email" ? "验证并完成" : authMethod === "phone-otp" ? "发送验证码" : authMode === "signup" ? authMethod === "phone-password" ? "注册并发送验证码" : "注册" : "登录"}
                </button>
              </form>
              </>
            )}
            {authConfigured && <div className="auth-switches">
              {authMode === "login" && <><button type="button" onClick={() => { setAuthMode("forgot"); setAuthMethod("email"); setAuthOtpSent(false); setAuthMessage(""); }}>忘记密码</button><button type="button" onClick={() => { setAuthMode("signup"); setAuthMethod("email"); setAuthOtpSent(false); setAuthMessage(""); }}>注册新账户</button></>}
              {authMode !== "login" && <button type="button" onClick={() => { setAuthMode("login"); setAuthMethod("email"); setAuthOtpSent(false); setAuthMessage(""); }}>返回登录</button>}
            </div>}
          </section>
        </div>
      )}

      {selected && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={(event) => event.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
            <span className="drawer-kind">{selected.kind}</span>
            <h2>{selected.title}</h2>
            <p className="drawer-summary">{selected.summary}</p>
            {selectedDownloadCourseId && <div className="drawer-download-row"><span>课程资料下载</span><button type="button" onClick={() => void downloadCourseFile(selectedDownloadCourseId)}>下载私有资料</button></div>}
            {selected.id === "two-axis" ? (
              <div className="response-tool-preview">
                <div className="store-checklist-tip"><strong>先判断，再回应</strong><span>八大回应术不是固定话术，而是根据客户原话选择回应方向。先记录客户怎么说，再选一种方法练习，避免所有异议都用同一句话回应。</span></div>
                <label className="response-objection-field"><span>客户原话 / 当前顾虑</span><textarea value={responseObjection} onChange={(event) => setResponseObjection(event.target.value)} placeholder="例如：为什么你们家比网上贵这么多？（可直接填写真实原话）" /></label>
                <section className="response-scenario-section">
                  <div className="response-section-heading"><small>八大回应术实战</small><span>PDF资料中的18类客户场景</span></div>
                  <div className="response-scenario-grid">
                    {responseScenarios.map((scenario) => (
                      <button type="button" key={scenario} className={responseScenario === scenario ? "selected" : ""} onClick={() => { setResponseScenario(scenario); setResponseObjection(scenario); }}>{scenario}</button>
                    ))}
                  </div>
                </section>
                <section className="response-method-section">
                  <div className="response-section-heading"><small>选择回应方法</small><span>当前 {selectedResponseTechnique.index}/8</span></div>
                  <div className="response-method-grid">
                    {responseTechniques.map((technique, index) => (
                      <button type="button" key={technique.name} className={responseTechniqueIndex === index ? "selected" : ""} onClick={() => setResponseTechniqueIndex(index)}>
                        <b>0{technique.index}</b><strong>{technique.name}</strong><span>{technique.english}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="response-method-detail">
                  <div className="response-method-heading"><span>0{selectedResponseTechnique.index}</span><div><h3>{selectedResponseTechnique.name}</h3><small>{selectedResponseTechnique.english}</small></div></div>
                  <div className="response-detail-grid">
                    <article><small>概念</small><p>{selectedResponseTechnique.concept}</p></article>
                    <article><small>关键认知</small><p>{selectedResponseTechnique.insight}</p></article>
                    {selectedResponseTechnique.example && <article><small>资料示例</small><p>{selectedResponseTechnique.example}</p></article>}
                    {selectedResponseTechnique.effect && <article><small>作用</small><p>{selectedResponseTechnique.effect}</p></article>}
                  </div>
                  <div className="response-generated-card">
                    <div className="response-generated-heading"><small>生成的回应术</small><span>已结合当前客户原话</span></div>
                    <p className="response-generated-copy">{responseDraft.response}</p>
                    <div className="response-next-question"><small>下一步追问</small><p>{responseDraft.question}</p></div>
                    <p className="response-generated-note">这是基于回应结构生成的练习稿，请按真实项目事实补充或删改后再发送。</p>
                  </div>
                  <div className="response-practice-note"><small>使用提示</small><p>记录客户原话 → 阅读本项概念与关键认知 → 用自己的真实场景练习一次 → 再确认客户是否愿意进入下一步。</p></div>
                </section>
                <p className="response-source-note">内容依据《八大回应术(1)》PDF整理；18类实战场景按原资料保留。工具只帮助你选择练习方向，不替代对客户真实情况的判断。</p>
              </div>
            ) : selected.id === "aesthetic" ? (
              <div className="aesthetic-score-preview">
                <div className="store-checklist-tip"><strong>严格、客观、实事求是</strong><span>按图片中的核心标准和可感知判断打分。每项得分范围为0分至该维度权重，建议使用整数；满分100分。不要夸大，不硬夸，问题记录和优化建议必须对应现场事实。</span></div>
                <div className="aesthetic-score-fields">
                  <label><span>项目名称</span><input value={aestheticProject} onChange={(event) => setAestheticProject(event.target.value)} placeholder="选填" /></label>
                  <label><span>评估人</span><input value={aestheticEvaluator} onChange={(event) => setAestheticEvaluator(event.target.value)} placeholder="选填" /></label>
                </div>
                <div className="aesthetic-scorebar">
                  <div><small>当前总分</small><strong>{aestheticScore}<em>/100</em></strong></div>
                  <div><small>已完成</small><strong>{answeredAestheticItems}<em>/{aestheticDimensions.length}</em></strong></div>
                  <span>{answeredAestheticItems === aestheticDimensions.length ? `优先优化：${aestheticWeakest.map((dimension) => dimension.name).join("、")}` : `完成${aestheticDimensions.length}项后生成完整评分结果`}</span>
                  {answeredAestheticItems > 0 && <button type="button" onClick={() => { setAestheticScores({}); setAestheticNotes({}); setAestheticSuggestions({}); setAestheticProject(""); setAestheticEvaluator(""); }}>清空重做</button>}
                </div>
                {aestheticDimensions.map((dimension, dimensionIndex) => {
                  const score = aestheticScores[dimensionIndex];
                  return (
                    <section className="aesthetic-dimension" key={dimension.name}>
                      <div className="aesthetic-dimension-heading"><h3><span>0{dimensionIndex + 1}</span>{dimension.name}</h3><strong>{score ?? "—"}<em>/{dimension.weight}分</em></strong></div>
                      <div className="aesthetic-standard-grid">
                        <article><small>核心标准</small><p>{dimension.core}</p></article>
                        <article><small>可感知判断</small><p>{dimension.judgment}</p></article>
                      </div>
                      <div className="aesthetic-score-input">
                        <label><span>本项得分</span><input type="number" min="0" max={dimension.weight} step="1" value={score ?? ""} onChange={(event) => updateAestheticScore(dimensionIndex, event.target.value)} /><em>/ {dimension.weight}分</em></label>
                        <input aria-label={`${dimension.name}评分滑块`} type="range" min="0" max={dimension.weight} step="1" value={score ?? 0} onChange={(event) => updateAestheticScore(dimensionIndex, event.target.value)} />
                      </div>
                      <div className="aesthetic-notes-grid">
                        <label><span>问题记录</span><textarea value={aestheticNotes[dimensionIndex] ?? ""} onChange={(event) => setAestheticNotes((current) => ({ ...current, [dimensionIndex]: event.target.value }))} placeholder="写具体问题，不写空泛评价" /></label>
                        <label><span>优化建议</span><textarea value={aestheticSuggestions[dimensionIndex] ?? ""} onChange={(event) => setAestheticSuggestions((current) => ({ ...current, [dimensionIndex]: event.target.value }))} placeholder="写下一步可执行调整" /></label>
                      </div>
                    </section>
                  );
                })}
                <section className="aesthetic-result-card">
                  <h3>评分结果</h3>
                  <div className="aesthetic-result-summary"><strong>{aestheticScore}<em>/100</em></strong><span>{answeredAestheticItems === aestheticDimensions.length ? "已完成全部9项，可复制完整评分记录" : `还需完成${aestheticDimensions.length - answeredAestheticItems}项`}</span></div>
                  {aestheticWeakest.length > 0 && <p>优先回看：{aestheticWeakest.map((dimension) => dimension.name).join("、")}。先处理影响整体观感最大的短板，再做细节微调。</p>}
                </section>
              </div>
            ) : selected.id === "customer-segment" ? (
              <div className="customer-segment-preview">
                <div className="store-checklist-tip"><strong>25分身份判断规则</strong><span>围绕项目真实性、决策权、装修时间、预算清晰度和行动意愿五项判断。每项选择1分、3分或5分，满分25分。分数用于确定下一步动作，不替代真实沟通。</span></div>
                <div className="customer-segment-fields">
                  <label><span>客户姓名</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="选填" /></label>
                  <label><span>联系方式</span><input value={customerContact} onChange={(event) => setCustomerContact(event.target.value)} placeholder="选填" /></label>
                  <label className="wide"><span>当前核心关注</span><input value={customerCoreConcern} onChange={(event) => setCustomerCoreConcern(event.target.value)} placeholder="例如：预算、效果、环保、收纳、落地" /></label>
                </div>
                <div className="customer-segment-scorebar">
                  <div><small>当前得分</small><strong>{customerScore}<em>/25</em></strong></div>
                  <div><small>已完成</small><strong>{answeredCustomerItems}<em>/{customerIdentityDimensions.length}</em></strong></div>
                  <span>{customerResult ? `${customerResult.code}级 · ${customerResult.title}` : `完成${customerIdentityDimensions.length}项后显示客户层级`}</span>
                  {answeredCustomerItems > 0 && <button type="button" onClick={() => { setCustomerAnswers({}); setCustomerName(""); setCustomerContact(""); setCustomerCoreConcern(""); }}>清空重做</button>}
                </div>
                {customerIdentityDimensions.map((dimension, dimensionIndex) => (
                  <section className="customer-segment-section" key={dimension.name}>
                    <h3><span>0{dimensionIndex + 1}</span>{dimension.name}</h3>
                    <div className="customer-segment-options">
                      {dimension.options.map((option) => (
                        <button
                          type="button"
                          key={option.score}
                          className={customerAnswers[dimensionIndex] === option.score ? "selected" : ""}
                          onClick={() => setCustomerAnswers((current) => ({ ...current, [dimensionIndex]: option.score }))}
                        >
                          <b>{option.score}分</b><span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                <section className="customer-segment-result">
                  <h3>结果与下一步</h3>
                  {customerResult ? (
                    <div className="customer-segment-live-result">
                      <div className="customer-segment-result-title"><strong>{customerResult.code}级 · {customerResult.title}</strong><b>{customerScore}分</b></div>
                      <p><em>跟进重点：</em>{customerResult.focus}</p>
                      <p><em>建议动作：</em>{customerResult.action}</p>
                      <p><em>注意：</em>{customerResult.caution}</p>
                    </div>
                  ) : (
                    <p className="customer-segment-pending">请完成五项判断，系统会自动给出 S/A/B/C/D 层级与下一步动作。</p>
                  )}
                  <div className="customer-segment-tier-list">
                    {customerIdentityTiers.map((tier) => <article key={tier.code} className={customerResult?.code === tier.code ? "active" : ""}><strong>{tier.code}级 · {tier.title}</strong><span>{tier.minScore}—{tier.maxScore}分</span><p>{tier.focus}</p></article>)}
                  </div>
                </section>
                <section className="customer-segment-section">
                  <h3>自然穿插的六个判断问题</h3>
                  <div className="customer-segment-question-list">{customerIdentityQuestions.map(([label, question]) => <div key={label}><small>{label}</small><p>{question}</p></div>)}</div>
                  <p className="store-checklist-note">不要像填写调查表一样一次问完，要自然穿插在聊天、看样和需求沟通过程中。</p>
                </section>
              </div>
            ) : selected.id === "product-check" ? (
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
            <button className="drawer-cta" onClick={selected.id === "product-check" || selected.id === "customer-segment" || selected.id === "aesthetic" || selected.id === "two-axis" || selected.kind === "模板" || selected.kind === "练习" ? copyTemplate : () => notify("已加入你的继续学习列表")}>
              {selected.id === "product-check" ? "复制自检表文字" : selected.id === "customer-segment" ? "复制诊断结果" : selected.id === "aesthetic" ? "复制评分结果" : selected.id === "two-axis" ? "复制生成回应术" : selected.kind === "模板" || selected.kind === "练习" ? "复制并使用" : "开始学习"} <span>→</span>
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
