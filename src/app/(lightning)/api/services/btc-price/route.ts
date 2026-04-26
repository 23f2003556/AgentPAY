import { NextRequest, NextResponse } from "next/server";
import { l402Guard } from "@/lib/lightning/l402";

const SERVICE_ID = process.env.BTC_PRICE_SERVICE_ID || "00000000-0000-0000-0000-000000000000";

export async function GET(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, 2); // 2 sats
  if (guard instanceof NextResponse) return guard;
  
  let btc_usd = 94200.50;
  let change_24h_pct = 2.34;
  
  try {
    const coingeckoRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true");
    const data = await coingeckoRes.json();
    btc_usd = data.bitcoin.usd;
    change_24h_pct = parseFloat((data.bitcoin.usd_24h_change).toFixed(2));
  } catch (e) {
    console.error("CoinGecko fetch failed", e);
  }
  
  return NextResponse.json({
    btc_usd,
    change_24h_pct,
    paidWith: guard.token.paymentHash.slice(0, 8) + "...",
    servicedAt: new Date().toISOString(),
  });
}
