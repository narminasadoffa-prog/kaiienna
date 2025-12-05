'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  // Разделы в админ-панели
  const sections = [
    { path: '/admin', title: 'Главная' },
    { path: '/admin/products', title: 'Товары' },
    { path: '/admin/categories', title: 'Категории' },
    { path: '/admin/banners', title: 'Баннеры' },
    { path: '/admin/pages', title: 'Статические страницы' },
    { path: '/admin/logo', title: 'Логотип' },
    { path: '/admin/users', title: 'Пользователи' },
    { path: '/admin/orders', title: 'Заказы' },
  ]

  // Найти индекс текущего раздела
  const currentIndex = sections.findIndex(section => section.path === pathname)
  const currentSection = sections[currentIndex] || sections[0]

  // Предыдущий раздел
  const previousSection = currentIndex > 0 ? sections[currentIndex - 1] : null

  // Следующий раздел
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Левая сторона - Назад и Главная */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>

            {previousSection && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href={previousSection.path}>
                  <ChevronLeft className="w-4 h-4" />
                  {previousSection.title}
                </Link>
              </Button>
            )}
          </div>

          {/* Центр - Текущий раздел */}
          <div className="flex-1 text-center">
            <h2 className="text-sm font-semibold text-gray-700">
              {currentSection.title}
            </h2>
          </div>

          {/* Правая сторона - Вперед */}
          <div className="flex items-center gap-2">
            {nextSection && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href={nextSection.path}>
                  {nextSection.title}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.forward()}
              className="flex items-center gap-1"
            >
              Вперед
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

