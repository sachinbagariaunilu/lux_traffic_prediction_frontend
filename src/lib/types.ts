/** Shapes returned by the Luxembourg Traffic Forecast API. */

/** One row of /counters -- a single (counter, direction, vehicle) series. */
export interface CounterSeries {
  poste_id: number;
  direction: number;
  vehicule: "V" | "C";
  label: string;
  route: string;
  localite: string;
  sens: string;
  /** LUREF (EPSG:2169) metres -- NOT lat/lon. Reproject before mapping. */
  coord_x: number;
  coord_y: number;
  avg_per_hour: number;
  days_reported: number;
  first_day: string;
  last_day: string;
}

export interface CountersResponse {
  count: number;
  counters: CounterSeries[];
}

export interface HourlyPoint {
  hour: number;
  /** Model output for the requested date. Expected value, not a count. */
  predicted: number;
  /** 2024 mean for this counter at the same weekday + hour. Baseline, not an actual. */
  typical_2024: number;
}

export interface ForecastResponse {
  counter: { poste_id: number; direction: number; vehicule: string };
  date: string;
  hourly: HourlyPoint[];
  daily_total: number;
  is_holiday_period: boolean;
  expected_error: number;
}

/** One hour, with the forecast and the recorded truth side by side. */
export interface MergedHour {
  hour: number;
  /** Rounded to whole vehicles -- the model's error dwarfs the decimals. */
  predicted: number;
  typical_2024: number;
  /** What the counter actually recorded, or null if that day was not reported. */
  actual: number | null;
}

/** Per-counter actuals, as written by scripts/build_actuals.py. */
export interface ActualsFile {
  poste_id: number;
  /** "<direction>-<vehicule>" -> "YYYY-MM-DD" -> 24 hourly counts. */
  series: Record<string, Record<string, number[]>>;
}

/**
 * All series that share one physical location, collapsed into a map pin.
 * A poste_id carries up to 4 series (2 directions x cars/trucks).
 */
export interface CounterSite {
  poste_id: number;
  route: string;
  localite: string;
  lat: number;
  lon: number;
  /** Summed avg_per_hour across every series here -- drives pin size. */
  totalPerHour: number;
  series: CounterSeries[];
}
