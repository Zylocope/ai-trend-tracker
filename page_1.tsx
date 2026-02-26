import { supabase, MetricRow, ToolRow, MentionRow } from '@/lib/supabase'
import SentimentChart from '@/components/SentimentChart'
import MentionsFeed from '@/components/MentionsFeed'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const revalidate = 300

async function getToolData(slug: string): Promise<{ tool: ToolRow; metrics: MetricRow[] } | null> {
  const { data: tool } = await supabase
    .from('dim_tool')
    .select('tool_id, tool_name, slug, company, release_date')
    .eq('slug', slug)
    .single()

  if (!tool) return null

  const { data: metrics } = await supabase
    .from('fact_daily_metrics')
    .select('date, google_trend_score, reddit_mention_count, news_mention_count, average_sentiment_score')
    .eq('tool_id', tool.tool_id)
    .order('date', { ascending: true })
    .limit(90)

  return { tool: tool as ToolRow, metrics: (metrics ?? []) as MetricRow[] }
}

async function getRecentMentions(slug: string): Promise<MentionRow[]> {
  const { data: tool } = await supabase.from('dim_tool').select('tool_id').eq('slug', slug).single()
  if (!tool) return []

  const { data } = await supabase
    .from('raw_mentions')
    .select('id, fetched_at, source, title, body, url, sentiment')
    .eq('tool_id', tool.tool_id)
    .order('fetched_at', { ascending: false })
    .limit(30)

  return (data ?? []) as MentionRow[]
}

export default async function ToolPage({ params }: { params: { tool: string } }) {
  const result   = await getToolData(params.tool)
  if (!result) notFound()

  const { tool, metrics } = result
  const mentions          = await getRecentMentions(params.tool)

  const latest = metrics.at(-1)
  const prev   = metrics.at(-2)
  const trendDelta = latest && prev
    ? (latest.google_trend_score ?? 0) - (prev.google_trend_score ?? 0)
    : null

  return (
    <div className="animate-fade-up">
      {/* ── Back + header ─────────────────────────────── */}
      <a href="/" className="inline-flex items-center gap-1.5 text-muted hover:text-bright
                              text-xs font-mono mb-8 transition-colors">
        ← Rankings
      </a>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
            {tool.company}
          </p>
          <h1 className="font-display text-4xl text-bright">{tool.tool_name}</h1>
          {tool.release_date && (
            <p className="text-muted text-xs font-mono mt-1">
              Released {format(new Date(tool.release_date), 'MMMM yyyy')}
            </p>
          )}
        </div>

        {/* Today's stats */}
        {latest && (
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-muted text-xs font-mono uppercase tracking-widest mb-0.5">Trend</p>
              <p className="font-mono text-2xl text-amber">{latest.google_trend_score?.toFixed(0) ?? '—'}</p>
              {trendDelta !== null && (
                <p className={`font-mono text-xs ${trendDelta >= 0 ? 'text-lime' : 'text-rose'}`}>
                  {trendDelta >= 0 ? '▲' : '▼'} {Math.abs(trendDelta).toFixed(1)} vs yesterday
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-muted text-xs font-mono uppercase tracking-widest mb-0.5">Sentiment</p>
              <p className={`font-mono text-2xl ${(latest.average_sentiment_score ?? 0) >= 0 ? 'text-lime' : 'text-rose'}`}>
                {latest.average_sentiment_score !== null
                  ? `${(latest.average_sentiment_score >= 0 ? '+' : '')}${latest.average_sentiment_score.toFixed(2)}`
                  : '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ────────────────────────────────────── */}
      {metrics.length > 1 ? (
        <SentimentChart metrics={metrics} />
      ) : (
        <div className="border border-edge rounded-lg p-8 text-center text-muted text-sm font-mono mb-8">
          Not enough history yet — check back after a few days of ingestion runs.
        </div>
      )}

      {/* ── Mentions feed ─────────────────────────────── */}
      <div className="mt-10">
        <h2 className="font-display text-2xl text-bright mb-5">Latest mentions</h2>
        <MentionsFeed mentions={mentions} />
      </div>
    </div>
  )
}
