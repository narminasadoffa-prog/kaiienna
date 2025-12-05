# Скрипт для автоматической установки и запуска проекта
# PowerShell скрипт

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kaiienna E-commerce - Установка" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Node.js
Write-Host "[1/5] Проверка Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js установлен: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js не найден!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Пожалуйста, установите Node.js:" -ForegroundColor Yellow
    Write-Host "1. Откройте: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Скачайте LTS версию" -ForegroundColor White
    Write-Host "3. Установите и перезапустите терминал" -ForegroundColor White
    Write-Host ""
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверка npm
Write-Host "[2/5] Проверка npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm установлен: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm не найден!" -ForegroundColor Red
    exit 1
}

# Проверка node_modules
Write-Host "[3/5] Проверка зависимостей..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Зависимости уже установлены" -ForegroundColor Green
} else {
    Write-Host "Установка зависимостей (это займет несколько минут)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка при установке зависимостей!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Зависимости установлены" -ForegroundColor Green
}

# Проверка .env.local
Write-Host "[4/5] Проверка конфигурации..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "Создание .env.local..." -ForegroundColor Yellow
    @"
NEXTAUTH_URL=http://localhost:3007
NEXTAUTH_SECRET=dev-secret-key-$(Get-Random -Minimum 10000 -Maximum 99999)
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ Файл .env.local создан" -ForegroundColor Green
} else {
    Write-Host "✓ Файл .env.local существует" -ForegroundColor Green
}

# Запуск проекта
Write-Host "[5/5] Запуск проекта..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Запуск сервера разработки..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Сайт будет доступен по адресу:" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Запуск Next.js
npm run dev

