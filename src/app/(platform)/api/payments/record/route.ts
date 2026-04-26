import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/platform/db";

// Called by Person A's webhook handler after verifying Alby signature
export async function POST(req: NextRequest) {
  const { payment_hash, service_id, amount_sats, buyer_id, action } = await req.json();

  if (action === "create") {
    // Record pending payment when invoice is created
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({ payment_hash, service_id, amount_sats, buyer_id, status: "pending" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payment: data });
  }

  if (action === "confirm") {
    // Confirm payment — reputation trigger fires automatically in DB
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("payment_hash", payment_hash)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payment: data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
