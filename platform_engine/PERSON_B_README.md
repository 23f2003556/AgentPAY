# Person B — Build & Hand-off Notes

Files Person B owns in this repo:

```
agentpay/
├── supabase/schema.sql                       # paste into Supabase SQL editor
├── lib/db.ts                                 # supabase + supabaseAdmin clients + types
├── app/api/services/route.ts                 # GET list (filters: category, max_price, min_score, sort)
├── app/api/services/register/route.ts        # POST register
├── app/api/services/[id]/route.ts            # GET single, DELETE soft-delete
├── app/api/payments/record/route.ts          # POST { action: create | confirm | fail }
├── app/api/payments/stream/route.ts          # GET SSE feed
├── app/api/reputation/[serviceId]/route.ts   # GET reputation + tier + success_rate
├── scripts/seed.ts                           # seed 5 services + inflate scores
└── .env.example                              # template for .env.local
```

## Setup order (once Person C's scaffold lands)

1. From the repo root: `npm install @supabase/supabase-js dotenv tsx`.
2. Create a Supabase project (free tier).
3. Open Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
4. Verify tables: `SELECT table_name FROM information_schema.tables WHERE table_schema='public';` → `services`, `reputation`, `payments`.
5. Dashboard → Database → Replication → enable realtime on the `payments` table.
6. Copy `.env.example` → `.env.local`. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.
7. `npx tsx scripts/seed.ts` → copy the printed `*_SERVICE_ID` block back into `.env.local`.
8. Share `.env.local` Supabase vars + the seeded UUIDs with Person A.

## Verification (run after `npm run dev`)

```bash
# 1. Tables + seed
curl http://localhost:3000/api/services | jq '.count'   # → 5

# 2. Filter + sort
curl 'http://localhost:3000/api/services?category=summarization&max_price=10&sort=score' | jq '.count'

# 3. Single service
curl http://localhost:3000/api/services/<uuid> | jq '.service.reputation'

# 4. Reputation
curl http://localhost:3000/api/reputation/<uuid> | jq '{score, tier, success_rate}'

# 5. SSE stream
curl -N http://localhost:3000/api/payments/stream
# Expect: data: {"type":"history","payments":[...]}

# 6. Manual record + confirm — score should bump 0.1
curl -X POST http://localhost:3000/api/payments/record \
  -H "Content-Type: application/json" \
  -d '{"action":"create","payment_hash":"test123","service_id":"<uuid>","amount_sats":5}'
curl -X POST http://localhost:3000/api/payments/record \
  -H "Content-Type: application/json" \
  -d '{"action":"confirm","payment_hash":"test123"}'
curl http://localhost:3000/api/reputation/<uuid> | jq '.score'
```

## Hand-off to Person A

Paste this into the team chat after seeding:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUMMARIZE_SERVICE_ID=<uuid>
BTC_PRICE_SERVICE_ID=<uuid>
CODE_REVIEW_SERVICE_ID=<uuid>
TRANSLATE_SERVICE_ID=<uuid>
VERIFY_WALLET_SERVICE_ID=<uuid>
```

Person A wires `l402Guard(req, SERVICE_ID, sats)` against these UUIDs and calls `/api/payments/record` from `createInvoice` (`action:"create"`) and the webhook (`action:"confirm"`) — exact code in `SHARED_Integration_Contract.md`.

## Hand-off to Person C

API contract (from SHARED contract — already verified correct):

| Endpoint | Method | Response |
|---|---|---|
| `/api/services` | GET | `{ services: Service[], count: number }` |
| `/api/services/register` | POST | `{ service: Service, message }` |
| `/api/services/:id` | GET | `{ service: Service }` |
| `/api/payments/stream` | GET | SSE: `history` / `new_payment` / `payment_update` / `ping` |
| `/api/reputation/:serviceId` | GET | `{ score, total_requests, successful_requests, total_sats_earned, success_rate, tier }` |

`Service.reputation` is an **array** (Supabase join returns `Array<Reputation>`) — read `s.reputation[0]?.score`, do not assume an object.

## If something breaks

| Problem | Fix |
|---|---|
| RLS blocks writes | `CREATE POLICY "All" ON services FOR ALL USING (true);` (hackathon shortcut) |
| Realtime SSE silent | Toggle `payments` on in Database → Replication |
| Reputation row missing | `INSERT INTO reputation (service_id) SELECT id FROM services WHERE id NOT IN (SELECT service_id FROM reputation);` |
| Score not updating | `SELECT * FROM information_schema.triggers WHERE trigger_name='on_payment_status_change';` |
| Person A's webhook never fires | Manually `curl` `/api/payments/record` with `action:"confirm"` to keep the demo moving |
