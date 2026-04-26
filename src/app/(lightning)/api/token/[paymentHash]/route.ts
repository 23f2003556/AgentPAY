import { NextRequest, NextResponse } from "next/server";
import { tokenStore } from "@/lib/lightning/token-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentHash: string }> }
) {
  const { paymentHash } = await params;
  const token = await tokenStore.get(paymentHash);
  
  if (!token) {
    return NextResponse.json({ ready: false }, { status: 202 });
  }
  return NextResponse.json({ ready: true, token });
}
