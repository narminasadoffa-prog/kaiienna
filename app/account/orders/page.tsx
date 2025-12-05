'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
    };
  }>;
}

const statusLabels: { [key: string]: string } = {
  PENDING: 'Ожидает обработки',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменен',
};

const statusIcons: { [key: string]: any } = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

const statusColors: { [key: string]: string } = {
  PENDING: 'bg-gray-100 text-gray-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account/orders');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  // Refresh orders when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'authenticated') {
        fetchOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status]);

  // Refresh orders when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchOrders();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/orders?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DAA520] mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">У вас пока нет заказов</p>
          <Link href="/" className="btn-primary inline-block">
            Перейти к покупкам
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Package;
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-[#DAA520]" />
                        <h3 className="text-lg font-bold">Заказ {order.orderNumber}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">
                        Дата: {formatDate(order.createdAt)}
                      </p>
                      <p className="text-gray-600">
                        Товаров: {totalItems} • Сумма: {parseFloat(order.total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[#DAA520] hover:underline text-sm font-medium"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

