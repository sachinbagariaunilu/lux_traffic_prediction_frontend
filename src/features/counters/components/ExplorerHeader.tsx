"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";
import type { CounterSite } from "@/lib/types";
import CounterSearch from "./CounterSearch";

/** Title, the way back to the overview, and the counter search. */
export default function ExplorerHeader({
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
    <header className="relative z-[600] shrink-0 border-b border-[var(--viz-hairline)] bg-[var(--viz-plane)]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3.5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Back to overview" className="group relative shrink-0">
            <Image
              src="/world.png"
              alt="Luxembourg"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-full shadow-sm ring-1 ring-[var(--viz-border)] transition group-hover:ring-[var(--viz-series)]/50"
            />
            <span className="absolute -bottom-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--viz-surface)] text-[var(--viz-ink-2)] shadow-sm ring-1 ring-[var(--viz-border)] transition group-hover:text-[var(--viz-series)]">
              <ChevronLeftIcon />
            </span>
          </Link>
          <div className="min-w-0">
            <h1 className="display-md text-[var(--viz-ink)]">
              Traffic Forecasting
            </h1>
            <p className="label-mono mt-1.5">
              LU · 2025 forecasts vs recorded counts
            </p>
          </div>
        </div>

        <CounterSearch
          query={query}
          onQueryChange={onQueryChange}
          matches={matches}
          onPick={onPick}
        />
      </div>
    </header>
  );
}
