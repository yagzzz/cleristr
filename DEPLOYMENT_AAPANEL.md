# aaPanel dağıtımı — CLERIS

## Doğru proje türü

**aaPanel'de “Node.js Project” seçin; “Static” seçmeyin.**

CLERIS; Next.js sunucusu, API route'ları, server action'ları, kullanıcı oturumu, SQLite/Turso veritabanı, PAYTR token üretimi ve PAYTR callback endpoint'i kullanır. Statik hosting bu işlevleri çalıştıramaz; ödeme, kayıt/giriş, admin ve newsletter endpoint'leri çalışmaz.

## Sunucu gereksinimleri

- Node.js **22 veya daha yeni**
- aaPanel Node.js Project Manager
- Alan adı için HTTPS sertifikası
- Kalıcı disk alanı (`data/cleris.db` için) veya Turso/libSQL URL'si
- `www.paytr.com:443` yönünde dış bağlantı

## İlk kurulum

1. Kodu sunucuya yükleyin veya Git ile çekin.
2. aaPanel → **Website → Node.js Project** içinden proje klasörünü seçin.
3. Node sürümünü 22+ yapın.
4. Uygulamanın environment değerlerini aaPanel panelinden girin veya güvenli biçimde `.env.local` dosyasında saklayın. `.env.local` dosyasını Git'e eklemeyin.
5. Proje dizininde bir kez çalıştırın:

```bash
npm ci
cp .env.example .env.local
# .env.local içindeki alanları gerçek canlı değerlerle doldurun
npm run db:migrate
npm run db:seed
npm run build
```

6. İlk yönetici hesabını oluşturun:

```bash
npm run admin:create -- owner@alanadiniz.com 'en-az-12-karakterli-guclu-sifre'
```

7. aaPanel Node projesinin başlangıç komutunu şöyle ayarlayın:

```bash
npm run start -- -p 3000 -H 127.0.0.1
```

8. Alan adını aaPanel reverse proxy ile Node uygulamasının portuna bağlayın. Dışarıya doğrudan 3000 portunu açmak yerine proxy kullanın.
9. HTTPS sertifikasını etkinleştirin ve HTTP → HTTPS yönlendirmesini açın.

## Zorunlu environment değerleri

```dotenv
NODE_ENV=production
APP_URL=https://alanadiniz.com
PAYTR_CALLBACK_URL=https://alanadiniz.com/api/payments/paytr/callback
DATABASE_URL=file:./data/cleris.db
SESSION_COOKIE_NAME=cleris_session
CRON_SECRET=<uzun-rastgele-deger>
PAYTR_MERCHANT_ID=<paytr-magaza-no>
PAYTR_MERCHANT_KEY=<paytr-magaza-parolasi>
PAYTR_MERCHANT_SALT=<paytr-gizli-anahtar>
PAYTR_TEST_MODE=1
PAYTR_DEBUG_ON=0
```

Canlı testler başarıyla tamamlanıp PayTR canlı moda geçtikten sonra `PAYTR_TEST_MODE=0` yapın. PayTR anahtarlarını chat, Git, frontend kodu veya `NEXT_PUBLIC_*` değişkenlerinde asla tutmayın.

## PAYTR panel ayarı

PayTR Mağaza Paneli'nde Bildirim URL'sini şu biçimde tanımlayın:

```text
https://alanadiniz.com/api/payments/paytr/callback
```

Bu endpoint genel erişime açık kalmalıdır; kullanıcı oturumu gerektirmez. CLERIS gelen hash'i doğrular, tekrar eden callback'leri `merchant_oid + hash` ile idempotent işler ve yalnızca düz metin `OK` yanıtı gönderir.

Başarı/başarısız dönüş sayfaları:

```text
https://alanadiniz.com/odeme/basarili
https://alanadiniz.com/odeme/basarisiz
```

Bu sayfalar siparişi onaylamaz. Kesin karar callback'tir.

## Canlıya açmadan önce

- Admin panelinden gerçek ürün fiyatı, beden stokları ve aktif kargo yöntemi tanımlayın.
- `npm run check` çalıştırın.
- PayTR test modunda bir ödeme başlatın; callback'in `OK` aldığını PayTR panelinden kontrol edin.
- Veritabanı için günlük yedek planı oluşturun. Yerel SQLite kullanılıyorsa `data/cleris.db` ile birlikte WAL dosyalarını tutarlı yedekleyin; ölçek/çoklu sunucu gerektiğinde Turso/libSQL kullanın.
- Production'da `npm run dev` kullanmayın; yalnızca `npm run build` + `npm run start` kullanın.

## Güncelleme

```bash
git pull
npm ci
npm run db:migrate
npm run check
npm run build
```

Ardından aaPanel üzerinden Node uygulamasını yeniden başlatın. `db:seed` komutunu, canlıda elle düzenlenmiş katalog veya ayarlar varken tekrar çalıştırmayın.
