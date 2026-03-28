'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  product: { id: string; name: string; sku: string; quantityOnHand: number } | null
  onAdjusted: () => void
}

export default function AdjustStockModal({ open, onClose, product, onAdjusted }: Props) {
  const [adjustment, setAdjustment] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setAdjustment('')
      setNote('')
    }
  }, [open])

  const parsedAdj = parseInt(adjustment, 10)
  const isValid = !isNaN(parsedAdj) && parsedAdj !== 0
  const newQty = product ? product.quantityOnHand + (isValid ? parsedAdj : 0) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !isValid) return
    setSaving(true)

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment: parsedAdj }),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error('Adjustment failed', { description: data.error })
        return
      }

      toast.success('Stock adjusted', {
        description: `${product.name} is now ${newQty} unit${newQty !== 1 ? 's' : ''}.`,
      })
      onAdjusted()
      onClose()
    } catch {
      toast.error('Something went wrong', { description: 'Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-700">{product.name}</span>{' '}
            <span className="font-mono text-xs text-gray-400">({product.sku})</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current qty display */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <span className="text-sm text-gray-500">Current stock</span>
            <span className="text-lg font-bold text-gray-900">{product.quantityOnHand}</span>
          </div>

          {/* Adjustment input */}
          <div className="space-y-1.5">
            <Label htmlFor="adjustment" className="text-sm font-medium text-gray-700">
              Adjustment (+/- units)
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdjustment((v) => String((parseInt(v, 10) || 0) - 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <Input
                id="adjustment"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="e.g. +5 or -3"
                className="h-10 text-center border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setAdjustment((v) => String((parseInt(v, 10) || 0) + 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            {/* Live preview */}
            {isValid && (
              <p className={`text-xs font-medium pt-0.5 ${newQty < 0 ? 'text-red-500' : 'text-teal-600'}`}>
                New quantity will be: <span className="font-bold">{newQty}</span>
              </p>
            )}
          </div>

          {/* Note (not stored — for reference during adjustment) */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-sm font-medium text-gray-700">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received new shipment"
              className="h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-colors"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !isValid || newQty < 0}>
              {saving ? 'Saving…' : 'Apply adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
