"use client";

import { useEffect, useMemo, useState } from "react";
import type { CustomerSegmentInput, CustomerSegmentResult, ScoreOption } from "@/app/types/tool-records";
import { calculateSegment, initialCustomerInput, scoreOptions } from "./customer-segment-client";

type AssignmentOption = { id: string; title: string; courseId?: string; dayNumber?: number };
type SavedRecord = { id: string; title: string; result_data: CustomerSegmentResult; action_plan: string };

const textFields: { key: keyof Pick<CustomerSegmentInput, "customerName" | "contact" | "community" | "area" | "identity" | "coDecisionMakers" | "renovationTimeline" | "budgetRange">; label: string; placeholder: string }[] = [
  { key: "customerName", label: "客户姓名 *", placeholder: "例如：张女士" },
  { key: "contact", label: "联系方式 *", placeholder: "手机或微信" },
  { key: "community", label: "小区", placeholder: "例如：云栖花园" },
  { key: "area", label: "面积", placeholder: "例如：128㎡" },
  { key: "identity", label: "客户真实身份", placeholder: "例如：业主、介绍人、设计师" },
  { key: "coDecisionMakers", label: "共同决策人", placeholder: "例如：配偶、父母；没有则填无" },
  { key: "renovationTimeline", label: "装修时间", placeholder: "例如：1个月内、年底前" },
  { key: "budgetRange", label: "预算范围", placeholder: "例如：30—40万" },
];

const scoreFields: { key: keyof Pick<CustomerSegmentInput, "projectAuthenticityScore" | "decisionAuthorityScore" | "renovationTimingScore" | "budgetClarityScore" | "actionWillingnessScore">; label: string; hint: string }[] = [
  { key: "projectAuthenticityScore", label: "项目真实性评分", hint: "项目是否明确、真实、可验证" },
  { key: "decisionAuthorityScore", label: "决策权评分", hint: "当前对象是否有决定权" },
  { key: "renovationTimingScore", label: "装修时间评分", hint: "装修节点是否清晰且临近" },
  { key: "budgetClarityScore", label: "预算清晰度评分", hint: "预算是否明确、可承接" },
  { key: "actionWillingnessScore", label: "行动意愿评分", hint: "是否愿意确认下一步行动" },
];

function conclusionText(result: CustomerSegmentResult) {
  return [
    `客户身份分层结论｜${result.tier.title}`, `总分：${result.totalScore}/25`, `当前判断：${result.judgement}`,
    `缺失信息：${result.missingInformation.length ? result.missingInformation.join("、") : "暂无"}`,
    `主要风险：${result.mainRisk}`, `推荐下一步动作：${result.nextAction}`, `禁止做法：${result.prohibitedAction}`, `建议跟进时间：${result.followUpTiming}`,
  ].join("\n");
}

