'use client'

import { LeaderboardRow } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Per-tool brand colours
const TOOL_COLORS: Record<string, string> = {
  chatgpt:    '#10a37f',
  claude:     '#d4845a',
  gemini:     '#4285f4',
  copilot:    '#00a4ef',
  perplexity: '#6366f1',
}

const TOOL_INITIALS: Record<string, string> = {
  chatgpt:    'C',
  claude:     'Cl',
  gemini:     'G',
  copilot:    'Co',
  perplexity: 'P',
}

// Animate a number counter from 0 → target
function animateCounter(el: HTMLElement, target: number, duration = 900) {
  const startTime = performance.now()
  function tick(now: number) {
    const progress  = Math.min((now - startTime) / duration, 1)
    const eased     = 1 - Math.pow(1 - progress, 3)
    el.textContent  = Math.floor(target * eased).toLocaleString()
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// Generate random sparkline heights
function sparkline(seed: number): number[] {
  const rng = (n: number) => ((Math.sin(seed * n * 9301 + 49297) + 1) / 2)
  return Array.from({ length: 12 }, (_, i) => 10 + rng(i + 1) * 22)
}

function RankNumber({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-normal'
  return (
    <span className={`font-mono font-semibold ${cls}`} style={{ fontSize: rank <= 3 ? undefined : '1.1rem' }}>
      {rank}
    </span>
  )
}

function SentimentBar({ value }: { value: number | null }) {
  const v   = value ?? 0
  // map -1..+1 → 10%..90% position
  const pct = Math.round(50 + v * 40)
  const color = v > 0.05 ? 'var(--accent-teal)' : v < -0.05 ? 'var(--accent-red)' : '#888'
  return (
    <div className="flex items-center gap-2">
      <div className="sentiment-track flex-1" style={{ minWidth: 60 }}>
        <div className="sentiment-marker" style={{ left: `${pct}%`, background: color }} />
      </div>
      <span className="font-mono text-xs" style={{ color, minWidth: 44, textAlign: 'right' }}>
        {value !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}` : '—'}
      </span>
    </div>
  )
}

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const router    = useRouter()
  const bodyRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bodyRef.current) return
    // Start counter animations after rows have slid in (~1.7 s)
    const timer = setTimeout(() => {
      bodyRef.current?.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
        setTimeout(() => animateCounter(el, Number(el.dataset.count)), i * 80)
      })
    }, 900)
    return () => clearTimeout(timer)
  }, [rows])

  return (
    <div className="table-wrap fade-up" style={{ animationDelay: '0.6s' }}>
      {/* ── Column header ─────────────────────────────── */}
      <div
        className="hidden sm:grid font-mono text-xs uppercase tracking-widest px-6 py-3 border-b"
        style={{
          gridTemplateColumns: '60px 1fr 90px 90px 110px 150px',
          gap: '1rem',
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <span>#</span>
        <span>AI Tool</span>
        <span style={{ color: 'var(--accent-gold)' }}>Trend</span>
        <span>HN Mentions</span>
        <span>News</span>
        <span>Sentiment</span>
      </div>

      {/* ── Rows ─────────────────────────────────────── */}
      <div ref={bodyRef}>
        {rows.map((row, i) => {
          const color   = TOOL_COLORS[row.slug] ?? '#666'
          const initial = TOOL_INITIALS[row.slug] ?? row.tool_name[0]
          const sparks  = sparkline(row.tool_id)
          const maxS    = Math.max(...sparks)
          const delay   = `${0.7 + i * 0.1}s`

          return (
            <div
              key={row.tool_id}
              className="rank-row cursor-pointer"
              style={{ animationDelay: delay }}
              onClick={() => router.push(`/${row.slug}`)}
            >
              {/* Mobile layout */}
              <div className="flex sm:hidden items-center gap-3 px-4 py-4">
                <RankNumber rank={i + 1} />
                <div className="tool-icon-wrap relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ background: color }}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{row.tool_name}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{row.company}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg" style={{ color: 'var(--accent-gold)' }}>
                    <span data-count={row.google_trend_score?.toFixed(0) ?? 0}>0</span>
                  </div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>trend</div>
                </div>
              </div>

              {/* Desktop layout */}
              <div
                className="hidden sm:grid items-center px-6 py-5"
                style={{ gridTemplateColumns: '60px 1fr 90px 90px 110px 150px', gap: '1rem' }}
              >
                {/* Rank */}
                <RankNumber rank={i + 1} />

                {/* Tool info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="tool-icon-wrap relative w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                    style={{ background: color, fontSize: '1rem' }}>
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {row.tool_name}
                    </div>
                    <div className="font-mono text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {row.company}
                    </div>
                  </div>
                </div>

                {/* Trend */}
                <span className="font-mono text-base font-medium" style={{ color: 'var(--accent-gold)' }}>
                  <span data-count={row.google_trend_score?.toFixed(0) ?? 0}>0</span>
                </span>

                {/* HN Mentions */}
                <span className="font-mono text-sm" style={{ color: '#f97316' }}>
                  <span data-count={row.reddit_mention_count ?? 0}>0</span>
                </span>

                {/* News sparkline */}
                <div className="flex items-end gap-0.5" style={{ height: 30 }}>
                  {sparks.map((h, si) => (
                    <div
                      key={si}
                      className="spark-bar"
                      style={{
                        height: `${(h / maxS) * 100}%`,
                        animationDelay: `${1.7 + si * 0.05}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Sentiment */}
                <SentimentBar value={row.average_sentiment_score} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
