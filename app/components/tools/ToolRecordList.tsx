"use client";

import { useEffect, useState } from "react";
import type { ToolRecord, ToolRecordStatus } from "@/app/types/tool-records";

const statuses: ToolRecordStatus[] = ["待执行", "已执行", "待复盘", "已完成"];

export function ToolRecordList({ compact = false }: { compact?: boolean }) {
  const [records, setRecords] = useState<ToolRecord[]>([]);
  const [message, setMessage] = useState("正在读取实战记录…");
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => { fetch("/api/tool-records").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "读取失败"); return data; }).then((data) => { setRecords(data.records ?? []); setMessage(""); }).catch((error) => setMessage(error instanceof Error ? error.message : "暂时无法读取实战记录。")); }, []);
  const update = async (record: ToolRecord, status: ToolRecordStatus, executionResult?: string) => {
    setSaving(record.id); try { const response = await fetch(`/api/tool-records/${record.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, executionResult }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "保存失败"); setRecords((current) => current.map((item) => item.id === record.id ? data.record : item)); } catch (error) { setMessage(error instanceof Error ? error.message : "更新失败"); } finally { setSaving(null); }
  };
  if (message && records.length === 0) return <p className="record-note">{message}</p>;
  if (!records.length) return <div className="record-empty"><strong>还没有实战记录</strong><p>完成一次客户身份分层后，记录会保存在这里，供你跟进、复盘和提交作业。</p></div>;
  return <div className={compact ? "record-list compact" : "record-list"}>{records.map((record) => { const input = record.input_data; const result = record.result_data; const submissions = (record as ToolRecord & { assignment_submissions?: { id: string; status: string; assignment_feedback?: { content: string; requires_revision: boolean }[] }[] }).assignment_submissions ?? []; const feedback = submissions.flatMap((submission) => submission.assignment_feedback ?? []).at(0); return <article className="record-card" key={record.id}><div className="record-card-top"><div><span>门店客户身份分层转化工具</span><h2>{input.customerName || record.title}</h2><small>{new Date(record.created_at).toLocaleString("zh-CN")}</small></div><b className={`record-tier tier-${result.tier?.code?.toLowerCase() ?? "d"}`}>{result.tier?.title ?? "待判断"}</b></div><div className="record-summary"><p><strong>下一步动作：</strong>{record.action_plan}</p><p><strong>执行结果：</strong>{result.executionResult || "尚未填写"}</p>{feedback && <p><strong>助教反馈：</strong>{feedback.content}{feedback.requires_revision ? "（需修改）" : ""}</p>}</div>{!compact && <div className="record-controls"><label>执行状态<select value={record.status} onChange={(event) => update(record, event.target.value as ToolRecordStatus, result.executionResult)} disabled={saving === record.id}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>执行结果<textarea defaultValue={result.executionResult ?? ""} placeholder="记录实际跟进结果、客户回应和下一步安排。" onBlur={(event) => { if (event.target.value !== (result.executionResult ?? "")) update(record, record.status, event.target.value); }} /></label></div>}</article>; })}</div>;
}
