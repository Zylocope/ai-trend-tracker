'use client'

import { useState } from 'react'

interface Combo {
  combo_id:          number
  name:              string
  slug:              string
  description:       string
  use_case:          string
  tool_slugs:        string[]
}

interface Props { combos: Combo[] }

type View = 'ranked' | 'community'

const TOOL_COLORS: Record<string, string> = {
  'sora':           '#10a37f',
  'elevenlabs':     '#f97316',
  'leonardo-ai':    '#a78bfa',
  'kling':          '#4d9fff',
  'runway':         '#06d6a0',
  'canva-ai':       '#00c4cc',
  'flux':           '#f0f0f0',
  'pika':           '#ff6b9d',
  'veo-2':          '#4285f4',
  'adobe-firefly':  '#ff0000',
  'midjourney':     '#ffffff',
  'hailuo':         '#fd9353',
}

function ToolChip({ slug }: { slug: string }) {
  const color = TOOL_COLORS[slug] ?? '#888'
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
      border: `1px solid ${color}44`,
      background: `${color}11`,
      color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 6h8M7 3l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function VoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2l1.5 3h3l-2.4 1.8.9 3L6 8.1 3 9.8l.9-3L1.5 5h3L6 2z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

function CommunityPickBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
      background: 'rgba(232,162,48,0.12)',
      color: 'var(--accent-gold)',
      border: '1px solid rgba(232,162,48,0.3)',
    }}>
      <VoteIcon />
      EDITORIAL PICK
    </span>
  )
}

export default function CombosTable({ combos }: Props) {
  const [view, setView] = useState<View>('ranked')

  const ranked    = combos
  const community = combos
  const displayed = view === 'ranked' ? ranked : community

  return (
    <div className="fade-up" style={{ animationDelay: '0.5s' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {[
          { key: 'ranked' as View,    label: 'All Combos',       desc: 'Ranked by community votes' },
          { key: 'community' as View, label: 'Community Picks',  desc: 'Hand-picked by the community' },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: '8px 20px', borderRadius: 999,
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
              border: '1px solid',
              borderColor:  view === v.key ? 'transparent'        : 'var(--border-subtle)',
              background:   view === v.key ? 'var(--accent-gold)' : 'var(--bg-elevated)',
              color:        view === v.key ? 'var(--bg-deepest)'  : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: view === v.key ? '0 2px 12px rgba(255,183,3,0.3)' : 'none',
            }}
          >
            {v.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {displayed.length} combos
        </span>
      </div>

      {/* Combos list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.map((combo, i) => (
          <div
            key={combo.combo_id}
            className="rank-row"
            style={{
              padding: '20px 24px',
              animationDelay: `${0.6 + i * 0.08}s`,
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              {/* Left */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Rank + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span className={`font-mono font-semibold ${i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':'rank-normal'}`}
                    style={{ fontSize: i < 3 ? '1.2rem' : '0.9rem', minWidth: 24, textAlign: 'right' }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {combo.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {combo.use_case}
                    </div>
                  </div>
                </div>

                {/* Tool flow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {combo.tool_slugs.map((slug, ti) => (
                    <span key={slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ToolChip slug={slug} />
                      {ti < combo.tool_slugs.length - 1 && <ArrowIcon />}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {combo.description}
                </p>
              </div>

              {/* Right: provenance badge. These are hand-written recipes, so there
                  is no vote count to show - inventing one would be the lie. */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <CommunityPickBadge />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{
        marginTop: 24, padding: '14px 18px', borderRadius: 8,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        These are hand-written workflow recipes, not a measurement. Nothing here is
        ranked, scored, or voted on — the tools inside them are tracked individually
        on their own category pages.
      </div>
    </div>
  )
}
