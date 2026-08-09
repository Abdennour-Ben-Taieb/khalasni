"use client";

import { useEffect, useState } from "react";
import Stamp from "./Stamp";

type Step = {
  label: "SENT" | "NUDGED" | "PAID";
  line: string;
};

const STEPS: Step[] = [
  { label: "SENT", line: "Invoice sent to Marcus Webb — $950 for “Landing page redesign.”" },
  { label: "NUDGED", line: "Day 4 — quick nudge sent. No reply yet." },
  { label: "NUDGED", line: "Day 8 — firmer follow-up. “Please settle today.”" },
  { label: "PAID", line: "Paid. $950 landed in your Gravv wallet → 2,907 TND." },
];

export default function LiveDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const current = STEPS[step];
  const isPaid = current.label === "PAID";

  return (
    <div className="w-full max-w-sm">
      <div className="relative flex text-ink overflow-hidden rounded-lg shadow-2xl shadow-black/50 animate-drift">
        <div className="w-3 perf-edge bg-paper shrink-0" />
        <div className="flex-1 bg-paper px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono-tabular text-[11px] tracking-wider text-ink/50">
                KH-4471
              </p>
              <h3 className="font-display text-lg leading-tight mt-0.5">
                Landing page redesign
              </h3>
              <p className="text-sm text-ink/60 mt-0.5">Marcus Webb · northloop.io</p>
            </div>
            <div key={step}>
              <Stamp label={current.label} animate />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-dashed border-paper-line pt-3">
            <div className="font-mono-tabular">
              <span className="text-2xl font-semibold">950</span>
              <span className="text-sm text-ink/50 ml-1">USD</span>
              <p className="text-xs text-ink/40 mt-0.5">
                {isPaid ? "settled at 2,907 TND" : "≈ 2,907 TND"}
              </p>
            </div>
            <p className="text-xs text-ink/50">
              {isPaid ? "Settled" : "Agent working on it"}
            </p>
          </div>
        </div>
      </div>

      <p
        key={current.line}
        className="mt-4 text-sm text-muted font-mono-tabular leading-relaxed animate-stamp"
      >
        <span className="text-gold">agent · </span>
        {current.line}
      </p>
    </div>
  );
}
