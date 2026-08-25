#!/usr/bin/env python3
"""Convert latest Mehta Screener Excel → JSON for the Next.js dashboard."""

import json
import math
import sys
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE / "output"
DATA_DIR = BASE / "public" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def find_latest_excel():
    files = sorted(OUTPUT_DIR.glob("Mehta_Screener_*.xlsx"), reverse=True)
    return files[0] if files else None


def clean_value(v):
    """Replace NaN/Inf/NaT with None so JSON is valid."""
    if v is None:
        return None
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return None
        return v
    # Pandas NaT
    if hasattr(v, "isoformat"):
        return v.isoformat()
    if pd.isna(v):
        return None
    return v


def clean_record(d: dict):
    return {k: clean_value(v) for k, v in d.items()}


def convert():
    excel_path = find_latest_excel()
    if not excel_path:
        print("No Excel file found in output/. Run mehta_screener.py first.")
        sys.exit(1)

    print(f"Converting: {excel_path.name}")
    xls = pd.ExcelFile(excel_path)
    stocks = []

    for sheet in xls.sheet_names:
        if sheet in ("SUMMARY",):
            continue
        df = pd.read_excel(xls, sheet_name=sheet)
        for _, row in df.iterrows():
            d = row.to_dict()
            d["_sheet"] = sheet
            stocks.append(clean_record(d))

    # Read summary
    meta = {}
    try:
        sdf = pd.read_excel(xls, sheet_name="SUMMARY")
        for _, row in sdf.iterrows():
            meta[row.get("Metric", "")] = row.get("Value", "")
    except Exception:
        pass

    out = {
        "generated_at": meta.get("Run date", ""),
        "universe_size": meta.get("Universe size", len(stocks)),
        "counts": {
            "3/3": sum(1 for s in stocks if s.get("Score") == "3/3"),
            "2/3": sum(1 for s in stocks if s.get("Score") == "2/3"),
            "1/3": sum(1 for s in stocks if s.get("Score") == "1/3"),
            "0/3": sum(1 for s in stocks if s.get("Score") == "0/3"),
        },
        "stocks": stocks,
    }

    out_path = DATA_DIR / "latest.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

    print(f"Written: {out_path} ({len(stocks)} stocks)")


if __name__ == "__main__":
    convert()