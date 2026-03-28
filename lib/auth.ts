import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE, JWT_ALGORITHM, JWT_EXPIRY } from '@/lib/constants'

// Cookie name and expiry pulled from shared constants
const COOKIE_NAME = SESSION_COOKIE_NAME
const COOKIE_MAX_AGE = SESSION_COOKIE_MAX_AGE

/**
 * Shape of the JWT payload.
 * Both userId and orgId are embedded so every request
 * can scope DB queries to the correct tenant without
 * an extra DB lookup.
 */
export type SessionPayload = {
  userId: string
  orgId: string
}

/**
 * Encodes the JWT_SECRET env var into a Uint8Array
 * as required by the jose library.
 * Throws early if the secret is missing so misconfiguration
 * is caught at runtime rather than silently failing.
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

/**
 * Signs a new JWT with the session payload.
 * Algorithm: HS256 (symmetric, suitable for single-service MVP).
 * Expiry: 7 days.
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

/**
 * Verifies a JWT string and returns the decoded payload.
 * Returns null if the token is invalid, expired, or tampered with —
 * callers should treat null as unauthenticated.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    // Token is invalid or expired — not an application error
    return null
  }
}

/**
 * Reads the session cookie and returns the decoded payload.
 * Used in Server Components and Server Actions to get the
 * currently authenticated user and their organisation.
 * Returns null if the user is not logged in or session is expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies() // Next.js 16: cookies() is async
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Builds the Set-Cookie header value for setting the session cookie.
 * HttpOnly:   prevents JS access (XSS protection)
 * Secure:     HTTPS only
 * SameSite:   CSRF protection
 * Used in Route Handlers after successful login/signup.
 */
export function buildSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${COOKIE_MAX_AGE}`
}

/**
 * Builds the Set-Cookie header value that clears the session cookie.
 * Max-Age=0 instructs the browser to delete the cookie immediately.
 * Used in the logout Route Handler.
 */
export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}
