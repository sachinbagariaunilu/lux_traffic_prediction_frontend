"use client";

import { SearchIcon } from "@/components/ui/icons";
import { formatCount } from "@/lib/format";
import type { CounterSite } from "@/lib/types";

/**
 * Type-ahead over route, town and counter id. Picking a match selects the
 * counter and clears the box -- the query was a means, not a state worth
 * keeping on screen.
 */
export default function CounterSearch({
  query,
  onQueryChange,
  matches,
  onPick,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  matches: CounterSite[];
  onPick: (site: CounterSite) => void;
}) {
  return (
    <div className="relative ml-auto w-full sm:max-w-[300px]">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--viz-muted)]" />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search route, town or id…"
        aria-label="Search counters"
        className="w-full rounded-[var(--r-control)] border border-[var(--viz-hairline)] bg-[var(--viz-surface)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--viz-ink)] outline-none transition placeholder:text-[var(--viz-muted)] focus:border-[var(--viz-series)] focus:ring-4 focus:ring-[var(--viz-series)]/12"
      />

      {matches.length > 0 && (
        <ul className="glass-strong ring-hairline-lg absolute inset-x-0 top-full z-[700] mt-1.5 overflow-hidden rounded-[var(--r-control)]">
          {matches.map((s) => (
            <li key={s.poste_id}>
              <button
                type="button"
                onClick={() => onPick(s)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-[var(--viz-series)]/8"
              >
                <span className="tile-accent h-7 w-9 shrink-0 text-[10px]">
                  {s.route.slice(0, 3)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-[var(--viz-ink)]">
                    {s.localite}
                  </span>
                  <span className="block truncate text-[10px] text-[var(--viz-muted)]">
                    {s.route} · counter {s.poste_id}
                  </span>
                </span>
                <span className="label-mono shrink-0">{formatCount(s.totalPerHour)}/h</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
