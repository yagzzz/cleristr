# Cléris tasarım referansları ve uygulanacak ilkeler

Bu dosya, verilen referans sitelerin tasarım, etkileşim ve motion davranışlarından çıkarılan ilkeleri kaydeder. Amaç referansları birebir kopyalamak değil, iyi fikirleri Cléris için özgün ve performanslı bir tasarım sistemine dönüştürmektir.

## İncelenen kaynaklar

- Watermelon UI: React bileşenleri, animated components, blocks, dashboards, templates ve showcase yaklaşımı.
- Motion Primitives: React/Next.js/Tailwind üzerinde tekrar kullanılabilir motion bileşenleri.
- Void: Streetwear e-ticaret düzeni, koleksiyonlar, ürün kartları ve kategori akışı.
- Flawwears: Kampanya alanları, ürün grid'i, indirim/fiyat sunumu, favori-sepet akışları ve "get the look" yerleşimi.

Referans sitelerin markası, metinleri, görselleri, CSS'i ve birebir layout'u kopyalanmayacak.

---

# 1. Tasarım sistemi ilkeleri

## Genel dil

- Tasarım sade, güçlü ve kontrollü olmalı.
- Sayfa boşluğu ürünün veya içeriğin önüne geçmemeli.
- Bölümler arasında net ritim olmalı; her bölüm aynı yoğunlukta tasarlanmamalı.
- Büyük tipografi, güçlü görsel hiyerarşi ve sınırlı renk kullanımı birlikte değerlendirilmeli.
- Dekoratif detaylar işlevi veya marka anlatımını destekliyorsa kullanılmalı.
- Kart, buton ve menü gibi parçalar tek tek güzel görünmekten çok aynı sistemin parçaları gibi davranmalı.

## Token yaklaşımı

Kodlamaya başlandığında şu token grupları merkezi olarak tanımlanmalı:

- Renkler: background, surface, elevated surface, text, muted text, border, accent, success, warning, danger.
- Typography: display, heading, body, label, caption.
- Spacing: bölüm, grid, card, control ve inline aralıkları.
- Radius: küçük kontrol, kart, panel ve büyük görsel radius'ları.
- Shadow: mümkün olduğunca az ve anlamlı kullanım.
- Motion: hızlı mikro etkileşim, standart geçiş, modal geçişi ve reveal geçişi.
- Breakpoint: içerik kırıldığı noktaya göre belirlenmeli; cihaz listesine göre körü körüne seçilmemeli.

---

# 2. Watermelon UI'den alınacak fikirler

## Component yaklaşımı

Watermelon UI, görsel örneği doğrudan uygulanabilir React component'i ve registry kaynağıyla birlikte sunuyor. Cléris'te bundan şu şekilde yararlanılmalı:

- [ ] Component önce davranış sözleşmesiyle tanımlanmalı.
- [ ] Variant ve state'ler component API'sında açık olmalı.
- [ ] Bileşen görünümü ile iş mantığı mümkün olduğunca ayrılmalı.
- [ ] Her component için loading, disabled, error, focus ve reduced-motion davranışı bulunmalı.
- [ ] Aynı etkileşim farklı sayfalarda tekrarlandığında tek component kullanılmalı.

## Morphing Button davranış modeli

Watermelon Morphing Button örneğinde tek bir buton, tıklanınca input içeren genişletilmiş bir forma dönüşüyor. İncelenen davranışlar:

- Layout animation ile container boyutu değişiyor.
- Spring tabanlı geçiş kullanılıyor.
- Input açıldığında otomatik focus alıyor.
- Enter ile submit destekleniyor.
- Dışarı tıklanınca genişletilmiş durum kapanıyor.
- `AnimatePresence` ile icon ve input giriş/çıkışları yumuşatılıyor.
- Icon, metin ve form aynı kontrol içinde düzenleniyor.

Cléris'te bu fikir yalnızca gerçekten fayda sağladığı yerde kullanılmalı. Kullanıcıdan e-posta, arama veya kısa bir aksiyon istenirken uygun olabilir.

Uygulama şartları:

- [ ] İlk durumda kontrolün ne yaptığı açıkça anlaşılmalı.
- [ ] Genişleyen alan klavye ile açılmalı.
- [ ] Açıldığında focus doğru alana gitmeli.
- [ ] Escape ve dışarı tıklama davranışı tanımlı olmalı.
- [ ] Form doğrulaması ve hata metni görünür olmalı.
- [ ] Boş gönderim engellenmeli.
- [ ] Reduced motion açıkken dönüşüm basitleştirilmeli.
- [ ] Genişleme layout shift'i kontrolsüz biçimde oluşturmamalı.

---

# 3. Motion Primitives'den alınacak fikirler

Motion Primitives, Motion tabanlı, kopyalanabilir ve özelleştirilebilir bileşenler sunuyor. Buradaki yaklaşım Cléris'te "her şeyi hareket ettirmek" şeklinde değil, anlamlı durum değişimlerini açıklamak için kullanılmalı.

