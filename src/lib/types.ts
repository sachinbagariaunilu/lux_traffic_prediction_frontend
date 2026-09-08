/** Shapes returned by the Luxembourg Traffic Forecast API. */

/** The dataset's two vehicle classes: V = cars, C = trucks. */
export type VehiculeCode = "V" | "C";

/** One row of /counters -- a single (counter, direction, vehicle) series. */
export interface CounterSeries {
  poste_id: number;
  direction: number;
  vehicule: VehiculeCode;
  label: string;
  route: string;
  localite: string;
  sens: string;
  /** LUREF (EPSG:2169) metres -- NOT lat/lon. Reproject before mapping. */
  coord_x: number;
  coord_y: number;
  avg_per_hour: number;
  /** Days this series reported in 2024, the training year. */
  days_reported: number;
  first_day: string;
  last_day: string;
  /**
   * Days this series recorded in 2025 -- the year the validation model is
   * scored against. NULL when the series recorded nothing: /counters now
   * returns every series a model can forecast, not only the ones with actuals,
   * so this is no longer guaranteed to exist.
   */
  recorded_days_2025: number | null;
  /** 2025 actuals exist, so a 2025 forecast can be laid beside the truth. */
  scoreable_2025: boolean;
  /**
   * Which models can forecast this series at all. Load-bearing: the model
   * follows the DATE, so a series absent from the 2024 model has no 2025
   * prediction however much 2026 data exists for it, and the picker has to say
   * so rather than let the request 404.
   */
  served_by: string[];
  thin: boolean;
}

export interface CountersResponse {
  /** Which model's series list this is. */
  model: string;
  count: number;
  scoreable_2025: number;
  not_scoreable_2025: number;
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
  /** Which model answered: "2024" (validation) or "2024_2025" (forecasting). */
  model: string;
  date: string;
  hourly: HourlyPoint[];
  daily_total: number;
  is_holiday_period: boolean;
  /** True when actuals/ can supply a recorded line for this exact date. */
  scoreable: boolean;
  /** Why not, when it cannot. Null when it can. */
  scoreable_note: string | null;
  /**
   * Full-unseen-year MAE. NULL for the forecasting model, which trained on
   * every year we hold actuals for and therefore has no unseen one -- see
   * expected_error_note rather than showing a blank figure.
   */
  expected_error: number | null;
  expected_error_note: string | null;
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

/** Per-counter actuals from GET /actuals/{poste_id}. 2025 only. */
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
