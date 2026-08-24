"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchActuals, fetchForecast, mergeHours } from "@/lib/api";
import { lurefToLatLon } from "@/lib/luref";
import type {
  ActualsFile,
  CounterSeries,
  CounterSite,
  ForecastResponse,
  MergedHour,
} from "@/lib/types";
import HourlyChart from "./HourlyChart";

const VEHICLE_LABEL: Record<string, string> = { V: "Cars", C: "Trucks" };
const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Trained through 2024-12-31, so 2025 dates are genuine forecasts we can score. */
const DEFAULT_DATE = "2025-02-15";

/* ------------------------------------------------------------------ */

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--viz-muted)]">
        {label}
      </span>
      <div className="segment" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            data-on={o.value === value}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            title={o.hint}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "actual" | "series";
}) {
  const accent =
    tone === "actual"
      ? "text-[var(--viz-actual)]"
      : tone === "series"
        ? "text-[var(--viz-series)]"
        : "text-[var(--viz-ink)]";
  return (
    <div className="ring-hairline rounded-xl bg-[var(--viz-surface)] px-3.5 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--viz-muted)]">
        {label}
      </div>
      <div
        className={`mt-1 text-[22px] font-semibold leading-none tracking-tight tabular-nums ${accent}`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[10px] leading-tight text-[var(--viz-ink-2)]">{sub}</div>
      )}
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-[var(--viz-grid)] py-2 first:border-t-0">
      <dt className="shrink-0 text-[var(--viz-muted)]">{term}</dt>
      <dd className="ml-auto min-w-0 truncate text-right font-medium text-[var(--viz-ink)]">
        {children}
      </dd>
    </div>
  );
}

/** Every field /counters carries for the chosen series -- nothing withheld. */
function CounterDetails({ s }: { s: CounterSeries }) {
  const { lat, lon } = lurefToLatLon(s.coord_x, s.coord_y);
  return (
    <dl className="text-[11px]">
      <Row term="Counter id">{s.poste_id}</Row>
      <Row term="Route">{s.route}</Row>
      <Row term="Locality">{s.localite}</Row>
      <Row term="Direction">{s.direction}</Row>
      <Row term="Heading">{s.sens}</Row>
      <Row term="Vehicle">
        {VEHICLE_LABEL[s.vehicule] ?? s.vehicule} ({s.vehicule})
      </Row>
      <Row term="Avg per hour">
        <span className="tabular-nums">{fmt(s.avg_per_hour)}</span> veh/h
      </Row>
      <Row term="Days reported">
        <span className="tabular-nums">{s.days_reported}</span> of 366
      </Row>
      <Row term="First day">
        <span className="tabular-nums">{s.first_day}</span>
      </Row>
      <Row term="Last day">
        <span className="tabular-nums">{s.last_day}</span>
      </Row>
      <Row term="LUREF x, y">
        <span className="tabular-nums">
          {Math.round(s.coord_x)}, {Math.round(s.coord_y)}
        </span>
      </Row>
      <Row term="Lat, lon">
        <span className="tabular-nums">
          {lat.toFixed(5)}, {lon.toFixed(5)}
        </span>
      </Row>
    </dl>
  );
}

