"use client";

import { useMemo, useState } from "react";
import type { CounterSite } from "@/lib/types";

/** Matches shown under the search box. Busiest first, so the A1 beats a lane of it. */
const MAX_MATCHES = 7;

export function useCounterSearch(sites: CounterSite[] | null) {
  const [query, setQuery] = useState("");

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
      .slice(0, MAX_MATCHES);
  }, [query, sites]);

  return { query, setQuery, matches, clear: () => setQuery("") };
}
