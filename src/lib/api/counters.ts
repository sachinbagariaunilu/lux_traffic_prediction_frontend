import { isInLuxembourg, lurefToLatLon } from "@/lib/luref";
import type { CountersResponse, CounterSite } from "@/lib/types";
import { getJson } from "./client";

/**
 * Every series ONE model can forecast, collapsed onto physical locations.
 *
 * The model is a required argument, because the two pages must not show the
 * same network:
 *
 *   2024        1,058 series across 270 sites
 *   2024_2025   1,070 series across 273 sites
 *
 * The difference is three counters -- 607 Marnach, 1414 France Frontiere,
 * 1444 Schifflange -- that only started reporting during 2025. The 2024-only
 * model has no history for them, so it cannot forecast them at all, and a
 * counter's traffic LEVEL cannot be inferred from its location.
 *
 * An earlier build asked for the larger list on both pages and blocked the
 * three at request time with an explanatory notice. Asking each page for its
 * own model's list removes that state entirely: a counter is on the page
 * because the page's model can answer it.
 *
 * A pin per series would stack four markers on one pixel, so they collapse
 * onto poste_id.
 */
export async function fetchSites(model: string): Promise<CounterSite[]> {
  const data = await getJson<CountersResponse>(
    `/counters?model=${encodeURIComponent(model)}`,
  );

  const sites = new Map<number, CounterSite>();
  for (const s of data.counters) {
    let site = sites.get(s.poste_id);
    if (!site) {
      const { lat, lon } = lurefToLatLon(s.coord_x, s.coord_y);
      if (!isInLuxembourg(lat, lon)) continue; // guard against bad source coords
      site = {
        poste_id: s.poste_id,
        route: s.route,
        localite: s.localite,
        lat,
        lon,
        totalPerHour: 0,
        series: [],
      };
      sites.set(s.poste_id, site);
    }
    site.series.push(s);
    site.totalPerHour += s.avg_per_hour;
  }

  // Busiest last so the biggest pins draw on top of the small ones.
  return [...sites.values()].sort((a, b) => a.totalPerHour - b.totalPerHour);
}
