'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Package, 
  Folder, 
  ShoppingBag, 
  Users, 
  BarChart2,
  Settings,
  Image as ImageIcon,
  FileText,
  LogOut,
  Truck
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const menuItems = [
  {
    title: 'Главная',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Товары',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Категории',
    href: '/admin/categories',
    icon: Folder,
  },
  {
    title: 'Заказы',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Пользователи',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Доставка',
    href: '/admin/shipping-methods',
    icon: Truck,
  },
  {
    title: 'Блог',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    title: 'Баннеры',
    href: '/admin/banners',
    icon: ImageIcon,
  },
  {
    title: 'Статические страницы',
    href: '/admin/pages',
    icon: FileText,
  },
  {
    title: 'Логотип',
    href: '/admin/logo',
    icon: ImageIcon,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit sticky top-24">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Панель администратора</h2>
        <p className="text-xs text-gray-500">Управление сайтом</p>
      </div>
      
      <nav className="space-y-1 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#DAA520] text-white font-medium shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#DAA520]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 w-full"
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          <span className="text-sm">Выйти</span>
        </button>
      </div>
    </div>
  );
}

