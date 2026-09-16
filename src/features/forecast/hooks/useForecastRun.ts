"use client";

import { useCallback, useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import { ApiError } from "@/lib/api/client";
import { fetchForecast } from "@/lib/api/forecast";
import { fetchLagForecast } from "@/lib/api/lag";
import type { ActualsFile, ForecastResponse, MergedHour } from "@/lib/types";
import { chooseEngine, normaliseLagResponse, type Engine } from "../lib/engine";
import type { Product } from "../lib/products";
import { mergeHours } from "../lib/hourly";

export interface ForecastRequest {
  poste_id: number;
  direction: number;
  vehicule: string;
  date: string;
  /** The page, which decides the long-horizon model and whether scoring is possible. */
  product: Product;
}

/**
 * Which model actually answered, and why -- so the report can state it.
 *
 * `fellBack` is set when a lag model was the right choice on paper but could
 * not answer. That is not an error and must not be shown as one: the forecast
 * is real, it simply came from the model that needs no history. It IS worth
 * saying, because the same counter on the same date may take a lag model
 * tomorrow, and a silently different answer reads as instability.
 */
export interface EngineOutcome {
  engine: Engine;
  fellBack: { from: Engine; reason: string } | null;
}

/**
 * Runs a forecast on demand and hands back the result only while it still
 * matches the controls above it.
 *
 * That last part is the whole design: the stored result carries the request
 * that produced it, so moving a control invalidates it by comparison rather
 * than through an effect that clears state -- no stale chart, and no flash of
 * the wrong day between a control moving and a new run finishing.
 *
 * ROUTING. The model is no longer a property of the page alone. On the
 * forecasting page, a date one or two days past this series' last recorded hour
 * goes to the 24h or 48h model instead, which is given the counter's own recent
 * traffic and is more accurate there. engine.ts owns that decision and explains
 * it; this hook performs it, and falls back when the lag service refuses.
 */
/**
 * One forecast, routed and merged -- the hook's body, lifted out so a SECOND
 * caller can ask for another series on the same terms.
 *
 * It exists for the report download, which needs both vehicle classes while the
 * panel only ever holds the selected one. Duplicating the routing there would
 * have let the two drift, and the drift would be invisible: the file names no
 * model, so a download whose C came from the long-horizon model and whose V
 * came from lead-24 would look exactly like one where both agreed.
 *
 * `acts` is passed IN rather than fetched here because one ActualsFile covers
 * every series at the counter -- fetching per vehicle would pull the same file
 * twice.
 */
export async function runForecast(
  { poste_id, direction, vehicule, date, product }: ForecastRequest,
  acts: ActualsFile | null,
): Promise<{
  meta: ForecastResponse;
  hours: MergedHour[];
  outcome: EngineOutcome;
}> {
  // Decided from the DATE alone. Which series still had counts on the last
  // recorded day is the lag service's business now, because it is the one
  // holding them -- it answers 404 for a counter that stopped reporting
  // early, and the fallback below catches it. Asking the browser to work
  // that out meant downloading the data twice to find out.
  const wanted = chooseEngine(product, date);

  let meta: ForecastResponse;
  let outcome: EngineOutcome = { engine: wanted, fellBack: null };

  if (wanted.kind === "lag") {
    try {
      const res = await fetchLagForecast(
        wanted.lead,
        poste_id,
        direction,
        vehicule,
        date,
      );
      meta = normaliseLagResponse(res, date);
      // The service assembled the history, so only IT knows which window
      // was used. Carried back onto the engine so EngineNote can name the
      // date instead of saying "recent counts" vaguely.
      outcome = {
        engine: { ...wanted, lastObserved: res.history_through?.slice(0, 10) },
        fellBack: null,
      };
    } catch (e) {
      // 422 date outside the snapshot, 404 this series stopped reporting
      // early, 503 no snapshot deployed, 0 service unreachable. All four
      // are recoverable: the long-horizon model needs no history and can
      // answer this date. Anything else is a real fault and surfaces.
      const recoverable =
        e instanceof ApiError && [0, 404, 422, 503].includes(e.status);
      if (!recoverable) throw e;
      const fallback: Engine = { kind: "forecast", model: product.model };
      meta = await fetchForecast(poste_id, direction, vehicule, date, product.model);
      outcome = {
        engine: fallback,
        fellBack: { from: wanted, reason: (e as ApiError).message },
      };
    }
  } else {
    meta = await fetchForecast(poste_id, direction, vehicule, date, product.model);
  }

  return {
    meta,
    hours: mergeHours(meta, acts, direction, vehicule, date),
    outcome,
  };
}

export function useForecastRun({
  poste_id,
  direction,
  vehicule,
  date,
  product,
}: ForecastRequest) {
  const [state, setState] = useState<{
    key: string;
    meta: ForecastResponse;
    hours: MergedHour[];
    outcome: EngineOutcome;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = `${poste_id}|${direction}|${vehicule}|${date}|${product.id}`;
  const current = state?.key === key ? state : null;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Actuals are now fetched ONLY for the recorded line on the validation
      // page. They used to be pulled on the forecasting page too, to build the
      // history a lag model needed -- ~37 KB down so 55 KB could go back up to
      // a different service. The lag service holds that history itself now, so
      // the forecasting page makes no actuals request at all.
      const acts: ActualsFile | null = product.scoreable
        ? await fetchActuals(poste_id)
        : null;

      const res = await runForecast(
        { poste_id, direction, vehicule, date, product },
        acts,
      );

      setState({
        key: `${poste_id}|${direction}|${vehicule}|${date}|${product.id}`,
        ...res,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [poste_id, direction, vehicule, date, product]);

  return {
    meta: current?.meta ?? null,
    hours: current?.hours ?? null,
    outcome: current?.outcome ?? null,
    loading,
    error,
    run,
    clearError: useCallback(() => setError(null), []),
  };
}
