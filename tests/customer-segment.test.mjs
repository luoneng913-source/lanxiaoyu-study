import assert from "node:assert/strict";
import test from "node:test";
import { calculateCustomerSegment, validateCustomerSegmentInput } from "../app/lib/customer-segment.mjs";

const completeInput = (score) => ({
  customerName: "王女士",
  contact: "13800000000",
  community: "春江花园",
  area: "120㎡",
  identity: "业主",
  isDecisionMaker: "是",
  coDecisionMakers: "配偶",
  renovationTimeline: "一个月内",
  budgetRange: "30-40万",
  painPoints: "担心方案落地",
  projectAuthenticityScore: score,
  decisionAuthorityScore: score,
  renovationTimingScore: score,
  budgetClarityScore: score,
  actionWillingnessScore: score,
});

test("classifies the five score boundaries from S to D", () => {
  assert.equal(calculateCustomerSegment(completeInput(5)).tier.code, "S");

  const score21 = completeInput(5);
  score21.budgetClarityScore = 3;
  score21.actionWillingnessScore = 3;
  assert.equal(calculateCustomerSegment(score21).tier.code, "A");

  const score17 = completeInput(3);
  score17.projectAuthenticityScore = 5;
  score17.decisionAuthorityScore = 5;
  score17.actionWillingnessScore = 1;
  assert.equal(calculateCustomerSegment(score17).tier.code, "B");

  const score11 = completeInput(1);
  score11.projectAuthenticityScore = 3;
  score11.decisionAuthorityScore = 3;
  score11.renovationTimingScore = 3;
  assert.equal(calculateCustomerSegment(score11).tier.code, "C");

  assert.equal(calculateCustomerSegment(completeInput(1)).tier.code, "D");

  const invalidScore = completeInput(3);
  invalidScore.actionWillingnessScore = 2;
  // A calculation must reject scores outside the fixed 1/3/5 rule.
  assert.throws(() => calculateCustomerSegment(invalidScore), /1、3 或 5/);
});

test("produces a non-empty action result and names missing business information", () => {
  const input = completeInput(3);
  input.community = "";
  input.budgetRange = "";
  const result = calculateCustomerSegment(input);

  assert.equal(result.totalScore, 15);
  assert.equal(result.tier.code, "B");
  assert.match(result.judgement, /客户/);
  assert.match(result.nextAction, /确认|补齐|跟进/);
  assert.deepEqual(result.missingInformation, ["小区", "预算范围"]);
});

test("requires a customer name and contact before a record can be saved", () => {
  const noName = completeInput(3);
  noName.customerName = "";
  assert.deepEqual(validateCustomerSegmentInput(noName), ["客户姓名"]);

  const noContact = completeInput(3);
  noContact.contact = "";
  assert.deepEqual(validateCustomerSegmentInput(noContact), ["联系方式"]);
});
