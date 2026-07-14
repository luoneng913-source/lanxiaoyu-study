import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId } = await context.params;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: access, error: accessError } = await supabase
      .from("user_course_access")
      .select("expires_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (accessError || !access || (access.expires_at && new Date(access.expires_at).getTime() <= Date.now())) {
      return NextResponse.json({ error: "当前账号暂无该课程资料权限" }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    const { data: course, error: courseError } = await admin
      .from("courses")
      .select("title, storage_bucket, storage_path")
      .eq("id", courseId)
      .eq("is_published", true)
      .maybeSingle();

    if (courseError || !course?.storage_path) {
      return NextResponse.json({ error: "该课程暂未配置可下载资料" }, { status: 404 });
    }

    const { data: signed, error: signedError } = await admin.storage
      .from(course.storage_bucket || "course-files")
      .createSignedUrl(course.storage_path, 60);

    if (signedError || !signed?.signedUrl) {
      return NextResponse.json({ error: "下载链接生成失败" }, { status: 500 });
    }

    return NextResponse.json({ url: signed.signedUrl, expiresIn: 60, title: course.title });
  } catch {
    return NextResponse.json({ error: "下载服务尚未配置" }, { status: 503 });
  }
}

