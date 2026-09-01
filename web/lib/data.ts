/**
 * Data access for the site.
 *
 * There is no database. The pipeline commits data/snapshot.json daily and this
 * module imports it directly, so every page is statically rendered at build
 * time and every number on the site traces back to the commit named in
 * `meta.commit`.
 */
import snapshot from '../../data/snapshot.json'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SnapshotMeta {
  generated_at: string
  commit:       string | null
  sources:      { name: string; url: string; rows: number; ok: boolean }[]
  notes:        Record<string, string>
}

export interface CategoryRow {
  category_id: number
  name:        string
  slug:        string
  description: string
  icon:        string
  weights:     { trend: number; mentions: number; news: number; sentiment: number }
}

export interface CompanyRow {
  company_id:   number
  name:         string
  slug:         string
  founded_year: number | null
  hq:           string | null
  description:  string | null
}

export interface ToolRow {
  tool_id:       number
  tool_name:     string
  slug:          string
  company:       string
  release_date:  string
  category_id:   number
  category_slug: string
  pricing_tier:  string
  keywords:      string[]
}

export interface LeaderboardRow {
  tool_id:                 number
  tool_name:               string
  slug:                    string
  company:                 string
  pricing_tier:            string
  category_id:             number
  category_name:           string
  category_slug:           string
  category_icon:           string
  date:                    string | null
  google_trend_score:      number | null
  reddit_mention_count:    number | null
  news_mention_count:      number | null
  average_sentiment_score: number | null
  composite_score:         number | null
}

export interface ModelLeaderboardRow {
  model_id:               number
  model_name:             string
  model_slug:             string
  context_window:         number | null
  price_in_per_mtok:      number | null
  price_out_per_mtok:     number | null
  arena_elo:              number | null
  arena_label:            string | null
  aa_intelligence_index:  number | null
  aa_coding_index:        number | null
  aa_agentic_index:       number | null
  is_open_source:         boolean
  listed_on_openrouter:   boolean
  source_url:             string | null
  capability_source:      string | null
  company_id:             number
  company_name:           string
  company_slug:           string
  buzz_tool_slug:         string | null
  date:                   string | null
  google_trend_score:     number | null
  hn_mention_count:       number | null
  news_mention_count:     number | null
  average_sentiment_score: number | null
  attention_percentile:   number | null
  capability_percentile:  number | null
  hype_gap:               number | null
}

export interface MetricRow {
  date:                    string
  tool_id:                 number
  google_trend_score:      number | null
  reddit_mention_count:    number | null
  news_mention_count:      number | null
  average_sentiment_score: number | null
}

export interface MentionRow {
  date:      string
  tool_id:   number
  source:    string
  title:     string
  body:      string | null
  url:       string | null
  sentiment: number | null
}

export interface ComboRow {
  combo_id:    number
  name:        string
  slug:        string
  description: string
  use_case:    string
  tool_slugs:  string[]
}

// ── Relations ──────────────────────────────────────────────────────────────

const snap = snapshot as unknown as {
  meta: SnapshotMeta
  dim_category: CategoryRow[]
  dim_tool: ToolRow[]
  dim_company: CompanyRow[]
  dim_combo: ComboRow[]
  dim_model: unknown[]
  fact_daily_metrics: MetricRow[]
  raw_mentions: MentionRow[]
  v_category_leaderboard: LeaderboardRow[]
  v_model_leaderboard: ModelLeaderboardRow[]
  v_leaderboard: LeaderboardRow[]
}

export const meta       = snap.meta
export const categories = snap.dim_category
export const tools      = snap.dim_tool
export const companies  = snap.dim_company
export const combos     = snap.dim_combo

/** Short SHA for the provenance footer, or null when built outside a git checkout. */
export const commitShort = snap.meta.commit ? snap.meta.commit.slice(0, 7) : null

// ── Queries ────────────────────────────────────────────────────────────────

export function getModelLeaderboard(): ModelLeaderboardRow[] {
  return snap.v_model_leaderboard
}

export function getLeaderboard(): LeaderboardRow[] {
  return snap.v_leaderboard
}

export function getCategoryLeaderboard(categorySlug?: string): LeaderboardRow[] {
  const rows = snap.v_category_leaderboard
  return categorySlug ? rows.filter(r => r.category_slug === categorySlug) : rows
}

export function getCategory(slug: string): CategoryRow | null {
  return categories.find(c => c.slug === slug) ?? null
}

export function getCompany(slug: string): CompanyRow | null {
  return companies.find(c => c.slug === slug) ?? null
}

export function getCompanyModels(slug: string): ModelLeaderboardRow[] {
  return snap.v_model_leaderboard.filter(m => m.company_slug === slug)
}

export function getTool(slug: string): ToolRow | null {
  return tools.find(t => t.slug === slug) ?? null
}

/** Metric history for one tool, oldest first. */
export function getToolMetrics(slug: string, days = 30): MetricRow[] {
  const tool = getTool(slug)
  if (!tool) return []
  return snap.fact_daily_metrics
    .filter(m => m.tool_id === tool.tool_id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days)
}

/** Most recent mentions for one tool, newest first. */
export function getToolMentions(slug: string, limit = 40): MentionRow[] {
  const tool = getTool(slug)
  if (!tool) return []
  return snap.raw_mentions
    .filter(m => m.tool_id === tool.tool_id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function getCombos(): ComboRow[] {
  return combos
}

/**
 * Models whose attention rank most exceeds their capability rank, and vice
 * versa. Only models with both halves measured can appear.
 */
export function getHypeGap(): { overhyped: ModelLeaderboardRow[]; underrated: ModelLeaderboardRow[] } {
  const scored = snap.v_model_leaderboard
    .filter(m => m.hype_gap !== null)
    .sort((a, b) => (b.hype_gap as number) - (a.hype_gap as number))

  return {
    overhyped:  scored.filter(m => (m.hype_gap as number) > 0),
    underrated: scored.filter(m => (m.hype_gap as number) < 0).reverse(),
  }
}
