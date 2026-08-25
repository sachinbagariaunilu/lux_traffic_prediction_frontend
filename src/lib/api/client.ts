/**
 * Transport for the Luxembourg Traffic Forecast API. Everything network-facing
 * goes through `getJson` so that one place owns the base URL, the unreachable-
 * backend message and the API's two error shapes.
 *
 * This app has no API routes of its own -- every request goes to the Python
 * service in ../luxtransport_backend, which must be running. The default points
 * at it on localhost so a fresh clone needs no env file; set
 * NEXT_PUBLIC_API_BASE to target a deployment instead.
 *
 * The one caller that skips `getJson` is actuals: a 404 there is an ordinary
 * answer rather than a failure. See lib/api/actuals.ts.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function getJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Is the backend running, and is NEXT_PUBLIC_API_BASE correct?`,
    );
  }
  if (!res.ok) {
    // The API returns {detail} for handled 404s and {error, hint} for unknown paths.
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
