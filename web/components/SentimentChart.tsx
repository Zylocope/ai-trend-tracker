'use client'

import { MetricRow } from '@/lib/supabase'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'

interface Props { metrics: MetricRow[] }

type View = 'trend' | 'sentiment' | 'mentions'

const VIEWS: { key: View; label: string }[] = [
  { key: 'trend',     label: 'Google Trend' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'mentions',  label: 'Mentions' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-edge rounded-md px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-muted mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-medium">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SentimentChart({ metrics }: Props) {
  const [view, setView] = useState<View>('trend')

  const data = metrics.map(m => ({
    date:      format(parseISO(m.date), 'MMM d'),
    trend:     m.google_trend_score,
    sentiment: m.average_sentiment_score,
    reddit:    m.reddit_mention_count,
    news:      m.news_mention_count,
  }))

  return (
    <div className="border border-edge rounded-lg overflow-hidden bg-card/30">
      {/* Tab bar */}
      <div className="flex border-b border-edge">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-5 py-3 text-xs font-mono transition-colors ${
              view === v.key
                ? 'text-amber border-b-2 border-amber bg-card/60 -mb-px'
                : 'text-muted hover:text-soft'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4 pt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a36" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#4a6070', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#4a6070', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {view === 'trend' && (
              <Line
                type="monotone"
                dataKey="trend"
                name="Trend"
                stroke="#e8a230"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#e8a230' }}
              />
            )}

            {view === 'sentiment' && (
              <Line
                type="monotone"
                dataKey="sentiment"
                name="Sentiment"
                stroke="#7ec8e3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#7ec8e3' }}
              />
            )}

            {view === 'mentions' && (
              <>
                <Bar dataKey="reddit" name="Reddit" fill="#7ec8e3" opacity={0.8} radius={[2,2,0,0]} />
                <Bar dataKey="news"   name="News"   fill="#8ba5b8" opacity={0.6} radius={[2,2,0,0]} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
