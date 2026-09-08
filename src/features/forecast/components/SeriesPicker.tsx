"use client";

import { formatCount } from "@/lib/format";
import type { CounterSite, VehiculeCode } from "@/lib/types";
import { vehicleLabel } from "../lib/constants";
import type { Product } from "../lib/products";

/**
 * Shown while nothing has been forecast yet: what this counter actually
 * measures, as a list you can select from. An open panel with no result should
 * describe the counter, not guess a forecast nobody asked for.
 */
export default function SeriesPicker({
  product,
  site,
  direction,
  vehicule,
  onSelect,
}: {
  product: Product;
  site: CounterSite;
  direction: number;
  vehicule: VehiculeCode;
  onSelect: (direction: number, vehicule: VehiculeCode) => void;
}) {
  return (
    <div className="stagger space-y-4">
      <div>
        <h3 className="display-md">This counter measures {site.series.length} things</h3>
        <p className="label-mono mt-2">Tap one to select it, then run a forecast</p>
      </div>

      <ul className="space-y-2">
        {site.series.map((s) => {
          const isActive = s.direction === direction && s.vehicule === vehicule;
          return (
            <li key={`${s.direction}-${s.vehicule}`}>
              <button
                type="button"
                onClick={() => onSelect(s.direction, s.vehicule)}
                className={`w-full px-4 py-3.5 text-left transition ${
                  isActive
                    ? "bg-[var(--viz-series)]/8 ring-1 ring-[var(--viz-series)]/45"
                    : "bg-[var(--viz-surface)] ring-1 ring-[var(--viz-border)] hover:bg-[var(--viz-series)]/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? "bg-[var(--viz-series)]" : "bg-[var(--viz-axis)]"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`text-[13px] font-semibold tracking-tight ${
                      isActive ? "text-[var(--viz-series)]" : "text-[var(--viz-ink)]"
                    }`}
                  >
                    {vehicleLabel(s.vehicule)} ({s.vehicule})
                  </span>
                  <span className="label-mono bg-[var(--viz-ink)]/6 px-1.5 py-0.5">
                    Dir {s.direction}
                  </span>
                  <span className="ml-auto shrink-0 text-[13px] font-semibold tabular-nums text-[var(--viz-ink)]">
                    {formatCount(s.avg_per_hour)}
                    <span className="ml-0.5 text-[10px] font-normal text-[var(--viz-muted)]">
                      /h
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 pl-4 text-[11px] leading-snug text-[var(--viz-ink-2)]">
                  {s.sens}
                </p>
                <p className="label-mono mt-1 pl-4">
                  {s.days_reported} days · {s.first_day} → {s.last_day}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border border-dashed border-[var(--viz-axis)] px-4 py-5 text-center">
        {/* What the button will actually give you, which is not the same thing
            on the two pages: one produces a marked answer, the other a
            forecast with nothing to mark it against. */}
        <p className="text-[11px] leading-relaxed text-[var(--viz-ink-2)]">
          {product.scoreable ? (
            <>
              Pick a day in {product.firstDate.slice(0, 4)} and press{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                Run and check it
              </strong>{" "}
              to see the prediction against what really happened.
            </>
          ) : (
            <>
              Pick a date between {product.firstDate.slice(0, 4)} and{" "}
              {product.lastDate.slice(0, 4)} and press{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                Run forecast
              </strong>{" "}
              to see the hourly shape of that day.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
