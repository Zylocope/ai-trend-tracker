"""
Static reference data - the former dim_* seed tables.

These never came from an API; they were hand-maintained SQL seeds. Keeping them
as plain Python makes them reviewable in a diff instead of hidden in a migration
that has to be replayed against a live database.
"""

CATEGORIES = [
    {"category_id": 1, "name": "General Chat",      "slug": "general-chat",      "icon": "message", "description": "General-purpose AI assistants and chatbots",        "weights": {"trend": 0.50, "mentions": 0.20, "news": 0.20, "sentiment": 0.10}},
    {"category_id": 2, "name": "Coding",            "slug": "coding",            "icon": "code",    "description": "AI coding assistants and developer tools",          "weights": {"trend": 0.25, "mentions": 0.50, "news": 0.15, "sentiment": 0.10}},
    {"category_id": 3, "name": "Web Search",        "slug": "web-search",        "icon": "search",  "description": "AI-powered search and research tools",              "weights": {"trend": 0.60, "mentions": 0.15, "news": 0.25, "sentiment": 0.00}},
    {"category_id": 4, "name": "Vibe Coding",       "slug": "vibe-coding",       "icon": "code",    "description": "AI-powered IDEs and no-code/low-code environments", "weights": {"trend": 0.30, "mentions": 0.50, "news": 0.15, "sentiment": 0.05}},
    {"category_id": 5, "name": "Image Generation",  "slug": "image-generation",  "icon": "image",   "description": "AI tools for generating and editing images",        "weights": {"trend": 0.50, "mentions": 0.25, "news": 0.15, "sentiment": 0.10}},
    {"category_id": 6, "name": "Video Generation",  "slug": "video-generation",  "icon": "video",   "description": "AI tools for generating and editing video",         "weights": {"trend": 0.50, "mentions": 0.20, "news": 0.20, "sentiment": 0.10}},
    {"category_id": 7, "name": "Short Film Combos", "slug": "short-film-combos", "icon": "film",    "description": "Multi-tool AI workflows for short film creation",   "weights": {"trend": 0.40, "mentions": 0.35, "news": 0.15, "sentiment": 0.10}},
]

