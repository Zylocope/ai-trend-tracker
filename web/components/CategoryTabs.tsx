'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryRow, LeaderboardRow } from '@/lib/supabase'
import LeaderboardTable from './LeaderboardTable'

interface Props {
  categories: CategoryRow[]
  allRows:    LeaderboardRow[]
}

export default function CategoryTabs({ categories, allRows }: Props) {
  const router = useRouter()
  const [active, setActive] = useState<string>(categories[0]?.slug ?? '')

  const filtered = allRows
    .filter(r => r.category_slug === active)
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, 10)

  return (
    <div className="fade-up" style={{ animationDelay: '0.5s' }}>
      {/* ── Tab bar ─────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background:  active === cat.slug ? 'var(--accent-gold)'      : 'var(--bg-elevated)',
              color:       active === cat.slug ? 'var(--bg-deepest)'       : 'var(--text-secondary)',
              border:      active === cat.slug ? '1px solid transparent'   : '1px solid var(--border-subtle)',
              fontFamily:  'var(--font-body)',
              cursor:      'pointer',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}

        {/* Link to full category page */}
        <a
          href={`/category/${active}`}
          className="ml-auto font-mono text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          View full rankings ↗
        </a>
      </div>

      {/* ── Leaderboard ──────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="table-wrap p-16 text-center font-mono text-sm"
          style={{ color: 'var(--text-muted)' }}>
          No data yet for this category — run the ingestion pipeline first.
        </div>
      ) : (
        <LeaderboardTable rows={filtered} />
      )}
    </div>
  )
}
