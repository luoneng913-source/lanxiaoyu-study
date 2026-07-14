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
  { id: "growth-day-1", day: "DAY 1", title: "认知重建｜从卖产品到卖整体解决方案", action: "看见客户真正购买的是美而走心的整体生活结果，而不是孤立产品", tool: "《门店是否还在卖产品自检表》＋心道术器认知框架", practice: "完成门店进店、沟通、方案、成交、团队五阶段自检；选一个真实产品，把参数表达改写成一段整体空间价值表达", pass: "能说清客户为什么不只为产品买单，明确门店当前最主要的经营卡点，并提出一个从卖产品转向卖整体方案的可执行动作", openId: "needs" },
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

type CourseLesson = {
  title: string;
  summary: string;
  objective: string;
  keyPoints: string[];
  exercise: string;
  pass: string;
};

const courseLessonContent: Record<string, CourseLesson> = {
  "growth-day-1": { title: "DAY 1｜认知重建：从卖产品到卖整体解决方案", summary: "先改变客户看见你的方式，再改变门店的成交方式。", objective: "看见客户真正购买的是美而走心的整体生活结果，而不是一个孤立产品。", keyPoints: ["全案不是把品类一次性做大，而是以设计为输出、产品为载体、落地效果为目标。", "客户听到参数不等于看见价值；要把产品翻译成未来的生活画面。", "用“心、道、术、器”检查门店的经营方向、底层规律、流程方法和工具。"], exercise: "完成门店进店、沟通、方案、成交、团队五阶段自检；选一个真实产品，把参数表达改写成一段整体空间价值表达。", pass: "能说清客户为什么不只为产品买单，指出门店当前最大经营卡点，并提出一个从卖产品转向卖整体方案的动作。" },
  "growth-day-2": { title: "DAY 2｜模式突围：找到业绩倍增快车道", summary: "转型不是照搬别人，而是先找到适合自己资源条件的路径。", objective: "在四条转型路径中做出有证据的选择。", keyPoints: ["用全案思维卖单品：先变认知，不急着重资产投入。", "小全案轻资产：通过自主整合、异业合作或设计买手服务借力。", "大全案整体解决与整装全能：适合已有团队、资源、专业和交付基础的门店。"], exercise: "写下品类、城市、团队、资金和目标，选择最适合的路径，再写出当前最缺的能力与未来30天第一步。", pass: "能解释为什么选这条路径、当前差距在哪里，并确定一个不盲目扩张的破局动作。" },
  "growth-day-3": { title: "DAY 3｜客户读心术：别急着卖，先看懂人", summary: "客户说出来的是表面问题，没说出来的才是成交关键。", objective: "用观察证据判断客户的沟通入口、需求排序和决策阻力。", keyPoints: ["用性格、接待、需求、价值排序四个十字坐标建立初步判断。", "考拉、孔雀、老虎、猫头鹰只是沟通假设，不是给客户贴人格标签。", "客户关注效果、服务、质量、价格的排序不同，话术不能一套打天下。"], exercise: "选一个最近未成交客户，记录原话、语气、动作和决策方式，写出三条适配追问与下一步表达。", pass: "能用真实观察而非主观猜测判断沟通入口，说明客户最在意的价值，并给出下一步话术。" },
  "growth-day-4": { title: "DAY 4｜美 × 走心：把感觉变成专业判断", summary: "美不是玄学，空间的感觉可以从色、形、质和光拆解。", objective: "用设计原点和PCCS色彩体系解释空间为什么高级、和谐或翻车。", keyPoints: ["色彩看色相、明度、纯度与印象坐标；造型看线条、图案和时代气质。", "材质与光泽会改变空间的贵感、轻盈感、休闲感和科技感。", "客户说喜欢高级、温柔、有质感时，要把感觉翻译成可判断的关系。"], exercise: "找一张好看但说不清原因的空间图，完成色、形、质、光拆解，并写出客户可能喜欢的感觉。", pass: "能说明空间哪里好或哪里乱，指出判断依据，并提出一条可验证的优化建议。" },
  "growth-day-5": { title: "DAY 5｜流程成交：用6大要素打造接待路径", summary: "把临场发挥变成团队可以复制的接待流程。", objective: "用AIDMA和全案设计六大要素，让客户从注意走到行动。", keyPoints: ["AIDMA对应注意、兴趣、欲望、记忆和行动，是客户决策的递进路径。", "六大要素是人、感觉、功能、经济、建筑、环境。", "每个要素都要转成真实问题和话术，而不是停留在名词解释。"], exercise: "围绕六大要素各写3—5条问题或话术，设计一次展厅或微信接待流程并让团队演练。", pass: "能按AIDMA组织触点，问出客户真实顾虑，并形成一套不依赖个人状态的接待流程。" },
  "growth-day-6": { title: "DAY 6｜高手进阶：从配色翻车到高级出彩", summary: "没有丑的颜色，只有失去关系控制的组合。", objective: "用距离、纯度、比例、主次和过渡关系控制配色。", keyPoints: ["配色翻车三件套：颜色距离远且都艳、比例接近一比一、缺少中间过渡。", "距离近更和谐，距离远更出彩，但必须控制纯度、比例和主次。", "用年龄相仿、性格相近、见识共鸣判断色彩和材质能否共同表达主题。"], exercise: "拆解一张翻车空间图，找出三个问题，再用主色、辅助色、中间色和共鸣法则完成重配。", pass: "能讲清配色翻车原因，并做出客户听得懂、能说明依据的高级配色方案。" },
  "growth-day-7": { title: "DAY 7｜硬核系统：精准销售7步法", summary: "成交不是最后逼出来的，而是前六步递进之后自然发生。", objective: "把前六天的方法收束为一条可复制的成交路径。", keyPoints: ["七步是建立信赖、找痛点、撕痛点、提供解决方案、塑造梦想、提供证据、成交。", "信赖由安全、专业、懂他组成；痛点要基于事实，不制造恐惧。", "证据链解决客户的要不要、信不信、值不值、能不能四个疑问。"], exercise: "选一个未成交客户，逐步复盘卡点，写出当前最需要补强的一步和下一条推进话术。", pass: "能指出客户卡在哪一步，不靠降价逼单，并完成一条信赖—痛点—方案—证据—行动链。" },
  "aesthetic-day-1": { title: "DAY 1｜经营认知：从卖产品到卖确定性", summary: "把经营视角从单品销售切换到美而走心的整体方案。", objective: "建立全案经营的基本认知，并明确自己的门店转型动作。", keyPoints: ["客户买的是符合自己生活方式的整体结果，不是产品堆叠。", "美是核心竞争力，走心是成交关键；设计要服务于人和生活。", "先用自检表看清门店现状，再决定下一步能力建设。"], exercise: "盘点自己的门店模式，选一个真实客户，写出一次从卖产品到卖确定性的表达。", pass: "能说明门店当前最主要的经营卡点，并明确一个可执行的转型动作。" },
  "aesthetic-day-2": { title: "DAY 2｜审美判断：把感觉翻译成色形质与比例", summary: "用客观工具替代“好看、感觉不错”的模糊判断。", objective: "建立主题、色彩、空间比例、层次、纵深、平衡和质感的判断框架。", keyPoints: ["先确定空间主题和统一气质，再判断颜色、形态、材质之间是否呼应。", "用美学评分表记录问题，用PCCS和十字坐标解释感觉来源。", "评分必须对应现场事实，不夸大、不硬夸。"], exercise: "选一张空间图，完成100分美学评估、问题记录、优化建议和一次主题重述。", pass: "能客观说明空间哪里好、为什么好、如何优化，并把审美判断讲给客户听懂。" },
  "aesthetic-day-3": { title: "DAY 3｜诊断成交：从客户原话到成交路径", summary: "先判断人和问题，再决定方案和表达。", objective: "把客户原话转成可验证的需求、顾虑和下一步。", keyPoints: ["记录决策人、使用人、时间、预算、生活方式和真实痛点。", "用55387预判、身份分层和销售七步法判断客户当前阶段。", "不凭色彩或性格结果下定论，所有判断都要回到真实沟通证据。"], exercise: "完成一个真实客户的预判、身份分层和三条追问，写出适配表达与下一步动作。", pass: "能明确客户是谁、真正担心什么、现在缺什么证据，并给出一条可执行成交路径。" },
  "aesthetic-day-4": { title: "DAY 4｜色彩沟通与成交", summary: "把色彩判断变成客户听得懂、愿意继续沟通的语言。", objective: "用色彩四区、六大要素和回应结构支持客户沟通，而不是给客户贴标签。", keyPoints: ["色彩四区用于提出沟通假设，必须通过客户原话、行为和生活场景验证。", "用六大要素把色彩印象连接到人、感觉、功能、经济、建筑和环境。", "面对异议先回应真实顾虑，再确认客户是否愿意进入下一步。"], exercise: "选一个真实客户，完成一次色彩沟通假设、一条回应术练习和一个下一步推进动作。", pass: "能说明色彩判断依据，避免人格定论，并能把客户顾虑转成诊断、局部方案和下一步。" },
};

