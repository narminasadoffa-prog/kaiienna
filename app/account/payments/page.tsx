'use client';

import { FiCreditCard, FiPlus } from 'react-icons/fi';

const mockPayments = [
  {
    id: '1',
    type: 'card',
    last4: '1234',
    brand: 'Visa',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    last4: '5678',
    brand: 'MasterCard',
    isDefault: false,
  },
];

export default function PaymentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">История оплат</h1>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus />
          Добавить карту
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold">Сохраненные способы оплаты</h2>
        {mockPayments.map((payment) => (
          <div key={payment.id} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FiCreditCard className="text-3xl text-primary-600" />
                <div>
                  <p className="font-semibold">
                    {payment.brand} •••• {payment.last4}
                  </p>
                  {payment.isDefault && (
                    <span className="text-sm text-primary-600">По умолчанию</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!payment.isDefault && (
                  <button className="text-primary-600 hover:underline text-sm">
                    Сделать основной
                  </button>
                )}
                <button className="text-red-600 hover:underline text-sm">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">История транзакций</h2>
        <div className="card p-6">
          <p className="text-gray-600 text-center py-8">
            История платежей будет отображаться здесь после совершения покупок
          </p>
        </div>
      </div>
    </div>
  );
}

