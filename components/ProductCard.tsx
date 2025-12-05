'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { Product } from '@/types';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleItem } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const favorite = isFavorite(product.id);
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    let result;
    // Если есть sizes и colors, используем их
    if (product.sizes && product.sizes.length > 0 && product.colors && product.colors.length > 0) {
      result = addItem(product, product.sizes[0], product.colors[0], 1);
    } else {
      // Иначе отправляем пустую строку
      result = addItem(product, '', '', 1);
    }
    
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

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${(product as any).slug || product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400'
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <span>Изображение отсутствует</span>
            </div>
          )}
          {(product.discount || (product as any).compareAtPrice) && (
            <span className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-bold">
              {product.discount ? `-${product.discount}%` : 'Скидка'}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product);
            }}
            className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-primary-600 transition-colors ${
              favorite ? 'text-primary-600' : 'text-gray-600'
            }`}
            aria-label="Добавить в избранное"
          >
            <FiHeart className={favorite ? 'fill-current' : ''} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-primary-600">
              {typeof finalPrice === 'number' 
                ? Math.round(finalPrice).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
                : parseFloat(finalPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
            </span>
            {(product.originalPrice || (product as any).compareAtPrice) && (
              <span className="text-gray-400 line-through text-sm">
                {product.originalPrice 
                  ? product.originalPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
                  : parseFloat((product as any).compareAtPrice?.toString() || '0').toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </span>
            )}
          </div>
          {(product.rating || product.reviewsCount) && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {product.reviewsCount !== undefined && (
                <span className="text-sm text-gray-500">({product.reviewsCount})</span>
              )}
            </div>
          )}
          <button
            onClick={handleQuickAdd}
            className="w-full btn-primary text-sm py-2"
          >
            В корзину
          </button>
        </div>
      </Link>
    </div>
  );
}

