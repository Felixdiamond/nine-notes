import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password } = body
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
    }

    // Refresh the session and return a success response
    await supabase.auth.refreshSession()
    return NextResponse.json({ message: 'Sign up successful', user: data.user }, { status: 200 })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json({ error: 'An error occurred during sign up' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'