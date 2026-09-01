"""
Sentiment scoring for raw mentions.

Two fixes over the previous version:
  - Scores are bucketed by the mention's OWN publication date, not by when the
    job happened to run. Bucketing on fetched_at collapsed every backfilled
    mention onto the ingest day, so the chart tracked the cron, not opinion.
  - Runs in-process on the frame being ingested instead of round-tripping
    through a database table of unscored rows.
"""
from collections import defaultdict

from loguru import logger

MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
BATCH_SIZE = 64

# distilbert/SST-2 is trained on movie reviews. It reads plain praise and
# complaint well enough for a coarse daily average, and is unreliable on
# sarcasm and jargon - hence "average_sentiment_score", never "approval".
_SCORER = None


def _load():
    global _SCORER
    if _SCORER is None:
        from transformers import pipeline as hf_pipeline
        logger.info(f"Loading sentiment model ({MODEL_NAME})...")
        _SCORER = hf_pipeline(
            "sentiment-analysis", model=MODEL_NAME, truncation=True, max_length=512
        )
    return _SCORER


def score_mentions(mentions: list[dict]) -> list[dict]:
    """Attach a -1..+1 `sentiment` to each mention. Returns the same list."""
    if not mentions:
        return mentions

    try:
        scorer = _load()
    except Exception as e:
        # A missing torch/transformers install should cost the sentiment column,
        # not the entire day's ingestion.
        logger.error(f"Sentiment model unavailable, skipping scoring: {e}")
        for m in mentions:
            m["sentiment"] = None
        return mentions

    texts = [f"{m.get('title') or ''} {m.get('body') or ''}".strip() for m in mentions]
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i:i + BATCH_SIZE]
        for j, r in enumerate(scorer(batch)):
            score = r["score"] if r["label"] == "POSITIVE" else -r["score"]
            mentions[i + j]["sentiment"] = round(score, 4)

    logger.info(f"Scored {len(mentions)} mentions")
    return mentions


def daily_averages(mentions: list[dict]) -> dict[tuple[str, int], float]:
    """{(date, tool_id): mean sentiment} keyed on each mention's own date."""
    buckets = defaultdict(list)
    for m in mentions:
        if m.get("sentiment") is None or not m.get("date"):
            continue
        buckets[(str(m["date"]), m["tool_id"])].append(m["sentiment"])
    return {k: round(sum(v) / len(v), 4) for k, v in buckets.items()}
