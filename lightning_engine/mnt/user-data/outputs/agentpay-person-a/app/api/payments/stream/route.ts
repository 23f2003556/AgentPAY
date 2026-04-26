/**
 * app/api/payments/stream/route.ts
 *
 * Server-Sent Events endpoint for the live payment feed.
 *
 * Person C's dashboard connects here. Person B's Supabase Realtime
 * subscription is the primary source of truth; the in-memory broadcaster
 * (Person A's webhook) fires as an immediate fallback before Supabase
 * propagates the change.
 *
 * Event shapes sent to clients:
 *   { type: "connected" }
 *   { type: "history", payments: [...] }           — last 10 on connect
 *   { type: "new_payment", payment: { ... } }       — Supabase realtime
 *   { type: "payment_update", payment: { ... } }    — status change
 *   { type: "ping", ts: number }                    — keep-alive
 *
 * Client usage:
 *   const es = new EventSource('/api/payments/stream')
 *   es.onmessage = (e) => {
 *     const event = JSON.parse(e.data)
 *     if (event.type === 'new_payment') addToFeed(event.payment)
 *   }
 */

import { NextResponse } from "next/server";
import { addSseController } from "@/lib/sse-broadcaster";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // ── 1. Send connected confirmation ──────────────────────────────────────
      send({ type: "connected", ts: Date.now() });

      // ── 2. Send recent payment history from Supabase (if available) ─────────
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && anonKey) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/payments?select=*,services(name,category)&order=created_at.desc&limit=10`,
            { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
          );
          if (res.ok) {
            const payments = await res.json();
            send({ type: "history", payments });
          }
        } catch {
          // Supabase not yet configured — skip history
        }
      } else {
        send({ type: "history", payments: [] });
      }

      // ── 3. Register with in-memory broadcaster (Person A's webhook fires this) 
      const cleanup = addSseController(controller as ReadableStreamDefaultController);

      // ── 4. Subscribe to Supabase Realtime (Person B enables this) ───────────
      // Dynamically import so the server doesn't crash if Supabase isn't configured
      let supabaseChannel: { unsubscribe: () => void } | null = null;
      if (supabaseUrl && anonKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, anonKey);

          supabaseChannel = supabase
            .channel("payments-stream-" + Math.random())
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "payments" },
              async (payload: { new: { id: string } }) => {
                // Fetch with service name joined
                const { data } = await supabase
                  .from("payments")
                  .select("*, services(name, category)")
                  .eq("id", payload.new.id)
                  .single();
                send({ type: "new_payment", payment: data });
              }
            )
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "payments" },
              (payload: { new: unknown }) => {
                send({ type: "payment_update", payment: payload.new });
              }
            )
            .subscribe();
        } catch {
          // Supabase client unavailable — in-memory broadcaster handles it
        }
      }

      // ── 5. Heartbeat every 25s ───────────────────────────────────────────────
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        send({ type: "ping", ts: Date.now() });
      }, 25_000);

      // ── 6. Cleanup on disconnect ─────────────────────────────────────────────
      const origClose = controller.close.bind(controller);
      (controller as ReadableStreamDefaultController).close = () => {
        closed = true;
        clearInterval(heartbeat);
        cleanup();
        supabaseChannel?.unsubscribe();
        origClose();
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

