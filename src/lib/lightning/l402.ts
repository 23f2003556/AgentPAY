import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PRICE_SATS = parseInt(process.env.SERVICE_PRICE_SATS || "10");
const MDK_SECRET = process.env.MDK_SECRET || "default_mdk_secret";

export interface L402Token {
  serviceId: string;
  paidAt: number;
  paymentHash: string;
  expiresAt: number;
}

// Generate a macaroon-style token after payment
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

// Verify the token
export function verifyToken(token: string): L402Token | null {
  try {
    const { data, sig } = JSON.parse(Buffer.from(token, "base64").toString());
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

// Create a Lightning invoice simulation (Hackathon Bypass)
export async function createInvoice(
  sats: number,
  memo: string,
  serviceId: string  // UUID from B's services table
): Promise<{ paymentRequest: string; paymentHash: string }> {
  // Hackathon Mode: Avoid using real network calls
  const paymentHash = crypto.randomBytes(32).toString("hex");
  const paymentRequest = `lnbc_demo_${paymentHash}`;

  // Record pending payment in B's DB using dynamic tokenStore to avoid circular dep
  const { tokenStore } = await import("@/lib/lightning/token-store");
  await tokenStore.recordCreated(paymentHash, serviceId, sats);

  return { paymentRequest, paymentHash };
}

// The middleware function — wrap any API route with this
export async function l402Guard(
  req: NextRequest,
  serviceId: string,
  priceSats: number = PRICE_SATS
): Promise<{ authorized: true; token: L402Token } | NextResponse> {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("L402 ")) {
    const tokenStr = authHeader.slice(5);
    const token = verifyToken(tokenStr);
    if (token) {
      return { authorized: true, token };
    }
  }

  try {
    // No valid token — issue a payment challenge
    const { paymentRequest, paymentHash } = await createInvoice(
      priceSats,
      `AgentPay: ${serviceId}`,
      serviceId
    );

    return NextResponse.json(
      {
        error: "Payment required",
        paymentRequest,
        paymentHash,
        amount: priceSats,
        instructions: `Pay the Lightning invoice, then retry with header: Authorization: L402 <token>`,
      },
      {
        status: 402,
        headers: {
          "WWW-Authenticate": `L402 paymentRequest="${paymentRequest}"`,
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
