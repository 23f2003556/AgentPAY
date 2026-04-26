import { NextRequest, NextResponse } from "next/server";
import { l402Guard } from "@/lib/lightning/l402";

const SERVICE_ID = process.env.SUMMARIZE_SERVICE_ID || "00000000-0000-0000-0000-000000000000";

export async function POST(req: NextRequest) {
  // Guard first — returns 402 or authorized token
  const guard = await l402Guard(req, SERVICE_ID, 5); // 5 sats per call
  if (guard instanceof NextResponse) return guard; // 402 response

  // Payment verified — run the actual service
  const { url } = await req.json();
  
  // Simple summarization mock
  const summary = `Summary of ${url}:\nThis page was successfully summarized by Agent-X using state-of-the-art NLP models. The main takeaways include understanding the core business model, key insights into Lightning L402 capabilities, and overall integration into the AgentPay mechanism.`;
  
  return NextResponse.json({
    summary,
    paidWith: guard.token.paymentHash.slice(0, 8) + "...",
    servicedAt: new Date().toISOString(),
  });
}
