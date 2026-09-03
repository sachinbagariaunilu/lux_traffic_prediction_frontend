/** Facts about the model that the UI has to state, in one place. */

export const VEHICLE_LABEL: Record<string, string> = { V: "Cars", C: "Trucks" };

/** The model was fitted through this date -- everything after it is a forecast. */
export const TRAINED_THROUGH = "2024-12-31";

/** Opens on a 2025 date: a genuine forecast that recorded counts can score. */
export const DEFAULT_DATE = "2025-02-15";

/**
 * The dates the picker will accept. Three years, and they are not the same kind
 * of year -- see SCORED_LAST.
 *
 * The lower bound is 2025-01-01 because 2024 is the training year (see
 * TRAINED_THROUGH). The model has already seen those days, so it reproduces
 * them far better than it forecasts, and a 2024 comparison flatters it rather
 * than testing it.
 *
 * The upper bound is the model bundle's `calendar_through`. Past it the three
 * date-bearing features (IS_PUBLIC_HOLIDAY, IS_SCHOOL_HOLIDAY,
 * DAYS_TO_HOLIDAY) would flatten to constants and every remaining Tuesday would
 * return an identical total -- January the same as August. The API now REFUSES
 * such a date rather than answering, so this bound keeps the picker from
 * offering a request that can only 404.
 *
 * It is NOT a free parameter. It tracks the bundle's `calendar_through`, which
 * /health reports; raising it past that value does not extend the forecast, it
 * just makes the picker offer dates the API will reject. It moves only when the
 * backend calendar does -- extend data/external/school_holidays.json from the
 * MENJE regulation, which needs no retraining.
 */
export const COVERAGE_FIRST = "2025-01-01";
export const COVERAGE_LAST = "2029-09-16";

/**
 * The range as the picker states it. DERIVED, never written out by hand.
 *
 * The label used to be a literal "2025 – 2027" sitting two lines below the
 * `max={COVERAGE_LAST}` it was meant to describe. When the calendar was
 * extended to 2029 the bound moved and the label did not, so the UI advertised
 * a narrower range than it would accept. Deriving it removes that failure mode
 * entirely.
 */
export const COVERAGE_LABEL = `${COVERAGE_FIRST.slice(0, 4)} – ${COVERAGE_LAST.slice(0, 4)}`;

/**
 * The last date the road has a recorded answer for.
 *
 * Everything up to here can be scored: forecast against truth, and the error
 * stated. After it the forecast still stands on its own, but nothing can mark
 * it -- so the UI must present those dates as a projection rather than quietly
 * dropping the actual line and letting it read as a data gap.
 */
export const SCORED_LAST = "2025-12-31";

/** True for a date past the recorded window -- forecastable, but unscoreable. */
export function isProjection(date: string): boolean {
  return date > SCORED_LAST;
}

/**
 * The year the model's traffic LEVELS come from. Every forecast, for any year,
 * is at these levels -- the model has no trend term and none is applied.
 */
export const LEVEL_YEAR = 2024;

/**
 * Measured annual growth, and why it is NOT applied to predictions.
 *
 * Growth was measured two ways on paired (counter, month, weekday, hour) slots,
 * and the two periods disagree too much to project:
 *
 *     2023 -> 2024   network +0.13%   freight -0.72%
 *     2024 -> 2025   network +1.03%   freight +0.53%
 *
 * A 7.8x spread on the network figure, and freight changing sign. Published
 * Ponts et Chaussees counts agree it is messy -- four counters spanning -0.8%
 * to +4.8%/yr, one of them officially shrinking. So the backend applies ZERO
 * growth, deliberately, and these constants exist only to state the size of the
 * resulting gap rather than to close it.
 *
 * Where it matters: random error cancels when summed over many counter-hours,
 * a level gap never does. Hourly it is noise (~2 veh/h by 2028 against a 13.8
 * MAE); across a network-year it is the dominant systematic term.
 */
export const ANNUAL_GROWTH_CENTRAL = 0.005;
export const ANNUAL_GROWTH_HIGH = 0.01;

/**
 * How much a projected TOTAL may under-read, as whole percentages.
 * 2026 -> {central: 1, high: 2}, 2028 -> {central: 2, high: 4}.
 * Returns null for a year at or before the level year.
 */
export function levelShortfall(
  year: number,
): { central: number; high: number } | null {
  const yrs = year - LEVEL_YEAR;
  if (yrs <= 0) return null;
  return {
    central: Math.round((Math.pow(1 + ANNUAL_GROWTH_CENTRAL, yrs) - 1) * 1000) / 10,
    high: Math.round((Math.pow(1 + ANNUAL_GROWTH_HIGH, yrs) - 1) * 1000) / 10,
  };
}

/**
 * Hold a date inside the covered span. `min`/`max` bound the calendar widget,
 * but a typed date still arrives unchecked in some browsers, so the value is
 * clamped rather than trusted.
 */
export function clampDate(date: string): string {
  if (!date) return DEFAULT_DATE;
  if (date < COVERAGE_FIRST) return COVERAGE_FIRST;
  if (date > COVERAGE_LAST) return COVERAGE_LAST;
  return date;
}

/** Days in a leap year -- `days_reported` is quoted against 2024. */
export const DAYS_IN_YEAR = 366;

export function vehicleLabel(code: string): string {
  return VEHICLE_LABEL[code] ?? code;
}
