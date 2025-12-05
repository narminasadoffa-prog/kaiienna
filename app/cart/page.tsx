'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface ShippingMethod {
  id: string;
  nameRu: string;
  descriptionRu: string | null;
  cost: string;
  estimatedDays: number | null;
  active: boolean;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const total = getTotal();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const { selectedShippingMethodId, setSelectedShippingMethod } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping-methods?activeOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }
      const data = await response.json();
      setShippingMethods(data);
      if (data.length > 0 && !selectedShippingMethodId) {
        setSelectedShippingMethod(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = shippingMethods.find(m => m.id === selectedShippingMethodId);
  const shippingCost = selectedMethod ? parseFloat(selectedMethod.cost) : 0;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Ваша корзина пуста</p>
          <Link href="/" className="btn-primary inline-block">
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            const price = item.product.discount
              ? item.product.price * (1 - item.product.discount / 100)
              : item.product.price;
            const itemTotal = price * item.quantity;

            return (
              <div key={index} className="glass-card p-6 hover-lift">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-premium">
                    <Image
                      src={item.product.images[0] || 'https://via.placeholder.com/200'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/product/${(item.product as any).slug || item.product.id}`}
                      className="font-semibold text-lg hover:text-primary-600 mb-2 block"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>Размер: {item.size}</span>
                      {' • '}
                      <span>Цвет: {item.color}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const result = updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1
                            );
                            if (!result.success && result.message) {
                              toast({
                                title: 'Ошибка',
                                description: result.message,
                                variant: 'destructive',
                              });
                            }
                          }}
                          className="w-8 h-8 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-amber-50 hover:border-primary-300 transition-all duration-300 hover:scale-110 flex items-center justify-center"
                        >
                          <FiMinus />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const result = updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1
                            );
                            if (!result.success && result.message) {
                              toast({
                                title: 'Ошибка',
                                description: result.message,
                                variant: 'destructive',
                              });
                            }
                          }}
                          className="w-8 h-8 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-amber-50 hover:border-primary-300 transition-all duration-300 hover:scale-110 flex items-center justify-center"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {Math.round(itemTotal).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.round(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })} за шт.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                    className="text-red-600 hover:text-red-700 p-2"
                    aria-label="Удалить"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Очистить корзину
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Итого</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>{Math.round(total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="mb-4 border-t pt-4">
              <h3 className="font-semibold mb-3">Способ доставки</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Загрузка...</p>
              ) : shippingMethods.length === 0 ? (
                <p className="text-sm text-gray-500">Методы доставки не доступны</p>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div key={method.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedShippingMethod(method.id)}>
                      <input
                        type="radio"
                        id={method.id}
                        name="shippingMethod"
                        value={method.id}
                        checked={selectedShippingMethodId === method.id}
                        onChange={() => setSelectedShippingMethod(method.id)}
                        className="mt-1 w-4 h-4 text-[#DAA520] focus:ring-[#DAA520]"
                      />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{method.nameRu}</div>
                            {method.descriptionRu && (
                              <div className="text-xs text-gray-500 mt-1">{method.descriptionRu}</div>
                            )}
                            {method.estimatedDays && (
                              <div className="text-xs text-gray-500">Срок: {method.estimatedDays} дней</div>
                            )}
                          </div>
                          <div className="font-semibold text-[#DAA520] ml-4">
                            {parseFloat(method.cost).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-gray-600 mt-3 pt-3 border-t">
                <span>Доставка</span>
                <span>
                  {shippingCost === 0 
                    ? 'Бесплатно' 
                    : shippingCost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>К оплате</span>
                <span className="text-primary-600">
                  {Math.round(finalTotal).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Промокод"
                className="input-field mb-2"
              />
              <button className="w-full btn-secondary text-sm py-2">
                Применить промокод
              </button>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center block">
              Оформить заказ
            </Link>

            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p>✓ Бесплатная доставка от {(3000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p>✓ Возврат в течение 14 дней</p>
              <p>✓ Безопасная оплата</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

