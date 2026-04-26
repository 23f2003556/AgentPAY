import { supabase } from "@/lib/platform/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (!closed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      // Send last 10 payments on connect
      const { data: recent } = await supabase
        .from("payments")
        .select("*, services(name, category)")
        .order("created_at", { ascending: false })
        .limit(10);
      send({ type: "history", payments: recent });

      // Subscribe to new payments via Supabase realtime
      const channelId = `payments-stream-${Math.random().toString(36).substring(7)}`;
      const channel = supabase
        .channel(channelId)
        .on("postgres_changes",  
          { event: "INSERT", schema: "public", table: "payments" },
          async (payload) => {
            // Fetch with service name joined
            const { data } = await supabase
              .from("payments")
              .select("*, services(name, category)")
              .eq("id", payload.new.id)
              .single();
            send({ type: "new_payment", payment: data });
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "payments" },
          (payload) => {
            send({ type: "payment_update", payment: payload.new });
          }
        )
        .subscribe();

      // Keep alive ping every 30s
      const ping = setInterval(() => {
        send({ type: "ping", ts: Date.now() });
      }, 30000);

      // Cleanup when client disconnects
      return () => {
        closed = true;
        clearInterval(ping);
        supabase.removeChannel(channel);
      };
    },
    cancel() {
      closed = true;
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
