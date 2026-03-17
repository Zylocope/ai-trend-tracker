import { supabase, CompanyRow, ModelRow } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const revalidate = 300

export async function generateStaticParams() {
  const { data } = await supabase.from('dim_company').select('slug')
  return (data ?? []).map(c => ({ slug: c.slug }))
}

async function getData(slug: string): Promise<{ company: CompanyRow; models: ModelRow[] } | null> {
  const { data: company } = await supabase
    .from('dim_company').select('*').eq('slug', slug).single()
  if (!company) return null

  const { data: models } = await supabase
    .from('dim_model')
    .select('*')
    .eq('company_id', company.company_id)
    .order('release_date', { ascending: false })

  return { company: company as CompanyRow, models: (models ?? []) as ModelRow[] }
}

function fmt(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

function fmtCtx(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tokens`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K tokens`
  return `${n} tokens`
}

const COMPANY_COLORS: Record<string, string> = {
  openai: '#10a37f', anthropic: '#d4845a', google: '#4285f4',
  meta: '#0668e1', mistral: '#ff6900', deepseek: '#4d9fff', xai: '#ededed',
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const result = await getData(params.slug)
  if (!result) notFound()

  const { company, models } = result
  const color    = COMPANY_COLORS[params.slug] ?? '#888'
  const initials = company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Back */}
      <a href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All Models
      </a>

      {/* Company header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 40 }}>
        <div style={{
          position: 'relative',
          width: 64, height: 64, borderRadius: 16, flexShrink: 0,
          background: color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: '1.1rem', color: 'white',
          boxShadow: `0 0 32px ${color}55, 0 4px 16px rgba(0,0,0,0.4)`,
        }}>
          {initials}
          <div style={{
            position: 'absolute', top: 4, left: 6, right: 6, height: '35%',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '8px 8px 50% 50%',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <h1 className="font-display" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            {company.name}
          </h1>
          {company.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 500 }}>
              {company.description}
            </p>
          )}

          {/* Meta stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16 }}>
            {company.founded_year && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  Founded
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {company.founded_year}
                </div>
              </div>
            )}
            {company.hq && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  HQ
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {company.hq}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                Total Funding
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
                {fmt(company.total_funding_usd)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                Models
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {models.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Models table */}
      <h2 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 16 }}>
        Models
      </h2>

      <div className="table-wrap fade-up" style={{ animationDelay: '0.3s' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 90px 110px 120px',
          gap: '1rem', padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}>
          <span>Model</span>
          <span style={{ textAlign: 'right' }}>Speed</span>
          <span style={{ textAlign: 'right' }}>Latency</span>
          <span style={{ textAlign: 'right' }}>Context</span>
          <span>Providers</span>
        </div>

        {models.map((m, i) => (
          <div key={m.model_id} className="rank-row" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 90px 110px 120px',
              gap: '1rem', padding: '14px 20px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {m.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {m.release_date ? format(new Date(m.release_date), 'MMM yyyy') : ''}
                  {m.is_open_source && (
                    <span style={{ marginLeft: 8, color: 'var(--accent-teal)' }}>OPEN SOURCE</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                {m.speed_tps ? `${m.speed_tps.toFixed(0)} t/s` : '—'}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-teal)' }}>
                {m.latency_ms ? `${m.latency_ms.toFixed(0)}ms` : '—'}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {fmtCtx(m.context_window)}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(m.providers ?? []).map(p => {
                  const colors: Record<string, string> = { AWS: '#ff9900', Azure: '#0089d6', GCP: '#4285f4' }
                  const c = colors[p] ?? 'var(--text-muted)'
                  return (
                    <span key={p} style={{
                      padding: '1px 6px', borderRadius: 3,
                      fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
                      border: `1px solid ${c}44`, color: c, background: `${c}11`,
                    }}>
                      {p}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
