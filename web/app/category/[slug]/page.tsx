import { supabase, LeaderboardRow, CategoryRow } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const revalidate = 300

export async function generateStaticParams() {
  const { data } = await supabase.from('dim_category').select('slug')
  return (data ?? []).map((c) => ({ slug: c.slug }))
}

async function getCategoryData(slug: string): Promise<{
  category: CategoryRow
  rows: LeaderboardRow[]
} | null> {
  const { data: category } = await supabase
    .from('dim_category')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) return null

  const { data: rows } = await supabase
    .from('v_category_leaderboard')
    .select('*')
    .eq('category_slug', slug)
    .order('composite_score', { ascending: false })
    .limit(20)

  return { category, rows: (rows ?? []) as LeaderboardRow[] }
}

const WEIGHT_LABELS: Record<string, { label: string; pct: string; color: string }[]> = {
  'general-chat': [
    { label: 'Trend',     pct: '50%', color: 'var(--accent-gold)' },
    { label: 'Mentions',  pct: '20%', color: '#f97316' },
    { label: 'News',      pct: '20%', color: 'var(--accent-red)' },
    { label: 'Sentiment', pct: '10%', color: 'var(--accent-teal)' },
  ],
  'coding': [
    { label: 'HN Mentions', pct: '50%', color: '#f97316' },
    { label: 'Trend',       pct: '25%', color: 'var(--accent-gold)' },
    { label: 'News',        pct: '15%', color: 'var(--accent-red)' },
    { label: 'Sentiment',   pct: '10%', color: 'var(--accent-teal)' },
  ],
  'web-search': [
    { label: 'Trend',       pct: '60%', color: 'var(--accent-gold)' },
    { label: 'News',        pct: '25%', color: 'var(--accent-red)' },
    { label: 'HN Mentions', pct: '15%', color: '#f97316' },
  ],
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const result = await getCategoryData(params.slug)
  if (!result) notFound()

  const { category, rows } = result
  const today = rows[0]?.date
    ? format(new Date(rows[0].date), 'MMMM d, yyyy')
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const weights = WEIGHT_LABELS[params.slug] ?? WEIGHT_LABELS['general-chat']

  return (
    <div>
      <a href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem',
      }}>
        ← All Categories
      </a>

      <section className="text-center mb-14">
        <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="live-pulse" />
          <span>{category.icon} {category.name}</span>
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
            <div key={w.label} className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}>
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

      {rows.length === 0 ? (
        <div className="table-wrap p-16 text-center font-mono text-sm"
          style={{ color: 'var(--text-muted)' }}>
          No data yet — run the ingestion pipeline first.
        </div>
      ) : (
        <LeaderboardTable rows={rows} />
      )}
    </div>
  )
}
