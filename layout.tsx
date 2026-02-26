import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'AI Pulse — Live AI Tool Rankings',
  description: 'Real-time rankings of AI tools based on Google Trends, Reddit mentions, and news sentiment.',
  openGraph: {
    title:       'AI Pulse',
    description: 'Live rankings of AI tools. Updated daily.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-bright">
        {/* ── Header ─────────────────────────────────── */}
        <header className="border-b border-edge sticky top-0 z-50 bg-ink/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 no-underline">
              <span className="font-display text-xl text-bright tracking-tight">AI Pulse</span>
              <span className="live-dot" title="Updated daily" />
            </a>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-soft hover:text-bright text-sm transition-colors">Rankings</a>
              <a
                href="https://github.com/YOUR_USERNAME/ai-trend-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-soft hover:text-bright text-sm transition-colors font-mono"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="border-t border-edge mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-muted text-xs font-mono">
            <span>AI Pulse — data from Google Trends, Reddit, NewsAPI</span>
            <span>Updated daily at 06:00 UTC</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
