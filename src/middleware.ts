import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/lib/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // List of public routes
  const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up']

  // Check if the current path is not in the list of public routes
  if (!publicRoutes.includes(req.nextUrl.pathname)) {
    // If the request is for an API route, don't redirect
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return res
    }

    // If there's no session, redirect to the sign-in page
    if (!session) {
      console.log('No session found, redirecting to sign-in page')
      return NextResponse.redirect(new URL('/auth/sign-in', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}