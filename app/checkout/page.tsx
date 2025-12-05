'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotal, clearCart, selectedShippingMethodId, setSelectedShippingMethod } = useCartStore();
  const { toast } = useToast();
  const total = getTotal();
  
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethodState] = useState<string | null>(selectedShippingMethodId);
  const [shippingCost, setShippingCost] = useState(0);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && items.length > 0) {
      setShowRegisterForm(true);
    }
  }, [status, items.length]);

  useEffect(() => {
    if (session?.user) {
      // Auto-fill user data from session
      setFormData(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
      
      // Fetch user addresses and last order to auto-fill
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    if (!session?.user) return;

    try {
      // Fetch user addresses
      const addressesResponse = await fetch('/api/addresses');
      if (addressesResponse.ok) {
        const addresses = await addressesResponse.json();
        if (addresses.length > 0) {
          // Use default address or last address
          const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
          setFormData(prev => ({
            ...prev,
            street: defaultAddress.address1 || prev.street,
            city: defaultAddress.city || prev.city,
            postalCode: defaultAddress.postalCode || prev.postalCode,
            phone: defaultAddress.phone || prev.phone,
          }));
        }
      }

      // Fetch last order to get phone number if available
      const ordersResponse = await fetch('/api/orders?limit=1');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.orders && ordersData.orders.length > 0) {
          const lastOrder = ordersData.orders[0];
          if (lastOrder.shippingAddress?.phone && !formData.phone) {
            setFormData(prev => ({
              ...prev,
              phone: lastOrder.shippingAddress.phone || prev.phone,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch('/api/shipping-methods?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setShippingMethods(data);
        if (data.length > 0) {
          const methodId = selectedShippingMethodId || data[0].id;
          setSelectedShippingMethodState(methodId);
          setSelectedShippingMethod(methodId);
          const method = data.find((m: any) => m.id === methodId) || data[0];
          setShippingCost(parseFloat(method.cost));
        }
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    }
  };

  useEffect(() => {
    if (selectedShippingMethod) {
      const method = shippingMethods.find((m: any) => m.id === selectedShippingMethod);
      if (method) {
        setShippingCost(parseFloat(method.cost));
        setSelectedShippingMethod(selectedShippingMethod);
      }
    }
  }, [selectedShippingMethod, shippingMethods]);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
      setShowRegisterForm(false);
    }
  }, [session]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ваше имя',
        variant: 'destructive',
      });
      return;
    }

    if (!registerData.email || !registerData.email.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен содержать минимум 6 символов',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Произошла ошибка при регистрации',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Успешно',
        description: 'Регистрация успешно завершена. Вход...',
      });

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: registerData.email,
        password: registerData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/auth/signin');
      } else {
        setShowRegisterForm(false);
        toast({
          title: 'Успешно',
          description: 'Вы успешно зарегистрированы и вошли в систему',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при регистрации',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, зарегистрируйтесь для оформления заказа',
        variant: 'destructive',
      });
      return;
    }

    if (formData.paymentMethod === 'card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv)) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните данные карты',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Создать адрес доставки
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const addressResponse = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          address1: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'RU',
          phone: formData.phone,
          isDefault: true,
        }),
      });

      if (!addressResponse.ok) {
        throw new Error('Failed to create address');
      }

      const addressData = await addressResponse.json();
      const shippingAddressId = addressData.id;

      // Создать заказ
      const orderItems = items.map(item => {
        const basePrice = typeof item.product.price === 'number' 
          ? item.product.price 
          : parseFloat(item.product.price.toString());
        const finalPrice = item.product.discount
          ? basePrice * (1 - item.product.discount / 100)
          : basePrice;
        
        return {
          productId: item.product.id,
          quantity: item.quantity,
          price: finalPrice,
          variantId: item.variantId || null,
        };
      });

      const subtotal = items.reduce((sum, item) => {
        const basePrice = typeof item.product.price === 'number' 
          ? item.product.price 
          : parseFloat(item.product.price.toString());
        const price = item.product.discount
          ? basePrice * (1 - item.product.discount / 100)
          : basePrice;
        return sum + price * item.quantity;
      }, 0);

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId,
          shippingMethodId: selectedShippingMethod,
          items: orderItems,
          subtotal,
          tax: 0,
          shipping: shippingCost,
        }),
      });

      if (!orderResponse.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errorData = await orderResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${orderResponse.status} ${orderResponse.statusText}`;
        }
        console.error('Order creation error:', errorMessage, 'Response status:', orderResponse.status);
        throw new Error(errorMessage);
      }

      const orderData = await orderResponse.json();

      // Создать платеж
      if (formData.paymentMethod === 'card' || formData.paymentMethod === 'online') {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.id,
            amount: parseFloat(orderData.total.toString()),
            paymentMethod: formData.paymentMethod === 'card' ? 'card' : 'online',
            status: 'COMPLETED',
          }),
        });
      } else if (formData.paymentMethod === 'cash') {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.id,
            amount: parseFloat(orderData.total.toString()),
            paymentMethod: 'cash',
            status: 'PENDING',
          }),
        });
      }

      toast({
        title: 'Успешно!',
        description: `Заказ №${orderData.orderNumber} успешно оформлен!`,
      });

      // Не очищаем корзину - товары остаются для повторного заказа
      // clearCart();
      
      // Refresh router cache to ensure new order is visible
      router.refresh();
      router.push(`/account/orders/${orderData.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при оформлении заказа',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Ваша корзина пуста</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  // Show registration form if user is not authenticated
  if (showRegisterForm && status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
              <CardDescription className="text-center">
                Зарегистрируйтесь для оформления заказа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя и Фамилия</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Введите ваше имя"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    disabled={isRegistering}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    disabled={isRegistering}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    disabled={isRegistering}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Минимум 6 символов</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    disabled={isRegistering}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isRegistering}>
                  {isRegistering ? 'Регистрация...' : 'Зарегистрироваться и продолжить'}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Уже есть аккаунт?{' '}
                  <button
                    onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
                    className="text-primary-600 hover:underline font-semibold"
                  >
                    Войти
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Контактные данные</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Телефон *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Адрес доставки</h2>
            
            {/* Shipping Method Selection */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium mb-3">Способ доставки *</label>
              {shippingMethods.length === 0 ? (
                <p className="text-sm text-gray-500">Загрузка методов доставки...</p>
              ) : (
                <div className="space-y-2">
                  {shippingMethods.map((method: any) => (
                    <label
                      key={method.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedShippingMethodState(method.id);
                        setSelectedShippingMethod(method.id);
                      }}
                    >
                      <input
                        type="radio"
                        name="shippingMethodAddress"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={() => {
                          setSelectedShippingMethodState(method.id);
                          setSelectedShippingMethod(method.id);
                        }}
                        className="mt-1 w-4 h-4 text-[#DAA520] focus:ring-[#DAA520]"
                        required
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{method.nameRu}</div>
                            {method.descriptionRu && (
                              <div className="text-xs text-gray-500 mt-1">{method.descriptionRu}</div>
                            )}
                            {method.estimatedDays && (
                              <div className="text-xs text-gray-500">Срок: {method.estimatedDays} дней</div>
                            )}
                          </div>
                          <div className="font-semibold text-[#DAA520] ml-4">
                            {parseFloat(method.cost).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Город *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Улица и дом *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Индекс *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-amber-50 hover:shadow-glow">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-5 h-5 text-primary-600"
                />
                <div>
                  <p className="font-semibold">Банковская карта</p>
                  <p className="text-sm text-gray-600">Visa, MasterCard, МИР</p>
                </div>
              </label>
              
              {/* Card Details Form */}
              {formData.paymentMethod === 'card' && (
                <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-primary-300 shadow-md space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Данные банковской карты</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      Номер карты *
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                        setFormData({ ...formData, cardNumber: formatted });
                      }}
                      maxLength={19}
                      required={formData.paymentMethod === 'card'}
                      className="mt-1 text-lg font-mono tracking-wider"
                    />
                    <p className="text-xs text-gray-500 mt-1">Введите 16-значный номер карты</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-700 mb-2 block">
                        Срок действия *
                      </Label>
                      <Input
                        id="cardExpiry"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setFormData({ ...formData, cardExpiry: value });
                        }}
                        maxLength={5}
                        required={formData.paymentMethod === 'card'}
                        className="mt-1 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">Месяц и год</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardCvv" className="text-sm font-medium text-gray-700 mb-2 block">
                        CVV/CVC код *
                      </Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        placeholder="123"
                        value={formData.cardCvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setFormData({ ...formData, cardCvv: value });
                        }}
                        maxLength={4}
                        required={formData.paymentMethod === 'card'}
                        className="mt-1 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">3-4 цифры на обороте</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Безопасная оплата. Данные карты защищены</span>
                    </div>
                  </div>
                </div>
              )}
              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-amber-50 hover:shadow-glow">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-5 h-5 text-primary-600"
                />
                <div>
                  <p className="font-semibold">Наличными при получении</p>
                  <p className="text-sm text-gray-600">Оплата курьеру</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-amber-50 hover:shadow-glow">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={formData.paymentMethod === 'online'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-5 h-5 text-primary-600"
                />
                <div>
                  <p className="font-semibold">Онлайн оплата</p>
                  <p className="text-sm text-gray-600">СБП, Яндекс.Касса</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
                    {Math.round(
                      (item.product.discount
                        ? item.product.price * (1 - item.product.discount / 100)
                        : item.product.price) * item.quantity
                    ).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                  </span>
                </div>
              ))}
            </div>
            {/* Shipping Methods Selection */}
            <div className="mb-4 border-t pt-4">
              <h3 className="font-semibold mb-3">Способ доставки</h3>
              {shippingMethods.length === 0 ? (
                <p className="text-sm text-gray-500">Загрузка методов доставки...</p>
              ) : (
                <div className="space-y-2">
                  {shippingMethods.map((method: any) => (
                    <label
                      key={method.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedShippingMethodState(method.id);
                        setSelectedShippingMethod(method.id);
                      }}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={() => {
                          setSelectedShippingMethodState(method.id);
                          setSelectedShippingMethod(method.id);
                        }}
                        className="mt-1 w-4 h-4 text-[#DAA520] focus:ring-[#DAA520]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{method.nameRu}</div>
                            {method.descriptionRu && (
                              <div className="text-xs text-gray-500 mt-1">{method.descriptionRu}</div>
                            )}
                            {method.estimatedDays && (
                              <div className="text-xs text-gray-500">Срок: {method.estimatedDays} дней</div>
                            )}
                          </div>
                          <div className="font-semibold text-[#DAA520] ml-4">
                            {parseFloat(method.cost).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-4 space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Товары</span>
                <span>{Math.round(total).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка</span>
                <span>{shippingCost === 0 ? 'Бесплатно' : shippingCost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Итого</span>
                <span className="text-primary-600">
                  {Math.round(total + shippingCost).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </span>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление заказа...' : 'Подтвердить заказ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

