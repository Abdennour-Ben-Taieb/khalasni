"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import Ticket from "@/components/Ticket";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { invoices } = useStore();
  const open = invoices.filter((i) => i.status !== "paid");
  const settled = invoices.filter((i) => i.status === "paid");

  return (
    <RequireAuth>
      <div className="flex-1">
        <Nav active="dashboard" />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-3xl">Your invoices</h1>
              <p className="text-muted mt-1 text-sm">
                {open.length} open · {settled.length} settled
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="text-sm px-4 py-2 rounded-full bg-chase text-ink font-medium hover:brightness-110 transition"
            >
              + New invoice
            </Link>
          </div>

          {open.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-muted mb-3">
                Open
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {open.map((inv) => (
                  <Ticket key={inv.id} invoice={inv} />
                ))}
              </div>
            </div>
          )}

          {settled.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-widest text-muted mb-3">
                Settled
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {settled.map((inv) => (
                  <Ticket key={inv.id} invoice={inv} />
                ))}
              </div>
            </div>
          )}

          {invoices.length === 0 && (
            <div className="mt-16 text-center text-muted">
              <p>No invoices yet.</p>
              <Link href="/dashboard/new" className="text-chase underline">
                Send your first one
              </Link>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
