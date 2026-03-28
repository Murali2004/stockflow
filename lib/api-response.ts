import { NextResponse } from 'next/server'

/**
 * Standard API response envelope used across all route handlers.
 *
 * Success shape:  { success: true,  data?: T,      message?: string }
 * Error shape:    { success: false, error: string                   }
 *
 * Using a consistent envelope makes it easy for the frontend to handle
 * responses uniformly — always check `success`, then read `data` or `error`.
 */

/**
 * Returns a successful JSON response.
 * @param data   - Payload to include under the `data` key (optional)
 * @param message - Human-readable success message (optional)
 * @param status  - HTTP status code (default 200)
 */
export function ok<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, ...(data !== undefined && { data }), ...(message && { message }) },
    { status }
  )
}

/**
 * Returns a successful JSON response with a Set-Cookie header.
 * Used after login/signup to attach the session cookie alongside the body.
 */
export function okWithCookie<T>(data?: T, message?: string, cookie?: string, status = 200) {
  return NextResponse.json(
    { success: true, ...(data !== undefined && { data }), ...(message && { message }) },
    { status, ...(cookie && { headers: { 'Set-Cookie': cookie } }) }
  )
}

/**
 * Returns an error JSON response.
 * @param message - Human-readable error description
 * @param status  - HTTP status code (default 400)
 */
export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
