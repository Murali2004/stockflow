import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { settingsSchema } from '@/lib/validations'
import { ok, err } from '@/lib/api-response'

/**
 * GET /api/settings
 *
 * Returns the current organisation settings.
 * Currently exposes only defaultLowStockThreshold.
 *
 * Response: 200 { success: true, data: { settings: { defaultLowStockThreshold } } }
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const org = await db.organisation.findUnique({
      where: { id: orgId },
      select: { defaultLowStockThreshold: true },
    })

    if (!org) {
      return err('Organisation not found', 404)
    }

    return ok({ settings: { defaultLowStockThreshold: org.defaultLowStockThreshold } })
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}

/**
 * PUT /api/settings
 *
 * Updates the organisation settings.
 * Validates input with Zod before writing to DB.
 *
 * Response: 200 { success: true, data: { settings: { defaultLowStockThreshold } } }
 */
export async function PUT(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const body = await request.json()

    // Validate input
    const result = settingsSchema.safeParse(body)
    if (!result.success) {
      // Zod v4 uses .issues instead of .errors
      return err(result.error.issues[0].message, 400)
    }

    const { defaultLowStockThreshold } = result.data

    const org = await db.organisation.update({
      where: { id: orgId },
      data: { defaultLowStockThreshold },
      select: { defaultLowStockThreshold: true },
    })

    return ok({ settings: { defaultLowStockThreshold: org.defaultLowStockThreshold } })
  } catch (error) {
    console.error('[PUT /api/settings]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
