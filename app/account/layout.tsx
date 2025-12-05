'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FiUser, 
  FiPackage, 
  FiHeart, 
  FiMapPin, 
  FiCreditCard, 
  FiRefreshCw,
  FiHome
} from 'react-icons/fi';

const navigationItems = [
  { href: '/account', icon: FiHome, label: 'Главная' },
  { href: '/account/profile', icon: FiUser, label: 'Профиль' },
  { href: '/account/orders', icon: FiPackage, label: 'Мои заказы' },
  { href: '/account/favorites', icon: FiHeart, label: 'Избранное' },
  { href: '/account/addresses', icon: FiMapPin, label: 'Адреса доставки' },
  { href: '/account/payments', icon: FiCreditCard, label: 'История оплат' },
  { href: '/account/returns', icon: FiRefreshCw, label: 'Возвраты и обмены' },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Личный кабинет</h2>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/account' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#DAA520] text-white font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#DAA520]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}

