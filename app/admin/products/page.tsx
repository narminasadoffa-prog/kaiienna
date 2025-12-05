'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Package, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AddProductForm from '@/components/AddProductForm';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Загрузить все товары (активные и неактивные)
      const response = await fetch('/api/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched products:', data); // Debug üçün
        setProducts(data.products || []);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        toast({
          title: 'Xəta',
          description: errorData.error || 'Не удалось загрузить товары',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Xəta',
        description: 'Не удалось загрузить товары',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Uğur',
          description: 'Товар успешно удален',
        });
        fetchProducts();
      } else {
        toast({
          title: 'Xəta',
          description: 'Не удалось удалить товар',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Xəta baş verdi',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
              <p className="text-gray-600">Создание, редактирование и удаление товаров</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!confirm('Вы уверены, что хотите перевести все товары в подкатегориях на русский язык?')) {
                    return;
                  }
                  try {
                    const response = await fetch('/api/products/translate', {
                      method: 'POST',
                    });
                    const data = await response.json();
                    if (response.ok) {
                      toast({
                        title: 'Успешно',
                        description: `Переведено ${data.translated} из ${data.total} товаров. Пропущено: ${data.skipped}`,
                      });
                      fetchProducts();
                    } else {
                      toast({
                        title: 'Ошибка',
                        description: data.error || 'Не удалось перевести товары',
                        variant: 'destructive',
                      });
                    }
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось перевести товары',
                      variant: 'destructive',
                    });
                  }
                }}
                variant="outline"
              >
                Перевести товары на русский
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить товар
              </Button>
            </div>
          </div>

          {/* Поиск */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск по названию или описанию товара..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Товары ({filteredProducts.length})</CardTitle>
              <CardDescription>Список всех товаров</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Загрузка...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      {/* Şəkil */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Изображение+не+найдено'
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}
                        {product.compareAtPrice && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Скидка
                          </span>
                        )}
                        {product.featured && (
                          <span className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Рекомендуемый
                          </span>
                        )}
                      </div>

                      {/* Информация */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="text-xs text-gray-500 mb-2">
                            {product.category.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-primary-600">
                            {parseFloat(product.price.toString()).toFixed(2)} ₼
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {parseFloat(product.compareAtPrice.toString()).toFixed(2)} ₼
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>Склад: {product.quantity || 0}</span>
                          <span className={product.active ? 'text-green-600' : 'text-red-600'}>
                            {product.active ? 'Активен' : 'Неактивен'}
                          </span>
                        </div>

                        {/* Кнопки */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              // Функция редактирования будет здесь
                              toast({
                                title: 'Редактирование',
                                description: 'Функция редактирования скоро будет добавлена',
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Редактировать
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {searchTerm ? 'Товары по запросу не найдены' : 'Товаров пока нет'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить первый товар
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddProductForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </AdminGuard>
  );
}

