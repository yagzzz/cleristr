# CLERIS tasarım yenilemesi — 2026-09-20

## Karar: Watermelon ve Motion Primitives esintili, özgün commerce arayüzü

- Problem: İlk storefront, ürün sunumuna yeterince güçlü bir görsel sistem ve işlevsel discovery katmanı vermiyordu. Kartlar keskin, büyük hero bölümü parçalı ve tema/dil tercihleri yoktu.
- Seçilen yaklaşım: Watermelon UI'de incelenen Card Swipe, Add Cash Disclosure, Morphing Discovery Bar, Switch Mode, Feedback, Announcement ve Auth davranışlarını **CLERIS'e ait veri, metin, layout ve component API'larıyla** yeniden tasarlamak.
- Neden: Kaynakların küçük, durum odaklı motion yaklaşımı modern UX sağlar; ancak giyim e-ticaretinde cüzdan/kart verisi yerine gerçek ürün, sepet, kargo ve PAYTR işlemleri temel alınmalıdır.
- Lisans: Watermelon platformu MIT lisanslıdır; yine de CLERIS registry kodunu, örnek verisini, marka metnini veya birebir görünümü kopyalamaz. Kaynak: https://github.com/WatermelonCorp/watermelon-platform/blob/main/LICENSE
- Accessibility: Klavye kontrolü, görünür focus, Escape/dış tıklama, reduced-motion ve en az 44px hit alanı zorunludur.
- Performance: Motion yalnızca `transform`/`opacity` ile, lazy client component sınırlarında uygulanır. İlk hero server-rendered kalır.

## Uygulama eşlemesi

| Referans davranışı | CLERIS eşdeğeri | Gerçek işlev |
| --- | --- | --- |
| Card Swipe | Ürün hikâyesi kart destesi | Mobilde üç gerçek ürün/varyasyon/video odaklı kart arasında swipe; masaüstünde aynı üç içerik yan yana okunur. |
| Add Cash Disclosure | Ödeme açıklama paneli | Fiyat, kargo, iade ve PAYTR iframe aktarımını açıklar; hiçbir kart bilgisi veya sahte cüzdan saklamaz. |
| Morphing Discovery Bar | Katalog keşif çubuğu | Arama, gerçek kategori/marka/stok filtreleri ve URL ile paylaşılabilir sonuç. |
| Switch Mode | Sistem / açık / koyu tema | Tarayıcı tercihini izler, kullanıcı seçimini saklar, renk şeması değişir. |
| Announcement 4 | Kapatılabilir kampanya şeridi | Admin'den gelen geçerli duyuruyu gösterir; kapatma tercihi yerelde saklanır. |
| Announcement 9 | Çerez tercih paneli | Gerekli tercihler + isteğe bağlı ölçüm/marketing tercihleri; onay olmadan isteğe bağlı script yüklenmez. |
| Auth 06 | İki panelli CLERIS auth yüzeyi | Kayıt CTA'sı güçlü, şifre formu erişilebilir, Google OAuth yalnızca sunucu credential'ları tanımlandığında aktiftir. |
| Bento 1 | Ürün değerleri bento alanı | Sadece gerçek ürün medyası, materyal, bakım ve kargo verisi varsa yayınlanır. |
| Feedback | Ürün/site geribildirim sheet'i | Gerçek `feedback` tablosuna kayıt açar; başarı/hata durumu gösterir. |

## Visual token kararları

- Card/panel radius: `12px`; küçük kontroller: `10px`; pill yalnızca tag/toggle için.
- Hero: masaüstünde kesintisiz tam genişlikte bir görsel yüzey; card çizgileri hero içinde parçalama yapmaz.
- Renk: CLERIS siyahı, kırık beyazı ve tek asit vurgusu; koyu modda eşdeğer kontrast.
- Motion: 160–260ms mikro-etkileşim, 360ms panel geçişi; reduced motion'da geçiş yok.
- Tipografi: sistem fontu ilk render hızını korur; harici font yüklenmez.
