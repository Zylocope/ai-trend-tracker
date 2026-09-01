"""
Fetcher: model facts from OpenRouter's public model list. No API key needed.

Replaces the old hand-typed speed_tps / latency_ms seeds, which were invented
numbers that the previous auto-updater could never overwrite: it read a
`performance` key that does not exist on any OpenRouter model, so it bailed out
on every run and left the fake values in place.

Only fields OpenRouter actually serves are used here:
  pricing.prompt / pricing.completion       -> USD per token  (all 420 models)
  context_length                            -> tokens         (all 420 models)
  benchmarks.artificial_analysis            -> AA indices     (177 models)
  benchmarks.design_arena                   -> arena elo      (238 models)

The capability numbers are Artificial Analysis's, mirrored through OpenRouter
and credited as theirs. This project does not run its own benchmark and should
never present a capability score as if it did.
"""
import requests
from loguru import logger

MODELS_URL = "https://openrouter.ai/api/v1/models"
SOURCE_URL = "https://openrouter.ai/models"
AA_URL     = "https://artificialanalysis.ai/"


def _per_million(price_str: str | None) -> float | None:
    """OpenRouter quotes USD per token as a string; humans read per-million."""
    try:
        return round(float(price_str) * 1_000_000, 4)
    except (TypeError, ValueError):
        return None


def _aa_indices(benchmarks: dict | None) -> dict:
    """Artificial Analysis intelligence / coding / agentic indices, when present."""
    aa = (benchmarks or {}).get("artificial_analysis") or {}
    return {
        "aa_intelligence_index": aa.get("intelligence_index"),
        "aa_coding_index":       aa.get("coding_index"),
        "aa_agentic_index":      aa.get("agentic_index"),
    }


def _best_elo(benchmarks: dict | None) -> tuple[float | None, str | None]:
    """
    Highest design-arena elo the model holds, plus the category it came from.

    `benchmarks` is keyed by provider, each holding a list of per-category
    entries - not a flat list.
    """
    best = None
    for entry in (benchmarks or {}).get("design_arena") or []:
        elo = entry.get("elo")
        if elo is None:
            continue
        if best is None or elo > best["elo"]:
            best = {"elo": elo, "label": entry.get("category", "overall")}
    return (best["elo"], best["label"]) if best else (None, None)


def fetch_model_facts(models: list[dict]) -> list[dict]:
    """Enrich registry MODELS with live OpenRouter facts. Missing fields stay None."""
    try:
        resp = requests.get(MODELS_URL, timeout=20)
        resp.raise_for_status()
        catalog = {m["id"]: m for m in resp.json().get("data", [])}
        logger.info(f"OpenRouter catalog: {len(catalog)} models")
    except Exception as e:
        logger.error(f"OpenRouter fetch failed: {e}")
        catalog = {}

    out = []
    for m in models:
        live = catalog.get(m["openrouter_id"], {})
        if not live:
            logger.warning(f"Not on OpenRouter: {m['slug']} ({m['openrouter_id']})")

        pricing    = live.get("pricing") or {}
        benchmarks = live.get("benchmarks")
        elo, arena = _best_elo(benchmarks)

        out.append({
            **m,
            **_aa_indices(benchmarks),
            "context_window":     live.get("context_length"),
            "price_in_per_mtok":  _per_million(pricing.get("prompt")),
            "price_out_per_mtok": _per_million(pricing.get("completion")),
            "arena_elo":          elo,
            "arena_label":        arena,
            "knowledge_cutoff":   live.get("knowledge_cutoff"),
            "listed_on_openrouter": bool(live),
            "source_url":         SOURCE_URL,
            "capability_source":  AA_URL,
        })

    found = sum(1 for m in out if m["listed_on_openrouter"])
    scored = sum(1 for m in out if m["aa_intelligence_index"] is not None)
    logger.info(f"Model facts resolved: {found}/{len(out)} listed, {scored} with AA indices")
    return out
