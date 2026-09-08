import type { CounterSite } from "@/lib/types";

/**
 * Cards that float over the map. Both are `pointer-events-none` so they read as
 * part of the map rather than as panels bolted on top of it -- you can drag the
 * country straight underneath them.
 */

export function NetworkSummary({
  count,
  note,
  busiest,
}: {
  count: number;
  /** Why this count and not the other page's -- see Product.countersNote. */
  note: string;
  busiest: CounterSite | null;
}) {
  return (
    <div className="glass ring-hairline pointer-events-none absolute left-4 top-4 z-[500] px-5 py-4 sm:left-6 sm:top-6">
      <div className="flex items-baseline gap-1.5">
        <span className="display-num text-[34px] text-[var(--viz-ink)]">{count}</span>
        <span className="label-mono">counters</span>
      </div>
      <p className="mt-1.5 max-w-[15rem] text-[11px] leading-tight text-[var(--viz-muted)]">
        {note}
      </p>
      <p className="mt-2 text-[11px] leading-tight text-[var(--viz-ink-2)]">
        Click any point to forecast it
      </p>
      {busiest && (
        <p className="label-mono mt-3 border-t border-[var(--viz-grid)] pt-2.5">
          Busiest · {busiest.route} {busiest.localite}
        </p>
      )}
    </div>
  );
}

/** Pin area tracks vehicles/hour, so the sizes need saying once. */
export function PointSizeLegend() {
  return (
    <div className="glass ring-hairline pointer-events-none absolute bottom-6 left-4 z-[500] px-3.5 py-2.5 sm:left-6">
      <div className="label-mono mb-2 text-[9.5px]">Point size</div>
      <div className="flex items-center gap-2.5">
        <svg width="52" height="20" aria-hidden>
          <circle cx="8" cy="10" r="3.5" fill="var(--viz-series)" fillOpacity="0.7" />
          <circle cx="24" cy="10" r="6.5" fill="var(--viz-series)" fillOpacity="0.7" />
          <circle cx="43" cy="10" r="9" fill="var(--viz-series)" fillOpacity="0.7" />
        </svg>
        <span className="label-mono">vehicles / hour</span>
      </div>
    </div>
  );
}
