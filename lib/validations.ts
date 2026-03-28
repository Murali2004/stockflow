import { z } from 'zod'

/**
 * Signup form schema.
 * Validates email format, minimum password length,
 * password confirmation match, and org name presence.
 */
export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    orgName: z.string().min(1, 'Organisation name is required').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

/**
 * Login form schema.
 * Minimal validation — detailed errors are intentionally vague
 * to avoid leaking whether an email exists (security best practice).
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Product create/edit form schema.
 * SKU and name are required. Prices and threshold are optional.
 * quantityOnHand defaults to 0 and cannot be negative.
 */
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'SKU can only contain letters, numbers, hyphens and underscores'),
  description: z.string().max(1000).optional(),
  quantityOnHand: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .default(0),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative').optional(),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative').optional(),
  lowStockThreshold: z.coerce
    .number()
    .int('Threshold must be a whole number')
    .min(0, 'Threshold cannot be negative')
    .optional(),
})

export type ProductInput = z.infer<typeof productSchema>

/**
 * Organisation settings schema.
 * Only one setting for now: the default low stock threshold
 * used when a product does not have its own threshold set.
 */
export const settingsSchema = z.object({
  defaultLowStockThreshold: z.coerce
    .number()
    .int('Threshold must be a whole number')
    .min(0, 'Threshold cannot be negative')
    .default(5),
})

export type SettingsInput = z.infer<typeof settingsSchema>
