import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export async function GET() {
  const { data, error } = await supabase
    .from('v_leaderboard')
    .select('*')
    .limit(20)

  if (error) {
    console.error('leaderboard query failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
