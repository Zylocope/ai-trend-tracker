"""Fetcher: Google Trends via pytrends."""
import time
import pandas as pd
from pytrends.request import TrendReq
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger


def _build_pytrends() -> TrendReq:
    return TrendReq(hl="en-US", tz=0, timeout=(10, 25), retries=2, backoff_factor=0.5)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=30))
def _fetch_interest(keyword: str) -> pd.DataFrame:
    pytrends = _build_pytrends()
    pytrends.build_payload([keyword], timeframe="today 3-m", geo="", gprop="")
    df = pytrends.interest_over_time()

    if df is None or df.empty:
        logger.warning(f"No Google Trends data for '{keyword}'")
        return pd.DataFrame()

    # Drop isPartial — handle both column and index cases
    if "isPartial" in df.columns:
        df = df.drop(columns=["isPartial"])

    # Reset index safely
    if not isinstance(df.index, pd.RangeIndex):
        df = df.reset_index()

    # Rename keyword column to score
    if keyword in df.columns:
        df = df.rename(columns={keyword: "score"})
    elif "value" in df.columns:
        df = df.rename(columns={"value": "score"})
    else:
        # Take first numeric column
        num_cols = df.select_dtypes(include="number").columns.tolist()
        if num_cols:
            df = df.rename(columns={num_cols[0]: "score"})
        else:
            return pd.DataFrame()

    # Ensure date column exists
    if "date" not in df.columns:
        date_cols = [c for c in df.columns if "date" in str(c).lower() or "time" in str(c).lower()]
        if date_cols:
            df = df.rename(columns={date_cols[0]: "date"})
        else:
            return pd.DataFrame()

    return df[["date", "score"]]


def fetch_google_trends(tools: list[dict]) -> pd.DataFrame:
    rows = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"Google Trends: {tool['tool_name']} → '{keyword}'")
        try:
            df = _fetch_interest(keyword)
            if not df.empty:
                df["tool_id"] = tool["tool_id"]
                df = df.rename(columns={"score": "google_trend_score"})
                rows.append(df[["date", "tool_id", "google_trend_score"]])
                logger.info(f"  Got {len(df)} trend rows for {tool['tool_name']}")
        except Exception as e:
            logger.error(f"Google Trends failed for {tool['tool_name']}: {e}")
        time.sleep(2)

    if not rows:
        logger.warning("Google Trends returned no data for any tool")
        return pd.DataFrame()

    result = pd.concat(rows, ignore_index=True)
    result["date"] = pd.to_datetime(result["date"]).dt.date
    return result
