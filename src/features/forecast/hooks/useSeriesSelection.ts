"use client";

import { useMemo, useState } from "react";
import type { CounterSite, VehiculeCode } from "@/lib/types";

/**
 * Which of the counter's series the panel is pointed at.
 *
 * Not every counter records both cars and trucks in both directions, so the
 * vehicle is *derived* rather than synced: switching direction can strip a
 * vehicle type from the list, and falling back at read time avoids a render
 * pass that holds an invalid pair.
 */
export function useSeriesSelection(site: CounterSite) {
  const directions = useMemo(
    () => [...new Set(site.series.map((s) => s.direction))].sort(),
    [site],
  );
  const [direction, setDirection] = useState(directions[0]);

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
  const [picked, setPicked] = useState<VehiculeCode>(vehicles[0]);
  const vehicule = vehicles.includes(picked) ? picked : vehicles[0];

  const series = site.series.find(
    (s) => s.direction === direction && s.vehicule === vehicule,
  );

  return {
    directions,
    direction,
    setDirection,
    vehicles,
    vehicule,
    setVehicule: setPicked,
    /** The row of /counters this selection resolves to, if it exists. */
    series,
  };
}
