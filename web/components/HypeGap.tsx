import { ModelLeaderboardRow } from '@/lib/data'

/**
 * The one view here that no benchmark can produce alone: capability rank
 * (Artificial Analysis) set against attention rank (measured by this project).
 */

function Bar({ row, kind }: { row: ModelLeaderboardRow; kind: 'over' | 'under' }) {
  const gap    = Math.abs(row.hype_gap ?? 0)
  const width  = Math.min(gap, 100)
  const color  = kind === 'over' ? 'var(--accent-red)' : 'var(--accent-teal)'
  const sign   = kind === 'over' ? '+' : '−'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {row.model_name}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color, fontWeight: 600 }}>
          {sign}{gap.toFixed(0)}
        </span>
      </div>

      <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{
          width: `${width}%`, height: '100%', background: color,
          borderRadius: 3, boxShadow: `0 0 10px ${color}66`,
        }} />
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        attention {row.attention_percentile?.toFixed(0)}th · capability {row.capability_percentile?.toFixed(0)}th
      </div>
    </div>
  )
}

function Column({ title, blurb, rows, kind }: {
  title: string
  blurb: string
  rows:  ModelLeaderboardRow[]
  kind:  'over' | 'under'
}) {
  return (
    <div style={{
      flex: '1 1 280px', minWidth: 0, padding: '18px 20px',
      border: '1px solid var(--border-subtle)', borderRadius: 10,
      background: 'var(--bg-elevated)',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: kind === 'over' ? 'var(--accent-red)' : 'var(--accent-teal)',
        marginBottom: 4,
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
        {blurb}
      </p>

      {rows.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '12px 0' }}>
          Nothing in this direction today.
        </p>
      ) : (
        rows.slice(0, 5).map(r => <Bar key={r.model_id} row={r} kind={kind} />)
      )}
    </div>
  )
}

export default function HypeGap({ overhyped, underrated }: {
  overhyped:  ModelLeaderboardRow[]
  underrated: ModelLeaderboardRow[]
}) {
  const measured = overhyped.length + underrated.length
  if (measured === 0) return null

  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Column
          kind="over"
          title="Louder than it scores"
          blurb="Search interest ranks above the model's Artificial Analysis score."
          rows={overhyped}
        />
        <Column
          kind="under"
          title="Better than it sounds"
          blurb="Scores well, but almost nobody is searching for it."
          rows={underrated}
        />
      </div>

      <p style={{
        marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        Gap = attention percentile − capability percentile, across the {measured} models
        with both measured. It says nothing about whether a model is good; it only shows
        where attention and measured capability disagree.
      </p>
    </section>
  )
}
