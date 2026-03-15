import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'AI Pulse — Live AI Tool Rankings',
  description: 'Real-time rankings of AI tools based on Google Trends, HackerNews, News and sentiment. Updated daily.',
  openGraph: {
    title:       'AI Pulse',
    description: 'Live rankings of AI tools. Updated daily.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--bg-deepest)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>

        {/* ── Background layers ───────────────────────── */}
        <div className="bg-glow" />
        <div className="grid-bg" />
        <div id="particles" className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />

        {/* ── Header ─────────────────────────────────── */}
        <header className="header-slide fixed top-0 left-0 right-0 z-50"
          style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">

            <a href="/" className="logo-glow no-underline flex items-center gap-2">
              <span className="font-display text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                AI<span style={{ color: 'var(--accent-gold)' }}>Pulse</span>
              </span>
            </a>

            <nav>
              <ul className="flex gap-8 list-none">
                <li><a href="/" className="nav-link">Rankings</a></li>
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

        {/* ── Main ───────────────────────────────────── */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}>
            <span>Data from Google Trends · HackerNews · NewsAPI</span>
            <span>Updated daily at 06:00 UTC</span>
          </div>
        </footer>

        {/* ── Particles script ───────────────────────── */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var container = document.getElementById('particles');
            if (!container) return;
            for (var i = 0; i < 22; i++) {
              var p = document.createElement('div');
              p.className = 'particle';
              p.style.left = Math.random() * 100 + '%';
              p.style.animationDelay = Math.random() * 15 + 's';
              p.style.animationDuration = (15 + Math.random() * 10) + 's';
              p.style.background = Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-teal)';
              container.appendChild(p);
            }
          })();
        `}} />
      </body>
    </html>
  )
}
