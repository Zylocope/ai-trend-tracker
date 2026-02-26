-- Run once in: Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS dim_tool (
    tool_id      SERIAL PRIMARY KEY,
    tool_name    VARCHAR(100) NOT NULL UNIQUE,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    company      VARCHAR(100),
    release_date DATE,
    keywords     TEXT[]
);

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords) VALUES
  ('ChatGPT',    'chatgpt',    'OpenAI',     '2022-11-30', ARRAY['ChatGPT', 'GPT-4o', 'OpenAI']),
  ('Gemini',     'gemini',     'Google',     '2023-12-06', ARRAY['Gemini', 'Google Gemini']),
  ('Claude',     'claude',     'Anthropic',  '2023-03-14', ARRAY['Claude AI', 'Anthropic Claude']),
  ('Copilot',    'copilot',    'Microsoft',  '2023-02-07', ARRAY['GitHub Copilot', 'Microsoft Copilot']),
  ('Perplexity', 'perplexity', 'Perplexity', '2022-08-01', ARRAY['Perplexity AI'])
ON CONFLICT (tool_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS fact_daily_metrics (
    date                    DATE NOT NULL,
    tool_id                 INT  NOT NULL REFERENCES dim_tool(tool_id) ON DELETE CASCADE,
    google_trend_score      FLOAT,
    reddit_mention_count    INT  DEFAULT 0,
    news_mention_count      INT  DEFAULT 0,
    average_sentiment_score FLOAT,
    PRIMARY KEY (date, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_metrics_date  ON fact_daily_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_tool  ON fact_daily_metrics(tool_id, date DESC);

CREATE TABLE IF NOT EXISTS raw_mentions (
    id         BIGSERIAL PRIMARY KEY,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source     VARCHAR(20) NOT NULL,
    tool_id    INT REFERENCES dim_tool(tool_id) ON DELETE CASCADE,
    title      TEXT,
    body       TEXT,
    url        TEXT,
    sentiment  FLOAT
);

CREATE INDEX IF NOT EXISTS idx_mentions_tool ON raw_mentions(tool_id, fetched_at DESC);

-- Leaderboard view with composite score
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
    t.tool_id,
    t.tool_name,
    t.slug,
    t.company,
    m.date,
    m.google_trend_score,
    m.reddit_mention_count,
    m.news_mention_count,
    m.average_sentiment_score,
    ROUND(CAST(
        COALESCE(m.google_trend_score, 0) * 0.5 +
        LEAST(COALESCE(m.reddit_mention_count, 0), 1000) * 0.03 +
        LEAST(COALESCE(m.news_mention_count, 0), 500) * 0.04 +
        COALESCE(m.average_sentiment_score, 0) * 10
    AS NUMERIC), 2) AS composite_score
FROM dim_tool t
LEFT JOIN LATERAL (
    SELECT * FROM fact_daily_metrics
    WHERE tool_id = t.tool_id
    ORDER BY date DESC LIMIT 1
) m ON true
ORDER BY composite_score DESC NULLS LAST;
