/**
 * app/api/services/code-review/route.ts
 *
 * L402-protected code review service.
 * 20 sats per call — matches Person B's seeded price.
 *
 * POST body: { code: string, language?: string }
 * Response:  { review, issues, language, paidWith, servicedAt }
 */

import { NextRequest, NextResponse } from "next/server";
import { l402Guard, corsHeaders } from "@/lib/l402";

const SERVICE_ID = "code-review-v1";
const PRICE_SATS = 20;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, PRICE_SATS);
  if (guard instanceof NextResponse) return guard;

  let body: { code?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!body.code) {
    return NextResponse.json({ error: "Provide 'code' in request body" }, { status: 422, headers: corsHeaders });
  }

  const language = body.language ?? detectLanguage(body.code);
  const issues = analyzeCode(body.code, language);

  return NextResponse.json(
    {
      review: issues.length === 0
        ? "No obvious issues found. Code looks clean."
        : `Found ${issues.length} issue(s) to address.`,
      issues,
      language,
      linesReviewed: body.code.split("\n").length,
      paidWith: guard.token.paymentHash.slice(0, 12) + "...",
      serviceId: SERVICE_ID,
      servicedAt: new Date().toISOString(),
    },
    { headers: corsHeaders }
  );
}

function detectLanguage(code: string): string {
  if (code.includes("def ") || code.includes("import ") && code.includes(":")) return "python";
  if (code.includes("function ") || code.includes("const ") || code.includes("=>")) return "javascript";
  if (code.includes("interface ") || code.includes(": string") || code.includes(": number")) return "typescript";
  return "unknown";
}

function analyzeCode(code: string, _lang: string): string[] {
  const issues: string[] = [];
  if (code.includes("eval(")) issues.push("Security: eval() is dangerous — avoid dynamic code execution");
  if (code.includes("TODO") || code.includes("FIXME")) issues.push("Code quality: unresolved TODO/FIXME comments found");
  if (code.includes("console.log")) issues.push("Code quality: console.log statements should be removed before production");
  if (code.length > 5000) issues.push("Complexity: function is very long — consider breaking into smaller units");
  if (code.includes("password") && !code.includes("hash")) issues.push("Security: possible plaintext password — use hashing");
  return issues;
}
