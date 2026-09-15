/**
 * THE TWO PRODUCTS. One page each, and everything that differs between them
 * lives here.
 *
 * WHY TWO PAGES AND NOT ONE.
 *
 * There are two models. One learned 2024 alone; the other learned 2024 and
 * 2025. They answer different questions and only one of them can be marked:
 *
 *   check-2025      the 2024-only model predicts 2025. It has never seen a
 *                   single hour of 2025, so every prediction can be laid beside
 *                   what the road actually recorded and the error means
 *                   something.
 *   forecast-2026   the 2024+2025 model predicts 2026 onward. It is the more
 *                   accurate of the two (11.4% average error against 12.5%,
 *                   measured on roadside sensors in 2026), but it studied 2025,
 *                   so there is no year left to mark it on.
 *
 * An earlier build served both from one page and switched model silently on the
 * date. It was correct and nobody could see it: the reader had no way to tell
 * that the ±13.0 quoted on a 2025 date came from a model that had never read
 * 2025, and the natural assumption — that we trained on everything and then
 * quoted an error against data the model had memorised — is the one thing this
 * project exists to disprove.
 *
 * So the split is now structural. Each page is hard-wired to ONE model, offers
 * only the years that model can honestly answer, and lists only the counters
 * that model actually knows. The pairing cannot be got wrong because the wrong
 * pairing is not reachable, and each page says which model is behind it.
 *
 * Both pages render from the same components (CounterExplorer, ForecastPanel,
 * ForecastReport). Nothing is duplicated; the product is passed down.
 */

export type ProductId = "check-2025" | "forecast-2026";

export interface Product {
  id: ProductId;
  /** Route this product lives at. */
  href: string;
  /** The `model` query value the API expects. Not a user choice. */
  model: string;

  /** Short label, for nav and cross-links. */
  nav: string;
  /** What kind of answer this page gives. The distinction, in three words. */
  roleLabel: string;
  /** Page h1 and document title. */
  title: string;
  /** One sentence under the title: what this page does. */
  standfirst: string;
  /** Mono dateline in the explorer header. */
  dateline: string;

  /**
   * Decorative card icon, from 3dicons.co (CC0 -- commercial use, no
   * attribution). Self-hosted under public/icons rather than hotlinked.
   *
   * DECORATIVE, and rendered with alt="": the role label beside it already
   * names the distinction, so announcing the icon too would just repeat it to
   * a screen reader. Landing page only -- the app surfaces keep the plain
   * dot-and-label, where the restraint is doing real work.
   */
  icon: string;

  /**
   * The card image, from public/media. Generated from this project's own data
   * (see the generator note in that folder's files) rather than bought in, so
   * the picture on the card is a picture of the thing the card describes.
   *
   * DECORATIVE where the caption beside it already says what it shows, which is
   * every current call site -- hence `mediaAlt` is the longer description used
   * only when the image is the sole carrier of the point.
   */
  media: string;
  mediaAlt: string;

  /** How the model describes itself, wherever it is named. */
  modelLabel: string;
  trainedOn: string;
  trainedThrough: string;

  /**
   * The date bounds the picker accepts. Deliberately narrower than the model's
   * calendar (both bundles reach 2029-09-16) so that each page offers only the
   * years it is FOR -- offering 2025 on the forecasting page would let a reader
   * ask the model about a year it studied, which the API refuses with 409.
   */
  firstDate: string;
  lastDate: string;
  defaultDate: string;
  /** The range as the picker states it. Derived, never typed twice. */
  dateLabel: string;

  /**
   * Can a forecast from this page be checked against a recorded count?
   *
   * True only for check-2025. It drives real behaviour, not just wording: the
   * recorded line, the actuals fetch, the verdict sentence and the "this is a
   * projection" note all follow it.
   */
  scoreable: boolean;

  /**
   * Full-unseen-year MAE, in vehicles/hour. NULL for the forecasting model,
   * which trained on every year we hold recorded counts for and therefore has
   * no unseen year to be measured on. Null renders as an absent measurement,
   * never as a blank number.
   */
  statedError: number | null;

  /**
   * The traffic LEVELS baked into this model, as a label and as a year.
   *
   * The model has no trend term, so every forecast it makes -- for any year --
   * sits at the volumes it learned. The 2024-only model carries 2024 volumes;
   * the 2024+2025 model carries volumes averaged over both. `levelYear` is the
   * most recent of them and is what growth is measured FROM.
   */
  levelLabel: string;
  levelYear: number;

  /**
   * What we actually measured on data no model had seen: 4,340 hours of live
   * 2026 roadside sensor readings at three counting stations. This is the only
   * hard number the forecasting page has, since it has no unseen YEAR -- so it
   * is stated rather than left as an absence. Null where it is not the figure
   * that page should quote.
   */
  measured: {
    /** Mean absolute percentage error over those hours. */
    errPct: number;
    /** Signed bias: negative means the model under-counts. */
    shortfallPct: number;
    where: string;
  } | null;

  /**
   * What the model knows, from counter_manifest_<model>.json. Used for the
   * landing copy, which is a Server Component and has no live data. The
   * explorer shows the count it actually loaded, so a drift here is cosmetic.
   */
  series: number;
  sites: number;
  /**
   * Why the count is what it is, in a few words, on the map card. Without it
   * the two pages simply show different totals and the difference reads as a
   * bug rather than as which counters each model has history for.
   */
  countersNote: string;

