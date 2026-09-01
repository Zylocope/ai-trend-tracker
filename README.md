# AI Pulse

**Benchmarks measure what models can do. This measures what people are paying attention to — and shows where the two disagree.**

[Artificial Analysis](https://artificialanalysis.ai/) already runs the capability benchmarks, and runs them properly. This project does not compete with that and does not pretend to. It measures a different thing — daily search interest and Hacker News volume for 34 AI tools — then sets that attention against AA's published capability indices to surface the **hype gap**: models that are talked about more than their scores justify, and models that score well while nobody searches for them.

That join is the product. Neither half is novel on its own; nobody publishes them together.

## Every number is traceable to a commit

There is no database. The pipeline writes a single [`data/snapshot.json`](data/snapshot.json) and GitHub Actions commits it once a day, so:

- `git log data/snapshot.json` is a replayable archive of what the site claimed on any past day
- every figure on the site links back to the commit that produced it
- the whole thing runs on free tiers indefinitely — no hosted database to expire

Benchmarks give you today's snapshot. Version control gives you the history of what everyone believed.

## What is measured here vs. mirrored from elsewhere

| Field | Source | Nature |
|---|---|---|
| `google_trend_score` | Google Trends | measured here |
| `reddit_mention_count` (Hacker News) | HN Algolia API | measured here |
| `news_mention_count` | NewsAPI | measured here |
| `average_sentiment_score` | distilbert SST-2 over collected mentions | derived here |
| `composite_score` | weighted blend of the above | derived here |
| `hype_gap` | attention percentile − capability percentile | **the join** |
| `aa_*_index` | Artificial Analysis via OpenRouter | mirrored, credited |
| `price_*`, `context_window` | OpenRouter | mirrored, credited |

`composite_score` is an **attention** index. It is not a quality or capability score, and the UI never labels it as one.

### Reading `google_trend_score`

Google Trends normalises to 0–100 **within a single query**, so fetching keywords one at a time and ranking the results is meaningless — every term peaks at its own 100. This pipeline batches four tools plus a fixed anchor term per query and rescales each batch so the anchor is worth exactly 100. Scores are therefore comparable across tools within a snapshot, and represent relative interest, never absolute search volume.

## Running it

```bash
pip install -r pipeline/requirements.txt
python -m pipeline.run_all
```

Writes `data/snapshot.json`. Only NewsAPI needs a key (see `.env.example`); without it that one column stays empty and everything else still runs.

```bash
cd web && npm install && npm run build
```

Every route is statically prerendered from the snapshot — 53 pages, no runtime data fetching.

Self-check for the snapshot builder, no network or framework needed:

```bash
python -m pipeline.test_store
```

## Layout

```
pipeline/
  registry.py       tracked tools, categories, companies, models (static, diffable)
  fetch_trends.py   Google Trends, anchor-normalised
  fetch_hackernews.py, fetch_news.py, fetch_models.py
  sentiment.py      scores mentions by their own publication date
  store.py          builds the derived views, writes the snapshot
  test_store.py     self-check
data/snapshot.json  the entire dataset, committed daily
web/                Next.js, reads the snapshot at build time
```

## Known limits

- Hacker News search uses one keyword per tool, so a broad term collects some unrelated posts.
- distilbert SST-2 is trained on movie reviews; it handles plain praise and complaint but misreads sarcasm and jargon. Treat sentiment as coarse.
- Combos are hand-written editorial recipes, not measurements, and are labelled as such.
- Attention is measured per product, so model variants from one family share their parent's attention series. `buzz_tool_slug` names the tool a model's attention came from; models with no mapped product show no attention data rather than borrowing another's.
