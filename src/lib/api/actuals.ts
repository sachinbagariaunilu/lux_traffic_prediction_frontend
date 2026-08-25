import type { ActualsFile } from "@/lib/types";
import { API_BASE } from "./client";

/**
 * Recorded counts for one counter, from GET /actuals/{poste_id}.
 *
 * Deliberately not routed through `getJson`: that turns a non-OK response into
 * a thrown error, and here a 404 is an ordinary answer. A counter with no 2025
 * days simply has no file, and the chart carries on without the recorded line.
 *
 * ~37 KB gzipped per counter, so it is fetched on click rather than up front,
 * and the promise is kept afterwards: reopening a pin costs nothing, and two
 * callers racing on open share a single request.
 */
const cache = new Map<number, Promise<ActualsFile | null>>();

export function fetchActuals(poste_id: number): Promise<ActualsFile | null> {
  let hit = cache.get(poste_id);
  if (!hit) {
    hit = fetch(`${API_BASE}/actuals/${poste_id}`)
      .then((r) => (r.ok ? (r.json() as Promise<ActualsFile>) : null))
      // Missing actuals are normal, not an error -- the chart just omits the line.
      .catch(() => null);
    cache.set(poste_id, hit);
  }
  return hit;
}
