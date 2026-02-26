'use client'

import { LeaderboardRow } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

const TOOL_ICONS: Record<string, string> = {
  chatgpt:    '🟢',
  gemini:     '🔵',
  claude:     '🟠',
  copilot:    '🟣',
  perplexity: '⚫',
}

function SentimentBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted font-mono text-xs">—</span>
  const pct = Math.abs(value) * 100
  const pos  = value >= 0
  return (
    <div className="flex items-center gap-2">
      <div className="sentiment-bar w-16">
        <div
          className={clsx('h-full rounded-sm transition-all', pos ? 'sentiment-fill-pos' : 'sentiment-fill-neg')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={clsx('font-mono text-xs', pos ? 'text-lime' : 'text-rose')}>
        {pos ? '+' : ''}{value.toFixed(2)}
      </span>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className={clsx('font-mono text-lg font-medium w-7 inline-block text-right',
      rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'text-muted'
    )}>
      {rank}
    </span>
  )
}

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const router = useRouter()

  return (
    <div className="border border-edge rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2rem_1fr_4rem_5rem_5rem_6rem] gap-3 items-center
                      px-5 py-3 border-b border-edge bg-card
                      text-muted text-xs font-mono uppercase tracking-widest">
        <span>#</span>
        <span>Tool</span>
        <span className="text-right">Trend</span>
        <span className="text-right">Reddit</span>
        <span className="text-right">News</span>
        <span className="text-right pr-1">Sentiment</span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.tool_id}
          onClick={() => router.push(`/${row.slug}`)}
          className={clsx(
            'grid grid-cols-[2rem_1fr_4rem_5rem_5rem_6rem] gap-3 items-center',
            'px-5 py-4 cursor-pointer transition-colors hover:bg-card group',
            i < rows.length - 1 && 'border-b border-edge',
            i === 0 && 'bg-card/40'
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <RankBadge rank={i + 1} />

          {/* Tool name */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">{TOOL_ICONS[row.slug] ?? '⚪'}</span>
            <div className="min-w-0">
              <div className="font-medium text-bright group-hover:text-amber transition-colors truncate">
                {row.tool_name}
              </div>
              <div className="text-muted text-xs font-mono truncate">{row.company}</div>
            </div>
          </div>

          {/* Google Trend */}
          <div className="text-right">
            {row.google_trend_score !== null ? (
              <span className="font-mono text-sm text-bright">
                {row.google_trend_score.toFixed(0)}
              </span>
            ) : (
              <span className="text-muted font-mono text-xs">—</span>
            )}
          </div>

          {/* Reddit */}
          <div className="text-right">
            <span className="font-mono text-sm text-ice">
              {row.reddit_mention_count?.toLocaleString() ?? '—'}
            </span>
          </div>

          {/* News */}
          <div className="text-right">
            <span className="font-mono text-sm text-soft">
              {row.news_mention_count?.toLocaleString() ?? '—'}
            </span>
          </div>

          {/* Sentiment */}
          <div className="flex justify-end">
            <SentimentBar value={row.average_sentiment_score} />
          </div>
        </div>
      ))}
    </div>
  )
}
