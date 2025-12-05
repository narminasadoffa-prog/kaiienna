# 🔧 Internal Server Error Həlli

## Problem
Server "Internal Server Error" verir.

## Səbəblər

1. **NextAuth route handler formatı** - Next.js App Router üçün düzgün format lazımdır
2. **Prisma Client problemi** - Database connection xətası
3. **Environment variables** - .env faylında problem

## Həll

### 1. Route Handler Düzəldildi

NextAuth route handler Next.js App Router formatına uyğunlaşdırıldı.

### 2. Serveri Yenidən Başladın

```bash
# Serveri dayandırın (Ctrl+C)
# .next qovluğunu silin
Remove-Item -Recurse -Force .next

# Serveri yenidən başladın
npm run dev
```

### 3. Terminal Loglarını Yoxlayın

Serveri başlatdıqdan sonra terminalda xətaları yoxlayın. Xüsusilə:
- `[NextAuth GET] Error:` və ya `[NextAuth POST] Error:` logları
- Prisma connection xətaları
- Environment variable xətaları

### 4. .env Faylını Yoxlayın

`.env` faylında olmalıdır:
```
DATABASE_URL="postgresql://neondb_owner:npg_rYxM0jVb2deE@ep-spring-bush-ad432kcs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="dev-secret-key-12345"
NEXTAUTH_URL="http://localhost:3007"
```

### 5. Prisma Client Yoxlayın

```bash
npm run db:generate
```

## Debug

Terminal loglarını yoxlayın və xətaları mənə göndərin.


