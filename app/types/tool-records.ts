export type ScoreOption = 1 | 3 | 5;

export type CustomerSegmentInput = {
  customerName: string;
  contact: string;
  community: string;
  area: string;
  identity: string;
  isDecisionMaker: string;
  coDecisionMakers: string;
  renovationTimeline: string;
  budgetRange: string;
  painPoints: string;
  projectAuthenticityScore: ScoreOption;
  decisionAuthorityScore: ScoreOption;
  renovationTimingScore: ScoreOption;
  budgetClarityScore: ScoreOption;
  actionWillingnessScore: ScoreOption;
};

export type CustomerTierCode = "S" | "A" | "B" | "C" | "D";

export type CustomerSegmentResult = {
  totalScore: number;
  tier: { code: CustomerTierCode; title: string };
  judgement: string;
  missingInformation: string[];
  mainRisk: string;
  nextAction: string;
  prohibitedAction: string;
  followUpTiming: string;
};

export type ToolRecordStatus = "待执行" | "已执行" | "待复盘" | "已完成";

export type ToolRecord = {
  id: string;
  user_id: string;
  tool_id: string;
  title: string;
  input_data: CustomerSegmentInput;
  result_data: CustomerSegmentResult & { executionResult?: string };
  action_plan: string;
  status: ToolRecordStatus;
  created_at: string;
  updated_at: string;
  assignment_submission?: {
    id: string;
    status: string;
    feedback?: string;
  } | null;
};
