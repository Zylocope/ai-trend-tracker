"""
Builds the published snapshot: derived views + provenance, written to data/snapshot.json.

This replaces the Postgres layer. The relations below are exactly the ones the
web app used to query, so the front end sees the same row shapes - only the
transport changed, from a hosted database to a file under version control.

Git is the archive: every daily run commits one snapshot, so `git log data/`
recovers what the site claimed on any past day, and `git blame` points at the
run that produced each number.
"""
import json
import math
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from loguru import logger

from pipeline import registry

DATA_DIR      = Path(__file__).resolve().parent.parent / "data"
SNAPSHOT_PATH = DATA_DIR / "snapshot.json"

# Caps and weights carried over from the old SQL view so scores stay comparable
# with previously published snapshots.
MENTION_CAP = 1000
NEWS_CAP    = 500


def _clean(v, as_int: bool = False):
    """NaN/inf -> None. JSON has no NaN, and 'null' is the honest rendering."""
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return int(f) if as_int else round(f, 4)


def _git_sha() -> str | None:
    """The commit this snapshot was built from - the anchor for every claim in it."""
    for env_var in ("GITHUB_SHA",):
        if os.environ.get(env_var):
            return os.environ[env_var]
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        return None


# ── derived views ───────────────────────────────────────────────────────────

def _latest_metrics(metrics: list[dict]) -> dict[int, dict]:
    """Most recent metric row per tool_id."""
    latest: dict[int, dict] = {}
    for m in sorted(metrics, key=lambda r: r["date"]):
        latest[m["tool_id"]] = m
    return latest


def _composite(m: dict, w: dict) -> float:
    return round(
        (m.get("google_trend_score")      or 0) * w["trend"]
        + min(m.get("reddit_mention_count") or 0, MENTION_CAP) * 0.1 * w["mentions"]
        + min(m.get("news_mention_count")   or 0, NEWS_CAP)    * 0.1 * w["news"]
        + (m.get("average_sentiment_score") or 0) * 10 * w["sentiment"],
        2,
    )


def build_category_leaderboard(metrics: list[dict]) -> list[dict]:
    latest = _latest_metrics(metrics)
    cats   = {c["category_id"]: c for c in registry.CATEGORIES}
    rows   = []

    for t in registry.TOOLS:
        c = cats[t["category_id"]]
        m = latest.get(t["tool_id"], {})
        rows.append({
            "tool_id":                 t["tool_id"],
            "tool_name":               t["tool_name"],
            "slug":                    t["slug"],
            "company":                 t["company"],
            "pricing_tier":            t["pricing_tier"],
            "category_id":             c["category_id"],
            "category_name":           c["name"],
            "category_slug":           c["slug"],
            "category_icon":           c["icon"],
            "date":                    m.get("date"),
            "google_trend_score":      m.get("google_trend_score"),
            "reddit_mention_count":    m.get("reddit_mention_count"),
            "news_mention_count":      m.get("news_mention_count"),
            "average_sentiment_score": m.get("average_sentiment_score"),
            "composite_score":         _composite(m, c["weights"]) if m else None,
        })

    rows.sort(key=lambda r: (r["composite_score"] is None, -(r["composite_score"] or 0)))
    return rows


def build_model_leaderboard(model_facts: list[dict], metrics: list[dict]) -> list[dict]:
    """
    Models joined to buzz by EXPLICIT slug link, not a fuzzy name match.

    The old SQL joined on `tool_name ILIKE '%' || first_word_of_model_name || '%'`,
    which silently attached one tool's buzz to unrelated models.
    """
    latest    = _latest_metrics(metrics)
    by_slug   = {t["slug"]: t for t in registry.TOOLS}
    companies = {c["slug"]: c for c in registry.COMPANIES}
    rows      = []

    for m in model_facts:
        company = companies[m["company_slug"]]
        # A model shows buzz only when a tracked tool is the same product.
        tool = by_slug.get(MODEL_TO_TOOL.get(m["slug"], ""))
        buzz = latest.get(tool["tool_id"], {}) if tool else {}

        rows.append({
            "model_id":            m["model_id"],
            "model_name":          m["name"],
            "model_slug":          m["slug"],
            "context_window":      m.get("context_window"),
            "price_in_per_mtok":   m.get("price_in_per_mtok"),
            "price_out_per_mtok":  m.get("price_out_per_mtok"),
            "arena_elo":           m.get("arena_elo"),
            "arena_label":         m.get("arena_label"),
            "aa_intelligence_index": m.get("aa_intelligence_index"),
            "aa_coding_index":     m.get("aa_coding_index"),
            "aa_agentic_index":    m.get("aa_agentic_index"),
            "is_open_source":      m["is_open_source"],
            "listed_on_openrouter": m.get("listed_on_openrouter", False),
            "source_url":          m.get("source_url"),
            "capability_source":   m.get("capability_source"),
            "company_id":          company["company_id"],
            "company_name":        company["name"],
            "company_slug":        company["slug"],
            "buzz_tool_slug":      tool["slug"] if tool else None,
            "date":                buzz.get("date"),
            "google_trend_score":  buzz.get("google_trend_score"),
            "hn_mention_count":    buzz.get("reddit_mention_count"),
            "news_mention_count":  buzz.get("news_mention_count"),
            "average_sentiment_score": buzz.get("average_sentiment_score"),
        })

    attach_hype_gap(rows)
    rows.sort(key=lambda r: (r["aa_intelligence_index"] is None,
                             -(r["aa_intelligence_index"] or 0)))
    return rows


