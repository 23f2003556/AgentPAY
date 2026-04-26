import { NextRequest, NextResponse } from "next/server";
import { l402Guard } from "@/lib/lightning/l402";

const SERVICE_ID = process.env.TRANSLATE_SERVICE_ID || "00000000-0000-0000-0000-000000000000";

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, 8); // 8 sats
  if (guard instanceof NextResponse) return guard;
  
  return NextResponse.json({
    translated: "Bonjour le monde",
    detected_source: "en",
    paidWith: guard.token.paymentHash.slice(0, 8) + "...",
    servicedAt: new Date().toISOString(),
  });
}
