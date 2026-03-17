'use client'

import { ModelLeaderboardRow } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

// Company brand colors
const COMPANY_COLORS: Record<string, string> = {
  openai:    '#10a37f',
  anthropic: '#d4845a',
  google:    '#4285f4',
  meta:      '#0668e1',
  mistral:   '#ff6900',
  deepseek:  '#4d9fff',
  xai:       '#ededed',
}

// Format large numbers
function fmt(n: number | null, decimals = 0): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(0)}M`
  return n.toFixed(decimals)
}

function fmtCtx(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// Animated counter
function useCounter(target: number | null, duration = 800) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (target === null || started.current) return
    started.current = true
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return val
}

// SVG icons
function SpeedIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 8.5C1 5.46 3.46 3 6.5 3s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6.5 8.5L8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="6.5" cy="8.5" r="0.8" fill="currentColor"/>
    </svg>
  )
}

function LatencyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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

function FundingIcon() {
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

function ProviderBadge({ name }: { name: string }) {
  const colors: Record<string, string> = {
    AWS:   '#ff9900', Azure: '#0089d6', GCP: '#4285f4',
  }
  const color = colors[name] ?? 'var(--text-muted)'
  return (
    <span style={{
      padding: '1px 6px',
      borderRadius: 3,
      fontSize: '0.65rem',
      fontFamily: 'var(--font-mono)',
      border: `1px solid ${color}44`,
      color,
      background: `${color}11`,
      whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  )
}

function ModelRow({ row, rank, delay }: { row: ModelLeaderboardRow; rank: number; delay: string }) {
  const router  = useRouter()
  const color   = COMPANY_COLORS[row.company_slug] ?? '#888'
  const initials = row.model_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const hnCount = useCounter(row.hn_mention_count)

  return (
    <div
      className="rank-row cursor-pointer"
      style={{ animationDelay: delay }}
      onClick={() => router.push(`/company/${row.company_slug}`)}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 1fr',
        gap: '1rem',
        padding: '14px 20px',
        alignItems: 'center',
      }}>

        {/* ── Rank ─────────────────────────────────── */}
        <span className={`font-mono font-semibold ${rank <= 3 ? (rank===1?'rank-gold':rank===2?'rank-silver':'rank-bronze') : 'rank-normal'}`}
          style={{ fontSize: rank <= 3 ? '1.25rem' : '1rem', textAlign: 'right' }}>
          {rank}
        </span>

        {/* ── LEFT: Model info + tech specs ────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Model name + company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="tool-icon-wrap" style={{
              position: 'relative',
              width: 36, height: 36,
              borderRadius: 8,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: 'white',
              flexShrink: 0,
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
                    OPEN SOURCE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tech specs row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--accent-gold)' }}><SpeedIcon /></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {row.speed_tps ? `${row.speed_tps.toFixed(0)} t/s` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--accent-teal)' }}><LatencyIcon /></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {row.latency_ms ? `${row.latency_ms.toFixed(0)}ms` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#8ba5b8' }}><ContextIcon /></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {fmtCtx(row.context_window)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--accent-red)' }}><FundingIcon /></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {fmt(row.total_funding_usd)}
              </span>
            </div>
          </div>

          {/* Providers */}
          {row.providers && row.providers.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {row.providers.map(p => <ProviderBadge key={p} name={p} />)}
            </div>
          )}
        </div>

        {/* ── RIGHT: Buzz signals ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {/* Trend score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              TREND
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
              {row.google_trend_score?.toFixed(0) ?? '—'}
            </span>
          </div>

          {/* HN mentions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              HN
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#f97316' }}>
              {row.hn_mention_count !== null ? hnCount.toLocaleString() : '—'}
            </span>
          </div>

          {/* Sentiment */}
          {row.average_sentiment_score !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendUpIcon positive={(row.average_sentiment_score ?? 0) >= 0} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: (row.average_sentiment_score ?? 0) >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
              }}>
                {row.average_sentiment_score >= 0 ? '+' : ''}
                {row.average_sentiment_score.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ModelLeaderboard({ rows }: { rows: ModelLeaderboardRow[] }) {
  const [sortBy, setSortBy] = useState<'speed' | 'latency' | 'context' | 'funding' | 'trend'>('trend')

  const sorted = [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'speed':   return (b.speed_tps ?? 0)         - (a.speed_tps ?? 0)
      case 'latency': return (a.latency_ms ?? 9999)      - (b.latency_ms ?? 9999)
      case 'context': return (b.context_window ?? 0)     - (a.context_window ?? 0)
      case 'funding': return (b.total_funding_usd ?? 0)  - (a.total_funding_usd ?? 0)
      case 'trend':   return (b.google_trend_score ?? 0) - (a.google_trend_score ?? 0)
      default:        return 0
    }
  })

  const SORTS: { key: typeof sortBy; label: string }[] = [
    { key: 'trend',   label: 'By Trend' },
    { key: 'speed',   label: 'By Speed' },
    { key: 'latency', label: 'By Latency' },
    { key: 'context', label: 'By Context' },
    { key: 'funding', label: 'By Funding' },
  ]

  return (
    <div>
      {/* Sort controls */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)} style={{
            padding: '5px 12px',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            border: '1px solid',
            borderColor: sortBy === s.key ? 'var(--accent-gold)' : 'var(--border-subtle)',
            background: sortBy === s.key ? 'rgba(255,183,3,0.1)' : 'transparent',
            color: sortBy === s.key ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {s.label}
          </button>
        ))}

        <span style={{
          marginLeft: 'auto',
          alignSelf: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
        }}>
          {rows.length} models
        </span>
      </div>

      {/* Column headers */}
      <div className="table-wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 1fr',
          gap: '1rem',
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}>
          <span style={{ textAlign: 'right' }}>#</span>
          <span>Model · Specs</span>
          <span style={{ textAlign: 'right' }}>Trend · HN · Sentiment</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No model data yet — run the pipeline first.
          </div>
        ) : (
          sorted.map((row, i) => (
            <ModelRow
              key={row.model_id}
              row={row}
              rank={i + 1}
              delay={`${0.6 + i * 0.08}s`}
            />
          ))
        )}
      </div>
    </div>
  )
}
