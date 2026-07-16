import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const requestedCourseId = new URL(request.url).searchParams.get("courseId");
    const { data: accesses, error: accessError } = await supabase
      .from("user_course_access")
      .select("course_id,expires_at")
      .eq("user_id", user.id);
    if (accessError) return NextResponse.json({ error: accessError.message }, { status: 500 });

    const now = Date.now();
    const allowedCourseIds = (accesses ?? [])
      .filter((access) => !access.expires_at || new Date(access.expires_at).getTime() > now)
      .map((access) => access.course_id)
      .filter((courseId) => !requestedCourseId || courseId === requestedCourseId);
    if (allowedCourseIds.length === 0) return NextResponse.json({ assignments: [] });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("assignments")
      .select("id,title,course_modules!inner(course_id,day_number)")
      .in("course_modules.course_id", allowedCourseIds)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const assignments = (data ?? []).map((assignment) => {
      const moduleData = assignment.course_modules as unknown as { course_id: string; day_number: number } | { course_id: string; day_number: number }[];
      const module = Array.isArray(moduleData) ? moduleData[0] : moduleData;
      return { id: assignment.id, title: assignment.title, courseId: module?.course_id, dayNumber: module?.day_number };
    });
    return NextResponse.json({ assignments });
  } catch {
    return NextResponse.json({ error: "无法读取可提交作业，请确认已执行第一、二阶段迁移 SQL" }, { status: 503 });
  }
}
