import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const { data: recent } = await supabase
        .from("payments")
        .select("*, services(name, category)")
        .order("created_at", { ascending: false })
        .limit(10);
      send({ type: "history", payments: recent ?? [] });

      const channel = supabase
        .channel("payments-stream")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "payments" },
          async (payload) => {
            const { data } = await supabase
              .from("payments")
              .select("*, services(name, category)")
              .eq("id", (payload.new as { id: string }).id)
              .single();
            send({ type: "new_payment", payment: data });
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "payments" },
          (payload) => {
            send({ type: "payment_update", payment: payload.new });
          }
        )
        .subscribe();

      const ping = setInterval(() => {
        send({ type: "ping", ts: Date.now() });
      }, 30000);

      const cleanup = () => {
        closed = true;
        clearInterval(ping);
        supabase.removeChannel(channel);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      // @ts-expect-error - signal is provided by the platform
      const signal: AbortSignal | undefined = controller.signal;
      if (signal) {
        signal.addEventListener("abort", cleanup);
      }
    },
    cancel() {
      // Client disconnected — cleanup runs via the abort listener above.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
