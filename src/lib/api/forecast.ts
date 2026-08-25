import type { ForecastResponse } from "@/lib/types";
import { getJson } from "./client";

export function fetchForecast(
  poste_id: number,
  direction: number,
  vehicule: string,
  date: string,
): Promise<ForecastResponse> {
  return getJson<ForecastResponse>(
    `/forecast?poste_id=${poste_id}&direction=${direction}&vehicule=${vehicule}&date=${date}`,
  );
}
