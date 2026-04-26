/**
 * app/api/webhooks/payment/route.ts
 *
 * Alby webhook handler.
 *
 * When a Lightning invoice is paid, Alby POSTs here.
 * We verify the HMAC signature, generate the L402 token,
 * store it (in-memory), and confirm the payment in Person B's DB
 * (which triggers the reputation score update via DB trigger).
 *
 * Setup:
 *   1. Run: npx ngrok http 3000
 *   2. Copy https URL
 *   3. Alby dashboard → Developer → Webhooks → Add:
 *      URL: https://<ngrok>.ngrok.io/api/webhooks/payment
 *      Events: invoice.settled
 *      Secret: value of MDK_WEBHOOK_SECRET in your .env.local
 *
 * Person B integration:
 *   tokenStore.set() calls POST /api/payments/record { action: "confirm" }
 *   Person B's DB trigger then increments reputation.score += 0.1 automatically.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generateToken } from "@/lib/l402";
import { tokenStore } from "@/lib/token-store";
import { broadcastPayment } from "@/lib/sse-broadcaster";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-alby-signature",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // ── 1. Verify Alby HMAC signature ──────────────────────────────────────────
  const sig = req.headers.get("x-alby-signature") ?? "";
  const webhookSecret = process.env.MDK_WEBHOOK_SECRET;

  if (webhookSecret) {
    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
    if (sig !== expected) {
      console.warn("[webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[webhook] MDK_WEBHOOK_SECRET not set — skipping sig check (dev only)");
  }

  // ── 2. Parse event ──────────────────────────────────────────────────────────
  let event: AlbyWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[webhook] Event: ${event.type}`);

  // ── 3. Handle invoice.settled ───────────────────────────────────────────────
  if (event.type === "invoice.settled") {
    const { payment_hash, metadata, amount } = event.data;
    const serviceId = (metadata as Record<string, string>)?.serviceId ?? "unknown";

    // Generate the L402 access token
    const token = generateToken(payment_hash, serviceId);

    // Store token in memory + POST /api/payments/record { action: "confirm" }
    // → Person B's DB trigger increments reputation.score += 0.1 automatically
    await tokenStore.set(payment_hash, token, serviceId);

    // Broadcast to SSE clients immediately (before Supabase Realtime propagates)
    broadcastPayment({
      paymentHash: payment_hash,
      serviceId,
      amountSats: amount,
      settledAt: new Date().toISOString(),
    });

    console.log(
      `✅ [webhook] ${payment_hash.slice(0, 12)}... confirmed → token issued for "${serviceId}" (${amount} sats)`
    );
  }

  return NextResponse.json({ received: true });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AlbyWebhookEvent {
  type: string;
  data: {
    payment_hash: string;
    amount: number;
    memo?: string;
    metadata?: unknown;
  };
}
