# Person A — Hour-by-Hour Execution Plan

## Your mission
Make real sats move through L402. Every API call = a payment.
By hour 3, the agent wallet pays autonomously with no human action.

---

## Hour 0:00–0:30 — Setup & first payment

### 0:00 Bootstrap the project
```bash
npx @moneydevkit/create agentpay
cd agentpay
npm install
# If MDK fails:
npx create-next-app@latest agentpay --typescript --tailwind --app
cd agentpay
npm install alby-js-sdk
```

Copy all files from this package into the project.

### 0:10 Create Alby account + get token
1. Go to https://getalby.com → Sign up (30 seconds)
2. Settings → Developer → Create Access Token
3. Copy to `.env.local` as `ALBY_ACCESS_TOKEN`

### 0:15 Fund your wallet
1. In Alby: Wallet → Receive → copy your Lightning address
2. Send yourself 2000–5000 sats (use any exchange or ask a teammate)
3. Verify: `npx ts-node scripts/check-balance.ts`

### 0:20 Generate secrets
```bash
# MDK_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# MDK_WEBHOOK_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Put both in `.env.local`.

### 0:25 Start server + ngrok
```bash
# Terminal 1
npm run dev

# Terminal 2
npx ngrok http 3000
# Copy the https URL — you'll need it for the Alby webhook
```

### ✅ Milestone: App is running, wallet is funded

---

## Hour 0:30–1:30 — L402 Middleware

All the code is in `lib/l402.ts` (already written).

### Verify it works:
```bash
# Should return 402 with invoice
curl -s -X POST http://localhost:3000/api/services/summarize \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | jq .
```

Expected output:
```json
{
  "error": "Payment required",
  "paymentRequest": "lnbc...",
  "paymentHash": "...",
  "amount": 5
}
```

If you see this, the middleware is working. ✅

### ✅ Milestone: 402 challenge works end-to-end

---

## Hour 1:30–2:00 — Webhook Handler

### Set up ngrok webhook in Alby:
1. Go to https://getalby.com/user/settings/developer
2. Add Webhook:
   - URL: `https://<your-ngrok-id>.ngrok.io/api/webhooks/payment`
   - Events: check `invoice.settled`
   - Secret: the value of `MDK_WEBHOOK_SECRET` in your `.env.local`
3. Save

### Test the webhook manually:
```bash
# In Alby dashboard → Developer → Webhooks → click your webhook → Send Test Event
# You should see in your server logs:
# [webhook] Received event: invoice.settled
# ✅ [webhook] Payment confirmed: ... → token issued
```

### ✅ Milestone: Webhook fires, token is issued and stored

---

## Hour 2:00–2:45 — Agent Wallet

All code is in `lib/agent-wallet.ts`. Test with:

```bash
# Run without --agent first to test manual flow
npx ts-node scripts/test-e2e.ts

# Run with --agent to test autonomous pay (requires webhook working)
npx ts-node scripts/test-e2e.ts --agent
```

### ✅ Milestone: Agent pays autonomously, terminal shows full flow

---

## Hour 2:45–3:00 — 30-min team sync

Share with the team:
1. Your `.env.local` values (ALBY_ACCESS_TOKEN, MDK_SECRET, DATABASE_URL placeholder)
2. ngrok URL for webhook
3. Confirmation that `npx ts-node scripts/test-e2e.ts` passes

Get from Person B:
- `DATABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- The 5 seeded service UUIDs (for wiring payment layer to real services)

---

## Hour 3:00–3:30 — Integration with Person B's DB

Once you have Supabase credentials:

1. Update `.env.local` with Person B's credentials
2. Restart server: `npm run dev`
3. Test that payments write to Supabase:
   ```bash
   npx ts-node scripts/test-e2e.ts --agent
   # Then check Supabase dashboard → payments table
   ```

### ✅ Milestone: Payment confirmed in Supabase + reputation updates

---

## Hour 3:30–4:00 — Help Person C

Give Person C:
- `HANDOFF_FOR_PERSON_C.md` — everything they need
- Your Alby access token (safe to share for demo wallet display)
- A live demo of `test-e2e.ts --agent` so they know what to animate

If Person C's live feed isn't working, check:
- SSE endpoint: `GET /api/payments/stream`
- EventSource in browser dev tools → Network tab → filter "EventStream"

---

## 🔴 Troubleshooting

| Problem | Fix |
|---------|-----|
| Alby 401 | Regenerate token at getalby.com/user/settings/developer |
| Webhook not firing | Check ngrok is running, URL correct in Alby dashboard |
| `invoice.settled` not appearing | Make sure you're on the right network (same wallet) |
| Token invalid | Restart dev server after changing MDK_SECRET |
| CORS errors | corsHeaders already added to all routes — check you're using them |
| 503 from /api/wallet | ALBY_ACCESS_TOKEN not in .env.local |
| AgentWallet timeout | Webhook not configured — check ngrok URL in Alby settings |

---

## What to hand off by hour 3

**Core library**
1. ✅ `lib/l402.ts` — paywall middleware (calls Person B's /api/payments/record on create)
2. ✅ `lib/agent-wallet.ts` — autonomous pay client
3. ✅ `lib/token-store.ts` — token store + confirms payment in Person B's DB
4. ✅ `lib/sse-broadcaster.ts` — real-time payment broadcaster

**API routes**
5. ✅ `app/api/webhooks/payment/route.ts` — Alby webhook handler
6. ✅ `app/api/token/[paymentHash]/route.ts` — token polling endpoint
7. ✅ `app/api/payments/stream/route.ts` — SSE stream (Supabase Realtime + in-memory)
8. ✅ `app/api/wallet/route.ts` — wallet balance endpoint
9. ✅ `app/api/demo/run/route.ts` — streaming agent demo (real AgentWallet)

**All 5 service endpoints matching Person B's seeded data**
10. ✅ `app/api/services/summarize/route.ts` — 5 sats
11. ✅ `app/api/services/code-review/route.ts` — 20 sats
12. ✅ `app/api/services/btc-price/route.ts` — 2 sats (real CoinGecko price)
13. ✅ `app/api/services/translate/route.ts` — 8 sats
14. ✅ `app/api/services/verify-wallet/route.ts` — 1 sat (real LNURL resolution)

**Evidence**
15. ✅ Terminal showing agent paying autonomously (screenshot/recording)
16. ✅ ALBY_ACCESS_TOKEN shared with team in `.env.local`
