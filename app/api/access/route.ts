import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ authenticated: false, courseIds: [] }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_course_access")
      .select("course_id, expires_at")
      .eq("user_id", userData.user.id);

    if (error) {
      return NextResponse.json({ error: "无法读取课程权限" }, { status: 500 });
    }

    const now = Date.now();
    const courseIds = (data ?? [])
      .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > now)
      .map((row) => row.course_id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.user.id,
        email: userData.user.email ?? "",
        displayName: userData.user.user_metadata?.display_name ?? userData.user.email ?? "学员",
      },
      courseIds,
    });
  } catch {
    return NextResponse.json({ error: "Supabase 尚未配置" }, { status: 503 });
  }
}