type CourseTool = {
  title: string;
  summary: string;
  purpose: string;
  inputs: string[];
  steps: string[];
  output: string;
};

const courseToolContent: Record<string, CourseTool> = {
  "growth-day-1": { title: "DAY 1｜门店产品价值自检与心道术器框架", summary: "用一张自检表看清门店是否仍停留在卖产品，再用心道术器找到升级抓手。", purpose: "判断门店当前的产品销售惯性、客户沟通断点和整体方案能力。", inputs: ["近30天一条真实成交或未成交记录", "门店进店、沟通、方案、成交、团队五阶段表现", "一个准备重新表达的产品"], steps: ["逐项回答自检表，记录证据，不用感觉打分。", "用心、道、术、器分别标记：经营初心、底层规律、流程方法、工具缺口。", "把产品参数改写成客户能想象的生活结果，并记录原话版本。"], output: "一份门店升级卡点清单＋一段从卖产品转向卖整体方案的价值表达。" },
  "growth-day-2": { title: "DAY 2｜门店模式四路径定位表", summary: "把品类、城市、资源、团队与资金放进同一张表，选择适合自己的增长路径。", purpose: "避免盲目照搬大店模式，明确未来30天最值得投入的能力。", inputs: ["当前品类和客单结构", "城市、客户、团队、合作资源与资金情况", "未来30天想改善的业绩指标"], steps: ["分别评估全案思维卖单品、小全案轻资产、大全案整体解决、整装全能四条路径。", "为每条路径写出已有证据、能力缺口和投入风险。", "选一条主路径，拆出一个本周能开始的动作。"], output: "一张门店模式定位表＋一条30天破局动作。" },
  "growth-day-3": { title: "DAY 3｜客户预判与身份分层转化表", summary: "把客户原话、行为和决策方式转成沟通假设，再用问题验证而不是贴标签。", purpose: "找到客户真正关心的价值排序、决策阻力和下一步入口。", inputs: ["客户原话、语气、动作和同行人员", "客户身份、使用场景、预算和时间", "一次未成交或推进缓慢的真实对话"], steps: ["用四大十字坐标与55387记录初步观察。", "用身份分层表判断客户更关注效果、服务、质量还是价格。", "写三条自然追问，验证假设并选择匹配表达。"], output: "一张客户判断记录＋三条验证问题＋下一步推进话术。" },
  "growth-day-4": { title: "DAY 4｜蓝筱玉美学体系打分表", summary: "用100分量表、PCCS和色形质坐标，把“好看”变成能解释、能优化的专业判断。", purpose: "定位空间主题、色彩比例、层次、质感和细节的真实问题。", inputs: ["一张真实空间图或现场照片", "空间主题、客户偏好和已有材料", "PCCS色彩条与美学评分表"], steps: ["按主题统一、色彩比例、空间比例、上下层次、前后纵深、左右平衡、材质质感、细节呼应、记忆点九项评分。", "记录每项问题和事实证据，避免只写“感觉不好”。", "选最低分的两项，提出可执行的色、形、质或光优化。"], output: "一份100分美学诊断表＋两条优先优化建议。" },
  "growth-day-5": { title: "DAY 5｜AIDMA × 全案设计六大要素接待表", summary: "把客户接待从临场发挥变成团队可复制的提问、表达和推进路径。", purpose: "让注意、兴趣、欲望、记忆、行动与客户真实生活需求连起来。", inputs: ["客户基础信息与接待场景", "人、感觉、功能、经济、建筑、环境六大要素", "门店现有接待流程"], steps: ["为六大要素各写3—5个自然问题。", "把问题按AIDMA顺序排列，标出每一步要得到的证据。", "让同事演练一轮，记录客户在哪一步停顿或提出异议。"], output: "一张AIDMA接待流程表＋六大要素问题库。" },
  "growth-day-6": { title: "DAY 6｜PCCS配色翻车诊断与重配表", summary: "用色彩距离、纯度、比例、主次与过渡关系找到翻车原因。", purpose: "让配色方案既有和谐关系，也有能被客户感知的重点和张力。", inputs: ["一张配色翻车的空间图", "PCCS色球或色彩条", "客户年龄、性格、生活方式与主题偏好"], steps: ["标记颜色距离、纯度、面积比例和主次关系。", "检查是否存在颜色太远太艳、接近一比一、缺少中间色三类问题。", "用主色、辅助色、中间过渡色重新搭配，并写出客户能听懂的理由。"], output: "一张配色翻车诊断表＋一版重配方案说明。" },
  "growth-day-7": { title: "DAY 7｜精准销售七步法与证据链清单", summary: "把前六天的方法收束为信赖、痛点、方案、梦想、证据和成交的连续动作。", purpose: "定位客户当前卡在哪一步，并用证据推进而不是用降价逼单。", inputs: ["一个最近未成交客户", "客户原话、方案记录和已提供的证据", "精准销售七步法检查表"], steps: ["逐项复盘建立信赖、找痛点、撕痛点、解决方案、塑造梦想、提供证据、成交。", "标出客户已经完成和仍缺失的步骤。", "补齐一条最小证据链，写出下一次沟通的确认问题。"], output: "一份七步法复盘表＋当前卡点＋下一条推进话术。" },
  "aesthetic-day-1": { title: "DAY 1｜门店自检表与经营模式选择清单", summary: "先确认门店是否仍在卖产品，再确定精华班学习后的经营升级方向。", purpose: "让学员知道自己要从哪个经营卡点开始，而不是一上来堆工具。", inputs: ["门店现状与最近一单业务", "进店、沟通、方案、成交、团队五阶段表现", "四条经营模式的资源条件"], steps: ["完成25分制门店自检，标出最高风险阶段。", "用心道术器写出门店当前最缺的一层能力。", "在经营模式清单中选一个方向，写出一个真实客户应用动作。"], output: "一份经营自检结果＋模式选择理由＋本周应用动作。" },
  "aesthetic-day-2": { title: "DAY 2｜美学评分表与PCCS色形质坐标", summary: "把空间审美拆成可评分、可复述、可优化的判断结构。", purpose: "帮助学员从“我觉得好看”走到“我能说清为什么好”。", inputs: ["真实空间图片", "美学体系100分评分表", "PCCS色彩条与色形质十字坐标"], steps: ["先写空间主题，再按九个维度评分。", "把色、形、质、光分别放入坐标，记录呼应或冲突。", "挑出最低分维度，写一条不改变主题的优化建议。"], output: "一张美学评分表＋一段客户听得懂的审美解释。" },
  "aesthetic-day-3": { title: "DAY 3｜55387预判与客户身份分层转化表", summary: "从客户身份和生活方式出发，找到适配的诊断问题与成交表达。", purpose: "判断决策人、使用人、价值排序和当前成交阶段。", inputs: ["客户原话、行为和决策参与人", "客户身份分层五项判断", "销售七步法阶段记录"], steps: ["先记录事实，再填写55387与身份分层判断。", "用六大要素追问人、感觉、功能、经济、建筑、环境。", "把客户当前阶段对应到销售七步法，确定一个下一步。"], output: "一份客户分层诊断＋三条追问＋一条推进动作。" },
  "aesthetic-day-4": { title: "DAY 4｜色彩四区交集图与8大回应术", summary: "把色彩沟通假设、六大要素和异议回应连接成一套可执行工具。", purpose: "让色彩用于理解沟通，不用于给客户下人格定论。", inputs: ["客户原话与生活场景", "色彩四区交集图", "六大要素和8大回应术卡片"], steps: ["根据客户原话提出一个色彩沟通假设。", "用六大要素验证假设，找到客户真正关心的生活结果。", "选择最合适的一种回应术，回应顾虑后确认下一步。"], output: "一张色彩沟通假设表＋一段回应术＋下一步确认问题。" },
};