## In-view reveal

In-view örneği, öğe viewport'a geldiğinde hidden/visible variant'ları arasında geçiş yapıyor ve `once` seçeneğiyle animasyonun bir defa çalışmasını sağlayabiliyor.

Uygulama ilkeleri:

- [ ] Reveal yalnızca içerik hiyerarşisini destekliyorsa kullanılmalı.
- [ ] İlk ekranın önemli içeriği animasyon bitene kadar görünmez bırakılmamalı.
- [ ] `once` varsayılan olarak tercih edilmeli; sürekli tekrar eden animasyonlardan kaçınılmalı.
- [ ] Reduced motion kullanıcılarında opacity-only veya animasyonsuz alternatif olmalı.
- [ ] Çok sayıda öğede her elemana ayrı ağır observer/animation eklenmemeli.

## Transition Panel

Transition Panel, `activeIndex` değiştiğinde mevcut içeriği exit, yeni içeriği enter/center durumlarıyla değiştiriyor. Onboarding, filtre, tab, ayar veya adım akışlarında kullanılabilir.

Uygulama ilkeleri:

- [ ] İçerik değişimi kullanıcı tarafından anlaşılabilir olmalı.
- [ ] Panel yüksekliği değişiyorsa çevredeki layout kontrollü hareket etmeli.
- [ ] Geri/ileri hareketlerinde yön duygusu korunmalı.
- [ ] Klavye odağı yeni içeriğe doğru taşınmalı.
- [ ] Animasyon, içerik erişimini geciktirmemeli.
- [ ] Uzun listeler ve yoğun tablolar için gereksiz geçiş kullanılmamalı.

## Dialog

Motion Primitives Dialog örneğinde native dialog, portal, backdrop, scroll kilidi, controlled/uncontrolled kullanım, aria bağlantıları ve exit animasyonu birlikte ele alınıyor.

Cléris dialog şartları:

- [ ] `role`, başlık ve açıklama ilişkisi doğru olmalı.
- [ ] Modal açıldığında focus dialog içine alınmalı.
- [ ] Modal kapanınca focus tetikleyici elemana dönmeli.
- [ ] Escape ile kapanma tanımlı olmalı.
- [ ] Backdrop tıklaması kapanacaksa bunun davranışı açık olmalı.
- [ ] Açıkken arka sayfa scroll'u kontrol edilmeli.
- [ ] Exit animasyonu tamamlanmadan içerik erişilemez biçimde kaldırılmamalı.
- [ ] Küçük ekranlarda dialog viewport'a sığmalı.
- [ ] Kritik işlem dialog'u yanlışlıkla backdrop tıklamasıyla kapanmamalı.

## Genel motion ilkeleri

- `transform` ve `opacity` öncelikli kullanılmalı.
- Layout animasyonu yalnızca küçük ve kontrollü bölgelerde kullanılmalı.
- Scroll event'i yerine IntersectionObserver veya framework uyumlu çözüm tercih edilmeli.
- Aynı anda çok sayıda spring çalıştırılmamalı.
- Hover hareketi dokunmatik cihazlarda zorunlu akış olmamalı.
- Motion, bilgi hiyerarşisini ve kullanıcı geri bildirimini güçlendirmeli.
- Animasyon hiçbir zaman form doğrulaması, hata mesajı veya kritik içeriğin yerine geçmemeli.

---

# 4. Void'den alınacak fikirler

Void incelemesinde öne çıkan e-ticaret yapı taşları:

- Üst seviye koleksiyon ve kategori navigasyonu.
- Sezon veya koleksiyon başlığıyla güçlü giriş.
- Büyük ürün grid'leri.
- Ürün kartında görsel, marka/seri, ürün adı, fiyat, eski fiyat ve renk sayısı.
- Stokta yok durumunun kart üzerinde görünmesi.
- Canlı destek, hesap, arama ve sepet girişlerinin görünür tutulması.
- Kategori geçişleri ve "alışverişe başla" çağrıları.
- "Get the look" benzeri stil/kategori yönlendirmesi.

Cléris'te uygulanırken:

- [ ] Ürün kartının en önemli bilgileri küçük ekranda da okunabilir kalmalı.
- [ ] Eski ve yeni fiyatın ilişkisi açık olmalı.
- [ ] Stok yok durumu yalnızca renkle anlatılmamalı.
- [ ] Renk/beden varyantları gerçek veriyle bağlı olmalı.
- [ ] Sepete ekleme sonucu kullanıcıya açık feedback verilmeli.
- [ ] Ürün görselleri lazy-load edilmeli; kart grid'i başlangıç yükünü şişirmemeli.
- [ ] Filtre ve sıralama URL ile paylaşılabilir tasarlanmalı; gereksiz client state kullanılmamalı.

---

# 5. Flawwears'den alınacak fikirler

Flawwears incelemesinde öne çıkan yapı taşları:

