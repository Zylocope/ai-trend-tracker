'use client'

import { useState } from 'react'
import { CategoryRow, LeaderboardRow } from '@/lib/supabase'
import LeaderboardTable from './LeaderboardTable'

interface Props {
  categories: CategoryRow[]
  allRows:    LeaderboardRow[]
}

function CategoryIcon({ slug, active }: { slug: string; active: boolean }) {
  const color = active ? 'var(--bg-deepest)' : 'var(--text-secondary)'
  if (slug === 'general-chat') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 2.5a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H8l-2.5 2V9.5H2.5a1 1 0 01-1-1v-6z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M4 5.5h6M4 7.5h4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'coding') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 4L2 7l3 3M9 4l3 3-3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2.5l-2 9" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'web-search') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke={color} strokeWidth="1.3"/>
      <path d="M9 9.5l2.5 2.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'vibe-coding') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M1 5h12" stroke={color} strokeWidth="1.3"/>
      <path d="M5 8l-2 1.5L5 11M9 8l2 1.5L9 11" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'image-generation') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <circle cx="4.5" cy="5.5" r="1.2" stroke={color} strokeWidth="1.1"/>
      <path d="M1 10l4-4 2.5 2.5 2-2 4.5 3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'video-generation') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="9" height="8" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M10 5.5l3-1.5v6l-3-1.5V5.5z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'short-film-combos') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M1 5h12M4 2v3M7 2v3M10 2v3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  return null
}

export default function CategoryTabs({ categories, allRows }: Props) {
  const [active, setActive] = useState<string>(categories[0]?.slug ?? '')

  const filtered = allRows
    .filter(r => r.category_slug === active)
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, 10)

  return (
    <div className="fade-up" style={{ animationDelay: '0.5s' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const isActive = active === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => setActive(cat.slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 999,
                fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                border: '1px solid',
                borderColor:  isActive ? 'transparent'        : 'var(--border-subtle)',
                background:   isActive ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                color:        isActive ? 'var(--bg-deepest)'  : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 12px rgba(255,183,3,0.3)' : 'none',
              }}
            >
              <CategoryIcon slug={cat.slug} active={isActive} />
              {cat.name}
            </button>
          )
        })}

        {/* ── FIXED: /categories/ not /category/ ── */}
        <a
          href={`/categories/${active}`}
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--text-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          className="nav-link"
        >
          View full rankings
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* Leaderboard */}
      {filtered.length === 0 ? (
        <div className="table-wrap" style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          No data yet for this category.
        </div>
      ) : (
        <LeaderboardTable rows={filtered} />
      )}
    </div>
  )
}
