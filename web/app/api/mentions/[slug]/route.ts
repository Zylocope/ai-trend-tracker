import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const source = req.nextUrl.searchParams.get('source')
  const limit  = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 30), 100)

  const { data: tool } = await supabase
    .from('dim_tool')
    .select('tool_id')
    .eq('slug', params.slug)
    .single()

  if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 })

  let query = supabase
    .from('raw_mentions')
    .select('id, fetched_at, source, title, body, url, sentiment')
    .eq('tool_id', tool.tool_id)
    .order('fetched_at', { ascending: false })
    .limit(limit)

  if (source) query = query.eq('source', source)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
