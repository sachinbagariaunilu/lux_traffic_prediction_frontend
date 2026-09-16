"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Spinner from "@/components/ui/Spinner";
import DateInput from "@/components/ui/DateInput";
import Segmented from "@/components/ui/Segmented";
import { fetchActuals } from "@/lib/api/actuals";
import { formatCount, formatHour, formatSignedPercent, weekdayName } from "@/lib/format";
import type { ActualsFile, CounterSeries, VehiculeCode } from "@/lib/types";
import { runForecast } from "../hooks/useForecastRun";
import {
  CMP_COLORS,
  CMP_FIRST_DATE,
  CMP_LAST_DATE,
  MAX_LINES,
  blockedReason,
  freeSlot,
  productForDate,
  type ComparisonLine,
} from "../lib/comparison";
import { vehicleLabel } from "../lib/constants";
import { summariseDay } from "../lib/hourly";
import ForecastStats from "./ForecastStats";

/**
 * Recharts is by far the heaviest thing on this route and nothing can be
 * charted until a forecast comes back, so BOTH charts load alongside that
 * request instead of sitting in the /map entry chunk.
 *
 * This wrapper used to live in ForecastReport around HourlyChart alone. Moving
 * the chart in here without it would have re-imported recharts statically and
 * quietly undone that -- the page would still work, and the entry chunk would
 * just be bigger for everyone who never opens a counter.
 */
const chartLoading = () => (
  <div className="flex h-[300px] items-center justify-center">
    <Spinner />
  </div>
);

const ComparisonChart = dynamic(() => import("./ComparisonChart"), {
  ssr: false,
  loading: chartLoading,
});
const HourlyChart = dynamic(() => import("./HourlyChart"), {
  ssr: false,
  loading: chartLoading,
});

/**
 * "Add another day" -- the same counter, any date, direction and vehicle.
 *
 * Every added line goes through runForecast(), the SAME path the panel itself
 * uses, so a comparison line and the line it is compared against were produced
 * the same way. The product is resolved per line from its DATE, which is the
 * only place in this app where one view holds output from both models -- hence
 * the Model column in the table, which is not decoration.
 */
