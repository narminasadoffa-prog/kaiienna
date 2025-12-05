'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  ShoppingBag,
  MapPin,
  CreditCard,
  Star,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  ArrowLeft,
  Phone,
  Building
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
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
  isDefault: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    images: string[];
    price: string;
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
  shippingAddress: Address;
  payments: Payment[];
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  emailVerified: string | null;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  orders: Order[];
  cart: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      images: string[];
      price: string;
    };
  }>;
  reviews: Review[];
  _count: {
    orders: number;
    cart: number;
    reviews: number;
    addresses: number;
  };
}

interface Statistics {
  totalSpent: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cartItems: number;
  reviews: number;
  addresses: number;
}

export default function UserDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/users');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchUserDetails();
  }, [session, status, router, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUserData(data.user);
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
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

  if (!userData || !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Пользователь не найден</p>
          <Link href="/admin/users">
            <Button className="mt-4">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/users">
            <Button variant="outline" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к списку пользователей
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Профиль пользователя</h1>
          <p className="text-gray-600">Полная информация о пользователе и его активности</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {userData.image ? (
                <img
                  src={userData.image}
                  alt={userData.name || userData.email}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#DAA520] flex items-center justify-center text-white text-3xl font-semibold">
                  {(userData.name || userData.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userData.name || 'Без имени'}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userData.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userData.role === 'ADMIN' ? 'Администратор' : 'Клиент'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {userData.email}
                    {userData.emailVerified && (
                      <span className="text-green-600 text-xs">✓ Подтвержден</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Зарегистрирован: {formatDate(userData.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Последнее обновление: {formatDate(userData.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Всего заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{statistics.totalOrders}</div>
              <div className="text-sm text-gray-500 mt-1">
                {statistics.completedOrders} завершено
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Общая сумма</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#DAA520]">
                {statistics.totalSpent.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Средний чек: {statistics.totalOrders > 0 
                  ? (statistics.totalSpent / statistics.totalOrders).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
                  : (0).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">В корзине</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{statistics.cartItems}</div>
              <div className="text-sm text-gray-500 mt-1">товаров</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Отзывы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{statistics.reviews}</div>
              <div className="text-sm text-gray-500 mt-1">оставлено</div>
            </CardContent>
          </Card>
        </div>

        {/* Addresses */}
        {userData.addresses.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Адреса доставки ({userData.addresses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 ${address.isDefault ? 'border-[#DAA520] bg-[#DAA520]/5' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {address.firstName} {address.lastName}
                      </h4>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-[#DAA520] text-white text-xs rounded">
                          По умолчанию
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {address.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {address.company}
                        </div>
                      )}
                      <div>{address.address1}</div>
                      {address.address2 && <div>{address.address2}</div>}
                      <div>{address.city}, {address.postalCode}</div>
                      {address.state && <div>{address.state}</div>}
                      <div>{address.country}</div>
                      {address.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {address.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Заказы ({userData.orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userData.orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Заказы отсутствуют</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userData.orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(order.createdAt)}
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
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Информация об оплате:</h4>
                          {order.payments && order.payments.length > 0 ? (
                            <div className="space-y-2">
                              {order.payments.map((payment) => (
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
                                  <div className="flex items-center justify-between">
                                    <span>Статус:</span>
                                    <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(payment.status)}`}>
                                      {payment.status === 'COMPLETED' ? 'Оплачено' :
                                       payment.status === 'PENDING' ? 'Ожидает оплаты' :
                                       payment.status === 'FAILED' ? 'Ошибка оплаты' :
                                       payment.status === 'REFUNDED' ? 'Возвращено' : payment.status}
                                    </span>
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
                        <Link href={`/admin/orders`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            Все заказы
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart Items */}
        {userData.cart.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Текущая корзина ({userData.cart.length} товаров)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData.cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border rounded-lg p-3">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-500">
                        Количество: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {parseFloat(item.product.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        Итого: {(parseFloat(item.product.price) * item.quantity).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {userData.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Отзывы ({userData.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {review.product.images[0] && (
                        <img
                          src={review.product.images[0]}
                          alt={review.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{review.product.name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <div className="font-semibold text-gray-700 mb-1">{review.title}</div>
                        )}
                        {review.comment && (
                          <div className="text-sm text-gray-600 mb-2">{review.comment}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

