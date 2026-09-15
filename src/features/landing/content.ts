/**
 * Every word and figure on the overview page, out of the markup.
 *
 * The numbers are measured from the shipped model bundle and the extracted
 * counts -- see the README for how each was derived. Nothing here is rounded
 * for effect, so this file is also the place to check a claim against the data.
 */

import { weekdayName } from "@/lib/format";
import { RHYTHM } from "./data/landing-data";

/** The four figures under "The evidence". */
export const EVIDENCE: readonly {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  note: string;
  /** Exactly one block in the row is filled with the accent. */
  accent?: boolean;
}[] = [
  {
    value: 17.7,
    decimals: 1,
    suffix: "M",
    label: "hourly readings",
    note: "every hour of 2024 and 2025, at every counter that reported",
  },
  {
    value: 269,
    decimals: 0,
    suffix: "",
    label: "counters scored",
    note: "2025 forecasts checked against what the road recorded",
    accent: true,
  },
  {
    value: 1070,
    decimals: 0,
    suffix: "",
    label: "series forecastable",
    note: "each counter × direction × vehicle type — on the forecasting model; the 2024-only model knows 1,058",
  },
  {
    value: 729,
    decimals: 0,
    suffix: "",
    label: "days learned",
    note: "2024 and 2025 — but never the year a model is judged on",
  },
];

/** "How it works", in three steps. */
export const STEPS = [
  {
    n: "01",
    title: "Learn the rhythm",
    body: "17,679,792 hourly readings across 729 days of 2024 and 2025. From those a model learns fourteen signals: hour, weekday, weekend, public and school holidays, distance to the nearest holiday, and each counter's own profile — including how that counter behaves on a holiday specifically.",
    footnote: "14 features · no live feed, no lag terms",
  },
  {
    n: "02",
    title: "Two models, kept apart",
    body: "One model learned 2024 alone; the other learned 2024 and 2025. They live on separate pages, and each page offers only the years its own model has never seen — 2025 on one, 2026 to 2028 on the other. That is not a convenience: a model asked about a year it studied is recalling, not predicting, and any error you quoted from it would be flattery. Nothing on this site lets the two mix, and the API refuses the pairing independently of the pages.",
    footnote: "Check 2025: trained on 2024 · Forecast 2026–28: trained on 2024 + 2025",
  },
  {
    n: "03",
    title: "Mark its homework",
    body: "We hold what the road really recorded for 2025. On the Check 2025 page every forecast appears beside the true count for that exact date — including the days the model got wrong. This only means something because the model producing those forecasts never saw 2025: it is a test, not a recollection. The forecast page has no such year, and shows no error figure rather than borrowing one.",
    footnote: "733,562 recorded days to check against",
  },
] as const;

/** The three lines on every chart in the app. */
export const CHART_LINES = [
  {
    color: "var(--viz-actual)",
    dashed: false,
    title: "What really happened",
    body: "The count the counter recorded that hour. A whole number, straight from the open data.",
  },
  {
    color: "var(--viz-series)",
    dashed: false,
    title: "Our prediction",
    body: "What the model expected, knowing only the calendar — never the answer.",
  },
  {
    color: "var(--viz-baseline)",
    dashed: true,
    // Derived from RHYTHM.date for the same reason as the legend below: this
    // described the chart as a Wednesday while the chart plotted a Thursday.
    title: `A usual ${weekdayName(RHYTHM.date)}`,
    body: `Not one particular day. It averages every ${weekdayName(RHYTHM.date)} this counter recorded in 2024, hour by hour — the 08:00 figure averages all the ${weekdayName(RHYTHM.date)} 08:00s.`,
  },
] as const;

/** Stated plainly, because a forecast nobody can fault is a forecast nobody checks. */
export const LIMITS = [
  {
    title: "The error figure is an average",
    body: "±13.0 vehicles/hour spans all 1,054 series, and most are quiet rural counters. On a motorway counter the real error is far larger — the busiest fifth averages ±36/h.",
  },
  {
    title: "Only 2025 can be marked",
    body: "2025 is the one year with both a forecast from a model that never saw it and a recorded count to check it against — which is why it gets its own page. The forecast page still reads the real 2026–2028 calendars, holidays and all, but nothing exists to score those days, so it shows the prediction and says so. The further out the date, the more that matters.",
  },
  {
    title: "The forecast page has no stated error",
    body: "The 2024-only model can quote ±13.0 vehicles/hour because 2025 measured it. The 2024 + 2025 model trained on every year we hold counts for, so there is no unseen year left to measure it on, and that page shows no ± figure rather than borrowing one. What we do know comes from roadside sensors in June and July 2026, where it averaged 11.4% error against 12.5% for the 2024-only model — three counters, two months, not the whole network.",
  },
  {
    title: "No date is answered by both models",
    body: "So the two pages cannot be compared directly. You cannot run 2025 through the forecasting model to see whether it does better, because that model studied 2025 and the API refuses the request. The only place both were measured on the same rows is those 2026 roadside sensors.",
  },
  {
    title: "The baseline ignores season",
    body: "March Sundays and November Sundays fold into a single “usual Sunday”, so the baseline runs high in winter and low in spring.",
  },
] as const;

export const DATASET_URL = "https://data.public.lu/en/datasets/pch-comptage-trafic/";
export const DATASET_NAME = "PCH\u00a0: Comptage Trafic";
export const AUTHOR_URL = "https://www.linkedin.com/in/sachin-bagaria/";

export const SOURCE_FACTS = [
  ["Publisher", "Administration des Ponts et Chaussées"],
  ["Portal", "data.public.lu"],
  ["Licence", "Creative Commons Zero (CC0)"],
  ["Files used", "2024 and 2025 annual exports"],
  ["Models", "2024 only → Check 2025 · 2024 + 2025 → Forecast 2026–28"],
] as const;

/** The day drawn in the proof section, as a percentage the headline can state. */
export const DAY_ERROR_PCT =
  Math.abs(RHYTHM.predictedTotal / RHYTHM.actualTotal - 1) * 100;

/**
 * Totals under that chart, in the order they are read. Colours come from the
 * validated series tokens -- the legend and the lines must never drift apart.
 */
export const RHYTHM_TOTALS = [
  { key: "Recorded", value: RHYTHM.actualTotal, color: "var(--viz-actual)", dashed: false },
  { key: "Predicted", value: RHYTHM.predictedTotal, color: "var(--viz-series)", dashed: false },
  // Dashed here as well as in the chart: the baseline's identity must never
  // rest on colour alone.
  // DERIVED, not typed. This read "A usual Wednesday" while RHYTHM.date was a
  // Thursday -- the label had been left behind by an earlier example day, and a
  // legend that names the wrong weekday discredits the chart above it.
  {
    key: `A usual ${weekdayName(RHYTHM.date)}`,
    value: RHYTHM.typicalTotal,
    color: "var(--viz-baseline)",
    dashed: true,
  },
] as const;