def _percentiles(rows: list[dict], key: str) -> dict[int, float]:
    """
    Map model_id -> 0..100 percentile for `key`, over rows that have a value.
    Ties share the average rank, so duplicate scores cannot fake a gap.
    """
    scored = [r for r in rows if r.get(key) is not None]
    if len(scored) < 2:
        return {}

    scored.sort(key=lambda r: r[key])
    out: dict[int, float] = {}
    i = 0
    while i < len(scored):
        j = i
        while j + 1 < len(scored) and scored[j + 1][key] == scored[i][key]:
            j += 1
        rank = (i + j) / 2                     # average rank across the tie group
        pct  = round(100 * rank / (len(scored) - 1), 1)
        for r in scored[i:j + 1]:
            out[r["model_id"]] = pct
        i = j + 1
    return out


def attach_hype_gap(rows: list[dict]) -> list[dict]:
    """
    hype_gap = attention percentile - capability percentile.

    Positive means a model draws more search interest than its Artificial
    Analysis score justifies; negative means the opposite. It needs both halves,
    so any model missing either one gets None rather than a misleading zero.

    This is the one number here that no benchmark can produce on its own - it
    only exists by joining someone else's capability measurement to our own
    attention measurement.
    """
    buzz = _percentiles(rows, "google_trend_score")
    cap  = _percentiles(rows, "aa_intelligence_index")

    for r in rows:
        b, c = buzz.get(r["model_id"]), cap.get(r["model_id"])
        r["attention_percentile"]  = b
        r["capability_percentile"] = c
        r["hype_gap"] = round(b - c, 1) if b is not None and c is not None else None
    return rows


# Explicit model -> tracked-tool mapping. Absent = that model has no buzz series,
# which is rendered as "no data" rather than borrowed from a similar name.
MODEL_TO_TOOL = {
    "gpt-56-sol":      "chatgpt",
    "gpt-55":          "chatgpt",
    "claude-opus-5":   "claude",
    "claude-fable-5":  "claude",
    "claude-sonnet-5": "claude",
    "gemini-37-flash": "gemini",
    "deepseek-v4-pro": "deepseek",
    "grok-46":         "grok",
}


# ── snapshot ────────────────────────────────────────────────────────────────

def metrics_to_records(df: pd.DataFrame) -> list[dict]:
    if df is None or df.empty:
        return []
    int_cols = {"reddit_mention_count", "news_mention_count"}
    records  = []
    for _, r in df.iterrows():
        rec = {"date": str(r["date"]), "tool_id": int(r["tool_id"])}
        for c in ("google_trend_score", "reddit_mention_count",
                  "news_mention_count", "average_sentiment_score"):
            if c in df.columns:
                rec[c] = _clean(r.get(c), as_int=(c in int_cols))
        records.append(rec)
    return records


def load_previous() -> dict:
    """Previous snapshot, so a failed source keeps yesterday's data instead of blanking it."""
    if SNAPSHOT_PATH.exists():
        try:
            return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            logger.warning(f"Previous snapshot unreadable: {e}")
    return {}


def merge_history(previous: list[dict], fresh: list[dict], keep_days: int = 90) -> list[dict]:
    """Union old and new metric rows on (date, tool_id); fresh wins ties."""
    merged = {(r["date"], r["tool_id"]): r for r in previous}
    merged.update({(r["date"], r["tool_id"]): r for r in fresh})
    rows = sorted(merged.values(), key=lambda r: (r["date"], r["tool_id"]))
    if keep_days:
        cutoff = sorted({r["date"] for r in rows})[-keep_days:]
        rows   = [r for r in rows if r["date"] in set(cutoff)]
    return rows


def write_snapshot(metrics: list[dict], mentions: list[dict], model_facts: list[dict],
                   sources: list[dict]) -> Path:
    snapshot = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "commit":       _git_sha(),
            "sources":      sources,
            "notes": {
                "google_trend_score": (
                    f"Relative search interest on a shared axis where "
                    f"'{registry.TOOLS[0]['keywords'][0]}' = 100. Comparable across tools "
                    f"within a snapshot; not an absolute search volume."
                ),
                "composite_score": "Weighted attention index, not a capability or quality score.",
                "combos": "Editorial recipes, hand-written. Not measured or voted on.",
                "model_facts": "Pricing, context and arena elo mirrored from OpenRouter.",
            },
        },
        "dim_category":           registry.CATEGORIES,
        "dim_tool":               registry.TOOLS,
        "dim_company":            registry.COMPANIES,
        "dim_combo":              registry.COMBOS,
        "dim_model":              model_facts,
        "fact_daily_metrics":     metrics,
        "raw_mentions":           mentions,
        "v_category_leaderboard": build_category_leaderboard(metrics),
        "v_model_leaderboard":    build_model_leaderboard(model_facts, metrics),
    }
    snapshot["v_leaderboard"] = [
        r for r in snapshot["v_category_leaderboard"] if r["category_slug"] == "general-chat"
    ]

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_PATH.write_text(
        json.dumps(snapshot, indent=1, ensure_ascii=False, sort_keys=False),
        encoding="utf-8",
    )
    size_kb = SNAPSHOT_PATH.stat().st_size / 1024
    logger.info(
        f"Wrote {SNAPSHOT_PATH} ({size_kb:.0f} KB) - "
        f"{len(metrics)} metric rows, {len(mentions)} mentions, {len(model_facts)} models"
    )
    return SNAPSHOT_PATH
