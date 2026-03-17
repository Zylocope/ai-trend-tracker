import { supabase } from '@/lib/supabase'

export const revalidate = 300

// SVG icons per category slug
function CategoryCardIcon({ slug }: { slug: string }) {
  const s = 'currentColor'
  if (slug === 'general-chat') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M3 5a2 2 0 012-2h18a2 2 0 012 2v12a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V5z"
        stroke={s} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 10h12M8 14h8" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'coding') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M10 8L4 14l6 6M18 8l6 6-6 6" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 5l-4 18" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'web-search') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="12" cy="12" r="8" stroke={s} strokeWidth="1.8"/>
      <path d="M18 18l6 6" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (slug === 'vibe-coding') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="5" width="22" height="18" rx="2" stroke={s} strokeWidth="1.8"/>
      <path d="M3 10h22" stroke={s} strokeWidth="1.8"/>
      <circle cx="7" cy="7.5" r="1" fill={s}/>
      <circle cx="11" cy="7.5" r="1" fill={s}/>
      <path d="M10 15l-3 3 3 3M18 15l3 3-3 3" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'image-generation') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="4" width="22" height="20" rx="2" stroke={s} strokeWidth="1.8"/>
      <circle cx="9" cy="10" r="2.5" stroke={s} strokeWidth="1.5"/>
      <path d="M3 20l7-7 4 4 3-3 8 6" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'video-generation') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="6" width="18" height="16" rx="2" stroke={s} strokeWidth="1.8"/>
      <path d="M20 10.5l6-3v13l-6-3v-7z" stroke={s} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
  if (slug === 'short-film-combos') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="4" width="24" height="20" rx="2" stroke={s} strokeWidth="1.8"/>
      <path d="M2 10h24M8 4v6M14 4v6M20 4v6M8 10v14M14 10v14M20 10v14" stroke={s} strokeWidth="1.5"/>
    </svg>
  )
  return null
}

const CATEGORY_COLORS: Record<string, string> = {
  'general-chat':    '#e8a230',
  'coding':          '#7ec8e3',
  'web-search':      '#06d6a0',
  'vibe-coding':     '#a78bfa',
  'image-generation':'#f472b6',
  'video-generation':'#f97316',
  'short-film-combos':'#ef476f',
}

const TOOL_COUNTS: Record<string, number> = {
  'general-chat': 5, 'coding': 5, 'web-search': 4,
  'vibe-coding': 10, 'image-generation': 8,
  'video-generation': 7, 'short-film-combos': 6,
}

async function getCategories() {
  const { data } = await supabase
    .from('dim_category')
    .select('*')
    .order('category_id')
  return data ?? []
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-14">
        <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                        font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="live-pulse" />
          <span>All Categories</span>
        </div>

        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Explore AI tools
          <br />by <span className="hero-highlight">what they do</span>
        </h1>

        <p className="fade-up mx-auto max-w-lg text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
          Each category ranked by its own weighted formula.
          Updated daily from Google Trends, HackerNews, and NewsAPI.
        </p>
      </section>

      {/* Category grid */}
      <div className="fade-up" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
        animationDelay: '0.5s',
      }}>
        {categories.map((cat: any, i: number) => {
          const color    = CATEGORY_COLORS[cat.slug] ?? 'var(--accent-gold)'
          const toolCount = TOOL_COUNTS[cat.slug] ?? '?'
          return (
            <a
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="rank-row"
                style={{
                  padding: '24px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  animationDelay: `${0.5 + i * 0.07}s`,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `${color}18`,
                  border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, marginBottom: 16,
                }}>
                  <CategoryCardIcon slug={cat.slug} />
                </div>

                {/* Name + count */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {toolCount} tools tracked
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {cat.description}
                </p>

                {/* Arrow */}
                <div style={{
                  marginTop: 16, display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color,
                }}>
                  View rankings
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
