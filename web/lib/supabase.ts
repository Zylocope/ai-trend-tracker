import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-key'
)

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CategoryRow {
  category_id:  number
  name:         string
  slug:         string
  description:  string
  icon:         string
}

export interface CompanyRow {
  company_id:        number
  name:              string
  slug:              string
  founded_year:      number | null
  hq:                string | null
  total_funding_usd: number | null
  description:       string | null
}

export interface ModelRow {
  model_id:         number
  company_id:       number
  name:             string
  slug:             string
  release_date:     string | null
  context_window:   number | null
  speed_tps:        number | null
  latency_ms:       number | null
  providers:        string[] | null
  is_open_source:   boolean
}

export interface ModelLeaderboardRow {
  model_id:                number
  model_name:              string
  model_slug:              string
  context_window:          number | null
  speed_tps:               number | null
  latency_ms:              number | null
  providers:               string[] | null
  is_open_source:          boolean
  company_id:              number
  company_name:            string
  company_slug:            string
  total_funding_usd:       number | null
  date:                    string | null
  google_trend_score:      number | null
  hn_mention_count:        number | null
  news_mention_count:      number | null
  average_sentiment_score: number | null
}

export interface LeaderboardRow {
  tool_id:                 number
  tool_name:               string
  slug:                    string
  company:                 string
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

export interface MetricRow {
  date:                    string
  google_trend_score:      number | null
  reddit_mention_count:    number | null
  news_mention_count:      number | null
  average_sentiment_score: number | null
}

export interface MentionRow {
  id:         number
  fetched_at: string
  source:     string
  title:      string
  body:       string | null
  url:        string | null
  sentiment:  number | null
}

export interface ToolRow {
  tool_id:       number
  tool_name:     string
  slug:          string
  company:       string
  release_date:  string
  category_slug: string
}
