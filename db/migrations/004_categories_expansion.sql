-- ── 004_categories_expansion.sql ───────────────────────────────

-- ── 1. Add pricing_tier to dim_tool ─────────────────────────────
ALTER TABLE dim_tool ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20) DEFAULT 'freemium';

-- ── 2. Add new categories ────────────────────────────────────────
INSERT INTO dim_category (name, slug, description, icon, w_trend, w_mentions, w_news, w_sentiment) VALUES
  ('Vibe Coding',       'vibe-coding',       'AI-powered IDEs and no-code/low-code environments', 'code',   0.30, 0.50, 0.15, 0.05),
  ('Image Generation',  'image-generation',  'AI tools for generating and editing images',         'image',  0.50, 0.25, 0.15, 0.10),
  ('Video Generation',  'video-generation',  'AI tools for generating and editing video',          'video',  0.50, 0.20, 0.20, 0.10),
  ('Short Film Combos', 'short-film-combos', 'Multi-tool AI workflows for short film creation',    'film',   0.40, 0.35, 0.15, 0.10)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Update existing tools that already exist ──────────────────
-- Move Cursor, Windsurf, Replit, Copilot to correct categories
UPDATE dim_tool SET
  category_id  = (SELECT category_id FROM dim_category WHERE slug='vibe-coding'),
  pricing_tier = 'freemium'
WHERE slug IN ('cursor', 'windsurf', 'replit-ai');

UPDATE dim_tool SET
  category_id  = (SELECT category_id FROM dim_category WHERE slug='vibe-coding'),
  pricing_tier = 'paid'
WHERE slug IN ('copilot', 'github-copilot');

