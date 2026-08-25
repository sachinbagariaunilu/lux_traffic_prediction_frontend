"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ErrorNotice from "@/components/ui/ErrorNotice";
import LoadingState from "@/components/ui/LoadingState";
import ForecastPanel from "@/features/forecast/components/ForecastPanel";
import type { CounterSite } from "@/lib/types";
import type { MapFocus } from "./CounterMap";
import { useCounterSearch } from "../hooks/useCounterSearch";
import { useCounterSites } from "../hooks/useCounterSites";
import ExplorerHeader from "./ExplorerHeader";
import { NetworkSummary, PointSizeLegend } from "./MapOverlays";

// Leaflet reaches for `window` at import time, so it must never render on the
// server -- and keeping it out of the initial chunk means the header and search
// paint before the tile engine arrives.
const CounterMap = dynamic(() => import("./CounterMap"), {
  ssr: false,
  loading: () => <LoadingState label="Loading map…" />,
});

/** Monotonic, so two picks of the same counter are two distinct focus requests. */
let focusNonce = 1;

/**
 * The /map experience: the network on a map, a search over it, and the forecast
 * panel for whichever counter is selected. This component owns exactly one
 * piece of state -- which counter is selected; loading and search live in hooks.
 */
export default function CounterExplorer() {
  const { sites, error, busiest } = useCounterSites();
  const { query, setQuery, matches, clear } = useCounterSearch(sites);
  const [selected, setSelected] = useState<CounterSite | null>(null);
  // Selecting and flying are separate: a pin click selects without moving the
  // map, a search hit does both. The counter alone cannot express "again", so
  // the focus carries a nonce -- picking the same counter twice re-flies.
  const [focus, setFocus] = useState<MapFocus | null>(null);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-[var(--viz-plane)]">
      <ExplorerHeader
        query={query}
        onQueryChange={setQuery}
        matches={matches}
        onPick={(site) => {
          setSelected(site);
          setFocus({ site, nonce: focusNonce++ });
          clear();
        }}
      />

      <div className="relative flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-md">
              <ErrorNotice title="Cannot reach the API" message={error} />
            </div>
          </div>
        ) : sites ? (
          <>
            <CounterMap
              sites={sites}
              selectedId={selected?.poste_id ?? null}
              focus={focus}
              onSelect={setSelected}
            />
            <NetworkSummary count={sites.length} busiest={busiest} />
            <PointSizeLegend />
          </>
        ) : (
          <LoadingState label="Loading counters…" />
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
