'use client'

import { LeaderboardRow } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props { rows: LeaderboardRow[] }

type Tier = 'free' | 'paid' | 'freemium'

// Since pricing_tier isn't in the leaderboard view yet,
// we maintain a local map of known tiers
const PRICING: Record<string, { tier: Tier; price?: string }> = {
  'cursor-ide':          { tier: 'freemium', price: 'Free / $20 mo' },
  'lovable':             { tier: 'paid',     price: 'From $25/mo' },
  'windsurf-ide':        { tier: 'freemium', price: 'Free / $15/mo' },
  'replit-ai':           { tier: 'freemium', price: 'Free / $25/mo' },
  'bolt-new':            { tier: 'freemium', price: 'Free / $20/mo' },
  'v0':                  { tier: 'freemium', price: 'Free / $20/mo' },
  'copilot-workspace':   { tier: 'paid',     price: '$19/mo' },
  'cline':               { tier: 'free',     price: 'Free' },
  'aider':               { tier: 'free',     price: 'Free' },
  'zed-editor':          { tier: 'free',     price: 'Free' },
}

const TOOL_COLORS: Record<string, string> = {
  'cursor-ide':        '#f0f0f0',
  'lovable':           '#ff6b9d',
  'windsurf-ide':      '#06d6a0',
  'replit-ai':         '#f5821f',
  'bolt-new':          '#7c3aed',
  'v0':                '#ffffff',
  'copilot-workspace': '#238636',
  'cline':             '#4d9fff',
  'aider':             '#e8a230',
  'zed-editor':        '#fd9353',
}

type Tab = 'all' | 'free' | 'paid'

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'all',  label: 'All',  desc: 'All vibe coding tools' },
  { key: 'free', label: 'Free', desc: 'Free and freemium tools' },
  { key: 'paid', label: 'Paid', desc: 'Paid-only tools' },
]

function TierBadge({ slug }: { slug: string }) {
  const info = PRICING[slug]
  if (!info) return null
  const colors: Record<Tier, { bg: string; text: string; border: string }> = {
    free:     { bg: 'rgba(6,214,160,0.1)',  text: 'var(--accent-teal)', border: 'rgba(6,214,160,0.25)' },
    freemium: { bg: 'rgba(232,162,48,0.1)', text: 'var(--accent-gold)', border: 'rgba(232,162,48,0.25)' },
    paid:     { bg: 'rgba(239,71,111,0.1)', text: 'var(--accent-red)',  border: 'rgba(239,71,111,0.25)' },
  }
  const c = colors[info.tier]
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4,
      fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {info.tier}
    </span>
  )
}

export default function VibeCodingTable({ rows }: Props) {
  const [tab, setTab] = useState<Tab>('all')
  const router = useRouter()

  const filtered = rows.filter(row => {
    const info = PRICING[row.slug]
    if (!info) return tab === 'all'
    if (tab === 'all') return true
    if (tab === 'free') return info.tier === 'free' || info.tier === 'freemium'
    if (tab === 'paid') return info.tier === 'paid' || info.tier === 'freemium'
    return true
  })

  return (
    <div className="fade-up" style={{ animationDelay: '0.5s' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 20px', borderRadius: 999,
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
              border: '1px solid',
              borderColor:  tab === t.key ? 'transparent'        : 'var(--border-subtle)',
              background:   tab === t.key ? 'var(--accent-gold)' : 'var(--bg-elevated)',
              color:        tab === t.key ? 'var(--bg-deepest)'  : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: tab === t.key ? '0 2px 12px rgba(255,183,3,0.3)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {filtered.length} tools
        </span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 80px 90px 90px 120px',
          gap: '1rem', padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
        }}>
          <span style={{ textAlign: 'right' }}>#</span>
          <span>Tool</span>
          <span style={{ textAlign: 'right' }}>Tier</span>
          <span style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>Trend</span>
          <span style={{ textAlign: 'right' }}>HN</span>
          <span>Sentiment</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No data yet for this filter.
          </div>
        ) : (
          filtered.map((row, i) => {
            const color   = TOOL_COLORS[row.slug] ?? '#888'
            const initial = row.tool_name[0].toUpperCase()
            const pricing = PRICING[row.slug]
            const sent    = row.average_sentiment_score

            return (
              <div
                key={row.tool_id}
                className="rank-row cursor-pointer"
                style={{ animationDelay: `${0.7 + i * 0.07}s` }}
                onClick={() => router.push(`/${row.slug}`)}
              >
                <div style={{
                  display: 'grid', gridTemplateColumns: '44px 1fr 80px 90px 90px 120px',
                  gap: '1rem', padding: '14px 20px', alignItems: 'center',
                }}>
                  {/* Rank */}
                  <span className={`font-mono font-semibold ${i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':'rank-normal'}`}
                    style={{ fontSize: i < 3 ? '1.2rem' : '1rem', textAlign: 'right' }}>
                    {i + 1}
                  </span>

                  {/* Tool */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="tool-icon-wrap" style={{
                      position: 'relative', width: 36, height: 36, borderRadius: 8,
                      background: color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontFamily: 'var(--font-mono)',
                      fontWeight: 700, fontSize: '0.85rem',
                      color: color === '#ffffff' || color === '#f0f0f0' ? '#111' : 'white',
                      flexShrink: 0, boxShadow: `0 0 12px ${color}44`,
                    }}>
                      {initial}
                      <div style={{
                        position: 'absolute', top: 2, left: 4, right: 4, height: '30%',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px 4px 50% 50%',
                      }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {row.tool_name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {pricing?.price ?? '—'}
                      </div>
                    </div>
                  </div>

                  {/* Tier badge */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <TierBadge slug={row.slug} />
                  </div>

                  {/* Trend */}
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {row.google_trend_score?.toFixed(0) ?? '—'}
                  </div>

                  {/* HN */}
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#f97316' }}>
                    {row.reddit_mention_count?.toLocaleString() ?? '—'}
                  </div>

                  {/* Sentiment bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      {sent !== null && (
                        <div style={{
                          height: '100%',
                          width: `${Math.abs(sent) * 100}%`,
                          background: (sent ?? 0) >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
                          borderRadius: 2,
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                      color: (sent ?? 0) >= 0 ? 'var(--accent-teal)' : 'var(--accent-red)',
                      minWidth: 40, textAlign: 'right',
                    }}>
                      {sent !== null ? `${sent >= 0 ? '+' : ''}${sent.toFixed(2)}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