type CourseToolEntry = CourseTool & { id: string; label: string };
const makeCourseToolEntry = (courseId: string, index: number, label: string, sourceId: string, overrides: Partial<CourseTool> = {}): CourseToolEntry => {
  const source = courseToolContent[sourceId];
  return {
    ...source,
    ...overrides,
    id: `${courseId}-tool-${index}`,
    label,
    title: label,
    summary: overrides.summary ?? `${label}：${source.summary}`,
  };
};

const courseToolEntries: Record<string, CourseToolEntry[]> = {
  "growth-day-1": [
    makeCourseToolEntry("growth-day-1", 1, "门店是否还在卖产品自检表", "growth-day-1"),
    makeCourseToolEntry("growth-day-1", 2, "心道术器认知框架", "growth-day-1", { purpose: "把门店的经营初心、底层规律、执行方法和现场工具分开检查，找到最该先补的一层能力。", inputs: ["门店当前经营目标", "最近一次客户沟通记录", "现有流程、话术和工具清单"], steps: ["分别写下心、道、术、器目前已有的做法。", "标记最影响客户体验和成交结果的一项缺口。", "为这个缺口指定一个本周可验证的动作。"], output: "一张心道术器能力盘点表＋一个优先补强动作。" }),
  ],
  "growth-day-2": [
    makeCourseToolEntry("growth-day-2", 1, "门店模式四路径定位表", "growth-day-2"),
    makeCourseToolEntry("growth-day-2", 2, "3分钟门店增长诊断", "growth-day-2", { purpose: "用3分钟快速判断门店当前处于什么经营阶段，以及下一步最适合做什么。", inputs: ["门店品类、客单和近期业绩", "现有团队与合作资源", "当前最急的增长问题"], steps: ["用一句话描述门店现在卖什么、为谁解决什么。", "快速判断客户来源、成交方式和交付能力。", "输出一个不超过30天的验证动作，并约定复盘指标。"], output: "一段3分钟门店诊断结论＋一个30天验证指标。" }),
  ],
  "growth-day-3": [
    makeCourseToolEntry("growth-day-3", 1, "小蓝飞镖法4大十字坐标", "growth-day-3"),
    makeCourseToolEntry("growth-day-3", 2, "55387客户预判", "growth-day-3", { purpose: "从客户的语气、动作、表达和决策方式提出沟通假设，帮助销售先调整接待方式。" }),
    makeCourseToolEntry("growth-day-3", 3, "客户身份分层转化表", "growth-day-3", { purpose: "把客户真正关心的效果、服务、质量、价格与决策条件记录下来，转成下一步推进动作。" }),
  ],
  "growth-day-4": [
    makeCourseToolEntry("growth-day-4", 1, "蓝筱玉美学体系打分表", "growth-day-4"),
    makeCourseToolEntry("growth-day-4", 2, "PCCS色彩条", "growth-day-4", { purpose: "用色相、明度、纯度和色调关系定位空间印象，找到客户说的“高级、温柔或活泼”对应的色彩依据。", inputs: ["真实空间图片", "PCCS色彩条", "客户偏好的形容词"], steps: ["先标出空间主色与辅助色。", "判断色彩的明度、纯度和距离关系。", "用一句话把色彩关系翻译成客户能理解的生活感觉。"], output: "一条PCCS色彩判断＋一段客户语言表达。" }),
    makeCourseToolEntry("growth-day-4", 3, "色形质十字坐标", "growth-day-4", { purpose: "把空间中的颜色、造型、材质和光泽放到同一张坐标里，检查它们是否共同服务于主题。", inputs: ["空间照片或方案图", "色、形、质、光关键词", "拟定的空间主题"], steps: ["分别记录色、形、质、光的主要特征。", "把每个特征放入坐标并标出冲突点。", "删除或调整最影响主题统一的一项。"], output: "一张色形质十字坐标＋一个主题统一调整点。" }),
  ],
  "growth-day-5": [
    makeCourseToolEntry("growth-day-5", 1, "AIDMA法则", "growth-day-5"),
    makeCourseToolEntry("growth-day-5", 2, "全案设计六大要素", "growth-day-5", { purpose: "从人、感觉、功能、经济、建筑、环境六个角度提问，避免只围绕产品参数沟通。", inputs: ["客户家庭成员和生活方式", "空间功能与预算", "现有建筑和环境条件"], steps: ["每个要素写出一个自然问题。", "记录客户回答中的事实、感受和限制。", "把回答转成方案里可被看见的一项设计动作。"], output: "一张六大要素问题表＋一项方案落地动作。" }),
  ],
  "growth-day-6": [
    makeCourseToolEntry("growth-day-6", 1, "PCCS色球", "growth-day-6"),
    makeCourseToolEntry("growth-day-6", 2, "配色翻车三件套", "growth-day-6"),
    makeCourseToolEntry("growth-day-6", 3, "美搭法则", "growth-day-6", { purpose: "用主次、比例、纯度和过渡关系，让空间配色既统一又有重点。", inputs: ["空间配色方案", "主色、辅助色与点缀色", "空间面积比例"], steps: ["先确定主色与面积比例。", "再加入辅助色和中间过渡色。", "检查点缀色是否服务主题而不是抢走注意力。"], output: "一张主次比例表＋一版更稳定的配色关系。" }),
    makeCourseToolEntry("growth-day-6", 4, "恋爱式搭配法则", "growth-day-6", { purpose: "用年龄相仿、性格相近、见识共鸣理解客户为什么喜欢某种色彩与材质组合。", inputs: ["客户年龄、性格和生活经验", "客户喜欢或排斥的空间图片", "候选色彩与材质组合"], steps: ["找出客户已经认可的色彩或材质。", "匹配相近的感觉与生活场景。", "用客户自己的语言说明组合为什么适合。"], output: "一段客户共鸣解释＋一组有依据的色材搭配。" }),
  ],
  "growth-day-7": [
    makeCourseToolEntry("growth-day-7", 1, "精准销售7步法", "growth-day-7"),
    makeCourseToolEntry("growth-day-7", 2, "客户六大要素", "growth-day-7", { purpose: "将客户的人、感觉、功能、经济、建筑、环境转成方案价值与成交证据。" }),
    makeCourseToolEntry("growth-day-7", 3, "可视化证据链清单", "growth-day-7", { purpose: "把案例、过程、材料、效果和交付证据整理成客户能看懂、能相信的证明。", inputs: ["真实落地案例", "方案前后对比与材料信息", "客户最担心的一个风险"], steps: ["先写客户不确定什么。", "为每个疑问匹配一项可视化证据。", "按客户决策顺序排列证据并确认下一步。"], output: "一张客户疑问—证据对应表＋一份展示顺序。" }),
  ],
  "aesthetic-day-1": [
    makeCourseToolEntry("aesthetic-day-1", 1, "门店是否还在卖产品自检表", "aesthetic-day-1"),
    makeCourseToolEntry("aesthetic-day-1", 2, "经营模式选择清单", "aesthetic-day-1", { purpose: "根据门店资源、能力和目标，选择下一阶段的经营模式，而不是直接复制别人的规模。", inputs: ["门店现状与资源", "团队专业和交付能力", "想服务的客户与目标结果"], steps: ["列出四种模式的要求。", "对照现状标记具备和缺失的条件。", "选定一个方向，写出一项低风险验证动作。"], output: "一张经营模式选择表＋一项验证动作。" }),
  ],
  "aesthetic-day-2": [
    makeCourseToolEntry("aesthetic-day-2", 1, "蓝筱玉美学体系打分表", "aesthetic-day-2"),
    makeCourseToolEntry("aesthetic-day-2", 2, "PCCS色彩条", "aesthetic-day-2"),
    makeCourseToolEntry("aesthetic-day-2", 3, "色形质十字坐标工具", "aesthetic-day-2"),
  ],
  "aesthetic-day-3": [
    makeCourseToolEntry("aesthetic-day-3", 1, "55387客户预判", "aesthetic-day-3"),
    makeCourseToolEntry("aesthetic-day-3", 2, "客户身份分层转化表", "aesthetic-day-3"),
    makeCourseToolEntry("aesthetic-day-3", 3, "销售七步法", "aesthetic-day-3", { purpose: "判断客户目前处在建立信赖、诊断痛点、方案证明还是成交确认的哪一步。", inputs: ["客户沟通记录", "已给出的方案和证据", "客户当前异议"], steps: ["标记客户已经完成的步骤。", "找到当前最缺的一步。", "设计一个自然的下一步确认问题。"], output: "一张销售七步法阶段表＋下一步确认问题。" }),
  ],
  "aesthetic-day-4": [
    makeCourseToolEntry("aesthetic-day-4", 1, "色彩四区交集图", "aesthetic-day-4"),
    makeCourseToolEntry("aesthetic-day-4", 2, "六大要素", "aesthetic-day-4"),
    makeCourseToolEntry("aesthetic-day-4", 3, "8大回应术", "aesthetic-day-4"),
  ],
};

