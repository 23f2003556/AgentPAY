/**
 * lib/l402.ts
 *
 * L402 Lightning paywall middleware.
 * Wraps any Next.js API route: unpaid → 402 + invoice, paid → access.
 *
 * Usage in a route:
 *   const guard = await l402Guard(req, "service-id", 5)
 *   if (guard instanceof NextResponse) return guard   // 402 challenge
 *   // guard.token is now available — payment confirmed
 *
 * Integration with Person B:
 *   Every createInvoice call records a pending payment in Person B's DB
 *   (via tokenStore.recordCreated). When the webhook fires and the payment
 *   confirms, tokenStore.set calls /api/payments/record?action=confirm,
 *   which triggers Person B's reputation update DB trigger.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_PRICE_SATS = parseInt(process.env.SERVICE_PRICE_SATS ?? "10", 10);
const MDK_SECRET = process.env.MDK_SECRET!;
const ALBY_TOKEN = process.env.ALBY_ACCESS_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Token types ───────────────────────────────────────────────────────────────

export interface L402Token {
  serviceId: string;
  paidAt: number;
  paymentHash: string;
  expiresAt: number;
}

export interface L402Authorized {
  authorized: true;
  token: L402Token;
}

// ── Token generation & verification ──────────────────────────────────────────

/**
 * generateToken — creates a signed, expiring access token after payment.
 * Encodes serviceId, paymentHash, and timestamps; signs with HMAC-SHA256.
 */
export function generateToken(paymentHash: string, serviceId: string): string {
  const payload: L402Token = {
    serviceId,
    paidAt: Date.now(),
    paymentHash,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };
  const data = JSON.stringify(payload);
  const sig = crypto
    .createHmac("sha256", MDK_SECRET)
    .update(data)
    .digest("hex");
  return Buffer.from(JSON.stringify({ data, sig })).toString("base64");
}

/**
 * verifyToken — validates signature and expiry.
 * Returns parsed payload or null if invalid/expired.
 */
export function verifyToken(token: string): L402Token | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const { data, sig } = JSON.parse(decoded);
    const expected = crypto
      .createHmac("sha256", MDK_SECRET)
      .update(data)
      .digest("hex");
    if (sig !== expected) return null;
    const payload: L402Token = JSON.parse(data);
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Alby invoice creation ─────────────────────────────────────────────────────

export interface AlbyInvoice {
  paymentRequest: string;
  paymentHash: string;
}

/**
 * createInvoice — calls Alby REST API to generate a BOLT11 Lightning invoice.
 * Also records a pending payment row in Person B's DB via tokenStore.recordCreated,
 * so the reputation trigger has something to update on confirmation.
 */
export async function createInvoice(
  sats: number,
  memo: string,
  serviceId: string
): Promise<AlbyInvoice> {
  const res = await fetch("https://api.getalby.com/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ALBY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: sats,
      memo,
      metadata: { serviceId },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Alby invoice creation failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const invoice: AlbyInvoice = {
    paymentRequest: data.payment_request,
    paymentHash: data.payment_hash,
  };

  // Notify Person B's DB: payment is pending
  // (import lazily to avoid circular dependency with token-store)
  const { tokenStore } = await import("./token-store");
  await tokenStore.recordCreated(invoice.paymentHash, serviceId, sats);

  return invoice;
}

// ── Main middleware ───────────────────────────────────────────────────────────

/**
 * l402Guard — the paywall. Call at the top of any API route handler.
 *
 * Flow:
 *   1. Check Authorization header for "L402 <token>"
 *   2. If valid token → return { authorized: true, token }
 *   3. If missing or invalid → create invoice, return 402 NextResponse
 *
 * @param req        The incoming Next.js request
 * @param serviceId  Identifier matching Person B's seeded service (e.g. "summarize-v1")
 * @param priceSats  Price in satoshis (should match Person B's services.price_sats)
 */
export async function l402Guard(
  req: NextRequest,
  serviceId: string,
  priceSats: number = DEFAULT_PRICE_SATS
): Promise<L402Authorized | NextResponse> {
  // ── Step 1: Check for existing token ────────────────────────────────────────
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader.startsWith("L402 ")) {
    const tokenStr = authHeader.slice(5);
    const token = verifyToken(tokenStr);
    if (token) {
      return { authorized: true, token };
    }
    // Token present but invalid/expired — fall through to issue new invoice
  }

  // ── Step 2: No valid token — issue payment challenge ─────────────────────────
  let invoice: AlbyInvoice;
  try {
    invoice = await createInvoice(priceSats, `AgentPay: ${serviceId}`, serviceId);
  } catch (err) {
    console.error("[L402] Failed to create invoice:", err);
    return NextResponse.json(
      { error: "Payment system unavailable", details: String(err) },
      { status: 503 }
    );
  }

  const { paymentRequest, paymentHash } = invoice;

  return NextResponse.json(
    {
      error: "Payment required",
      paymentRequest,
      paymentHash,
      amount: priceSats,
      currency: "sats",
      tokenUrl: `${APP_URL}/api/token/${paymentHash}`,
      instructions:
        "1. Pay the Lightning invoice. 2. Poll tokenUrl until ready:true. 3. Retry with: Authorization: L402 <token>",
    },
    {
      status: 402,
      headers: {
        "WWW-Authenticate": `L402 paymentRequest="${paymentRequest}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "WWW-Authenticate",
      },
    }
  );
}

// ── CORS headers for protected routes ────────────────────────────────────────
// Add to every 200 response from a protected service so agents can call cross-origin

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

