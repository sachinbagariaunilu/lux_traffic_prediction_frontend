# Luxembourg Traffic Forecast — frontend

A map of every traffic counter in Luxembourg. Click a pin to see what that
counter records; pick a date, direction and vehicle type, and press **Run
forecast** to compare the model's prediction against what the road actually saw.

## Running it

Two processes: the API, then this app.

```bash
# 1. the API
cd ../luxtransport_backend
.venv/bin/python -m uvicorn app.main:app --port 8000
```

Note `python -m uvicorn`, not `.venv/bin/uvicorn`. The venv was created under a
different path, so its console scripts carry a stale shebang and fail with
`bad interpreter`. Going through `python -m` ignores the shebang entirely.

```bash
# 2. this app
npm install
npm run dev
```

This app holds no model and predicts nothing. Every figure it shows comes from
the API, except the recorded actuals, which are static files (see below). With
the API down, the map and the forecast panel both surface a reachability error
rather than falling back to anything.

### Pointing somewhere else

`NEXT_PUBLIC_API_BASE` in `.env.local` overrides the target. It defaults to
`http://localhost:8000`, so a fresh clone runs without an env file at all.

```
NEXT_PUBLIC_API_BASE=https://your-deployment.example.com
```

## The API

Served by `../luxtransport_backend` (FastAPI + LightGBM). Nothing here.

| Route | |
|---|---|
| `GET /counters` | every series the model can forecast, busiest first — 1,058 of them |
| `GET /forecast?poste_id=&direction=&vehicule=&date=` | 24 hourly predictions for one series on one date |
| `GET /actuals/{poste_id}` | what that counter actually recorded, hour by hour, 2025 only |
| `GET /health` | what the model is and what it was trained on |

The model is a **LightGBM regressor, 800 trees over 12 calendar features** — no
lag features, so any date can be forecast without live data, including dates
years out.

Every response shape the frontend relies on is typed in `src/lib/types.ts`.
Those types are the contract: if the API changes, that file is what has to move
with it, and it is the first place to look when a field arrives `undefined`.

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

`GET /actuals/{poste_id}` — the counterpart to `/forecast`. That one says what
the model expects; this says what the road saw, and the difference is the only
honest score of the model.

```
GET /actuals/1410
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

**2025 only**, matching the picker. 2024 is the training year, so a comparison
against it flatters the model rather than testing it.

One counter per response, fetched on click and cached in
`src/lib/api/actuals.ts` — about 37 KB gzipped for a typical counter, 58 KB for
the busiest. Nobody downloads the whole set.

A counter with no 2025 days returns **404, and that is not an error** —
`fetchActuals` maps it to `null` and the chart simply omits the recorded line.
It is the one call that deliberately bypasses `getJson`, which throws on non-OK.
Counter 474 is the live example: 269 of the 270 counters have 2025 data.

Rebuilt by `scripts/build_actuals.py` **in the backend repo**, where the raw
CSVs and the model bundle both live. See that repo for the command.

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

## Code layout

`app/` is routing only; everything else is grouped by the thing it belongs to.

```
src/
  app/                     routes -- page.tsx files compose features, nothing more
  components/ui/           primitives with no domain knowledge (Segmented, StatTile, icons…)
  features/
    landing/               the overview page: one component per section + content.ts
    counters/              the /map experience: map, search, overlays, loading hooks
    forecast/              the slide-over panel: components/ + hooks/ + lib/ (domain maths)
  lib/
    api/                   transport -- the client the browser uses
    format.ts luref.ts types.ts
```

Two rules keep it honest:

- **Copy lives in `content.ts`, not in JSX.** Every figure on the overview page
  is in `features/landing/content.ts`, so a claim can be checked against the
  data without reading markup.
- **Maths lives in `lib/`, not in components.** `features/forecast/lib/hourly.ts`
  merges the forecast with the recorded day and derives the summary; the
  components only format what it returns.

Client JavaScript is kept to what actually needs it: the overview page's two
signature graphics are Server Components, and both heavy dependencies are split
out of the initial load -- Leaflet arrives when the map mounts, Recharts when a
forecast returns.

## Design system

One light ground, three type registers, one accent.

| | |
|---|---|
| Display | **Space Grotesk**, uppercase, line-height 1, tracking 0, weight 500 |
| Body | **Inter** at weight 350 (variable font, so the in-between weight is free) |
| Labels | **Space Mono**, uppercase, 0.1em -- eyebrows, table headers, metadata |
| Ground | `#f4f4f4` grey · white surfaces · one inverted `#0a0a0a` section |
| Accent | The flag's own cyan as a solid tile (`.tile-accent`), red for caveats |

Blocks are square; only controls take a radius (`--r-control`). All three faces
are self-hosted by `next/font` at build time -- no CDN request and no layout
shift.

Two rules the stylesheet enforces and comments explain in full:

- **Data marks never use the flag colours.** Flag cyan scores 2.86:1 on white,
  below the 3:1 a data line must clear, and every cyan step dark enough to pass
  collided with the gray baseline for normal-vision readers. The charts use a
  separately validated blue/orange pair (worst pairwise CVD dE 21.3, floor 9.0);
  the flag does identity only.
- **Custom classes live in `@layer components`.** Unlayered CSS beats every
  Tailwind utility, so an unlayered `.label-mono { color }` silently wins over a
  `text-*` utility on the same element. The leaflet overrides stay unlayered on
  purpose -- they have to beat leaflet's own stylesheet.

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
- **The date picker offers 2025 only.** Both ends are cut deliberately. 2024 is
  the training year, so the model has already seen those days and reproduces
  them better than it forecasts — a 2024 comparison flatters it. Past 2025 the
  API still answers, but the answer stops moving: measured against the running
  service, every non-holiday Saturday from 2026 to 2031 returns an identical
  total, January the same as August, because the 12 features are calendar-only.
  Only the holiday flags shift it. What is left is the honest window — a year
  the model never trained on, and one the road has a recorded answer for.
- The profile baseline **ignores season** — March Sundays and November Sundays
  fold into one number, so it runs high in winter and low in spring.
# lux_traffic_prediction_frontend
