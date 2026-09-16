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
import type { ForecastResponse, LagForecastResponse } from "@/lib/types";
import type { Product } from "./products";

export const LAG_LEADS = [24, 48] as const;
export type LagLead = (typeof LAG_LEADS)[number];

export type Engine =
  | { kind: "forecast"; model: string }
  | {
      kind: "lag";
      lead: LagLead;
      /**
       * Last hour of real traffic behind the answer, from the service's own
       * `history_through`. OPTIONAL because it is only known AFTER the call:
       * the service assembles the history now, so the browser cannot know what
       * window was used until it is told.
       */
      lastObserved?: string;
    };

/** The largest gap, in days, that any lag model can answer. */
export const MAX_LAG_DAYS = 2;

/**
 * Could a lag model answer this date at all? Answered from the date alone, with
 * no network request.
 *
 * `trainedThrough` is the last day any series holds counts for, so a date more
 * than MAX_LAG_DAYS past it is beyond every lead and no lag model can help.
 * Used by the hook to skip the attempt entirely rather than spend a round trip
 * collecting a 422.
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

/** Which model should answer this date. */
export function chooseEngine(product: Product, date: string): Engine {
  // The same gate the hook uses to skip the call entirely, repeated here so the
  // two cannot disagree.
  //
  // It also carries the validation page's rule. That page's whole claim is that
  // ONE model, which never saw 2025, produced the number beside the recorded
  // line. The lag models trained through 2025-12-31, so on a 2025 date they
  // would be reciting training data -- the exact thing this project exists to
  // disprove, arriving through the back door.
  if (!mayUseLag(product, date)) return { kind: "forecast", model: product.model };

  // The shorter lead first: on the day both could answer, 24h is the better
  // model. Past two days both refuse, and mayUseLag has already excluded that.
  //
  // Measured from trainedThrough, which is the last day ANY series has counts
  // for. Whether THIS series still reported then is the service's business --
  // it holds the history and answers 404 when a counter stopped early. The
  // browser used to download the data to decide this for itself.
  const gap = daysBetween(product.trainedThrough, date);
  if (gap === 1) return { kind: "lag", lead: 24 };
  if (gap === 2) return { kind: "lag", lead: 48 };
  return { kind: "forecast", model: product.model };
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
