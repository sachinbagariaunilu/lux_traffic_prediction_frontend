/**
 * Every word and figure on the overview page, out of the markup.
 *
 * The numbers are measured from the shipped model bundle and the extracted
 * counts -- see the README for how each was derived. Nothing here is rounded
 * for effect, so this file is also the place to check a claim against the data.
 */

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
    value: 8.9,
    decimals: 1,
    suffix: "M",
    label: "hourly readings",
    note: "every hour of 2024, at every counter that reported",
  },
  {
    value: 270,
    decimals: 0,
    suffix: "",
    label: "road counters",
    note: "permanent stations, nationwide",
    accent: true,
  },
  {
    value: 1058,
    decimals: 0,
    suffix: "",
    label: "measured series",
    note: "each counter × direction × vehicle type",
  },
  {
    value: 365,
    decimals: 0,
    suffix: "",
    label: "days learned",
    note: "the whole of 2024, nothing held back",
  },
];

/** "How it works", in three steps. */
export const STEPS = [
  {
    n: "01",
    title: "Learn the rhythm",
    body: "370,818 counter-days across every day of 2024 — 8,899,632 hourly readings. From those the model learns twelve signals: hour, weekday, weekend, public and school holidays, distance to the nearest holiday, and each counter's own profile.",
    footnote: "Trained through 31 December 2024",
  },
  {
    n: "02",
    title: "Predict any date",
    body: "Name a date, a counter, a direction and a vehicle type; get back 24 hourly numbers. It reads only the calendar — no live feed, no recent measurements — so next Tuesday and a Tuesday in 2029 cost the same.",
    footnote: "Forecast model · no lag features",
  },
  {
    n: "03",
    title: "Mark its homework",
    body: "For 2024 and 2025 we also hold what the road really recorded. Every forecast appears beside the true count for that exact date — including the days the model got wrong.",
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
    title: "A usual Wednesday",
    body: "Not one particular day. It averages every Wednesday this counter recorded in 2024, hour by hour — the 08:00 figure averages all the Wednesday 08:00s.",
  },
] as const;

/** Stated plainly, because a forecast nobody can fault is a forecast nobody checks. */
export const LIMITS = [
  {
    title: "The error figure is an average",
    body: "±18 vehicles/hour spans all 1,058 series, and most are quiet rural counters. On a motorway counter the real error is far larger — we measured ±77/h on one busy day.",
  },
  {
    title: "Reality stops at 2025",
    body: "Those are the years we hold recorded counts for. Ask for any other date and you get a forecast with nothing to check it against.",
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
  { key: "A usual Wednesday", value: RHYTHM.typicalTotal, color: "var(--viz-baseline)", dashed: true },
] as const;
