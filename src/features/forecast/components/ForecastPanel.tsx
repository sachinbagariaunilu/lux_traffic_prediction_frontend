"use client";

import { useEffect, useRef, useState } from "react";
import ErrorNotice from "@/components/ui/ErrorNotice";
import type { CounterSite } from "@/lib/types";
import { useForecastRun } from "../hooks/useForecastRun";
import { useRecordedDays } from "../hooks/useRecordedDays";
import { useSeriesSelection } from "../hooks/useSeriesSelection";
import type { Product } from "../lib/products";
import { summariseDay } from "../lib/hourly";
import ForecastControls from "./ForecastControls";
import ForecastReport from "./ForecastReport";
import PanelHeader from "./PanelHeader";
import SeriesPicker from "./SeriesPicker";

/**
 * Slide-over for one counter: pick a series and a date, run the forecast, read
 * the result. This component holds the panel's own concerns -- the chosen date,
 * dismissal, and which of the four body states to show -- while the selection,
 * the recorded days and the request itself live in hooks beside it.
 *
 * Shared by both pages. Everything that differs between them arrives as
 * `product`: which model to ask, which years the date field offers, and whether
 * a recorded count can exist to score the answer against.
 */
export default function ForecastPanel({
  product,
  site,
  onClose,
}: {
  product: Product;
  site: CounterSite;
  onClose: () => void;
}) {
  const selection = useSeriesSelection(site);
  const { direction, vehicule, series } = selection;
  const [date, setDate] = useState(product.defaultDate);

  const recorded = useRecordedDays(
    site.poste_id,
    direction,
    vehicule,
    product.scoreable,
  );
  // `product` goes in whole rather than model + scoreable: the model is no
  // longer decided by the page alone. On the forecasting page a date one or two
  // days past this series' last recorded hour is answered by the 24h or 48h
  // model instead, and the hook needs the page's own model as the fallback.
  // See features/forecast/lib/engine.ts.
  const { meta, hours, outcome, loading, error, run, clearError } = useForecastRun({
    poste_id: site.poste_id,
    direction,
    vehicule,
    date,
    product,
  });

  const summary = hours ? summariseDay(hours) : null;
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-[900] bg-[#100f0d]/28 backdrop-blur-[2px] transition-opacity lg:bg-[#100f0d]/14"
        onClick={onClose}
        aria-hidden
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Forecast for ${site.route} at ${site.localite}`}
        tabIndex={-1}
        className="ring-hairline-lg fixed inset-y-0 right-0 z-[1000] flex w-full max-w-[540px] flex-col bg-[var(--viz-plane)] outline-none animate-[slideIn_.3s_cubic-bezier(.22,1,.36,1)] overflow-auto"
      >
        <PanelHeader site={site} heading={series?.sens} onClose={onClose} />

        <ForecastControls
          product={product}
          site={site}
          date={date}
          onDateChange={(d) => {
            setDate(d);
            clearError();
          }}
          directions={selection.directions}
          direction={direction}
          onDirectionChange={(d) => {
            selection.setDirection(d);
            clearError();
          }}
          vehicles={selection.vehicles}
          vehicule={vehicule}
          onVehiculeChange={(v) => {
            selection.setVehicule(v);
            clearError();
          }}
          recorded={recorded}
          loading={loading}
          onRun={run}
        />

        <div className="thin-scroll flex-1  px-6 py-5">
          {error && (
            <ErrorNotice title="Could not forecast" message={error} size="sm" />
          )}

          {loading && !hours && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse bg-[var(--viz-surface)]"
                />
              ))}
            </div>
          )}

          {/* Opened, nothing requested yet -- describe the counter, don't guess. */}
          {!hours && !loading && !error && (
            <SeriesPicker
              product={product}
              site={site}
              direction={direction}
              vehicule={vehicule}
              onSelect={(d, v) => {
                selection.setDirection(d);
                selection.setVehicule(v);
                clearError();
              }}
            />
          )}

          {hours && meta && summary && !error && (
            <ForecastReport
              product={product}
              date={date}
              direction={direction}
              vehicule={vehicule}
              series={series}
              meta={meta}
              hours={hours}
              summary={summary}
              outcome={outcome}
            />
          )}
        </div>
      </aside>
    </>
  );
}
