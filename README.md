# CLERIS Commerce

Next.js 16 + TypeScript ile geliştirilen, PHP kullanmayan ve sunucu tarafında çalışan CLERIS e-ticaret altyapısıdır.

## Yerel çalışma

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Kontroller:

```bash
npm run check
```

## Temel komutlar

| Komut | İşlev |
| --- | --- |
| `npm run db:migrate` | Veritabanı şemasını günceller. |
| `npm run db:seed` | Yalnızca mevcut gerçek katalog başlangıç verisini yükler. Canlıda düzenlenmiş katalog üzerine rutin olarak çalıştırmayın. |
| `npm run admin:create -- owner@domain.com 'güçlü-şifre'` | İlk owner hesabını oluşturur veya owner yapar. Şifre en az 12 karakterdir. |
| `npm run check` | TypeScript, lint, test ve production build çalıştırır. |

## Dağıtım

Bu proje **statik site değildir**. aaPanel için Node.js proje olarak kurulmalıdır. Ayrıntılar: [DEPLOYMENT_AAPANEL.md](DEPLOYMENT_AAPANEL.md).

## Ödeme güvenliği

- PAYTR anahtarları yalnızca sunucu environment değişkenlerinde tutulur.
- Sipariş, fiyat ve stok sunucuda yeniden hesaplanır.
- Ödeme başarı sayfası siparişi onaylamaz; yalnızca doğrulanmış PAYTR callback onay verir.
- PAYTR callback adresi canlıda `https://alanadiniz.com/api/payments/paytr/callback` olmalıdır.
- Ödeme canlıya alınmadan önce PayTR test işlemi, callback ve yönetimden gerçek kargo/fiyat/stok tanımları doğrulanmalıdır.

Ayrıntılı kararlar için `PROJECT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `CLERIS_CALISMA_PROTOKOLU.md` ve `CLERIS_TASARIM_REFERANSLARI.md` aktif proje referanslarıdır.
