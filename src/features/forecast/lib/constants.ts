/**
 * Facts the UI has to state that are the same on BOTH pages.
 *
 * Everything that differs between the two products -- which model, which years,
 * which counters, whether a forecast can be scored -- lives in products.ts.
 * This file holds only what is true of the forecast either way.
 */

export const VEHICLE_LABEL: Record<string, string> = { V: "Cars", C: "Trucks" };

export function vehicleLabel(code: string): string {
  return VEHICLE_LABEL[code] ?? code;
}

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
 * a level gap never does. Hourly it is noise (~2 veh/h by 2028 against a 13.0
 * MAE); across a network-year it is the dominant systematic term.
 */
export const ANNUAL_GROWTH_CENTRAL = 0.005;
export const ANNUAL_GROWTH_HIGH = 0.01;

/**
 * How much a forecast TOTAL may under-read, as whole percentages, for a date
 * this far past the levels the model learned.
 *
 * `levelYear` is a PRODUCT fact, not a global one: the 2024-only model carries
 * 2024 levels, the 2024+2025 model carries levels averaged across both years.
 * It used to be a module constant fixed at 2024, which silently overstated the
 * gap for the newer model by a full year. Returns null at or before the level
 * year, and the block that renders it disappears.
 */
export function levelShortfall(
  year: number,
  levelYear: number,
): { central: number; high: number } | null {
  const yrs = year - levelYear;
  if (yrs <= 0) return null;
  return {
    central: Math.round((Math.pow(1 + ANNUAL_GROWTH_CENTRAL, yrs) - 1) * 1000) / 10,
    high: Math.round((Math.pow(1 + ANNUAL_GROWTH_HIGH, yrs) - 1) * 1000) / 10,
  };
}

/** Days in a leap year -- `days_reported` is quoted against 2024. */
export const DAYS_IN_YEAR = 366;
