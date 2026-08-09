# Khlasni

The agent that gets Tunisian freelancers paid. Forward a job, Khlasni invoices
the client, chases them until they pay, and lands the money in a multi-currency
Gravv wallet.

This is a demo-ready MVP: everything runs client-side with mock data, so it
deploys to Vercel with zero backend setup and works reliably live on stage.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` — landing/pitch page, with an auto-cycling live demo of the chase ticket
- `/dashboard` — list of invoices (3 seeded examples: paid, nudged, overdue)
- `/dashboard/new` — create a new invoice ("forward the job")
- `/invoice/[id]` — invoice detail: payment link, chase log, and **"Play the
  client"** controls (`Chase client now`, `Simulate: client paid`) — this is
  the live demo moment where a judge can act as the client
- `/wallet` — mock Gravv multi-currency balance

## Where the mock lives

- `lib/mock-agent.ts` — canned agent follow-up copy (escalating tone) and the
  fake Gravv payment link / FX rate helpers. Swap `fakeGravvLink` and
  `FX_TO_TND` for real Gravv API calls when you have access.
- `lib/store.tsx` — all app state (invoices, wallet) in a React context. No
  database — perfect for a live demo, but replace with real persistence
  (e.g. Postgres via Vercel, or calls to your own API routes) before this
  needs to survive a page refresh or multiple users.

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. Go to vercel.com → **New Project** → import the repo.
3. Framework preset auto-detects as Next.js — no config needed. Deploy.

## Next steps to wire in real Gravv

- Replace `fakeGravvLink()` in `lib/mock-agent.ts` with a real call to
  Gravv's payment-link/invoice API.
- Replace the `markPaid` simulation in `lib/store.tsx` with a Gravv webhook
  handler (add an `app/api/gravv-webhook/route.ts` that verifies the event
  and updates invoice status + wallet balance in your database).
- Swap the in-memory `StoreProvider` for real persistence once you need
  invoices to survive refreshes or support multiple users/freelancers.