export default function ComparisonSection({
  base,
  series,
  directions,
  vehicles,
}: {
  /** The line already on screen. Owns colour slot 0 and cannot be removed. */
  base: ComparisonLine;
  series: CounterSeries;
  directions: number[];
  vehicles: VehiculeCode[];
}) {
  const [lines, setLines] = useState<ComparisonLine[]>([]);
  const [open, setOpen] = useState(false);
  /** Line being edited, or null when the form is adding a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(base.date);
  const [direction, setDirection] = useState(base.direction);
  const [vehicule, setVehicule] = useState<VehiculeCode>(base.vehicule);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const all = [base, ...lines];
  const full = all.length >= MAX_LINES;
  const blocked = blockedReason(series, date);

  function startEdit(l: ComparisonLine) {
    setEditingId(l.id);
    setDate(l.date);
    setDirection(l.direction);
    setVehicule(l.vehicule);
    setError(null);
    setOpen(true);
  }

  function startAdd() {
    setEditingId(null);
    setError(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setError(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const product = productForDate(date);
      if (!product) throw new Error(`No model covers ${date}.`);
      const acts: ActualsFile | null = product.scoreable
        ? await fetchActuals(series.poste_id)
        : null;
      const res = await runForecast(
        { poste_id: series.poste_id, direction, vehicule, date, product },
        acts,
      );
      const summary = summariseDay(res.hours);
      if (!summary) throw new Error("That day came back empty.");

      setLines((prev) => {
        const fields = {
          date,
          weekday: weekdayName(date),
          direction,
          vehicule,
          hours: res.hours,
          summary,
          outcome: res.outcome,
          product,
        };
        // An EDIT keeps the line's id and colour slot. Dropping and re-adding
        // would hand it a different colour and silently re-label every legend
        // entry and table row the reader had already learned.
        if (editingId) {
          return prev.map((l) => (l.id === editingId ? { ...l, ...fields } : l));
        }
        return [
          ...prev,
          {
            id: `${date}-${direction}-${vehicule}-${Date.now()}`,
            slot: freeSlot([base, ...prev]),
            ...fields,
          },
        ];
      });
      close();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : editingId
            ? "Could not update that day"
            : "Could not add that day",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* ONE chart, not two. ComparisonChart already draws the base day -- it
          holds colour slot 0 and gets the same three readings as every other
          line -- so rendering HourlyChart above it repeated the whole series in
          a second set of axes. They swap rather than stack.

          HourlyChart stays the no-comparison view rather than being replaced by
          a one-line ComparisonChart: it separates the three readings by COLOUR,
          which is easier to read than by line style, and that is only possible
          while there is a single day to draw. */}
      {/* Same swap as the chart, for the same reason. Four tiles say everything
          about ONE day and nothing about a comparison; three days would need
          twelve of them. So the tiles give way to the table, which says the
          same four things per row and adds the provenance a single day never
          needed. One chart, one stats block, whichever mode you are in. */}
      {lines.length === 0 && <ForecastStats summary={base.summary} />}

      <div className="bg-[var(--viz-surface)] px-4 py-4 ring-1 ring-[var(--viz-border)]">
        {lines.length ? (
          <ComparisonChart lines={all} />
        ) : (
          <HourlyChart hourly={base.hours} dayName={base.weekday} />
        )}
      </div>

      {lines.length > 0 && (
        <>
          {/* The table is where each line's PROVENANCE lives. Two lines can come
              from two models -- a 2025 date is answered by the validation model
              and a 2026 date by the forecasting one -- and on a chart they sit
              next to each other looking equally authoritative. */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="label-mono text-left">
                <tr className="border-b border-[var(--viz-hairline)]">
                  <th className="py-1.5 pr-2 font-normal">Day</th>
                  <th className="py-1.5 pr-2 text-right font-normal">Predicted</th>
                  <th className="py-1.5 pr-2 text-right font-normal">Recorded</th>
                  <th className="py-1.5 pr-2 text-right font-normal">Off by</th>
                  <th className="py-1.5 pr-2 font-normal">Busiest</th>
                  <th className="py-1.5 font-normal">Model</th>
                  <th />
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {all.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--viz-hairline)]/50">
                    <td className="py-1.5 pr-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-0.5 w-3 shrink-0 rounded-full"
                          style={{ background: CMP_COLORS[l.slot] }}
                        />
                        <span className="text-[var(--viz-ink)]">{l.date}</span>
                        <span className="text-[var(--viz-muted)]">
                          {l.weekday.slice(0, 3)} · dir {l.direction} · {l.vehicule}
                        </span>
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {formatCount(l.summary.predictedTotal)}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {l.summary.actualTotal === null
                        ? "—"
                        : formatCount(l.summary.actualTotal)}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {l.summary.dayError === null
                        ? "—"
                        : formatSignedPercent(l.summary.dayError)}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">
                      {formatHour(l.summary.peak.hour)}{" "}
                      <span className="text-[var(--viz-muted)]">
                        {formatCount(l.summary.peak.predicted)}/h
                      </span>
                    </td>
                    <td className="py-1.5 text-[var(--viz-muted)]">
                      {l.product.modelLabel}
                    </td>
                    {/* The base row has no actions: it IS the report, and the
                        controls above the chart already change it. */}
                    <td className="py-1.5 text-right whitespace-nowrap">
                      {l.id !== base.id && (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(l)}
                            aria-label={`Edit ${l.date}`}
                            className="label-mono px-1 text-[var(--viz-muted)] transition hover:text-[var(--viz-ink)]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLines((p) => p.filter((x) => x.id !== l.id));
                              if (editingId === l.id) close();
                            }}
                            aria-label={`Remove ${l.date}`}
                            className="px-1 text-[var(--viz-muted)] transition hover:text-[var(--viz-ink)]"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {open ? (
        <div className="space-y-3 bg-[var(--viz-surface)] px-3.5 py-3 ring-1 ring-[var(--viz-border)]">
          <label className="block">
            <span className="label-mono mb-1.5 flex items-baseline justify-between gap-2">
              <span>{editingId ? "Edit this day" : "Day to compare"}</span>
              <span className="text-[var(--viz-muted)]">
                {weekdayName(date)}
              </span>
            </span>
            <DateInput
              value={date}
              min={CMP_FIRST_DATE}
              max={CMP_LAST_DATE}
              onChange={(e) => setDate(e.target.value)}
              className="w-full cursor-pointer rounded-[var(--r-control)] border border-[var(--viz-hairline)] bg-[var(--viz-plane)] px-3 py-2 text-sm text-[var(--viz-ink)] outline-none focus:border-[var(--viz-series)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Segmented
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={directions.map((d) => ({ value: d, label: `Dir ${d}` }))}
            />
            <Segmented
              label="Vehicle"
              value={vehicule}
              onChange={setVehicule}
              options={vehicles.map((v) => ({
                value: v,
                label: `${vehicleLabel(v)} (${v})`,
              }))}
            />
          </div>

          {blocked && (
            <p className="text-[11px] text-[var(--status-warn)]">{blocked}</p>
          )}
          {error && (
            <p className="text-[11px] text-[var(--status-warn)]">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !!blocked || (full && !editingId)}
              className="pill-quiet label-mono px-4 py-2 text-[12px] disabled:opacity-55"
            >
              {busy
                ? editingId
                  ? "Updating…"
                  : "Adding…"
                : editingId
                  ? "Update"
                  : "Add to chart"}
            </button>
            <button
              type="button"
              onClick={close}
              className="label-mono px-2 py-2 text-[var(--viz-muted)] transition hover:text-[var(--viz-ink)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        !full && (
          <button
            type="button"
            onClick={startAdd}
            className="pill-quiet label-mono w-full justify-center px-4 py-2.5 text-[12px]"
          >
            + Add another day ({all.length} of {MAX_LINES})
          </button>
        )
      )}
    </div>
  );
}
