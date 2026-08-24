# Luxembourg Traffic Forecast — frontend

A map of every traffic counter in Luxembourg. Click a pin to see what that
counter records; pick a date, direction and vehicle type, and press **Run
forecast** to compare the model's prediction against what the road actually saw.

## Running it

```bash
npm install
npm run dev
```

The backend must be reachable. Set it in `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Start the API from the backend repo:

```bash
uvicorn app.main:app --port 8000
```

## The three lines on the chart

| Line | What it is |
|---|---|
| **What really happened** (orange, solid) | The counter's recorded hourly count for that exact date. Read from the raw CSVs, not from the API. |
| **Our prediction** (blue, solid) | The model's forecast for that date. |
| **A usual \<weekday\>** (gray, dashed) | The 2024 average for that counter at the same weekday and hour. |

The third one trips people up, so to be explicit: **it is not a reading from any
single day.** For a Sunday forecast it averages every Sunday the counter recorded
in 2024, hour by hour — the 08:00 value averages all the Sunday 08:00s. It plays
the role a weather normal plays in "tomorrow 18°, normal for the season 21°": the
21 was never measured, it is there to tell you whether tomorrow is unusual.

That averaging is also why the API returns decimals like `495.9` — 13,418 vehicles
across 27 recorded Sundays divides to a fraction. The UI rounds every figure to
whole vehicles, because the model's own error (±18/h at best, and far more on busy
counters) dwarfs the decimal.

## Where the "actual" numbers come from

The API does not return actuals, so the frontend supplies them. `public/actuals/`
holds one JSON file per counter, named by its id:

```
public/actuals/1410.json
{
  "poste_id": 1410,
  "series": {
    "1-V": {                       // direction 1, V = cars (C = trucks)
      "2025-02-02": [532, 361, ...]  // 24 integers, hour 00 through 23
    },
    "1-C": { ... }, "2-V": { ... }, "2-C": { ... }
  }
}
```

Only the fields needed are kept — counter id, direction, vehicle, date, and the
24 hourly counts. `LOCALITE`, `ROUTE`, `SENS`, `SUM_TRAF`, `D1`, `D2`, `COORD_X`
and `COORD_Y` are all dropped. That trims 295 MB of raw CSV to 61 MB on disk, and
a click fetches exactly one file — about **90 KB gzipped**. Nobody downloads the
whole set.

Regenerate after new data lands:

```bash
python scripts/build_actuals.py \
  --model ../luxtransport_backend/models/forecast_model_2024.pkl \
  --csv ../luxtransport_backend/data/raw/donneestrafic-2024-DonneesTrafic_2024.csv \
  --csv ../luxtransport_backend/data/raw/donneestrafic-2025-Data.csv \
  --out public/actuals
```

`public/actuals/` is gitignored — it is derived data, rebuild it rather than
commit it.

## Data source

Traffic counts come from **[PCH : Comptage Trafic](https://data.public.lu/en/datasets/pch-comptage-trafic/)**
on data.public.lu — the open dataset of Luxembourg's *permanent* traffic counting
stations (which is what the `POSTE_ID` column identifies).

| | |
|---|---|
| Publisher | Administration des Ponts et Chaussées |
| Licence | Creative Commons Zero (CC0) |
| Files used | 2024 and 2025 annual exports |

### Scale, measured

| | |
|---|---|
| 2024 CSV rows (all vehicle codes) | 869,229 |
| Rows for the 1,058 modelled series | 370,818 |
| **Hourly readings used for training** | **8,899,632** |
| Distinct days covered in 2024 | 365 |
| Recorded days shipped for comparison (2024+2025) | 733,562 |
| Hourly readings shipped | 17,605,488 |

The 370,818 figure cross-checks exactly against `sum(days_reported)` in the model
bundle's `meta` table, so the training volume is verified rather than estimated.

## Coordinates

`/counters` returns `coord_x` / `coord_y` in **LUREF (EPSG:2169) metres**, not
lat/lon. `src/lib/luref.ts` reprojects them. Two details there are easy to get
wrong and each costs about 230 m:

- `k=1`, not `0.9999`.
- The three rotations are **negated** against the published EPSG values, because
  EPSG states this shift in `coordinate_frame` convention while proj4's
  `+towgs84` reads `position_vector`.

Verified against PROJ across all 270 counters: max error 0.00 m.

## Known gaps

- **`expected_error` is one global constant** (`18.3` veh/h, hardcoded in the
  backend's `export_model.py`) covering all 1,058 series. Most are tiny rural
  counters, so on a motorway counter it understates the real error by 10× or
  more. The panel labels it "stated error" rather than presenting it as this
  counter's accuracy.
- **Actuals only cover 2024–2025**, the years in the CSVs. Any other date shows
  a forecast with nothing to score it against.
- The profile baseline **ignores season** — March Sundays and November Sundays
  fold into one number, so it runs high in winter and low in spring.
# lux_traffic_prediction_frontend