-- ── 4. Insert NEW vibe coding tools only ────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
VALUES
  ('Lovable',       'lovable',           'Lovable',    '2024-01-01', ARRAY['Lovable AI','Lovable app builder'],   (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'paid'),
  ('Bolt.new',      'bolt-new',          'StackBlitz', '2024-10-01', ARRAY['Bolt.new','Bolt AI','StackBlitz AI'], (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'freemium'),
  ('v0 by Vercel',  'v0-vercel',         'Vercel',     '2023-11-01', ARRAY['v0 Vercel','v0 AI','v0.dev'],         (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'freemium'),
  ('Cline',         'cline',             'Cline',      '2024-06-01', ARRAY['Cline AI','Cline VSCode'],             (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'free'),
  ('Aider',         'aider',             'Aider',      '2023-06-01', ARRAY['Aider AI','Aider coding'],             (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'free'),
  ('Zed Editor',    'zed-editor',        'Zed',        '2024-01-01', ARRAY['Zed editor','Zed AI editor'],          (SELECT category_id FROM dim_category WHERE slug='vibe-coding'), 'free')
ON CONFLICT (slug) DO UPDATE SET
  category_id  = EXCLUDED.category_id,
  pricing_tier = EXCLUDED.pricing_tier;

-- ── 5. Insert image generation tools ────────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
VALUES
  ('Midjourney',       'midjourney',       'Midjourney',   '2022-07-12', ARRAY['Midjourney AI','Midjourney image'],    (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'paid'),
  ('DALL-E 3',         'dalle-3',          'OpenAI',       '2023-10-01', ARRAY['DALL-E 3','OpenAI image generation'],  (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'paid'),
  ('Stable Diffusion', 'stable-diffusion', 'Stability AI', '2022-08-22', ARRAY['Stable Diffusion','Stability AI'],     (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'free'),
  ('Flux AI',          'flux',             'Black Forest', '2024-08-01', ARRAY['Flux AI','Flux image','FLUX.1'],        (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'freemium'),
  ('Adobe Firefly',    'adobe-firefly',    'Adobe',        '2023-03-21', ARRAY['Adobe Firefly','Firefly AI'],           (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'paid'),
  ('Leonardo AI',      'leonardo-ai',      'Leonardo AI',  '2022-12-01', ARRAY['Leonardo AI','Leonardo image'],         (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'freemium'),
  ('Ideogram',         'ideogram',         'Ideogram',     '2023-08-01', ARRAY['Ideogram AI','Ideogram image'],         (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'freemium'),
  ('Canva AI',         'canva-ai',         'Canva',        '2023-03-01', ARRAY['Canva AI','Canva Magic'],                (SELECT category_id FROM dim_category WHERE slug='image-generation'), 'freemium')
ON CONFLICT (slug) DO UPDATE SET
  category_id  = EXCLUDED.category_id,
  pricing_tier = EXCLUDED.pricing_tier;

-- ── 6. Insert video generation tools ────────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
VALUES
  ('Sora',               'sora',    'OpenAI',  '2024-12-09', ARRAY['Sora OpenAI','Sora video AI'],         (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'paid'),
  ('Runway Gen-2',       'runway',  'Runway',  '2023-02-06', ARRAY['Runway AI','Runway Gen-2'],             (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'freemium'),
  ('Kling AI',           'kling',   'Kuaishou','2024-06-06', ARRAY['Kling AI','Kling video'],               (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'freemium'),
  ('Pika Labs',          'pika',    'Pika',    '2023-11-27', ARRAY['Pika Labs','Pika AI video'],            (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'freemium'),
  ('Veo 2',              'veo-2',   'Google',  '2024-12-16', ARRAY['Veo 2','Google Veo'],                   (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'paid'),
  ('Hailuo AI',          'hailuo',  'MiniMax', '2024-08-01', ARRAY['Hailuo AI','MiniMax video'],            (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'freemium'),
  ('Luma Dream Machine', 'luma',    'Luma AI', '2024-06-12', ARRAY['Luma Dream Machine','Luma AI video'],  (SELECT category_id FROM dim_category WHERE slug='video-generation'), 'freemium')
ON CONFLICT (slug) DO UPDATE SET
  category_id  = EXCLUDED.category_id,
  pricing_tier = EXCLUDED.pricing_tier;

-- ── 7. Short film combos table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_combo (
    combo_id          SERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    slug              VARCHAR(200) NOT NULL UNIQUE,
    description       TEXT,
    use_case          VARCHAR(100),
    tool_slugs        TEXT[],
    is_community_pick BOOLEAN DEFAULT false,
    community_votes   INT DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dim_combo ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='dim_combo' AND policyname='public read dim_combo'
  ) THEN
    CREATE POLICY "public read dim_combo" ON dim_combo FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO dim_combo (name, slug, description, use_case, tool_slugs, is_community_pick, community_votes) VALUES
  ('Cinematic Short: Sora + ElevenLabs',  'sora-elevenlabs-cinematic', 'Generate cinematic video with Sora, add professional voiceover with ElevenLabs',    'Cinematic short film',  ARRAY['sora','elevenlabs'],     true,  142),
  ('Animated Story: Kling + Leonardo AI', 'kling-leonardo-animated',   'Create concept art in Leonardo AI, animate with Kling',                              'Animated storytelling', ARRAY['leonardo-ai','kling'],   true,  98),
  ('Social Video: Runway + Canva AI',     'runway-canva-social',       'Generate video clips with Runway, assemble and brand in Canva AI',                   'Social media content',  ARRAY['runway','canva-ai'],     false, 67),
  ('Music Video: Pika + Flux',            'pika-flux-music-video',     'Generate stylized images with Flux, animate into sequences with Pika',               'Music video',           ARRAY['flux','pika'],           false, 54),
  ('Documentary: Veo 2 + Firefly',        'veo2-firefly-documentary',  'Create documentary b-roll with Veo 2, design graphics with Adobe Firefly',           'Documentary',           ARRAY['veo-2','adobe-firefly'], true,  89),
  ('Concept Teaser: Midjourney + Hailuo', 'midjourney-hailuo-teaser',  'Design concept frames in Midjourney, bring them to life with Hailuo',               'Concept teaser',        ARRAY['midjourney','hailuo'],   false, 41)
ON CONFLICT (slug) DO NOTHING;

GRANT SELECT ON dim_combo TO anon;
