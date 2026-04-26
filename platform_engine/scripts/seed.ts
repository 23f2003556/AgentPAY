// Seed 5 demo services and inflate their reputation for the demo.
// Run with: npx tsx scripts/seed.ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const services = [
  {
    name: "URL Summarizer",
    description:
      "Summarize any web page in under 3 seconds. Returns a 3-sentence summary.",
    category: "summarization",
    endpoint_url: "http://localhost:3000/api/services/summarize",
    price_sats: 5,
    provider_id: "agent-01@getalby.com",
    provider_name: "SumBot Pro",
  },
  {
    name: "Code Reviewer",
    description:
      "Get instant code review with security and quality feedback. Supports JS, TS, Python.",
    category: "code-review",
    endpoint_url: "http://localhost:3000/api/services/code-review",
    price_sats: 20,
    provider_id: "agent-02@getalby.com",
    provider_name: "ReviewAgent",
  },
  {
    name: "BTC Price Oracle",
    description:
      "Real-time Bitcoin price with 24h stats. Fetches from 3 sources for accuracy.",
    category: "data-lookup",
    endpoint_url: "http://localhost:3000/api/services/btc-price",
    price_sats: 2,
    provider_id: "agent-03@getalby.com",
    provider_name: "OracleBot",
  },
  {
    name: "Language Translator",
    description:
      "Translate text to any of 50 languages. Uses Claude for context-aware translation.",
    category: "translation",
    endpoint_url: "http://localhost:3000/api/services/translate",
    price_sats: 8,
    provider_id: "agent-04@getalby.com",
    provider_name: "TranslateAgent",
  },
  {
    name: "Wallet Verifier",
    description:
      "Verify a Lightning address is valid and reachable before sending sats.",
    category: "verification",
    endpoint_url: "http://localhost:3000/api/services/verify-wallet",
    price_sats: 1,
    provider_id: "agent-05@getalby.com",
    provider_name: "VerifyBot",
  },
];

async function seed() {
  const { data, error } = await supabase.from("services").insert(services).select();
  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
  if (!data) {
    console.error("No data returned from insert");
    process.exit(1);
  }
  console.log(`✅ Seeded ${data.length} services`);

  for (const service of data) {
    const seed = services.find((s) => s.name === service.name)!;
    const successful = Math.floor(Math.random() * 200) + 50;
    const total = successful + Math.floor(Math.random() * 5);
    const score = Number((Math.random() * 3 + 7).toFixed(2));
    const sats = successful * seed.price_sats;

    const { error: repErr } = await supabase
      .from("reputation")
      .update({
        total_requests: total,
        successful_requests: successful,
        total_sats_earned: sats,
        score,
      })
      .eq("service_id", service.id);

    if (repErr) console.error(`Reputation update failed for ${service.name}:`, repErr);
  }
  console.log("✅ Reputation inflated for demo");

  console.log("\n--- Paste these into .env.local for Person A ---");
  for (const service of data) {
    const envName =
      service.name === "URL Summarizer"
        ? "SUMMARIZE_SERVICE_ID"
        : service.name === "BTC Price Oracle"
        ? "BTC_PRICE_SERVICE_ID"
        : service.name === "Code Reviewer"
        ? "CODE_REVIEW_SERVICE_ID"
        : service.name === "Language Translator"
        ? "TRANSLATE_SERVICE_ID"
        : "VERIFY_WALLET_SERVICE_ID";
    console.log(`${envName}=${service.id}`);
  }
}

seed();
