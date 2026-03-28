import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/lib/constants'
import { ok, err } from '@/lib/api-response'

/**
 * GET /api/dashboard
 *
 * Returns summary statistics and low-stock alerts for the org's dashboard.
 *
 * Stats returned:
 *  - totalProducts    : total number of products in this org
 *  - totalValue       : sum of (quantityOnHand × costPrice) across all products
 *  - lowStockCount    : number of products at or below their low stock threshold
 *  - lowStockProducts : the actual products that are low stock (for the alert table)
 *
 * Low stock threshold priority (per product):
 *  1. product.lowStockThreshold  (product-level override)
 *  2. org.defaultLowStockThreshold (org-level default)
 *  3. DEFAULT_LOW_STOCK_THRESHOLD constant (system fallback)
 *
 * Response: 200 { success: true, data: { stats } }
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    if (!orgId) {
      return err('Unauthorised', 401)
    }

    // Fetch org settings and all products in one round-trip
    const [org, products] = await Promise.all([
      db.organisation.findUnique({
        where: { id: orgId },
        select: { defaultLowStockThreshold: true },
      }),
      db.product.findMany({
        where: { orgId },
        select: {
          id: true,
          name: true,
          sku: true,
          quantityOnHand: true,
          costPrice: true,
          lowStockThreshold: true,
        },
      }),
    ])

    if (!org) {
      return err('Organisation not found', 404)
    }

    // Org-level default (falls back to system constant if org has no override)
    const orgDefault = org.defaultLowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD

    // Calculate summary stats and identify low-stock products
    let totalValue = 0
    let totalQuantity = 0
    const lowStockProducts = []

    for (const product of products) {
      // Sum total units across all products
      totalQuantity += product.quantityOnHand

      // Sum value: quantity × cost price (skip products with no cost price)
      if (product.costPrice !== null) {
        totalValue += product.quantityOnHand * Number(product.costPrice)
      }

      // Determine this product's effective threshold
      const threshold = product.lowStockThreshold ?? orgDefault

      // Flag as low stock if quantity is at or below the threshold
      if (product.quantityOnHand <= threshold) {
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          quantityOnHand: product.quantityOnHand,
          threshold,
        })
      }
    }

    return ok({
      stats: {
        totalProducts: products.length,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100, // round to 2 decimal places
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return err('Something went wrong. Please try again.', 500)
  }
}
