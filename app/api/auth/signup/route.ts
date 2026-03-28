import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, buildSessionCookie } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'

/**
 * POST /api/auth/signup
 *
 * Creates a new Organisation and User, then starts a session.
 * Steps:
 *  1. Validate request body with Zod
 *  2. Check email is not already taken
 *  3. Hash password with bcrypt
 *  4. Create Organisation + User in a single transaction
 *  5. Sign JWT and set session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Step 1: Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      // Zod v4 uses .issues instead of .errors
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, orgName } = result.data

    // Step 2: Check for existing user
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Step 3: Hash password — bcrypt with cost factor 12
    const passwordHash = await bcrypt.hash(password, 12)

    // Step 4: Create Organisation and User atomically
    // If either insert fails, both are rolled back
    const { org, user } = await db.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: { name: orgName },
      })

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          orgId: org.id,
        },
      })

      return { org, user }
    })

    // Step 5: Sign JWT and attach session cookie to response
    const token = await signToken({ userId: user.id, orgId: org.id })

    return NextResponse.json(
      { message: 'Account created successfully' },
      {
        status: 201,
        headers: { 'Set-Cookie': buildSessionCookie(token) },
      }
    )
  } catch (error) {
    console.error('[signup]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
