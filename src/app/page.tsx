"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ForecastPanel from "@/components/ForecastPanel";
import { fetchSites } from "@/lib/api";
import type { CounterSite } from "@/lib/types";

// Leaflet reaches for `window` at import time, so it must never render on the server.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[var(--viz-muted)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--viz-axis)] border-t-[var(--viz-series)]" />
        Loading map…
      </div>
    </div>
  ),
});

export default function Home() {
  const [sites, setSites] = useState<CounterSite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CounterSite | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load counters"));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !sites) return [];
    return sites
      .filter(
        (s) =>
          s.route.toLowerCase().includes(q) ||
          s.localite.toLowerCase().includes(q) ||
          String(s.poste_id).includes(q),
      )
      .sort((a, b) => b.totalPerHour - a.totalPerHour)
      .slice(0, 7);
  }, [query, sites]);

  const busiest = useMemo(
    () => (sites ? [...sites].sort((a, b) => b.totalPerHour - a.totalPerHour)[0] : null),
    [sites],
  );

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-[var(--viz-plane)]">
      {/* ---------------- Header ---------------- */}
      <header className="relative z-[600] shrink-0 border-b border-[var(--viz-border)] bg-[var(--viz-surface)]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3.5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {/*
              Mark: the outline of Luxembourg with counter points inside.
              The silhouette is the convex hull of the 270 real counter
              positions -- 55 x 80 km against the country's actual 57 x 82 --
              so the logo is drawn from the same data the app forecasts.
              Deliberately not the national coat of arms: this is not an
              official government service and should not look like one.
            */}
            <div className="accent-sweep flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M1.00 11.32 L3.10 19.80 L4.71 20.72 L9.26 22.26 L18.97 21.80 L22.96 14.82 L23.00 12.19 L11.66 3.01 L9.93 2.10 L9.15 1.74 L7.82 2.02 L7.60 2.17 L5.05 4.74 L1.93 9.48 Z"
                  fill="rgba(255,255,255,.22)"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle cx="8.4" cy="8.2" r="1.5" fill="#fff" />
                <circle cx="14.6" cy="13.4" r="1.5" fill="#fff" />
                <circle cx="9.2" cy="17.4" r="1.5" fill="#fff" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sweep text-[17px] font-semibold leading-tight tracking-tight">
                Traffic Forecasting
              </h1>
              <p className="text-[11px] leading-tight text-[var(--viz-muted)]">
                Luxembourg · 2025 predictions, checked against what really happened
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative ml-auto w-full sm:max-w-[300px]">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--viz-muted)]"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search route, town or id…"
              aria-label="Search counters"
              className="w-full rounded-xl border border-[var(--viz-border)] bg-[var(--viz-plane)] py-2 pl-9 pr-3 text-[13px] text-[var(--viz-ink)] outline-none transition placeholder:text-[var(--viz-muted)] focus:border-[var(--viz-series)] focus:bg-[var(--viz-surface)] focus:ring-4 focus:ring-[var(--viz-series)]/12"
            />
            {matches.length > 0 && (
              <ul className="glass-strong ring-hairline-lg absolute inset-x-0 top-full z-[700] mt-2 overflow-hidden rounded-xl">
                {matches.map((s) => (
                  <li key={s.poste_id}>
                    <button
                      onClick={() => {
                        setSelected(s);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-[var(--viz-series)]/8"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--viz-series)]/12 text-[10px] font-semibold text-[var(--viz-series)]">
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
                      <span className="shrink-0 tabular-nums text-[10px] text-[var(--viz-muted)]">
                        {Math.round(s.totalPerHour).toLocaleString("en-GB")}/h
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Map ---------------- */}
      <div className="relative flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="ring-hairline max-w-md rounded-2xl bg-[var(--viz-surface)] px-6 py-5">
              <div className="mb-2 flex items-center gap-2 text-[var(--status-bad)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-semibold">Cannot reach the API</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--viz-ink-2)]">{error}</p>
            </div>
          </div>
        ) : sites ? (
          <MapView
            sites={sites}
            selectedId={selected?.poste_id ?? null}
            onSelect={setSelected}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[var(--viz-muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--viz-axis)] border-t-[var(--viz-series)]" />
              Loading counters…
            </div>
          </div>
        )}

        {/* Floating overview -- reads as part of the map, not a panel bolted on. */}
        {sites && !error && (
          <div className="glass ring-hairline pointer-events-none absolute left-4 top-4 z-[500] rounded-2xl px-4 py-3 sm:left-6 sm:top-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold leading-none tracking-tight text-[var(--viz-ink)]">
                {sites.length}
              </span>
              <span className="text-[11px] text-[var(--viz-ink-2)]">counters</span>
            </div>
            <p className="mt-1 text-[10px] leading-tight text-[var(--viz-muted)]">
              Click any point to forecast it
            </p>
            {busiest && (
              <p className="mt-2 border-t border-[var(--viz-grid)] pt-2 text-[10px] leading-tight text-[var(--viz-muted)]">
                Busiest ·{" "}
                <span className="font-medium text-[var(--viz-ink-2)]">
                  {busiest.route} {busiest.localite}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Size legend */}
        {sites && !error && (
          <div className="glass ring-hairline pointer-events-none absolute bottom-6 left-4 z-[500] rounded-xl px-3.5 py-2.5 sm:left-6">
            <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--viz-muted)]">
              Point size
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="52" height="20" aria-hidden>
                <circle cx="8" cy="10" r="3.5" fill="var(--viz-series)" fillOpacity="0.7" />
                <circle cx="24" cy="10" r="6.5" fill="var(--viz-series)" fillOpacity="0.7" />
                <circle cx="43" cy="10" r="9" fill="var(--viz-series)" fillOpacity="0.7" />
              </svg>
              <span className="text-[10px] text-[var(--viz-ink-2)]">vehicles / hour</span>
            </div>
          </div>
        )}
      </div>

      {selected && (
        // Keyed so picking a different counter remounts with fresh controls
        // rather than carrying the previous counter's selection across.
        <ForecastPanel
          key={selected.poste_id}
          site={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
