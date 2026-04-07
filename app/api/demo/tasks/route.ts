import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const demoUserId = process.env.DEMO_USER_ID

  if (!serviceKey || !demoUserId) {
    return NextResponse.json({ tasks: [] })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, created_at')
    .eq('user_id', demoUserId)
    .eq('source', 'demo')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Demo tasks fetch failed:', error)
    return NextResponse.json({ tasks: [] })
  }

  return NextResponse.json({ tasks: data })
}
