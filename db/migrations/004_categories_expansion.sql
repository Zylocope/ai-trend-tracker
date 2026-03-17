-- ── 004_categories_expansion.sql ───────────────────────────────
-- Run in Supabase SQL Editor → New Query

-- ── 1. Add pricing_tier to dim_tool ─────────────────────────────
ALTER TABLE dim_tool ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20) DEFAULT 'freemium';
-- values: 'free' | 'freemium' | 'paid'

-- ── 2. Add new categories ────────────────────────────────────────
INSERT INTO dim_category (name, slug, description, icon, w_trend, w_mentions, w_news, w_sentiment) VALUES
  ('Vibe Coding',       'vibe-coding',       'AI-powered IDEs and no-code/low-code environments', 'code',   0.30, 0.50, 0.15, 0.05),
  ('Image Generation',  'image-generation',  'AI tools for generating and editing images',         'image',  0.50, 0.25, 0.15, 0.10),
  ('Video Generation',  'video-generation',  'AI tools for generating and editing video',          'video',  0.50, 0.20, 0.20, 0.10),
  ('Short Film Combos', 'short-film-combos', 'Multi-tool AI workflows for short film creation',    'film',   0.40, 0.35, 0.15, 0.10)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Seed Vibe Coding tools ────────────────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
SELECT t.tool_name, t.slug, t.company, t.release_date::date, t.keywords,
       (SELECT category_id FROM dim_category WHERE slug = 'vibe-coding'),
       t.pricing_tier
FROM (VALUES
  ('Cursor',      'cursor-ide',  'Anysphere',  '2023-03-14', ARRAY['Cursor IDE','Cursor AI','Cursor editor'],    'freemium'),
  ('Lovable',     'lovable',     'Lovable',    '2024-01-01', ARRAY['Lovable AI','Lovable app builder'],          'paid'),
  ('Windsurf',    'windsurf-ide','Codeium',    '2024-11-13', ARRAY['Windsurf IDE','Windsurf AI'],                'freemium'),
  ('Replit',      'replit-ai',   'Replit',     '2023-04-01', ARRAY['Replit AI','Replit Ghostwriter'],            'freemium'),
  ('Bolt.new',    'bolt-new',    'StackBlitz', '2024-10-01', ARRAY['Bolt.new','Bolt AI','StackBlitz AI'],        'freemium'),
  ('v0',          'v0',          'Vercel',     '2023-11-01', ARRAY['v0 Vercel','v0 AI','v0.dev'],                'freemium'),
  ('GitHub Copilot Workspace','copilot-workspace','Microsoft','2024-04-01',ARRAY['GitHub Copilot Workspace'],'paid'),
  ('Cline',       'cline',       'Cline',      '2024-06-01', ARRAY['Cline AI','Cline VSCode extension'],         'free'),
  ('Aider',       'aider',       'Aider',      '2023-06-01', ARRAY['Aider AI','Aider coding'],                   'free'),
  ('Zed',         'zed-editor',  'Zed',        '2024-01-01', ARRAY['Zed editor','Zed AI editor'],                'free')
) AS t(tool_name, slug, company, release_date, keywords, pricing_tier)
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = t.slug);

-- ── 4. Seed Image Generation tools ──────────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
SELECT t.tool_name, t.slug, t.company, t.release_date::date, t.keywords,
       (SELECT category_id FROM dim_category WHERE slug = 'image-generation'),
       t.pricing_tier
FROM (VALUES
  ('Midjourney',      'midjourney',      'Midjourney',   '2022-07-12', ARRAY['Midjourney AI','Midjourney image'],     'paid'),
  ('DALL-E 3',        'dalle-3',         'OpenAI',       '2023-10-01', ARRAY['DALL-E 3','OpenAI image generation'],   'paid'),
  ('Stable Diffusion','stable-diffusion','Stability AI', '2022-08-22', ARRAY['Stable Diffusion','Stability AI'],      'free'),
  ('Flux',            'flux',            'Black Forest', '2024-08-01', ARRAY['Flux AI','Flux image','FLUX.1'],         'freemium'),
  ('Adobe Firefly',   'adobe-firefly',   'Adobe',        '2023-03-21', ARRAY['Adobe Firefly','Firefly AI'],           'paid'),
  ('Leonardo AI',     'leonardo-ai',     'Leonardo AI',  '2022-12-01', ARRAY['Leonardo AI','Leonardo image'],         'freemium'),
  ('Ideogram',        'ideogram',        'Ideogram',     '2023-08-01', ARRAY['Ideogram AI','Ideogram image'],         'freemium'),
  ('Canva AI',        'canva-ai',        'Canva',        '2023-03-01', ARRAY['Canva AI','Canva Magic'],                'freemium')
) AS t(tool_name, slug, company, release_date, keywords, pricing_tier)
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = t.slug);

