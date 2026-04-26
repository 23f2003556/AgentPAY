import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/lightning/l402";
import crypto from "crypto";

import { tokenStore } from "@/lib/lightning/token-store";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-alby-signature") || "";
  const expected = crypto
    .createHmac("sha256", process.env.MDK_WEBHOOK_SECRET || "default_webhook_secret")
    .update(body)
    .digest("hex");

  if (sig !== `sha256=${expected}`) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.type === "invoice.settled") {
    const { payment_hash, metadata } = event.data;
    const serviceId = metadata?.serviceId || "unknown";  

    const token = generateToken(payment_hash, serviceId);
    
    await tokenStore.set(payment_hash, token, serviceId);
  }

  return NextResponse.json({ received: true });
}
