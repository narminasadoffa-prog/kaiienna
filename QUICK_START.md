# Быстрый запуск сайта локально

## Вариант 1: Полная установка (с базой данных)

### Требования:
- Node.js 18+ установлен
- PostgreSQL установлен и запущен

### Шаги:

1. **Установите зависимости:**
```bash
npm install
```

2. **Создайте файл `.env.local`** в корне проекта:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kaiienna?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="development"
```

3. **Настройте базу данных:**
```bash
npm run db:generate
npm run db:push
```

4. **Запустите проект:**
```bash
npm run dev
```

5. Откройте браузер: http://localhost:3000

---

## Вариант 2: Быстрый запуск (без базы данных, только фронтенд)

Если у вас нет PostgreSQL или вы хотите просто посмотреть интерфейс:

1. **Установите зависимости:**
```bash
npm install
```

2. **Создайте файл `.env.local`** с минимальными настройками:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
NODE_ENV="development"
```

3. **Запустите проект:**
```bash
npm run dev
```

**Примечание:** Некоторые функции (API, корзина, заказы) не будут работать без базы данных, но вы сможете увидеть интерфейс сайта.

---

## Если npm не установлен:

### Установка Node.js:

1. Скачайте Node.js с официального сайта: https://nodejs.org/
2. Установите LTS версию (рекомендуется)
3. Перезапустите терминал
4. Проверьте установку:
```bash
node --version
npm --version
```

### Альтернатива - используйте готовый хостинг:

- **Vercel** (рекомендуется для Next.js): https://vercel.com
- **Netlify**: https://netlify.com
- **Railway**: https://railway.app

---

## Решение проблем:

### Ошибка: "npm не распознан"
- Установите Node.js (см. выше)
- Перезапустите терминал/IDE

### Ошибка: "Cannot find module"
- Удалите `node_modules` и `package-lock.json`
- Запустите `npm install` заново

### Ошибка подключения к базе данных
- Проверьте, что PostgreSQL запущен
- Проверьте правильность DATABASE_URL в `.env.local`
- Для тестирования используйте вариант 2 (без БД)

---

## Полезные команды:

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка проекта
npm run start        # Запуск продакшен версии
npm run lint         # Проверка кода
npm run db:studio    # Открыть Prisma Studio (GUI для БД)
```



