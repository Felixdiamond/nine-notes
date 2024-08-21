import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, avatar_url } = body

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: { name, avatar_url }
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'