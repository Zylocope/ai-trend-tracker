import { supabase, ModelLeaderboardRow, CategoryRow } from '@/lib/supabase'
import ModelLeaderboard from '@/components/ModelLeaderboard'
import CategoryTabs from '@/components/CategoryTabs'
import { format } from 'date-fns'

export const revalidate = 300

async function getModelRows(): Promise<ModelLeaderboardRow[]> {
  const { data, error } = await supabase
    .from('v_model_leaderboard')
    .select('*')
    .order('company_name')
  if (error) { console.error(error); return [] }
  return data as ModelLeaderboardRow[]
}

async function getCategories(): Promise<CategoryRow[]> {
  const { data } = await supabase
    .from('dim_category')
    .select('*')
    .order('category_id')
  return (data ?? []) as CategoryRow[]
}

export default async function HomePage() {
  const [models, categories] = await Promise.all([getModelRows(), getCategories()])

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="text-center mb-14">
        <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                        font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="live-pulse" />
          <span>Live Intelligence</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{today}</span>
        </div>

        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Which AI model is{' '}
          <span className="hero-highlight">worth your attention</span>?
        </h1>

        <p className="fade-up mx-auto max-w-xl text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
          Real specs alongside real buzz — speed, latency, context window and funding
          combined with daily trend signals and mentions.
        </p>
      </section>

      {/* ── Model table ──────────────────────────────── */}
      <div className="fade-up mb-16" style={{ animationDelay: '0.5s' }}>
        <ModelLeaderboard rows={models} />
      </div>

      {/* ── Divider ──────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
        <span className="font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}>
          Popularity by category
        </span>
        <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
      </div>

      {/* ── Category tabs (buzz leaderboard) ─────────── */}
      <CategoryTabsWrapper categories={categories} />
    </div>
  )
}

// Server-side category tab data loader
async function CategoryTabsWrapper({ categories }: { categories: CategoryRow[] }) {
  const { data } = await supabase
    .from('v_category_leaderboard')
    .select('*')
    .order('composite_score', { ascending: false })
  const allRows = data ?? []

  return <CategoryTabs categories={categories} allRows={allRows as any} />
}
