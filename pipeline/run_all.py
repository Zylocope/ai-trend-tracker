"""
Main ingestion entry point.
Run: python -m pipeline.run_all
"""
import sys
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

from pipeline.db_utils import fetch_tools
from pipeline.fetch_trends import fetch_google_trends
from pipeline.fetch_hackernews import fetch_hackernews_mentions
from pipeline.fetch_news import fetch_news_mentions
from pipeline.db_writer import upsert_daily_metrics, insert_raw_mentions
import pandas as pd

logger.add("logs/ingestion_{time}.log", rotation="1 day", retention="7 days", level="INFO")


def run():
    logger.info("═══ Ingestion pipeline starting ═══")

    tools = fetch_tools()
    logger.info(f"Tracking {len(tools)} tools: {[t['tool_name'] for t in tools]}")

    logger.info("── Step 1/3: Google Trends ──")
    trends_df = fetch_google_trends(tools)

    logger.info("── Step 2/3: HackerNews ──")
    hn_counts, hn_raw = fetch_hackernews_mentions(tools)

    logger.info("── Step 3/3: NewsAPI ──")
    news_counts, news_raw = fetch_news_mentions(tools)

    # Merge all count frames on (date, tool_id)
    merged = trends_df.copy() if not trends_df.empty else pd.DataFrame(columns=["date", "tool_id"])

    for df in [hn_counts, news_counts]:
        if not df.empty:
            df["date"] = pd.to_datetime(df["date"]).dt.date
            merged = merged.merge(df, on=["date", "tool_id"], how="outer")

    upsert_daily_metrics(merged)

    all_raw = pd.concat([hn_raw, news_raw], ignore_index=True)
    insert_raw_mentions(all_raw)

    logger.info("═══ Ingestion pipeline complete ═══")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        sys.exit(1)
