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

/**
 * The SHORT-HORIZON service, which is a SEPARATE deployment.
 *
 * Four model bundles do not fit one 512 MB instance, so the backend runs as two
 * services: the long-horizon models (this app's usual API_BASE) and the 24h/48h
 * lag models here. See ../luxtransport_backend/SPLIT_SERVICES.md.
 *
 * Only two routes live here -- GET /forecast/{lead}h/spec and
 * POST /forecast/{lead}h. Everything else is on API_BASE, and each service
 * answers a request meant for the other with a 404 that names its counterpart
 * rather than a bare "Not Found".
 */
export const LAG_API_BASE =
  process.env.NEXT_PUBLIC_LAG_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8001";

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

/** An API refusal that carries its status, so a caller can tell 422 from 503. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * POST to the short-horizon service.
 *
 * Throws ApiError rather than Error because here the STATUS decides what the
 * caller does, and the two cases are not the same kind of problem:
 *
 *   422  the history we sent is too short or too stale for this lead. Expected,
 *        and recoverable -- the caller falls back to the long-horizon model.
 *   503  that lead is not deployed on this instance. Also recoverable, but it
 *        is a deployment fact rather than a data one.
 *
 * Swallowing the status would make both indistinguishable from a real fault and
 * force the UI to pattern-match on message text.
 */
export async function postJson<T>(base: string, path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Cannot reach the short-horizon API at ${base}. Is it running, and is NEXT_PUBLIC_LAG_API_BASE correct?`,
      0,
    );
  }
  if (!res.ok) {
    const parsed = await res.json().catch(() => null);
    // FastAPI validation errors arrive as {detail: [{msg, loc}, ...]}, not a
    // string -- joining them beats rendering "[object Object]" at the user.
    const detail = parsed?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d?.msg ?? "invalid").join("; ")
      : (detail ?? parsed?.error ?? `Request failed (${res.status})`);
    throw new ApiError(String(message), res.status);
  }
  return res.json() as Promise<T>;
}
