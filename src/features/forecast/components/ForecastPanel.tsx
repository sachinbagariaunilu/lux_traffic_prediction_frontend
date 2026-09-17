"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
/**
 * Panel width, remembered between openings.
 *
 * An EXTERNAL STORE rather than state-plus-effect. localStorage cannot be read
 * while rendering -- the server has none, so the markup would disagree with the
 * first client render and React would throw the prerender away. Reading it in
 * an effect instead means a setState on every mount, which is the cascading
 * render `react-hooks/set-state-in-effect` exists to stop. useSyncExternalStore
 * is the case both of those are pointing at: a server snapshot of `false`, a
 * client snapshot from storage, and React reconciling the two itself.
 *
 * Storage can throw outright (private mode, blocked site data) and every access
 * is guarded. The panel still resizes when it does; only the memory is lost.
 *
 * Module scope, not a hook: the panel is a singleton, so there is exactly one
 * value and caching it keeps getSnapshot cheap -- React calls it often, and a
 * synchronous localStorage read on each call is the kind of thing that only
 * shows up on a slow machine.
 */
const WIDE_KEY = "lux.panel.wide";
let wideCache: boolean | null = null;
const wideListeners = new Set<() => void>();

function readWide(): boolean {
  if (wideCache === null) {
    try {
      wideCache = localStorage.getItem(WIDE_KEY) === "1";
    } catch {
      wideCache = false;
    }
  }
  return wideCache;
}

function writeWide(next: boolean) {
  wideCache = next;
  try {
    localStorage.setItem(WIDE_KEY, next ? "1" : "0");
  } catch {
    /* not remembered, but the panel still resizes */
  }
  wideListeners.forEach((l) => l());
}

function subscribeWide(cb: () => void) {
  wideListeners.add(cb);
  return () => {
    wideListeners.delete(cb);
  };
}

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

  // Server snapshot is `false` -- the prerendered HTML is always the narrow
  // panel, and a stored preference widens it after hydration.
  const wide = useSyncExternalStore(subscribeWide, readWide, () => false);

  /**
   * Focus, once, on open -- and handed back on close.
   *
   * Separate from the key handler below on purpose. That one depends on
   * `onClose`, which the call site rebuilds on every render, so anything living
   * with it re-runs whenever the page above happens to render. Focusing the
   * panel from there meant a stray re-render could yank focus out of the date
   * field mid-edit.
   *
   * `document.activeElement` at mount is whatever opened the panel -- a map
   * marker, or a row in the search list. Without giving it back, dismissing the
   * panel drops a keyboard user at the top of the document and they tab through
   * the whole page again to reach the counter they were just looking at.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  /**
   * Escape closes; Tab stays inside.
   *
   * The panel already claimed `aria-modal="true"`, which is a PROMISE that the
   * rest of the page is unreachable -- and nothing was keeping it. Tabbing off
   * the last control walked out of the dialog and into the map behind it, still
   * covered by the scrim, so focus went somewhere the reader could neither see
   * nor click out of. Either the attribute goes or the trap arrives; the trap
   * is the one worth having.
   *
   * Hidden controls are filtered out rather than assumed absent: the widen
   * toggle is `display:none` below md and a disabled Run button drops out
   * mid-request, so the first and last focusable elements are not fixed.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

      // Nothing to land on -- keep focus on the dialog rather than releasing it.
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !active || !panel.contains(active) || active === panel;

      if (e.shiftKey && (outside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * What just happened, for anyone who cannot see it happen.
   *
   * Pressing Run swaps three skeleton blocks in and a full report out, and a
   * screen reader was told none of it -- the button went quiet and the answer
   * arrived silently somewhere below. One polite live region says the same
   * three things the body is already showing.
   */
  const status = loading
    ? "Running the forecast"
    : error
      ? `The forecast failed. ${error}`
      : hours && summary
        ? `Forecast ready for ${date}: about ${Math.round(summary.predictedTotal)} vehicles across the day.`
        : "";

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
        // max-width is what moves, not width. Below md the cap stays at 540px,
        // which is deliberate: 80vw is only WIDER than 540px above 675px of
        // viewport, so applying it lower down would narrow the panel. The
        // toggle hides on the same breakpoint -- see PanelHeader.
        className={`ring-hairline-lg fixed inset-y-0 right-0 z-[1000] flex w-full flex-col bg-[var(--viz-plane)] outline-none animate-[slideIn_.3s_cubic-bezier(.22,1,.36,1)] overflow-auto transition-[max-width] duration-300 ease-out ${
          wide ? "max-w-[540px] md:max-w-[80vw]" : "max-w-[540px]"
        }`}
      >
        <PanelHeader
          site={site}
          heading={series?.sens}
          onClose={onClose}
          wide={wide}
          onToggleWide={() => writeWide(!wide)}
        />

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
          <p className="sr-only" role="status" aria-live="polite">
            {status}
          </p>

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
              vehicles={selection.vehicles}
              directions={selection.directions}
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
