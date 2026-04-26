import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

type ServiceWithRep = {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint_url: string;
  price_sats: number;
  provider_id: string;
  provider_name: string;
  is_active: boolean;
  created_at: string;
  reputation: Array<{
    score: number;
    total_requests: number;
    successful_requests: number;
    total_sats_earned: number;
    last_updated: string;
  }>;
};

const scoreOf = (s: ServiceWithRep) => s.reputation?.[0]?.score ?? 5;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const maxPrice = searchParams.get("max_price");
  const minScore = searchParams.get("min_score");
  const sortBy = (searchParams.get("sort") || "score") as "score" | "price" | "newest";

  let query = supabase
    .from("services")
    .select(`
      *,
      reputation (
        score,
        total_requests,
        successful_requests,
        total_sats_earned,
        last_updated
      )
    `)
    .eq("is_active", true);

  if (category) query = query.eq("category", category);
  if (maxPrice) query = query.lte("price_sats", parseInt(maxPrice, 10));

  if (sortBy === "price") query = query.order("price_sats", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("services list DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let services = (data || []) as ServiceWithRep[];

  if (minScore) {
    const min = parseFloat(minScore);
    services = services.filter((s) => scoreOf(s) >= min);
  }

  if (sortBy === "score") {
    services.sort((a, b) => scoreOf(b) - scoreOf(a));
  }

  return NextResponse.json({ services, count: services.length });
}
