/**
 * app/api/services/btc-price/route.ts
 *
 * L402-protected BTC price oracle.
 * 2 sats per call — matches Person B's seeded price.
 * Fetches real price from CoinGecko (free, no API key needed).
 *
 * GET/POST → { price_usd, change_24h, source, paidWith, servicedAt }
 */

import { NextRequest, NextResponse } from "next/server";
import { l402Guard, corsHeaders } from "@/lib/l402";

const SERVICE_ID = "btc-price-v1";
const PRICE_SATS = 2;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, PRICE_SATS);
  if (guard instanceof NextResponse) return guard;

  // Fetch real BTC price from CoinGecko (free tier, no key)
  let priceData = { price_usd: 0, change_24h: 0, source: "fallback" };

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      priceData = {
        price_usd: data.bitcoin.usd,
        change_24h: Math.round(data.bitcoin.usd_24h_change * 100) / 100,
        source: "coingecko",
      };
    }
  } catch {
    // Fallback to approximate price if CoinGecko is unreachable
    priceData = {
      price_usd: 94_200,
      change_24h: 1.2,
      source: "fallback-estimate",
    };
  }

  return NextResponse.json(
    {
      ...priceData,
      currency: "USD",
      timestamp: new Date().toISOString(),
      paidWith: guard.token.paymentHash.slice(0, 12) + "...",
      serviceId: SERVICE_ID,
      servicedAt: new Date().toISOString(),
    },
    { headers: corsHeaders }
  );
}