  /** Why this model answers these years, in one line. For the badge. */
  claim: string;
  /** What the reader gets out of the page. For the landing card. */
  promise: string;
  /** The honest limit of this page. For the landing card. */
  caveat: string;

  /** The other product, so either page can point at its counterpart. */
  other: ProductId;
}

export const PRODUCTS: Record<ProductId, Product> = {
  "check-2025": {
    id: "check-2025",
    href: "/check-2025",
    model: "2024",
    nav: "Check 2025",
    roleLabel: "Scored against reality",
    title: "Check the 2025 forecasts",
    standfirst:
      "A model that learned 2024 and nothing else, predicting 2025 — beside what the road actually recorded, hour by hour.",
    dateline: "Model: 2024 only · Dates: 2025 · Scored against recorded counts",
    // A target: this page is the one that can be marked against reality.
    icon: "/icons/target.webp",
    // The scored day itself: one real 24 hours with the prediction laid over
    // the recorded count. This page's whole proposition, as a picture.
    media: "/media/rhythm.svg",
    mediaAlt:
      "One day at counter A7 Grengewald: the predicted hourly curve and the recorded one, tracking each other across 24 hours.",
    modelLabel: "Validation model",
    trainedOn: "2024 only",
    trainedThrough: "2024-12-31",
    firstDate: "2025-01-01",
    lastDate: "2025-12-31",
    defaultDate: "2025-02-15",
    dateLabel: "2025 only",
    scoreable: true,
    // Full-year 2025, the 16-feature model (MONTH_SIN/COS adopted 2026-09-08).
    // Was 13.79 for the 14-feature model; month features took it to 13.02,
    // measured twice on identical rows (8,705,856) and stored in the bundle's
    // `holdout` field. NOT the 46-day figure the bundle also carries -- that
    // window cannot judge a seasonal feature and reads 15.64.
    statedError: 13.02,
    levelLabel: "2024",
    levelYear: 2024,
    // This page never shows a date past 2025, and the 2025 comparison is the
    // measurement -- so there is nothing the sensor figure would add here.
    measured: null,
    // counter_manifest_2024.json: 1058 served, 270 sites, 1054 scoreable.
    series: 1058,
    sites: 270,
    countersNote: "every counter with 2024 history",
    claim:
      "This model never saw a single hour of 2025, so what it predicts can be marked against what really happened.",
    promise:
      "Pick any day of 2025 and see the prediction next to the true count — including the days it got wrong.",
    caveat:
      "Only 2025 works here. The counters listed are the ones this model has 2024 history for.",
    other: "forecast-2026",
  },

  "forecast-2026": {
    id: "forecast-2026",
    href: "/forecast-2026",
    model: "2024_2025",
    nav: "Forecast 2026–28",
    roleLabel: "Forecast only",
    title: "Forecast 2026 to 2028",
    standfirst:
      "The model that learned both 2024 and 2025, forecasting days the road has not reached yet. There is nothing to score it against — and it says so.",
    dateline: "Model: 2024 + 2025 · Dates: 2026–2028 · Forecast only",
    // A calendar: this page is about dates that have not happened yet.
    icon: "/icons/calendar.webp",
    // The daily shape, stacked down the network: what this page returns for a
    // date nobody can check yet -- a rhythm, not a scored line.
    media: "/media/scan.svg",
    mediaAlt:
      "The shape of a day repeated down the counter network, the morning peak giving way to an evening one.",
    modelLabel: "Forecasting model",
    trainedOn: "2024 + 2025",
    trainedThrough: "2025-12-31",
    firstDate: "2026-01-01",
    lastDate: "2028-12-31",
    defaultDate: "2026-10-14",
    dateLabel: "2026 – 2028",
    scoreable: false,
    statedError: null,
    levelLabel: "2024–2025",
    levelYear: 2025,
    measured: {
      errPct: 11.4,
      shortfallPct: -3.3,
      where: "three roadside sensors on the A1 and the B40, June and July 2026",
    },
    // counter_manifest_2024_2025.json: 1070 served, 273 sites. Three counters
    // (607 Marnach, 1414 France Frontiere, 1444 Schifflange) started reporting
    // during 2025, so they exist here and cannot exist on the other page.
    series: 1070,
    sites: 273,
    countersNote: "every counter that reported in 2024 or 2025",
    claim:
      "This model has the most recent traffic we hold. Because it learned 2025, it is deliberately not used for 2025 dates.",
    promise:
      "Pick a date up to 2028 and get the hourly shape of that day, on every counter reporting in 2024 or 2025.",
    caveat:
      "No ± figure. This model trained on every year we have counts for, so no unseen year is left to measure it on.",
    other: "check-2025",
  },
};

export const CHECK_2025 = PRODUCTS["check-2025"];
export const FORECAST_2026 = PRODUCTS["forecast-2026"];

/** Both, in reading order: what can be checked first, then what cannot. */
export const PRODUCT_LIST: readonly Product[] = [CHECK_2025, FORECAST_2026];

/** The counterpart page, for cross-links. */
export function otherProduct(p: Product): Product {
  return PRODUCTS[p.other];
}

/**
 * Hold a date inside this product's years.
 *
 * `min`/`max` bound the calendar widget, but a typed date still arrives
 * unchecked in some browsers -- and here an out-of-range date is not merely
 * empty, it is a request to the wrong model. Clamped rather than trusted.
 */
export function clampDate(p: Product, date: string): string {
  if (!date) return p.defaultDate;
  if (date < p.firstDate) return p.firstDate;
  if (date > p.lastDate) return p.lastDate;
  return date;
}
