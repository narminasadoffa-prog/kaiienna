@echo off
chcp 65001 >nul
title Kaiienna - Запуск сайта

echo.
echo ╔════════════════════════════════════════╗
echo ║   Kaiienna - Интернет-магазин одежды   ║
echo ╚════════════════════════════════════════╝
echo.

REM Проверка Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo.
    echo 📥 Установите Node.js:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b
)

REM Проверка зависимостей
if not exist "node_modules" (
    echo 📦 Установка зависимостей...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки!
        pause
        exit /b
    )
)

REM Создание .env.local если нет
if not exist ".env.local" (
    echo ⚙️  Создание конфигурации...
    (
        echo NEXTAUTH_URL=http://localhost:3000
        echo NEXTAUTH_SECRET=dev-secret-key-%RANDOM%
        echo NODE_ENV=development
    ) > .env.local
)

echo.
echo ✅ Запуск сайта...
echo.
echo 🌐 Сайт будет доступен: http://localhost:3007
echo 🛑 Для остановки: Ctrl+C
echo.

call npm run dev

