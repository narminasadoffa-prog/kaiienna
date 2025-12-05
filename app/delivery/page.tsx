export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Доставка</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Способы доставки</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Курьерская доставка</h3>
              <p className="text-gray-700 mb-2">
                Доставка курьером по Москве и Санкт-Петербургу в течение 1-2 рабочих дней.
              </p>
              <p className="text-gray-600">Стоимость: {(500).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })} (бесплатно при заказе от {(3000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })})</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Почта России</h3>
              <p className="text-gray-700 mb-2">
                Доставка по всей России через Почту России. Срок доставки: 5-14 рабочих дней.
              </p>
              <p className="text-gray-600">Стоимость: {(300).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })} (бесплатно при заказе от {(3000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })})</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">СДЭК</h3>
              <p className="text-gray-700 mb-2">
                Доставка через службу СДЭК по всей России. Срок доставки: 3-7 рабочих дней.
              </p>
              <p className="text-gray-600">Стоимость: {(400).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })} (бесплатно при заказе от {(3000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })})</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Самовывоз</h3>
              <p className="text-gray-700 mb-2">
                Вы можете забрать заказ самостоятельно из нашего пункта выдачи в Москве.
              </p>
              <p className="text-gray-600">Стоимость: Бесплатно</p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Сроки доставки</h2>
          <p className="text-gray-700 mb-4">
            После оформления заказа мы обрабатываем его в течение 1-2 рабочих дней. Затем товар
            отправляется выбранным способом доставки.
          </p>
          <p className="text-gray-700">
            Вы получите уведомление с номером отслеживания, по которому сможете следить за
            статусом доставки.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Условия доставки</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Минимальная сумма заказа: {(1000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</li>
            <li>• Бесплатная доставка при заказе от {(3000).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</li>
            <li>• Оплата наличными или картой при получении</li>
            <li>• Возможность примерки перед оплатой</li>
            <li>• Возврат товара в течение 14 дней</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

