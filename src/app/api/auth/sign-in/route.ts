import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password } = body

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: user, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError && signInError.message.includes('User has signed up with Google')) {
      return NextResponse.json(
        { error: 'You signed up with Google. Please sign in with Google.' },
        { status: 400 }
      )
    } else if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 400 })
    }

    await supabase.auth.refreshSession()
    return NextResponse.json({ message: 'Sign in successful' }, { status: 200 })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json({ error: 'An error occurred during sign in' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'