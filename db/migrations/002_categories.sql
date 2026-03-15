-- ── 002_categories.sql ──────────────────────────────────────────
-- Run in Supabase SQL Editor → New Query

-- ── 1. Category dimension table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_category (
    category_id   SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    description   TEXT,
    icon          VARCHAR(10),   -- emoji
    -- per-category score weights (must sum to 1.0)
    w_trend       FLOAT NOT NULL DEFAULT 0.5,
    w_mentions    FLOAT NOT NULL DEFAULT 0.2,
    w_news        FLOAT NOT NULL DEFAULT 0.2,
    w_sentiment   FLOAT NOT NULL DEFAULT 0.1
);

INSERT INTO dim_category (name, slug, description, icon, w_trend, w_mentions, w_news, w_sentiment) VALUES
  ('General Chat',   'general-chat',   'General-purpose AI assistants and chatbots', '💬', 0.50, 0.20, 0.20, 0.10),
  ('Coding',         'coding',         'AI coding assistants and developer tools',   '💻', 0.25, 0.50, 0.15, 0.10),
  ('Web Search',     'web-search',     'AI-powered search and research tools',       '🔍', 0.60, 0.15, 0.25, 0.00)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. Add category to dim_tool ─────────────────────────────────
ALTER TABLE dim_tool ADD COLUMN IF NOT EXISTS category_id INT REFERENCES dim_category(category_id);

-- ── 3. Seed all tools ───────────────────────────────────────────
-- General Chat
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'ChatGPT', 'chatgpt', 'OpenAI', '2022-11-30',
       ARRAY['ChatGPT', 'GPT-4o', 'OpenAI chatbot'],
       (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'chatgpt');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Claude', 'claude', 'Anthropic', '2023-03-14',
       ARRAY['Claude AI', 'Anthropic Claude'],
       (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'claude');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Gemini', 'gemini', 'Google', '2023-12-06',
       ARRAY['Google Gemini', 'Gemini AI'],
       (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'gemini');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Grok', 'grok', 'xAI', '2023-11-04',
       ARRAY['Grok AI', 'xAI Grok'],
       (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'grok');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'DeepSeek', 'deepseek', 'DeepSeek AI', '2023-11-02',
       ARRAY['DeepSeek AI', 'DeepSeek chat'],
       (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'deepseek');

-- Update existing tools to General Chat category
UPDATE dim_tool
SET category_id = (SELECT category_id FROM dim_category WHERE slug = 'general-chat')
WHERE slug IN ('chatgpt','claude','gemini','copilot')
  AND category_id IS NULL;

-- Coding
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Cursor', 'cursor', 'Anysphere', '2023-03-14',
       ARRAY['Cursor AI editor', 'Cursor IDE'],
       (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'cursor');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'GitHub Copilot', 'github-copilot', 'Microsoft', '2021-06-29',
       ARRAY['GitHub Copilot', 'Copilot coding'],
       (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'github-copilot');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Windsurf', 'windsurf', 'Codeium', '2024-11-13',
       ARRAY['Windsurf IDE', 'Codeium Windsurf'],
       (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'windsurf');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Replit AI', 'replit', 'Replit', '2023-04-01',
       ARRAY['Replit AI', 'Replit Ghostwriter'],
       (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'replit');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Codeium', 'codeium', 'Codeium', '2022-12-01',
       ARRAY['Codeium AI', 'Codeium autocomplete'],
       (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'codeium');

-- Update copilot to coding
UPDATE dim_tool
SET category_id = (SELECT category_id FROM dim_category WHERE slug = 'coding')
WHERE slug = 'copilot';

-- Web Search
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Perplexity', 'perplexity', 'Perplexity AI', '2022-08-01',
       ARRAY['Perplexity AI', 'Perplexity search'],
       (SELECT category_id FROM dim_category WHERE slug = 'web-search')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'perplexity');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'You.com', 'youcom', 'You.com', '2021-11-09',
       ARRAY['You.com AI search', 'YouChat'],
       (SELECT category_id FROM dim_category WHERE slug = 'web-search')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'youcom');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Andi Search', 'andi', 'Andi', '2022-05-01',
       ARRAY['Andi search AI', 'Andi AI'],
       (SELECT category_id FROM dim_category WHERE slug = 'web-search')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'andi');

INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id)
SELECT 'Phind', 'phind', 'Phind', '2022-09-01',
       ARRAY['Phind AI search', 'Phind developer search'],
       (SELECT category_id FROM dim_category WHERE slug = 'web-search')
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = 'phind');

-- Update perplexity to web-search
UPDATE dim_tool
SET category_id = (SELECT category_id FROM dim_category WHERE slug = 'web-search')
WHERE slug = 'perplexity' AND category_id IS NULL;

-- ── 4. Enable RLS on new table ──────────────────────────────────
ALTER TABLE dim_category ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read dim_category"
  ON dim_category FOR SELECT USING (true);

-- ── 5. Per-category leaderboard view ────────────────────────────
DROP VIEW IF EXISTS v_leaderboard;
DROP VIEW IF EXISTS v_category_leaderboard;

CREATE OR REPLACE VIEW v_category_leaderboard
  WITH (security_invoker = true)
AS
SELECT
    t.tool_id,
    t.tool_name,
    t.slug,
    t.company,
    c.category_id,
    c.name        AS category_name,
    c.slug        AS category_slug,
    c.icon        AS category_icon,
    m.date,
    m.google_trend_score,
    m.reddit_mention_count,
    m.news_mention_count,
    m.average_sentiment_score,
    -- weighted composite using per-category weights
    ROUND(CAST(
        COALESCE(m.google_trend_score, 0)                               * c.w_trend    +
        LEAST(COALESCE(m.reddit_mention_count, 0), 1000) * 0.1         * c.w_mentions +
        LEAST(COALESCE(m.news_mention_count,   0),  500) * 0.1         * c.w_news     +
        COALESCE(m.average_sentiment_score, 0) * 10                    * c.w_sentiment
    AS NUMERIC), 2) AS composite_score
FROM dim_tool t
JOIN dim_category c ON c.category_id = t.category_id
LEFT JOIN LATERAL (
    SELECT * FROM fact_daily_metrics
    WHERE tool_id = t.tool_id
    ORDER BY date DESC LIMIT 1
) m ON true;

-- Keep a flat v_leaderboard for the default "all" view (general chat only for backward compat)
CREATE OR REPLACE VIEW v_leaderboard
  WITH (security_invoker = true)
AS
SELECT *
FROM v_category_leaderboard
WHERE category_slug = 'general-chat'
ORDER BY composite_score DESC NULLS LAST;

-- Grant SELECT on new view
GRANT SELECT ON v_category_leaderboard TO anon;
GRANT SELECT ON v_leaderboard TO anon;
GRANT SELECT ON dim_category TO anon;
