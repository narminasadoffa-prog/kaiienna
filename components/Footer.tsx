import Link from 'next/link';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#DAA520] text-gray-900 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Категории */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Категории</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/women" className="hover:text-gray-700 transition-colors">
                  Женская одежда
                </Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-gray-700 transition-colors">
                  Мужская одежда
                </Link>
              </li>
              <li>
                <Link href="/kids" className="hover:text-gray-700 transition-colors">
                  Детская одежда
                </Link>
              </li>
              <li>
                <Link href="/sale" className="hover:text-gray-700 transition-colors">
                  Распродажа
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-gray-700 transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-gray-700 transition-colors">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-gray-700 transition-colors">
                  Оплата
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gray-700 transition-colors">
                  Возврат товара
                </Link>
              </li>
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Поддержка</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contacts" className="hover:text-gray-700 transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-700 transition-colors">
                  Вопросы и ответы
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-700 transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты и соцсети */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Контакты</h3>
            <div className="space-y-2 mb-4">
              <p>Телефон: +7 (800) 123-45-67</p>
              <p>Email: info@kaiienna.ru</p>
              <p>Режим работы: Пн-Вс 9:00-21:00</p>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-2xl hover:text-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
              <a
                href="#"
                className="text-2xl hover:text-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
              <a
                href="#"
                className="text-2xl hover:text-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>
              <a
                href="#"
                className="text-2xl hover:text-gray-700 transition-colors"
                aria-label="YouTube"
              >
                <FiYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/30 mt-8 pt-8 text-center">
          <p className="text-lg">Created by midiya.az</p>
        </div>
      </div>
    </footer>
  );
}

