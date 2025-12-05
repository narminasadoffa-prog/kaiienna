export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Возврат товара</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Условия возврата</h2>
          <p className="text-gray-700 mb-4">
            Вы можете вернуть товар в течение 14 дней с момента получения заказа, если:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Товар не был в употреблении</li>
            <li>• Сохранены товарный вид и потребительские свойства</li>
            <li>• Сохранены фабричные ярлыки и упаковка</li>
            <li>• Товар не входит в список товаров, не подлежащих возврату</li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Как вернуть товар</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Подайте заявку на возврат</h3>
              <p className="text-gray-700">
                Свяжитесь с нашей службой поддержки или оформите заявку в личном кабинете.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Упакуйте товар</h3>
              <p className="text-gray-700">
                Упакуйте товар в оригинальную упаковку со всеми бирками и аксессуарами.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">3. Отправьте товар</h3>
              <p className="text-gray-700">
                Отправьте товар обратно нам удобным способом. Мы можем организовать курьерскую
                доставку для возврата.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">4. Получите возврат</h3>
              <p className="text-gray-700">
                После проверки товара мы вернем вам средства тем же способом, которым была
                произведена оплата.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Обмен товара</h2>
          <p className="text-gray-700 mb-4">
            Вы можете обменять товар на другой размер или цвет в течение 14 дней, если товар не
            подошел по размеру, фасону или цвету.
          </p>
          <p className="text-gray-700">
            Для обмена товара свяжитесь с нашей службой поддержки. Мы поможем подобрать подходящий
            вариант и организовать обмен.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Товары, не подлежащие возврату</h2>
          <p className="text-gray-700 mb-2">
            Согласно законодательству РФ, не подлежат возврату следующие товары:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Нижнее белье и чулочно-носочные изделия</li>
            <li>• Товары, изготовленные по индивидуальному заказу</li>
            <li>• Товары с нарушенной упаковкой или без бирок</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

