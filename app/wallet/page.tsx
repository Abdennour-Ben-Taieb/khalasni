"use client";

import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import { useStore } from "@/lib/store";

const CCY_LABEL: Record<string, string> = {
  TND: "Tunisian Dinar",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export default function Wallet() {
  const { wallet, invoices } = useStore();
  const totalTND = wallet.find((b) => b.currency === "TND")?.amount ?? 0;
  const settledCount = invoices.filter((i) => i.status === "paid").length;

  return (
    <RequireAuth>
      <div className="flex-1">
        <Nav active="wallet" />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="font-display text-3xl">Gravv wallet</h1>
          <p className="text-muted mt-1 text-sm">
            Everything clients pay lands here, converted automatically.
          </p>

          <div className="mt-8 rounded-lg border border-white/10 bg-ink-2 px-6 py-6">
            <p className="text-xs uppercase tracking-widest text-muted">
              Available balance
            </p>
            <p className="font-display text-5xl mt-2 text-gold">
              {totalTND.toLocaleString()}
              <span className="text-2xl text-muted ml-2">TND</span>
            </p>
            <p className="text-xs text-muted mt-2">
              {settledCount} invoice{settledCount === 1 ? "" : "s"} settled through Khlasni
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {wallet.map((b) => (
              <div
                key={b.currency}
                className="rounded-lg border border-white/10 px-5 py-4"
              >
                <p className="text-xs text-muted">{CCY_LABEL[b.currency]}</p>
                <p className="font-mono-tabular text-xl mt-1">
                  {b.amount.toLocaleString()}{" "}
                  <span className="text-sm text-muted">{b.currency}</span>
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-muted leading-relaxed max-w-md">
            In production this reflects real Gravv wallet balances via its
            payouts API. Every currency held here can settle to a Tunisian
            resident account under the current forex rules.
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
