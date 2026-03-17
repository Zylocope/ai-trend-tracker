import { supabase, CategoryRow, LeaderboardRow } from '@/lib/supabase'
import CategoryTabs from '@/components/CategoryTabs'

export const revalidate = 300

const CATEGORY_COLORS: Record<string, string> = {
  'general-chat':     '#e8a230',
  'coding':           '#7ec8e3',
  'web-search':       '#06d6a0',
  'vibe-coding':      '#a78bfa',
  'image-generation': '#f472b6',
  'video-generation': '#f97316',
  'short-film-combos':'#ef476f',
}

const TOOL_COUNTS: Record<string, number> = {
  'general-chat': 5, 'coding': 5, 'web-search': 4,
  'vibe-coding': 9, 'image-generation': 8,
  'video-generation': 7, 'short-film-combos': 6,
}

function CategoryCardIcon({ slug }: { slug: string }) {
  const s = 'currentColor'
  if (slug === 'general-chat') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M2 4a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H12l-4 3v-3H4a2 2 0 01-2-2V4z" stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M6 8h10M6 11h6" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'coding') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 6L3 11l5 5M14 6l5 5-5 5" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 4l-4 14" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'web-search') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="7" stroke={s} strokeWidth="1.5"/>
      <path d="M15 15l5 5" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'vibe-coding') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="16" rx="2" stroke={s} strokeWidth="1.5"/>
      <path d="M2 8h18" stroke={s} strokeWidth="1.5"/>
      <circle cx="5.5" cy="5.5" r="0.8" fill={s}/>
      <circle cx="8.5" cy="5.5" r="0.8" fill={s}/>
      <path d="M8 12l-3 2.5L8 17M14 12l3 2.5L14 17" stroke={s} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'image-generation') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="16" rx="2" stroke={s} strokeWidth="1.5"/>
      <circle cx="7.5" cy="8.5" r="2" stroke={s} strokeWidth="1.3"/>
      <path d="M2 16l6-6 4 4 3-3 7 5" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'video-generation') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="5" width="14" height="12" rx="2" stroke={s} strokeWidth="1.5"/>
      <path d="M15 9l6-3v10l-6-3V9z" stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'short-film-combos') return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="3" width="20" height="16" rx="2" stroke={s} strokeWidth="1.5"/>
      <path d="M1 8h20M6 3v5M11 3v5M16 3v5" stroke={s} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  return null
}

async function getCategories(): Promise<CategoryRow[]> {
  const { data } = await supabase.from('dim_category').select('*').order('category_id')
  return (data ?? []) as CategoryRow[]
}

async function getAllRows(): Promise<LeaderboardRow[]> {
  const { data } = await supabase
    .from('v_category_leaderboard')
    .select('*')
    .order('composite_score', { ascending: false })
  return (data ?? []) as LeaderboardRow[]
}

export default async function CategoriesPage() {
  const [categories, allRows] = await Promise.all([getCategories(), getAllRows()])
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="text-center mb-14">
        <div
          className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <span className="live-pulse" />
          <span>Popularity Rankings</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{today}</span>
        </div>

        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Which AI tools are{' '}
          <span className="hero-highlight">people talking about</span>?
        </h1>

        <p
          className="fade-up mx-auto max-w-xl text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}
        >
          Daily buzz rankings from Google Trends, HackerNews and NewsAPI.
          Each category uses its own weighted formula. No sponsorships.
        </p>
      </section>

      {/* ── Category cards grid ──────────────────────── */}
      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 40,
          animationDelay: '0.4s',
        }}
      >
        {categories.map((cat: any) => {
          const color = CATEGORY_COLORS[cat.slug] ?? 'var(--accent-gold)'
          const count = TOOL_COUNTS[cat.slug] ?? '?'
          return (
            <a
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                padding: '16px 18px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}55`
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                }}>
                  <CategoryCardIcon slug={cat.slug} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {count} tools
                  </div>
                </div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text-muted)' }}>
                  <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          )
        })}
      </div>

      {/* ── Divider ──────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Quick rankings
        </span>
        <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
      </div>

      {/* ── Category tabs leaderboard ─────────────────── */}
      <CategoryTabs categories={categories} allRows={allRows} />
    </div>
  )
}
