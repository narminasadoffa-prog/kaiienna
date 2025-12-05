'use client';

import { useState } from 'react';
import { FilterOptions } from '@/types';
import { sizes, colors, materials, brands, seasons } from '@/lib/data';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  priceRange,
  onPriceRangeChange,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const handleMaterialToggle = (material: string) => {
    const newMaterials = filters.materials.includes(material)
      ? filters.materials.filter((m) => m !== material)
      : [...filters.materials, material];
    onFilterChange({ ...filters, materials: newMaterials });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleSeasonToggle = (season: string) => {
    const newSeasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];
    onFilterChange({ ...filters, seasons: newSeasons });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden mb-4 btn-secondary w-full"
      >
        {isOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
      </button>

      <aside
        className={`${
          isOpen ? 'block' : 'hidden'
        } lg:block bg-white p-6 rounded-lg shadow-md space-y-6`}
      >
        <h2 className="text-xl font-bold mb-4">Фильтры</h2>

        {/* Цена */}
        <div>
          <h3 className="font-semibold mb-2">Цена</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceRangeChange([Number(e.target.value), priceRange[1]])
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>{priceRange[0].toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span>{priceRange[1].toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Размер */}
        <div>
          <h3 className="font-semibold mb-2">Размер</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-1 rounded border ${
                  filters.sizes.includes(size)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div>
          <h3 className="font-semibold mb-2">Цвет</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`px-3 py-1 rounded border ${
                  filters.colors.includes(color)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Материал */}
        <div>
          <h3 className="font-semibold mb-2">Материал</h3>
          <div className="space-y-2">
            {materials.map((material) => (
              <label key={material} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.materials.includes(material)}
                  onChange={() => handleMaterialToggle(material)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{material}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Бренд */}
        <div>
          <h3 className="font-semibold mb-2">Бренд</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Сезон */}
        <div>
          <h3 className="font-semibold mb-2">Сезон</h3>
          <div className="space-y-2">
            {seasons.map((season) => (
              <label key={season} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.seasons.includes(season)}
                  onChange={() => handleSeasonToggle(season)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{season}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Наличие */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) =>
                onFilterChange({ ...filters, inStock: e.target.checked })
              }
              className="w-4 h-4 text-primary-600"
            />
            <span>Только в наличии</span>
          </label>
        </div>

        {/* Скидка */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.discount}
              onChange={(e) =>
                onFilterChange({ ...filters, discount: e.target.checked })
              }
              className="w-4 h-4 text-primary-600"
            />
            <span>Только со скидкой</span>
          </label>
        </div>

        <button
          onClick={() => {
            onFilterChange({
              sizes: [],
              colors: [],
              priceRange: [0, 10000],
              materials: [],
              brands: [],
              seasons: [],
              inStock: false,
              discount: false,
            });
            onPriceRangeChange([0, 10000]);
          }}
          className="w-full btn-secondary mt-4"
        >
          Сбросить фильтры
        </button>
      </aside>
    </>
  );
}

