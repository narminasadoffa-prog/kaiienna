'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { mockProducts, categories } from '@/lib/data';
import { useSession, signOut } from 'next-auth/react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isHomePage = pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const favoritesCount = useFavoritesStore((state) => state.items.length);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Загрузить категории для меню
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const allCategories: Category[] = await response.json();
          // Показать только основные категории (где parentId null)
          const mainCategories = allCategories.filter((cat) => !cat.parentId);
          setMenuCategories(mainCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{ type: 'product' | 'category'; name: string; link: string }> = [];
    
    // Поиск по товарам
    const productMatches = mockProducts
      .filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(p => ({
        type: 'product' as const,
        name: p.name,
        link: `/product/${(p as any).slug || p.id}`,
      }));
    
    results.push(...productMatches);
    
    // Поиск по категориям
    const categoryMatches = categories
      .filter(cat => cat.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map(cat => ({
        type: 'category' as const,
        name: cat.name,
        link: `/category/${cat.slug}`,
      }));
    
    results.push(...categoryMatches);
    
    return results;
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (link: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(link);
  };

  return (
    <>
      <header className={`relative z-[100] transition-all duration-300 ${isHomePage ? 'bg-transparent' : 'bg-black/50 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4">
          {/* Navigation Menu, Logo, Search, and Icons (Same Row) */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo (Left) */}
            <Link href="/" className="hover:scale-105 transition-transform duration-300 flex items-center flex-shrink-0">
              <img 
                src={`/logo.png?t=${Date.now()}`}
                alt="Kaiienna Logo" 
                className="object-contain"
                style={{ height: '60px', width: 'auto', maxHeight: '80px' }}
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-2xl font-bold text-[#DAA520]';
                    fallback.textContent = 'Kaiienna';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </Link>

            {/* Navigation Menu (Center) */}
            <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block flex-1`}>
              <ul className="flex flex-col md:flex-row gap-6 justify-center">
                {menuCategories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-white hover:text-white transition-all duration-300 font-medium relative group"
                    >
                      {category.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    href="/blog" 
                    className="text-white hover:text-white transition-all duration-300 font-medium relative group"
                  >
                    Блог
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Icons (Right) - Search, Favorites, Cart, User */}
            <div className="flex items-center gap-4">
              {/* Search Button - Desktop */}
              <div className="relative hidden md:block" ref={searchRef}>
                <button
                  onClick={() => setIsDesktopSearchOpen(!isDesktopSearchOpen)}
                  className="p-2 hover:text-white transition-colors text-white"
                >
                  <FiSearch className="text-xl" />
                </button>
                
                {/* Search Input Dropdown */}
                {isDesktopSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-premium-lg z-50 p-4">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        placeholder="Поиск товаров..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full px-4 py-2 pl-10 focus:outline-none focus:ring-0 transition-all duration-300 text-[#DAA520] placeholder-[#DAA520]/70 bg-transparent border border-[#DAA520] rounded-lg focus:border-[#DAA520]"
                      />
                      <button
                        type="submit"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DAA520] hover:text-[#DAA520]"
                      >
                        <FiSearch />
                      </button>
                      
                      {/* Autocomplete suggestions */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-premium-lg z-50 max-h-96 overflow-y-auto animate-slide-up">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion.link)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all duration-300 border-b border-gray-100 last:border-b-0 rounded-lg mx-1 my-1 text-gray-900"
                            >
                              <div className="flex items-center gap-2">
                                <FiSearch className="text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{suggestion.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {suggestion.type === 'product' ? 'Товар' : 'Категория'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                          {searchQuery.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowSuggestions(false);
                                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[#DAA520] font-medium border-t border-gray-200 text-gray-900"
                            >
                              Показать все результаты для "{searchQuery}"
                            </button>
                          )}
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>

              <Link
                href="/favorites"
                className="relative p-2 hover:text-white transition-all duration-300 hover:scale-110 rounded-lg hover:bg-gray-100 text-white"
              >
                <FiHeart className="text-xl" />
                {mounted && favoritesCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 hover:text-white transition-all duration-300 hover:scale-110 rounded-lg hover:bg-gray-100 text-white"
              >
                <FiShoppingCart className="text-xl" />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              {status === 'authenticated' ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 hover:text-white transition-colors flex items-center gap-2 text-white"
                  >
                    <FiUser className="text-xl" />
                    <span className="hidden md:inline text-sm font-medium">
                      {session?.user?.name || session?.user?.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-premium-lg z-50 animate-slide-up">
                      <Link
                        href="/account/profile"
                        className="block px-4 py-2 hover:bg-gray-50 transition-all duration-300 rounded-lg mx-1 my-1 text-gray-900"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Профиль
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2 hover:bg-gray-50 transition-all duration-300 rounded-lg mx-1 my-1 text-gray-900"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Заказы
                      </Link>
                      {session?.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 hover:bg-gray-50 transition-all duration-300 rounded-lg mx-1 my-1 text-gray-900"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Панель администратора
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-t border-gray-200 text-gray-900"
                      >
                        Выход
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-white hover:text-white transition-all duration-300"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-white hover:text-white transition-all duration-300"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:text-white transition-colors text-white"
              >
                {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="md:hidden pb-4 w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-4 py-2 pl-10 focus:outline-none focus:ring-0 transition-all duration-300 text-[#DAA520] placeholder-[#DAA520]/70 bg-transparent border border-[#DAA520] rounded-lg focus:border-[#DAA520]"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DAA520]" />
                
                {/* Autocomplete suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-premium-lg z-50 max-h-96 overflow-y-auto animate-slide-up">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion.link)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all duration-300 border-b border-gray-100 last:border-b-0 rounded-lg mx-1 my-1 text-gray-900"
                      >
                        <div className="flex items-center gap-2">
                          <FiSearch className="text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{suggestion.name}</p>
                            <p className="text-sm text-gray-500">
                              {suggestion.type === 'product' ? 'Товар' : 'Категория'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSuggestions(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[#DAA520] font-medium border-t border-gray-200 text-gray-900"
                      >
                        Показать все результаты для "{searchQuery}"
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

