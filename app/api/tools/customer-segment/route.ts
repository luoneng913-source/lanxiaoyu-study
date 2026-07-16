import { NextResponse } from "next/server";
import { calculateCustomerSegment, validateCustomerSegmentInput } from "@/app/lib/customer-segment.mjs";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ error: "请先登录后保存实战记录" }, { status: 401 });

    const input = await request.json();
    const missing = validateCustomerSegmentInput(input);
    if (missing.length > 0) {
      return NextResponse.json({ error: `请填写：${missing.join("、")}` }, { status: 400 });
    }

    let result;
    try {
      result = calculateCustomerSegment(input);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "评分数据无效" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tool_records")
      .insert({
        user_id: user.id,
        tool_id: "customer-identity-segment",
        title: `客户身份分层｜${input.customerName}`,
        input_data: input,
        result_data: result,
        action_plan: result.nextAction,
        status: "待执行",
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "保存记录失败，请确认已执行第二阶段迁移 SQL" }, { status: 500 });
    }

    return NextResponse.json({ record: data, result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "工具服务暂时不可用，请检查 Supabase 环境变量与迁移状态" }, { status: 503 });
  }
}
