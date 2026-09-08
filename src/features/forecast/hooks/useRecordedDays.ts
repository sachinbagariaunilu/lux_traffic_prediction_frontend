"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import type { ActualsFile } from "@/lib/types";

/**
 * What is known about a series' recorded days. Exported so the components that
 * render it cannot declare a narrower shape of their own and drift -- which is
 * exactly what happened when `spanDays`/`missing` were added here.
 */
export type RecordedRange = {
  first: string;
  last: string;
  /** Days actually recorded. */
  n: number;
  /** Calendar days from `first` to `last` inclusive. */
  spanDays: number;
  /** Gaps inside the span: spanDays - n. */
  missing: number;
};

/**
 * The counter's recorded days, pulled as soon as the panel opens (cached,
 * ~90 KB) so the date field can say up front whether a real comparison is
 * possible -- rather than making the user run a forecast to find out.
 *
 * `enabled` is false on the forecasting page, where every offered date is past
 * the counts we hold. Fetching there would spend ~37 KB per counter to learn
 * something the page already states, so the request is not made and `loaded`
 * stays false -- which is what keeps RecordedDataNote from rendering.
 */
export function useRecordedDays(
  poste_id: number,
  direction: number,
  vehicule: string,
  enabled: boolean,
) {
  const [file, setFile] = useState<ActualsFile | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    fetchActuals(poste_id).then((a) => live && setFile(a));
    return () => {
      live = false;
    };
  }, [poste_id, enabled]);

  const days = file?.series?.[`${direction}-${vehicule}`];

  const range = useMemo(() => {
    const keys = days ? Object.keys(days).sort() : [];
    if (!keys.length) return null;
    const first = keys[0];
    const last = keys[keys.length - 1];
    // Days BETWEEN the endpoints, so `missing` counts the gaps inside the span
    // rather than days outside it. A counter can report 1 January and
    // 31 December and still have skipped a fortnight in between -- saying only
    // "covers 2025-01-01 -> 2025-12-31" then reads as a flat contradiction of
    // "no recorded data for this date".
    const spanDays =
      Math.round(
        (Date.parse(last) - Date.parse(first)) / 86_400_000,
      ) + 1;
    return {
      first,
      last,
      n: keys.length,
      spanDays,
      missing: Math.max(0, spanDays - keys.length),
    };
  }, [days]);

  return {
    /** null until the file resolves; the note stays hidden until then. */
    loaded: file !== null,
    range,
    hasDay: (date: string) => Boolean(days?.[date]),
  };
}
