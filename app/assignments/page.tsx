import Link from "next/link";
import { LearningHeader } from "@/app/components/layout/LearningHeader";
import { ToolRecordList } from "@/app/components/tools/ToolRecordList";

export default function AssignmentsPage() { return <main className="site-shell record-page"><LearningHeader active="/assignments" /><div className="page content-page"><div className="page-intro"><span>作业与通关</span><h1>提交真实作业，等待助教反馈</h1><p>已保存并关联课程作业的实战工具记录会出现在这里；提交后由助教查看结论并给出反馈。</p><Link className="inline-action" href="/tools/customer-segment">打开客户身份分层工具 →</Link></div><ToolRecordList /></div></main>; }
