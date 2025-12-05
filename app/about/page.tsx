export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">О компании</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Наша история</h2>
          <p className="text-gray-700 leading-relaxed">
            Kaiienna — это современный интернет-магазин одежды, основанный в 2020 году. Мы
            специализируемся на продаже качественной и стильной одежды для всей семьи. Наша миссия
            — сделать модную одежду доступной каждому, сохраняя при этом высокие стандарты качества
            и сервиса.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Наши ценности</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Качество</h3>
              <p className="text-gray-700">
                Мы тщательно отбираем каждый товар, чтобы гарантировать высокое качество и
                долговечность.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Стиль</h3>
              <p className="text-gray-700">
                Мы следим за модными тенденциями и предлагаем актуальные коллекции для любого
                стиля.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Доступность</h3>
              <p className="text-gray-700">
                Мы стремимся сделать качественную одежду доступной для всех, предлагая
                конкурентные цены.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Сервис</h3>
              <p className="text-gray-700">
                Мы заботимся о наших клиентах и обеспечиваем отличный сервис на каждом этапе
                покупки.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Почему выбирают нас</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">✓</span>
              <span>Более 10 000 довольных клиентов</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">✓</span>
              <span>Быстрая доставка по всей России</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">✓</span>
              <span>Гарантия качества на все товары</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">✓</span>
              <span>Удобный возврат в течение 14 дней</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">✓</span>
              <span>Профессиональная служба поддержки</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

