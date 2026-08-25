"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchActuals } from "@/lib/api/actuals";
import type { ActualsFile } from "@/lib/types";

/**
 * The counter's recorded days, pulled as soon as the panel opens (cached,
 * ~90 KB) so the date field can say up front whether a real comparison is
 * possible -- rather than making the user run a forecast to find out.
 */
export function useRecordedDays(poste_id: number, direction: number, vehicule: string) {
  const [file, setFile] = useState<ActualsFile | null>(null);

  useEffect(() => {
    let live = true;
    fetchActuals(poste_id).then((a) => live && setFile(a));
    return () => {
      live = false;
    };
  }, [poste_id]);

  const days = file?.series?.[`${direction}-${vehicule}`];

  const range = useMemo(() => {
    const keys = days ? Object.keys(days).sort() : [];
    return keys.length
      ? { first: keys[0], last: keys[keys.length - 1], n: keys.length }
      : null;
  }, [days]);

  return {
    /** null until the file resolves; the note stays hidden until then. */
    loaded: file !== null,
    range,
    hasDay: (date: string) => Boolean(days?.[date]),
  };
}
