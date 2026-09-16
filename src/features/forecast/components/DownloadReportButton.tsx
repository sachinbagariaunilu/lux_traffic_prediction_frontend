"use client";

import { useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import type {
  ActualsFile,
  CounterSeries,
  MergedHour,
  VehiculeCode,
} from "@/lib/types";
import { runForecast } from "../hooks/useForecastRun";
import { vehicleLabel } from "../lib/constants";
import type { Product } from "../lib/products";
import { buildReport, reportFilename } from "../lib/report";

const CLASSES: VehiculeCode[] = ["V", "C"];

/**
 * Downloads the day as JSON, covering BOTH vehicle classes for this direction.
 *
 * The panel only ever holds the selected series, so the other class is fetched
 * HERE, on click. Fetching both up front would double every forecast request to
 * serve the few that end in a download.
 *
 * A class that cannot be delivered never becomes a zero: it is left out of
 * `vehicles_included`, its columns stay null, and `warnings` says why. The file
 * is still written -- refusing the whole download because a counter has no lorry
 * series would withhold the half that is perfectly good.
 */
export default function DownloadReportButton({
  product,
  date,
  weekday,
  series,
  vehicule,
  vehicles,
  hours,
  isHolidayPeriod,
}: {
  product: Product;
  date: string;
  weekday: string;
  /** The selected series -- supplies the counter identity for the file. */
  series: CounterSeries;
  vehicule: VehiculeCode;
  /** Classes that EXIST at this counter/direction, from useSeriesSelection. */
  vehicles: VehiculeCode[];
  /** Already on screen for `vehicule`; never re-requested. */
  hours: MergedHour[];
  isHolidayPeriod: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setFailed(null);
    try {
      const byVehicle: Partial<Record<VehiculeCode, MergedHour[]>> = {
        [vehicule]: hours,
      };
      const warnings: string[] = [];

      // One ActualsFile covers every series at this counter, so it is fetched
      // once here rather than inside each runForecast.
      const acts: ActualsFile | null = product.scoreable
        ? await fetchActuals(series.poste_id)
        : null;

      for (const code of CLASSES) {
        if (code === vehicule) continue;
        if (!vehicles.includes(code)) {
          warnings.push(
            `${vehicleLabel(code)} (${code}) not included: no ${code} series for ` +
              `counter ${series.poste_id} direction ${series.direction}.`,
          );
          continue;
        }
        try {
          const res = await runForecast(
            {
              poste_id: series.poste_id,
              direction: series.direction,
              vehicule: code,
              date,
              product,
            },
            acts,
          );
          byVehicle[code] = res.hours;
        } catch (e) {
          // The on-screen class is still worth exporting; say what is missing
          // rather than failing the whole download.
          warnings.push(
            `${vehicleLabel(code)} (${code}) not included: ${
              e instanceof Error ? e.message : "request failed"
            }`,
          );
        }
      }

      const report = buildReport({
        series,
        date,
        weekday,
        isHolidayPeriod,
        byVehicle,
        warnings,
      });

      const url = URL.createObjectURL(
        new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFilename(series, date);
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : "Could not build the report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="pill-quiet label-mono px-4 py-2 text-[12px] disabled:opacity-55"
      >
        {busy ? "Preparing…" : "Download JSON"}
      </button>
      {failed && (
        <span className="text-[11px] text-[var(--status-warn)]">{failed}</span>
      )}
    </div>
  );
}
