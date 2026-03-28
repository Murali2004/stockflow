'use client'

import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [threshold, setThreshold] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const val = data.data.settings.defaultLowStockThreshold
          setThreshold(val != null ? String(val) : '')
        } else {
          toast.error('Failed to load settings')
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoadingData(false))
  }, [])

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultLowStockThreshold: threshold ? Number(threshold) : null,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error('Save failed', { description: data.error })
        return
      }

      toast.success('Settings saved', { description: 'Your preferences have been updated.' })
    } catch {
      toast.error('Something went wrong', { description: 'Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your organisation preferences.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Inventory defaults</p>
              <p className="text-xs text-gray-400">Applied across all products unless overridden per-product</p>
            </div>
          </div>

          <div className="px-6 py-6">
            {loadingData ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                  Default low stock threshold
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="e.g. 10"
                  className="h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-colors"
                />
                <p className="text-xs text-gray-400 pt-1">
                  Products at or below this quantity will appear as low stock alerts. Leave blank to use the system default (10).
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={saving || loadingData} className="min-w-[120px]">
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
