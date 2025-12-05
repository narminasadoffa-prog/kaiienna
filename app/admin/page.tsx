'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Folder, 
  ShoppingBag, 
  Users, 
  BarChart2,
  Settings,
  LogOut,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Загрузка статистики
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // Здесь можно добавить реальные API вызовы
      // Пока используем моковые данные
      setStats({
        products: 12,
        categories: 3,
        orders: 45,
        users: 128,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const menuItems = [
    {
      title: 'Товары',
      description: 'Управление товарами',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: 'Категории',
      description: 'Управление категориями',
      icon: Folder,
      href: '/admin/categories',
      color: 'bg-green-500',
    },
    {
      title: 'Заказы',
      description: 'Управление заказами',
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-purple-500',
    },
    {
      title: 'Пользователи',
      description: 'Управление пользователями',
      icon: Users,
      href: '/admin/users',
      color: 'bg-orange-500',
    },
    {
      title: 'Аналитика',
      description: 'Статистика и отчеты',
      icon: BarChart2,
      href: '/admin/analytics',
      color: 'bg-pink-500',
    },
    {
      title: 'Баннеры',
      description: 'Управление баннерами главной страницы',
      icon: ImageIcon,
      href: '/admin/banners',
      color: 'bg-indigo-500',
    },
    {
      title: 'Статические страницы',
      description: 'Политика конфиденциальности, Контакты, Пользовательское соглашение',
      icon: FileText,
      href: '/admin/pages',
      color: 'bg-teal-500',
    },
    {
      title: 'Логотип',
      description: 'Управление логотипом сайта',
      icon: ImageIcon,
      href: '/admin/logo',
      color: 'bg-cyan-500',
    },
    {
      title: 'Настройки',
      description: 'Настройки системы',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Товары</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground">Всего товаров</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Категории</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Всего категорий</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заказы</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
              <p className="text-xs text-muted-foreground">Всего заказов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">Всего пользователей</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`${item.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
    </>
  );
}

