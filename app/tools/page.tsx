import Link from "next/link";
import { LearningHeader } from "@/app/components/layout/LearningHeader";

export default function ToolsPage() {
  return <main className="site-shell tool-page"><LearningHeader active="/tools" /><div className="page content-page"><div className="page-intro"><span>实战工具</span><h1>把知识变成现场可执行动作</h1><p>工具将真实业务信息转成结论、动作与复盘记录。完成后可保存为自己的实战资产，并提交为课程作业。</p></div><div className="tool-entry-grid"><Link href="/tools/customer-segment" className="tool-entry-card"><span>工具 01</span><h2>门店客户身份分层转化工具</h2><p>用五项真实评分识别客户优先级，自动给出风险、下一步动作与跟进时间。</p><strong>开始填写 →</strong></Link><Link href="/records" className="tool-entry-card secondary"><span>实战档案</span><h2>我的实战记录</h2><p>查看客户分层、执行状态、执行结果和助教反馈，形成可复盘的经营过程。</p><strong>查看记录 →</strong></Link></div></div></main>;
}
