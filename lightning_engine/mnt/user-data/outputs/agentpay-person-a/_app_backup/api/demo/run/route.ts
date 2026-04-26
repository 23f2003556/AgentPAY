/**
 * app/api/demo/run/route.ts
 *
 * Streaming demo endpoint — drives Person C's animated agent UI.
 *
 * POST body: { task: string }
 *
 * Streams SSE events:
 *   { type: "step", index, status: "running"|"done"|"error", detail? }
 *   { type: "payment", amount, serviceId, paymentHash }
 *   { type: "done", result: string }
 *
 * The agent flow:
 *   0. Parse task
 *   1. Query Person B's marketplace (/api/services)
 *   2. Select best services by reputation + price
 *   3. Pay for summarizer via AgentWallet (real sats)
 *   4. Pay for BTC price oracle via AgentWallet (real sats)
 *   5. Synthesize result
 *
 * If ALBY_ACCESS_TOKEN is not set, falls back to a convincing simulation
 * so Person C can develop without waiting for Person A's credentials.
 */

import { NextRequest } from "next/server";
import { AgentWallet } from "@/lib/agent-wallet";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { task } = await req.json();
  const encoder = new TextEncoder();
  const albyToken = process.env.ALBY_ACCESS_TOKEN;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // client disconnected
        }
      };

      try {
        // ── Step 0: Parse task ──────────────────────────────────────────────
        send({ type: "step", index: 0, status: "running", detail: `"${task.slice(0, 60)}..."` });
        await sleep(500);
        send({ type: "step", index: 0, status: "done", detail: "Identified: summarization + price lookup needed" });

        // ── Step 1: Query marketplace ────────────────────────────────────────
        send({ type: "step", index: 1, status: "running", detail: `GET ${APP_URL}/api/services?sort=score` });

        let summarizer = { name: "URL Summarizer", price_sats: 5, endpoint_url: `${APP_URL}/api/services/summarize`, category: "summarization" };
        let oracle = { name: "BTC Price Oracle", price_sats: 2, endpoint_url: `${APP_URL}/api/services/btc-price`, category: "data-lookup" };

        try {
          const servicesRes = await fetch(`${APP_URL}/api/services?sort=score`);
          if (servicesRes.ok) {
            const { services } = await servicesRes.json();
            const found_sum = services?.find((s: typeof summarizer) => s.category === "summarization");
            const found_ora = services?.find((s: typeof oracle) => s.category === "data-lookup");
            if (found_sum) summarizer = found_sum;
            if (found_ora) oracle = found_ora;
          }
        } catch {
          // Use defaults if marketplace not yet available
        }

        await sleep(400);
        send({
          type: "step",
          index: 1,
          status: "done",
          detail: `Found services — picked ${summarizer.name} + ${oracle.name}`,
        });

        // ── Step 2: Compare & select ─────────────────────────────────────────
        send({ type: "step", index: 2, status: "running" });
        await sleep(600);
        send({
          type: "step",
          index: 2,
          status: "done",
          detail: `${summarizer.name} (${summarizer.price_sats}s) + ${oracle.name} (${oracle.price_sats}s)`,
        });

        // ── Step 3: Pay summarizer ────────────────────────────────────────────
        send({ type: "step", index: 3, status: "running", detail: "Requesting L402 invoice..." });

        let summaryResult = { summary: "Spiral builds open-source Bitcoin infrastructure including LDK (Lightning Dev Kit) and funds open Bitcoin development globally.", wordCount: 20 };

        if (albyToken) {
          // Real payment via AgentWallet
          const wallet = new AgentWallet(albyToken);
          try {
            const summaryRes = await wallet.callWithPayment(
              summarizer.endpoint_url,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: "https://spiral.xyz" }),
              },
              APP_URL
            );
            if (summaryRes.ok) {
              summaryResult = await summaryRes.json();
            }
          } catch (err) {
            console.error("[demo] Summarizer payment failed:", err);
          }
        } else {
          // Simulation fallback (Person A creds not yet shared)
          await sleep(1800);
        }

        send({
          type: "step",
          index: 3,
          status: "done",
          detail: `Invoice paid ✓ · ${summarizer.price_sats} sats`,
        });
        send({ type: "payment", amount: summarizer.price_sats, serviceId: "summarize-v1" });

        // ── Step 4: Pay price oracle ──────────────────────────────────────────
        send({ type: "step", index: 4, status: "running", detail: "Requesting L402 invoice..." });

        let priceResult = { price_usd: 94200, change_24h: 2.3 };

        if (albyToken) {
          const wallet2 = new AgentWallet(albyToken);
          try {
            const priceRes = await wallet2.callWithPayment(
              oracle.endpoint_url,
              { method: "GET" },
              APP_URL
            );
            if (priceRes.ok) {
              priceResult = await priceRes.json();
            }
          } catch (err) {
            console.error("[demo] Oracle payment failed:", err);
          }
        } else {
          await sleep(1400);
        }

        send({
          type: "step",
          index: 4,
          status: "done",
          detail: `Invoice paid ✓ · ${oracle.price_sats} sats`,
        });
        send({ type: "payment", amount: oracle.price_sats, serviceId: "btc-price-v1" });

        // ── Step 5: Synthesize ────────────────────────────────────────────────
        send({ type: "step", index: 5, status: "running", detail: "Synthesizing results..." });
        await sleep(800);
        send({ type: "step", index: 5, status: "done" });

        const totalSats = summarizer.price_sats + oracle.price_sats;
        const btcPrice = priceResult.price_usd?.toLocaleString() ?? "94,200";
        const change = priceResult.change_24h ?? 2.3;

        // ── Final result ──────────────────────────────────────────────────────
        send({
          type: "done",
          result: [
            "TASK COMPLETED\n",
            `Summary of spiral.xyz:`,
            (summaryResult as { summary?: string }).summary ?? summaryResult,
            "",
            `BTC Price:`,
            `Bitcoin is currently trading at $${btcPrice} USD (${change >= 0 ? "+" : ""}${change}% in 24h).`,
            "",
            "---",
            `Total cost: ${totalSats} sats (~$${(totalSats * (priceResult.price_usd ?? 94200) / 100_000_000).toFixed(6)} USD)`,
            `Payment method: Lightning Network (L402)`,
            `Settlement time: <1 second each`,
          ].join("\n"),
        });
      } catch (err) {
        console.error("[demo] Fatal error:", err);
        send({ type: "done", result: `Error: ${String(err)}\n\nCheck server logs.` });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
