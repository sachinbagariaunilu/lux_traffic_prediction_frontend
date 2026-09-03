"use client";

import Segmented from "@/components/ui/Segmented";
import Spinner from "@/components/ui/Spinner";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { CounterSite, VehiculeCode } from "@/lib/types";
import {
  COVERAGE_FIRST,
  COVERAGE_LABEL,
  COVERAGE_LAST,
  clampDate,
  isProjection,
  vehicleLabel,
} from "../lib/constants";
import RecordedDataNote from "./RecordedDataNote";

/**
 * Date, direction, vehicle, and the button that asks for the forecast.
 *
 * Nothing here fetches on change: a forecast is a deliberate act, and firing
 * one per keystroke of a date field would spend four requests to answer one
 * question.
 */
export default function ForecastControls({
  site,
  date,
  onDateChange,
  directions,
  direction,
  onDirectionChange,
  vehicles,
  vehicule,
  onVehiculeChange,
  recorded,
  loading,
  onRun,
}: {
  site: CounterSite;
  date: string;
  onDateChange: (date: string) => void;
  directions: number[];
  direction: number;
  onDirectionChange: (d: number) => void;
  vehicles: VehiculeCode[];
  vehicule: VehiculeCode;
  onVehiculeChange: (v: VehiculeCode) => void;
  recorded: {
    loaded: boolean;
    hasDay: (date: string) => boolean;
    range: { first: string; last: string; n: number } | null;
  };
  loading: boolean;
  onRun: () => void;
}) {
  return (
    <div className="shrink-0 border-y border-[var(--viz-hairline)] bg-[var(--viz-surface)] px-6 py-5">
      <div className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2">
          <label className="block">
            {/* The range is stated, not just enforced -- a picker that refuses
                2028 without saying why reads as broken. */}
            <span className="label-mono mb-2 flex items-baseline justify-between gap-2">
              <span>Date to forecast</span>
              <span className="text-[var(--viz-muted)]">{COVERAGE_LABEL}</span>
            </span>
            <input
              type="date"
              value={date}
              min={COVERAGE_FIRST}
              max={COVERAGE_LAST}
              onChange={(e) => onDateChange(clampDate(e.target.value))}
              className="w-full rounded-[var(--r-control)] border border-[var(--viz-hairline)] bg-[var(--viz-plane)] px-3.5 py-3 text-sm text-[var(--viz-ink)] outline-none transition focus:border-[var(--viz-series)] focus:bg-[var(--viz-surface)] focus:ring-4 focus:ring-[var(--viz-series)]/12"
            />
          </label>
          {/* A projection needs no actuals file to be known unscoreable, so it
              says so immediately instead of waiting on a fetch that cannot
              change the answer. */}
          {(isProjection(date) || recorded.loaded) && (
            <RecordedDataNote
              hasData={recorded.hasDay(date)}
              projection={isProjection(date)}
              range={recorded.range}
            />
          )}
        </div>

        <Segmented
          label="Direction"
          value={direction}
          onChange={onDirectionChange}
          options={directions.map((d) => ({
            value: d,
            label: `Dir ${d}`,
            hint: site.series.find((x) => x.direction === d)?.sens,
          }))}
        />

        <Segmented
          label="Vehicle"
          value={vehicule}
          onChange={onVehiculeChange}
          options={vehicles.map((v) => ({
            value: v,
            label: `${vehicleLabel(v)} (${v})`,
          }))}
        />
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={loading}
        className="pill mt-5 w-full justify-center px-4 py-3 text-[13px] transition active:scale-[0.995] disabled:opacity-55"
      >
        {loading ? (
          <>
            <Spinner size={14} tone="on-accent" />
            Forecasting…
          </>
        ) : (
          <>
            Run forecast
            <ArrowRightIcon />
          </>
        )}
      </button>
    </div>
  );
}
