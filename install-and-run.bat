@echo off
chcp 65001 >nul
echo ========================================
echo   Kaiienna E-commerce - Установка
echo ========================================
echo.

echo [1/5] Проверка Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js не найден!
    echo.
    echo Пожалуйста, установите Node.js:
    echo 1. Откройте: https://nodejs.org/
    echo 2. Скачайте LTS версию
    echo 3. Установите и перезапустите терминал
    echo.
    pause
    exit /b 1
)
node --version
echo ✓ Node.js установлен
echo.

echo [2/5] Проверка npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm не найден!
    pause
    exit /b 1
)
npm --version
echo ✓ npm установлен
echo.

echo [3/5] Проверка зависимостей...
if exist "node_modules" (
    echo ✓ Зависимости уже установлены
) else (
    echo Установка зависимостей (это займет несколько минут)...
    call npm install
    if %errorlevel% neq 0 (
        echo ✗ Ошибка при установке зависимостей!
        pause
        exit /b 1
    )
    echo ✓ Зависимости установлены
)
echo.

echo [4/5] Проверка конфигурации...
if not exist ".env.local" (
    echo Создание .env.local...
    (
        echo NEXTAUTH_URL=http://localhost:3007
        echo NEXTAUTH_SECRET=dev-secret-key-%RANDOM%
        echo NODE_ENV=development
    ) > .env.local
    echo ✓ Файл .env.local создан
) else (
    echo ✓ Файл .env.local существует
)
echo.

echo [5/5] Запуск проекта...
echo.
echo ========================================
echo   Запуск сервера разработки...
echo ========================================
echo.
echo Сайт будет доступен по адресу:
echo   http://localhost:3000
echo.
echo Для остановки нажмите Ctrl+C
echo.

call npm run dev

