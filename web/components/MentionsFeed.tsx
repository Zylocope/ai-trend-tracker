'use client'

import { MentionRow } from '@/lib/supabase'
import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface Props { mentions: MentionRow[] }

type Filter = 'all' | 'hackernews' | 'news'

// SVG icons
function HNIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="0.5" y="0.5" width="12" height="12" rx="2" fill="#f97316" />
      <text x="6.5" y="9.5" textAnchor="middle" fill="white"
        style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700 }}>
        Y
      </text>
    </svg>
  )
}

function NewsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="0.5" y="0.5" width="12" height="12" rx="2" stroke="var(--border-medium)" fill="var(--bg-elevated)"/>
      <path d="M2.5 4h8M2.5 6.5h5M2.5 9h6.5" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M4.5 2H2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6.5 1H10v3.5M10 1L5.5 5.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function sentimentColor(s: number | null): string {
  if (s === null) return 'var(--text-muted)'
  if (s > 0.1)   return 'var(--accent-teal)'
  if (s < -0.1)  return 'var(--accent-red)'
  return 'var(--text-secondary)'
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'hackernews', label: 'HackerNews' },
  { key: 'news',       label: 'News' },
]

export default function MentionsFeed({ mentions }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all'
    ? mentions
    : mentions.filter(m => m.source === filter || (filter === 'hackernews' && m.source === 'hackernews'))

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              border: '1px solid',
              borderColor: filter === f.key ? 'var(--accent-gold)' : 'var(--border-subtle)',
              background: filter === f.key ? 'rgba(255,183,3,0.1)' : 'transparent',
              color: filter === f.key ? 'var(--accent-gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
        }}>
          {visible.length} results
        </span>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.length === 0 && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
          }}>
            No mentions yet.
          </div>
        )}

        {visible.map(m => {
          const isHN  = m.source === 'hackernews'
          const domain = m.url ? (() => { try { return new URL(m.url!).hostname } catch { return '' } })() : ''

          return (
            <a
              key={m.id}
              href={m.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textDecoration: 'none',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,183,3,0.3)'
                ;(e.currentTarget as HTMLElement).style.background  = 'var(--bg-elevated)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'
                ;(e.currentTarget as HTMLElement).style.background  = 'var(--bg-surface)'
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <p style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  fontWeight: 500,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {m.title || '(no title)'}
                </p>
                {m.sentiment !== null && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: sentimentColor(m.sentiment),
                    whiteSpace: 'nowrap',
                    marginTop: 2,
                    flexShrink: 0,
                  }}>
                    {m.sentiment >= 0 ? '+' : ''}{m.sentiment.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Body snippet */}
              {m.body && (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.775rem',
                  lineHeight: 1.5,
                  marginBottom: 8,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {m.body}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Source badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  background: isHN ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.05)',
                  color: isHN ? '#f97316' : 'var(--text-secondary)',
                  border: `1px solid ${isHN ? 'rgba(249,115,22,0.25)' : 'var(--border-subtle)'}`,
                }}>
                  {isHN ? <HNIcon /> : <NewsIcon />}
                  {isHN ? 'HackerNews' : 'News'}
                </span>

                {/* Time */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(parseISO(m.fetched_at), { addSuffix: true })}
                </span>

                {/* Domain */}
                {domain && (
                  <span style={{
                    marginLeft: 'auto',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    maxWidth: 160,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    <ExternalLinkIcon />
                    {domain}
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
