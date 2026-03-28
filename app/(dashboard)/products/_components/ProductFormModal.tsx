'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  quantityOnHand: number
  costPrice: string | null
  sellingPrice: string | null
  lowStockThreshold: number | null
}

interface Props {
  open: boolean
  onClose: () => void
  /** Pass a product to edit, omit for create */
  product?: Product
  onSaved: () => void
}

const empty = {
  name: '',
  sku: '',
  description: '',
  quantityOnHand: '',
  costPrice: '',
  sellingPrice: '',
  lowStockThreshold: '',
}

export default function ProductFormModal({ open, onClose, product, onSaved }: Props) {
  const isEdit = !!product
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        description: product.description ?? '',
        quantityOnHand: String(product.quantityOnHand),
        costPrice: product.costPrice != null ? String(parseFloat(product.costPrice)) : '',
        sellingPrice: product.sellingPrice != null ? String(parseFloat(product.sellingPrice)) : '',
        lowStockThreshold: product.lowStockThreshold != null ? String(product.lowStockThreshold) : '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [product, open])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      quantityOnHand: Number(form.quantityOnHand),
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
    }

    try {
      const url = isEdit ? `/api/products/${product!.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      toast.success(isEdit ? 'Product updated' : 'Product added', {
        description: isEdit ? 'Changes saved successfully.' : 'New product added to your inventory.',
      })
      onSaved()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-colors'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update product details and inventory levels.'
              : 'Fill in the details below to add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Core details */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Core details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-name" className="text-sm font-medium text-gray-700">
                  Product name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="modal-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Blue T-Shirt"
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-sku" className="text-sm font-medium text-gray-700">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="modal-sku"
                  value={form.sku}
                  onChange={(e) => update('sku', e.target.value)}
                  placeholder="e.g. BTS-001"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-desc" className="text-sm font-medium text-gray-700">
                Description{' '}
                <span className="text-xs text-gray-400 font-normal">optional</span>
              </Label>
              <Input
                id="modal-desc"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Short product description"
                className={inputClass}
              />
            </div>
          </div>

          {/* Stock & pricing */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Stock & pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-qty" className="text-sm font-medium text-gray-700">
                  Quantity in stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="modal-qty"
                  type="number"
                  min="0"
                  value={form.quantityOnHand}
                  onChange={(e) => update('quantityOnHand', e.target.value)}
                  placeholder="0"
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-threshold" className="text-sm font-medium text-gray-700">
                  Low stock alert at{' '}
                  <span className="text-xs text-gray-400 font-normal">optional</span>
                </Label>
                <Input
                  id="modal-threshold"
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => update('lowStockThreshold', e.target.value)}
                  placeholder="Uses org default"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-cost" className="text-sm font-medium text-gray-700">
                  Cost price{' '}
                  <span className="text-xs text-gray-400 font-normal">optional</span>
                </Label>
                <Input
                  id="modal-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => update('costPrice', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-sell" className="text-sm font-medium text-gray-700">
                  Selling price{' '}
                  <span className="text-xs text-gray-400 font-normal">optional</span>
                </Label>
                <Input
                  id="modal-sell"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => update('sellingPrice', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[110px]">
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
