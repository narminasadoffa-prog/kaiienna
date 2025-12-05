'use client';

import Link from 'next/link';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiCreditCard, FiRefreshCw } from 'react-icons/fi';

export default function AccountPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/account/profile"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiUser className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">Профиль</h2>
          <p className="text-gray-600">Личные данные и настройки</p>
        </Link>

        <Link
          href="/account/orders"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiPackage className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">Мои заказы</h2>
          <p className="text-gray-600">История и статус заказов</p>
        </Link>

        <Link
          href="/account/favorites"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiHeart className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">Избранное</h2>
          <p className="text-gray-600">Сохраненные товары</p>
        </Link>

        <Link
          href="/account/addresses"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiMapPin className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">Адреса доставки</h2>
          <p className="text-gray-600">Управление адресами</p>
        </Link>

        <Link
          href="/account/payments"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiCreditCard className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">История оплат</h2>
          <p className="text-gray-600">Способы оплаты и история</p>
        </Link>

        <Link
          href="/account/returns"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <FiRefreshCw className="text-4xl text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold mb-2">Возвраты и обмены</h2>
          <p className="text-gray-600">Заявки на возврат</p>
        </Link>
      </div>
    </>
  );
}

