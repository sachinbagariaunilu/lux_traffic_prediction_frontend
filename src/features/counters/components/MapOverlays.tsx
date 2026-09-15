import type { CounterSite } from "@/lib/types";

/**
 * Cards that float over the map. Both are `pointer-events-none` so they read as
 * part of the map rather than as panels bolted on top of it -- you can drag the
 * country straight underneath them.
 *
 * Both carry the theme's cut corner, and both went from `glass` to
 * `glass-strong` when the basemap stopped being desaturated. The tiles used to
 * be drained to a flat beige, which a 90%-opaque panel could sit on happily;
 * against a full-colour map -- green forest, red motorways, blue rivers -- that
 * last 10% of transparency was enough to pull coloured shapes up through the
 * small type. The panel is a label on the map, so it wins the contrast argument
 * outright rather than by a margin.
 *
 * They also lost `ring-hairline`: a box-shadow is clipped away by `clip-path`
 * along with everything else outside the polygon, so that class drew nothing
 * here once the corner was cut. The edge now comes from the opacity step
 * between panel and map.
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
    <div className="glass-strong cut cut-s pointer-events-none absolute left-4 top-4 z-[500] px-5 py-4 sm:left-6 sm:top-6">
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
    <div className="glass-strong cut cut-s pointer-events-none absolute bottom-6 left-4 z-[500] px-3.5 py-2.5 sm:left-6">
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
