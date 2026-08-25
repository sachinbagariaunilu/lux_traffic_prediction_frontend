"use client";

import { useCallback, useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import { fetchForecast } from "@/lib/api/forecast";
import type { ForecastResponse, MergedHour } from "@/lib/types";
import { mergeHours } from "../lib/hourly";

export interface ForecastRequest {
  poste_id: number;
  direction: number;
  vehicule: string;
  date: string;
}

/**
 * Runs a forecast on demand and hands back the result only while it still
 * matches the controls above it.
 *
 * That last part is the whole design: the stored result carries the request
 * that produced it, so moving a control invalidates it by comparison rather
 * than through an effect that clears state -- no stale chart, and no flash of
 * the wrong day between a control moving and a new run finishing.
 */
export function useForecastRun({ poste_id, direction, vehicule, date }: ForecastRequest) {
  const [state, setState] = useState<{
    key: string;
    meta: ForecastResponse;
    hours: MergedHour[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = `${poste_id}|${direction}|${vehicule}|${date}`;
  const current = state?.key === key ? state : null;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The forecast is remote; the actuals are a local static file. Fetch both
      // at once so the slow one sets the pace.
      const [forecast, acts] = await Promise.all([
        fetchForecast(poste_id, direction, vehicule, date),
        fetchActuals(poste_id),
      ]);
      setState({
        key: `${poste_id}|${direction}|${vehicule}|${date}`,
        meta: forecast,
        hours: mergeHours(forecast, acts, direction, vehicule, date),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [poste_id, direction, vehicule, date]);

  return {
    meta: current?.meta ?? null,
    hours: current?.hours ?? null,
    loading,
    error,
    run,
    clearError: useCallback(() => setError(null), []),
  };
}
