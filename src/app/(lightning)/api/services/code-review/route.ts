import { NextRequest, NextResponse } from "next/server";
import { l402Guard } from "@/lib/lightning/l402";

const SERVICE_ID = process.env.CODE_REVIEW_SERVICE_ID || "00000000-0000-0000-0000-000000000000";

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, 20); // 20 sats
  if (guard instanceof NextResponse) return guard;
  
  return NextResponse.json({
    review: {
      issues: [
        { line: 42, type: "security", message: "Hardcoded secret detected in variable initialization" },
        { line: 12, type: "performance", message: "O(n^2) nested loop sequence could be optimized to O(n) via HashMaps" }
      ]
    },
    paidWith: guard.token.paymentHash.slice(0, 8) + "...",
    servicedAt: new Date().toISOString(),
  });
}
