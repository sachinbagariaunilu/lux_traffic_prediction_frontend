import type { ActualsFile, ForecastResponse, MergedHour } from "@/lib/types";

/**
 * Join the forecast to the recorded truth for the same date.
 * Predictions are rounded to whole vehicles: the model's own error is ±18/h
 * at best, so a returned decimal is noise, not precision.
 */
export function mergeHours(
  forecast: ForecastResponse,
  actuals: ActualsFile | null,
  direction: number,
  vehicule: string,
  date: string,
): MergedHour[] {
  const recorded = actuals?.series?.[`${direction}-${vehicule}`]?.[date];
  return forecast.hourly.map((h) => ({
    hour: h.hour,
    predicted: Math.round(h.predicted),
    typical_2024: Math.round(h.typical_2024),
    actual: recorded ? recorded[h.hour] : null,
  }));
}

export interface DaySummary {
  predictedTotal: number;
  typicalTotal: number;
  /** null when the counter reported nothing for this date. */
  actualTotal: number | null;
  /** True only when all 24 hours were recorded -- a partial day cannot be scored. */
  complete: boolean;
  /** Mean absolute error per recorded hour, or null with nothing to compare. */
  mae: number | null;
  /** Signed % the day's forecast was off by, or null. */
  dayError: number | null;
  /** Signed % the forecast sits above or below a usual weekday. */
  vsTypical: number | null;
  peak: MergedHour;
}

/** Everything the report states about a day, derived once from the 24 hours. */
export function summariseDay(hours: MergedHour[]): DaySummary | null {
  if (!hours.length) return null;

  const withActual = hours.filter((h) => h.actual !== null);
  const predictedTotal = hours.reduce((a, h) => a + h.predicted, 0);
  const typicalTotal = hours.reduce((a, h) => a + h.typical_2024, 0);
  const actualTotal = withActual.length
    ? withActual.reduce((a, h) => a + (h.actual ?? 0), 0)
    : null;

  return {
    predictedTotal,
    typicalTotal,
    actualTotal,
    complete: withActual.length === 24,
    mae: withActual.length
      ? withActual.reduce((a, h) => a + Math.abs(h.predicted - (h.actual ?? 0)), 0) /
        withActual.length
      : null,
    dayError:
      actualTotal && actualTotal > 0 ? (predictedTotal / actualTotal - 1) * 100 : null,
    vsTypical: typicalTotal > 0 ? (predictedTotal / typicalTotal - 1) * 100 : null,
    peak: hours.reduce((a, b) => (b.predicted > a.predicted ? b : a)),
  };
}
