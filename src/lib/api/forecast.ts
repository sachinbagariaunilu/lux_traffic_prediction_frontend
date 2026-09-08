import type { ForecastResponse } from "@/lib/types";
import { getJson } from "./client";

/**
 * One day's forecast from one named model.
 *
 * The model comes from the PAGE, not from the date and not from the user. Each
 * page is hard-wired to one model and offers only the years that model can
 * honestly answer (see features/forecast/lib/products.ts), so by the time a
 * request is built the pairing is already settled.
 *
 * The API is the backstop, not this function: asking the 2024+2025 model about
 * a 2025 date returns 409, because a "forecast" of a year the model studied is
 * recall, and scoring it would flatter the model.
 */
export function fetchForecast(
  poste_id: number,
  direction: number,
  vehicule: string,
  date: string,
  model: string,
): Promise<ForecastResponse> {
  return getJson<ForecastResponse>(
    `/forecast?poste_id=${poste_id}&direction=${direction}` +
      `&vehicule=${vehicule}&date=${date}&model=${encodeURIComponent(model)}`,
  );
}
