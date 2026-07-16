import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ recordId: string }> };
const statusOptions = new Set(["待执行", "已执行", "待复盘", "已完成"]);

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { recordId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const body = await request.json() as { status?: string; executionResult?: string };
    if (!body.status || !statusOptions.has(body.status)) {
      return NextResponse.json({ error: "执行状态无效" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("tool_records")
      .select("result_data")
      .eq("id", recordId)
      .maybeSingle();
    if (existingError || !existing) return NextResponse.json({ error: "记录不存在或无访问权限" }, { status: 404 });

    const resultData = {
      ...(typeof existing.result_data === "object" && existing.result_data ? existing.result_data : {}),
      executionResult: (body.executionResult || "").trim(),
    };
    const { data, error } = await supabase
      .from("tool_records")
      .update({ status: body.status, result_data: resultData })
      .eq("id", recordId)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "更新失败" }, { status: 500 });
    return NextResponse.json({ record: data });
  } catch {
    return NextResponse.json({ error: "更新记录失败" }, { status: 503 });
  }
}