const courseToolEntryIndex = Object.values(courseToolEntries).flat().reduce<Record<string, CourseToolEntry>>((index, entry) => {
  index[entry.id] = entry;
  return index;
}, {});

type CoursePractice = {
  title: string;
  summary: string;
  goal: string;
  steps: string[];
  deliverable: string;
  check: string;
};

const coursePracticeContent: Record<string, CoursePractice> = {
  "growth-day-1": { title: "DAY 1｜从卖产品到卖整体方案", summary: "用一条真实产品表达，完成从参数介绍到生活结果表达的转换。", goal: "识别门店最明显的产品销售惯性，并练习一次整体价值表达。", steps: ["完成进店、沟通、方案、成交、团队五阶段复盘。", "选一个真实产品，写下原来的参数式表达。", "把它改写成客户能想象的生活场景、体验和结果。"], deliverable: "五阶段自检记录＋原表达与新表达各一版。", check: "能说清客户为什么买整体结果，并提出一个门店马上能执行的升级动作。" },
  "growth-day-2": { title: "DAY 2｜门店增长路径定位", summary: "根据真实资源条件选择一条适合自己的转型路径。", goal: "避免盲目扩张，用证据确定未来30天的增长重点。", steps: ["填写品类、城市、客户、团队、资源和资金现状。", "比较四条模式的优势、缺口和风险。", "选定一条主路径，拆出本周第一步和复盘指标。"], deliverable: "一页门店模式定位表＋30天行动卡。", check: "能解释选择依据，并把第一步安排到具体时间、负责人和结果。" },
  "growth-day-3": { title: "DAY 3｜真实客户读心练习", summary: "用真实对话验证客户的价值排序和决策阻力。", goal: "不凭感觉给客户贴标签，而是用原话和行为找到沟通入口。", steps: ["选择一位近期未成交或推进缓慢的客户。", "记录客户原话、行为、同行人和决策过程。", "写出三条自然追问，并确定下一次沟通的表达方式。"], deliverable: "客户观察记录＋三条追问＋下一步沟通稿。", check: "能指出判断证据、客户真正关心的价值和下一步要确认的条件。" },
  "growth-day-4": { title: "DAY 4｜空间美学判断练习", summary: "从色、形、质、光和比例关系解释一张空间图。", goal: "把“好看或不好看”转成有依据的专业判断。", steps: ["选一张真实空间图，写出它的主题和第一印象。", "依次拆解色彩、造型、材质、光泽、比例与层次。", "提出两条不破坏主题的优化建议。"], deliverable: "一页空间拆解图＋两条优化建议。", check: "能说明判断依据，并用客户听得懂的语言解释空间问题。" },
  "growth-day-5": { title: "DAY 5｜设计一条接待成交流程", summary: "把六大要素转成一轮可演练的客户接待。", goal: "让团队可以按流程提问、记录和推进，而不是依赖临场发挥。", steps: ["为人、感觉、功能、经济、建筑、环境各写问题。", "按注意、兴趣、欲望、记忆、行动排列接待顺序。", "与同事完成一次角色演练，记录停顿和异议。"], deliverable: "接待流程图＋六大要素问题清单＋演练复盘。", check: "能从客户回答中找到真实顾虑，并明确下一步动作。" },
  "growth-day-6": { title: "DAY 6｜配色翻车重做练习", summary: "找出一张翻车配色的具体原因，并完成一版重配。", goal: "掌握距离、纯度、比例、主次和过渡的实际控制。", steps: ["标记颜色距离、纯度、面积比例和主次关系。", "找出颜色太远太艳、比例接近一比一、缺少中间色的问题。", "用主色、辅助色和过渡色完成重配并说明理由。"], deliverable: "翻车原因标注图＋重配方案说明。", check: "能讲清翻车原因，并让客户听懂重配后的关系和价值。" },
  "growth-day-7": { title: "DAY 7｜精准销售七步复盘", summary: "用一个未成交客户检验七天方法是否真正连成路径。", goal: "找到客户卡住的步骤，设计不靠降价的下一次推进。", steps: ["按建立信赖、找痛点、撕痛点、方案、梦想、证据、成交逐步复盘。", "标出已经完成、缺失和需要补证据的步骤。", "写一段下一次沟通的确认问题和行动邀请。"], deliverable: "七步复盘表＋证据补强清单＋下一步话术。", check: "能明确客户当前阶段，并用专业、证据和行动条件推动下一步。" },
  "aesthetic-day-1": { title: "DAY 1｜精华班经营认知作业", summary: "从门店自检结果出发，确定一次可验证的经营升级。", goal: "把行业变化和门店现状连接起来，找到自己的学习起点。", steps: ["完成门店25分制自检并记录事实。", "写出客户为什么不只比较产品价格。", "选择一个经营升级动作，在真实客户中验证。"], deliverable: "经营自检结果＋升级表达＋一次应用记录。", check: "能说清门店卡点、客户价值和下一步行动。" },
  "aesthetic-day-2": { title: "DAY 2｜一张空间图的美学评分", summary: "用评分和拆解把空间感觉变成专业表达。", goal: "建立主题、色形质、比例与细节之间的整体判断。", steps: ["完成一张空间图的九项评分。", "记录最低分维度及其现场证据。", "写出一条主题不变、可以马上验证的优化建议。"], deliverable: "100分美学评分表＋客户版解释稿。", check: "能客观说明哪里好、哪里需要优化以及为什么。" },
  "aesthetic-day-3": { title: "DAY 3｜客户诊断到下一步", summary: "把客户身份、生活痛点和成交阶段写成一条跟进路径。", goal: "用事实判断客户真正关心的问题，不凭预判直接给方案。", steps: ["记录决策人、使用人、时间、预算和生活场景。", "完成客户身份与价值排序判断。", "写三条追问，并确定下一次沟通要补的证据。"], deliverable: "客户诊断卡＋三条追问＋下一步跟进卡。", check: "能说清客户是谁、担心什么、缺什么证据以及怎么推进。" },
  "aesthetic-day-4": { title: "DAY 4｜色彩沟通与回应练习", summary: "用一个真实客户完成从色彩假设到回应和推进的完整练习。", goal: "让色彩成为沟通入口，而不是人格结论或固定话术。", steps: ["根据客户原话提出一个色彩沟通假设。", "用六大要素验证假设对应的生活结果。", "选择一种回应结构，回应顾虑并确认下一步。"], deliverable: "色彩沟通记录＋回应稿＋下一步确认问题。", check: "能说明依据、回应真实顾虑，并让客户愿意进入下一步。" },
};

