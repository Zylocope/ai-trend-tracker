"""
Self-check for the snapshot builder. No network, no framework.
Run: python -m pipeline.test_store
"""
from pipeline import registry, sentiment, store


def test_registry_is_consistent():
    slugs = [t["slug"] for t in registry.TOOLS]
    assert len(slugs) == len(set(slugs)), "duplicate tool slugs"

    ids = [t["tool_id"] for t in registry.TOOLS]
    assert len(ids) == len(set(ids)), "duplicate tool_ids"

    cat_ids = {c["category_id"] for c in registry.CATEGORIES}
    assert all(t["category_id"] in cat_ids for t in registry.TOOLS), "orphan category_id"

    for c in registry.CATEGORIES:
        total = sum(c["weights"].values())
        assert abs(total - 1.0) < 1e-9, f"{c['slug']} weights sum to {total}, not 1.0"

    company_slugs = {c["slug"] for c in registry.COMPANIES}
    assert all(m["company_slug"] in company_slugs for m in registry.MODELS), "orphan company"

    for combo in registry.COMBOS:
        assert all(s in slugs for s in combo["tool_slugs"]), f"{combo['slug']} references unknown tool"


def test_model_tool_map_resolves():
    slugs       = {t["slug"] for t in registry.TOOLS}
    model_slugs = {m["slug"] for m in registry.MODELS}
    for model_slug, tool_slug in store.MODEL_TO_TOOL.items():
        assert model_slug in model_slugs, f"map references unknown model {model_slug}"
        assert tool_slug in slugs,        f"map references unknown tool {tool_slug}"


def test_composite_uses_category_weights():
    metrics = [{
        "date": "2026-09-01", "tool_id": 1,
        "google_trend_score": 100.0, "reddit_mention_count": 50,
        "news_mention_count": 20, "average_sentiment_score": 0.5,
    }]
    rows = store.build_category_leaderboard(metrics)
    row  = next(r for r in rows if r["tool_id"] == 1)

    # general-chat weights: trend .5, mentions .2, news .2, sentiment .1
    expected = 100 * 0.5 + 50 * 0.1 * 0.2 + 20 * 0.1 * 0.2 + 0.5 * 10 * 0.1
    assert row["composite_score"] == round(expected, 2), row["composite_score"]

    # A tool with no metrics must score None, never 0 - absence is not a low rank.
    missing = next(r for r in rows if r["tool_id"] != 1)
    assert missing["composite_score"] is None, missing


def test_leaderboard_covers_every_tool_and_sorts():
    rows = store.build_category_leaderboard([])
    assert len(rows) == len(registry.TOOLS)

    metrics = [
        {"date": "2026-09-01", "tool_id": 1, "google_trend_score": 10.0},
        {"date": "2026-09-01", "tool_id": 2, "google_trend_score": 90.0},
    ]
    scored = [r for r in store.build_category_leaderboard(metrics)
              if r["composite_score"] is not None]
    assert scored[0]["tool_id"] == 2, "not sorted by composite_score desc"


def test_latest_metrics_wins():
    metrics = [
        {"date": "2026-08-30", "tool_id": 1, "google_trend_score": 10.0},
        {"date": "2026-09-01", "tool_id": 1, "google_trend_score": 99.0},
    ]
    row = next(r for r in store.build_category_leaderboard(metrics) if r["tool_id"] == 1)
    assert row["google_trend_score"] == 99.0, "did not take the most recent date"


def test_model_buzz_join_is_explicit():
    facts = [{
        **registry.MODELS[0], "context_window": 400000,
        "price_in_per_mtok": 1.25, "price_out_per_mtok": 10.0,
        "arena_elo": 1400, "arena_label": "agents/fullstack",
        "knowledge_cutoff": None, "listed_on_openrouter": True,
        "source_url": "https://openrouter.ai/models",
    }]
    chatgpt = next(t for t in registry.TOOLS if t["slug"] == "chatgpt")
    metrics = [{"date": "2026-09-01", "tool_id": chatgpt["tool_id"],
                "google_trend_score": 100.0, "reddit_mention_count": 7}]

    row = store.build_model_leaderboard(facts, metrics)[0]
    assert row["buzz_tool_slug"] == "chatgpt"
    assert row["hn_mention_count"] == 7

    # An unmapped model must report no buzz rather than borrow a similar name's.
    orphan = store.build_model_leaderboard(
        [{**facts[0], "slug": "not-mapped", "model_id": 99}], metrics
    )[0]
    assert orphan["buzz_tool_slug"] is None and orphan["google_trend_score"] is None


