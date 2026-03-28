import { okWithCookie } from '@/lib/api-response'
import { buildClearCookie } from '@/lib/auth'

/**
 * POST /api/auth/logout
 *
 * Ends the user's session by clearing the session cookie.
 * The JWT itself is not invalidated server-side (stateless auth)
 * but the cookie deletion means the browser will not send it again.
 */
export async function POST() {
  // Max-Age=0 instructs the browser to delete the cookie immediately
  return okWithCookie(undefined, 'Logged out successfully', buildClearCookie(), 200)
}
