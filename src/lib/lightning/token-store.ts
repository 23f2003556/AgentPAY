/**
 * lib/token-store.ts
 *
 * Token store: maps paymentHash → L402 token string.
 * Uses globalThis to survive Next.js hot reload.
 */

const g = globalThis as unknown as { __tokenStore?: Map<string, string> };
const memoryStore = g.__tokenStore ?? (g.__tokenStore = new Map());

async function recordPayment(body: object): Promise<void> {
  // Always use localhost for internal server-to-server calls —
  // NEXT_PUBLIC_APP_URL may be an external tunnel URL which hangs if not active
  const appUrl = "http://localhost:3000";
  try {
    await fetch(`${appUrl}/api/payments/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("[token-store] /api/payments/record failed:", err);
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
