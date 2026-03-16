"""
Main ingestion entry point.
Run: python -m pipeline.run_all
"""
import sys
import pandas as pd
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

from pipeline.db_utils import fetch_tools
from pipeline.fetch_trends import fetch_google_trends
from pipeline.fetch_hackernews import fetch_hackernews_mentions
from pipeline.fetch_news import fetch_news_mentions
from pipeline.db_writer import upsert_daily_metrics, insert_raw_mentions

logger.add("logs/ingestion_{time}.log", rotation="1 day", retention="7 days", level="INFO")


def merge_counts(frames: list[pd.DataFrame]) -> pd.DataFrame:
    """
    Merge a list of DataFrames on (date, tool_id) using outer joins.
    Works correctly even if some frames are empty.
    """
    non_empty = [f for f in frames if f is not None and not f.empty]
    if not non_empty:
        return pd.DataFrame()

    # Normalise date type on every frame first
    for df in non_empty:
        df["date"] = pd.to_datetime(df["date"]).dt.date

    result = non_empty[0]
    for df in non_empty[1:]:
        result = result.merge(df, on=["date", "tool_id"], how="outer")

    return result


def run():
    logger.info("═══ Ingestion pipeline starting ═══")

    tools = fetch_tools()
    logger.info(f"Tracking {len(tools)} tools: {[t['tool_name'] for t in tools]}")

    # ── Step 1: Google Trends ──────────────────────────────────────
    logger.info("── Step 1/3: Google Trends ──")
    trends_df = fetch_google_trends(tools)
    logger.info(f"  Trends rows collected: {len(trends_df)}")

    # ── Step 2: HackerNews ────────────────────────────────────────
    logger.info("── Step 2/3: HackerNews ──")
    hn_counts, hn_raw = fetch_hackernews_mentions(tools)
    logger.info(f"  HN count rows: {len(hn_counts)}, raw mentions: {len(hn_raw)}")

    # ── Step 3: NewsAPI ───────────────────────────────────────────
    logger.info("── Step 3/3: NewsAPI ──")
    news_counts, news_raw = fetch_news_mentions(tools)
    logger.info(f"  News count rows: {len(news_counts)}, raw mentions: {len(news_raw)}")

    # ── Merge all metric frames ───────────────────────────────────
    merged = merge_counts([trends_df, hn_counts, news_counts])
    logger.info(f"  Merged frame shape: {merged.shape}")
    logger.info(f"  Merged columns: {list(merged.columns)}")

    if not merged.empty:
        upsert_daily_metrics(merged)
    else:
        logger.warning("No metrics to upsert — all sources returned empty")

    # ── Insert raw mentions ───────────────────────────────────────
    raw_frames = [f for f in [hn_raw, news_raw] if f is not None and not f.empty]
    if raw_frames:
        all_raw = pd.concat(raw_frames, ignore_index=True)
        insert_raw_mentions(all_raw)

    logger.info(f"═══ Done — processed {len(tools)} tools ═══")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        sys.exit(1)
