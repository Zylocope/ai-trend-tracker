import { supabase, LeaderboardRow } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import { format } from 'date-fns'

export const revalidate = 300

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from('v_leaderboard')
    .select('*')
    .limit(10)
  if (error) { console.error(error); return [] }
  return data as LeaderboardRow[]
}

export default async function HomePage() {
  const rows  = await getLeaderboard()
  const today = rows[0]?.date
    ? format(new Date(rows[0].date), 'MMMM d, yyyy')
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="text-center mb-14">

        {/* Live badge */}
        <div className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="live-pulse" />
          <span>Live Rankings</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{today}</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Which AI tool is{' '}
          <span className="hero-highlight">winning</span>
          <br />the internet?
        </h1>

        {/* Subheading */}
        <p className="fade-up mx-auto max-w-xl text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
          Daily composite score from Google Trends, HackerNews mentions,
          news coverage and sentiment analysis. No sponsorships. No paid rankings.
        </p>

        {/* Legend */}
        <div className="fade-up flex flex-wrap justify-center gap-6" style={{ animationDelay: '0.5s' }}>
          {[
            { label: 'Trend Score',  color: 'var(--accent-gold)', delay: '0s' },
            { label: 'HN Mentions',  color: '#f97316',            delay: '0.3s' },
            { label: 'News Volume',  color: 'var(--accent-red)',  delay: '0.6s' },
            { label: 'Sentiment',    color: 'var(--accent-teal)', delay: '0.9s' },
          ].map(({ label, color, delay }) => (
            <div key={label} className="flex items-center gap-2 text-sm cursor-default"
              style={{ color: 'var(--text-secondary)' }}>
              <span className="legend-dot shrink-0" style={{ background: color, animationDelay: delay }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rankings Table ──────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="table-wrap p-16 text-center font-mono text-sm"
          style={{ color: 'var(--text-muted)' }}>
          No data yet — run the ingestion pipeline first.
        </div>
      ) : (
        <LeaderboardTable rows={rows} />
      )}

      {/* ── Methodology ────────────────────────────────── */}
      <div className="fade-up mt-16 pt-10 border-t" style={{ borderColor: 'var(--border-subtle)', animationDelay: '1.2s' }}>
        <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
          How it works
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Every day at 06:00 UTC an automated pipeline fetches Google Trends interest scores,
          counts HackerNews posts, and pulls news headlines. Text is run through a sentiment model (−1 to +1).
          All signals are weighted into a composite score and stored in PostgreSQL.
          Rankings update automatically — no human curation.
        </p>
      </div>
    </div>
  )
}
