import type { ChaseEvent } from "@/lib/types";
import Stamp from "./Stamp";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Timeline({ events }: { events: ChaseEvent[] }) {
  return (
    <ol className="space-y-5">
      {events.map((e, i) => (
        <li key={e.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Stamp label={e.label} animate={i === events.length - 1} />
            {i < events.length - 1 && (
              <span className="flex-1 w-px bg-white/10 mt-2" />
            )}
          </div>
          <div className="pb-1">
            <p className="text-sm text-ivory leading-relaxed">{e.message}</p>
            <p className="text-xs text-muted mt-1 font-mono-tabular">
              {e.actor} · {formatTime(e.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
