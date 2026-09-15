import type { LagForecastResponse } from "@/lib/types";
import { LAG_API_BASE, postJson } from "./client";

/**
 * One day's forecast from a SHORT-HORIZON model, on the separate lag service.
 *
 * Unlike /forecast, this cannot answer a bare date. The caller supplies the
 * counter's own recent observed counts and the model reads the last few days of
 * real traffic off them -- which is why it beats the forecasting model on the
 * day or two after our data ends, and why it refuses with 422 the moment those
 * counts are too stale for the lead.
 *
 * The decision to call this at all lives in features/forecast/lib/engine.ts.
 * This function only performs it.
 */
export function fetchLagForecast(
  lead: 24 | 48,
  body: {
    poste_id: number;
    direction: number;
    vehicule: string;
    date: string;
    history: { t: string; v: number }[];
  },
): Promise<LagForecastResponse> {
  return postJson<LagForecastResponse>(LAG_API_BASE, `/forecast/${lead}h`, body);
}
