'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { mockProducts } from '@/lib/data';
import { useState } from 'react';
import { FilterOptions } from '@/types';

export default function SalePage() {
  const [filters, setFilters] = useState<FilterOptions>({
    sizes: [],
    colors: [],
    priceRange: [0, 10000],
    materials: [],
    brands: [],
    seasons: [],
    inStock: false,
    discount: true,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const saleProducts = useMemo(() => {
    return mockProducts.filter((p) => p.discount);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Распродажа</h1>
        <p className="text-gray-600 text-lg">
          Скидки до 50% на избранные товары. Успейте купить по выгодным ценам!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        <div className="lg:w-3/4">
          <div className="mb-6">
            <p className="text-gray-600">Найдено товаров: {saleProducts.length}</p>
          </div>

          {saleProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

