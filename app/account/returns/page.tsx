'use client';

import { FiRefreshCw, FiPackage } from 'react-icons/fi';
import Link from 'next/link';

const mockReturns = [
  {
    id: 'RET-001',
    orderId: 'ORD-001',
    product: 'Элегантное платье миди',
    reason: 'Не подошел размер',
    status: 'processing',
    date: '2024-01-20',
  },
  {
    id: 'RET-002',
    orderId: 'ORD-002',
    product: 'Классическая белая рубашка',
    reason: 'Не подошел цвет',
    status: 'completed',
    date: '2024-01-15',
  },
];

const statusLabels = {
  pending: 'На рассмотрении',
  processing: 'В обработке',
  completed: 'Завершен',
  rejected: 'Отклонен',
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Возвраты и обмены</h1>
        <Link href="/account/orders" className="btn-primary">
          Создать заявку на возврат
        </Link>
      </div>

      {mockReturns.length === 0 ? (
        <div className="text-center py-12">
          <FiRefreshCw className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">У вас нет активных заявок на возврат</p>
          <p className="text-gray-500 mb-6">
            Вы можете создать заявку на возврат из раздела «Мои заказы»
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockReturns.map((returnItem) => (
            <div key={returnItem.id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FiPackage className="text-primary-600" />
                    <h3 className="text-lg font-bold">Заявка {returnItem.id}</h3>
                  </div>
                  <p className="text-gray-600 mb-1">
                    Заказ: {returnItem.orderId} • {returnItem.product}
                  </p>
                  <p className="text-gray-600 mb-1">Причина: {returnItem.reason}</p>
                  <p className="text-gray-600">
                    Дата: {new Date(returnItem.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      returnItem.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : returnItem.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[returnItem.status as keyof typeof statusLabels]}
                  </span>
                  <Link
                    href={`/account/returns/${returnItem.id}`}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

