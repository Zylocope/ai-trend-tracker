"""
Fetcher: Hacker News via Algolia API
No API key needed. Completely free and open.
"""
import time
import requests
import pandas as pd
from datetime import datetime, timedelta, timezone
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger

LOOKBACK_DAYS = 7
BASE_URL      = "https://hn.algolia.com/api/v1/search"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=3, max=15))
def _search(keyword: str) -> list[dict]:
    cutoff    = int((datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)).timestamp())
    params    = {
        "query":        keyword,
        "tags":         "story,comment",
        "numericFilters": f"created_at_i>{cutoff}",
        "hitsPerPage":  100,
    }
    resp = requests.get(BASE_URL, params=params, timeout=10)
    resp.raise_for_status()
    hits = resp.json().get("hits", [])

    results = []
    for h in hits:
        created = datetime.fromtimestamp(h.get("created_at_i", 0), tz=timezone.utc)
        results.append({
            "date":   created.date(),
            "title":  h.get("title") or h.get("comment_text", "")[:120],
            "body":   "",
            "url":    f"https://news.ycombinator.com/item?id={h.get('objectID')}",
            "source": "hackernews",
        })
    return results


def fetch_hackernews_mentions(tools: list[dict]) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Returns:
        count_df  — DataFrame(date, tool_id, reddit_mention_count)
                    (reuses the same column name so db_writer works unchanged)
        raw_df    — individual posts
    """
    count_rows = []
    raw_rows   = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"HackerNews: {tool['tool_name']} → '{keyword}'")
        try:
            posts = _search(keyword)
            for p in posts:
                raw_rows.append({**p, "tool_id": tool["tool_id"]})
            if posts:
                df    = pd.DataFrame(posts)
                daily = df.groupby("date").size().reset_index(name="reddit_mention_count")
                daily["tool_id"] = tool["tool_id"]
                count_rows.append(daily)
        except Exception as e:
            logger.error(f"HackerNews failed for {tool['tool_name']}: {e}")
        time.sleep(0.5)

    count_df = pd.concat(count_rows, ignore_index=True) if count_rows else pd.DataFrame(
        columns=["date", "tool_id", "reddit_mention_count"])
    raw_df   = pd.DataFrame(raw_rows) if raw_rows else pd.DataFrame()
    return count_df, raw_df
