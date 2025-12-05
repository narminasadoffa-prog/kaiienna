# Инструкция по настройке проекта

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных PostgreSQL

1. Установите PostgreSQL на вашем компьютере или используйте облачный сервис (например, Supabase, Railway, или Neon).

2. Создайте новую базу данных:
```sql
CREATE DATABASE kaiienna;
```

3. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

4. Обновите `DATABASE_URL` в `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/kaiienna?schema=public"
```

## Шаг 3: Настройка NextAuth

1. Сгенерируйте секретный ключ:
```bash
openssl rand -base64 32
```

2. Добавьте его в `.env`:
```
NEXTAUTH_SECRET="ваш-секретный-ключ"
NEXTAUTH_URL="http://localhost:3000"
```

## Шаг 4: Настройка Prisma

1. Сгенерируйте Prisma Client:
```bash
npm run db:generate
```

2. Примените схему к базе данных:
```bash
npm run db:push
```

Или создайте миграцию:
```bash
npm run db:migrate
```

3. (Опционально) Откройте Prisma Studio для просмотра данных:
```bash
npm run db:studio
```

## Шаг 5: Создание первого администратора

Создайте файл `scripts/create-admin.ts`:

```typescript
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('Admin created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Запустите:
```bash
npx tsx scripts/create-admin.ts
```

## Шаг 6: Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Шаг 7: (Опционально) Настройка Stripe

1. Зарегистрируйтесь на [Stripe](https://stripe.com)
2. Получите API ключи из панели разработчика
3. Добавьте их в `.env`:
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Структура проекта

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth
│   │   ├── products/     # CRUD товаров
│   │   ├── categories/    # CRUD категорий
│   │   ├── cart/         # Корзина
│   │   └── orders/       # Заказы
│   ├── (routes)/         # Страницы приложения
│   └── layout.tsx        # Корневой layout
├── components/
│   └── ui/               # shadcn/ui компоненты
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth конфигурация
│   └── utils.ts          # Утилиты
├── prisma/
│   └── schema.prisma     # Схема базы данных
└── types/                # TypeScript типы
```

## Следующие шаги

1. Создайте страницы для:
   - Каталога товаров
   - Страницы товара
   - Корзины
   - Оформления заказа
   - Личного кабинета
   - Панели администратора

2. Настройте загрузку изображений (используйте Next.js Image API или облачное хранилище)

3. Добавьте интеграцию с платежными системами

4. Настройте email-уведомления

5. Добавьте аналитику и метрики



