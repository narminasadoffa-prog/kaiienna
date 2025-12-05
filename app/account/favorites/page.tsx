'use client';

import ProductCard from '@/components/ProductCard';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function FavoritesPage() {
  const { items } = useFavoritesStore();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Избранное</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">В избранном пока ничего нет</p>
          <p className="text-gray-500 mb-6">
            Добавляйте понравившиеся товары в избранное, чтобы не потерять их
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

