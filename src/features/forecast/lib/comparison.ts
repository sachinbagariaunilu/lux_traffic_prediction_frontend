import type { CounterSeries, MergedHour, VehiculeCode } from "@/lib/types";
import type { EngineOutcome } from "../hooks/useForecastRun";
import type { DaySummary } from "./hourly";
import { PRODUCT_LIST, type Product } from "./products";

/**
 * Up to three days on one chart, each with its own date, direction and vehicle.
 *
 * WHY THIS IS NOT A "COMPARE YEARS" FEATURE. The model has no year: its 16
 * features are clock, calendar, month and per-series profiles, and not one of
 * them is the year. Same counter, same weekday, same hour, same month, same
 * holiday status gives the IDENTICAL number in 2025 and 2027. A control that
 * offered "compare to 2027" would therefore draw a second line whose whole
 * difference came from the weekday landing elsewhere -- and it would be read as
 * growth. Letting the reader build the comparison, with every line labelled by
 * its own date and weekday, makes no claim the model cannot support.
 */

/** Three fixed slots. See --viz-cmp-* in globals.css for why they are separate. */
export const CMP_COLORS = [
  "var(--viz-cmp-1)",
  "var(--viz-cmp-2)",
  "var(--viz-cmp-3)",
] as const;

export const MAX_LINES = 3;

export interface ComparisonLine {
  /** Stable for the life of the line. Colour and React key both hang off it. */
  id: string;
  /** Which of CMP_COLORS this line holds. Assigned once, never recomputed. */
  slot: number;
  date: string;
  /** Carried on the line because the legend MUST show it: 15 May 2026 is a
      Friday and 15 May 2025 a Thursday, so a same-date comparison is partly a
      weekday comparison, and unlabelled that difference reads as change. */
  weekday: string;
  direction: number;
  vehicule: VehiculeCode;
  hours: MergedHour[];
  summary: DaySummary;
  outcome: EngineOutcome;
  /** The model that answered. Differs BETWEEN lines -- see productForDate. */
  product: Product;
}

/**
 * The product whose model may answer for `date`.
 *
 * The two products are hard-wired to non-overlapping year ranges on purpose
 * (products.ts): the 2024+2025 model trained on 2025 and the API returns 409 if
 * asked about it. A comparison spanning both is the one place in the app where
 * a single view holds output from BOTH models, which is exactly why every line
 * carries its own `product` and the stats table prints it per row.
 */
export function productForDate(date: string): Product | null {
  return (
    PRODUCT_LIST.find((p) => date >= p.firstDate && date <= p.lastDate) ?? null
  );
}

/** The widest range any line may use: the union of both products' windows. */
export const CMP_FIRST_DATE = PRODUCT_LIST.reduce(
  (a, p) => (p.firstDate < a ? p.firstDate : a),
  PRODUCT_LIST[0].firstDate,
);
export const CMP_LAST_DATE = PRODUCT_LIST.reduce(
  (a, p) => (p.lastDate > a ? p.lastDate : a),
  PRODUCT_LIST[0].lastDate,
);

/**
 * Lowest colour slot nobody is holding.
 *
 * Taken rather than counted, so removing the middle line leaves the other two
 * on their original colours -- "colour follows the entity, never its rank".
 */
export function freeSlot(taken: ComparisonLine[]): number {
  const used = new Set(taken.map((l) => l.slot));
  for (let i = 0; i < MAX_LINES; i++) if (!used.has(i)) return i;
  return MAX_LINES - 1;
}

/**
 * Why this counter cannot be asked about this date, or null if it can.
 *
 * `served_by` is per series and the two models know different counters -- three
 * started reporting during 2025 and exist only for the 2024+2025 model. Asking
 * anyway returns a 404 the user cannot act on; this turns it into a sentence
 * BEFORE the request.
 */
export function blockedReason(
  series: CounterSeries,
  date: string,
): string | null {
  const product = productForDate(date);
  if (!product) {
    return `No model covers ${date}. Dates run ${CMP_FIRST_DATE} to ${CMP_LAST_DATE}.`;
  }
  if (series.served_by.length && !series.served_by.includes(product.model)) {
    return `Counter ${series.poste_id} has no history in the ${product.modelLabel.toLowerCase()}, which is the model for ${date}.`;
  }
  return null;
}

/** Recharts wants one row per x value, so the lines are pivoted into columns. */
export interface CmpRow {
  hour: number;
  [key: string]: number | null;
}

export function toChartRows(lines: ComparisonLine[]): CmpRow[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const row: CmpRow = { hour };
    for (const l of lines) {
      row[`p${l.id}`] = l.hours[hour]?.predicted ?? null;
      // Only where the day was actually recorded. Absent is null, never 0.
      row[`a${l.id}`] = l.hours[hour]?.actual ?? null;
      row[`t${l.id}`] = l.hours[hour]?.typical_2024 ?? null;
    }
    return row;
  });
}

/**
 * The three quantities, in the MAIN chart's own words.
 *
 * That chart separates them by COLOUR, which this one cannot: here colour is
 * already spent on which day a line belongs to, so the quantity moves to line
 * style. Same three readings, second channel -- and the prediction keeps the
 * solid stroke because it is still the answer the page exists to give.
 *
 * Nine lines is the ceiling (3 days x 3 quantities) and it is too many to read
 * at panel width, which is why each is switchable and `usual` starts off.
 */
export const CMP_KINDS = [
  { key: "a", label: "Really happened", prefix: "a", dash: "5 4", on: true },
  { key: "p", label: "Our prediction", prefix: "p", dash: undefined, on: true },
  { key: "t", label: "A usual day", prefix: "t", dash: "1 4", on: false },
] as const;

export type CmpKindKey = (typeof CMP_KINDS)[number]["key"];
