"""Fetcher: Reddit mentions via PRAW."""
import os
import pandas as pd
from datetime import datetime, timedelta, timezone
from tenacity import retry, stop_after_attempt, wait_exponential
import praw
from loguru import logger

SUBREDDITS   = "artificial+MachineLearning+OpenAI+singularity+ChatGPT+technology"
LOOKBACK_DAYS = 7


def _get_reddit_client() -> praw.Reddit:
    return praw.Reddit(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        user_agent=os.environ.get("REDDIT_USER_AGENT", "ai-pulse/1.0"),
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=3, max=15))
def _search(reddit: praw.Reddit, keyword: str) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)
    posts  = []
    for post in reddit.subreddit(SUBREDDITS).search(keyword, sort="new", time_filter="week", limit=100):
        created = datetime.fromtimestamp(post.created_utc, tz=timezone.utc)
        if created < cutoff:
            continue
        posts.append({
            "date":  created.date(),
            "title": post.title,
            "body":  post.selftext[:500] if post.selftext else "",
            "url":   f"https://reddit.com{post.permalink}",
        })
    return posts


def fetch_reddit_mentions(tools: list[dict]) -> tuple[pd.DataFrame, pd.DataFrame]:
    reddit     = _get_reddit_client()
    count_rows = []
    raw_rows   = []

    for tool in tools:
        keyword = tool["keywords"][0]
        logger.info(f"Reddit: {tool['tool_name']} → '{keyword}'")
        try:
            posts = _search(reddit, keyword)
            for p in posts:
                raw_rows.append({**p, "tool_id": tool["tool_id"], "source": "reddit"})
            if posts:
                df    = pd.DataFrame(posts)
                daily = df.groupby("date").size().reset_index(name="reddit_mention_count")
                daily["tool_id"] = tool["tool_id"]
                count_rows.append(daily)
        except Exception as e:
            logger.error(f"Reddit failed for {tool['tool_name']}: {e}")

    counts_df = pd.concat(count_rows, ignore_index=True) if count_rows else pd.DataFrame(
        columns=["date", "tool_id", "reddit_mention_count"])
    raw_df    = pd.DataFrame(raw_rows) if raw_rows else pd.DataFrame()
    return counts_df, raw_df
