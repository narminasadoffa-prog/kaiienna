'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Package, Image as ImageIcon, X } from 'lucide-react'
import AddProductForm from '@/components/AddProductForm'
import Image from 'next/image'

interface CategoryProductsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: {
    id: string
    name: string
    slug: string
    description?: string
  } | null
}

export default function CategoryProductsModal({
  open,
  onOpenChange,
  category,
}: CategoryProductsModalProps) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && category) {
      fetchProducts()
    }
  }, [open, category])

  const fetchProducts = async () => {
    if (!category) return

    try {
      setLoading(true)
      const response = await fetch(`/api/products?categoryId=${category.id}`)
      if (response.ok) {
        const data = await response.json()
        // API returns { products: [...], pagination: {...} } or just array
        setProducts(data.products || data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductAdded = () => {
    fetchProducts()
    setIsAddProductOpen(false)
  }

  if (!category) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {category.name} - Товары
            </DialogTitle>
            <DialogDescription>
              {category.description || `Товары категории ${category.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Кнопка добавления товара */}
            <div className="flex justify-end">
              <Button onClick={() => setIsAddProductOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить новый товар
              </Button>
            </div>

            {/* Список товаров */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h4 className="font-semibold text-lg mb-1 line-clamp-2">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-primary-600">
                            {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </p>
                          {product.compareAtPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Stok: {product.quantity || 0}
                        </div>
                      </div>
                      {product.images && product.images.length > 1 && (
                        <div className="mt-2 flex gap-1">
                          {product.images.slice(0, 3).map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative w-10 h-10 rounded border overflow-hidden"
                            >
                              <Image
                                src={img}
                                alt={`${product.name} ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {product.images.length > 3 && (
                            <div className="w-10 h-10 rounded border flex items-center justify-center text-xs text-gray-500 bg-gray-100">
                              +{product.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">В этой категории пока нет товаров</p>
                <Button onClick={() => setIsAddProductOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первый товар
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Form Modal */}
      <AddProductForm
        open={isAddProductOpen}
        onOpenChange={(open) => {
          setIsAddProductOpen(open)
          if (!open) {
            // Modal bağlananda məhsulları yenilə
            fetchProducts()
          }
        }}
        onSuccess={handleProductAdded}
        defaultCategoryId={category?.id}
      />
    </>
  )
}

