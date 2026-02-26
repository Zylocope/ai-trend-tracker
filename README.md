# AI Pulse 🔴

> Real-time leaderboard of AI tools ranked by Google Trends, Reddit mentions, and public sentiment.

**Live site**: https://ai-pulse.vercel.app (your Vercel URL after deploy)

---

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, ISR, SEO, real domain |
| Database | Supabase (Postgres) | Free, REST API, no infra to manage |
| Hosting | Vercel | Zero-config Next.js deploy, free tier |
| Pipeline | Python + GitHub Actions | Runs daily, free CI minutes |

---

## Deploy in 4 steps

### 1. Supabase — create database

1. Create free account at [supabase.com](https://supabase.com)
2. New project → pick a region close to you
3. Go to **SQL Editor → New Query**, paste the contents of `db/migrations/001_init_schema.sql`, run it
4. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to **Settings → Database → Connection string (URI)** and copy the URI → `DATABASE_URL`

### 2. Vercel — deploy the frontend

```bash
npm i -g vercel
cd web
vercel          # follow the prompts, link to your GitHub repo
```

Or: go to [vercel.com](https://vercel.com), import your repo, set **Root Directory** to `web`.

Add these environment variables in Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
```

### 3. GitHub — add secrets for the pipeline

In your GitHub repo → **Settings → Secrets → Actions**, add:
```
DATABASE_URL          = postgresql://postgres:...@db.xxxx.supabase.co:5432/postgres
REDDIT_CLIENT_ID      = (from reddit.com/prefs/apps)
REDDIT_CLIENT_SECRET  = (from reddit.com/prefs/apps)
NEWS_API_KEY          = (from newsapi.org)
```

### 4. Trigger first ingestion run

In GitHub → **Actions → Daily Ingestion Pipeline → Run workflow**

After it completes, your site will show live data.

---

## Project structure

```
ai-pulse/
├── web/                        # Next.js app → deploys to Vercel
│   ├── app/
│   │   ├── page.tsx            # Leaderboard home
│   │   ├── [tool]/page.tsx     # Tool detail (charts + mentions)
│   │   ├── api/leaderboard/    # REST endpoint
│   │   ├── api/tool/[slug]/    # REST endpoint  
│   │   └── api/mentions/[slug]/# REST endpoint
│   ├── components/
│   │   ├── LeaderboardTable.tsx
│   │   ├── SentimentChart.tsx  # Recharts
│   │   └── MentionsFeed.tsx
│   └── lib/supabase.ts
│
├── pipeline/                   # Python ETL → runs via GitHub Actions
│   ├── fetch_trends.py         # Google Trends (pytrends)
│   ├── fetch_reddit.py         # Reddit (PRAW)
│   ├── fetch_news.py           # NewsAPI
│   ├── run_sentiment.py        # HuggingFace NLP scoring
│   ├── db_writer.py            # Upserts to Supabase Postgres
│   └── run_all.py              # Entry point
│
├── db/migrations/
│   └── 001_init_schema.sql     # Run once in Supabase SQL editor
│
└── .github/workflows/
    └── daily_ingestion.yml     # Cron: 06:00 UTC daily
```

---

## Free tier limits

- Supabase free: 500 MB storage, 2 GB egress/month — more than enough
- Vercel free: 100 GB bandwidth, unlimited deploys
- GitHub Actions: 2,000 minutes/month — pipeline uses ~3 min/day = 90 min/month

Total cost: **$0/month**
