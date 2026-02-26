import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: tool, error: toolErr } = await supabase
    .from('dim_tool')
    .select('tool_id, tool_name, slug, company, release_date')
    .eq('slug', params.slug)
    .single()

  if (toolErr || !tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  const { data: metrics, error: metricsErr } = await supabase
    .from('fact_daily_metrics')
    .select('date, google_trend_score, reddit_mention_count, news_mention_count, average_sentiment_score')
    .eq('tool_id', tool.tool_id)
    .order('date', { ascending: true })
    .limit(90)

  if (metricsErr) {
    return NextResponse.json({ error: metricsErr.message }, { status: 500 })
  }

  return NextResponse.json({ tool, metrics })
}
