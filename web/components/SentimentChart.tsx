'use client'

import { MetricRow } from '@/lib/supabase'
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'

interface Props {
  metrics: MetricRow[]
  color:   string
}

type Tab = 'trend' | 'mentions' | 'sentiment'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'trend',
    label: 'Google Trend',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <polyline points="1,10 4,6 7,7.5 12,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9,2 12,2 12,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'mentions',
    label: 'Mentions',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="1" y="3" width="2.5" height="8" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="5" y="5" width="2.5" height="6" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="9" y="1" width="2.5" height="10" rx="1" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
  },
  {
    key: 'sentiment',
    label: 'Sentiment',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M4 8c0 0 .9 1.7 2.5 1.7S9 8 9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="4.5" cy="5.5" r="0.7" fill="currentColor"/>
        <circle cx="8.5" cy="5.5" r="0.7" fill="currentColor"/>
      </svg>
    ),
  },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600 }}>
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SentimentChart({ metrics, color }: Props) {
  const [tab, setTab] = useState<Tab>('trend')

  const data = metrics.map(m => ({
    date:      format(parseISO(m.date), 'MMM d'),
    trend:     m.google_trend_score,
    hn:        m.reddit_mention_count,
    news:      m.news_mention_count,
    sentiment: m.average_sentiment_score,
    mentions:  (m.reddit_mention_count ?? 0) + (m.news_mention_count ?? 0),
  }))

  const axisStyle = {
    fill: 'var(--text-muted)',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
  }

  return (
    <div className="table-wrap" style={{ overflow: 'visible' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              border: 'none',
              borderBottom: tab === t.key ? `2px solid var(--accent-gold)` : '2px solid transparent',
              background: 'transparent',
              color: tab === t.key ? 'var(--accent-gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.2s',
              marginBottom: -1,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: '24px 12px 12px', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {tab === 'trend' && (
              <>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="trend"
                  name="Trend"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                />
              </>
            )}

            {tab === 'mentions' && (
              <>
                <Bar dataKey="hn"   name="HackerNews" fill="#f97316" opacity={0.85} radius={[3,3,0,0]} />
                <Bar dataKey="news" name="News"       fill="#ef476f" opacity={0.7}  radius={[3,3,0,0]} />
              </>
            )}

            {tab === 'sentiment' && (
              <>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-teal)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="sentiment"
                  name="Sentiment"
                  stroke="var(--accent-teal)"
                  strokeWidth={2}
                  fill="url(#sentGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent-teal)', strokeWidth: 0 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
