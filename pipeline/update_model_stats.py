"""
Auto-scrape model performance stats from OpenRouter's public API.
No API key required. Updates speed_tps and latency_ms in dim_model.
Skips rows where manual_override = true.
Run: python -m pipeline.update_model_stats
"""
import os
import requests
from loguru import logger
from dotenv import load_dotenv
from pipeline.db_utils import get_conn

load_dotenv()

OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

# Map our model slugs → OpenRouter model IDs
SLUG_TO_OPENROUTER: dict[str, str] = {
    "gpt-4o":           "openai/gpt-4o",
    "gpt-4o-mini":      "openai/gpt-4o-mini",
    "claude-35-sonnet": "anthropic/claude-3.5-sonnet",
    "claude-3-haiku":   "anthropic/claude-3-haiku",
    "gemini-15-pro":    "google/gemini-pro-1.5",
    "gemini-flash":     "google/gemini-flash-1.5",
    "llama-31-405b":    "meta-llama/llama-3.1-405b-instruct",
    "mistral-large":    "mistralai/mistral-large",
    "deepseek-v3":      "deepseek/deepseek-chat",
    "grok-2":           "x-ai/grok-2",
}


def fetch_openrouter_stats() -> dict[str, dict]:
    """Returns {openrouter_id: {speed_tps, latency_ms}} from OpenRouter."""
    try:
        resp = requests.get(OPENROUTER_MODELS_URL, timeout=15)
        resp.raise_for_status()
        data  = resp.json().get("data", [])
        stats = {}
        for m in data:
            mid  = m.get("id", "")
            perf = m.get("performance", {})
            if perf:
                stats[mid] = {
                    "speed_tps":  perf.get("tokens_per_second"),
                    "latency_ms": perf.get("time_to_first_token_ms"),
                }
        logger.info(f"OpenRouter returned stats for {len(stats)} models")
        return stats
    except Exception as e:
        logger.error(f"OpenRouter fetch failed: {e}")
        return {}


def update_model_stats() -> None:
    or_stats = fetch_openrouter_stats()
    if not or_stats:
        logger.warning("No OpenRouter stats — skipping auto-update")
        return

    updated = 0
    with get_conn() as conn:
        with conn.cursor() as cur:
            for slug, or_id in SLUG_TO_OPENROUTER.items():
                stats = or_stats.get(or_id)
                if not stats:
                    logger.debug(f"No OpenRouter stats for {slug} ({or_id})")
                    continue

                speed   = stats.get("speed_tps")
                latency = stats.get("latency_ms")

                if speed is None and latency is None:
                    continue

                cur.execute("""
                    UPDATE dim_model
                    SET
                        speed_tps  = COALESCE(%s, speed_tps),
                        latency_ms = COALESCE(%s, latency_ms)
                    WHERE slug = %s
                      AND manual_override = false
                """, (speed, latency, slug))

                if cur.rowcount > 0:
                    logger.info(f"Updated {slug}: speed={speed}, latency={latency}")
                    updated += cur.rowcount

    logger.info(f"Model stats update complete — {updated} rows updated")


if __name__ == "__main__":
    update_model_stats()
