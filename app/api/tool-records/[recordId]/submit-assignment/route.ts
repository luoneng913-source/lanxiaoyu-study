import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ recordId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { recordId } = await context.params;
    const { assignmentId } = await request.json() as { assignmentId?: string };
    if (!assignmentId) return NextResponse.json({ error: "请先选择要关联的课程作业" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: record, error: recordError } = await supabase
      .from("tool_records")
      .select("id,user_id,title,result_data,action_plan")
      .eq("id", recordId)
      .maybeSingle();
    if (recordError || !record || record.user_id !== user.id) {
      return NextResponse.json({ error: "记录不存在或无提交权限" }, { status: 404 });
    }

    const admin = createSupabaseAdminClient();
    const { data: assignment, error: assignmentError } = await admin
      .from("assignments")
      .select("id,title,module_id,course_modules!inner(course_id)")
      .eq("id", assignmentId)
      .maybeSingle();
    if (assignmentError || !assignment) return NextResponse.json({ error: "未找到该课程作业" }, { status: 404 });

    const moduleData = assignment.course_modules as unknown as { course_id: string } | { course_id: string }[];
    const courseId = Array.isArray(moduleData) ? moduleData[0]?.course_id : moduleData?.course_id;
    if (!courseId) return NextResponse.json({ error: "作业未关联有效课程" }, { status: 409 });

    const { data: access } = await supabase
      .from("user_course_access")
      .select("expires_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (!access || (access.expires_at && new Date(access.expires_at).getTime() <= Date.now())) {
      return NextResponse.json({ error: "当前账号没有该课程的作业提交权限" }, { status: 403 });
    }

    const result = record.result_data as Record<string, unknown>;
    const textContent = [
      `工具记录：${record.title}`,
      `客户层级：${String((result.tier as { code?: string; title?: string } | undefined)?.code ?? "")}级 · ${String((result.tier as { code?: string; title?: string } | undefined)?.title ?? "")}`,
      `总分：${String(result.totalScore ?? "")}/25`,
      `当前判断：${String(result.judgement ?? "")}`,
      `下一步动作：${record.action_plan}`,
      `主要风险：${String(result.mainRisk ?? "")}`,
    ].join("\n");

    const { data, error } = await supabase
      .from("assignment_submissions")
      .upsert({
        assignment_id: assignmentId,
        user_id: user.id,
        tool_record_id: record.id,
        status: "已提交",
        text_content: textContent,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "assignment_id,user_id" })
      .select()
      .single();
    if (error || !data) return NextResponse.json({ error: error?.message || "作业提交失败" }, { status: 500 });

    return NextResponse.json({ submission: data, message: "已作为课程作业提交，等待助教反馈" });
  } catch {
    return NextResponse.json({ error: "作业提交服务暂时不可用，请确认已执行第二阶段迁移 SQL" }, { status: 503 });
  }
}
