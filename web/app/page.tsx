import { supabase, LeaderboardRow } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import { format } from 'date-fns'

export const revalidate = 300 // ISR: refresh every 5 min

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from('v_leaderboard')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Failed to load leaderboard:', error)
    return []
  }
  return data as LeaderboardRow[]
}

export default async function HomePage() {
  const rows  = await getLeaderboard()
  const today = rows[0]?.date ? format(new Date(rows[0].date), 'MMMM d, yyyy') : 'today'

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="mb-10 animate-fade-up">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
          Live Rankings · {today}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-bright mb-4 leading-tight">
          Which AI tool is<br />
          <span className="text-amber">winning the internet</span>?
        </h1>
        <p className="text-soft text-sm max-w-lg">
          Daily composite score based on Google Trends interest, Reddit mentions,
          news coverage, and public sentiment. No sponsorships. No paid rankings.
        </p>
      </div>

      {/* ── Score legend ─────────────────────────────── */}
      <div className="flex flex-wrap gap-4 mb-8 text-xs font-mono text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber inline-block" />
          Trend score (50%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ice inline-block" />
          Mentions (34%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lime inline-block" />
          Sentiment (16%)
        </div>
      </div>

      {/* ── Leaderboard ──────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="border border-edge rounded-lg p-12 text-center text-muted text-sm font-mono">
          No data yet — run the ingestion pipeline first.
        </div>
      ) : (
        <LeaderboardTable rows={rows} />
      )}

      {/* ── Methodology note ─────────────────────────── */}
      <div className="mt-12 border-t border-edge pt-8">
        <h2 className="font-display text-xl text-bright mb-3">How it works</h2>
        <p className="text-soft text-sm leading-relaxed max-w-2xl">
          Every day at 06:00 UTC, an automated pipeline collects Google Trends interest scores,
          counts Reddit posts across AI subreddits, and pulls news headlines. Text is run through
          a sentiment model (–1 to +1). All signals are weighted into a single composite score
          and stored in a PostgreSQL database. Rankings update automatically.
        </p>
      </div>
    </div>
  )
}
