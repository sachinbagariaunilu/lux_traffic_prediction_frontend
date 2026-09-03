import { isInLuxembourg, lurefToLatLon } from "@/lib/luref";
import type { CountersResponse, CounterSite } from "@/lib/types";
import { getJson } from "./client";

/**
 * Fetch every series and collapse them onto physical locations.
 * /counters returns 1054 series across 269 distinct poste_ids, so a pin per
 * series would stack four markers on the same pixel.
 */
export async function fetchSites(): Promise<CounterSite[]> {
  const data = await getJson<CountersResponse>("/counters");

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
