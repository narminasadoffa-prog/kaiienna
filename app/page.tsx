'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import { FiTruck, FiCreditCard, FiRefreshCw, FiShield } from 'react-icons/fi';
import { Loader2, Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface Banner {
  id: string;
  position: string;
  image: string;
  link?: string;
  title?: string;
  description?: string;
  active: boolean;
  order: number;
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
  quantity: number;
  featured: boolean;
  active: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { isFavorite, toggleItem } = useFavoritesStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Загрузить категории
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const allCategories: Category[] = await categoriesResponse.json();
        // Показать только основные категории (где parentId null)
        const mainCategories = allCategories.filter((cat) => !cat.parentId);
        setCategories(mainCategories);
      }

      // Загрузить баннеры
      const bannersResponse = await fetch('/api/banners');
      if (bannersResponse.ok) {
        const bannersData: Banner[] = await bannersResponse.json();
        setBanners(bannersData);
      }

      // Загрузить товары (последние 20 для masonry grid)
      const productsResponse = await fetch('/api/products?limit=20&active=true');
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularProducts = products.slice(0, 8);
  const newProducts = products.slice(4, 8);

  // Sloganlar kateqoriyalar üçün
  const getCategorySlogan = (slug: string) => {
    const slogans: { [key: string]: string } = {
      'women': 'Современная и стильная женская одежда для любого дня и настроения.',
      'men': 'Стильные решения для мужчин, ценящих современный внешний вид.',
      'kids': 'Яркие и мягкие модели, созданные для комфорта малышей.',
      'teen': 'Трендовые модели для активных и уверенных в себе подростков.',
    };
    return slogans[slug] || '';
  };

  return (
    <div>
      {/* Hero Section - New Layout */}
      <section className="w-full px-4 pb-8 -mt-40 relative z-0 pt-0">
        <div className="grid grid-cols-1 gap-4 h-[800px] min-h-[800px] pt-0">
          {/* Main Hero Banner */}
          {(() => {
            const mainBanner = banners.find(b => b.position === 'main' && b.active);
            
            if (mainBanner) {
              return (
                <Link 
                  href={mainBanner.link || '#'} 
                  className="relative overflow-hidden group cursor-pointer h-full w-full bg-black z-0"
                >
                  <img
                    src={mainBanner.image}
                    alt={mainBanner.title || 'Hero Banner'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent pointer-events-none z-10"></div>
                  
                  {/* Content Overlay */}
                  {(mainBanner.title || mainBanner.description) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                      <div className="text-center px-4 py-4 max-w-xl bg-black/40 backdrop-blur-sm rounded-xl">
                        {mainBanner.title && (
                          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-2xl animate-fade-in">
                            {mainBanner.title}
                          </h1>
                        )}
                        {mainBanner.description && (
                          <p className="text-sm md:text-base lg:text-lg text-white/90 drop-shadow-lg animate-fade-in-delay">
                            {mainBanner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            }
            
            // Default video banner if no main banner
            return (
              <div className="relative overflow-hidden group cursor-pointer h-full w-full bg-black z-0">
                <iframe
                  src="https://www.youtube.com/embed/5K0HaRoYzdk?autoplay=1&mute=1&loop=1&playlist=5K0HaRoYzdk&controls=0&showinfo=0&rel=0&modestbranding=1&fs=0&disablekb=1&iv_load_policy=3&playsinline=1"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
                  style={{ 
                    border: 'none',
                    width: '120vw',
                    height: '80vw',
                    minWidth: '100%',
                    minHeight: '100%',
                    maxWidth: 'none'
                  }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  title="Hero Banner Video"
                ></iframe>
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-10"></div>
                
                {/* Content Overlay */}
                <Link 
                  href="/category/women" 
                  className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-auto"
                >
                  <div className="text-center px-4 py-4 max-w-xl">
                    <p className="text-sm md:text-base lg:text-lg text-white/90 drop-shadow-lg mb-3 animate-fade-in">
                      Удобный шопинг, быстрая доставка, лучшие цены
                    </p>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-2xl animate-fade-in-delay">
                      Всё, что тебе нужно, в одном клике
                    </h1>
                  </div>
            </Link>
          </div>
            );
          })()}
        </div>
      </section>

      {/* Categories */}
      <section className="w-full bg-gradient-to-b from-white via-amber-50/30 to-white py-12 relative overflow-hidden mt-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-400 to-primary-600 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary-600 to-amber-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Категории</h2>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : categories && categories.length > 0 ? (
            <div>
              {/* First Row - Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {categories.map((category) => {
                  const categoryImage = category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
                  const subcategoriesCount = category.children?.length || 0;
                  const productsCount = category._count?.products || 0;

                  return (
            <Link
              key={category.id}
                      href={`/category/${category.slug}`}
                      className="group relative block overflow-hidden rounded-2xl shadow-premium hover:shadow-premium-lg transition-premium transform hover:-translate-y-3 bg-white gradient-border animate-fade-in"
                    >
                      <div className="relative h-80 md:h-96 w-full overflow-hidden bg-gray-200">
                        <img
                          src={categoryImage}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
                          }}
                        />
                        
                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-4 text-center z-10">
                          <div className="w-full max-w-md bg-black/60 backdrop-blur-sm rounded-lg p-4">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg line-clamp-2">
                              {category.name}
                            </h3>
                            {getCategorySlogan(category.slug) && (
                              <p className="text-white/95 text-xs md:text-sm drop-shadow-md mb-2 line-clamp-2">
                                {getCategorySlogan(category.slug)}
                              </p>
                            )}
                            <p className="text-white/80 text-xs drop-shadow-md mb-2">
                              {subcategoriesCount} подкатегорий • {productsCount} товаров
                            </p>
                            {/* Подкатегории */}
                            {category.children && category.children.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                                {category.children.slice(0, 3).map((sub) => (
                                  <span
                                    key={sub.id}
                                    className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30 line-clamp-1"
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                                {category.children.length > 3 && (
                                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
                                    +{category.children.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <span className="mt-1 inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold group-hover:bg-white/40 group-hover:scale-110 transition-all duration-300 border border-white/30 shadow-lg">
                              Смотреть →
                            </span>
                          </div>
                </div>
              </div>
            </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Категории не найдены</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Products Section - Masonry Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Последние наши товары</h2>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <div>
            {/* First Row - 4 Products */}
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 mb-4">
              {products.slice(0, 4).map((product, index) => {
                const heightClasses = ['h-64', 'h-96', 'h-80', 'h-72'];
                return (
                  <div
                    key={product.id}
                    className={`group relative rounded-2xl overflow-hidden bg-white animate-fade-in break-inside-avoid mb-4`}
                  >
                    <div className={`relative w-full overflow-hidden bg-gray-100 rounded-2xl ${heightClasses[index]}`}>
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
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
                      </Link>
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const wasFavorite = isFavorite(product.id);
                          toggleItem(product as any);
                          toast({
                            title: wasFavorite ? 'Удалено' : 'Добавлено',
                            description: wasFavorite 
                              ? 'Товар удален из избранного' 
                              : 'Товар добавлен в избранное',
                          });
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                          isFavorite(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
                        title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      {product.compareAtPrice && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                          Скидка
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">
                          {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </span>
                        )}
                      </div>
          </div>
        </div>
                );
              })}
            </div>

            {/* Second Row - 4 Products */}
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 mb-4">
              {products.slice(4, 8).map((product, index) => {
                const heightClasses = ['h-80', 'h-64', 'h-96', 'h-72'];
                return (
                  <div
                    key={product.id}
                    className={`group relative rounded-2xl overflow-hidden bg-white animate-fade-in break-inside-avoid mb-4`}
                  >
                    <div className={`relative w-full overflow-hidden bg-gray-100 rounded-2xl ${heightClasses[index]}`}>
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
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
                      </Link>
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const wasFavorite = isFavorite(product.id);
                          toggleItem(product as any);
                          toast({
                            title: wasFavorite ? 'Удалено' : 'Добавлено',
                            description: wasFavorite 
                              ? 'Товар удален из избранного' 
                              : 'Товар добавлен в избранное',
                          });
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                          isFavorite(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
                        title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      {product.compareAtPrice && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                          Скидка
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">
                          {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

            {/* Third Row - 4 Products (if available) */}
            {products.length > 8 && (
              <div className="columns-1 sm:columns-2 lg:columns-4 gap-4">
                {products.slice(8, 12).map((product, index) => {
                  const heightClasses = ['h-72', 'h-96', 'h-64', 'h-80'];
                  return (
                    <div
                      key={product.id}
                      className={`group relative rounded-2xl overflow-hidden bg-white animate-fade-in break-inside-avoid mb-4`}
                    >
                      <div className={`relative w-full overflow-hidden bg-gray-100 rounded-2xl ${heightClasses[index]}`}>
                        <Link href={`/product/${product.slug}`} className="block w-full h-full">
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
                        </Link>
                        {/* Wishlist Icon */}
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
                          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                            isFavorite(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                          title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                          <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                        </button>
                        {product.compareAtPrice && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                            Скидка
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
          </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary-600">
                            {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
        )}
      </section>

      {/* Trending Section */}
      {popularProducts.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold">В тренде</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('trending-slider');
                    if (container) {
                      container.scrollBy({ left: -300, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('trending-slider');
                    if (container) {
                      container.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div 
              id="trending-slider"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {popularProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative rounded-2xl overflow-hidden bg-white animate-fade-in flex-shrink-0 w-[280px] md:w-[300px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative h-64 w-full overflow-hidden bg-gray-100 rounded-2xl">
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
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
                    </Link>
                    {/* Wishlist Icon - Top Right */}
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
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                        isFavorite(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                      }`}
                      title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    {product.compareAtPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                        Скидка
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary-600">
                        {parseFloat(product.price.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {parseFloat(product.compareAtPrice.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>
      )}


      {/* Features */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <FiTruck className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-sm text-gray-600">По всей стране</p>
            </div>
            <div className="text-center">
              <FiCreditCard className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Удобная оплата</h3>
              <p className="text-sm text-gray-600">Различные способы оплаты</p>
            </div>
            <div className="text-center">
              <FiRefreshCw className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Легкий возврат</h3>
              <p className="text-sm text-gray-600">В течение 14 дней</p>
            </div>
            <div className="text-center">
              <FiShield className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Гарантия качества</h3>
              <p className="text-sm text-gray-600">Оригинальные товары</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
