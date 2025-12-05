@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   📝 .env.local FAYLI YARADMAQ                            ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if exist .env.local (
    echo ⚠️  .env.local faylı artıq mövcuddur!
    set /p overwrite="Üzərinə yazmaq istəyirsiniz? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo ❌ Ləğv edildi
        exit /b
    )
)

echo.
echo 📝 .env.local faylı yaradılır...
echo.

set /p databaseUrl="PostgreSQL connection string daxil edin (Enter basın nümunə üçün): "

if "%databaseUrl%"=="" (
    echo ⚠️  Nümunə istifadə edilir
    set databaseUrl=postgresql://postgres:password@localhost:5432/kaiienna?schema=public
)

(
echo # Verilənlər Bazası
echo DATABASE_URL="%databaseUrl%"
echo.
echo # NextAuth
echo NEXTAUTH_SECRET="dev-secret-key-12345"
echo NEXTAUTH_URL="http://localhost:3007"
echo.
echo # Admin User ^(optional^)
echo ADMIN_EMAIL="admin@kaiienna.az"
echo ADMIN_PASSWORD="Admin2024!"
echo ADMIN_NAME="Admin"
) > .env.local

echo.
echo ✅ .env.local faylı yaradıldı!
echo.
echo 📋 Növbəti addımlar:
echo    1. npm run db:generate
echo    2. npm run db:push
echo    3. npm run create-admin
echo    4. npm run dev
echo.


