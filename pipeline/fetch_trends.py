"""
Fetcher: Google Trends via direct HTTP request.
Replaces pytrends which is broken with pandas >= 2.x on GitHub Actions.
"""
import time
import json
import requests
import pandas as pd
from datetime import date, timedelta
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
})

WIDGET_URL  = "https://trends.google.com/trends/api/explore"
MULTILINE_URL = "https://trends.google.com/trends/api/widgetdata/multiline"


def _get_token(keyword: str) -> tuple[str, str]:
    """Get the token and request object needed for the data query."""
    params = {
        "hl":  "en-US",
        "tz":  "0",
        "req": json.dumps({
            "comparisonItem": [{"keyword": keyword, "geo": "", "time": "today 3-m"}],
            "category":       0,
            "property":       "",
        }),
    }
    resp = SESSION.get(WIDGET_URL, params=params, timeout=15)
    resp.raise_for_status()

    # Strip Google's ")]}',\n" prefix
    text   = resp.text[5:]
    data   = json.loads(text)
    widget = next(w for w in data["widgets"] if w["id"] == "TIMESERIES")
    return widget["token"], json.dumps(widget["request"])


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=3, min=8, max=30))
def _fetch_interest(keyword: str) -> pd.DataFrame:
    token, req = _get_token(keyword)

    params = {
        "hl":    "en-US",
        "tz":    "0",
        "req":   req,
        "token": token,
        "tz":    "0",
    }
    resp = SESSION.get(MULTILINE_URL, params=params, timeout=15)
    resp.raise_for_status()

    text = resp.text[5:]
    data = json.loads(text)

    rows = []
    for point in data["default"]["timelineData"]:
        date_str = point["formattedTime"]           # e.g. "Mar 10, 2026"
        value    = point["value"][0]
        dt       = pd.to_datetime(date_str, format="%b %d, %Y").date()
        rows.append({"date": dt, "score": value})

    if not rows:
        return pd.DataFrame()

    logger.info(f"  Got {len(rows)} trend datapoints for '{keyword}'")
    return pd.DataFrame(rows)


def fetch_google_trends(tools: list[dict]) -> pd.DataFrame:
    result_rows = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"Google Trends: {tool['tool_name']} → '{keyword}'")
        try:
            df = _fetch_interest(keyword)
            if not df.empty:
                df["tool_id"]            = tool["tool_id"]
                df["google_trend_score"] = df["score"]
                result_rows.append(df[["date", "tool_id", "google_trend_score"]])
        except Exception as e:
            logger.error(f"Google Trends failed for {tool['tool_name']}: {e}")
        time.sleep(2)

    if not result_rows:
        logger.warning("Google Trends returned no data for any tool")
        return pd.DataFrame()

    combined = pd.concat(result_rows, ignore_index=True)
    logger.info(f"Google Trends total rows: {len(combined)}")
    return combined
