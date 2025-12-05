# 401 Unauthorized Xətasının Həlli

## Problem
Giriş zamanı `401 (Unauthorized)` xətası alırsınız.

## Səbəblər və Həllər

### 1. Admin İstifadəçisi Yoxdur

**Həll:**
```bash
npm run create-admin
```

Bu əmr admin yaradacaq:
- Email: `admin@kaiienna.az`
- Şifrə: `Admin2024!`

### 2. Verilənlər Bazası Bağlı Deyil

**Yoxlama:**
Brauzerdə açın: http://localhost:3007/api/auth/test

**Həll:**
```bash
# Prisma Client yaradın
npm run db:generate

# Verilənlər bazasına qoşulun
npm run db:push
```

### 3. NEXTAUTH_SECRET Təyin Edilməyib

**Yoxlama:**
`.env.local` faylında olmalıdır:
```
NEXTAUTH_SECRET=dev-secret-key-12345
NEXTAUTH_URL=http://localhost:3007
```

**Həll:**
1. `.env.local` faylını açın
2. `NEXTAUTH_SECRET` əlavə edin (əgər yoxdursa)
3. Serveri yenidən başladın

### 4. Verilənlər Bazası URL Səhvdir

**Yoxlama:**
`.env.local` faylında:
```
DATABASE_URL="postgresql://user:password@localhost:5432/kaiienna?schema=public"
```

**Qeyd:** Əgər PostgreSQL yoxdursa, bu xəta normaldır. 
Frontend işləyəcək, amma giriş işləməyəcək.

### 5. Server Cache Problemi

**Həll:**
1. Serveri dayandırın (Ctrl+C)
2. `.next` qovluğunu silin (əgər varsa)
3. Serveri yenidən başladın: `npm run dev`
4. Brauzer cache təmizləyin (Ctrl+Shift+R)

## Addım-Addım Həll

1. ✅ Verilənlər bazasını yoxlayın:
   ```bash
   npm run db:push
   ```

2. ✅ Admin yaradın:
   ```bash
   npm run create-admin
   ```

3. ✅ .env.local yoxlayın:
   - NEXTAUTH_SECRET var?
   - NEXTAUTH_URL düzgündür?

4. ✅ Serveri yenidən başladın

5. ✅ Giriş səhifəsində yoxlayın:
   - Email: admin@kaiienna.az
   - Şifrə: Admin2024!

## Test Endpoint

Verilənlər bazası bağlantısını yoxlamaq üçün:
http://localhost:3007/api/auth/test

## Əlavə Yardım

Əgər problem davam edirsə:
1. Terminal loglarını yoxlayın
2. Brauzer konsolunu açın (F12)
3. Network tab-da xətaları yoxlayın


