import { NextResponse } from 'next/server'
import { buildClearCookie } from '@/lib/auth'

/**
 * POST /api/auth/logout
 *
 * Ends the user's session by clearing the session cookie.
 * The JWT itself is not invalidated server-side (stateless auth)
 * but the cookie deletion means the browser will not send it again.
 */
export async function POST() {
  return NextResponse.json(
    { message: 'Logged out successfully' },
    {
      status: 200,
      // Max-Age=0 instructs the browser to delete the cookie immediately
      headers: { 'Set-Cookie': buildClearCookie() },
    }
  )
}
