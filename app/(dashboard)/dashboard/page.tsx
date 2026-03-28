'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  Layers,
  IndianRupee,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface LowStockProduct {
  id: string
  name: string
  sku: string
  quantityOnHand: number
  threshold: number
}

interface DashboardStats {
  totalProducts: number
  totalQuantity: number
  totalValue: number
  lowStockCount: number
  lowStockProducts: LowStockProduct[]
}

type CardColor = 'teal' | 'blue' | 'violet' | 'red'

const colorMap: Record<CardColor, { icon: string; border: string }> = {
  teal:   { icon: 'bg-teal-100 text-teal-600',     border: 'border-l-teal-500' },
  blue:   { icon: 'bg-blue-100 text-blue-600',     border: 'border-l-blue-500' },
  violet: { icon: 'bg-violet-100 text-violet-600', border: 'border-l-violet-500' },
  red:    { icon: 'bg-red-100 text-red-600',       border: 'border-l-red-500' },
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'teal',
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color?: CardColor
}) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border border-gray-100 border-l-4 ${c.border} p-5 flex items-start gap-4 bg-white shadow-sm`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data.stats)
        else setError('Failed to load dashboard data.')
      })
      .catch(() => setError('Something went wrong.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard…
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    )
  }

  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(stats.totalValue)

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your inventory at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total products" value={String(stats.totalProducts)} color="teal" />
        <StatCard icon={Layers} label="Units in stock" value={String(stats.totalQuantity)} sub="across all products" color="blue" />
        <StatCard icon={IndianRupee} label="Inventory value" value={formattedValue} sub="cost price basis" color="violet" />
        <StatCard
          icon={AlertTriangle}
          label="Low stock alerts"
          value={String(stats.lowStockCount)}
          sub={stats.lowStockCount === 0 ? 'All good!' : 'Need attention'}
          color={stats.lowStockCount > 0 ? 'red' : 'teal'}
        />
      </div>

      {/* Low stock table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900">Low stock alerts</h2>
            {stats.lowStockCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {stats.lowStockCount}
              </Badge>
            )}
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.lowStockProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">All products well stocked</p>
            <p className="text-xs text-gray-400 mt-1">No items below their threshold right now</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SKU
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  In stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Threshold
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.lowStockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                      {p.quantityOnHand}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-400">{p.threshold}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href="/products"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Restock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
