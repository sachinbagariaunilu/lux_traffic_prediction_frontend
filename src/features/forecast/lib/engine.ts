/**
 * WHICH MODEL ANSWERS A GIVEN DATE.
 *
 * There are four trained models across two backend services, and the choice
 * between them is not a preference. It is forced by what each one is allowed to
 * answer:
 *
 *   2024          the validation model. Predicts 2025, which it never saw, so
 *                 the result can be marked against recorded counts.
 *   2024_2025     the forecasting model. Predicts 2026 onward. It refuses 2025
 *                 with a 409, because it studied 2025.
 *   24h / 48h     the SHORT-HORIZON models. Far more accurate, but they cannot
 *                 answer a bare date at all: the caller has to SEND the recent
 *                 observed counts, and the counts have to be fresh enough.
 *
 * THE RULE, in one line: a lag model is used when we still hold observed counts
 * fresh enough for its lead, and otherwise the forecasting model is.
 *
 * Concretely, with recorded counts ending 2025-12-31:
 *
 *   2026-01-01    one day past the data   -> 24h model
 *   2026-01-02    two days past the data  -> 48h model
 *   2026-01-03+   three days or more      -> 2024_2025, because BOTH lag models
 *                 refuse: a 422 saying the history is stale.
 *
 * WHY THIS IS DERIVED AND NOT HARDCODED TO 1 AND 2 JANUARY. Those two dates are
 * not special. They are simply the first and second day after the last hour we
 * hold for that series -- and that boundary is per-counter (seven counters stop
 * before December 2025) and moves the moment the actuals are extended. Pinning
 * the calendar dates would route a counter whose data ends in October to a model
 * that must refuse it, and would quietly rot the day new data lands.
 *
 * Verified against the running services, counter 1410 direction 1 cars:
 *
 *   date         24h          48h          2024_2025
 *   2026-01-01   21,691 OK    22,249 OK    19,893
 *   2026-01-02   422 stale    36,223 OK    35,832
 *   2026-01-03   422 stale    422 stale    32,090
 *
 * Note 2026-01-01 is answerable by BOTH lag models. The shorter lead wins: it
 * is the more accurate of the two, which is the entire reason to prefer a lag
 * model over the forecasting model in the first place.
 */
import type { ActualsFile, ForecastResponse, LagForecastResponse } from "@/lib/types";
import type { Product } from "./products";

export const LAG_LEADS = [24, 48] as const;
export type LagLead = (typeof LAG_LEADS)[number];

export type Engine =
  | { kind: "forecast"; model: string }
  | { kind: "lag"; lead: LagLead; lastObserved: string };

/**
 * How much history to send.
 *
 * The models want a 744h (24h lead) or 768h (48h lead) SPAN -- 31 and 32 days.
 * The API checks the span, not the number of points, and states that gaps are
 * fine while staleness is refused. Counters do have gaps: 1410 reported 339 of
 * 365 days in 2025, and 29 of 31 in December.
 *
 * So 60 days is sent rather than 32. The surplus costs ~55 KB on a request that
 * only happens for two dates per counter, and it means an ordinary run of
 * missing days cannot push the supplied span under the requirement -- which
 * would surface as a 422 on a counter that plainly has the data.
 */
export const HISTORY_WINDOW_DAYS = 60;

/** The largest gap, in days, that any lag model can answer. */
export const MAX_LAG_DAYS = 2;

/**
 * Could a lag model POSSIBLY answer this date? Cheap, and answered without a
 * network request.
 *
 * The real decision needs this series' last recorded hour, which costs a ~37 KB
 * actuals fetch. Paying that on every run of the forecasting page -- where most
 * dates are months past any recorded count -- would be ~37 KB spent to learn
 * "no".
 *
 * `trainedThrough` is the safe bound. The forecasting model trained through the
 * last day we hold counts for, so NO series can have recorded data after it:
 * the per-series gap is always at least this one. If even this optimistic gap
 * exceeds the longest lead, no lag model can apply and the actuals are not
 * fetched.
 */
export function mayUseLag(product: Product, date: string): boolean {
  if (product.scoreable) return false;
  const gap = daysBetween(product.trainedThrough, date);
  return gap >= 1 && gap <= MAX_LAG_DAYS;
}

/** Whole days from one ISO date to another. Negative if `to` precedes `from`. */
export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / 86_400_000);
}

