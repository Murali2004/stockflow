/**
 * Name of the HTTP-only cookie that stores the JWT session token.
 * Shared across middleware, auth utilities, and route handlers.
 */
export const SESSION_COOKIE_NAME = 'session'

/**
 * Session cookie max age in seconds — 7 days.
 * After this period the browser discards the cookie and the user
 * must log in again.
 */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Routes that are accessible without authentication.
 * Used by middleware to skip auth checks.
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
]

/**
 * Default low stock threshold used when a product has no
 * individual threshold set and the org has no custom default.
 */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5

/**
 * JWT signing algorithm.
 * HS256 (HMAC-SHA256) is symmetric — same secret signs and verifies.
 * Suitable for single-service MVP where only this server needs to verify tokens.
 */
export const JWT_ALGORITHM = 'HS256' as const

/**
 * JWT expiry duration passed to jose's setExpirationTime.
 */
export const JWT_EXPIRY = '7d'

/**
 * bcrypt cost factor for password hashing.
 * 12 is a good balance between security and performance.
 * Higher = slower hash = harder to brute force.
 */
export const BCRYPT_SALT_ROUNDS = 12