- Üstte birden fazla kampanya/duyuru görseli.
- Kampanya, yeni gelenler ve kategori geçişleri.
- "Çok satanlar" ve "Yeni gelenler" gibi ürün grupları.
- Ürün kartında favori, sepete ekle, ürünü incele, fiyat, eski fiyat ve indirim bilgisi.
- Ürün miktarını artırma/azaltma gibi hızlı kontrol alanları.
- "Get the look" altında stil kategorileri.
- KDV dahil gibi fiyat bilgilendirmeleri.

Cléris'te uygulanırken:

- [ ] Kampanya görseli metin yerine gerçek HTML metniyle desteklenmeli.
- [ ] Kampanya alanlarının mobilde yatay taşması engellenmeli.
- [ ] İndirim etiketi, yeni fiyat ve eski fiyat birbirini doğru anlatmalı.
- [ ] Favori ve sepet aksiyonları login gerektiriyorsa kullanıcıya açıkça bildirilmeli.
- [ ] Hızlı ürün aksiyonları kartı kalabalıklaştırmamalı.
- [ ] Ürün grid'i tek tip boş placeholder ile yayınlanmamalı.
- [ ] Görsellerin alt metinleri ürün adını taşımalı.
- [ ] Ürün ve kategori linkleri gerçek hedeflere gitmeli; boş `#` akışları bırakılmamalı.

---

# 6. Birleştirilecek Cléris yaklaşımı

İlk tasarım yönü, içerik ve ürün kapsamı netleşene kadar teknoloji veya renk açısından kesinleştirilmemeli. Ancak şu davranış kuralları sabit tutulmalı:

## Layout

- Büyük görsel/hero alanı ile içerik yoğun grid'ler arasında ritim kurulmalı.
- Grid kolonları ekran genişliğine göre akıcı biçimde değişmeli.
- Container genişliği okunabilirlik ile ürün sergileme ihtiyacına göre ayarlanmalı.
- Mobile-first kırılımda içerik gizlemek yerine sıralamak ve önceliklendirmek tercih edilmeli.
- Header, nav, filtre ve sepet gibi kritik alanlar içerik üzerinde kaybolmamalı.

## Component states

Her etkileşimli bileşen en az şu durumları tanımlamalı:

- Default
- Hover
- Focus-visible
- Active/pressed
- Disabled
- Loading
- Empty
- Error
- Success
- Reduced motion
- Small-screen layout

## Mikro etkileşimler

- Button press feedback kısa ve belirgin olmalı.
- Favori/sepet değişimi görünür bir feedback vermeli.
- Input validation sonucu layout'u zıplatmamalı.
- Hover, yalnızca destekleyici bilgi veya affordance sağlamalı.
- Morphing, reveal ve transition efektleri içerik amacına bağlı olmalı.
- Her motion için animasyonsuz kullanılabilir bir temel durum bulunmalı.

## Görsel ve içerik kalitesi

- Görsel oranları kartlar arasında tutarlı olmalı.
- Ürün görselleri aynı ürünün farklı varyantlarını doğru göstermeli.
- Placeholder ve düşük çözünürlüklü görsel production'a bırakılmamalı.
- Görsel üzerine yazılan kritik metin HTML olarak da bulunmalı.
- Alt metin, başlık ve link metni arama motoru ve ekran okuyucu için anlamlı olmalı.

---

# 7. Performans sınırları

- Görsel kalite gereksiz bundle veya network yükü pahasına artırılmamalı.
- Büyük hero görseli optimize edilmeden yayına alınmamalı.
- Modern görsel formatları ve responsive kaynaklar kullanılmalı.
- Font sayısı ve ağırlıkları sınırlı tutulmalı.
- Motion kütüphanesi yalnızca gereken bileşenlerde kullanılmalı.
- İlk açılışta kritik olmayan carousel, analytics ve ağır widget'lar engel olmamalı.
- Animasyonların GPU-friendly olması tek başına yeterli değildir; toplam CPU, memory ve layout maliyeti ölçülmeli.
- Lighthouse/PageSpeed sonucu gerçek cihaz ve mobil ağ koşullarıyla birlikte değerlendirilmelidir.

---

# 8. Tasarım kararları kaydı

Her büyük tasarım kararı aşağıdaki formatla bu dosyaya eklenmeli:

```md
## Karar: [kısa başlık]

- Tarih:
- Problem:
- Seçilen yaklaşım:
- Neden:
- Alternatifler:
- Accessibility etkisi:
- Performance etkisi:
- Geri alma/değiştirme maliyeti:
- İlgili sayfalar veya bileşenler:
```

Bir referans sitesinden alınan fikir doğrudan uygulanmadan önce şu sorular cevaplanmalı:

1. Cléris kullanıcısına gerçekten fayda sağlıyor mu?
2. Aynı davranış daha az JavaScript ile yapılabilir mi?
3. Klavye, mobil ve reduced-motion durumları nasıl olacak?
4. İçeriğin anlaşılmasını kolaylaştırıyor mu, yoksa yalnızca görsel gösteri mi?
5. Performans ve bakım maliyeti kabul edilebilir mi?
