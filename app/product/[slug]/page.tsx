'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Heart, ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
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
  variants?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { isFavorite, toggleItem } = useFavoritesStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Сначала загрузить все товары и найти по slug
      const response = await fetch('/api/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const foundProduct = (data.products || data).find((p: Product) => p.slug === slug);
        if (foundProduct) {
          setProduct(foundProduct);
          // Əgər variant varsa, birinci variantı seç
          if (foundProduct.variants && foundProduct.variants.length > 0) {
            setSelectedVariant(foundProduct.variants[0].name.replace('Размер: ', ''));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Требуется выбор варианта
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите размер',
        variant: 'destructive',
      });
      return;
    }

    const result = addItem(product as any, selectedVariant || '', '', quantity);
    
    if (result.success) {
      toast({
        title: 'Успешно',
        description: 'Товар добавлен в корзину',
      });
    } else {
      toast({
        title: 'Ошибка',
        description: result.message || 'Не удалось добавить товар в корзину',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Товар не найден</h1>
        <p className="text-gray-600 mb-4">Искомый товар не существует.</p>
        <Link href="/" className="text-primary-600 hover:underline">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const finalPrice = product.compareAtPrice || product.price;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-600">
          Главная
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-premium group">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600?text=Şəkil+Yoxdur'
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <span>Şəkil yoxdur</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 hover:scale-110 cursor-pointer ${
                    selectedImage === idx ? 'border-primary-600 shadow-glow scale-105' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100?text=Şəkil'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
            <button
              onClick={() => {
                const wasFavorite = isFavorite(product.id);
                toggleItem(product as any);
                toast({
                  title: wasFavorite ? 'Удалено' : 'Добавлено',
                  description: wasFavorite 
                    ? 'Товар удален из избранного' 
                    : 'Товар добавлен в избранное',
                });
              }}
              className={`p-3 rounded-full border-2 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-glow ${
                isFavorite(product.id)
                  ? 'border-primary-600 text-primary-600 bg-gradient-to-r from-primary-50 to-amber-50 shadow-glow'
                  : 'border-gray-300 text-gray-600 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-primary-600">
                {parseFloat(finalPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                  -{Math.round(((product.price - product.compareAtPrice) / product.price) * 100)}%
                </span>
              )}
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900">Размер:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const variantName = variant.name.replace('Размер: ', '');
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variantName)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        selectedVariant === variantName
                          ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-amber-50 text-primary-600 font-semibold shadow-glow'
                          : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {variantName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900">Количество:</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.active || product.quantity === 0 || (product.variants && product.variants.length > 0 && !selectedVariant)}
            className="w-full bg-gradient-to-r from-primary-600 to-amber-600 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-amber-700 transition-all duration-300 mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-premium hover:shadow-glow hover:scale-105 ripple-effect"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.active && product.quantity > 0 ? 'Добавить в корзину' : 'Недоступно'}
          </button>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="text-primary-600" />
              <span>Бесплатная доставка от 50 ₼</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="text-primary-600" />
              <span>Гарантия качества</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="text-primary-600" />
              <span>Возврат в течение 14 дней</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Описание</h2>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="mb-12 animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent">Информация о товаре</h2>
        <div className="glass-card border border-gray-100/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600 text-sm">Склад:</span>
              <p className="font-semibold text-gray-900">{product.quantity || 0} шт.</p>
            </div>
            {product.category && (
              <div>
                <span className="text-gray-600 text-sm">Категория:</span>
                <p className="font-semibold text-gray-900">{product.category.name}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600 text-sm">Статус:</span>
              <p className="font-semibold text-gray-900">{product.active ? 'Активен' : 'Неактивен'}</p>
            </div>
            {product.variants && product.variants.length > 0 && (
              <div>
                <span className="text-gray-600 text-sm">Доступные размеры:</span>
                <p className="font-semibold text-gray-900">{product.variants.length} размеров</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

