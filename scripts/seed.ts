import { createClient } from "@supabase/supabase-js";
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const services = [
  {
    name: "URL Summarizer",
    description: "Summarize any web page in under 3 seconds. Returns a 3-sentence summary.",
    category: "summarization",
    endpoint_url: "http://localhost:3000/api/services/summarize",
    price_sats: 5,
    provider_id: "agent-01@getalby.com",
    provider_name: "SumBot Pro",
  },
  {
    name: "Code Reviewer",
    description: "Get instant code review with security and quality feedback. Supports JS, TS, Python.",
    category: "code-review",
    endpoint_url: "http://localhost:3000/api/services/code-review",
    price_sats: 20,
    provider_id: "agent-02@getalby.com",
    provider_name: "ReviewAgent",
  },
  {
    name: "BTC Price Oracle",
    description: "Real-time Bitcoin price with 24h stats. Fetches from 3 sources for accuracy.",
    category: "data-lookup",
    endpoint_url: "http://localhost:3000/api/services/btc-price",
    price_sats: 2,
    provider_id: "agent-03@getalby.com",
    provider_name: "OracleBot",
  },
  {
    name: "Language Translator",
    description: "Translate text to any of 50 languages. Uses Claude for context-aware translation.",
    category: "translation",
    endpoint_url: "http://localhost:3000/api/services/translate",
    price_sats: 8,
    provider_id: "agent-04@getalby.com",
    provider_name: "TranslateAgent",
  },
  {
    name: "Wallet Verifier",
    description: "Verify a Lightning address is valid and reachable before sending sats.",
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
  console.log(`✅ Seeded ${data.length} services`);
  
  // Inflate reputation scores for demo realism
  for (const service of data) {
    const successful = Math.floor(Math.random() * 200) + 50;
    await supabase.from("reputation").update({
      total_requests: successful + Math.floor(Math.random() * 5),
      successful_requests: successful,
      total_sats_earned: successful * (services.find(s => s.name === service.name)!.price_sats),
      score: (Math.random() * 3 + 7).toFixed(2), // 7.0–10.0
    }).eq("service_id", service.id);
  }
  console.log("✅ Reputation inflated for demo");
  
  console.log("\nCopy these IDs into your .env.local:");
  const summarizeId = data.find(s => s.name === "URL Summarizer")?.id;
  const oracleId = data.find(s => s.name === "BTC Price Oracle")?.id;
  const reviewId = data.find(s => s.name === "Code Reviewer")?.id;
  const translateId = data.find(s => s.name === "Language Translator")?.id;
  const verifyId = data.find(s => s.name === "Wallet Verifier")?.id;
  
  console.log(`SUMMARIZE_SERVICE_ID=${summarizeId}`);
  console.log(`BTC_PRICE_SERVICE_ID=${oracleId}`);
  console.log(`CODE_REVIEW_SERVICE_ID=${reviewId}`);
  console.log(`TRANSLATE_SERVICE_ID=${translateId}`);
  console.log(`VERIFY_WALLET_SERVICE_ID=${verifyId}`);
}

seed();
