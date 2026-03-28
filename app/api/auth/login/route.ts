import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, buildSessionCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

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
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Step 2: Look up user by email
    const user = await db.user.findUnique({ where: { email } })

    // Step 3: Verify password — same error for missing user and wrong
    // password intentionally avoids leaking whether the email exists
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false
    if (!user || !isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Step 4: Sign JWT with userId and orgId, set session cookie
    const token = await signToken({ userId: user.id, orgId: user.orgId })

    return NextResponse.json(
      { message: 'Logged in successfully' },
      {
        status: 200,
        headers: { 'Set-Cookie': buildSessionCookie(token) },
      }
    )
  } catch (error) {
    console.error('[login]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