/** Turn the numbers into a sentence, so nobody has to decode the chart first. */
function Verdict({
  dayName,
  predicted,
  actual,
  typical,
}: {
  dayName: string;
  predicted: number;
  actual: number | null;
  typical: number;
}) {
  // Compare against the truth where we have it, the forecast where we don't.
  const basis = actual ?? predicted;
  const vsUsual = typical > 0 ? (basis / typical - 1) * 100 : 0;
  const mood =
    vsUsual > 8 ? "busier than usual" : vsUsual < -8 ? "quieter than usual" : "about normal";

  const headline = actual
    ? `That ${dayName} was ${mood}.`
    : `We expect a ${mood === "about normal" ? "normal" : mood.replace(" than usual", "-than-usual")} ${dayName}.`;

  const errPct = actual && actual > 0 ? (predicted / actual - 1) * 100 : null;
  const accuracy =
    errPct === null
      ? null
      : Math.abs(errPct) < 2
        ? "and the forecast was within 2% of it"
        : `and the forecast ran ${Math.abs(errPct).toFixed(0)}% ${errPct > 0 ? "high" : "low"}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--viz-surface)] ring-hairline">
      <span className="lux-stripe-y absolute inset-y-0 left-0 w-[3px]" aria-hidden />
      <div className="py-4 pl-5 pr-4">
        <p className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--viz-ink)]">
          {headline}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--viz-ink-2)]">
          {actual ? (
            <>
              The road actually saw{" "}
              <strong className="font-semibold text-[var(--viz-actual)]">
                {fmt(actual)}
              </strong>{" "}
              vehicles, {accuracy} at{" "}
              <strong className="font-semibold text-[var(--viz-series)]">
                {fmt(predicted)}
              </strong>
              .
            </>
          ) : (
            <>
              We predict{" "}
              <strong className="font-semibold text-[var(--viz-series)]">
                {fmt(predicted)}
              </strong>{" "}
              vehicles. Nothing was recorded on this date, so there is no way to check
              it.
            </>
          )}{" "}
          A usual {dayName} here sees about{" "}
          <strong className="font-semibold">{fmt(typical)}</strong>.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function ForecastPanel({
  site,
  onClose,
}: {
  site: CounterSite;
  onClose: () => void;
}) {
  const directions = useMemo(
    () => [...new Set(site.series.map((s) => s.direction))].sort(),
    [site],
  );
  const [direction, setDirection] = useState(directions[0]);

  // Not every counter records both cars and trucks in both directions.
  const vehicles = useMemo(
    () =>
      [
        ...new Set(
          site.series.filter((s) => s.direction === direction).map((s) => s.vehicule),
        ),
      ]
        .sort()
        .reverse(), // V (cars) before C (trucks)
    [site, direction],
  );
  const [pickedVehicule, setPickedVehicule] = useState(vehicles[0]);
  // Derived, not synced: switching direction can strip a vehicle type from the
  // list, and falling back here avoids a render pass that holds an invalid value.
  const vehicule = vehicles.includes(pickedVehicule) ? pickedVehicule : vehicles[0];
  const [date, setDate] = useState(DEFAULT_DATE);

  const [result, setResult] = useState<{
    meta: ForecastResponse;
    hours: MergedHour[];
    /** What was asked for -- lets us drop the result when the controls move on. */
    key: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // Nothing is forecast until asked, and a result is only shown while it still
  // matches the controls above it -- no effect needed to clear it.
  const requestKey = `${site.poste_id}|${direction}|${vehicule}|${date}`;
  const current = result?.key === requestKey ? result : null;
  const meta = current?.meta ?? null;
  const hours = current?.hours ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Pull the counter's recorded days as soon as the panel opens (cached, ~90 KB)
  // so the date field can say up front whether a real comparison is possible.
  const [actuals, setActuals] = useState<ActualsFile | null>(null);
  useEffect(() => {
    let live = true;
    fetchActuals(site.poste_id).then((a) => live && setActuals(a));
    return () => {
      live = false;
    };
  }, [site.poste_id]);

  const recordedDays = actuals?.series?.[`${direction}-${vehicule}`];
  const hasActualForDate = Boolean(recordedDays?.[date]);
  const recordedRange = useMemo(() => {
    const days = recordedDays ? Object.keys(recordedDays).sort() : [];
    return days.length
      ? { first: days[0], last: days[days.length - 1], n: days.length }
      : null;
  }, [recordedDays]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The forecast is remote; the actuals are a local static file. Fetch both
      // at once so the slow one sets the pace.
      const [forecast, acts] = await Promise.all([
        fetchForecast(site.poste_id, direction, vehicule, date),
        fetchActuals(site.poste_id),
      ]);
      setResult({
        meta: forecast,
        hours: mergeHours(forecast, acts, direction, vehicule, date),
        key: requestKey,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [site.poste_id, direction, vehicule, date, requestKey]);

  const selected = site.series.find(
    (s) => s.direction === direction && s.vehicule === vehicule,
  );

  const dayName = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-GB", { weekday: "long" });
  }, [date]);

  const prettyDate = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? date
      : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }, [date]);

  const summary = useMemo(() => {
    if (!hours) return null;
    const withActual = hours.filter((h) => h.actual !== null);
    const predictedTotal = hours.reduce((a, h) => a + h.predicted, 0);
    const typicalTotal = hours.reduce((a, h) => a + h.typical_2024, 0);
    const actualTotal = withActual.length
      ? withActual.reduce((a, h) => a + (h.actual ?? 0), 0)
      : null;
    const peak = hours.reduce((a, b) => (b.predicted > a.predicted ? b : a));
    return {
      predictedTotal,
      typicalTotal,
      actualTotal,
      // Only meaningful when the whole day was recorded.
      complete: withActual.length === 24,
      mae: withActual.length
        ? withActual.reduce((a, h) => a + Math.abs(h.predicted - (h.actual ?? 0)), 0) /
          withActual.length
        : null,
      dayError:
        actualTotal && actualTotal > 0 ? (predictedTotal / actualTotal - 1) * 100 : null,
      vsTypical: typicalTotal > 0 ? (predictedTotal / typicalTotal - 1) * 100 : null,
      peak,
    };
  }, [hours]);

  return (
    <>
      <div
        className="fixed inset-0 z-[900] bg-black/35 backdrop-blur-[2px] transition-opacity lg:bg-black/15"
        onClick={onClose}
        aria-hidden
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Forecast for ${site.route} at ${site.localite}`}
        tabIndex={-1}
        className="ring-hairline-lg fixed inset-y-0 right-0 z-[1000] flex w-full max-w-[520px] flex-col bg-[var(--viz-plane)] outline-none animate-[slideIn_.3s_cubic-bezier(.22,1,.36,1)]"
      >
        {/* ---------- Header ---------- */}
        <header className="relative shrink-0 overflow-hidden bg-[var(--viz-surface)] px-6 pb-5 pt-5">
          <span className="lux-stripe absolute inset-x-0 top-0 h-[3px]" aria-hidden />
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-md bg-[var(--viz-series)]/12 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--viz-series)]">
                  {site.route}
                </span>
                <span className="text-[10px] text-[var(--viz-muted)]">
                  counter {site.poste_id}
                </span>
              </div>
              <h2 className="truncate text-[22px] font-semibold leading-tight tracking-tight text-[var(--viz-ink)]">
                {site.localite}
              </h2>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--viz-ink-2)]">
                {selected?.sens}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="-mr-1.5 -mt-1.5 shrink-0 rounded-xl p-2 text-[var(--viz-muted)] transition hover:bg-black/5 hover:text-[var(--viz-ink)] dark:hover:bg-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* ---------- Controls ---------- */}
        <div className="shrink-0 border-y border-[var(--viz-border)] bg-[var(--viz-surface)] px-6 py-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--viz-muted)]">
                  Date to forecast
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-[var(--viz-border)] bg-[var(--viz-plane)] px-3 py-2.5 text-sm font-medium text-[var(--viz-ink)] outline-none transition focus:border-[var(--viz-series)] focus:bg-[var(--viz-surface)] focus:ring-4 focus:ring-[var(--viz-series)]/12"
                />
              </label>
              {actuals && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-tight">
                  {hasActualForDate ? (
                    <>
                      <span
                        className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-actual)]"
                        aria-hidden
                      />
                      <span className="text-[var(--viz-actual)]">
                        Real data recorded — we can score the forecast
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-axis)]"
                        aria-hidden
                      />
                      <span className="text-[var(--viz-muted)]">
                        No recorded data for this date
                        {recordedRange &&
                          ` · this series covers ${recordedRange.first} → ${recordedRange.last}`}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>

            <Segmented
              label="Direction"
              value={direction}
              onChange={(d) => {
                setDirection(d);
                setError(null);
              }}
              options={directions.map((d) => {
                const s = site.series.find((x) => x.direction === d);
                return { value: d, label: `Dir ${d}`, hint: s?.sens };
              })}
            />

            <Segmented
              label="Vehicle"
              value={vehicule}
              onChange={(v) => {
                setPickedVehicule(v);
                setError(null);
              }}
              options={vehicles.map((v) => ({
                value: v,
                label: `${VEHICLE_LABEL[v] ?? v} (${v})`,
              }))}
            />
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="accent-sweep mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-92 active:scale-[0.99] disabled:opacity-55"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Forecasting…
              </>
            ) : (
              <>
                Run forecast
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="ring-hairline rounded-xl bg-[var(--viz-surface)] px-4 py-3.5">
              <div className="mb-1 flex items-center gap-2 text-[var(--status-bad)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-semibold">Could not forecast</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--viz-ink-2)]">{error}</p>
            </div>
          )}

          {loading && !hours && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-[var(--viz-surface)]"
                />
              ))}
            </div>
          )}

          {/* Opened, nothing requested yet -- describe the counter, don't guess. */}
          {!hours && !loading && !error && (
            <div className="stagger space-y-4">
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight text-[var(--viz-ink)]">
                  This counter measures {site.series.length} things
                </h3>
                <p className="mt-0.5 text-[11px] text-[var(--viz-muted)]">
                  Tap one to select it, then run a forecast.
                </p>
              </div>

              <ul className="space-y-2">
                {site.series.map((s) => {
                  const isActive = s.direction === direction && s.vehicule === vehicule;
                  return (
                    <li key={`${s.direction}-${s.vehicule}`}>
                      <button
                        onClick={() => {
                          setDirection(s.direction);
                          setPickedVehicule(s.vehicule);
                          setError(null);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left transition ${
                          isActive
                            ? "bg-[var(--viz-series)]/8 ring-1 ring-[var(--viz-series)]/35"
                            : "ring-hairline bg-[var(--viz-surface)] hover:bg-[var(--viz-series)]/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              isActive
                                ? "bg-[var(--viz-series)]"
                                : "bg-[var(--viz-axis)]"
                            }`}
                            aria-hidden
                          />
                          <span
                            className={`text-[13px] font-semibold tracking-tight ${
                              isActive
                                ? "text-[var(--viz-series)]"
                                : "text-[var(--viz-ink)]"
                            }`}
                          >
                            {VEHICLE_LABEL[s.vehicule] ?? s.vehicule} ({s.vehicule})
                          </span>
                          <span className="rounded bg-[var(--viz-ink)]/6 px-1.5 py-0.5 text-[10px] font-medium text-[var(--viz-ink-2)]">
                            Direction {s.direction}
                          </span>
                          <span className="ml-auto shrink-0 text-[13px] font-semibold tabular-nums text-[var(--viz-ink)]">
                            {fmt(s.avg_per_hour)}
                            <span className="ml-0.5 text-[10px] font-normal text-[var(--viz-muted)]">
                              /h
                            </span>
                          </span>
                        </div>
                        <p className="mt-1.5 pl-4 text-[11px] leading-snug text-[var(--viz-ink-2)]">
                          {s.sens}
                        </p>
                        <p className="mt-0.5 pl-4 text-[10px] tabular-nums text-[var(--viz-muted)]">
                          {s.days_reported} days recorded · {s.first_day} → {s.last_day}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="rounded-xl border border-dashed border-[var(--viz-axis)] px-4 py-5 text-center">
                <p className="text-[11px] leading-relaxed text-[var(--viz-ink-2)]">
                  Pick a date and press{" "}
                  <strong className="font-semibold text-[var(--viz-ink)]">
                    Run forecast
                  </strong>{" "}
                  to see the prediction against what really happened.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Report ---------- */}
          {hours && meta && summary && !error && (
            <div className="stagger space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight text-[var(--viz-ink)]">
                    {dayName}, {prettyDate}
                  </h3>
                  {meta.is_holiday_period && (
                    <span className="rounded-full bg-[var(--status-warn)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--status-warn)]">
                      holiday period
                    </span>
                  )}
                </div>
                {/* Spell out exactly which of the counter's series this report covers. */}
                <p className="mt-1 text-[11px] text-[var(--viz-ink-2)]">
                  {VEHICLE_LABEL[vehicule] ?? vehicule} ({vehicule}) · Direction{" "}
                  {direction}
                  {selected ? ` — ${selected.sens}` : ""}
                </p>
              </div>

              <Verdict
                dayName={dayName}
                predicted={summary.predictedTotal}
                actual={summary.complete ? summary.actualTotal : null}
                typical={summary.typicalTotal}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <StatTile
                  label="We predicted"
                  value={fmt(summary.predictedTotal)}
                  sub="vehicles all day"
                  tone="series"
                />
                <StatTile
                  label="Really happened"
                  value={summary.actualTotal === null ? "—" : fmt(summary.actualTotal)}
                  sub={
                    summary.actualTotal === null
                      ? "not recorded"
                      : summary.complete
                        ? "vehicles all day"
                        : "partial day only"
                  }
                  tone="actual"
                />
                <StatTile
                  label="How close we were"
                  value={
                    summary.dayError === null
                      ? "—"
                      : `${summary.dayError >= 0 ? "+" : ""}${summary.dayError.toFixed(0)}%`
                  }
                  sub={
                    summary.mae === null
                      ? "nothing to check against"
                      : `off by ${fmt(summary.mae)}/h on average`
                  }
                />
                <StatTile
                  label="Busiest hour"
                  value={hourLabel(summary.peak.hour)}
                  sub={`${fmt(summary.peak.predicted)} vehicles/h`}
                />
              </div>

              <div className="ring-hairline rounded-2xl bg-[var(--viz-surface)] px-4 py-4">
                <HourlyChart hourly={hours} dayName={dayName} />
              </div>

              {summary.actualTotal === null && (
                <p className="ring-hairline rounded-xl bg-[var(--viz-surface)] px-4 py-3 text-[11px] leading-relaxed text-[var(--viz-ink-2)]">
                  No recorded data for this counter on {date} — either the date falls
                  outside 2024–2025, or this counter did not report that day. The
                  forecast still stands; there is just nothing to score it against.
                </p>
              )}

              {/* Disclosure rows */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowTable((v) => !v)}
                  aria-expanded={showTable}
                  className="ring-hairline flex w-full items-center justify-between rounded-xl bg-[var(--viz-surface)] px-4 py-2.5 text-[12px] font-medium text-[var(--viz-ink)] transition hover:bg-[var(--viz-series)]/5"
                >
                  Hour-by-hour numbers
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className={`text-[var(--viz-muted)] transition-transform ${showTable ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showTable && (
                  <div className="ring-hairline overflow-hidden rounded-xl bg-[var(--viz-surface)]">
                    <table className="w-full text-[11px]">
                      <thead className="text-[var(--viz-muted)]">
                        <tr className="border-b border-[var(--viz-grid)]">
                          <th className="px-4 py-2 text-left font-semibold">Hour</th>
                          <th className="px-4 py-2 text-right font-semibold">Real</th>
                          <th className="px-4 py-2 text-right font-semibold">Predicted</th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Usual {dayName.slice(0, 3)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hours.map((h) => (
                          <tr
                            key={h.hour}
                            className="border-t border-[var(--viz-grid)] first:border-t-0"
                          >
                            <td className="px-4 py-1.5 tabular-nums text-[var(--viz-muted)]">
                              {hourLabel(h.hour)}
                            </td>
                            <td className="px-4 py-1.5 text-right font-semibold tabular-nums text-[var(--viz-actual)]">
                              {h.actual === null ? "—" : fmt(h.actual)}
                            </td>
                            <td className="px-4 py-1.5 text-right font-semibold tabular-nums text-[var(--viz-ink)]">
                              {fmt(h.predicted)}
                            </td>
                            <td className="px-4 py-1.5 text-right tabular-nums text-[var(--viz-ink-2)]">
                              {fmt(h.typical_2024)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={() => setShowDetails((v) => !v)}
                  aria-expanded={showDetails}
                  className="ring-hairline flex w-full items-center justify-between rounded-xl bg-[var(--viz-surface)] px-4 py-2.5 text-[12px] font-medium text-[var(--viz-ink)] transition hover:bg-[var(--viz-series)]/5"
                >
                  Counter details
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className={`text-[var(--viz-muted)] transition-transform ${showDetails ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showDetails && selected && (
                  <div className="ring-hairline rounded-xl bg-[var(--viz-surface)] px-4 py-3">
                    <CounterDetails s={selected} />
                    <dl className="text-[11px]">
                      <Row term="Trained through">
                        <span className="tabular-nums">2024-12-31</span>
                      </Row>
                      <Row term="Stated error">
                        <span className="tabular-nums">±{fmt(meta.expected_error)}</span>{" "}
                        veh/h
                      </Row>
                      <Row term="Holiday period">
                        {meta.is_holiday_period ? "yes" : "no"}
                      </Row>
                    </dl>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-xl bg-[var(--viz-ink)]/4 px-4 py-3.5 text-[11px] leading-relaxed text-[var(--viz-ink-2)]">
                <p>
                  <strong className="font-semibold text-[var(--viz-ink)]">
                    “A usual {dayName}”
                  </strong>{" "}
                  is not one particular day. It averages <em>every {dayName}</em> this
                  counter recorded during 2024, hour by hour — the 08:00 figure averages
                  all the {dayName} 08:00s.
                </p>
                <p>
                  Like a weather normal: “tomorrow 18°, normal for the season 21°”. The
                  21 was never a measured day; it tells you whether tomorrow is unusual.
                </p>
                <p className="text-[var(--viz-muted)]">
                  Counts are whole vehicles. The model returns decimals, but its own
                  error is far bigger than a decimal, so they are rounded away.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
