"""Shared database connection helper."""
import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from loguru import logger

DATABASE_URL = os.environ["DATABASE_URL"]


@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def fetch_tools() -> list[dict]:
    """Return all tracked tools with their keywords."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT tool_id, tool_name, keywords FROM dim_tool ORDER BY tool_id")
            return [dict(r) for r in cur.fetchall()]