/**
 * The last day this series recorded anything, or null if it recorded nothing.
 *
 * Per SERIES, not per counter: a counter can hold cars and trucks in both
 * directions, and they do not always stop on the same day.
 */
export function lastObservedDay(
  actuals: ActualsFile | null,
  direction: number,
  vehicule: string,
): string | null {
  const days = actuals?.series?.[`${direction}-${vehicule}`];
  if (!days) return null;
  let last: string | null = null;
  for (const d of Object.keys(days)) if (!last || d > last) last = d;
  return last;
}

/**
 * Which model should answer this date for this series.
 *
 * `lastObserved` is null before the actuals file resolves and for any series
 * with no recorded counts at all. Both mean the same thing here -- no history
 * to send -- so both take the forecasting model, which needs none.
 */
export function chooseEngine(
  product: Product,
  date: string,
  lastObserved: string | null,
): Engine {
  // The same gate the caller uses to decide whether to fetch actuals at all.
  // Repeated here so the two cannot disagree: without it, this function would
  // happily route a 2025 date to a lag model when handed a lastObserved that
  // mayUseLag() would have refused to look up -- and the pair would be correct
  // only because every caller remembered to check both.
  //
  // It also carries the validation page's rule. That page's whole claim is that
  // ONE model, which never saw 2025, produced the number beside the recorded
  // line. The lag models trained through 2025-12-31, so on a 2025 date they
  // would be reciting training data -- the exact thing this project exists to
  // disprove, arriving through the back door.
  if (!mayUseLag(product, date)) return { kind: "forecast", model: product.model };

  if (lastObserved) {
    const gap = daysBetween(lastObserved, date);
    // The shorter lead first: on the day both can answer, 24h is the better
    // model. Anything past 2 days is left to the forecasting model, because
    // both lag models refuse it.
    if (gap === 1) return { kind: "lag", lead: 24, lastObserved };
    if (gap === 2) return { kind: "lag", lead: 48, lastObserved };
  }
  return { kind: "forecast", model: product.model };
}

/** Hourly points for the request body: every recorded hour in the window. */
export function buildHistory(
  actuals: ActualsFile,
  direction: number,
  vehicule: string,
  date: string,
  windowDays = HISTORY_WINDOW_DAYS,
): { t: string; v: number }[] {
  const days = actuals.series?.[`${direction}-${vehicule}`] ?? {};
  const end = Date.parse(date);
  const start = end - windowDays * 86_400_000;
  const out: { t: string; v: number }[] = [];
  for (const day of Object.keys(days).sort()) {
    const ms = Date.parse(day);
    // Strictly before the target day: a target hour in the history would be the
    // answer handed to the model as an input.
    if (ms < start || ms >= end) continue;
    days[day].forEach((v, hour) => {
      out.push({ t: `${day}T${String(hour).padStart(2, "0")}:00:00`, v });
    });
  }
  return out;
}

/**
 * A lag answer in the shape every downstream component already reads.
 *
 * The report, the chart, the table and the summary all take ForecastResponse.
 * Normalising here means the routing decision stays in this file instead of
 * leaking a second response shape into every one of them.
 *
 * Two fields are genuinely absent rather than defaulted:
 *   scoreable      false -- these dates are past every count we hold.
 *   expected_error null -- the lag bundles carry their own blind-test scores,
 *                  which are NOT the full-unseen-year MAE the UI prints as a
 *                  ±figure. Quoting one in place of the other would be a
 *                  different measurement wearing the same label.
 */
export function normaliseLagResponse(
  res: LagForecastResponse,
  date: string,
): ForecastResponse {
  return {
    counter: res.counter,
    model: res.model,
    date,
    hourly: res.hourly.map((h) => ({
      hour: h.hour,
      predicted: h.predicted,
      typical_2024: h.typical_for_slot,
    })),
    daily_total: res.daily_total,
    is_holiday_period: res.is_holiday_period,
    scoreable: false,
    scoreable_note:
      "this date is past every recorded count we hold, so there is nothing to score it against",
    expected_error: null,
    expected_error_note:
      `Short-horizon model: it was given ${res.history_hours_supplied} hours of this ` +
      `counter's own recorded traffic, ending ${res.model.replace("h", "")} hours ` +
      `before this day starts. That is why it can be more accurate here than the ` +
      `forecasting model, which is given only the date.`,
  };
}
