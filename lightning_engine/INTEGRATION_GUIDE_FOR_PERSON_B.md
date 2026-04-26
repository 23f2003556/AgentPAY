# Person B Integration Guide
## How Person A's payment layer connects to your DB

---

## What Person A calls (your job: just have these routes ready)

### 1. When an invoice is CREATED (pending)
Person A's `lib/l402.ts → createInvoice()` calls:
```
POST /api/payments/record
{
  "action": "create",
  "payment_hash": "abc123...",
  "service_id": "uuid-from-your-services-table",
  "amount_sats": 5,
  "buyer_id": null
}
```
This creates a `pending` row in your `payments` table.

### 2. When invoice is CONFIRMED (settled)
Person A's `lib/token-store.ts → set()` calls:
```
POST /api/payments/record
{
  "action": "confirm",
  "payment_hash": "abc123..."
}
```
This updates the row to `confirmed` → your DB trigger fires → `reputation.score += 0.1`

Person B's `app/api/payments/record/route.ts` handles both of these.
That code is already in Person B's file — no changes needed on Person A's side.

---

## Service IDs that Person A uses in l402Guard()

These are the string IDs hardcoded in Person A's route files.
After you seed the DB, the `service_id` UUID in payment records must match
what your services table returns. The string IDs are for human reference:

| String ID used by Person A | Seeded service name   | Endpoint URL                              | Price |
|----------------------------|-----------------------|-------------------------------------------|-------|
| `summarize-v1`             | URL Summarizer        | http://localhost:3000/api/services/summarize     | 5 sats  |
| `code-review-v1`           | Code Reviewer         | http://localhost:3000/api/services/code-review   | 20 sats |
| `btc-price-v1`             | BTC Price Oracle      | http://localhost:3000/api/services/btc-price     | 2 sats  |
| `translation-v1`           | Language Translator   | http://localhost:3000/api/services/translate     | 8 sats  |
| `verification-v1`          | Wallet Verifier       | http://localhost:3000/api/services/verify-wallet | 1 sat   |

After seeding, share the UUID for each service with Person A so the
`service_id` FK in payments rows links to real services.

---

## Wrapping your own routes in 30 seconds

```typescript
import { l402Guard, corsHeaders } from "@/lib/l402"

export async function POST(req: NextRequest) {
  const guard = await l402Guard(req, "your-service-id", 5)  // price in sats
  if (guard instanceof NextResponse) return guard           // 402 if unpaid
  
  // your logic here
  return NextResponse.json({ result: "..." }, { headers: corsHeaders })
}
```

---

## SSE stream — what Person A sends

Person A's `/api/payments/stream` sends these events:

```typescript
// On connect:
{ type: "connected", ts: number }

// Last 10 payments from Supabase (on connect):
{ type: "history", payments: [...] }      // uses your anon key

// When payment settles (immediate, before Supabase Realtime):
{ type: "new_payment", payment: { paymentHash, serviceId, amountSats, settledAt } }

// Supabase Realtime also fires these (from your DB):
{ type: "new_payment", payment: { ...payments row joined with services } }
{ type: "payment_update", payment: { ...payments row } }

// Keep-alive:
{ type: "ping", ts: number }
```

Person A's stream already subscribes to Supabase Realtime for `payments` table
INSERT and UPDATE events — just make sure realtime is enabled on that table
in your Supabase dashboard (Database → Replication → payments ✓).

---

## Testing from curl

```bash
# 1. Hit unpaid → get invoice
curl -s -X POST http://localhost:3000/api/services/summarize \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | jq .

# 2. Pay the invoice (phone or BlueWallet)

# 3. Poll for token
curl -s http://localhost:3000/api/token/PAYMENT_HASH | jq .

# 4. Use token
curl -s -X POST http://localhost:3000/api/services/summarize \
  -H "Authorization: L402 TOKEN_FROM_STEP_3" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | jq .
```
