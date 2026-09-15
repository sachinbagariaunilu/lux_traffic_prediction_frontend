"use client";

import { useCallback, useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import { ApiError } from "@/lib/api/client";
import { fetchForecast } from "@/lib/api/forecast";
import { fetchLagForecast } from "@/lib/api/lag";
import type { ActualsFile, ForecastResponse, MergedHour } from "@/lib/types";
import {
  buildHistory,
  chooseEngine,
  lastObservedDay,
  mayUseLag,
  normaliseLagResponse,
  type Engine,
} from "../lib/engine";
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
      // The actuals serve two purposes: the recorded line on the validation
      // page, and -- on the forecasting page -- the history a lag model must be
      // given, plus the last observed day that decides whether one applies.
      //
      // Fetched only when one of those is live. mayUseLag() rules out the whole
      // question from the date alone, so the ~37 KB is not spent on the
      // forecasting page's ordinary dates, which are months past any count.
      const needActuals = product.scoreable || mayUseLag(product, date);
      const acts: ActualsFile | null = needActuals
        ? await fetchActuals(poste_id)
        : null;

      const wanted = chooseEngine(
        product,
        date,
        lastObservedDay(acts, direction, vehicule),
      );

      let meta: ForecastResponse;
      let outcome: EngineOutcome = { engine: wanted, fellBack: null };

      if (wanted.kind === "lag" && acts) {
        const history = buildHistory(acts, direction, vehicule, date);
        try {
          const res = await fetchLagForecast(wanted.lead, {
            poste_id,
            direction,
            vehicule,
            date,
            history,
          });
          meta = normaliseLagResponse(res, date);
        } catch (e) {
          // 422 stale/short history, 503 lead not deployed, 0 service
          // unreachable. All three are recoverable: the forecasting model needs
          // no history and can answer this date. Anything else is a real fault
          // and is allowed to surface.
          const recoverable =
            e instanceof ApiError && [0, 422, 503].includes(e.status);
          if (!recoverable) throw e;
          const fallback: Engine = { kind: "forecast", model: product.model };
          meta = await fetchForecast(
            poste_id,
            direction,
            vehicule,
            date,
            product.model,
          );
          outcome = {
            engine: fallback,
            fellBack: { from: wanted, reason: (e as ApiError).message },
          };
        }
      } else {
        meta = await fetchForecast(
          poste_id,
          direction,
          vehicule,
          date,
          product.model,
        );
      }

      setState({
        key: `${poste_id}|${direction}|${vehicule}|${date}|${product.id}`,
        meta,
        hours: mergeHours(meta, acts, direction, vehicule, date),
        outcome,
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
