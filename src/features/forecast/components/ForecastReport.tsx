"use client";

import dynamic from "next/dynamic";
import Disclosure from "@/components/ui/Disclosure";
import Spinner from "@/components/ui/Spinner";
import { longDate, weekdayName } from "@/lib/format";
import type { CounterSeries, ForecastResponse, MergedHour } from "@/lib/types";
import { vehicleLabel } from "../lib/constants";
import type { DaySummary } from "../lib/hourly";
import BaselineExplainer from "./BaselineExplainer";
import CounterDetails from "./CounterDetails";
import ForecastStats from "./ForecastStats";
import ForecastVerdict from "./ForecastVerdict";
import HourlyTable from "./HourlyTable";

// Recharts is by far the heaviest thing on this route and nothing can be
// charted until a forecast comes back, so it loads alongside that request
// instead of sitting in the /map entry chunk.
const HourlyChart = dynamic(() => import("./HourlyChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center">
      <Spinner />
    </div>
  ),
});

/**
 * The answer, in the order it should be read: what day this is, the verdict in
 * a sentence, the four figures, the chart, then the numbers and the caveats for
 * anyone who wants them.
 *
 * Each block below is one direct child of `.stagger`, which animates them in
 * sequence -- so the count and order of children here is load-bearing.
 */
export default function ForecastReport({
  date,
  direction,
  vehicule,
  series,
  meta,
  hours,
  summary,
}: {
  date: string;
  direction: number;
  vehicule: string;
  series?: CounterSeries;
  meta: ForecastResponse;
  hours: MergedHour[];
  summary: DaySummary;
}) {
  const dayName = weekdayName(date);

  return (
    <div className="stagger space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="display-md">
            {dayName}, {longDate(date)}
          </h3>
          {meta.is_holiday_period && (
            <span className="label-mono bg-[var(--status-warn)]/15 px-2 py-1 text-[var(--status-warn)]">
              holiday period
            </span>
          )}
        </div>
        {/* Spell out exactly which of the counter's series this report covers. */}
        <p className="label-mono mt-2.5">
          {vehicleLabel(vehicule)} ({vehicule}) · Direction {direction}
          {series ? ` — ${series.sens}` : ""}
        </p>
      </div>

      <ForecastVerdict
        dayName={dayName}
        predicted={summary.predictedTotal}
        actual={summary.complete ? summary.actualTotal : null}
        typical={summary.typicalTotal}
      />

      <ForecastStats summary={summary} />

      <div className="bg-[var(--viz-surface)] px-4 py-4 ring-1 ring-[var(--viz-border)]">
        <HourlyChart hourly={hours} dayName={dayName} />
      </div>

      {summary.actualTotal === null && (
        <p className="bg-[var(--viz-surface)] px-4 py-3.5 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
          No recorded data for this counter on {date} — either the date falls outside
          2024–2025, or this counter did not report that day. The forecast still stands;
          there is just nothing to score it against.
        </p>
      )}

      <div className="space-y-2">
        <Disclosure label="Hour-by-hour numbers">
          <HourlyTable hours={hours} dayName={dayName} />
        </Disclosure>

        {series && (
          <Disclosure label="Counter details">
            <div className="bg-[var(--viz-surface)] px-4 py-3 ring-1 ring-[var(--viz-border)]">
              <CounterDetails series={series} meta={meta} />
            </div>
          </Disclosure>
        )}
      </div>

      <BaselineExplainer dayName={dayName} />
    </div>
  );
}
