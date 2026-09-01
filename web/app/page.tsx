import { getModelLeaderboard, getHypeGap, meta } from '@/lib/data'
import ModelLeaderboard from '@/components/ModelLeaderboard'
import HypeGap from '@/components/HypeGap'

export default function HomePage() {
  const models = getModelLeaderboard()
  const gap    = getHypeGap()
  const today  = new Date(meta.generated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div>
      <section className="text-center mb-14">
        <div
          className="badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <span className="live-pulse" />
          <span>Snapshot</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{today}</span>
        </div>

        <h1 className="hero-title mb-5 fade-up" style={{ animationDelay: '0.1s' }}>
          Which models get more attention{' '}
          <span className="hero-highlight">than they have earned</span>?
        </h1>

        <p
          className="fade-up mx-auto max-w-xl text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}
        >
          Benchmarks measure capability. This measures attention — search interest and
          Hacker News volume, collected daily — and sets it against Artificial Analysis
          scores to show where the two disagree.
        </p>

        <div className="fade-up flex flex-wrap justify-center gap-3" style={{ animationDelay: '0.5s' }}>
          <a href="/categories" className="nav-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            textDecoration: 'none',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="7" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="1" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Browse by category
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      <div className="fade-up" style={{ animationDelay: '0.6s' }}>
        <HypeGap overhyped={gap.overhyped} underrated={gap.underrated} />
      </div>

      <div className="fade-up" style={{ animationDelay: '0.7s' }}>
        <ModelLeaderboard rows={models} />
      </div>
    </div>
  )
}
