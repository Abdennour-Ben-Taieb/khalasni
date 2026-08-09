"use client";

import { use, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import Stamp from "@/components/Stamp";
import Timeline from "@/components/Timeline";
import { useStore } from "@/lib/store";

const STATUS_LABEL = {
  sent: "SENT",
  nudged: "NUDGED",
  overdue: "NUDGED",
  paid: "PAID",
} as const;

export default function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getInvoice, chase, markPaid } = useStore();
  const invoice = getInvoice(id);
  const [copied, setCopied] = useState(false);
  const [chasing, setChasing] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!invoice) {
    return (
      <RequireAuth>
        <div className="flex-1">
          <Nav active="dashboard" />
          <div className="max-w-2xl mx-auto px-6 py-16 text-center text-muted">
            <p>Invoice not found.</p>
            <Link href="/dashboard" className="text-chase underline">
              Back to invoices
            </Link>
          </div>
        </div>
      </RequireAuth>
    );
  }

  function handleCopy() {
    navigator.clipboard?.writeText(invoice!.paymentLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleChase() {
    setChasing(true);
    setTimeout(() => {
      chase(invoice!.id);
      setChasing(false);
    }, 700);
  }

  function handlePaid() {
    setPaying(true);
    setTimeout(() => {
      markPaid(invoice!.id);
      setPaying(false);
    }, 900);
  }

  const isPaid = invoice.status === "paid";

  return (
    <RequireAuth>
      <div className="flex-1">
        <Nav active="dashboard" />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <Link href="/dashboard" className="text-sm text-muted hover:text-ivory">
            ← All invoices
          </Link>

          <div className="mt-4 relative flex text-ink overflow-hidden rounded-lg shadow-xl shadow-black/30">
            <div className="w-3 perf-edge bg-paper shrink-0" />
            <div className="flex-1 bg-paper px-6 py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono-tabular text-xs tracking-wider text-ink/50">
                    {invoice.id}
                  </p>
                  <h1 className="font-display text-2xl leading-tight mt-1">
                    {invoice.jobTitle}
                  </h1>
                  <p className="text-sm text-ink/60 mt-1">
                    {invoice.clientName} · {invoice.clientEmail}
                  </p>
                </div>
                <div key={invoice.status}>
                  <Stamp label={STATUS_LABEL[invoice.status]} animate />
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-dashed border-paper-line pt-4">
                <div className="font-mono-tabular">
                  <span className="text-3xl font-semibold">
                    {invoice.amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-ink/50 ml-1">
                    {invoice.currency}
                  </span>
                  <p className="text-xs text-ink/40 mt-0.5">
                    ≈ {Math.round(invoice.amountTND).toLocaleString()} TND
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <input
                  readOnly
                  value={invoice.paymentLink}
                  className="flex-1 min-w-0 rounded-md bg-white/40 border border-ink/10 px-3 py-2 text-xs font-mono-tabular text-ink/70"
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-xs px-3 py-2 rounded-md bg-ink text-ivory hover:bg-ink/80 transition"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>

          {!isPaid && (
            <div className="mt-6 rounded-lg border border-white/10 bg-ink-2 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Play the client</p>
                <p className="text-xs text-muted mt-0.5">
                  Simulate what happens when the agent nudges, or when the
                  client actually pays.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleChase}
                  disabled={chasing}
                  className="text-sm px-4 py-2 rounded-full border border-white/15 hover:border-white/35 transition disabled:opacity-60"
                >
                  {chasing ? "Nudging…" : "Chase client now"}
                </button>
                <button
                  onClick={handlePaid}
                  disabled={paying}
                  className="text-sm px-4 py-2 rounded-full bg-settled text-ink font-medium hover:brightness-110 transition disabled:opacity-60"
                >
                  {paying ? "Settling…" : "Simulate: client paid"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl mb-5">Chase log</h2>
            <Timeline events={invoice.events} />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
