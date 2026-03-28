'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  productName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeleteConfirmModal({ open, productName, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onConfirm()
      toast.success('Product deleted', { description: `"${productName}" has been removed.` })
    } catch {
      toast.error('Delete failed', { description: 'Something went wrong. Please try again.' })
    } finally {
      setDeleting(false)
    }
  }

  function handleCancel() {
    toast.info('Cancelled', { description: 'No changes were made.' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !deleting) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Delete product
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-700">&ldquo;{productName}&rdquo;</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={handleCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[110px]"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
