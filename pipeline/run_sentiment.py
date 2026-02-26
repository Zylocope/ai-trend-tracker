"""
NLP sentiment scoring.
Reads unscored raw_mentions, scores them with a HuggingFace model,
then aggregates a daily average_sentiment_score per tool.
"""
import os
import pandas as pd
import psycopg2.extras
from loguru import logger
from transformers import pipeline as hf_pipeline
from pipeline.db_utils import get_conn

logger.add("logs/sentiment_{time}.log", rotation="1 day", retention="7 days")

BATCH_SIZE = 64


def load_model():
    logger.info("Loading sentiment model (distilbert)...")
    return hf_pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        truncation=True,
        max_length=512,
    )


def fetch_unscored() -> pd.DataFrame:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, tool_id, title, body
                FROM raw_mentions
                WHERE sentiment IS NULL
                LIMIT 500
            """)
            return pd.DataFrame(cur.fetchall())


def save_scores(scores: list[tuple]) -> None:
    """scores: list of (sentiment_float, id)"""
    sql = "UPDATE raw_mentions SET sentiment = %s WHERE id = %s"
    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, sql, scores, page_size=200)


def update_daily_averages() -> None:
    """Recompute average_sentiment_score for each (date, tool_id)."""
    sql = """
        UPDATE fact_daily_metrics fdm
        SET average_sentiment_score = sub.avg_sent
        FROM (
            SELECT
                DATE(fetched_at) AS date,
                tool_id,
                AVG(sentiment)   AS avg_sent
            FROM raw_mentions
            WHERE sentiment IS NOT NULL
            GROUP BY DATE(fetched_at), tool_id
        ) sub
        WHERE fdm.date    = sub.date
          AND fdm.tool_id = sub.tool_id
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    logger.info("Updated daily sentiment averages")


def run():
    logger.info("=== Sentiment pipeline starting ===")
    df = fetch_unscored()
    if df.empty:
        logger.info("No unscored mentions — done.")
        return

    logger.info(f"Scoring {len(df)} mentions...")
    model  = load_model()
    texts  = (df["title"].fillna("") + " " + df["body"].fillna("")).tolist()
    scores = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch   = texts[i:i + BATCH_SIZE]
        results = model(batch)
        for r in results:
            # Convert POSITIVE/NEGATIVE label to -1..+1 float
            val = r["score"] if r["label"] == "POSITIVE" else -r["score"]
            scores.append(val)

    pairs = list(zip(scores, df["id"].tolist()))
    save_scores(pairs)
    logger.info(f"Saved {len(pairs)} sentiment scores")

    update_daily_averages()
    logger.info("=== Sentiment pipeline complete ===")


if __name__ == "__main__":
    run()
