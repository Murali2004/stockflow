import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { ok, err } from '@/lib/api-response'

/**
 * GET /api/products
 *
 * Returns all products belonging to the authenticated user's organisation.
 * Supports optional ?search= query param for filtering by name or SKU.
 * orgId is read from the x-org-id header set by middleware (already verified).
 *
 * Response: 200 { success: true, data: { products: Product[] } }
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.trim()

    const products = await db.product.findMany({
      where: {
        orgId,
        // If a search term is provided, filter by name OR sku (case-insensitive)
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ products })
  } catch (error) {
    console.error('[GET /api/products]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}

/**
 * POST /api/products
 *
 * Creates a new product for the authenticated organisation.
 * Steps:
 *  1. Read orgId from middleware-injected header
 *  2. Validate request body with Zod
 *  3. Check for duplicate SKU within this org (enforced by DB unique constraint too)
 *  4. Insert product scoped to this org
 *
 * Response: 201 { success: true, data: { product: Product } }
 */
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const body = await request.json()

    // Step 2: Validate input
    const result = productSchema.safeParse(body)
    if (!result.success) {
      // Zod v4 uses .issues instead of .errors
      return err(result.error.issues[0].message, 400)
    }

    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
      result.data

    // Step 3: Check for duplicate SKU within this org
    const existing = await db.product.findUnique({
      where: { orgId_sku: { orgId, sku } },
    })
    if (existing) {
      return err(`A product with SKU "${sku}" already exists`, 409)
    }

    const userId = request.headers.get('x-user-id')

    // Step 4: Create product scoped to this organisation
    const product = await db.product.create({
      data: {
        orgId,
        name,
        sku,
        description,
        quantityOnHand,
        // Prisma expects Decimal fields as strings or numbers
        costPrice: costPrice ?? null,
        sellingPrice: sellingPrice ?? null,
        lowStockThreshold: lowStockThreshold ?? null,
        lastUpdatedBy: userId,
      },
    })

    return ok({ product }, undefined, 201)
  } catch (error) {
    console.error('[POST /api/products]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
