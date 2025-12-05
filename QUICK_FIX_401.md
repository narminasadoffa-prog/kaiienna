# 🚨 401 Xətasını Tez Həll Et

## Problem
`DATABASE_URL` təyin edilməyib - bu, 401 xətasının əsas səbəbidir.

## Həll (5 dəqiqə)

### Addım 1: .env.local faylı yaradın

Proyektin kök qovluğunda `.env.local` faylı yaradın və aşağıdakı məzmunu əlavə edin:

```env
# Verilənlər Bazası
# PostgreSQL istifadə edirsinizsə:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/kaiienna?schema=public"

# Və ya Cloud Database (Supabase, Railway, Neon):
# DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# NextAuth
NEXTAUTH_SECRET="dev-secret-key-12345"
NEXTAUTH_URL="http://localhost:3007"

# Admin (İstəyə bağlı)
ADMIN_EMAIL="admin@kaiienna.az"
ADMIN_PASSWORD="Admin2024!"
```

**Qeyd:** `yourpassword`-u öz PostgreSQL şifrənizlə əvəz edin.

### Addım 2: PostgreSQL quraşdırın (əgər yoxdursa)

**Seçim 1: Lokal PostgreSQL**
- https://www.postgresql.org/download/
- Quraşdırın və işə salın
- Default şifrə: `postgres` (və ya quraşdırma zamanı təyin etdiyiniz)

**Seçim 2: Cloud Database (Tövsiyə olunur - daha asan)**
- **Supabase** (Pulsuz): https://supabase.com
  - Yeni layihə yaradın
  - Settings > Database > Connection string kopyalayın
- **Railway** (Pulsuz): https://railway.app
  - PostgreSQL əlavə edin
  - Connection string kopyalayın
- **Neon** (Pulsuz): https://neon.tech
  - Yeni layihə yaradın
  - Connection string kopyalayın

### Addım 3: Verilənlər bazasını quraşdırın

Terminalda:

```bash
# Prisma Client yaradın
npm run db:generate

# Verilənlər bazasına qoşulun
npm run db:push

# Admin istifadəçisi yaradın
npm run create-admin
```

### Addım 4: Yoxlayın

```bash
npm run check-auth
```

Bu əmr göstərəcək:
- ✅ Verilənlər bazası bağlıdırmı?
- ✅ Admin istifadəçisi varmı?
- ✅ NEXTAUTH_SECRET təyin edilibmi?

### Addım 5: Serveri yenidən başladın

```bash
# Serveri dayandırın (Ctrl+C)
# Sonra yenidən başladın:
npm run dev
```

### Addım 6: Giriş edin

1. Brauzerdə açın: http://localhost:3007/auth/signin
2. Daxil edin:
   - **Email:** `admin@kaiienna.az`
   - **Şifrə:** `Admin2024!`

## Test Endpoint-lər

- Verilənlər bazası: http://localhost:3007/api/auth/test
- İstifadəçi yoxlama: http://localhost:3007/api/auth/check-user?email=admin@kaiienna.az

## Əgər problem davam edirsə

1. Terminal loglarını yoxlayın - indi daha aydın xəta mesajları var
2. `.env.local` faylının düzgün yaradıldığını yoxlayın
3. PostgreSQL-in işlədiyini yoxlayın
4. Serveri tam yenidən başladın (Ctrl+C, sonra `npm run dev`)

## Əlavə Yardım

- `DATABASE_SETUP.txt` - Ətraflı quraşdırma təlimatları
- `TEZ_HALLA_401.txt` - Tez həll addımları
- `401_HATA_COZUM.md` - Ətraflı problem həlləri


