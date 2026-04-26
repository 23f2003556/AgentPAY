/**
 * lib/token-store.ts
 *
 * Token store: maps paymentHash → L402 token string.
 *
 * Person B's payments table schema (from DB schema):
 *   payment_hash, amount_sats, status, service_id, buyer_id, confirmed_at
 * It does NOT have an l402_token column — tokens are ephemeral and live
 * only in this in-memory map.
 *
 * After Person B's credentials arrive, this module also:
 *   - Records payment creation (pending) via POST /api/payments/record
 *   - Records payment confirmation via POST /api/payments/record
 *   (Person B's DB trigger then auto-updates the reputation score)
 */

// ── In-memory token map ───────────────────────────────────────────────────────
// paymentHash → signed L402 token string
const memoryStore = new Map<string, string>();

// ── Internal helper: call Person B's payment recording endpoint ───────────────

async function recordPayment(body: object): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    await fetch(`${appUrl}/api/payments/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Non-fatal — token still issues even if DB write fails
    console.warn("[token-store] /api/payments/record failed:", err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const tokenStore = {
  /**
   * recordCreated — call when an invoice is created (BEFORE payment).
   * Writes a pending payment row to Person B's DB so the reputation trigger
   * has something to update when the payment confirms.
   */
  async recordCreated(
    paymentHash: string,
    serviceId: string,
    amountSats: number
  ): Promise<void> {
    await recordPayment({
      action: "create",
      payment_hash: paymentHash,
      service_id: serviceId,
      amount_sats: amountSats,
      buyer_id: null,
    });
  },

  /**
   * set — call when payment is confirmed (webhook fires).
   * Stores the token in memory AND updates Person B's DB to "confirmed",
   * which triggers the reputation score update via DB trigger.
   */
  async set(
    paymentHash: string,
    token: string,
    serviceId: string = "unknown"
  ): Promise<void> {
    // Store token in memory (fast, immediate)
    memoryStore.set(paymentHash, token);

    // Tell Person B's DB the payment confirmed → triggers reputation update
    await recordPayment({
      action: "confirm",
      payment_hash: paymentHash,
    });

    console.log(
      `[token-store] Token stored for ${paymentHash.slice(0, 12)}... (service: ${serviceId})`
    );
  },

  /**
   * get — called by the polling endpoint.
   * Returns the token if payment has been confirmed, null otherwise.
   */
  async get(paymentHash: string): Promise<string | null> {
    return memoryStore.get(paymentHash) ?? null;
  },

  /** For test cleanup */
  clear(): void {
    memoryStore.clear();
  },
};

