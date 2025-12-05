'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Package, 
  Calendar, 
  User,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Phone,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Payment {
  id: string;
  amount: string;
  status: string;
  paymentMethod: string;
  transactionId?: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  shippingMethod?: {
    id: string;
    nameRu: string;
    estimatedDays: number | null;
  } | null;
  payments?: Payment[];
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/orders');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [session, status, router, page, userId]);

  // Refresh orders when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'authenticated' && session?.user?.role === 'ADMIN') {
        fetchOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(userId && { userId }),
        t: Date.now().toString(), // Cache-busting
      });

      const response = await fetch(`/api/orders?${params}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      
      toast({
        title: 'Успешно',
        description: `Статус заказа изменен на "${getStatusText(newStatus)}"`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус заказа',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus, paymentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      
      toast({
        title: 'Успешно',
        description: `Статус оплаты изменен на "${getPaymentStatusText(newStatus)}"`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус оплаты',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Ожидает оплаты',
      COMPLETED: 'Оплачено',
      FAILED: 'Ошибка оплаты',
      REFUNDED: 'Возвращено',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Ожидает',
      PROCESSING: 'Обрабатывается',
      SHIPPED: 'Отправлен',
      DELIVERED: 'Доставлен',
      CANCELLED: 'Отменен',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      SHIPPED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Заказы</h1>
          <p className="text-gray-600">
            {userId ? 'Заказы выбранного пользователя' : 'Управление заказами'}
          </p>
          {userId && (
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="mt-2">
                Показать все заказы
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Всего заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ожидают обработки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Доставлено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{deliveredOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Общая выручка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#DAA520]">
                {totalRevenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Список заказов</CardTitle>
            <CardDescription>
              Всего: {pagination.total} заказов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Заказы не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                              <SelectValue placeholder="Изменить статус" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Ожидает обработки</SelectItem>
                              <SelectItem value="PROCESSING">В обработке</SelectItem>
                              <SelectItem value="SHIPPED">Отправлен</SelectItem>
                              <SelectItem value="DELIVERED">Доставлен</SelectItem>
                              <SelectItem value="CANCELLED">Отменен</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {order.user.name || order.user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {parseFloat(order.total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Товары в заказе:</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                                {item.product.images[0] && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">{item.product.name}</div>
                                  <div className="text-gray-500 text-xs">
                                    Количество: {item.quantity}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    Цена: {parseFloat(item.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                                  </div>
                                  <div className="font-semibold text-[#DAA520] mt-1">
                                    Итого: {(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Адрес доставки:</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                            {order.shippingAddress.company && (
                              <div>{order.shippingAddress.company}</div>
                            )}
                            <div>{order.shippingAddress.address1}</div>
                            {order.shippingAddress.address2 && (
                              <div>{order.shippingAddress.address2}</div>
                            )}
                            <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                            {order.shippingAddress.state && (
                              <div>{order.shippingAddress.state}</div>
                            )}
                            <div>{order.shippingAddress.country}</div>
                            {order.shippingAddress.phone && (
                              <div className="flex items-center gap-1 mt-2">
                                <Phone className="w-4 h-4" />
                                {order.shippingAddress.phone}
                              </div>
                            )}
                          </div>
                          
                          {/* Shipping Method and Status */}
                          {order.shippingMethod && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700">Способ доставки:</span>
                                <span className="text-xs font-semibold text-[#DAA520]">
                                  {order.shippingMethod.nameRu}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Статус:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.status === 'DELIVERED' 
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'SHIPPED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'PROCESSING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status === 'SHIPPED' 
                                    ? order.shippingMethod.nameRu.toLowerCase().includes('почт') || order.shippingMethod.nameRu.toLowerCase().includes('poct')
                                      ? 'Отправлено почтой'
                                      : 'Кargo yola çıxıb'
                                    : order.status === 'PROCESSING'
                                    ? order.shippingMethod.nameRu.toLowerCase().includes('почт') || order.shippingMethod.nameRu.toLowerCase().includes('poct')
                                      ? 'Готовится к отправке почтой'
                                      : 'Kargo üçün hazırlanır'
                                    : order.status === 'DELIVERED'
                                    ? 'Доставлено'
                                    : getStatusText(order.status)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Информация об оплате:</h4>
                          {order.payments && order.payments.length > 0 ? (
                            <div className="space-y-2">
                              {order.payments.map((payment: any) => (
                                <div key={payment.id} className="p-3 bg-gray-50 rounded text-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Способ оплаты:</span>
                                    <span className="text-[#DAA520]">{payment.paymentMethod}</span>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span>Сумма:</span>
                                    <span className="font-semibold">
                                      {parseFloat(payment.amount.toString()).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span>Статус:</span>
                                    <Select
                                      value={payment.status}
                                      onValueChange={(value) => updatePaymentStatus(order.id, payment.id, value)}
                                      disabled={updatingOrderId === order.id}
                                    >
                                      <SelectTrigger className="w-[160px] h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PENDING">Ожидает оплаты</SelectItem>
                                        <SelectItem value="COMPLETED">Оплачено</SelectItem>
                                        <SelectItem value="FAILED">Ошибка оплаты</SelectItem>
                                        <SelectItem value="REFUNDED">Возвращено</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {payment.transactionId && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      ID транзакции: {payment.transactionId}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                              Информация об оплате отсутствует
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Товары: {parseFloat(order.subtotal).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</div>
                          {parseFloat(order.shipping) > 0 && (
                            <div>Доставка: {parseFloat(order.shipping).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</div>
                          )}
                          {parseFloat(order.tax) > 0 && (
                            <div>Налог: {parseFloat(order.tax).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</div>
                          )}
                          <div className="font-semibold text-lg text-gray-900 pt-2">
                            Итого: {parseFloat(order.total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </div>
                        </div>
                        <Link href={`/admin/users/${order.user.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Профиль клиента
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Страница {pagination.page} из {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
