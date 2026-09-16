import { lurefToLatLon } from "@/lib/luref";
import type { CounterSeries, MergedHour, VehiculeCode } from "@/lib/types";

/**
 * The downloadable report: one row per HOUR, cars and lorries side by side.
 *
 * SHAPE IS DELIBERATE. An earlier draft nested the hours under each vehicle
 * (`vehicles.V.hourly`), which reads well and works badly -- the question this
 * file answers is "what does this counter see at 08:00", and that answer was
 * split across two arrays a consumer had to zip back together. Flat rows drop
 * straight into a DataFrame or a spreadsheet.
 *
 * WHAT IS NOT IN HERE, on purpose:
 *
 *   the model / engine   the panel knows whether lead-24 or the long-horizon
 *                        model answered, and this file does not record it. That
 *                        is a product decision, not an oversight -- but note
 *                        that the two vehicle classes CAN be answered by
 *                        different models (one may fall back while the other
 *                        does not), so two rows of this file are not guaranteed
 *                        to share a provenance. Nothing in the file will say so.
 *   typical_2024         the dashed "usual weekday" baseline.
 *   coord_x / coord_y    the LUREF metres lat/lon was reprojected from.
 *
 * VALUES ARE ROUNDED to whole vehicles, matching MergedHour and therefore the
 * chart. A file that disagreed with the screen it was downloaded from would be
 * the first thing anyone reported as a bug. It does mean `predicted_total` is a
 * sum of two rounded numbers, not a rounded sum.
 */

export interface ReportHour {
  hour: number;
  time_local: string;
  predicted_V: number | null;
  predicted_C: number | null;
  predicted_total: number;
  actual_V: number | null;
  actual_C: number | null;
  actual_total: number | null;
}

export interface Report {
  generated_at: string;
  counter: {
    poste_id: number;
    route: string;
    localite: string;
    direction: number;
    sens: string;
    lat: number;
    lon: number;
  };
  forecast_date: string;
  weekday: string;
  is_holiday_period: boolean;
  vehicles_included: VehiculeCode[];
  hour_convention: string;
  hourly: ReportHour[];
  day_total: {
    predicted_V: number | null;
    predicted_C: number | null;
    predicted_total: number;
    actual_V: number | null;
    actual_C: number | null;
    actual_total: number | null;
  };
  /** Anything missing from the file, stated. Empty when both classes are here. */
  warnings: string[];
}

/** hour h covers h:00 to (h+1):00. Named after the source columns P00_01..P23_24. */
const HOUR_CONVENTION =
  "hour h covers h:00 to (h+1):00 local time (Europe/Luxembourg)";

const sum = (ns: (number | null)[]) =>
  ns.reduce<number>((a, n) => a + (n ?? 0), 0);

/**
 * Day total for a RECORDED column: null unless at least one hour was counted.
 * A day of genuine zero traffic and a day nobody counted must not read the
 * same, and `sum` alone would flatten both to 0.
 */
const recordedTotal = (ns: (number | null)[]) =>
  ns.some((n) => n !== null) ? sum(ns) : null;

/**
 * `byVehicle` holds whatever was actually fetched. A class that does not exist
 * at this counter/direction, or whose request failed, is simply absent -- and
 * the caller says why in `warnings` rather than letting a null pass as a zero.
 */
export function buildReport({
  series,
  date,
  weekday,
  isHolidayPeriod,
  byVehicle,
  warnings,
}: {
  series: CounterSeries;
  date: string;
  weekday: string;
  isHolidayPeriod: boolean;
  byVehicle: Partial<Record<VehiculeCode, MergedHour[]>>;
  warnings: string[];
}): Report {
  const { lat, lon } = lurefToLatLon(series.coord_x, series.coord_y);
  const v = byVehicle.V;
  const c = byVehicle.C;

  const hourly: ReportHour[] = Array.from({ length: 24 }, (_, hour) => {
    const hv = v?.[hour];
    const hc = c?.[hour];
    // null only where the CLASS is absent. A present class with no recorded
    // count keeps its null actual, which is not the same statement.
    const aV = hv ? hv.actual : null;
    const aC = hc ? hc.actual : null;
    const anyActual = aV !== null || aC !== null;
    return {
      hour,
      time_local: `${date}T${String(hour).padStart(2, "0")}:00:00`,
      predicted_V: hv ? hv.predicted : null,
      predicted_C: hc ? hc.predicted : null,
      predicted_total: (hv?.predicted ?? 0) + (hc?.predicted ?? 0),
      actual_V: aV,
      actual_C: aC,
      actual_total: anyActual ? (aV ?? 0) + (aC ?? 0) : null,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    counter: {
      poste_id: series.poste_id,
      route: series.route,
      localite: series.localite,
      direction: series.direction,
      sens: series.sens,
      lat,
      lon,
    },
    forecast_date: date,
    weekday,
    is_holiday_period: isHolidayPeriod,
    vehicles_included: (["V", "C"] as VehiculeCode[]).filter((k) => byVehicle[k]),
    hour_convention: HOUR_CONVENTION,
    hourly,
    day_total: {
      predicted_V: v ? sum(v.map((h) => h.predicted)) : null,
      predicted_C: c ? sum(c.map((h) => h.predicted)) : null,
      predicted_total: sum(hourly.map((h) => h.predicted_total)),
      // Split so a day's error can be attributed. The two classes are separate
      // series in the actuals file and one can be recorded while the other is
      // not, in which case actual_total is the sum of what EXISTS -- these two
      // columns are what makes that visible instead of silent.
      actual_V: recordedTotal(hourly.map((h) => h.actual_V)),
      actual_C: recordedTotal(hourly.map((h) => h.actual_C)),
      actual_total: recordedTotal(hourly.map((h) => h.actual_total)),
    },
    warnings,
  };
}

export function reportFilename(series: CounterSeries, date: string): string {
  return `forecast_${series.poste_id}_dir${series.direction}_${date}.json`;
}
