# Person C Handoff
## What you need from Person A + how to wire everything

---

## Credentials to share at 30-min sync

Person A gives you:
- `ALBY_ACCESS_TOKEN` → put in your `.env.local`
- ngrok URL confirmation (webhook is live)

---

## Routes Person A owns (call these from your UI)

| Route | What it does |
|-------|-------------|
| `GET /api/payments/stream` | SSE stream of live payments |
| `GET /api/wallet` | Wallet balance + Lightning address |
| `POST /api/demo/run` | Streaming agent demo (SSE) |
| `POST /api/services/summarize` | L402 protected, 5 sats |
| `POST /api/services/code-review` | L402 protected, 20 sats |
| `GET /api/services/btc-price` | L402 protected, 2 sats |
| `POST /api/services/translate` | L402 protected, 8 sats |
| `POST /api/services/verify-wallet` | L402 protected, 1 sat |

---

## Live payment feed

```typescript
const es = new EventSource('/api/payments/stream')

es.onmessage = (e) => {
  const event = JSON.parse(e.data)
  
  if (event.type === 'history') {
    // Last 10 payments — seed your feed on load
    setPayments(event.payments ?? [])
  }
  
  if (event.type === 'new_payment') {
    // Flash animation trigger — new payment just confirmed
    setPayments(prev => [event.payment, ...prev].slice(0, 50))
  }
  
  if (event.type === 'payment_update') {
    // Status changed (pending → confirmed)
    setPayments(prev => prev.map(p =>
      p.payment_hash === event.payment.payment_hash ? event.payment : p
    ))
  }
}

es.onerror = () => es.close()
```

---

## Demo agent endpoint

`POST /api/demo/run` streams step-by-step events.
This is **real AgentWallet** — actual sats move when ALBY_ACCESS_TOKEN is set.

```typescript
const res = await fetch('/api/demo/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ task: inputValue }),
})

const reader = res.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const lines = decoder.decode(value).split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const event = JSON.parse(line.slice(6))
    
    switch (event.type) {
      case 'step':
        // event.index (0-5), event.status ("running"|"done"), event.detail
        updateStep(event.index, event.status, event.detail)
        break
      case 'payment':
        // event.amount (sats), event.serviceId
        // Increment your sats counter, trigger flash animation
        addTotalPaid(event.amount)
        break
      case 'done':
        // event.result — the final text to display
        setResult(event.result)
        break
    }
  }
}
```

**Step indexes** (match these to your step labels):
- `0` — Parse task
- `1` — Query marketplace
- `2` — Compare & select services
- `3` — Pay summarizer (real Lightning payment)
- `4` — Pay BTC price oracle (real Lightning payment)
- `5` — Synthesize result

---

## Demo fallback (if ALBY_ACCESS_TOKEN not shared yet)

The endpoint simulates timing without real payments when no token is set.
You can build and test the UI before Person A finishes setup.

---

## Demo script from Person C's file (exact words)

```
1. OPEN marketplace page
   "This is AgentPay — Lightning-native marketplace where AI agents
   discover and pay each other with real Bitcoin. No accounts. No API keys."

2. SHOW service cards
   "Agents register services here. Each has a live reputation score
   built from real payment history."

3. CLICK Live Feed
   "Every payment that flows through the system appears here in real time."

4. CLICK Run Demo
   "Watch this agent complete a task by autonomously paying for two
   services on the marketplace."

5. HIT Run Agent — say nothing, let steps animate.
   When payment steps complete: "That's a real Lightning payment
   settling in under a second for fractions of a cent."

6. SHOW result
   "The agent spent 7 sats — about $0.00007 — and completed both calls.
   No human touched a payment form."

7. SWITCH to Live Feed
   "There are the two payments, confirmed, reputation scores updated."

8. CLOSING
   "This only works with Lightning. Stripe can't do $0.00007. With
   stablecoins, a single company controls who can transact. Lightning
   is open infrastructure — and with L402, agents transact without any
   human in the loop."
```
