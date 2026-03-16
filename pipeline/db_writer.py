"""Upserts ingested data into Supabase PostgreSQL."""
import math
import pandas as pd
import psycopg2.extras
from loguru import logger
from pipeline.db_utils import get_conn


def _clean(value, is_int: bool = False):
    """Convert NaN/inf to None, cast ints properly."""
    if value is None:
        return None
    try:
        if math.isnan(float(value)) or math.isinf(float(value)):
            return None
    except (TypeError, ValueError):
        return None
    if is_int:
        return int(value)
    return float(value)


def upsert_daily_metrics(df: pd.DataFrame) -> None:
    if df.empty:
        return

    cols = [c for c in [
        "google_trend_score",
        "reddit_mention_count",
        "news_mention_count",
    ] if c in df.columns]

    if not cols:
        return

    int_cols = {"reddit_mention_count", "news_mention_count"}

    set_clause   = ", ".join(f"{c} = EXCLUDED.{c}" for c in cols)
    col_list     = ", ".join(["date", "tool_id"] + cols)
    placeholders = ", ".join(["%s"] * (2 + len(cols)))

    sql = f"""
        INSERT INTO fact_daily_metrics ({col_list})
        VALUES ({placeholders})
        ON CONFLICT (date, tool_id)
        DO UPDATE SET {set_clause}
    """

    records = []
    for _, row in df.iterrows():
        record = [row["date"], int(row["tool_id"])]
        for c in cols:
            record.append(_clean(row[c], is_int=(c in int_cols)))
        records.append(tuple(record))

    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, sql, records, page_size=500)
    logger.info(f"Upserted {len(records)} rows into fact_daily_metrics")


def insert_raw_mentions(df: pd.DataFrame) -> None:
    if df.empty:
        return

    sql = """
        INSERT INTO raw_mentions (source, tool_id, title, body, url)
        VALUES (%(source)s, %(tool_id)s, %(title)s, %(body)s, %(url)s)
    """
    records = df[["source", "tool_id", "title", "body", "url"]].to_dict("records")
    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, sql, records, page_size=500)
    logger.info(f"Inserted {len(records)} raw mentions")
