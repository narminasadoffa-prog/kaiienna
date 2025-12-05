export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Оплата</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Способы оплаты</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Банковская карта</h3>
              <p className="text-gray-700 mb-2">
                Оплата картами Visa, MasterCard или МИР онлайн при оформлении заказа. Безопасная
                оплата через защищенное соединение.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Наличными при получении</h3>
              <p className="text-gray-700 mb-2">
                Оплата наличными курьеру при доставке или в пункте выдачи заказов.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Онлайн платежи</h3>
              <p className="text-gray-700 mb-2">
                Оплата через СБП (Система быстрых платежей), Яндекс.Кассу или другие платежные
                системы.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Банковский перевод</h3>
              <p className="text-gray-700 mb-2">
                Оплата по реквизитам через банковский перевод. Подходит для юридических лиц.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Безопасность платежей</h2>
          <p className="text-gray-700 mb-4">
            Все платежи обрабатываются через защищенные платежные системы с использованием
            современных технологий шифрования. Мы не храним данные ваших банковских карт.
          </p>
          <p className="text-gray-700">
            При оплате картой вы будете перенаправлены на страницу банка для подтверждения
            платежа. Это обеспечивает максимальную безопасность ваших финансовых данных.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Возврат средств</h2>
          <p className="text-gray-700 mb-4">
            В случае возврата товара средства будут возвращены на тот же способ оплаты, которым
            был оплачен заказ:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• При оплате картой — возврат на карту в течение 5-10 рабочих дней</li>
            <li>• При оплате наличными — возврат наличными при возврате товара</li>
            <li>• При онлайн оплате — возврат на счет в течение 3-7 рабочих дней</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

