"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSites } from "@/lib/api/counters";
import type { CounterSite } from "@/lib/types";

/**
 * Loads ONE model's counter network, on mount. `sites === null` means still
 * loading; an error means the API is unreachable and the map cannot be drawn
 * at all, so the caller shows the message instead.
 *
 * The model is the page's, not a preference -- each of the two pages shows the
 * counters its own model can forecast, so a pin on the map is always a pin the
 * page can answer for.
 */
export function useCounterSites(model: string) {
  const [sites, setSites] = useState<CounterSite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchSites(model)
      .then((s) => live && setSites(s))
      .catch(
        (e) =>
          live &&
          setError(e instanceof Error ? e.message : "Failed to load counters"),
      );
    return () => {
      live = false;
    };
  }, [model]);

  // Single pass -- fetchSites already sorts ascending, but relying on that
  // ordering here would couple this hook to a draw-order decision.
  const busiest = useMemo(
    () =>
      sites?.reduce<CounterSite | null>(
        (best, s) => (!best || s.totalPerHour > best.totalPerHour ? s : best),
        null,
      ) ?? null,
    [sites],
  );

  return { sites, error, busiest };
}
