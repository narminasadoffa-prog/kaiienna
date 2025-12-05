'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Heart, ShoppingCart } from 'lucide-react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  heroImages?: string[];
  videoUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  quantity: number;
  featured: boolean;
  active: boolean;
  variants?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const { isFavorite, toggleItem } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('new');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Kateqoriyaları yüklə
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      
      const allCategories: Category[] = await categoriesResponse.json();
      const foundCategory = allCategories.find((cat) => cat.slug === slug);
      
      if (!foundCategory) {
        setCategory(null);
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Если это основная категория, показать подкатегории
      if (!foundCategory.parentId) {
        const subs = allCategories.filter((cat) => cat.parentId === foundCategory.id);
        setSubcategories(subs);
        setSelectedSubcategoryId(null); // Показать товары всех подкатегорий

        // Получить товары всех подкатегорий
        const allProductPromises = subs.map((sub) =>
          fetch(`/api/products?categoryId=${sub.id}&active=true`).then((res) => res.json())
        );
        const allProductResults = await Promise.all(allProductPromises);
        const allProducts = allProductResults.flatMap((result) => result.products || []);
        setProducts(allProducts);
      } else {
        // Если это подкатегория, получить только её товары
        setSubcategories([]);
        setSelectedSubcategoryId(foundCategory.id);
        const productsResponse = await fetch(`/api/products?categoryId=${foundCategory.id}&active=true`);
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setProducts(data.products || []);
        }
      }
    } catch (error) {
      console.error('Error fetching category and products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтровать товары по подкатегории
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Если выбрана подкатегория, показать только товары этой подкатегории
    if (selectedSubcategoryId) {
      filtered = filtered.filter((p) => p.categoryId === selectedSubcategoryId);
    }
    
    return filtered;
  }, [products, selectedSubcategoryId]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => {
          const priceA = a.compareAtPrice ? a.compareAtPrice : a.price;
          const priceB = b.compareAtPrice ? b.compareAtPrice : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = a.compareAtPrice ? a.compareAtPrice : a.price;
          const priceB = b.compareAtPrice ? b.compareAtPrice : b.price;
          return priceB - priceA;
        });
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // 'new' - по умолчанию, уже приходит из API
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Alt kateqoriya seçildikdə
  const handleSubcategoryClick = async (subcategoryId: string) => {
    if (selectedSubcategoryId === subcategoryId) {
      // При клике на ту же подкатегорию, отменить фильтр
      setSelectedSubcategoryId(null);
      // Bütün alt kateqoriyaların məhsullarını göstər
      if (subcategories.length > 0) {
        const allProductPromises = subcategories.map((sub) =>
          fetch(`/api/products?categoryId=${sub.id}&active=true`).then((res) => res.json())
        );
        const allProductResults = await Promise.all(allProductPromises);
        const allProducts = allProductResults.flatMap((result) => result.products || []);
        setProducts(allProducts);
      }
    } else {
      setSelectedSubcategoryId(subcategoryId);
      // Получить товары выбранной подкатегории
      const productsResponse = await fetch(`/api/products?categoryId=${subcategoryId}&active=true`);
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setProducts(data.products || []);
      }
    }
  };

  // Kateqoriya üçün gradient rənglər
  const getCategoryGradient = (slug: string) => {
    const gradients: Record<string, string> = {
      women: 'from-pink-500 via-rose-500 to-purple-500',
      men: 'from-blue-500 via-indigo-500 to-cyan-500',
      kids: 'from-yellow-400 via-orange-400 to-pink-400',
      teen: 'from-green-400 via-teal-400 to-blue-400',
    };
    return gradients[slug] || 'from-primary-500 via-primary-600 to-primary-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Категория не найдена</h1>
        <p className="text-gray-600">Axtardığınız kateqoriya mövcud deyil.</p>
        <Link href="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Ana səhifəyə qayıt
        </Link>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Full Width from Header */}
      <div className={`relative w-full h-[calc(100vh-80px)] min-h-[600px] bg-gradient-to-r ${getCategoryGradient(category.slug)} overflow-hidden -mt-20 z-0`}>
        <div className={`absolute inset-0 ${category.slug === 'women' ? 'bg-black/0' : 'bg-black/5'}`}></div>
        {/* Hero Video/Image - Full Banner */}
        {category.videoUrl ? (
          <div className="absolute inset-0">
            {category.videoUrl.includes('youtube.com') || category.videoUrl.includes('youtu.be') ? (
              (() => {
                // Extract video ID from different YouTube URL formats
                let videoId = '';
                if (category.videoUrl.includes('embed/')) {
                  videoId = category.videoUrl.match(/embed\/([^?&]+)/)?.[1] || '';
                } else if (category.videoUrl.includes('watch?v=')) {
                  videoId = category.videoUrl.match(/[?&]v=([^&]+)/)?.[1] || '';
                } else if (category.videoUrl.includes('youtu.be/')) {
                  videoId = category.videoUrl.match(/youtu\.be\/([^?&]+)/)?.[1] || '';
                }
                
                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&fs=0&disablekb=1&iv_load_policy=3&playsinline=1`;
                
                return (
                  <iframe
                    src={embedUrl}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      border: 'none',
                      width: '120vw',
                      height: '67.5vw',
                      minWidth: '100%',
                      minHeight: '100%',
                      maxWidth: 'none'
                    }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen={false}
                    title="Hero Banner Video"
                  ></iframe>
                );
              })()
            ) : (
              <video
                src={category.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
            )}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-10"></div>
          </div>
        ) : category.heroImages && category.heroImages.length > 0 ? (
          <div className="absolute inset-0">
            <img
              src={category.heroImages[0]}
              alt={`${category.name} Hero`}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
              }}
            />
          </div>
        ) : category.image ? (
          <div className="absolute inset-0">
            <img
              src={category.image}
              alt={`${category.name} Hero`}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
              }}
            />
          </div>
        ) : null}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-20 pt-20">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-white/90">
            <Link href="/" className="hover:text-white transition-colors">
              Главная
            </Link>
            {category.parent && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/category/${category.parent.slug}`} className="hover:text-white transition-colors">
                  {category.parent.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl ${category.slug === 'women' ? 'font-normal text-pink-200' : 'font-bold text-white'} mb-3 drop-shadow-lg`}>
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg md:text-xl text-white/90 mb-2 drop-shadow-md max-w-2xl">
                {category.description}
              </p>
            )}
            {category._count && (
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                  {category._count.products} товаров
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20">
        {/* Фильтр подкатегорий - Full Width */}
        {subcategories.length > 0 && (
          <div className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedSubcategoryId(null);
                    // Показать товары всех подкатегорий
                    const allProductPromises = subcategories.map((sub) =>
                      fetch(`/api/products?categoryId=${sub.id}&active=true`).then((res) => res.json())
                    );
                    Promise.all(allProductPromises).then((allProductResults) => {
                      const allProducts = allProductResults.flatMap((result) => result.products || []);
                      setProducts(allProducts);
                    });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSubcategoryId === null
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>Все ({products.length})</span>
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(sub.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedSubcategoryId === sub.id
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{sub.name} {sub._count && `(${sub._count.products})`}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>

      <div className="container mx-auto px-4 py-8">
        {/* Məhsullar */}
        <div className="w-full">
          {/* Məhsullar Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Товары
              </h2>
              <p className="text-sm text-gray-500">
                Найдено {sortedProducts.length} товаров
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <option value="new">Новинки</option>
              <option value="price-low">Цена: По возрастанию</option>
              <option value="price-high">Цена: По убыванию</option>
              <option value="name">Название: А-Я</option>
            </select>
          </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Товары не найдены</p>
          <p className="text-gray-500">
            В этой категории пока нет товаров
              </p>
            </div>
          ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-premium-lg transition-premium transform hover:-translate-y-3 border border-gray-100/50 gradient-border hover-lift animate-fade-in block"
            >
              <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Изображение+не+найдено'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <span>Изображение не найдено</span>
                  </div>
                )}
                {product.compareAtPrice && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                    Скидка
                  </span>
                )}
                {product.featured && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                    ⭐ Рекомендуем
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-lg">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </span>
                  )}
                </div>
                {/* Hover düymələr - aşağıda */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Добавить в корзину
                      let result;
                      if (product.variants && product.variants.length > 0) {
                        // Если есть вариант, выбрать первый вариант
                        const firstVariant = product.variants[0];
                        const variantName = firstVariant.name.replace('Размер: ', '');
                        result = addItem(product as any, variantName, '', 1);
                      } else {
                        result = addItem(product as any, '', '', 1);
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
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    В корзину
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleItem(product as any);
                      toast({
                        title: isFavorite(product.id) ? 'Удалено' : 'Добавлено',
                        description: isFavorite(product.id) 
                          ? 'Товар удален из избранного' 
                          : 'Товар добавлен в избранное',
                      });
                    }}
                    className={`p-2 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 ${
                      isFavorite(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                {product.variants && product.variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.variants.slice(0, 4).map((variant) => (
                      <span
                        key={variant.id}
                        className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-700 border border-gray-300"
                      >
                        {variant.name.replace('Ölçü: ', '')}
                      </span>
                    ))}
                    {product.variants.length > 4 && (
                      <span className="text-xs text-gray-500 px-2 py-1.5">
                        +{product.variants.length - 4}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Stok: <span className="font-semibold text-gray-700">{product.quantity || 0}</span>
                  </p>
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Mövcuddur
                  </span>
                </div>
              </div>
            </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
