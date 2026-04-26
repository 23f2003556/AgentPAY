import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, payment_hash, service_id, amount_sats, buyer_id } = body as {
    action?: string;
    payment_hash?: string;
    service_id?: string;
    amount_sats?: number;
    buyer_id?: string | null;
  };

  if (!action || !payment_hash) {
    return NextResponse.json(
      { error: "Missing required fields: action, payment_hash" },
      { status: 400 }
    );
  }

  if (action === "create") {
    if (!service_id || !amount_sats) {
      return NextResponse.json(
        { error: "create requires service_id and amount_sats" },
        { status: 400 }
      );
    }
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        payment_hash,
        service_id,
        amount_sats,
        buyer_id: buyer_id ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("payments/record create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ payment: data });
  }

  if (action === "confirm") {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("payment_hash", payment_hash)
      .select()
      .single();

    if (error) {
      console.error("payments/record confirm error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ payment: data });
  }

  if (action === "fail") {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({ status: "failed" })
      .eq("payment_hash", payment_hash)
      .select()
      .single();

    if (error) {
      console.error("payments/record fail error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ payment: data });
  }

  return NextResponse.json(
    { error: "Invalid action. Use create | confirm | fail" },
    { status: 400 }
  );
}
