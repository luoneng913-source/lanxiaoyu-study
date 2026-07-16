import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ submissionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { submissionId } = await context.params;
    const body = await request.json() as { content?: string; requiresRevision?: boolean; status?: string };
    const content = body.content?.trim();
    if (!content) return NextResponse.json({ error: "请填写助教反馈" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: feedback, error: feedbackError } = await supabase
      .from("assignment_feedback")
      .insert({ submission_id: submissionId, teacher_id: userData.user.id, content, requires_revision: Boolean(body.requiresRevision) })
      .select()
      .single();
    if (feedbackError || !feedback) return NextResponse.json({ error: feedbackError?.message || "没有反馈权限" }, { status: 403 });

    const status = body.requiresRevision ? "需修改" : (body.status === "已通过" ? "已通过" : "待批改");
    const { error: updateError } = await supabase.from("assignment_submissions").update({ status, updated_at: new Date().toISOString() }).eq("id", submissionId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ feedback, status });
  } catch {
    return NextResponse.json({ error: "提交助教反馈失败，请确认已执行第二阶段迁移 SQL" }, { status: 503 });
  }
}
