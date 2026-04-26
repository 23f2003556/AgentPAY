import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/platform/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const { data, error } = await supabase
    .from("reputation")
    .select("*")
    .eq("service_id", serviceId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const successRate = data.total_requests > 0
    ? Math.round((data.successful_requests / data.total_requests) * 100)
    : 100;

  return NextResponse.json({
    ...data,
    success_rate: successRate,
    tier: data.score >= 8 ? "gold" : data.score >= 5 ? "silver" : "bronze",
  });
}
