"""
Fetcher: Google Trends, with anchor normalisation.

Google Trends returns 0-100 values normalised to the MAX WITHIN A SINGLE QUERY.
Fetching one keyword per query and then ranking the results across tools is
meaningless - every keyword's own peak becomes 100.

Fix: every batch contains the same high-volume anchor term. Google normalises
each batch internally, and we then rescale each batch so the anchor is worth a
fixed 100. That puts every tool on one shared axis.
"""
import json
import time
import requests
import pandas as pd
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger

WIDGET_URL    = "https://trends.google.com/trends/api/explore"
MULTILINE_URL = "https://trends.google.com/trends/api/widgetdata/multiline"

# ChatGPT dominates search volume for this tool set, so it never gets rounded
# down to a noisy single digit the way a smaller anchor would.
ANCHOR      = "ChatGPT"
BATCH_SIZE  = 4          # + 1 anchor = 5, Google's per-query maximum
ANCHOR_BASE = 100.0      # anchor is defined as exactly this after rescaling
TIMEFRAME   = "today 3-m"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
})


def _strip_prefix(text: str) -> dict:
    """Google prefixes its JSON with )]}',\\n - drop everything before the brace."""
    return json.loads(text[text.index("{"):])


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=3, min=8, max=30))
def _fetch_batch(keywords: list[str]) -> pd.DataFrame:
    """Return a date-indexed frame with one column per keyword."""
    req = {
        "comparisonItem": [
            {"keyword": k, "geo": "", "time": TIMEFRAME} for k in keywords
        ],
        "category": 0,
        "property": "",
    }
    resp = SESSION.get(
        WIDGET_URL,
        params={"hl": "en-US", "tz": "0", "req": json.dumps(req)},
        timeout=20,
    )
    resp.raise_for_status()
    widget = next(
        w for w in _strip_prefix(resp.text)["widgets"] if w["id"] == "TIMESERIES"
    )

    resp = SESSION.get(
        MULTILINE_URL,
        params={
            "hl": "en-US", "tz": "0",
            "req": json.dumps(widget["request"]),
            "token": widget["token"],
        },
        timeout=20,
    )
    resp.raise_for_status()

    rows = []
    for point in _strip_prefix(resp.text)["default"]["timelineData"]:
        values = point.get("value", [])
        if len(values) != len(keywords):
            continue
        row = {"date": pd.to_datetime(point["formattedTime"], format="%b %d, %Y").date()}
        row.update(dict(zip(keywords, values)))
        rows.append(row)

    return pd.DataFrame(rows)


def fetch_google_trends(tools: list[dict]) -> pd.DataFrame:
    """
    Return long-format rows: date, tool_id, google_trend_score.
    Scores are on a shared axis where ANCHOR == ANCHOR_BASE.
    """
    # The anchor is itself a tracked tool, so it needs no separate slot.
    others      = [t for t in tools if t["keywords"][0] != ANCHOR]
    anchor_id   = next((t["tool_id"] for t in tools if t["keywords"][0] == ANCHOR), None)
    anchor_done = anchor_id is None
    frames      = []

    for i in range(0, len(others), BATCH_SIZE):
        batch    = others[i:i + BATCH_SIZE]
        keywords = [ANCHOR] + [t["keywords"][0] for t in batch]
        logger.info(f"Google Trends batch {i // BATCH_SIZE + 1}: {keywords[1:]}")

        try:
            df = _fetch_batch(keywords)
        except Exception as e:
            logger.error(f"Trends batch failed ({keywords[1:]}): {e}")
            continue

        if df.empty:
            logger.warning(f"Trends batch returned no points: {keywords[1:]}")
            continue

        anchor_mean = df[ANCHOR].mean()
        if not anchor_mean:
            logger.warning(f"Anchor flat/zero in batch {keywords[1:]} - skipping rescale")
            continue
        scale = ANCHOR_BASE / anchor_mean

        for tool in batch:
            kw = tool["keywords"][0]
            frames.append(pd.DataFrame({
                "date":               df["date"],
                "tool_id":            tool["tool_id"],
                "google_trend_score": (df[kw] * scale).round(2),
            }))

        # The anchor is a tracked tool too; record its series once.
        if not anchor_done:
            frames.append(pd.DataFrame({
                "date":               df["date"],
                "tool_id":            anchor_id,
                "google_trend_score": (df[ANCHOR] * scale).round(2),
            }))
            anchor_done = True

        time.sleep(3)

    if not frames:
        logger.warning("Google Trends returned no data for any tool")
        return pd.DataFrame(columns=["date", "tool_id", "google_trend_score"])

    combined = pd.concat(frames, ignore_index=True)
    logger.info(f"Google Trends total rows: {len(combined)}")
    return combined
