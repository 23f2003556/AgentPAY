import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { data, error } = await supabase
    .from("reputation")
    .select("*")
    .eq("service_id", params.serviceId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const successRate =
    data.total_requests > 0
      ? Math.round((data.successful_requests / data.total_requests) * 100)
      : 100;

  const tier =
    data.score >= 8 ? "gold" : data.score >= 5 ? "silver" : "bronze";

  return NextResponse.json({ ...data, success_rate: successRate, tier });
}
