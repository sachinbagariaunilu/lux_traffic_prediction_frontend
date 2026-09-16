import type { LagForecastResponse } from "@/lib/types";
import { LAG_API_BASE, getJsonFrom } from "./client";

/**
 * One day's forecast from a SHORT-HORIZON model, on the separate lag service.
 *
 * NO PAYLOAD. The service holds the recent counts itself and assembles the
 * history, so this is a bare GET. It used to be a POST carrying ~55 KB of
 * hourly counts that the browser had just downloaded from the FORECAST service
 * -- our own data, moved between two of our own machines through the user's
 * connection. scripts/build_lag_history.py is what removed that.
 *
 * The service answers only dates within one lead of where its snapshot ends,
 * and refuses anything else with a 422 rather than guessing. The caller falls
 * back to the long-horizon model there; see features/forecast/lib/engine.ts.
 *
 * A POST form still exists on the service for callers whose own counts are
 * fresher than ours. This app is not one of them.
 */
export function fetchLagForecast(
  lead: 24 | 48,
  poste_id: number,
  direction: number,
  vehicule: string,
  date: string,
): Promise<LagForecastResponse> {
  return getJsonFrom<LagForecastResponse>(
    LAG_API_BASE,
    `/forecast/${lead}h?poste_id=${poste_id}&direction=${direction}` +
      `&vehicule=${encodeURIComponent(vehicule)}&date=${date}`,
  );
}