# keywords[0] is the Google Trends term; the whole list is used for HN/news search.
_T = [
    # (name, slug, company, release_date, category_slug, pricing_tier, keywords)
    ("ChatGPT",            "chatgpt",          "OpenAI",        "2022-11-30", "general-chat",     "freemium", ["ChatGPT", "OpenAI chatbot"]),
    ("Claude",             "claude",           "Anthropic",     "2023-03-14", "general-chat",     "freemium", ["Claude AI", "Anthropic Claude"]),
    ("Gemini",             "gemini",           "Google",        "2023-12-06", "general-chat",     "freemium", ["Google Gemini", "Gemini AI"]),
    ("Grok",               "grok",             "xAI",           "2023-11-04", "general-chat",     "freemium", ["Grok AI", "xAI Grok"]),
    ("DeepSeek",           "deepseek",         "DeepSeek AI",   "2023-11-02", "general-chat",     "free",     ["DeepSeek AI", "DeepSeek chat"]),
    ("GitHub Copilot",     "github-copilot",   "Microsoft",     "2021-06-29", "coding",           "paid",     ["GitHub Copilot", "Copilot coding"]),
    ("Codeium",            "codeium",          "Codeium",       "2022-12-01", "coding",           "freemium", ["Codeium AI", "Codeium autocomplete"]),
    ("Perplexity",         "perplexity",       "Perplexity AI", "2022-08-01", "web-search",       "freemium", ["Perplexity AI", "Perplexity search"]),
    ("You.com",            "youcom",           "You.com",       "2021-11-09", "web-search",       "freemium", ["You.com AI search", "YouChat"]),
    ("Phind",              "phind",            "Phind",         "2022-09-01", "web-search",       "freemium", ["Phind AI search", "Phind developer search"]),
    ("Cursor",             "cursor",           "Anysphere",     "2023-03-14", "vibe-coding",      "freemium", ["Cursor AI editor", "Cursor IDE"]),
    ("Windsurf",           "windsurf",         "Codeium",       "2024-11-13", "vibe-coding",      "freemium", ["Windsurf IDE", "Codeium Windsurf"]),
    ("Replit AI",          "replit-ai",        "Replit",        "2023-04-01", "vibe-coding",      "freemium", ["Replit AI", "Replit Ghostwriter"]),
    ("Lovable",            "lovable",          "Lovable",       "2024-01-01", "vibe-coding",      "paid",     ["Lovable AI", "Lovable app builder"]),
    ("Bolt.new",           "bolt-new",         "StackBlitz",    "2024-10-01", "vibe-coding",      "freemium", ["Bolt.new", "StackBlitz AI"]),
    ("v0 by Vercel",       "v0-vercel",        "Vercel",        "2023-11-01", "vibe-coding",      "freemium", ["v0 Vercel", "v0.dev"]),
    ("Cline",              "cline",            "Cline",         "2024-06-01", "vibe-coding",      "free",     ["Cline AI", "Cline VSCode"]),
    ("Aider",              "aider",            "Aider",         "2023-06-01", "vibe-coding",      "free",     ["Aider AI", "Aider coding"]),
    ("Zed Editor",         "zed-editor",       "Zed",           "2024-01-01", "vibe-coding",      "free",     ["Zed editor", "Zed AI editor"]),
    ("Midjourney",         "midjourney",       "Midjourney",    "2022-07-12", "image-generation", "paid",     ["Midjourney AI", "Midjourney image"]),
    ("DALL-E 3",           "dalle-3",          "OpenAI",        "2023-10-01", "image-generation", "paid",     ["DALL-E 3", "OpenAI image generation"]),
    ("Stable Diffusion",   "stable-diffusion", "Stability AI",  "2022-08-22", "image-generation", "free",     ["Stable Diffusion", "Stability AI"]),
    ("Flux AI",            "flux",             "Black Forest",  "2024-08-01", "image-generation", "freemium", ["Flux AI", "FLUX.1"]),
    ("Adobe Firefly",      "adobe-firefly",    "Adobe",         "2023-03-21", "image-generation", "paid",     ["Adobe Firefly", "Firefly AI"]),
    ("Leonardo AI",        "leonardo-ai",      "Leonardo AI",   "2022-12-01", "image-generation", "freemium", ["Leonardo AI", "Leonardo image"]),
    ("Ideogram",           "ideogram",         "Ideogram",      "2023-08-01", "image-generation", "freemium", ["Ideogram AI", "Ideogram image"]),
    ("Canva AI",           "canva-ai",         "Canva",         "2023-03-01", "image-generation", "freemium", ["Canva AI", "Canva Magic"]),
    ("Sora",               "sora",             "OpenAI",        "2024-12-09", "video-generation", "paid",     ["Sora OpenAI", "Sora video AI"]),
    ("Runway Gen-2",       "runway",           "Runway",        "2023-02-06", "video-generation", "freemium", ["Runway AI", "Runway Gen-2"]),
    ("Kling AI",           "kling",            "Kuaishou",      "2024-06-06", "video-generation", "freemium", ["Kling AI", "Kling video"]),
    ("Pika Labs",          "pika",             "Pika",          "2023-11-27", "video-generation", "freemium", ["Pika Labs", "Pika AI video"]),
    ("Veo 2",              "veo-2",            "Google",        "2024-12-16", "video-generation", "paid",     ["Veo 2", "Google Veo"]),
    ("Hailuo AI",          "hailuo",           "MiniMax",       "2024-08-01", "video-generation", "freemium", ["Hailuo AI", "MiniMax video"]),
    ("Luma Dream Machine", "luma",             "Luma AI",       "2024-06-12", "video-generation", "freemium", ["Luma Dream Machine", "Luma AI video"]),
]

_CAT_ID = {c["slug"]: c["category_id"] for c in CATEGORIES}

TOOLS = [
    {
        "tool_id": i + 1, "tool_name": n, "slug": s, "company": co,
        "release_date": rd, "category_slug": cs, "category_id": _CAT_ID[cs],
        "pricing_tier": pt, "keywords": kw,
    }
    for i, (n, s, co, rd, cs, pt, kw) in enumerate(_T)
]

COMPANIES = [
    {"company_id": 1, "name": "OpenAI",     "slug": "openai",    "founded_year": 2015, "hq": "San Francisco, CA", "description": "AI research company and maker of GPT models"},
    {"company_id": 2, "name": "Anthropic",  "slug": "anthropic", "founded_year": 2021, "hq": "San Francisco, CA", "description": "AI safety company and maker of Claude"},
    {"company_id": 3, "name": "Google",     "slug": "google",    "founded_year": 1998, "hq": "Mountain View, CA", "description": "Technology company and maker of Gemini"},
    {"company_id": 4, "name": "Meta",       "slug": "meta",      "founded_year": 2004, "hq": "Menlo Park, CA",    "description": "Social technology company, open-weights AI"},
    {"company_id": 5, "name": "Mistral AI", "slug": "mistral",   "founded_year": 2023, "hq": "Paris, France",     "description": "European AI company focused on efficient models"},
    {"company_id": 6, "name": "DeepSeek",   "slug": "deepseek",  "founded_year": 2023, "hq": "Hangzhou, China",   "description": "Chinese AI lab focused on efficient reasoning"},
    {"company_id": 7, "name": "xAI",        "slug": "xai",       "founded_year": 2023, "hq": "San Francisco, CA", "description": "AI company founded by Elon Musk, maker of Grok"},
]