def _model_row(model_id, trend=None, aa=None):
    return {"model_id": model_id, "google_trend_score": trend, "aa_intelligence_index": aa}


def test_hype_gap_needs_both_halves():
    rows = [
        _model_row(1, trend=100.0, aa=10.0),   # loud, weak  -> most overhyped
        _model_row(2, trend=50.0,  aa=50.0),   # middle of both
        _model_row(3, trend=1.0,   aa=90.0),   # quiet, strong -> most underrated
        _model_row(4, trend=None,  aa=90.0),   # no buzz      -> no verdict
        _model_row(5, trend=10.0,  aa=None),   # no AA score  -> no verdict
    ]
    store.attach_hype_gap(rows)
    by_id = {r["model_id"]: r for r in rows}

    assert by_id[1]["hype_gap"] > 0,  by_id[1]
    assert by_id[3]["hype_gap"] < 0,  by_id[3]
    assert by_id[1]["hype_gap"] > by_id[2]["hype_gap"] > by_id[3]["hype_gap"]

    # Missing either half must read as "unknown", never as a neutral zero.
    assert by_id[4]["hype_gap"] is None
    assert by_id[5]["hype_gap"] is None


def test_hype_gap_ties_do_not_invent_a_gap():
    rows = [_model_row(i, trend=5.0, aa=5.0) for i in range(1, 4)]
    store.attach_hype_gap(rows)
    assert all(r["hype_gap"] == 0.0 for r in rows), rows

    # Fewer than two scored models means no percentile is definable at all.
    lone = [_model_row(1, trend=5.0, aa=5.0)]
    store.attach_hype_gap(lone)
    assert lone[0]["hype_gap"] is None


def test_merge_history_dedupes_and_prefers_fresh():
    old   = [{"date": "2026-08-31", "tool_id": 1, "google_trend_score": 1.0}]
    fresh = [{"date": "2026-08-31", "tool_id": 1, "google_trend_score": 2.0},
             {"date": "2026-09-01", "tool_id": 1, "google_trend_score": 3.0}]
    merged = store.merge_history(old, fresh)

    assert len(merged) == 2, merged
    assert merged[0]["google_trend_score"] == 2.0, "fresh row should win the tie"

    capped = store.merge_history([], [
        {"date": f"2026-01-{d:02d}", "tool_id": 1, "google_trend_score": 1.0}
        for d in range(1, 11)
    ], keep_days=3)
    assert {r["date"] for r in capped} == {"2026-01-08", "2026-01-09", "2026-01-10"}, capped


def test_clean_rejects_nan_and_inf():
    assert store._clean(float("nan")) is None
    assert store._clean(float("inf")) is None
    assert store._clean(None) is None
    assert store._clean("7.5") == 7.5
    assert store._clean(7.9, as_int=True) == 7


def test_sentiment_buckets_by_mention_date_not_run_date():
    mentions = [
        {"date": "2026-08-01", "tool_id": 1, "sentiment": 1.0},
        {"date": "2026-08-01", "tool_id": 1, "sentiment": 0.0},
        {"date": "2026-09-01", "tool_id": 1, "sentiment": -1.0},
        {"date": "2026-09-01", "tool_id": 1, "sentiment": None},   # unscored, ignored
    ]
    avgs = sentiment.daily_averages(mentions)
    assert avgs[("2026-08-01", 1)] == 0.5
    assert avgs[("2026-09-01", 1)] == -1.0
    assert len(avgs) == 2, "backfilled mentions must not collapse onto one day"


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"  ok  {name}")
    print("\nall snapshot checks passed")
