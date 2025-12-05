@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   🔧 NEON DATABASE QUraşdırması                          ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

(
echo # Verilənlər Bazası - Neon Database
echo DATABASE_URL="postgresql://neondb_owner:npg_rYxM0jVb2deE@ep-spring-bush-ad432kcs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
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

echo ✅ .env.local faylı yaradıldı!
echo.
echo 📋 Növbəti addımlar:
echo    1. npm run db:generate
echo    2. npm run db:push
echo    3. npm run create-admin
echo    4. npm run dev
echo.
pause


