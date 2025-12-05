'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    images: string[];
    category?: {
      name: string;
    };
  };
}

interface Payment {
  id: string;
  amount: string;
  status: string;
  paymentMethod: string;
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
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company: string | null;
    address1: string;
    address2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  shippingMethod?: {
    id: string;
    nameRu: string;
    estimatedDays: number | null;
  } | null;
  payments: Payment[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!orderId) {
        setError('Неверный ID заказа');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use status text
          errorData = { error: response.statusText || 'Unknown error' };
        }
        
        if (response.status === 404) {
          setError('Заказ не найден');
        } else if (response.status === 403) {
          setError('У вас нет доступа к этому заказу');
        } else if (response.status === 401) {
          setError('Необходима авторизация. Пожалуйста, войдите в систему.');
        } else if (response.status === 500) {
          setError(errorData.error || 'Ошибка сервера при загрузке заказа');
        } else {
          setError(errorData.error || `Ошибка при загрузке заказа (${response.status})`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (!data || !data.id) {
        setError('Неверный формат данных заказа');
        setLoading(false);
        return;
      }
      
      setOrder(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      
      // Network error
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        setError('Ошибка сети. Проверьте подключение к интернету.');
      } else {
        setError(error?.message || 'Ошибка при загрузке заказа');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Ожидает обработки',
      PROCESSING: 'В обработке',
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

  const getPaymentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DAA520] mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !order)) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold mb-2">
            {error ? 'Ошибка при загрузке заказа' : 'Заказ не найден'}
          </p>
          <p className="text-gray-600 mb-6">{error || 'Запрошенный заказ не существует или был удален.'}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/account/orders">
              <Button variant="outline">Вернуться к заказам</Button>
            </Link>
            <Button 
              variant="default" 
              onClick={() => {
                setError(null);
                fetchOrderDetails();
              }}
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/account/orders">
          <Button variant="outline" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад к заказам
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Детали заказа</h1>
        <p className="text-gray-600">Заказ №{order.orderNumber}</p>
      </div>

      {/* Order Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold text-lg">Статус заказа</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Дата заказа</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Товары в заказе</CardTitle>
              <CardDescription>
                {order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Link href={`/product/${item.product.id}`}>
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/product/${item.product.id}`}>
                        <h4 className="font-semibold text-lg mb-1 hover:text-[#DAA520] transition-colors">
                          {item.product.name}
                        </h4>
                      </Link>
                      {item.product.category && (
                        <p className="text-sm text-gray-500 mb-2">{item.product.category.name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Количество: {item.quantity}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {parseFloat(item.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </p>
                          <p className="text-sm text-gray-500">
                            Итого: {(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.company && (
                  <p>{order.shippingAddress.company}</p>
                )}
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                {order.shippingAddress.state && (
                  <p>{order.shippingAddress.state}</p>
                )}
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                )}
              </div>
              
              {/* Shipping Method and Status */}
              {order.shippingMethod && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Способ доставки:</span>
                    <span className="text-sm font-semibold text-[#DAA520]">
                      {order.shippingMethod.nameRu}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус доставки:</span>
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
                  {order.shippingMethod.estimatedDays && (
                    <div className="mt-2 text-xs text-gray-500">
                      Ожидаемый срок доставки: {order.shippingMethod.estimatedDays} дней
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Информация об оплате
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{payment.paymentMethod}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {parseFloat(payment.amount).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары</span>
                  <span>{parseFloat(order.subtotal).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                </div>
                {parseFloat(order.shipping) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Доставка</span>
                    <span>{parseFloat(order.shipping).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                  </div>
                )}
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Налог</span>
                    <span>{parseFloat(order.tax).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">К оплате</span>
                  <span className="text-2xl font-bold text-[#DAA520]">
                    {parseFloat(order.total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

