const scoreKeys = [
  "projectAuthenticityScore",
  "decisionAuthorityScore",
  "renovationTimingScore",
  "budgetClarityScore",
  "actionWillingnessScore",
];

const tierDefinitions = [
  {
    code: "S",
    min: 22,
    max: 25,
    title: "S级核心客户",
    judgement: "项目真实、决策条件清晰，属于应当优先投入时间推进的核心客户。",
    nextAction: "24小时内确认量房或方案沟通时间，把共同决策人同步纳入下一次沟通。",
    prohibitedAction: "不要只报单品价格，也不要在未确认整体方案前用降价替代推进。",
    followUpTiming: "24小时内",
  },
  {
    code: "A",
    min: 18,
    max: 21,
    title: "A级重点客户",
    judgement: "项目具备较高转化价值，但仍有一到两个关键条件需要确认。",
    nextAction: "72小时内补齐决策链、预算边界或装修节点，并约定一次带着方案的正式沟通。",
    prohibitedAction: "不要急于催成交；先让客户确认整体需求和比较标准。",
    followUpTiming: "72小时内",
  },
  {
    code: "B",
    min: 13,
    max: 17,
    title: "B级培育客户",
    judgement: "客户有真实线索，但信息或行动条件尚不完整，需要通过提问继续培育。",
    nextAction: "3—7天内围绕缺失信息做一次低压力回访，先补齐项目、决策、时间和预算中的关键空白。",
    prohibitedAction: "不要直接推套餐、频繁报价或把客户简单归为没预算。",
    followUpTiming: "3—7天内",
  },
  {
    code: "C",
    min: 8,
    max: 12,
    title: "C级长期客户",
    judgement: "当前决策成熟度较低，适合长期建立信任，不宜投入高强度成交动作。",
    nextAction: "14天内发送一条与其痛点相关的案例或提醒，持续记录变化后再决定是否升级跟进。",
    prohibitedAction: "不要连续追问成交时间，不要以促销制造虚假的紧迫感。",
    followUpTiming: "14天内",
  },
  {
    code: "D",
    min: 5,
    max: 7,
    title: "D级低效客户",
    judgement: "目前缺少足够项目真实性或行动条件，应以轻量维护为主，避免过度消耗团队资源。",
    nextAction: "30天内进行一次轻量内容触达，只有出现明确装修节点或决策变化时再重新诊断。",
    prohibitedAction: "不要反复电话追单、承诺低价或让设计师提前投入大量方案时间。",
    followUpTiming: "30天内",
  },
];

const missingFieldLabels = [
  ["contact", "联系方式"],
  ["community", "小区"],
  ["area", "面积"],
  ["identity", "客户真实身份"],
  ["isDecisionMaker", "是否决策人"],
  ["renovationTimeline", "装修时间"],
  ["budgetRange", "预算范围"],
  ["painPoints", "当前痛点"],
];

function valueIsBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function findTier(totalScore) {
  return tierDefinitions.find((tier) => totalScore >= tier.min && totalScore <= tier.max);
}

function buildMainRisk(input, missingInformation, totalScore) {
  if (missingInformation.length > 0) {
    return `关键信息尚未补齐：${missingInformation.join("、")}。在这些事实不清楚前，容易把跟进动作做成主观猜测。`;
  }
  if (input.decisionAuthorityScore <= 1) {
    return "决策权不足，当前沟通对象可能无法推动下一步，需先确认共同决策人和比较标准。";
  }
  if (input.renovationTimingScore <= 1) {
    return "装修节点较远或不明确，短期成交预期偏高会造成无效跟进。";
  }
  if (input.budgetClarityScore <= 1) {
    return "预算边界不清晰，方案与报价可能无法建立有效比较基础。";
  }
  if (totalScore < 18) {
    return "行动意愿仍需通过一次明确的下一步邀约验证，不能只凭聊天氛围判断。";
  }
  return "需要持续验证共同决策人是否与当前判断一致，避免单点沟通后信息失真。";
}

export function validateCustomerSegmentInput(input) {
  const missing = [];
  if (valueIsBlank(input.customerName)) missing.push("客户姓名");
  if (valueIsBlank(input.contact)) missing.push("联系方式");
  return missing;
}

export function calculateCustomerSegment(input) {
  for (const key of scoreKeys) {
    if (![1, 3, 5].includes(input[key])) {
      throw new Error("五项评分只能选择 1、3 或 5 分");
    }
  }

  const totalScore = scoreKeys.reduce((total, key) => total + input[key], 0);
  const tier = findTier(totalScore);
  if (!tier) throw new Error("总分不在有效客户层级范围内");

  const missingInformation = missingFieldLabels
    .filter(([key]) => valueIsBlank(input[key]))
    .map(([, label]) => label);

  return {
    totalScore,
    tier: { code: tier.code, title: tier.title },
    judgement: tier.judgement,
    missingInformation,
    mainRisk: buildMainRisk(input, missingInformation, totalScore),
    nextAction: tier.nextAction,
    prohibitedAction: tier.prohibitedAction,
    followUpTiming: tier.followUpTiming,
  };
}

export const customerSegmentScoreOptions = [1, 3, 5];
