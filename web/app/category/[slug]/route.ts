import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabase
    .from('v_category_leaderboard')
    .select('*')
    .eq('category_slug', params.slug)
    .order('composite_score', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
