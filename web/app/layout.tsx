import type { Metadata } from 'next'
import './globals.css'
import Particles from '@/components/Particles'
import { meta, commitShort } from '@/lib/data'

const REPO = 'https://github.com/Zylocope/ai-trend-tracker'

export const metadata: Metadata = {
  title:       'AI Pulse — attention tracking for AI tools',
  description: 'Daily search and Hacker News attention for AI tools and models, versioned in git, set against Artificial Analysis capability scores.',
  openGraph: {
    title:       'AI Pulse',
    description: 'Where AI attention and measured capability disagree. Updated daily, every number traceable to a commit.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--bg-deepest)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>

        <div className="bg-glow" />
        <div className="grid-bg" />
        <Particles />

        {/* ── Header ─────────────────────────────────── */}
        <header
          className="header-slide fixed top-0 left-0 right-0 z-50"
          style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">

            <a href="/" className="logo-glow no-underline flex items-center gap-2">
              <span className="font-display text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                AI<span style={{ color: 'var(--accent-gold)' }}>Pulse</span>
              </span>
            </a>

            <nav>
              <ul className="flex items-center gap-6 list-none">
                <li><a href="/" className="nav-link">Models</a></li>
                <li><a href="/categories" className="nav-link">Categories</a></li>
                <li>
                  <a
                    href={REPO}
                    target="_blank" rel="noopener noreferrer"
                    className="nav-link font-mono text-xs"
                  >
                    GitHub ↗
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16">
          {children}
        </main>

        <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-3 font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}>

            {/* Provenance. This site has no database - it is built from one JSON
                file committed by the pipeline, so every number above can be
                traced back to the exact commit that produced it. */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                Snapshot {new Date(meta.generated_at).toISOString().slice(0, 16).replace('T', ' ')} UTC
                {commitShort && (
                  <>
                    {' · '}
                    <a href={`${REPO}/commit/${meta.commit}`} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'var(--accent-teal)' }}>
                      {commitShort}
                    </a>
                  </>
                )}
              </span>
              <a href={`${REPO}/commits/main/data/snapshot.json`} target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--accent-teal)' }}>
                every past snapshot ↗
              </a>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {meta.sources.map(src => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer"
                   style={{ color: src.ok ? 'var(--text-muted)' : 'var(--accent-red)' }}
                   title={src.ok ? `${src.rows} rows in this snapshot` : 'This source failed on the last run'}>
                  {src.name}{src.ok ? '' : ' (stale)'}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
