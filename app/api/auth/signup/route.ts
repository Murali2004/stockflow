import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, buildSessionCookie } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'
import { BCRYPT_SALT_ROUNDS } from '@/lib/constants'
import { okWithCookie, err } from '@/lib/api-response'

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
      return err(result.error.issues[0].message, 400)
    }

    const { email, password, orgName } = result.data

    // Step 2: Check for existing user
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return err('An account with this email already exists', 409)
    }

    // Step 3: Hash password using configured salt rounds
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

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

    return okWithCookie(undefined, 'Account created successfully', buildSessionCookie(token), 201)
  } catch (error) {
    console.error('[signup]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
