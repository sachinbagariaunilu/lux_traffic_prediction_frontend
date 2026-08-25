/** Facts about the model that the UI has to state, in one place. */

export const VEHICLE_LABEL: Record<string, string> = { V: "Cars", C: "Trucks" };

/** The model was fitted through this date -- everything after it is a forecast. */
export const TRAINED_THROUGH = "2024-12-31";

/** Opens on a 2025 date: a genuine forecast that recorded counts can score. */
export const DEFAULT_DATE = "2025-02-15";

/**
 * The dates the picker will accept: 2025, and only 2025. Both ends are cut for
 * a different reason, and neither is arbitrary.
 *
 * Before it -- 2024 is the training year (see TRAINED_THROUGH). The model has
 * already seen those days, so it reproduces them far better than it forecasts,
 * and a 2024 comparison flatters it rather than testing it.
 *
 * After it -- the API still answers, but the answer stops moving. The 12
 * features are calendar-only, so every non-holiday Saturday from 2026 to 2031
 * returns an identical total, January the same as August; only the holiday
 * flags shift it. Offering those dates implies a seasonal forecast that is not
 * there.
 *
 * What is left is the honest window: a year the model never trained on, and one
 * the road has a recorded answer for.
 */
export const COVERAGE_FIRST = "2025-01-01";
export const COVERAGE_LAST = "2025-12-31";

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
