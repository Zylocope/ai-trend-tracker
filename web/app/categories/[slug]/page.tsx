import { categories, getCategory, getCategoryLeaderboard, getCombos, meta } from '@/lib/data'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import VibeCodingTable from '@/components/VibeCodingTable'
import CombosTable from '@/components/CombosTable'
import LeaderboardTable from '@/components/LeaderboardTable'

export function generateStaticParams() {
  return categories.map(c => ({ slug: c.slug }))
}

const WEIGHT_LABELS: Record<string, { label: string; pct: string; color: string }[]> = {
  'general-chat':    [
    { label: 'Trend', pct: '50%', color: 'var(--accent-gold)' },
    { label: 'Mentions', pct: '20%', color: '#f97316' },
    { label: 'News', pct: '20%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
  'coding':          [
    { label: 'HN Mentions', pct: '50%', color: '#f97316' },
    { label: 'Trend', pct: '25%', color: 'var(--accent-gold)' },
    { label: 'News', pct: '15%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
  'web-search':      [
    { label: 'Trend', pct: '60%', color: 'var(--accent-gold)' },
    { label: 'News', pct: '25%', color: 'var(--accent-red)' },
    { label: 'HN Mentions', pct: '15%', color: '#f97316' },
  ],
  'vibe-coding':     [
    { label: 'HN Mentions', pct: '50%', color: '#f97316' },
    { label: 'Trend', pct: '30%', color: 'var(--accent-gold)' },
    { label: 'News', pct: '15%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '5%', color: 'var(--accent-teal)' },
  ],
  'image-generation':[
    { label: 'Trend', pct: '50%', color: 'var(--accent-gold)' },
    { label: 'HN Mentions', pct: '25%', color: '#f97316' },
    { label: 'News', pct: '15%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
  'video-generation':[
    { label: 'Trend', pct: '50%', color: 'var(--accent-gold)' },
    { label: 'HN Mentions', pct: '20%', color: '#f97316' },
    { label: 'News', pct: '20%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
  'short-film-combos':[
    { label: 'Trend', pct: '40%', color: 'var(--accent-gold)' },
    { label: 'HN Mentions', pct: '35%', color: '#f97316' },
    { label: 'News', pct: '15%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
}

function CategorySVGIcon({ slug }: { slug: string }) {
  const s = 'var(--text-secondary)'
  if (slug === 'vibe-coding') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={s} strokeWidth="1.3"/>
      <path d="M1 5h12" stroke={s} strokeWidth="1.3"/>
      <path d="M5 8l-2 1.5L5 11M9 8l2 1.5L9 11" stroke={s} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'image-generation') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={s} strokeWidth="1.3"/>
      <circle cx="4.5" cy="5.5" r="1.2" stroke={s} strokeWidth="1.1"/>
      <path d="M1 10l4-4 2.5 2.5 2-2 4.5 3.5" stroke={s} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'video-generation') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="9" height="8" rx="1.5" stroke={s} strokeWidth="1.3"/>
      <path d="M10 5.5l3-1.5v6l-3-1.5V5.5z" stroke={s} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'web-search') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke={s} strokeWidth="1.3"/>
      <path d="M9 9.5l3 3" stroke={s} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'short-film-combos') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke={s} strokeWidth="1.3"/>
      <path d="M1 5h12M4 2v3M7 2v3M10 2v3" stroke={s} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  return null
}

export default function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = getCategory(params.slug)
  if (!category) notFound()

  const today = new Date(meta.generated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const weights = WEIGHT_LABELS[params.slug] ?? WEIGHT_LABELS['general-chat']

  // For combos page, load combo data
  if (params.slug === 'short-film-combos') {
    const combos = getCombos()

    return (
      <div>
        <BackLink />
        <CategoryHero category={category} today={today} weights={weights} slug={params.slug} />
        <CombosTable combos={combos} />
      </div>
    )
  }

  // For vibe-coding, pass pricing tier filter to client component
  if (params.slug === 'vibe-coding') {
    const rows = getCategoryLeaderboard(params.slug)

    return (
      <div>
        <BackLink />
        <CategoryHero category={category} today={today} weights={weights} slug={params.slug} />
        <VibeCodingTable rows={rows} />
      </div>
    )
  }

  // Standard category page
  const rows = getCategoryLeaderboard(params.slug).slice(0, 20)

  return (
    <div>
      <BackLink />
      <CategoryHero category={category} today={today} weights={weights} slug={params.slug} />
      {rows.length === 0 ? (
        <div className="table-wrap p-16 text-center font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          No data in this snapshot yet — run the ingestion pipeline.
        </div>
      ) : (
        <LeaderboardTable rows={rows} />
      )}
    </div>
  )
}

function BackLink() {
  return (
    <a href="/categories" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
      color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem',
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      All Categories
    </a>
  )
}

function CategoryHero({ category, today, weights, slug }: {
  category: any; today: string; weights: any[]; slug: string
}) {
  return (
    <section className="text-center mb-14">
      <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                      font-mono text-xs uppercase tracking-widest"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <span className="live-pulse" />
        <CategorySVGIcon slug={slug} />
        <span>{category.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>—</span>
        <span>{today}</span>
      </div>

      <h1 className="hero-title mb-4 fade-up" style={{ animationDelay: '0.1s' }}>
        Best <span className="hero-highlight">{category.name}</span>
        <br />AI tools right now
      </h1>

      <p className="fade-up max-w-lg mx-auto text-sm leading-relaxed mb-8"
        style={{ color: 'var(--text-secondary)', animationDelay: '0.25s' }}>
        {category.description}. Ranked by a custom weighted formula.
      </p>

      <div className="fade-up flex flex-wrap justify-center gap-5" style={{ animationDelay: '0.4s' }}>
        {weights.map(w => (
          <div key={w.label} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="legend-dot shrink-0" style={{ background: w.color }} />
            <span>{w.label}</span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: w.color }}>
              {w.pct}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