# Only identity lives here. Every price / context / benchmark number is fetched
# from OpenRouter at build time - see pipeline/fetch_models.py.
MODELS = [
    {"model_id": 1,  "company_slug": "openai",    "name": "GPT-5.6 Sol",       "slug": "gpt-56-sol",       "openrouter_id": "openai/gpt-5.6-sol",           "is_open_source": False},
    {"model_id": 2,  "company_slug": "openai",    "name": "GPT-5.5",           "slug": "gpt-55",           "openrouter_id": "openai/gpt-5.5",               "is_open_source": False},
    {"model_id": 3,  "company_slug": "anthropic", "name": "Claude Opus 5",     "slug": "claude-opus-5",    "openrouter_id": "anthropic/claude-opus-5",      "is_open_source": False},
    {"model_id": 4,  "company_slug": "anthropic", "name": "Claude Fable 5",    "slug": "claude-fable-5",   "openrouter_id": "anthropic/claude-fable-5",     "is_open_source": False},
    {"model_id": 5,  "company_slug": "anthropic", "name": "Claude Sonnet 5",   "slug": "claude-sonnet-5",  "openrouter_id": "anthropic/claude-sonnet-5",    "is_open_source": False},
    {"model_id": 6,  "company_slug": "google",    "name": "Gemini 3.7 Flash",  "slug": "gemini-37-flash",  "openrouter_id": "google/gemini-3.7-flash",      "is_open_source": False},
    {"model_id": 7,  "company_slug": "meta",      "name": "Muse Spark 1.2",    "slug": "muse-spark-12",    "openrouter_id": "meta/muse-spark-1.2",          "is_open_source": True},
    {"model_id": 8,  "company_slug": "mistral",   "name": "Mistral Large 3",   "slug": "mistral-large-3",  "openrouter_id": "mistralai/mistral-large-2512", "is_open_source": False},
    {"model_id": 9,  "company_slug": "deepseek",  "name": "DeepSeek V4 Pro",   "slug": "deepseek-v4-pro",  "openrouter_id": "deepseek/deepseek-v4-pro-0813","is_open_source": True},
    {"model_id": 10, "company_slug": "xai",       "name": "Grok 4.6",          "slug": "grok-46",          "openrouter_id": "x-ai/grok-4.6",                "is_open_source": False},
]

# Editorial workflow recipes. Hand-written, not measured - the UI labels them so.
COMBOS = [
    {"combo_id": 1, "name": "Cinematic Short: Sora + Runway",      "slug": "sora-runway-cinematic",    "use_case": "Cinematic short film",  "tool_slugs": ["sora", "runway"],         "description": "Generate cinematic plates with Sora, then extend and grade shots in Runway"},
    {"combo_id": 2, "name": "Animated Story: Kling + Leonardo AI", "slug": "kling-leonardo-animated",  "use_case": "Animated storytelling", "tool_slugs": ["leonardo-ai", "kling"],   "description": "Create concept art in Leonardo AI, animate the frames with Kling"},
    {"combo_id": 3, "name": "Social Video: Runway + Canva AI",     "slug": "runway-canva-social",      "use_case": "Social media content",  "tool_slugs": ["runway", "canva-ai"],     "description": "Generate video clips with Runway, assemble and brand in Canva AI"},
    {"combo_id": 4, "name": "Music Video: Pika + Flux",            "slug": "pika-flux-music-video",    "use_case": "Music video",           "tool_slugs": ["flux", "pika"],           "description": "Generate stylized frames with Flux, animate into sequences with Pika"},
    {"combo_id": 5, "name": "Documentary: Veo 2 + Firefly",        "slug": "veo2-firefly-documentary", "use_case": "Documentary",           "tool_slugs": ["veo-2", "adobe-firefly"], "description": "Create documentary b-roll with Veo 2, design graphics with Adobe Firefly"},
    {"combo_id": 6, "name": "Concept Teaser: Midjourney + Hailuo", "slug": "midjourney-hailuo-teaser", "use_case": "Concept teaser",        "tool_slugs": ["midjourney", "hailuo"],   "description": "Design concept frames in Midjourney, bring them to life with Hailuo"},
]
