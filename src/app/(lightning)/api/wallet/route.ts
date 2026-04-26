import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.ALBY_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing ALBY_ACCESS_TOKEN" }, { status: 503 });

  try {
    // Hackathon Bypass Mode: Return a simulated large wallet balance
    return NextResponse.json({
      balance_sats: 21000000,
      currency: "BTC",
      lightning_address: "agent_demo@getalby.com"
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
