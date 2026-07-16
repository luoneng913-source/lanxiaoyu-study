import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data, error } = await supabase
      .from("tool_records")
      .select("id,user_id,tool_id,title,input_data,result_data,action_plan,status,created_at,updated_at,assignment_submissions(id,status,assignment_feedback(content,requires_revision,created_at))")
      .eq("tool_id", "customer-identity-segment")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ records: data ?? [] });
  } catch {
    return NextResponse.json({ error: "无法读取实战记录，请确认已执行第二阶段迁移 SQL" }, { status: 503 });
  }
}
