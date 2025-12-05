# .env.local faylı yaradır
$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "⚠️  .env.local faylı artıq mövcuddur!" -ForegroundColor Yellow
    $overwrite = Read-Host "Üzərinə yazmaq istəyirsiniz? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "❌ Ləğv edildi" -ForegroundColor Red
        exit
    }
}

Write-Host "`n📝 .env.local faylı yaradılır...`n" -ForegroundColor Cyan

# PostgreSQL connection string soruş
Write-Host "PostgreSQL connection string daxil edin:" -ForegroundColor Yellow
Write-Host "Nümunə: postgresql://postgres:password@localhost:5432/kaiienna?schema=public" -ForegroundColor Gray
$databaseUrl = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "⚠️  DATABASE_URL boşdur, nümunə istifadə edilir" -ForegroundColor Yellow
    $databaseUrl = "postgresql://postgres:password@localhost:5432/kaiienna?schema=public"
}

# .env.local məzmunu
$envContent = @"
# Verilənlər Bazası
DATABASE_URL="$databaseUrl"

# NextAuth
NEXTAUTH_SECRET="dev-secret-key-12345"
NEXTAUTH_URL="http://localhost:3007"

# Admin User (optional)
ADMIN_EMAIL="admin@kaiienna.az"
ADMIN_PASSWORD="Admin2024!"
ADMIN_NAME="Admin"
"@

# Faylı yaz
$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "`n✅ .env.local faylı yaradıldı!`n" -ForegroundColor Green
Write-Host "📋 Növbəti addımlar:" -ForegroundColor Cyan
Write-Host "   1. npm run db:generate" -ForegroundColor White
Write-Host "   2. npm run db:push" -ForegroundColor White
Write-Host "   3. npm run create-admin" -ForegroundColor White
Write-Host "   4. npm run dev`n" -ForegroundColor White


