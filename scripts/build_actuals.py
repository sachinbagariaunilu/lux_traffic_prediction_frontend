#!/usr/bin/env python3
"""Turn the raw traffic CSVs into small per-counter JSON files for the frontend.

The raw files are ~150 MB each -- far too big to ship to a browser that only
ever needs 24 numbers at a time. This splits them by POSTE_ID, so clicking a
pin fetches one ~200 KB file instead of the whole year.

Only series the model can actually forecast are kept (the CSVs also carry a
'U' vehicle code the model never saw).

Usage:
    python scripts/build_actuals.py \
        --model ../luxtransport_backend/models/forecast_model_2024.pkl \
        --csv ../luxtransport_backend/data/raw/donneestrafic-2024-DonneesTrafic_2024.csv \
        --csv ../luxtransport_backend/data/raw/donneestrafic-2025-Data.csv \
        --out public/actuals

Output shape, one file per counter (public/actuals/1410.json):

    {"poste_id": 1410,
     "series": {"1-V": {"2025-02-15": [24 integers], ...}, ...}}
"""
import argparse
import json
import shutil
from collections import defaultdict
from pathlib import Path

import joblib
import pandas as pd

HOUR_COLS = [f"P{h:02d}_{h + 1:02d}" for h in range(24)]
KEY_COLS = ["POSTE_ID", "DIRECTION", "VEHICULE"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="forecast_model_2024.pkl")
    ap.add_argument("--csv", action="append", required=True, help="repeatable")
    ap.add_argument("--out", default="public/actuals")
    a = ap.parse_args()

    bundle = joblib.load(a.model)
    known = set(map(tuple, bundle["meta"][KEY_COLS].values))
    print(f"model knows {len(known)} series")

    # poste_id -> "direction-vehicule" -> "YYYY-MM-DD" -> [24 ints]
    store: dict[int, dict[str, dict[str, list[int]]]] = defaultdict(
        lambda: defaultdict(dict)
    )

    for path in a.csv:
        df = pd.read_csv(path, usecols=KEY_COLS + ["DATECOM"] + HOUR_COLS)
        keep = [tuple(r) in known for r in df[KEY_COLS].values]
        df = df[keep].copy()
        df["DATECOM"] = pd.to_datetime(df["DATECOM"], format="%m/%d/%Y").dt.strftime(
            "%Y-%m-%d"
        )
        # Counts are whole vehicles; NaN gaps become 0 so the array stays fixed-width.
        hours = df[HOUR_COLS].fillna(0).round().astype(int).values

        for (pid, direction, veh, day), row in zip(
            df[KEY_COLS + ["DATECOM"]].itertuples(index=False, name=None), hours
        ):
            store[int(pid)][f"{int(direction)}-{veh}"][day] = row.tolist()
        print(f"  {Path(path).name}: {len(df):,} rows")

    out = Path(a.out)
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    index = []
    for pid, series in store.items():
        # separators= keeps the files tight; they are machine-read, not browsed.
        (out / f"{pid}.json").write_text(
            json.dumps(
                {"poste_id": pid, "series": series}, separators=(",", ":")
            )
        )
        index.append(pid)

    (out / "index.json").write_text(json.dumps(sorted(index), separators=(",", ":")))

    total = sum(f.stat().st_size for f in out.glob("*.json"))
    print(
        f"wrote {len(index)} counter files + index to {out}  "
        f"({total / 1e6:.1f} MB total, {total / len(index) / 1e3:.0f} KB avg)"
    )


if __name__ == "__main__":
    main()
