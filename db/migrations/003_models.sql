-- ── 003_models.sql ──────────────────────────────────────────────
-- Run in Supabase SQL Editor → New Query

-- ── Company dimension ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_company (
    company_id        SERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL UNIQUE,
    slug              VARCHAR(100) NOT NULL UNIQUE,
    founded_year      INT,
    hq                VARCHAR(100),
    total_funding_usd BIGINT,       -- in USD
    description       TEXT
);

ALTER TABLE dim_company ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read dim_company"
  ON dim_company FOR SELECT USING (true);

-- ── Model dimension ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_model (
    model_id         SERIAL PRIMARY KEY,
    company_id       INT NOT NULL REFERENCES dim_company(company_id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL,
    slug             VARCHAR(150) NOT NULL UNIQUE,
    release_date     DATE,
    context_window   INT,            -- tokens
    speed_tps        FLOAT,          -- output tokens/sec
    latency_ms       FLOAT,          -- time to first token ms
    providers        TEXT[],         -- e.g. ARRAY['AWS', 'Azure', 'GCP']
    is_open_source   BOOLEAN DEFAULT false,
    -- manual override flag — if true, auto-scrape won't overwrite
    manual_override  BOOLEAN DEFAULT false
);

ALTER TABLE dim_model ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read dim_model"
  ON dim_model FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_model_company ON dim_model(company_id);

-- ── Link models to tool buzz tracking ───────────────────────────
-- A model can be linked to an existing dim_tool for buzz signals
ALTER TABLE dim_tool ADD COLUMN IF NOT EXISTS model_id INT REFERENCES dim_model(model_id);

-- ── Seed companies ───────────────────────────────────────────────
INSERT INTO dim_company (name, slug, founded_year, hq, total_funding_usd, description) VALUES
  ('OpenAI',    'openai',    2015, 'San Francisco, CA', 11300000000, 'AI safety company and maker of GPT models'),
  ('Anthropic', 'anthropic', 2021, 'San Francisco, CA',  7300000000, 'AI safety company and maker of Claude'),
  ('Google',    'google',    1998, 'Mountain View, CA',           0, 'Technology company and maker of Gemini'),
  ('Meta',      'meta',      2004, 'Menlo Park, CA',              0, 'Social technology company, open-source AI'),
  ('Mistral AI','mistral',   2023, 'Paris, France',     1050000000, 'European AI company focused on efficient models'),
  ('DeepSeek',  'deepseek',  2023, 'Hangzhou, China',             0, 'Chinese AI lab focused on efficient reasoning'),
  ('xAI',       'xai',       2023, 'San Francisco, CA',  6000000000, 'AI company founded by Elon Musk, maker of Grok')
ON CONFLICT (slug) DO NOTHING;

-- ── Seed models ──────────────────────────────────────────────────
INSERT INTO dim_model (company_id, name, slug, release_date, context_window, speed_tps, latency_ms, providers, is_open_source) VALUES
  -- OpenAI
  ((SELECT company_id FROM dim_company WHERE slug='openai'),
   'GPT-4o', 'gpt-4o', '2024-05-13', 128000, 63.0, 520, ARRAY['Azure','AWS','GCP'], false),
  ((SELECT company_id FROM dim_company WHERE slug='openai'),
   'GPT-4o mini', 'gpt-4o-mini', '2024-07-18', 128000, 150.0, 320, ARRAY['Azure','AWS'], false),

  -- Anthropic
  ((SELECT company_id FROM dim_company WHERE slug='anthropic'),
   'Claude 3.5 Sonnet', 'claude-35-sonnet', '2024-06-20', 200000, 72.0, 600, ARRAY['AWS','GCP'], false),
  ((SELECT company_id FROM dim_company WHERE slug='anthropic'),
   'Claude 3 Haiku', 'claude-3-haiku', '2024-03-13', 200000, 140.0, 280, ARRAY['AWS','GCP'], false),

  -- Google
  ((SELECT company_id FROM dim_company WHERE slug='google'),
   'Gemini 1.5 Pro', 'gemini-15-pro', '2024-02-15', 1000000, 85.0, 480, ARRAY['GCP'], false),
  ((SELECT company_id FROM dim_company WHERE slug='google'),
   'Gemini Flash', 'gemini-flash', '2024-05-14', 1000000, 200.0, 180, ARRAY['GCP'], false),

  -- Meta
  ((SELECT company_id FROM dim_company WHERE slug='meta'),
   'Llama 3.1 405B', 'llama-31-405b', '2024-07-23', 128000, 28.0, 900, ARRAY['AWS','Azure','GCP'], true),

  -- Mistral
  ((SELECT company_id FROM dim_company WHERE slug='mistral'),
   'Mistral Large', 'mistral-large', '2024-02-26', 128000, 55.0, 550, ARRAY['Azure','AWS'], false),

  -- DeepSeek
  ((SELECT company_id FROM dim_company WHERE slug='deepseek'),
   'DeepSeek V3', 'deepseek-v3', '2024-12-26', 128000, 60.0, 580, ARRAY['AWS'], false),

  -- xAI
  ((SELECT company_id FROM dim_company WHERE slug='xai'),
   'Grok 2', 'grok-2', '2024-08-13', 131072, 95.0, 430, ARRAY['Azure'], false)
ON CONFLICT (slug) DO NOTHING;

-- ── Combined model leaderboard view ─────────────────────────────
CREATE OR REPLACE VIEW v_model_leaderboard
  WITH (security_invoker = true)
AS
SELECT
    m.model_id,
    m.name              AS model_name,
    m.slug              AS model_slug,
    m.context_window,
    m.speed_tps,
    m.latency_ms,
    m.providers,
    m.is_open_source,
    c.company_id,
    c.name              AS company_name,
    c.slug              AS company_slug,
    c.total_funding_usd,
    -- Latest buzz signals from linked dim_tool
    buz.date,
    buz.google_trend_score,
    buz.reddit_mention_count   AS hn_mention_count,
    buz.news_mention_count,
    buz.average_sentiment_score
FROM dim_model m
JOIN dim_company c ON c.company_id = m.company_id
LEFT JOIN LATERAL (
    SELECT
        fdm.date,
        fdm.google_trend_score,
        fdm.reddit_mention_count,
        fdm.news_mention_count,
        fdm.average_sentiment_score
    FROM dim_tool t
    JOIN fact_daily_metrics fdm ON fdm.tool_id = t.tool_id
    WHERE LOWER(t.tool_name) ILIKE '%' || LOWER(SPLIT_PART(m.name, ' ', 1)) || '%'
       OR t.slug = LOWER(SPLIT_PART(m.slug, '-', 1))
    ORDER BY fdm.date DESC
    LIMIT 1
) buz ON true;

GRANT SELECT ON dim_company TO anon;
GRANT SELECT ON dim_model   TO anon;
GRANT SELECT ON v_model_leaderboard TO anon;
