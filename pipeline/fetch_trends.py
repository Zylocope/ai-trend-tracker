"""Fetcher: Google Trends via pytrends."""
import time
import pandas as pd
from pytrends.request import TrendReq
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=30))
def _fetch_interest(pytrends: TrendReq, keyword: str) -> pd.DataFrame:
    pytrends.build_payload([keyword], timeframe="today 3-m", geo="", gprop="")
    df = pytrends.interest_over_time()
    if df.empty:
        logger.warning(f"No Google Trends data for '{keyword}'")
        return pd.DataFrame()
    df = df.drop(columns=["isPartial"], errors="ignore")
    df.index.name = "date"
    df = df.reset_index().rename(columns={keyword: "score"})
    df["keyword"] = keyword
    return df[["date", "keyword", "score"]]


def fetch_google_trends(tools: list[dict]) -> pd.DataFrame:
    pytrends = TrendReq(hl="en-US", tz=0, timeout=(10, 25), retries=2, backoff_factor=0.5)
    rows = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"Google Trends: {tool['tool_name']} → '{keyword}'")
        try:
            df = _fetch_interest(pytrends, keyword)
            if not df.empty:
                df["tool_id"] = tool["tool_id"]
                df = df.rename(columns={"score": "google_trend_score"})
                rows.append(df[["date", "tool_id", "google_trend_score"]])
        except Exception as e:
            logger.error(f"Google Trends failed for {tool['tool_name']}: {e}")
        time.sleep(2)

    if not rows:
        return pd.DataFrame()

    result = pd.concat(rows, ignore_index=True)
    result["date"] = pd.to_datetime(result["date"]).dt.date
    return result
