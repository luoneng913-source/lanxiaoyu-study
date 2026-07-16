import type { CustomerSegmentInput, CustomerSegmentResult, ScoreOption } from "@/app/types/tool-records";

export const scoreOptions: ScoreOption[] = [1, 3, 5];

const scoreKeys: (keyof Pick<CustomerSegmentInput,
  "projectAuthenticityScore" | "decisionAuthorityScore" | "renovationTimingScore" | "budgetClarityScore" | "actionWillingnessScore"
>)[] = ["projectAuthenticityScore", "decisionAuthorityScore", "renovationTimingScore", "budgetClarityScore", "actionWillingnessScore"];

const tiers = [
  [22, 25, "S", "S级核心客户", "项目真实、决策条件清晰，属于应当优先投入时间推进的核心客户。", "24小时内确认量房或方案沟通时间，把共同决策人同步纳入下一次沟通。", "不要只报单品价格，也不要在未确认整体方案前用降价替代推进。", "24小时内"],
  [18, 21, "A", "A级重点客户", "项目具备较高转化价值，但仍有一到两个关键条件需要确认。", "72小时内补齐决策链、预算边界或装修节点，并约定一次带着方案的正式沟通。", "不要急于催成交；先让客户确认整体需求和比较标准。", "72小时内"],
  [13, 17, "B", "B级培育客户", "客户有真实线索，但信息或行动条件尚不完整，需要通过提问继续培育。", "3—7天内围绕缺失信息做一次低压力回访，先补齐项目、决策、时间和预算中的关键空白。", "不要直接推套餐、频繁报价或把客户简单归为没预算。", "3—7天内"],
  [8, 12, "C", "C级长期客户", "当前决策成熟度较低，适合长期建立信任，不宜投入高强度成交动作。", "14天内发送一条与其痛点相关的案例或提醒，持续记录变化后再决定是否升级跟进。", "不要连续追问成交时间，不要以促销制造虚假的紧迫感。", "14天内"],
  [5, 7, "D", "D级低效客户", "目前缺少足够项目真实性或行动条件，应以轻量维护为主，避免过度消耗团队资源。", "30天内进行一次轻量内容触达，只有出现明确装修节点或决策变化时再重新诊断。", "不要反复电话追单、承诺低价或让设计师提前投入大量方案时间。", "30天内"],
] as const;

const labels: [keyof CustomerSegmentInput, string][] = [
  ["contact", "联系方式"], ["community", "小区"], ["area", "面积"], ["identity", "客户真实身份"],
  ["isDecisionMaker", "是否决策人"], ["renovationTimeline", "装修时间"], ["budgetRange", "预算范围"], ["painPoints", "当前痛点"],
];

export const initialCustomerInput: CustomerSegmentInput = {
  customerName: "", contact: "", community: "", area: "", identity: "", isDecisionMaker: "", coDecisionMakers: "", renovationTimeline: "", budgetRange: "", painPoints: "",
  projectAuthenticityScore: 1, decisionAuthorityScore: 1, renovationTimingScore: 1, budgetClarityScore: 1, actionWillingnessScore: 1,
};

export function calculateSegment(input: CustomerSegmentInput): CustomerSegmentResult {
  const totalScore = scoreKeys.reduce((total, key) => total + input[key], 0);
  const tier = tiers.find(([min, max]) => totalScore >= min && totalScore <= max);
  if (!tier) throw new Error("五项评分只能选择 1、3 或 5 分");
  const missingInformation = labels.filter(([key]) => !String(input[key] ?? "").trim()).map(([, label]) => label);
  let mainRisk = "需要持续验证共同决策人是否与当前判断一致，避免单点沟通后信息失真。";
  if (missingInformation.length) mainRisk = `关键信息尚未补齐：${missingInformation.join("、")}。在这些事实不清楚前，容易把跟进动作做成主观猜测。`;
  else if (input.decisionAuthorityScore === 1) mainRisk = "决策权不足，当前沟通对象可能无法推动下一步，需先确认共同决策人和比较标准。";
  else if (input.renovationTimingScore === 1) mainRisk = "装修节点较远或不明确，短期成交预期偏高会造成无效跟进。";
  else if (input.budgetClarityScore === 1) mainRisk = "预算边界不清晰，方案与报价可能无法建立有效比较基础。";
  return { totalScore, tier: { code: tier[2], title: tier[3] }, judgement: tier[4], missingInformation, mainRisk, nextAction: tier[5], prohibitedAction: tier[6], followUpTiming: tier[7] };
}
