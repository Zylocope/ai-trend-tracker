import { supabase, LeaderboardRow, CategoryRow } from '@/lib/supabase'
import CategoryTabs from '@/components/CategoryTabs'
import { format } from 'date-fns'

export const revalidate = 300

async function getCategories(): Promise<CategoryRow[]> {
  const { data } = await supabase
    .from('dim_category')
    .select('*')
    .order('category_id')
  return (data ?? []) as CategoryRow[]
}

async function getAllRows(): Promise<LeaderboardRow[]> {
  const { data } = await supabase
    .from('v_category_leaderboard')
    .select('*')
    .order('composite_score', { ascending: false })
  return (data ?? []) as LeaderboardRow[]
}

export default async function HomePage() {
  const [categories, allRows] = await Promise.all([getCategories(), getAllRows()])

  const today = allRows[0]?.date
    ? format(new Date(allRows[0].date), 'MMMM d, yyyy')
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="text-center mb-14">
        <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="live-pulse" />
          <span>Live Rankings</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{today}</span>
        </div>

        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Which AI tool is{' '}
          <span className="hero-highlight">winning</span>
          <br />the internet?
        </h1>

        <p className="fade-up mx-auto max-w-xl text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
          Daily composite rankings from Google Trends, HackerNews and NewsAPI.
          Each category uses its own weighted formula.
          No sponsorships. No paid rankings.
        </p>
      </section>

      {/* ── Category tabs + leaderboard ─────────────── */}
      <CategoryTabs categories={categories} allRows={allRows} />

      {/* ── Methodology ──────────────────────────────── */}
      <div className="fade-up mt-16 pt-10 border-t" style={{ borderColor: 'var(--border-subtle)', animationDelay: '1.2s' }}>
        <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
          How it works
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Every day at 06:00 UTC an automated pipeline fetches Google Trends interest scores,
          counts HackerNews posts, and pulls news headlines. Text is run through a sentiment model (−1 to +1).
          Each category applies its own weighting — coding tools are scored heavily on HackerNews activity
          because that's where developers discuss them, while search tools are weighted toward trend data.
        </p>
      </div>
    </div>
  )
}
