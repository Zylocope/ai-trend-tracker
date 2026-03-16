import { supabase, MetricRow, ToolRow, MentionRow } from '@/lib/supabase'
import SentimentChart from '@/components/SentimentChart'
import MentionsFeed from '@/components/MentionsFeed'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const revalidate = 300

const TOOL_COLORS: Record<string, string> = {
  chatgpt:       '#10a37f',
  claude:        '#d4845a',
  gemini:        '#4285f4',
  copilot:       '#00a4ef',
  perplexity:    '#6366f1',
  cursor:        '#f0f0f0',
  'github-copilot': '#238636',
  windsurf:      '#06d6a0',
  replit:        '#f5821f',
  codeium:       '#09b6a2',
  grok:          '#ffffff',
  deepseek:      '#4d9fff',
  youcom:        '#ff6b35',
  andi:          '#7c5cbf',
  phind:         '#ff4d4d',
}

async function getToolData(slug: string): Promise<{ tool: ToolRow; metrics: MetricRow[] } | null> {
  const { data: tool } = await supabase
    .from('dim_tool')
    .select('tool_id, tool_name, slug, company, release_date, category_slug:dim_category(slug)')
    .eq('slug', slug)
    .single()

  if (!tool) return null

  const { data: metrics } = await supabase
    .from('fact_daily_metrics')
    .select('date, google_trend_score, reddit_mention_count, news_mention_count, average_sentiment_score')
    .eq('tool_id', (tool as any).tool_id)
    .order('date', { ascending: true })
    .limit(90)

  return { tool: tool as any, metrics: (metrics ?? []) as MetricRow[] }
}

async function getRecentMentions(slug: string): Promise<MentionRow[]> {
  const { data: tool } = await supabase
    .from('dim_tool')
    .select('tool_id')
    .eq('slug', slug)
    .single()

  if (!tool) return []

  const { data } = await supabase
    .from('raw_mentions')
    .select('id, fetched_at, source, title, body, url, sentiment')
    .eq('tool_id', (tool as any).tool_id)
    .order('fetched_at', { ascending: false })
    .limit(40)

  return (data ?? []) as MentionRow[]
}

// SVG icons for stats
function TrendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1,12 5,7 9,9 15,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="11,3 15,3 15,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function SentimentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 9.5c0 0 1 2 3 2s3-2 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor"/>
      <circle cx="10.5" cy="6.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}

function MentionsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3.5h12M2 7.5h8M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default async function ToolPage({ params }: { params: { tool: string } }) {
  const result   = await getToolData(params.tool)
  if (!result) notFound()

  const { tool, metrics } = result
  const mentions          = await getRecentMentions(params.tool)
  const color             = TOOL_COLORS[params.tool] ?? '#888888'

  const latest    = metrics.at(-1)
  const prev      = metrics.at(-2)
  const trendDelta = latest && prev
    ? (latest.google_trend_score ?? 0) - (prev.google_trend_score ?? 0)
    : null

  const initials = tool.tool_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* ── Back ─────────────────────────────────────── */}
      <a href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2.5rem',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Rankings
      </a>

      {/* ── Tool header ──────────────────────────────── */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12"
        style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-5">
          {/* Brand icon */}
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-lg shrink-0"
            style={{
              background: color,
              boxShadow: `0 0 32px ${color}55, 0 4px 16px rgba(0,0,0,0.4)`,
              fontFamily: 'var(--font-mono)',
            }}>
            {initials}
            {/* Inner highlight — skeuomorphic gloss */}
            <div style={{
              position: 'absolute', top: 4, left: 6, right: 6, height: '35%',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '8px 8px 50% 50%',
              pointerEvents: 'none',
            }} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1"
              style={{ color: 'var(--text-muted)' }}>
              {tool.company}
            </p>
            <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {tool.tool_name}
            </h1>
            {tool.release_date && (
              <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Released {format(new Date(tool.release_date), 'MMMM yyyy')}
              </p>
            )}
          </div>
        </div>

        {/* Today's key stats */}
        {latest && (
          <div className="flex gap-6 shrink-0">
            {/* Trend */}
            <div className="p-4 rounded-xl border" style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)',
              minWidth: 100, textAlign: 'right',
            }}>
              <div className="flex items-center justify-end gap-1.5 mb-1"
                style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <TrendIcon />
                Trend
              </div>
              <div className="font-mono text-2xl font-semibold" style={{ color: 'var(--accent-gold)' }}>
                {latest.google_trend_score?.toFixed(0) ?? '—'}
              </div>
              {trendDelta !== null && (
                <div className="font-mono text-xs mt-0.5"
                  style={{ color: trendDelta >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)' }}>
                  {trendDelta >= 0 ? '+' : ''}{trendDelta.toFixed(1)} vs prev
                </div>
              )}
            </div>

            {/* Sentiment */}
            <div className="p-4 rounded-xl border" style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)',
              minWidth: 100, textAlign: 'right',
            }}>
              <div className="flex items-center justify-end gap-1.5 mb-1"
                style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <SentimentIcon />
                Sentiment
              </div>
              <div className="font-mono text-2xl font-semibold" style={{
                color: (latest.average_sentiment_score ?? 0) >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
              }}>
                {latest.average_sentiment_score !== null
                  ? `${latest.average_sentiment_score >= 0 ? '+' : ''}${latest.average_sentiment_score.toFixed(2)}`
                  : '—'}
              </div>
            </div>

            {/* Mentions */}
            <div className="p-4 rounded-xl border" style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)',
              minWidth: 100, textAlign: 'right',
            }}>
              <div className="flex items-center justify-end gap-1.5 mb-1"
                style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <MentionsIcon />
                Mentions
              </div>
              <div className="font-mono text-2xl font-semibold" style={{ color: '#f97316' }}>
                {((latest.reddit_mention_count ?? 0) + (latest.news_mention_count ?? 0)).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ───────────────────────────────────── */}
      <div className="fade-up mb-12" style={{ animationDelay: '0.3s' }}>
        {metrics.length > 1 ? (
          <SentimentChart metrics={metrics} color={color} />
        ) : (
          <div className="table-wrap p-12 text-center font-mono text-sm"
            style={{ color: 'var(--text-muted)' }}>
            Not enough history yet — check back after a few ingestion runs.
          </div>
        )}
      </div>

      {/* ── Mentions feed ────────────────────────────── */}
      <div className="fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            Latest mentions
          </h2>
          <span className="font-mono text-xs px-2 py-1 rounded"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            {mentions.length}
          </span>
        </div>
        <MentionsFeed mentions={mentions} />
      </div>
    </div>
  )
}
