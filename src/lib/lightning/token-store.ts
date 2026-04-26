/**
 * lib/token-store.ts
 *
 * Token store: maps paymentHash → L402 token string.
 * Uses globalThis to survive Next.js hot reload.
 */
import { supabaseAdmin } from "@/lib/platform/db";

const g = globalThis as unknown as { __tokenStore?: Map<string, string> };
const memoryStore = g.__tokenStore ?? (g.__tokenStore = new Map());

async function recordPayment(body: any): Promise<void> {
  try {
    if (body.action === "create") {
      await supabaseAdmin.from("payments").insert({
        payment_hash: body.payment_hash,
        service_id: body.service_id,
        amount_sats: body.amount_sats,
        buyer_id: body.buyer_id,
        status: "pending"
      });
    } else if (body.action === "confirm") {
      await supabaseAdmin.from("payments").update({
        status: "confirmed",
        confirmed_at: new Date().toISOString()
      }).eq("payment_hash", body.payment_hash);
    }
  } catch (err) {
    console.warn("[token-store] DB operation failed:", err);
  }
}

export const tokenStore = {
  async recordCreated(paymentHash: string, serviceId: string, amountSats: number): Promise<void> {
    await recordPayment({
      action: "create",
      payment_hash: paymentHash,
      service_id: serviceId,
      amount_sats: amountSats,
      buyer_id: null,
    });
  },

  async set(paymentHash: string, token: string, serviceId: string = "unknown"): Promise<void> {
    memoryStore.set(paymentHash, token);
    await recordPayment({
      action: "confirm",
      payment_hash: paymentHash,
    });
    console.log(`[token-store] Token stored for ${paymentHash.slice(0, 12)}... (service: ${serviceId})`);
  },

  async get(paymentHash: string): Promise<string | null> {
    return memoryStore.get(paymentHash) ?? null;
  },

  clear(): void {
    memoryStore.clear();
  },
};