export function CustomerSegmentForm({ courseId }: { courseId?: string }) {
  const [input, setInput] = useState<CustomerSegmentInput>(initialCustomerInput);
  const [result, setResult] = useState<CustomerSegmentResult | null>(null);
  const [record, setRecord] = useState<SavedRecord | null>(null);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"save" | "submit" | "" >("");

  useEffect(() => {
    fetch(`/api/assignments/available${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ""}`)
      .then((response) => response.ok ? response.json() : { assignments: [] })
      .then((data) => setAssignments(data.assignments ?? []))
      .catch(() => setAssignments([]));
  }, [courseId]);

  const canSave = useMemo(() => Boolean(result && input.customerName.trim() && input.contact.trim()), [input, result]);
  const updateField = (key: keyof CustomerSegmentInput, value: string | ScoreOption) => setInput((current) => ({ ...current, [key]: value }));

  const generate = () => {
    if (!input.customerName.trim() || !input.contact.trim()) { setMessage("请先填写客户姓名和联系方式，再生成结论。"); return; }
    setResult(calculateSegment(input)); setRecord(null); setMessage("已生成客户分层结论。确认后可保存为实战记录。");
  };
  const save = async () => {
    if (!canSave || !result) return;
    setBusy("save"); setMessage("");
    try {
      const response = await fetch("/api/tools/customer-segment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setRecord(data.record); setResult(data.record.result_data); setMessage("已保存到我的实战记录，可继续提交为课程作业。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。"); }
    finally { setBusy(""); }
  };
  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(conclusionText(result)); setMessage("结论已复制，可直接发给助教或用于跟进计划。"); }
    catch { setMessage("复制失败，请手动选择结论文字复制。"); }
  };
  const submit = async () => {
    if (!record) { setMessage("请先保存记录，再提交为作业。"); return; }
    if (!assignmentId) { setMessage("请选择要关联的课程作业。若没有选项，请先让助教在该课程章节创建作业。 "); return; }
    setBusy("submit"); setMessage("");
    try {
      const response = await fetch(`/api/tool-records/${record.id}/submit-assignment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "提交失败"); setMessage("已提交为课程作业，助教可在作业与通关中查看并反馈。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。"); }
    finally { setBusy(""); }
  };
  const reset = () => { setInput(initialCustomerInput); setResult(null); setRecord(null); setAssignmentId(""); setMessage("已清空，开始下一位客户的诊断。"); };

  return (
    <div className="segment-tool-layout">
      <section className="segment-form-panel">
        <div className="segment-panel-heading"><span>填写真实业务信息</span><h2>门店客户身份分层转化工具</h2><p>用事实评分，而不是凭感觉判断客户优先级。</p></div>
        <div className="segment-field-grid">
          {textFields.map((field) => <label key={field.key}><span>{field.label}</span><input value={input[field.key]} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value)} /></label>)}
          <label><span>是否决策人</span><select value={input.isDecisionMaker} onChange={(event) => updateField("isDecisionMaker", event.target.value)}><option value="">请选择</option><option value="是">是</option><option value="否">否</option><option value="待确认">待确认</option></select></label>
          <label className="segment-field-full"><span>当前痛点</span><textarea value={input.painPoints} placeholder="记录客户当前最在意、最担心或最急于解决的问题。" onChange={(event) => updateField("painPoints", event.target.value)} /></label>
        </div>
        <div className="score-area"><div><span>五项真实评分</span><p>每项仅可选 1、3 或 5 分，总分 25 分。</p></div>{scoreFields.map((field) => <div className="score-row" key={field.key}><div><strong>{field.label}</strong><small>{field.hint}</small></div><div className="score-options">{scoreOptions.map((score) => <button type="button" key={score} className={input[field.key] === score ? "selected" : ""} onClick={() => updateField(field.key, score)}>{score}分</button>)}</div></div>)}</div>
        <div className="segment-actions no-print"><button type="button" className="primary-action" onClick={generate}>生成结果</button><button type="button" onClick={save} disabled={!canSave || busy === "save"}>{busy === "save" ? "保存中…" : "保存记录"}</button><button type="button" onClick={copy} disabled={!result}>复制结论</button><button type="button" onClick={() => window.print()} disabled={!result}>导出PDF</button><button type="button" onClick={reset}>重新填写</button></div>
        {message && <p className="segment-message" role="status">{message}</p>}
      </section>
      <aside className="segment-result-panel">
        {!result ? <div className="segment-empty"><span>等待判断</span><h2>填写后生成客户分层</h2><p>系统会输出客户层级、风险、下一步动作和建议跟进时间。</p></div> : <><div className={`segment-tier tier-${result.tier.code.toLowerCase()}`}><span>客户层级</span><strong>{result.tier.title}</strong><em>{result.totalScore}<small>/25分</small></em></div><ResultBlock title="当前判断" text={result.judgement} /><ResultBlock title="缺失信息" text={result.missingInformation.length ? result.missingInformation.join("、") : "暂无，仍建议与共同决策人复核一次。"} /><ResultBlock title="主要风险" text={result.mainRisk} /><ResultBlock title="推荐下一步动作" text={result.nextAction} /><ResultBlock title="禁止做法" text={result.prohibitedAction} /><ResultBlock title="建议跟进时间" text={result.followUpTiming} />
          <div className="submit-box no-print"><span>课程和作业关联</span><select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}><option value="">选择要提交的课程作业</option>{assignments.map((assignment) => <option value={assignment.id} key={assignment.id}>{assignment.dayNumber ? `DAY ${assignment.dayNumber}｜` : ""}{assignment.title}</option>)}</select><button type="button" className="primary-action" onClick={submit} disabled={busy === "submit"}>{busy === "submit" ? "提交中…" : "提交为作业"}</button>{!assignments.length && <small>没有可选作业时，请让助教先在已开通课程下创建作业。</small>}</div>
        </>}</aside>
    </div>
  );
}

function ResultBlock({ title, text }: { title: string; text: string }) { return <section className="segment-result-block"><span>{title}</span><p>{text}</p></section>; }
