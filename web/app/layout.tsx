import type { Metadata } from 'next'
import './globals.css'
import Particles from '@/components/Particles'

export const metadata: Metadata = {
  title:       'AI Pulse — Live AI Model & Tool Rankings',
  description: 'Real-time rankings of AI models and tools by category. Speed, latency, funding, trend signals and community buzz.',
  openGraph: {
    title:       'AI Pulse',
    description: 'Live AI model and tool intelligence. Updated daily.',
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
                    href="https://github.com/YOUR_USERNAME/ai-trend-tracker"
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
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}>
            <span>Data from Google Trends · HackerNews · NewsAPI · OpenRouter</span>
            <span>Updated daily at 06:00 UTC</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