-- ── 5. Seed Video Generation tools ──────────────────────────────
INSERT INTO dim_tool (tool_name, slug, company, release_date, keywords, category_id, pricing_tier)
SELECT t.tool_name, t.slug, t.company, t.release_date::date, t.keywords,
       (SELECT category_id FROM dim_category WHERE slug = 'video-generation'),
       t.pricing_tier
FROM (VALUES
  ('Sora',     'sora',     'OpenAI',  '2024-12-09', ARRAY['Sora OpenAI','Sora video AI'],          'paid'),
  ('Runway',   'runway',   'Runway',  '2023-02-06', ARRAY['Runway AI','Runway Gen-2','Runway ML'],  'freemium'),
  ('Kling',    'kling',    'Kuaishou','2024-06-06', ARRAY['Kling AI','Kling video'],               'freemium'),
  ('Pika',     'pika',     'Pika',    '2023-11-27', ARRAY['Pika Labs','Pika AI video'],             'freemium'),
  ('Veo 2',    'veo-2',    'Google',  '2024-12-16', ARRAY['Veo 2','Google Veo','Google video AI'], 'paid'),
  ('Hailuo',   'hailuo',   'MiniMax', '2024-08-01', ARRAY['Hailuo AI','MiniMax video'],             'freemium'),
  ('Luma Dream Machine','luma','Luma AI','2024-06-12',ARRAY['Luma Dream Machine','Luma AI video'],  'freemium')
) AS t(tool_name, slug, company, release_date, keywords, pricing_tier)
WHERE NOT EXISTS (SELECT 1 FROM dim_tool WHERE slug = t.slug);

-- ── 6. Short film combos table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_combo (
    combo_id     SERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    description  TEXT,
    use_case     VARCHAR(100),  -- e.g. 'cinematic short', 'animated story'
    tool_slugs   TEXT[],        -- ordered list of tool slugs in the workflow
    is_community_pick BOOLEAN DEFAULT false,
    community_votes   INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dim_combo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read dim_combo" ON dim_combo FOR SELECT USING (true);

-- Seed combos
INSERT INTO dim_combo (name, slug, description, use_case, tool_slugs, is_community_pick, community_votes) VALUES
  (
    'Cinematic Short: Sora + ElevenLabs',
    'sora-elevenlabs-cinematic',
    'Generate cinematic video with Sora, add professional voiceover and sound design with ElevenLabs',
    'Cinematic short film',
    ARRAY['sora','elevenlabs'],
    true, 142
  ),
  (
    'Animated Story: Kling + Leonardo AI',
    'kling-leonardo-animated',
    'Create concept art and storyboards in Leonardo AI, animate them into video with Kling',
    'Animated storytelling',
    ARRAY['leonardo-ai','kling'],
    true, 98
  ),
  (
    'Social Video: Runway + Canva AI',
    'runway-canva-social',
    'Generate video clips with Runway Gen-2, assemble and brand them in Canva AI',
    'Social media content',
    ARRAY['runway','canva-ai'],
    false, 67
  ),
  (
    'Music Video: Pika + Flux',
    'pika-flux-music-video',
    'Generate stylized images with Flux, animate them into video sequences with Pika',
    'Music video',
    ARRAY['flux','pika'],
    false, 54
  ),
  (
    'Documentary Style: Veo 2 + Adobe Firefly',
    'veo2-firefly-documentary',
    'Create documentary b-roll with Veo 2, design graphics and titles with Adobe Firefly',
    'Documentary',
    ARRAY['veo-2','adobe-firefly'],
    true, 89
  ),
  (
    'Concept Teaser: Midjourney + Hailuo',
    'midjourney-hailuo-teaser',
    'Design striking concept frames in Midjourney, bring them to life with Hailuo video',
    'Concept teaser',
    ARRAY['midjourney','hailuo'],
    false, 41
  )
ON CONFLICT (slug) DO NOTHING;

-- Grant access
GRANT SELECT ON dim_combo TO anon;
