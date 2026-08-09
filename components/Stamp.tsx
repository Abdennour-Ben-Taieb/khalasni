import type { ChaseEvent } from "@/lib/types";

const STYLES: Record<ChaseEvent["label"], { color: string; border: string }> = {
  SENT: { color: "text-gold", border: "border-gold" },
  NUDGED: { color: "text-chase", border: "border-chase" },
  PAID: { color: "text-settled", border: "border-settled" },
};

export default function Stamp({
  label,
  animate = false,
}: {
  label: ChaseEvent["label"];
  animate?: boolean;
}) {
  const s = STYLES[label];
  return (
    <span
      className={`inline-flex items-center justify-center font-mono-tabular text-[11px] tracking-[0.18em] font-bold uppercase border-2 rounded px-2 py-1 -rotate-6 ${s.color} ${s.border} ${
        animate ? "animate-stamp" : ""
      }`}
      style={{ opacity: 0.92 }}
    >
      {label}
    </span>
  );
}
