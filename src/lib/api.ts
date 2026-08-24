import type {
  ActualsFile,
  CountersResponse,
  CounterSite,
  ForecastResponse,
  MergedHour,
} from "./types";
import { isInLuxembourg, lurefToLatLon } from "./luref";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`);
  } catch {
    throw new Error(
      `Cannot reach the API at ${BASE}. Is the backend running, and is NEXT_PUBLIC_API_BASE correct?`,
    );
  }
  if (!res.ok) {
    // The API returns {detail} for handled 404s and {error, hint} for unknown paths.
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch every series and collapse them onto physical locations.
 * /counters returns ~1058 series across ~270 distinct poste_ids, so a pin per
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

export async function fetchForecast(
  poste_id: number,
  direction: number,
  vehicule: string,
  date: string,
): Promise<ForecastResponse> {
  return getJson<ForecastResponse>(
    `/forecast?poste_id=${poste_id}&direction=${direction}&vehicule=${vehicule}&date=${date}`,
  );
}

/**
 * Recorded counts for one counter, served as a static file from /public.
 * ~90 KB gzipped per counter, so it is fetched on click rather than up front,
 * and kept in memory afterwards -- reopening a pin costs nothing.
 */
const actualsCache = new Map<number, Promise<ActualsFile | null>>();

export function fetchActuals(poste_id: number): Promise<ActualsFile | null> {
  let hit = actualsCache.get(poste_id);
  if (!hit) {
    hit = fetch(`/actuals/${poste_id}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<ActualsFile>) : null))
      // Missing actuals are normal, not an error -- the chart just omits the line.
      .catch(() => null);
    actualsCache.set(poste_id, hit);
  }
  return hit;
}

/**
 * Join the forecast to the recorded truth for the same date.
 * Predictions are rounded to whole vehicles: the model's own error is ±18/h
 * at best, so a returned decimal is noise, not precision.
 */
export function mergeHours(
  forecast: ForecastResponse,
  actuals: ActualsFile | null,
  direction: number,
  vehicule: string,
  date: string,
): MergedHour[] {
  const recorded = actuals?.series?.[`${direction}-${vehicule}`]?.[date];
  return forecast.hourly.map((h) => ({
    hour: h.hour,
    predicted: Math.round(h.predicted),
    typical_2024: Math.round(h.typical_2024),
    actual: recorded ? recorded[h.hour] : null,
  }));
}

export const API_BASE = BASE;
