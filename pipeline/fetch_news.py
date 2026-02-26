"""Fetcher: News articles via NewsAPI."""
import os
import pandas as pd
from datetime import date, timedelta
from newsapi import NewsApiClient
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger

LOOKBACK_DAYS = 7


def _get_client() -> NewsApiClient:
    return NewsApiClient(api_key=os.environ["NEWS_API_KEY"])


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=3, max=15))
def _fetch_articles(client: NewsApiClient, keyword: str) -> list[dict]:
    today     = date.today()
    from_date = (today - timedelta(days=LOOKBACK_DAYS)).isoformat()
    resp      = client.get_everything(
        q=keyword, from_param=from_date, to=today.isoformat(),
        language="en", sort_by="publishedAt", page_size=100,
    )
    return [
        {
            "date":   a.get("publishedAt", "")[:10],
            "title":  a.get("title", ""),
            "body":   a.get("description", "") or "",
            "url":    a.get("url", ""),
            "source": "news",
        }
        for a in resp.get("articles", [])
    ]


def fetch_news_mentions(tools: list[dict]) -> tuple[pd.DataFrame, pd.DataFrame]:
    client     = _get_client()
    count_rows = []
    raw_rows   = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"News: {tool['tool_name']} → '{keyword}'")
        try:
            articles = _fetch_articles(client, keyword)
            for a in articles:
                raw_rows.append({**a, "tool_id": tool["tool_id"]})
            if articles:
                df    = pd.DataFrame(articles)
                daily = df.groupby("date").size().reset_index(name="news_mention_count")
                daily["tool_id"] = tool["tool_id"]
                count_rows.append(daily)
        except Exception as e:
            logger.error(f"News failed for {tool['tool_name']}: {e}")

    counts_df = pd.concat(count_rows, ignore_index=True) if count_rows else pd.DataFrame(
        columns=["date", "tool_id", "news_mention_count"])
    raw_df    = pd.DataFrame(raw_rows) if raw_rows else pd.DataFrame()
    return counts_df, raw_df
