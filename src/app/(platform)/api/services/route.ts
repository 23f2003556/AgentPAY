import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/platform/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const maxPrice = searchParams.get("max_price");
  const minScore = searchParams.get("min_score");
  const sortBy = searchParams.get("sort") || "score"; // score | price | newest

  // Join services with reputation
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
  if (maxPrice) query = query.lte("price_sats", parseInt(maxPrice));

  // Sorting
  if (sortBy === "price") query = query.order("price_sats", { ascending: true });
  else if (sortBy === "newest") query = query.order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false }); // default

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  // Post-filter by reputation score (can't do this in supabase join easily)
  let services = data || [];
  if (minScore) {
    services = services.filter(s => 
      (s.reputation?.[0]?.score ?? 5) >= parseFloat(minScore)
    );
  }

  // Sort by score if requested
  if (sortBy === "score") {
    services.sort((a, b) => 
      (b.reputation?.[0]?.score ?? 5) - (a.reputation?.[0]?.score ?? 5)
    );
  }

  return NextResponse.json({ services, count: services.length });
}
