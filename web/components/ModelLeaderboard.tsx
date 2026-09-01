'use client'

import { ModelLeaderboardRow } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const COMPANY_COLORS: Record<string, string> = {
  openai:    '#10a37f',
  anthropic: '#d4845a',
  google:    '#4285f4',
  meta:      '#0668e1',
  mistral:   '#ff6900',
  deepseek:  '#4d9fff',
  xai:       '#ededed',
}

function fmtPrice(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n === 0) return 'free'
  return n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(3)}`
}

function fmtCtx(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function useCounter(target: number | null, duration = 800) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (target === null || target === undefined || started.current) return
    started.current = true
    const finalTarget: number = target
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(finalTarget * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
}

function BrainIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 2C4 2 3 3 3 4.2c-.9.3-1.5 1-1.5 1.9 0 1.1.9 2 2 2 .3.7 1 1.2 2 1.2s1.7-.5 2-1.2c1.1 0 2-.9 2-2 0-.9-.6-1.6-1.5-1.9C8 3 7 2 5.5 2z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M5.5 2v7.3" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M4 3L1.5 5.5 4 8M7 3l2.5 2.5L7 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ContextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="1" y="2" width="9" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 5h5M3 7h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function PriceIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 2.5v6M3.5 4c0-.8.9-1.5 2-1.5s2 .7 2 1.5-2 1.5-2 1.5-2 .7-2 1.5.9 1.5 2 1.5 2-.7 2-1.5"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

function TrendUpIcon({ positive }: { positive: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      {positive
        ? <path d="M1 7L4 4l2 2 3-4M8 2h2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M1 3L4 6l2-2 3 4M8 8h2v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  )
}

function ModelRow({ row, rank, delay }: { row: ModelLeaderboardRow; rank: number; delay: string }) {
  const router   = useRouter()
  const color    = COMPANY_COLORS[row.company_slug] ?? '#888'
  const initials = row.model_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const hnCount  = useCounter(row.hn_mention_count)

  return (
    <div
      className="rank-row cursor-pointer"
      style={{ animationDelay: delay }}
      onClick={() => router.push(`/company/${row.company_slug}`)}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 1fr',
        gap: '1rem', padding: '14px 20px', alignItems: 'center',
      }}>
        {/* Rank */}
        <span className={`font-mono font-semibold ${rank <= 3 ? (rank===1?'rank-gold':rank===2?'rank-silver':'rank-bronze') : 'rank-normal'}`}
          style={{ fontSize: rank <= 3 ? '1.25rem' : '1rem', textAlign: 'right' }}>
          {rank}
        </span>

        {/* Left: model info + facts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="tool-icon-wrap" style={{
              position: 'relative', width: 36, height: 36, borderRadius: 8,
              background: color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-mono)',
              fontWeight: 700, fontSize: '0.7rem', color: 'white', flexShrink: 0,
              boxShadow: `0 0 16px ${color}44`,
            }}>
              {initials}
              <div style={{
                position: 'absolute', top: 2, left: 4, right: 4, height: '30%',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px 4px 50% 50%',
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {row.model_name}
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {row.company_name}
                {row.is_open_source && (
                  <span style={{ marginLeft: 6, color: 'var(--accent-teal)', fontSize: '0.65rem' }}>
                    OPEN WEIGHTS
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { icon: <BrainIcon />,   color: 'var(--accent-gold)', val: row.aa_intelligence_index?.toFixed(1) ?? '—', label: 'AA intelligence index' },
              { icon: <CodeIcon />,    color: 'var(--accent-teal)', val: row.aa_coding_index?.toFixed(1) ?? '—',       label: 'AA coding index' },
              { icon: <ContextIcon />, color: '#8ba5b8',            val: fmtCtx(row.context_window),                   label: 'Context window' },
              { icon: <PriceIcon />,   color: 'var(--accent-red)',  val: `${fmtPrice(row.price_out_per_mtok)}/M`,      label: 'Output price per million tokens' },
            ].map((item, i) => (
              <div key={i} title={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: item.color }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: attention signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TREND</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
              {row.google_trend_score?.toFixed(0) ?? '—'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>HN</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#f97316' }}>
              {row.hn_mention_count !== null ? hnCount.toLocaleString() : '—'}
            </span>
          </div>
          {row.average_sentiment_score !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendUpIcon positive={(row.average_sentiment_score ?? 0) >= 0} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: (row.average_sentiment_score ?? 0) >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
              }}>
                {(row.average_sentiment_score ?? 0) >= 0 ? '+' : ''}
                {(row.average_sentiment_score ?? 0).toFixed(2)}
              </span>
            </div>
          )}
          {row.buzz_tool_slug === null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              no attention series
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ModelLeaderboard({ rows }: { rows: ModelLeaderboardRow[] }) {
  const [sortBy, setSortBy] = useState<'intelligence' | 'coding' | 'agentic' | 'context' | 'price' | 'trend'>('intelligence')

  const sorted = [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'intelligence': return (b.aa_intelligence_index ?? -1) - (a.aa_intelligence_index ?? -1)
      case 'coding':       return (b.aa_coding_index ?? -1)       - (a.aa_coding_index ?? -1)
      case 'agentic':      return (b.aa_agentic_index ?? -1)      - (a.aa_agentic_index ?? -1)
      case 'context':      return (b.context_window ?? 0)         - (a.context_window ?? 0)
      // Unpriced models sort last rather than masquerading as free.
      case 'price':        return (a.price_out_per_mtok ?? Infinity) - (b.price_out_per_mtok ?? Infinity)
      case 'trend':        return (b.google_trend_score ?? -1)    - (a.google_trend_score ?? -1)
      default:             return 0
    }
  })

  const SORTS = [
    { key: 'intelligence' as const, label: 'Intelligence' },
    { key: 'coding'       as const, label: 'Coding' },
    { key: 'agentic'      as const, label: 'Agentic' },
    { key: 'trend'        as const, label: 'Attention' },
    { key: 'context'      as const, label: 'Context' },
    { key: 'price'        as const, label: 'Cheapest' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)} style={{
            padding: '5px 12px', borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            border: '1px solid',
            borderColor: sortBy === s.key ? 'var(--accent-gold)' : 'var(--border-subtle)',
            background: sortBy === s.key ? 'rgba(255,183,3,0.1)' : 'transparent',
            color: sortBy === s.key ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {rows.length} models
        </span>
      </div>

      <div className="table-wrap">
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 1fr',
          gap: '1rem', padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
        }}>
          <span style={{ textAlign: 'right' }}>#</span>
          <span>Model · Capability · Price</span>
          <span style={{ textAlign: 'right' }}>Trend · HN · Sentiment</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No model data in this snapshot — run <code>python -m pipeline.run_all</code>.
          </div>
        ) : (
          sorted.map((row, i) => (
            <ModelRow key={row.model_id} row={row} rank={i + 1} delay={`${0.6 + i * 0.08}s`} />
          ))
        )}
      </div>

      <p style={{
        marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        Capability indices from{' '}
        <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--accent-teal)' }}>Artificial Analysis</a>
        , pricing and context from{' '}
        <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--accent-teal)' }}>OpenRouter</a>
        . Trend and HN columns are measured by this project.
      </p>
    </div>
  )
}
