'use client'

import { MentionRow } from '@/lib/supabase'
import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import clsx from 'clsx'

interface Props { mentions: MentionRow[] }

type Filter = 'all' | 'reddit' | 'news'

function sentimentColor(s: number | null): string {
  if (s === null) return 'text-muted'
  if (s > 0.1)   return 'text-lime'
  if (s < -0.1)  return 'text-rose'
  return 'text-soft'
}

export default function MentionsFeed({ mentions }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all' ? mentions : mentions.filter(m => m.source === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {(['all', 'reddit', 'news'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors capitalize',
              filter === f
                ? 'bg-edge text-bright'
                : 'text-muted hover:text-soft'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-muted self-center">
          {visible.length} results
        </span>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        {visible.length === 0 && (
          <div className="border border-edge rounded-lg p-8 text-center text-muted text-sm font-mono">
            No mentions yet.
          </div>
        )}

        {visible.map(m => (
          <a
            key={m.id}
            href={m.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-edge rounded-lg p-4 hover:border-amber/40
                       hover:bg-card/50 transition-all group no-underline"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-bright text-sm leading-snug group-hover:text-amber transition-colors line-clamp-2">
                {m.title || '(no title)'}
              </p>
              {m.sentiment !== null && (
                <span className={clsx('font-mono text-xs shrink-0 mt-0.5', sentimentColor(m.sentiment))}>
                  {m.sentiment >= 0 ? '+' : ''}{m.sentiment.toFixed(2)}
                </span>
              )}
            </div>

            {m.body && (
              <p className="text-muted text-xs leading-relaxed mb-2 line-clamp-2">{m.body}</p>
            )}

            <div className="flex items-center gap-3 text-muted text-xs font-mono">
              <span className={clsx(
                'px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider',
                m.source === 'reddit' ? 'bg-ice/10 text-ice' : 'bg-soft/10 text-soft'
              )}>
                {m.source}
              </span>
              <span>
                {formatDistanceToNow(parseISO(m.fetched_at), { addSuffix: true })}
              </span>
              {m.url && (
                <span className="ml-auto truncate max-w-[180px] text-muted/60">
                  {new URL(m.url).hostname}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
