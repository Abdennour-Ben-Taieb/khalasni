"use client";

import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import { useStore } from "@/lib/store";

export default function Stats() {
  const { invoices } = useStore();

  const paid = invoices.filter((i) => i.status === "paid");
  const open = invoices.filter((i) => i.status !== "paid");
  const total = invoices.length;

  const totalEarnedTND = paid.reduce((sum, inv) => sum + inv.amountTND, 0);

  const daysToPay = paid
    .map((inv) => {
      const sent = inv.events.find((e) => e.label === "SENT");
      const paidEvent = inv.events.find((e) => e.label === "PAID");
      if (!sent || !paidEvent) return null;
      return (new Date(paidEvent.at).getTime() - new Date(sent.at).getTime()) / 86400000;
    })
    .filter((d): d is number => d !== null);

  const avgDaysToPay =
    daysToPay.length > 0
      ? daysToPay.reduce((a, b) => a + b, 0) / daysToPay.length
      : null;

  const paidPct = total > 0 ? Math.round((paid.length / total) * 100) : 0;
  const openPct = 100 - paidPct;

  return (
    <RequireAuth>
      <div className="flex-1">
        <Nav active="stats" />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="font-display text-3xl">Stats</h1>
          <p className="text-muted mt-1 text-sm">
            How your invoicing is trending.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/10 bg-ink-2 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-muted">
                Total earned
              </p>
              <p className="font-display text-3xl mt-2 text-gold">
                {Math.round(totalEarnedTND).toLocaleString()}
                <span className="text-base text-muted ms-1">TND</span>
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-ink-2 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-muted">
                Paid vs open
              </p>
              <p className="font-display text-3xl mt-2">
                {paid.length}
                <span className="text-base text-muted"> / {total}</span>
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-ink-2 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-muted">
                Avg. days to pay
              </p>
              <p className="font-display text-3xl mt-2">
                {avgDaysToPay !== null ? avgDaysToPay.toFixed(1) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">
              Paid vs open
            </p>
            <div className="flex h-3 overflow-hidden rounded-full bg-ink-2">
              {paidPct > 0 && (
                <div className="h-full bg-settled" style={{ width: `${paidPct}%` }} />
              )}
              {openPct > 0 && (
                <div className="h-full bg-chase" style={{ width: `${openPct}%` }} />
              )}
            </div>
            <div className="mt-3 flex items-center gap-5 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-settled" />
                Paid ({paid.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chase" />
                Open ({open.length})
              </span>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