type CoursePass = {
  title: string;
  summary: string;
  goal: string;
  requirements: string[];
  evidence: string;
  standard: string;
};

const coursePassContent: Record<string, CoursePass> = {
  "growth-day-1": { title: "DAY 1｜认知重建通关标准", summary: "从卖产品的表达，完成一次整体方案价值表达。", goal: "证明自己已经能看见客户购买的生活结果，而不只看见产品。", requirements: ["完成门店五阶段自检，并标出一个最大经营卡点。", "用一条真实产品完成参数表达与整体价值表达的对照。", "提出一个本周可以执行、可以复盘的升级动作。"], evidence: "自检表、前后两版表达、真实客户或同事的反馈记录。", standard: "能清楚解释客户为什么不只为产品买单，并让对方听懂整体方案的价值。" },
  "growth-day-2": { title: "DAY 2｜模式突围通关标准", summary: "用真实资源条件选定自己的增长路径。", goal: "证明选择不是模仿，而是基于门店现状的判断。", requirements: ["完成四条模式的资源、能力和风险对照。", "明确一条主路径以及当前最缺的能力。", "把30天第一步写到时间、负责人和预期结果。"], evidence: "模式定位表、能力差距说明、30天行动卡。", standard: "能用现状证据说明为什么选择这条路径，并启动一个低风险验证动作。" },
  "growth-day-3": { title: "DAY 3｜客户读心通关标准", summary: "用证据判断客户的沟通入口与价值排序。", goal: "证明自己没有把工具当人格标签，而是会回到真实沟通。", requirements: ["记录客户原话、行为和决策参与人。", "提出客户类型与价值排序的初步假设。", "用至少三条追问验证假设，并写出下一步表达。"], evidence: "客户观察卡、三条追问、一次沟通后的修正记录。", standard: "能说清判断依据、客户真正关心的问题以及下一步要确认的条件。" },
  "growth-day-4": { title: "DAY 4｜美学判断通关标准", summary: "把空间感觉转换成色、形、质、光和比例的专业判断。", goal: "证明审美表达有依据、有主题，也有可执行的优化方向。", requirements: ["完成一张空间图的主题和九项美学判断。", "指出至少两个影响高级感或和谐度的具体问题。", "给出一条与主题一致的优化建议并说明理由。"], evidence: "空间拆解图、评分结果、优化前后对照或讲解视频。", standard: "能让客户听懂空间为什么好、哪里需要调整以及调整后会得到什么结果。" },
  "growth-day-5": { title: "DAY 5｜流程成交通关标准", summary: "把六大要素和AIDMA变成可复制的接待流程。", goal: "证明接待不依赖个人发挥，而是能持续问出真实需求。", requirements: ["完成六大要素问题清单。", "按AIDMA排列一次完整接待路径。", "与团队或同事完成一次演练并复盘一个卡点。"], evidence: "接待流程图、问题清单、演练记录和改进动作。", standard: "能从客户回答中找到真实顾虑，完成从注意到行动的连续推进。" },
  "growth-day-6": { title: "DAY 6｜配色进阶通关标准", summary: "找出配色翻车原因，并完成有主次、有过渡的重配。", goal: "证明能用关系控制配色，而不是凭个人喜好搭色。", requirements: ["准确指出颜色距离、纯度、比例和过渡的问题。", "重新确定主色、辅助色和中间色。", "用客户听得懂的语言解释重配后的主题与价值。"], evidence: "翻车诊断标注、重配方案、客户语言说明或讲解视频。", standard: "能说明翻车原因、重配依据以及这套配色如何服务客户生活。" },
  "growth-day-7": { title: "DAY 7｜精准销售通关标准", summary: "把七天方法收束为一条真实客户成交推进链。", goal: "证明能定位客户卡点，并用证据和行动条件推进。", requirements: ["逐步复盘精准销售七步法。", "指出客户当前卡在哪一步以及缺什么证据。", "写出下一次沟通的确认问题、证据和行动邀请。"], evidence: "七步复盘表、证据链清单、下一步沟通记录。", standard: "能在不依赖降价的情况下，让客户自然进入下一步。" },
  "aesthetic-day-1": { title: "DAY 1｜经营认知通关标准", summary: "从门店现状出发，完成一次经营升级判断。", goal: "证明已经建立从卖产品到卖确定性的经营视角。", requirements: ["完成门店自检并指出主要卡点。", "解释行业变化与客户价值变化的关系。", "确定一个真实客户应用动作并记录结果。"], evidence: "自检结果、经营表达、应用记录。", standard: "能说清门店下一阶段做什么、为什么做以及如何验证。" },
  "aesthetic-day-2": { title: "DAY 2｜审美判断通关标准", summary: "用评分、坐标和主题表达一张真实空间图。", goal: "证明能把感觉变成客观、可复述、可优化的判断。", requirements: ["完成空间主题、色形质、比例和细节判断。", "指出最低分维度并给出优化依据。", "用客户语言说明调整会带来什么空间结果。"], evidence: "美学评分表、空间讲解稿、优化前后对照。", standard: "能完整说明空间哪里好、为什么好以及最先应改哪里。" },
  "aesthetic-day-3": { title: "DAY 3｜诊断成交通关标准", summary: "把客户身份、生活痛点和成交阶段连成一条路径。", goal: "证明先诊断再表达，而不是先判断、先报价。", requirements: ["明确决策人、使用人和真实使用场景。", "完成客户类型与价值排序的证据记录。", "确定客户当前成交阶段和下一步补证据动作。"], evidence: "客户诊断卡、追问记录、跟进前后变化。", standard: "能说清客户真正担心什么，并让下一步推进建立在客户事实之上。" },
  "aesthetic-day-4": { title: "DAY 4｜色彩沟通通关标准", summary: "把色彩假设、六大要素和回应结构用于一次真实沟通。", goal: "证明会用色彩建立沟通入口，而不是给客户下人格结论。", requirements: ["根据客户原话提出色彩沟通假设并写明依据。", "用六大要素验证客户真正关心的生活结果。", "回应一个真实顾虑并确认下一步行动。"], evidence: "色彩沟通记录、回应稿、客户下一步反馈。", standard: "能说明判断边界、回应真实顾虑，并推动客户进入下一步。" },
};

