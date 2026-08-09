import Link from "next/link";
import type { Invoice } from "@/lib/types";
import Stamp from "./Stamp";

const STATUS_LABEL: Record<Invoice["status"], ChaseEventLabel> = {
  sent: "SENT",
  nudged: "NUDGED",
  overdue: "NUDGED",
  paid: "PAID",
};

type ChaseEventLabel = "SENT" | "NUDGED" | "PAID";

export default function Ticket({ invoice }: { invoice: Invoice }) {
  const daysOpen = invoice.daysOpenAtSeed;

  return (
    <Link
      href={`/invoice/${invoice.id}`}
      className="group relative flex text-ink overflow-hidden rounded-lg shadow-lg shadow-black/30 hover:-translate-y-0.5 transition-transform"
    >
      <div className="w-3 perf-edge bg-paper shrink-0" />
      <div className="flex-1 bg-paper px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono-tabular text-[11px] tracking-wider text-ink/50">
              {invoice.id}
            </p>
            <h3 className="font-display text-lg leading-tight mt-0.5">
              {invoice.jobTitle}
            </h3>
            <p className="text-sm text-ink/60 mt-0.5">{invoice.clientName}</p>
          </div>
          <Stamp label={STATUS_LABEL[invoice.status]} />
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-dashed border-paper-line pt-3">
          <div className="font-mono-tabular">
            <span className="text-2xl font-semibold">
              {invoice.amount.toLocaleString()}
            </span>
            <span className="text-sm text-ink/50 ml-1">{invoice.currency}</span>
            <p className="text-xs text-ink/40 mt-0.5">
              ≈ {Math.round(invoice.amountTND).toLocaleString()} TND
            </p>
          </div>
          <p className="text-xs text-ink/50">
            {invoice.status === "paid" ? "Settled" : `Open ${daysOpen}d`}
          </p>
        </div>
      </div>
    </Link>
  );
}
