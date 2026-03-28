import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { ok, err } from '@/lib/api-response'

/**
 * Shared helper — finds a product by id and confirms it belongs to the org.
 * Returns null if not found or if it belongs to a different org (prevents
 * tenant data leakage: a 404 is indistinguishable from an unauthorised access).
 */
async function findOwnedProduct(id: string, orgId: string) {
  return db.product.findFirst({
    where: { id, orgId },
  })
}

/**
 * GET /api/products/:id
 *
 * Returns a single product. Returns 404 if the product doesn't exist
 * or belongs to a different organisation.
 *
 * Response: 200 { success: true, data: { product: Product } }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    // Next.js 16: params is a Promise — must be awaited
    const { id } = await params

    const product = await findOwnedProduct(id, orgId)
    if (!product) {
      return err('Product not found', 404)
    }

    return ok({ product })
  } catch (error) {
    console.error('[GET /api/products/:id]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}

/**
 * PUT /api/products/:id
 *
 * Updates a product. Full replacement — all fields must be provided.
 * Steps:
 *  1. Confirm product belongs to this org
 *  2. Validate request body
 *  3. Check SKU uniqueness if SKU is being changed
 *  4. Update
 *
 * Response: 200 { success: true, data: { product: Product } }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const { id } = await params

    // Step 1: Confirm ownership before reading body
    const existing = await findOwnedProduct(id, orgId)
    if (!existing) {
      return err('Product not found', 404)
    }

    const body = await request.json()

    // Step 2: Validate
    const result = productSchema.safeParse(body)
    if (!result.success) {
      // Zod v4 uses .issues instead of .errors
      return err(result.error.issues[0].message, 400)
    }

    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
      result.data

    // Step 3: If SKU is changing, check it doesn't clash with another product in this org
    if (sku !== existing.sku) {
      const skuConflict = await db.product.findUnique({
        where: { orgId_sku: { orgId, sku } },
      })
      if (skuConflict) {
        return err(`A product with SKU "${sku}" already exists`, 409)
      }
    }

    const userId = request.headers.get('x-user-id')

    // Step 4: Update
    const product = await db.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        quantityOnHand,
        costPrice: costPrice ?? null,
        sellingPrice: sellingPrice ?? null,
        lowStockThreshold: lowStockThreshold ?? null,
        lastUpdatedBy: userId,
      },
    })

    return ok({ product })
  } catch (error) {
    console.error('[PUT /api/products/:id]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}

/**
 * PATCH /api/products/:id
 *
 * Adjusts stock quantity by a relative amount (positive or negative).
 * Used by the "Adjust Stock" control on the products list.
 *
 * Body: { adjustment: number }  — e.g. 5 adds 5 units, -3 removes 3 units
 *
 * Response: 200 { success: true, data: { product: Product } }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgId = request.headers.get('x-org-id')
    const userId = request.headers.get('x-user-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const { id } = await params

    const existing = await findOwnedProduct(id, orgId)
    if (!existing) {
      return err('Product not found', 404)
    }

    const body = await request.json()
    const adjustment = body.adjustment

    if (typeof adjustment !== 'number' || !Number.isInteger(adjustment)) {
      return err('adjustment must be an integer', 400)
    }

    const newQty = existing.quantityOnHand + adjustment
    if (newQty < 0) {
      return err('Stock cannot go below zero', 400)
    }

    const product = await db.product.update({
      where: { id },
      data: {
        quantityOnHand: newQty,
        lastUpdatedBy: userId,
      },
    })

    return ok({ product })
  } catch (error) {
    console.error('[PATCH /api/products/:id]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}

/**
 * DELETE /api/products/:id
 *
 * Deletes a product. Returns 404 if not found or belongs to another org.
 *
 * Response: 200 { success: true, message: 'Product deleted successfully' }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    const { id } = await params

    // Confirm ownership before deleting
    const existing = await findOwnedProduct(id, orgId)
    if (!existing) {
      return err('Product not found', 404)
    }

    await db.product.delete({ where: { id } })

    return ok(undefined, 'Product deleted successfully')
  } catch (error) {
    console.error('[DELETE /api/products/:id]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
