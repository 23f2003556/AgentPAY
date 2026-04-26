/**
 * app/api/services/translate/route.ts
 *
 * L402-protected translation service.
 * 8 sats per call — matches Person B's seeded price.
 *
 * POST body: { text: string, targetLanguage: string, sourceLanguage?: string }
 * Response:  { translatedText, targetLanguage, sourceLanguage, paidWith, servicedAt }
 */

import { NextRequest, NextResponse } from "next/server";
import { l402Guard, corsHeaders } from "@/lib/l402";

const SERVICE_ID = "translation-v1";
const PRICE_SATS = 8;

// Map of common language codes to names
const LANGUAGES: Record<string, string> = {
  es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", zh: "Chinese", ja: "Japanese", ko: "Korean",
  ar: "Arabic", hi: "Hindi", ru: "Russian", nl: "Dutch",
  pl: "Polish", sv: "Swedish", tr: "Turkish", en: "English",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, SERVICE_ID, PRICE_SATS);
  if (guard instanceof NextResponse) return guard;

  let body: { text?: string; targetLanguage?: string; sourceLanguage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!body.text) {
    return NextResponse.json({ error: "Provide 'text' in request body" }, { status: 422, headers: corsHeaders });
  }

  const targetLang = body.targetLanguage ?? "es";
  const targetName = LANGUAGES[targetLang] ?? targetLang;

  // In production, swap with a real translation API (DeepL, LibreTranslate, etc.)
  // For the demo, return a realistic mock that shows the mechanism
  const translatedText = `[${targetName} translation of: "${body.text.slice(0, 100)}${body.text.length > 100 ? "..." : ""}"]`;

  return NextResponse.json(
    {
      translatedText,
      targetLanguage: targetLang,
      targetLanguageName: targetName,
      sourceLanguage: body.sourceLanguage ?? "auto-detected",
      characterCount: body.text.length,
      paidWith: guard.token.paymentHash.slice(0, 12) + "...",
      serviceId: SERVICE_ID,
      servicedAt: new Date().toISOString(),
    },
    { headers: corsHeaders }
  );
}
