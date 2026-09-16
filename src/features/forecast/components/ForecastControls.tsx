"use client";

import DateInput from "@/components/ui/DateInput";
import Segmented from "@/components/ui/Segmented";
import Spinner from "@/components/ui/Spinner";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { CounterSite, VehiculeCode } from "@/lib/types";
import { vehicleLabel } from "../lib/constants";
import { type Product, clampDate } from "../lib/products";
import ModelBadge from "./ModelBadge";
import RecordedDataNote from "./RecordedDataNote";
import type { RecordedRange } from "../hooks/useRecordedDays";

/**
 * Date, direction, vehicle, and the button that asks for the forecast.
 *
 * Nothing here fetches on change: a forecast is a deliberate act, and firing
 * one per keystroke of a date field would spend four requests to answer one
 * question.
 *
 * The date field is bounded by the PRODUCT, not by the model's calendar. Both
 * bundles can read a calendar out to 2029, but each page offers only the years
 * its own model may honestly answer -- so there is no reachable date on this
 * page that the wrong model would have to handle, and no state where the Run
 * button has to be disabled for a date the picker itself offered.
 */
export default function ForecastControls({
  product,
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
  product: Product;
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
    range: RecordedRange | null;
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
                2029 without saying why reads as broken. */}
            <span className="label-mono mb-2 flex items-baseline justify-between gap-2">
              <span>Date to forecast</span>
              <span className="text-[var(--viz-muted)]">
                {product.dateLabel}
              </span>
            </span>
            <DateInput
              value={date}
              min={product.firstDate}
              max={product.lastDate}
              onChange={(e) => onDateChange(clampDate(product, e.target.value))}
              className="w-full cursor-pointer rounded-[var(--r-control)] border border-[var(--viz-hairline)] bg-[var(--viz-plane)] px-3.5 py-3 text-sm text-[var(--viz-ink)] outline-none transition focus:border-[var(--viz-series)] focus:bg-[var(--viz-surface)] focus:ring-4 focus:ring-[var(--viz-series)]/12"
            />
          </label>

          {/* Which model will answer, stated BEFORE the request. The error
              figure that comes back only means something if the reader knows
              the model never saw the year being predicted. */}
          {/* <ModelBadge product={product} variant="picker" /> */}

          {/* Only where a recorded count could exist. On the forecasting page
              nothing is fetched and `loaded` stays false, so this renders
              nothing rather than reporting an absence twice -- the badge above
              has already said the page cannot be scored. */}
          {product.scoreable && recorded.loaded && (
            <RecordedDataNote
              hasData={recorded.hasDay(date)}
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
            {product.scoreable ? "Run and check it" : "Run forecast"}
            <ArrowRightIcon />
          </>
        )}
      </button>
    </div>
  );
}
