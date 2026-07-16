import { LearningHeader } from "@/app/components/layout/LearningHeader";
import { ToolRecordList } from "@/app/components/tools/ToolRecordList";

export default function RecordsPage() { return <main className="site-shell record-page"><LearningHeader active="/tools" /><div className="page content-page"><div className="page-intro"><span>我的实战记录</span><h1>让每一次客户判断，都能被复盘</h1><p>查看客户层级、下一步动作、执行状态与助教反馈；你只能看到自己的记录。</p></div><ToolRecordList /></div></main>; }
