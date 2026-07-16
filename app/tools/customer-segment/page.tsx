import { LearningHeader } from "@/app/components/layout/LearningHeader";
import { CustomerSegmentForm } from "@/app/components/tools/CustomerSegmentForm";

export default async function CustomerSegmentToolPage({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  const { courseId } = await searchParams;
  return <main className="site-shell tool-page"><LearningHeader active="/tools" /><div className="page content-page"><div className="page-intro"><span>实战工具 01</span><h1>把客户判断，变成可执行的跟进动作</h1><p>填写真实客户信息，系统将自动评分、识别风险，并形成可保存、可提交、可复盘的客户身份分层结论。</p></div><CustomerSegmentForm courseId={courseId} /></div></main>;
}
