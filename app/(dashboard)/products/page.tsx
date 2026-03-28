'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ProductFormModal from './_components/ProductFormModal'
import DeleteConfirmModal from './_components/DeleteConfirmModal'
import AdjustStockModal from './_components/AdjustStockModal'

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Adjust stock modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const url = q ? `/api/products?search=${encodeURIComponent(q)}` : '/api/products'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setProducts(data.data.products)
      else setError('Failed to load products.')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts('') }, [fetchProducts])

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 300)
    return () => clearTimeout(t)
  }, [search, fetchProducts])

  function openCreate() {
    setEditingProduct(undefined)
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  function openDelete(product: Product) {
    setDeletingProduct(product)
    setDeleteModalOpen(true)
  }

  function openAdjust(product: Product) {
    setAdjustingProduct(product)
    setAdjustModalOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return
    const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      setDeleteModalOpen(false)
      setDeletingProduct(null)
    } else {
      throw new Error(data.error ?? 'Delete failed.')
    }
  }

  const fmt = (val: string | null) =>
    val ? `₹${parseFloat(val).toFixed(2)}` : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 border-gray-200 bg-white"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try a different name or SKU' : 'Add your first product to get started'}
            </p>
            {!search && (
              <Button size="sm" className="mt-4" onClick={openCreate}>
                Add product
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const isLow = p.lowStockThreshold !== null && p.quantityOnHand <= p.lowStockThreshold
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{p.name}</span>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 ring-1 ring-red-200">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Low
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{p.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge variant={isLow ? 'destructive' : 'secondary'} className="text-xs font-semibold">
                        {p.quantityOnHand}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">{fmt(p.costPrice)}</td>
                    <td className="px-6 py-3.5 text-right text-gray-600">{fmt(p.sellingPrice)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAdjust(p)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Adjust
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(p)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal (add / edit) */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSaved={() => fetchProducts(search)}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        productName={deletingProduct?.name ?? ''}
        onClose={() => { setDeleteModalOpen(false); setDeletingProduct(null) }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Adjust stock modal */}
      <AdjustStockModal
        open={adjustModalOpen}
        product={adjustingProduct}
        onClose={() => { setAdjustModalOpen(false); setAdjustingProduct(null) }}
        onAdjusted={() => fetchProducts(search)}
      />
    </div>
  )
}
