"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { PRODUCT_LIST, type Product } from "@/features/forecast/lib/products";
import type { CounterSite } from "@/lib/types";
import CounterSearch from "./CounterSearch";

/**
 * Which of the two pages this is, the way back to the overview, the way ACROSS
 * to the other page, and the counter search.
 *
 * The pair of tabs is the load-bearing part. The two pages are only
 * intelligible next to each other -- "this page is scored" means nothing unless
 * you can see there is another one that is not -- so both are always visible
 * and the current one is marked, rather than the other being reachable only by
 * going back to the overview.
 */
export default function ExplorerHeader({
  product,
  query,
  onQueryChange,
  matches,
  onPick,
}: {
  product: Product;
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
            <h1 className="display-md text-[var(--viz-ink)]">{product.title}</h1>
            <p className="label-mono mt-1.5">{product.dateline}</p>
          </div>
        </div>

        {/* Pushed right on wide screens, on its own row on a phone. */}
        <nav
          aria-label="Which model"
          className="order-3 flex w-full shrink-0 overflow-hidden rounded-[var(--r-control)] ring-1 ring-[var(--viz-border)] sm:order-none sm:ml-auto sm:w-auto"
        >
          {PRODUCT_LIST.map((p) => {
            const here = p.id === product.id;
            return (
              <Link
                key={p.id}
                href={p.href}
                aria-current={here ? "page" : undefined}
                className={`flex-1 whitespace-nowrap px-3.5 py-2 text-center text-[12px] font-semibold tracking-tight transition sm:flex-none ${
                  here
                    ? "bg-[var(--viz-ink)] text-[var(--viz-plane)]"
                    : "text-[var(--viz-ink-2)] hover:bg-[var(--viz-ink)]/6 hover:text-[var(--viz-ink)]"
                }`}
              >
                {p.nav}
              </Link>
            );
          })}
        </nav>

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