type CourseColumn = "topic" | "tool" | "practice" | "pass";
type CourseSection = "topic" | "tool" | "practice";
const courseColumnOpenIds: Record<string, Partial<Record<CourseColumn, string>>> = {
  "growth-day-1": { topic: "needs", tool: "product-check", practice: "needs", pass: "needs" },
  "growth-day-2": { topic: "store-diagnosis", tool: "store-diagnosis", practice: "store-diagnosis", pass: "store-diagnosis" },
  "growth-day-3": { topic: "customer-segment", tool: "customer-segment", practice: "customer-segment", pass: "customer-segment" },
  "growth-day-4": { topic: "aesthetic", tool: "aesthetic", practice: "aesthetic", pass: "aesthetic" },
  "growth-day-5": { topic: "case-library", tool: "case-library", practice: "case-library", pass: "case-library" },
  "growth-day-6": { topic: "aesthetic", tool: "aesthetic", practice: "aesthetic", pass: "aesthetic" },
  "growth-day-7": { topic: "two-axis", tool: "two-axis", practice: "two-axis", pass: "two-axis" },
  "aesthetic-day-1": { topic: "needs", tool: "product-check", practice: "product-check", pass: "product-check" },
  "aesthetic-day-2": { topic: "aesthetic", tool: "aesthetic", practice: "aesthetic", pass: "aesthetic" },
  "aesthetic-day-3": { topic: "customer-segment", tool: "customer-segment", practice: "customer-segment", pass: "customer-segment" },
  "aesthetic-day-4": { topic: "aesthetic", tool: "two-axis", practice: "two-axis", pass: "aftercare" },
};

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

const needsDiagnosisLayers = [
  {
    index: "01",
    title: "事实层：先问清现状",
    goal: "把客户的模糊描述还原成真实项目、家庭和装修阶段。",
    questions: ["您现在房子进行到哪一步了？", "这次主要想先解决哪个空间或哪个环节？", "家里通常是谁一起参与决定？"],
    output: "得到可核对的事实：项目阶段、空间范围、参与人和当前任务。",
  },
  {
    index: "02",
    title: "感受层：追到真正顾虑",
    goal: "从“想要什么”继续追问到“为什么在意”，找到显性需求背后的担心。",
    questions: ["您最希望最后呈现什么感觉？", "过去看过或做过的方案，哪里让您不满意？", "如果这个问题没有解决，您最担心后面付出什么代价？"],
    output: "区分客户是在意效果、生活方式、预算、时间、质量，还是害怕返工和落地翻车。",
  },
  {
    index: "03",
    title: "决策层：确认行动条件",
    goal: "确认客户如何做决定，以及什么证据能让他愿意进入下一步。",
    questions: ["您和家人最后会按什么标准来比较方案？", "目前还有哪些人或条件需要一起确认？", "如果把这个关键问题讲清楚，您下一步愿意先做什么？"],
    output: "明确决策人、比较标准、未决条件和下一步动作，不急着在信息不足时报价。",
  },
];

