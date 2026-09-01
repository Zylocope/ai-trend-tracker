"""
Daily ingestion. Fetches every source, scores sentiment, writes data/snapshot.json.

Run: python -m pipeline.run_all
No database and no credentials required beyond NEWS_API_KEY (optional).
"""
import sys

import pandas as pd
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

from pipeline import registry, sentiment, store
from pipeline.fetch_hackernews import fetch_hackernews_mentions
from pipeline.fetch_models import fetch_model_facts
from pipeline.fetch_news import fetch_news_mentions
from pipeline.fetch_trends import fetch_google_trends

logger.add("logs/ingestion_{time}.log", rotation="1 day", retention="7 days", level="INFO")

MAX_MENTIONS = 2000  # keeps snapshot.json in the low megabytes


def merge_counts(frames: list[pd.DataFrame]) -> pd.DataFrame:
    """Outer-join metric frames on (date, tool_id)."""
    non_empty = [f for f in frames if f is not None and not f.empty]
    if not non_empty:
        return pd.DataFrame()

    for df in non_empty:
        df["date"] = pd.to_datetime(df["date"]).dt.date

    result = non_empty[0]
    for df in non_empty[1:]:
        result = result.merge(df, on=["date", "tool_id"], how="outer")
    return result


def run() -> None:
    logger.info("=== Ingestion starting ===")
    tools   = registry.TOOLS
    sources = []
    logger.info(f"Tracking {len(tools)} tools across {len(registry.CATEGORIES)} categories")

    # ── Sources ──────────────────────────────────────────────────────────
    logger.info("-- 1/4 Google Trends --")
    trends_df = fetch_google_trends(tools)
    sources.append({"name": "Google Trends", "url": "https://trends.google.com",
                    "rows": len(trends_df), "ok": not trends_df.empty})

    logger.info("-- 2/4 HackerNews --")
    hn_counts, hn_raw = fetch_hackernews_mentions(tools)
    sources.append({"name": "Hacker News (Algolia)", "url": "https://hn.algolia.com/api",
                    "rows": len(hn_raw), "ok": not hn_raw.empty})

    logger.info("-- 3/4 NewsAPI --")
    try:
        news_counts, news_raw = fetch_news_mentions(tools)
        news_ok = not news_raw.empty
    except Exception as e:
        logger.error(f"NewsAPI unavailable: {e}")
        news_counts, news_raw, news_ok = pd.DataFrame(), pd.DataFrame(), False
    sources.append({"name": "NewsAPI", "url": "https://newsapi.org",
                    "rows": len(news_raw), "ok": news_ok})

    logger.info("-- 4/4 OpenRouter --")
    model_facts = fetch_model_facts(registry.MODELS)
    sources.append({"name": "OpenRouter", "url": "https://openrouter.ai/models",
                    "rows": sum(1 for m in model_facts if m["listed_on_openrouter"]),
                    "ok": any(m["listed_on_openrouter"] for m in model_facts)})

    # ── Mentions + sentiment ─────────────────────────────────────────────
    raw_frames = [f for f in (hn_raw, news_raw) if f is not None and not f.empty]
    mentions   = []
    if raw_frames:
        all_raw = pd.concat(raw_frames, ignore_index=True)
        all_raw["date"] = all_raw["date"].astype(str)
        mentions = all_raw.head(MAX_MENTIONS).to_dict("records")
        mentions = sentiment.score_mentions(mentions)

    # ── Metrics ──────────────────────────────────────────────────────────
    merged  = merge_counts([trends_df, hn_counts, news_counts])
    records = store.metrics_to_records(merged)

    averages = sentiment.daily_averages(mentions)
    for r in records:
        r["average_sentiment_score"] = averages.get((r["date"], r["tool_id"]))

    previous = store.load_previous()
    history  = store.merge_history(previous.get("fact_daily_metrics", []), records)
    logger.info(f"Metrics: {len(records)} fresh, {len(history)} total after merge")

    if not history:
        logger.error("No metrics at all - refusing to publish an empty snapshot")
        sys.exit(1)

    store.write_snapshot(history, mentions, model_facts, sources)
    logger.info("=== Done ===")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        sys.exit(1)
