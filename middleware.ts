import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { SESSION_COOKIE_NAME, PUBLIC_ROUTES } from '@/lib/constants'

const COOKIE_NAME = SESSION_COOKIE_NAME

/**
 * Proxy middleware — runs on every request before it reaches the page or API.
 *
 * Responsibilities:
 *  1. Allow public routes through without auth check
 *  2. Redirect unauthenticated users to /login
 *  3. Redirect already-logged-in users away from /login and /signup
 *  4. Forward userId and orgId as request headers so Server Components
 *     and Route Handlers can read them without re-verifying the token
 *
 * Note: Named `proxy` as per Next.js 16 convention (file stays middleware.ts)
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow Next.js internals and static assets through immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Allow public routes — but redirect logged-in users away from auth pages
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (token && (pathname === '/login' || pathname === '/signup')) {
      const payload = await verifyToken(token)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    return NextResponse.next()
  }

  // Protected route — read session cookie
  let token = req.cookies.get(COOKIE_NAME)?.value

  // Fallback: parse cookie header manually for edge cases
  if (!token && req.headers.get('cookie')) {
    const cookies = req.headers.get('cookie')?.split('; ')
    const match = cookies?.find((c) => c.startsWith(`${COOKIE_NAME}=`))
    token = match?.split('=')[1]
  }

  // No token — redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    // Token is invalid or expired — clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }

  // Valid session — forward user context as headers to downstream handlers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-org-id', payload.orgId)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  // Run on all routes except Next.js static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
