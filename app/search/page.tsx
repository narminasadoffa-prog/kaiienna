'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { mockProducts, categories } from '@/lib/data';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState<string>('popular');

  const { filteredProducts, categoryMatches } = useMemo(() => {
    if (!query) return { filteredProducts: [], categoryMatches: [] };

    const queryLower = query.toLowerCase();
    
    // Поиск по товарам
    let products = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.category.toLowerCase().includes(queryLower) ||
        p.subcategory.toLowerCase().includes(queryLower) ||
        p.brand.toLowerCase().includes(queryLower) ||
        p.material.toLowerCase().includes(queryLower)
    );

    // Поиск по категориям
    const categoryMatches = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(queryLower) ||
        cat.subcategories.some((sub) => sub.name.toLowerCase().includes(queryLower))
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        products.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'new':
        products.reverse();
        break;
      default:
        products.sort((a, b) => b.rating - a.rating);
    }

    return { filteredProducts: products, categoryMatches };
  }, [query, sortBy]);

  const sortedProducts = useMemo(() => {
    let products = [...filteredProducts];
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        products.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'new':
        products.reverse();
        break;
      default:
        products.sort((a, b) => b.rating - a.rating);
    }
    
    return products;
  }, [filteredProducts, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {query ? `Результаты поиска: "${query}"` : 'Поиск товаров'}
      </h1>

      {query && (
        <>
          {/* Category matches */}
          {categoryMatches.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Категории</h2>
              <div className="flex flex-wrap gap-3">
                {categoryMatches.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Найдено товаров: {sortedProducts.length}</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">По популярности</option>
              <option value="price-low">Цена: по возрастанию</option>
              <option value="price-high">Цена: по убыванию</option>
              <option value="new">Сначала новые</option>
            </select>
          </div>
        </>
      )}

      {!query ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Введите запрос для поиска</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Товары не найдены</p>
          <p className="text-gray-400 mt-2">Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

