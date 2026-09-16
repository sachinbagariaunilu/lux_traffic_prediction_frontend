"use client";

import Disclosure from "@/components/ui/Disclosure";
import { longDate, weekdayName } from "@/lib/format";
import type {
  CounterSeries,
  ForecastResponse,
  MergedHour,
  VehiculeCode,
} from "@/lib/types";
import { vehicleLabel } from "../lib/constants";
import type { EngineOutcome } from "../hooks/useForecastRun";
import type { Product } from "../lib/products";
import type { DaySummary } from "../lib/hourly";
import type { ComparisonLine } from "../lib/comparison";
import BaselineExplainer from "./BaselineExplainer";
import ComparisonSection from "./ComparisonSection";
import CounterDetails from "./CounterDetails";
import DownloadReportButton from "./DownloadReportButton";
import EngineNote from "./EngineNote";
import ModelBadge from "./ModelBadge";
import ProjectionNote from "./ProjectionNote";
import ForecastVerdict from "./ForecastVerdict";
import HourlyTable from "./HourlyTable";

/**
 * The answer, in the order it should be read: what day this is, the verdict in
 * a sentence, the four figures, the chart, then the numbers and the caveats for
 * anyone who wants them.
 *
 * Each block below is one direct child of `.stagger`, which animates them in
 * sequence -- so the count and order of children here is load-bearing.
 */
export default function ForecastReport({
  product,
  date,
  direction,
  vehicule,
  vehicles,
  directions,
  series,
  meta,
  hours,
  summary,
  outcome,
}: {
  product: Product;
  date: string;
  direction: number;
  vehicule: string;
  /** Classes existing at this counter/direction -- the download covers them all. */
  vehicles: VehiculeCode[];
  /** Directions this counter has, for the comparison control. */
  directions: number[];
  series?: CounterSeries;
  meta: ForecastResponse;
  hours: MergedHour[];
  summary: DaySummary;
  /** Which model actually answered. Null on the validation page's ordinary path. */
  outcome: EngineOutcome | null;
}) {
  const dayName = weekdayName(date);
  // Whether this page's answer can be marked at all is a property of the page,
  // not of the date -- so it needs no date arithmetic and no guessing from a
  // missing actuals file.
  const projection = !product.scoreable;
  // A short-horizon model reads this counter's last few days of real traffic,
  // so it carries current levels rather than the training years' -- the growth
  // shortfall block below is about the page model and does not apply to it.
  const lagAnswered = outcome?.engine.kind === "lag";
  // The answer already on screen, in the shape the comparison uses. It holds
  // colour slot 0 and cannot be removed -- it IS the report.
  const baseLine: ComparisonLine | null =
    series && outcome
      ? {
          id: "base",
          slot: 0,
          date,
          weekday: dayName,
          direction,
          vehicule: vehicule as VehiculeCode,
          hours,
          summary,
          outcome,
          product,
        }
      : null;

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
        {/* Inside this block, NOT a sibling of it: every direct child of
            `.stagger` is one step of the entrance animation, so a new child
            would shift the sequence for a control that is not part of the
            reading order. The line above names one series; the download covers
            the whole direction, which is why it sits directly under it. */}
        {series && (
          <div className="mt-3">
            <DownloadReportButton
              product={product}
              date={date}
              weekday={dayName}
              series={series}
              vehicule={vehicule as VehiculeCode}
              vehicles={vehicles}
              hours={hours}
              isHolidayPeriod={meta.is_holiday_period}
            />
          </div>
        )}
      </div>

      {/* Immediately under the verdict, because the verdict is a claim about
          accuracy and this is what entitles it. A reader who does not know the
          model never saw this year has no reason to believe the comparison.

          When a short-horizon model answered, EngineNote says so and the page
          badge would be flatly wrong -- it names the model that did NOT produce
          these numbers. So they swap rather than stack. */}
      {lagAnswered ? (
        <EngineNote outcome={outcome} />
      ) : (
        <>
          <ModelBadge product={product} variant="result" />
          <EngineNote outcome={outcome} />
        </>
      )}

      <ForecastVerdict
        dayName={dayName}
        predicted={summary.predictedTotal}
        actual={summary.complete ? summary.actualTotal : null}
        typical={summary.typicalTotal}
        projection={projection}
      />

      {/* The chart lives INSIDE this section now. It owns which one to draw:
          the single-day HourlyChart, or ComparisonChart once another day has
          been added -- and ComparisonChart already includes this day, so two
          charts would have drawn the same series twice.

          One child of .stagger where there used to be two, so the entrance
          sequence is one step shorter. */}
      {baseLine && series && (
        <ComparisonSection
          base={baseLine}
          series={series}
          directions={directions}
          vehicles={vehicles}
        />
      )}

      {/* Why there is no recorded line to compare against. Short claim visible,
          argument behind a dropdown -- this was ~150 words of always-open prose
          whose first sentence merely repeated the verdict above it.

          Skipped entirely when a short-horizon model answered: EngineNote has
          already said what this date is and why, and the projection wording
          would contradict it. That model was handed this counter's own recent
          counts, so it carries current levels and needs no growth caveat. */}
      {summary.actualTotal === null && !lagAnswered && (
        <ProjectionNote
          product={product}
          date={date}
          dayName={dayName}
          projection={projection}
        />
      )}

      <div className="space-y-2">
        <Disclosure label="Hour-by-hour numbers">
          <HourlyTable hours={hours} dayName={dayName} />
        </Disclosure>

        {series && (
          <Disclosure label="Counter details">
            <div className="bg-[var(--viz-surface)] px-4 py-3 ring-1 ring-[var(--viz-border)]">
              <CounterDetails product={product} series={series} meta={meta} />
            </div>
          </Disclosure>
        )}

        {/* Background, not a finding. It explains the dashed line, which people
            do misread -- but it is the same explanation on every report and on
            every date, so it does not earn permanent space under all of them. */}
        <Disclosure label={`What “a usual ${dayName}” means`}>
          <BaselineExplainer product={product} dayName={dayName} />
        </Disclosure>
      </div>
    </div>
  );
}