const templateText = `姐，我注意到你现在真正卡住的，不是没有学过方法，而是还没有把方法练成客户听得懂的表达。\n\n我们先不急着谈课程。你把最近一次最难推进的客户情况发给我，我先帮你判断：问题出在需求没问透、价值没讲清，还是下一步没有推动。`;

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [needsCustomerWords, setNeedsCustomerWords] = useState("");
  const [needsDiagnosisNotes, setNeedsDiagnosisNotes] = useState<Record<number, string>>({});
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
  const [courseSection, setCourseSection] = useState<CourseSection>("topic");
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

  const selectedLessonId = selected?.id.startsWith("course-lesson-") ? selected.id.slice("course-lesson-".length) : null;
  const selectedLesson = selectedLessonId ? courseLessonContent[selectedLessonId] : null;
  const selectedToolId = selected?.id.startsWith("course-tool-") ? selected.id.slice("course-tool-".length) : null;
  const selectedTool = selectedToolId ? courseToolEntryIndex[selectedToolId] : null;
  const selectedPracticeId = selected?.id.startsWith("course-practice-") ? selected.id.slice("course-practice-".length) : null;
  const selectedPractice = selectedPracticeId ? coursePracticeContent[selectedPracticeId] : null;
  const selectedPassId = selected?.id.startsWith("course-pass-") ? selected.id.slice("course-pass-".length) : null;
  const selectedPass = selectedPassId ? coursePassContent[selectedPassId] : null;

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
      if (selectedPass) {
        const text = `${selectedPass.title}\n\n通关目标：${selectedPass.goal}\n\n验收要求：\n${selectedPass.requirements.map((requirement, index) => `${index + 1}. ${requirement}`).join("\n")}\n\n提交证据：${selectedPass.evidence}\n\n判断标准：${selectedPass.standard}`;
        await navigator.clipboard.writeText(text);
        notify("通关标准内容已复制");
      } else if (selectedPractice) {
        const text = `${selectedPractice.title}\n\n作业目标：${selectedPractice.goal}\n\n执行步骤：\n${selectedPractice.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n提交成果：${selectedPractice.deliverable}\n\n完成标准：${selectedPractice.check}`;
        await navigator.clipboard.writeText(text);
        notify("实战作业内容已复制");
      } else if (selectedTool) {
        const text = `${selectedTool.title}\n\n工具用途：${selectedTool.purpose}\n\n输入资料：\n${selectedTool.inputs.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n使用步骤：\n${selectedTool.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n输出：${selectedTool.output}`;
        await navigator.clipboard.writeText(text);
        notify("配套工具内容已复制");
      } else if (selectedLesson) {
        const text = `${selectedLesson.title}\n\n课程目标：${selectedLesson.objective}\n\n核心内容：\n${selectedLesson.keyPoints.map((point, index) => `${index + 1}. ${point}`).join("\n")}\n\n实战作业：${selectedLesson.exercise}\n\n通关标准：${selectedLesson.pass}`;
        await navigator.clipboard.writeText(text);
        notify("课程内容已复制");
      } else if (selected?.id === "needs") {
        const notes = needsDiagnosisLayers.map((layer, index) => `${layer.title}\n记录：${needsDiagnosisNotes[index] || "未填写"}`).join("\n\n");
        const resultText = `客户需求诊断：从提问到判断\n客户原话：${needsCustomerWords || "未填写"}\n\n${notes}\n\n下一步：先复述客户真正关心的问题，再确认一个可执行动作。`;
        await navigator.clipboard.writeText(resultText);
        notify("三层提问练习已复制");
      } else if (selected?.id === "product-check") {
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

  const openCourseTool = (course: (typeof courseItems)[number], toolId: string) => {
    setCourseSection("tool");
    if (!authUser || !courseAccessIds.includes(course.id)) {
      openCourse(course);
      return;
    }
    const tool = courseToolEntries[course.id]?.find((entry) => entry.id === toolId);
    if (!tool) return;
    setSelected({
      id: `course-tool-${tool.id}`,
      kind: "工具",
      title: tool.title,
      summary: tool.summary,
      meta: "配套工具 · 独立工具",
      tags: ["课程", "工具", course.day, tool.label],
    });
  };

  const openCourseColumn = (course: (typeof courseItems)[number], column: CourseColumn) => {
    if (column !== "pass") setCourseSection(column);
    if (!authUser || !courseAccessIds.includes(course.id)) {
      openCourse(course);
      return;
    }
    if (column === "topic" && courseLessonContent[course.id]) {
      const lesson = courseLessonContent[course.id];
      setSelected({
        id: `course-lesson-${course.id}`,
        kind: "课程",
        title: lesson.title,
        summary: lesson.summary,
        meta: "课程主题 · 课程内容",
        tags: ["课程", "主题", course.day],
      });
      return;
    }
    if (column === "tool" && courseToolEntries[course.id]?.[0]) {
      const tool = courseToolEntries[course.id][0];
      setSelected({
        id: `course-tool-${tool.id}`,
        kind: "工具",
        title: tool.title,
        summary: tool.summary,
        meta: "配套工具 · 独立工具",
        tags: ["课程", "工具", course.day, tool.label],
      });
      return;
    }
    if (column === "practice" && coursePracticeContent[course.id]) {
      const practice = coursePracticeContent[course.id];
      setSelected({
        id: `course-practice-${course.id}`,
        kind: "练习",
        title: practice.title,
        summary: practice.summary,
        meta: "实战作业 · 独立作业",
        tags: ["课程", "作业", course.day],
      });
      return;
    }
    if (column === "pass" && coursePassContent[course.id]) {
      const pass = coursePassContent[course.id];
      setSelected({
        id: `course-pass-${course.id}`,
        kind: "课程",
        title: pass.title,
        summary: pass.summary,
        meta: "通关标准 · 独立验收",
        tags: ["课程", "通关", course.day],
      });
      return;
    }
    const target = courseColumnOpenIds[course.id]?.[column] ?? course.openId;
    if (target === "aftercare") {
      setSelectedCourseTrack("aesthetic");
      setAftercareDay(0);
      setAftercareOpen(true);
      return;
    }
    openItem(target);
  };

  const selectCourseTrack = (track: "growth" | "aesthetic") => {
    setSelectedCourseTrack(track);
    setCourseSection("topic");
    setAftercareOpen(false);
  };

  const selectCourseSection = (section: CourseSection) => {
    setCourseSection(section);
    setAftercareOpen(false);
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
              <button className={selectedCourseTrack === "growth" ? "selected" : ""} onClick={() => selectCourseTrack("growth")}>7天业绩倍增突击营</button>
              <button className={selectedCourseTrack === "aesthetic" ? "selected" : ""} onClick={() => selectCourseTrack("aesthetic")}>全案色彩美学精华班</button>
              <button>助教实战训练</button>
              <span>学习方式</span>
              <button className={courseSection === "topic" ? "selected" : ""} onClick={() => selectCourseSection("topic")}>课程主题</button>
              <button className={courseSection === "tool" ? "selected" : ""} onClick={() => selectCourseSection("tool")}>配套工具</button>
              <button className={courseSection === "practice" ? "selected" : ""} onClick={() => selectCourseSection("practice")}>实战作业</button>
              <div className="course-rule"><strong>通关规则</strong><p>看完不算完成。必须用真实客户、门店或方案完成一次应用。</p></div>
            </aside>
            <div className="course-list">
              {visibleCourseItems.map((course) => {
                const canAccess = Boolean(authUser && courseAccessIds.includes(course.id));
                const showAestheticAftercare = selectedCourseTrack === "aesthetic" && course.id === "aesthetic-day-4";
                const toolEntries = courseToolEntries[course.id] ?? [];
                return (
                  <div
                    key={course.day}
                    className={`${canAccess ? "course-module" : "course-module locked"} focus-${courseSection}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openCourse(course)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCourse(course); } }}
                  >
                    <span className="module-day">{course.day}</span>
                    {canAccess ? (
                      <>
                        <button type="button" className="module-cell module-main" onClick={(event) => { event.stopPropagation(); openCourseColumn(course, "topic"); }}><small>课程主题</small><strong>{course.title}</strong><p>{course.action}</p></button>
                        <div className="module-cell module-detail module-tools"><small>配套工具</small><div className="module-tool-list">{toolEntries.map((tool) => <button type="button" className="module-tool-link" key={tool.id} onClick={(event) => { event.stopPropagation(); openCourseTool(course, tool.id); }}>{tool.label}</button>)}</div></div>
                        <button type="button" className="module-cell module-detail" onClick={(event) => { event.stopPropagation(); openCourseColumn(course, "practice"); }}><small>实战作业</small><strong>{course.practice}</strong></button>
                        <button type="button" className="module-cell module-pass" onClick={(event) => { event.stopPropagation(); openCourseColumn(course, "pass"); }}>
                          <small>通关标准</small>
                          {showAestheticAftercare ? (
                            <>
                              <strong>{course.pass}</strong>
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
                        </button>
                      </>
                    ) : (
                      <span className="module-locked"><small>{authUser ? "课程权限" : "登录后查看"}</small><strong>{authUser ? "当前账号暂无该课程权限" : "登录后查看你已开通的课程"}</strong><p>{authUser ? "如需开通，请联系课程助教。" : "登录后系统会按账号权限显示内容。"}</p></span>
                    )}
                    <b className="module-arrow">→</b>
                  </div>
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
            {selectedPass ? (
              <div className="lesson-preview pass-preview">
                <div className="store-checklist-tip"><strong>通关目标</strong><span>{selectedPass.goal}</span></div>
                <section className="lesson-section">
                  <small>验收要求</small>
                  <div className="lesson-point-list">
                    {selectedPass.requirements.map((requirement, index) => <article key={requirement}><b>0{index + 1}</b><p>{requirement}</p></article>)}
                  </div>
                </section>
                <section className="lesson-section"><small>提交证据</small><p>{selectedPass.evidence}</p></section>
                <section className="lesson-pass-card"><small>判断标准</small><p>{selectedPass.standard}</p></section>
              </div>
            ) : selectedPractice ? (
              <div className="lesson-preview practice-preview">
                <div className="store-checklist-tip"><strong>作业目标</strong><span>{selectedPractice.goal}</span></div>
                <section className="lesson-section">
                  <small>执行步骤</small>
                  <div className="lesson-point-list">
                    {selectedPractice.steps.map((step, index) => <article key={step}><b>0{index + 1}</b><p>{step}</p></article>)}
                  </div>
                </section>
                <section className="lesson-section"><small>提交成果</small><p>{selectedPractice.deliverable}</p></section>
                <section className="lesson-pass-card"><small>完成标准</small><p>{selectedPractice.check}</p></section>
              </div>
            ) : selectedTool ? (
              <div className="lesson-preview tool-preview">
                <div className="store-checklist-tip"><strong>工具用途</strong><span>{selectedTool.purpose}</span></div>
                <section className="lesson-section">
                  <small>输入资料</small>
                  <div className="lesson-point-list">
                    {selectedTool.inputs.map((input, index) => <article key={input}><b>0{index + 1}</b><p>{input}</p></article>)}
                  </div>
                </section>
                <section className="lesson-section">
                  <small>使用步骤</small>
                  <div className="lesson-point-list">
                    {selectedTool.steps.map((step, index) => <article key={step}><b>0{index + 1}</b><p>{step}</p></article>)}
                  </div>
                </section>
                <section className="lesson-pass-card"><small>完成后输出</small><p>{selectedTool.output}</p></section>
              </div>
            ) : selectedLesson ? (
              <div className="lesson-preview">
                <div className="store-checklist-tip"><strong>本节课目标</strong><span>{selectedLesson.objective}</span></div>
                <section className="lesson-section">
                  <small>核心内容</small>
                  <div className="lesson-point-list">
                    {selectedLesson.keyPoints.map((point, index) => <article key={point}><b>0{index + 1}</b><p>{point}</p></article>)}
                  </div>
                </section>
                <section className="lesson-section"><small>实战作业</small><p>{selectedLesson.exercise}</p></section>
                <section className="lesson-pass-card"><small>通关标准</small><p>{selectedLesson.pass}</p></section>
              </div>
            ) : selected.id === "needs" ? (
              <div className="needs-course-preview">
                <div className="store-checklist-tip"><strong>本节课目标</strong><span>不急着介绍产品，先通过事实、感受、决策三层提问，判断客户真正关心的问题，再决定讲什么、证明什么、推进哪一步。</span></div>
                <label className="needs-customer-field"><span>先记录客户原话</span><textarea value={needsCustomerWords} onChange={(event) => setNeedsCustomerWords(event.target.value)} placeholder="例如：我先看看，网上同款便宜很多。" /></label>
                <div className="needs-layer-list">
                  {needsDiagnosisLayers.map((layer, layerIndex) => (
                    <section className="needs-layer-card" key={layer.index}>
                      <div className="needs-layer-heading"><span>{layer.index}</span><div><small>第{layerIndex + 1}层提问</small><h3>{layer.title}</h3></div></div>
                      <p className="needs-layer-goal">{layer.goal}</p>
                      <div className="needs-question-list">
                        {layer.questions.map((question) => <div key={question}><b>问</b><span>{question}</span></div>)}
                      </div>
                      <div className="needs-output"><small>这一层要得到</small><p>{layer.output}</p></div>
                      <label className="needs-note-field"><span>你的记录</span><textarea value={needsDiagnosisNotes[layerIndex] ?? ""} onChange={(event) => setNeedsDiagnosisNotes((current) => ({ ...current, [layerIndex]: event.target.value }))} placeholder="写客户原话、你的判断或证据" /></label>
                    </section>
                  ))}
                </div>
                <div className="needs-practice-card"><small>实战作业</small><p>选择一个最近未成交客户，完成三层提问记录。最后用一句话复述：客户真正关心的是____，下一步先确认____。</p></div>
                <p className="response-source-note">判断标准：先有事实，再谈感受；先找真正顾虑，再给局部建议；信息不足时不急着报价，不用产品参数替代需求诊断。</p>
              </div>
            ) : selected.id === "two-axis" ? (
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
            <button className="drawer-cta" onClick={selectedPass || selectedPractice || selectedTool || selectedLesson || selected.id === "needs" || selected.id === "product-check" || selected.id === "customer-segment" || selected.id === "aesthetic" || selected.id === "two-axis" || selected.kind === "模板" || selected.kind === "练习" ? copyTemplate : () => notify("已加入你的继续学习列表")}>
              {selectedPass ? "复制通关标准" : selectedPractice ? "复制实战作业" : selectedTool ? "复制工具内容" : selectedLesson ? "复制本节课内容" : selected.id === "needs" ? "复制三层提问练习" : selected.id === "product-check" ? "复制自检表文字" : selected.id === "customer-segment" ? "复制诊断结果" : selected.id === "aesthetic" ? "复制评分结果" : selected.id === "two-axis" ? "复制生成回应术" : selected.kind === "模板" || selected.kind === "练习" ? "复制并使用" : "开始学习"} <span>→</span>
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
