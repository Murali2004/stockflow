import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, buildSessionCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { okWithCookie, err } from '@/lib/api-response'

/**
 * POST /api/auth/login
 *
 * Authenticates an existing user and starts a session.
 * Steps:
 *  1. Validate request body with Zod
 *  2. Look up user by email
 *  3. Compare submitted password against stored hash
 *  4. Sign JWT and set session cookie
 *
 * Security: Both "user not found" and "wrong password" return
 * the same generic error to prevent email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Step 1: Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      // Zod v4 uses .issues instead of .errors
      return err(result.error.issues[0].message, 400)
    }

    const { email, password } = result.data

    // Step 2: Look up user by email
    const user = await db.user.findUnique({ where: { email } })

    // Step 3: Verify password — same error for missing user and wrong
    // password intentionally avoids leaking whether the email exists
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false
    if (!user || !isValid) {
      return err('Invalid email or password', 401)
    }

    // Step 4: Sign JWT with userId and orgId, set session cookie
    const token = await signToken({ userId: user.id, orgId: user.orgId })

    return okWithCookie(undefined, 'Logged in successfully', buildSessionCookie(token), 200)
  } catch (error) {
    console.error('[login]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
