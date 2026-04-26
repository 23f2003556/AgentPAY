/**
 * app/api/services/verify-wallet/route.ts
 *
 * L402-protected Lightning wallet verifier.
 * 1 sat per call — matches Person B's seeded price.
 *
 * Checks if a Lightning address is valid and resolvable via LNURL.
 *
 * POST body: { lightningAddress: string }
 * Response:  { valid, reachable, minSendable, maxSendable, paidWith, servicedAt }
 */

import { NextRequest, NextResponse } from "next/server";
import { l402Guard, corsHeaders } from "@/lib/l402";

const SERVICE_ID = "verification-v1";
const PRICE_SATS = 1;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, PRICE_SATS);
  if (guard instanceof NextResponse) return guard;

  let body: { lightningAddress?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!body.lightningAddress) {
    return NextResponse.json(
      { error: "Provide 'lightningAddress' in request body" },
      { status: 422, headers: corsHeaders }
    );
  }

  const address = body.lightningAddress.trim();

  // Validate format: user@domain.tld
  const addressRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!addressRegex.test(address)) {
    return NextResponse.json(
      {
        valid: false,
        reachable: false,
        error: "Invalid Lightning address format (expected user@domain.tld)",
        paidWith: guard.token.paymentHash.slice(0, 12) + "...",
        servicedAt: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  }

  // Try to resolve via LNURL (the standard for Lightning addresses)
  const [user, domain] = address.split("@");
  const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${user}`;

  let reachable = false;
  let minSendable: number | null = null;
  let maxSendable: number | null = null;
  let resolveError: string | null = null;

  try {
    const res = await fetch(lnurlEndpoint, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status !== "ERROR" && data.minSendable) {
        reachable = true;
        minSendable = Math.round(data.minSendable / 1000); // msats → sats
        maxSendable = Math.round(data.maxSendable / 1000);
      } else {
        resolveError = data.reason ?? "LNURL returned error";
      }
    } else {
      resolveError = `HTTP ${res.status}`;
    }
  } catch (err) {
    resolveError = String(err).includes("timeout") ? "Request timed out" : "Domain not reachable";
  }

  return NextResponse.json(
    {
      valid: true,
      reachable,
      lightningAddress: address,
      lnurlEndpoint,
      ...(reachable ? { minSendable, maxSendable } : { error: resolveError }),
      paidWith: guard.token.paymentHash.slice(0, 12) + "...",
      serviceId: SERVICE_ID,
      servicedAt: new Date().toISOString(),
    },
    { headers: corsHeaders }
  );
}
