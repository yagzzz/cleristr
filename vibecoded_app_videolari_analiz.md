# Site geliştirme için zorunlu güvenlik, gizlilik ve uyumluluk gereksinimleri

Bu belge, siteye yeni özellik eklerken veya mevcut özellikleri düzenlerken **kontrol listesi ve kabul kriteri** olarak kullanılmalıdır. Yeni bir özellik bu maddeler kontrol edilmeden tamamlanmış sayılmamalıdır.

Amaç yalnızca sitenin çalışması değildir. Site aynı zamanda güvenli, anlaşılır, erişilebilir, gizliliğe saygılı ve kullanıcıdan ne aldığını açıkça anlatan bir ürün olmalıdır.

---

## Nasıl kullanılmalı?

Her yeni özellik için aşağıdaki sırayla kontrol yapılmalı:

1. Özellik hangi verileri topluyor veya üretiyor?
2. Bu veriler neden gerekli?
3. Veriler nereye gönderiliyor ve hangi üçüncü taraf hizmetleri kullanılıyor?
4. Kullanıcıdan hangi izin veya onay gerekiyor?
5. Kullanıcı verisini görebiliyor, düzeltebiliyor, silebiliyor veya dışa aktarabiliyor mu?
6. Özellik klavye, mobil cihaz ve ekran okuyucu ile kullanılabiliyor mu?
7. Hata, yetkisiz erişim, ağ kesintisi ve kötü niyetli girdiler nasıl ele alınıyor?
8. Özellik için test yazıldı mı?
9. Kullanıcıya gösterilen metinler açık mı ve yanıltıcı mı?
10. Gizlilik, güvenlik, erişilebilirlik ve yasal metinler güncellendi mi?

### Öncelik seviyeleri

- **P0 — Yayına engel:** Güvenlik, kişisel veri, ödeme, kullanıcı onayı veya temel yasal bilgilendirme eksikleri.
- **P1 — Yayından önce tamamlanmalı:** Erişilebilirlik, kullanıcı hakları, e-posta kuralları, üçüncü taraf hizmet denetimi ve hata senaryoları.
- **P2 — Planlı kalite geliştirmesi:** Ek raporlar, gelişmiş otomasyonlar, ek performans ve kullanılabilirlik iyileştirmeleri.

---

# 1. Yayında bulunması gereken temel sayfalar

## P0 — Gizlilik ve kullanım metinleri

- [ ] Gizlilik politikası hazırlanmalı.
- [ ] Hizmet kullanım şartları hazırlanmalı.
- [ ] İade, iptal ve ücretlendirme politikası hazırlanmalı.
- [ ] Çerez politikası hazırlanmalı.
- [ ] İletişim ve işletme bilgileri görünür olmalı.
- [ ] Veri talebi, veri silme ve gizlilik başvuruları için iletişim veya form bulunmalı.
- [ ] Bu sayfalar ana menüden veya footer alanından erişilebilir olmalı.
- [ ] Metinlerde işletmenin gerçek unvanı, iletişim adresi ve güncelleme tarihi bulunmalı.
- [ ] Hukuki metinler sahte şirket bilgileriyle veya boş placeholder metinlerle yayına alınmamalı.
- [ ] Metinler hedef kullanıcıların bulunduğu ülke ve bölgelere göre uzman tarafından gözden geçirilmeli.

## P0 — İşletme ve iletişim bilgileri

- [ ] İşletmenin adı açıkça gösterilmeli.
- [ ] Geçerli iletişim e-postası bulunmalı.
- [ ] Gerekiyorsa posta adresi ve şirket kayıt bilgileri eklenmeli.
- [ ] Destek kanalının çalışma şekli ve beklenen yanıt süresi açıklanmalı.
- [ ] Kullanıcı, ödeme veya veri sorununda kime ulaşacağını kolayca bulabilmeli.

---

# 2. Kişisel veri ve kullanıcı onayı

## P0 — Veri envanteri

Her veri alanı için aşağıdaki bilgiler kaydedilmeli:

- [ ] Alanın adı.
- [ ] Verinin kişisel veri olup olmadığı.
- [ ] Toplama amacı.
- [ ] Verinin zorunlu veya isteğe bağlı olduğu.
- [ ] Saklama süresi.
- [ ] Verinin gönderildiği servisler.
- [ ] Veriye erişebilen roller.
- [ ] Silme ve dışa aktarma yöntemi.

Gereksiz veri alanları forma eklenmemeli. Bir özellik için gerekli olmayan doğum tarihi, telefon, konum, kişi listesi, dosya veya takip verisi istenmemeli.

## P0 — Açık ve ayrı onay

- [ ] Zorunlu hizmet onayı ile isteğe bağlı pazarlama onayı birbirinden ayrılmalı.
- [ ] Onay kutuları varsayılan olarak seçili gelmemeli.
- [ ] Kullanıcı hangi verinin hangi amaçla kullanılacağını işlemden önce görmeli.
- [ ] Onay metni sade ve anlaşılır olmalı.
- [ ] Onayın zamanı, metin sürümü ve ilgili kullanıcı kaydedilmeli.
- [ ] Kullanıcı onayını geri çekebilmeli.
- [ ] Onay geri çekildiğinde sistemin ne yaptığı kullanıcıya açıklanmalı.
- [ ] Formlarda gerekli onayların gerçekten verildiği backend tarafında da kontrol edilmeli.
- [ ] Sadece frontend'de yapılan onay kontrolüne güvenilmemeli.

## P0 — Yaş ve çocuk verileri

- [ ] Ürünün yaş sınırı açıkça belirtilmeli.
- [ ] Gerekiyorsa kayıt sırasında yaş kontrolü veya yaş kapısı uygulanmalı.
- [ ] Çocuklara ait veri toplanacaksa hangi ek izin ve süreçlerin gerektiği belirlenmeli.
- [ ] Yaş bilgisini gereksiz yere saklamaktan kaçınılmalı.
- [ ] Yaş sınırı altındaki kullanıcılar için kayıt, içerik yükleme, ödeme ve mesajlaşma akışları ayrıca kontrol edilmeli.
- [ ] Çocuk verileri yanlışlıkla toplandığında uygulanacak silme ve bildirim süreci tanımlanmalı.

## P0 — Kullanıcı veri hakları

Kullanıcı, uygun olduğu durumlarda şu işlemleri talep edebilmeli:

- [ ] Hangi verilerin tutulduğunu öğrenme.
- [ ] Verileri düzeltme.
- [ ] Verileri silme.
- [ ] Verileri dışa aktarma.
- [ ] Belirli veri işleme faaliyetlerine itiraz etme.
- [ ] Pazarlama iletişimini durdurma.
- [ ] Onayı geri çekme.

Bu talepler için sadece e-posta adresi yazmak yeterli görülmemeli. Talebin alınması, kimlik doğrulaması, işlenmesi, tamamlanması ve sonucunun kullanıcıya bildirilmesi için gerçek bir süreç bulunmalı.

## P0 — Saklama ve silme

- [ ] Her veri türü için saklama süresi belirlenmeli.
- [ ] Kullanıcı hesabı silindiğinde hangi verilerin silineceği açıklanmalı.
- [ ] Yasal veya teknik sebeple tutulması gereken veriler ayrıştırılmalı.
- [ ] Yedeklerde kalan verilerin nasıl silineceği veya süresi dolunca yok edileceği belirlenmeli.
- [ ] Silme işlemi idempotent olmalı; aynı talep tekrarlandığında hata oluşturmamalı.

---

# 3. Çerezler, analytics ve üçüncü taraf hizmetler

## P0 — Üçüncü taraf envanteri

Sitede kullanılan her dış servis kayıt altına alınmalı:

- [ ] Analytics araçları.
- [ ] Reklam ve takip araçları.
- [ ] Session replay araçları.
- [ ] Ödeme sağlayıcıları.
- [ ] E-posta ve SMS sağlayıcıları.
- [ ] Harici yazı tipleri.
- [ ] Harici JavaScript paketleri ve SDK'lar.
- [ ] Harita, video, sohbet veya sosyal medya bileşenleri.
- [ ] Dosya depolama ve hata izleme servisleri.

Her servis için amacı, gönderilen veri, veri bölgesi, saklama süresi, gerekli onay ve kapatma yöntemi yazılmalı.

## P0 — Varsayılan gizlilik

- [ ] İsteğe bağlı analytics ve reklam takibi kullanıcı onayı olmadan başlamamalı.
- [ ] Zorunlu olmayan çerezler varsayılan olarak kapalı olmalı.
- [ ] Kullanıcı tüm çerezleri tek seçenekle kabul edebildiği gibi yalnızca gerekli çerezleri de seçebilmeli.
- [ ] Çerez tercihi sonradan değiştirilebilmeli.
- [ ] Çerez banner'ı kullanıcıyı kabul etmeye zorlayan karanlık tasarım kullanmamalı.
- [ ] Çerez tercihleri kaydedilmeli ve tekrar ziyaretlerde uygulanmalı.
- [ ] Onay geri çekildiğinde isteğe bağlı servisler durdurulmalı.

## P0 — Session replay ve tuş vuruşları

- [ ] Session replay varsayılan olarak kapalı olmalı veya açık onaya bağlanmalı.
- [ ] Şifre, ödeme, kimlik, sağlık ve diğer hassas alanlar hiçbir şekilde kaydedilmemeli.
- [ ] Tuş vuruşu kayıt özelliği kapalı olmalı.
- [ ] Hassas alanlar maskeleme ile korunmalı; yalnızca görsel maskeleme yeterli kabul edilmemeli.
- [ ] Analytics olaylarına e-posta, telefon, token, şifre veya serbest metin gönderilmemeli.
- [ ] Üçüncü taraf servislerin veri işleme ayarları gerçek ortamda kontrol edilmeli.

## P1 — Harici kaynaklar

- [ ] Mümkünse yazı tipleri ve statik varlıklar güvenilir şekilde kendi alan adından sunulmalı.
- [ ] Harici kaynak çağrılarının kullanıcı IP'si ve diğer başlıklar üzerindeki etkisi incelenmeli.
- [ ] Kullanılmayan SDK ve scriptler kaldırılmalı.
- [ ] Paketler düzenli güncellenmeli ve güvenlik açıkları izlenmeli.
- [ ] Her harici servis için devre dışı bırakma veya değiştirme planı bulunmalı.

---

# 4. Kayıt, giriş ve hesap güvenliği

## P0 — Kimlik doğrulama

- [ ] Şifreler geri döndürülemeyecek güçlü bir algoritmayla hash'lenmeli.
- [ ] Şifreler, tokenlar ve gizli anahtarlar loglara yazılmamalı.
- [ ] Oturum çerezleri `Secure`, `HttpOnly` ve uygun `SameSite` ayarlarıyla kullanılmalı.
- [ ] Oturum süresi ve çıkış davranışı tanımlı olmalı.
- [ ] Şüpheli giriş ve çok sayıda başarısız deneme sınırlandırılmalı.
- [ ] Şifre sıfırlama tokenları tek kullanımlık ve süreli olmalı.
- [ ] E-posta doğrulama bağlantıları güvenli, süreli ve tek kullanımlık olmalı.
- [ ] Yetki kontrolleri backend'de yapılmalı.
- [ ] Kullanıcı yalnızca kendi verisine erişebilmeli.
- [ ] Yönetici işlemleri ayrı rol ve ek güvenlik kontrolleriyle korunmalı.

## P0 — Form güvenliği

- [ ] Tüm girdiler backend'de doğrulanmalı.
- [ ] SQL, HTML, JavaScript, komut ve şablon enjeksiyonlarına karşı koruma bulunmalı.
- [ ] CSRF koruması gereken işlemlerde uygulanmalı.
- [ ] Rate limit ve kötüye kullanım koruması eklenmeli.
- [ ] Hata mesajları veritabanı, token veya iç sistem bilgisi sızdırmamalı.
- [ ] Kullanıcıya güvenlik kodu, şifre veya gizli token tekrar gösterilmemeli.

---

# 5. Ödeme, fiyatlandırma ve abonelik

## P0 — Açık fiyatlandırma

- [ ] Fiyat açık ve kolay görülebilir olmalı.
- [ ] Vergi, ek ücret ve kullanım sınırları satın alma öncesinde gösterilmeli.
- [ ] Tek seferlik ödeme ile yenilenen ödeme açıkça ayrılmalı.
- [ ] Abonelik periyodu ve yenileme şartları ödeme düğmesinin yanında görünmeli.
- [ ] Deneme süresinin ne zaman ücretli plana döneceği yazılmalı.
- [ ] Kullanıcıdan hangi tutarın ne zaman çekileceği açık olmalı.
- [ ] İptal yöntemi satın alma yöntemi kadar kolay olmalı.
- [ ] İptal sonrası erişim, faturalandırma ve geri ödeme davranışı açıklanmalı.
- [ ] Gizli ücret, zorunlu ek hizmet veya yanıltıcı düğme kullanılmamalı.
- [ ] Ödeme sonucu frontend mesajına göre değil, ödeme sağlayıcısının güvenilir backend bildirimiyle kesinleştirilmeli.

## P0 — İade ve iptal

- [ ] İade koşulları ödeme öncesinde erişilebilir olmalı.
- [ ] İade talebi için gerçek bir akış veya destek süreci bulunmalı.
- [ ] İade, iptal ve abonelik durumu backend'de kaydedilmeli.
- [ ] Kullanıcıya işlem sonucu ve sonraki adımlar açıkça bildirilmeli.
- [ ] Ödeme sağlayıcısındaki durum ile uygulamadaki abonelik durumu düzenli olarak eşleştirilmeli.

---

# 6. E-posta ve pazarlama iletişimi

## P0 — Pazarlama e-postaları

- [ ] Pazarlama e-postalarında abonelikten çıkma bağlantısı bulunmalı.
- [ ] Abonelikten çıkma bağlantısı giriş zorunluluğu olmadan çalışmalı.
- [ ] İşletmenin kimliği ve gerekli iletişim/posta bilgileri e-postada yer almalı.
- [ ] Abonelikten çıkan kullanıcı tekrar pazarlama listesine otomatik eklenmemeli.
- [ ] Pazarlama izni ile hesap işlemleri için zorunlu e-postalar ayrılmalı.
- [ ] Gönderim izinleri ve çıkış işlemleri kaydedilmeli.
- [ ] E-posta şablonlarında sahte kıtlık, sahte geri sayım, sahte yorum veya kanıtlanamayan iddia kullanılmamalı.
- [ ] Kullanıcıya gönderilen her e-posta türü ve amacı dokümante edilmeli.

---

# 7. Kullanıcı yüklemeleri, telif ve içerik yönetimi

## P0 — Dosya ve görsel yükleme

- [ ] Yüklenen dosyanın türü, boyutu ve içeriği backend'de doğrulanmalı.
- [ ] Dosya adları güvenli biçimde yeniden oluşturulmalı.
- [ ] Yüklenen dosyalar doğrudan çalıştırılabilir bir konumda tutulmamalı.
- [ ] Zararlı dosya ve içerik taraması yapılmalı.
- [ ] Görseller için güvenli dönüştürme ve boyutlandırma uygulanmalı.
- [ ] Kullanıcıya hangi haklara sahip olması gerektiği açıkça anlatılmalı.
- [ ] Kullanıcı yüklemeleri varsayılan olarak herkese açık yapılmamalı.
- [ ] İçerik silme, gizleme ve raporlama akışı bulunmalı.

## P1 — Telif ve kaldırma süreci

- [ ] Kullanım şartlarında kullanıcı yüklemelerinin hakları ve sorumlulukları açıklanmalı.
- [ ] Telif ihlali bildirimi için ulaşılabilir bir kanal bulunmalı.
- [ ] Bildirim, inceleme, geçici gizleme ve kaldırma adımları tanımlanmalı.
- [ ] Tekrarlanan ihlaller için hesap politikası belirlenmeli.
- [ ] Platformun faaliyet gösterdiği bölgelere göre gerekli telif temsilcisi veya bildirim süreci araştırılmalı.
- [ ] Siteye ait kullanılan font, ikon, fotoğraf, video ve kodların lisansları kaydedilmeli.

---

# 8. Yanıltıcı tasarım ve içerik kuralları

- [ ] Kullanıcıyı istemediği seçeneğe iten karanlık tasarım kullanılmamalı.
- [ ] Kabul düğmesi ile reddetme veya kapatma seçeneği arasında kasıtlı zorluk farkı oluşturulmamalı.
- [ ] Abonelik iptali, kayıt kadar kolay bulunabilmeli.
- [ ] Önceden seçili pazarlama veya paylaşım izinleri kullanılmamalı.
- [ ] Gizli ücret, son adımda çıkan zorunlu ek maliyet veya belirsiz ödeme dili kullanılmamalı.
- [ ] Sahte yorum, sahte kullanıcı sayısı, sahte başarı oranı veya sahte aciliyet kullanılmamalı.
- [ ] Ürün iddiaları ölçülebilir bir kanıtla desteklenmeli.
- [ ] Kullanıcı yorumlarının gerçekliği ve moderasyon yöntemi belirlenmeli.
- [ ] Reklam, sponsorluk ve ortaklık ilişkileri gerektiğinde açıkça belirtilmeli.

---

# 9. Erişilebilirlik

## P1 — Temel erişilebilirlik

- [ ] Sayfalar anlamlı HTML öğeleriyle oluşturulmalı.
- [ ] Her form alanının görünür etiketi bulunmalı.
- [ ] Hata mesajları ilgili alanla ilişkilendirilmeli.
- [ ] Görsellerde anlamına uygun alt metin bulunmalı.
- [ ] Dekoratif görseller ekran okuyucudan gizlenmeli.
- [ ] Site tamamen klavye ile kullanılabilmeli.
- [ ] Klavye odağı görünür olmalı.
- [ ] Odak sırası mantıklı olmalı.
- [ ] Modal, menü ve dropdown açıldığında odak yönetimi yapılmalı.
- [ ] Renk tek başına bilgi taşıyan tek yöntem olmamalı.
- [ ] Metin ve arka plan kontrastı kontrol edilmeli.
- [ ] Yazı boyutu büyütüldüğünde içerik taşmamalı veya kaybolmamalı.
- [ ] Animasyonlar azaltılmış hareket tercihine saygı göstermeli.
- [ ] Otomatik oynayan ses ve hareket mümkünse kullanılmamalı.
- [ ] Mobil ekranlarda dokunma hedefleri yeterli büyüklükte olmalı.

## P1 — Erişilebilirlik testleri

- [ ] Klavye ile baştan sona manuel test yapılmalı.
- [ ] En az bir ekran okuyucu ile temel akışlar test edilmeli.
- [ ] Renk kontrastı otomatik araçla kontrol edilmeli.
- [ ] Form hataları, giriş, ödeme ve modal akışları ayrıca test edilmeli.
- [ ] Erişilebilirlik sorunları özellik tamamlanmadan takip listesine yazılmalı.

---

# 10. Hata yönetimi, loglama ve izleme

## P0 — Hata ve durumlar

Her kritik özellik şu durumları tasarlamalı:

- [ ] İlk yükleme.
- [ ] Boş veri.
- [ ] Yükleniyor.
- [ ] Başarılı işlem.
- [ ] Doğrulama hatası.
- [ ] Yetkisiz erişim.
- [ ] Yetki yetersizliği.
- [ ] Ağ kesintisi.
- [ ] Sunucu hatası.
- [ ] Tekrar deneme.
- [ ] İşlem sırasında sayfadan ayrılma.
- [ ] Aynı isteğin tekrar gönderilmesi.

Hata mesajları kullanıcıya ne olduğunu ve güvenli biçimde ne yapabileceğini anlatmalı. İç sistem ayrıntıları, stack trace, token veya kişisel veri gösterilmemeli.

## P0 — Log ve audit kayıtları

- [ ] Loglara şifre, token, ödeme bilgisi, tam e-posta ve hassas form içeriği yazılmamalı.
- [ ] Kim hangi kritik işlemi ne zaman yaptı bilgisi gerektiği kadar kaydedilmeli.
- [ ] Onay verme, onayı geri çekme, hesap silme, veri dışa aktarma ve yönetici işlemleri audit kaydına alınmalı.
- [ ] Loglara erişim yetkilendirilmeli.
- [ ] Log saklama süresi belirlenmeli.
- [ ] Hata izleme aracı kişisel veri toplamadan yapılandırılmalı.

---

# 11. Yönetici paneli ve yetkiler

- [ ] Yönetici paneli herkese açık bir rota olmamalı.
- [ ] Rol tabanlı yetkilendirme uygulanmalı.
- [ ] Yönetici işlemleri için ayrı audit kaydı tutulmalı.
- [ ] Kullanıcı verisi toplu dışa aktarılırken ek yetki ve kayıt kontrolü yapılmalı.
- [ ] Silme ve geri döndürülemez işlemler için açık onay istenmeli.
- [ ] Yönetici listeleri ve aramalarda kişisel veriler gereksiz yere gösterilmemeli.
- [ ] Yönetici oturumları normal kullanıcı oturumlarından daha sıkı korunmalı.

---

# 12. Teknik yayın öncesi kontrol

## P0 — Gizli bilgiler ve yapılandırma

- [ ] API anahtarları ve gizli bilgiler frontend bundle'ına eklenmemeli.
- [ ] Gizli bilgiler `.env` veya güvenli secret yönetimiyle tutulmalı.
- [ ] Üretim secret'ları Git'e gönderilmemeli.
- [ ] Test, staging ve production ortamları ayrılmalı.
- [ ] CORS, CSP, güvenlik başlıkları ve HTTPS ayarları kontrol edilmeli.
- [ ] Debug modu production ortamında kapalı olmalı.
- [ ] Kaynak haritaları ve hata sayfaları gereksiz iç bilgileri açığa çıkarmamalı.

## P1 — Bağımlılıklar ve dışa açılan yüzey

- [ ] Bağımlılıklar güvenlik açığı taramasından geçirilmeli.
- [ ] Kullanılmayan paketler kaldırılmalı.
- [ ] API endpoint'leri kimlik doğrulama ve yetki kontrolünden geçirilmeli.
- [ ] Rate limit, pagination ve maksimum istek boyutu belirlenmeli.
- [ ] Webhook imzaları doğrulanmalı.
- [ ] Dosya, görsel, metin ve URL girdileri kötüye kullanıma karşı sınırlandırılmalı.

---

# 13. Test ve kabul kriterleri

Bir özellik tamamlandı denmeden önce aşağıdaki kontroller yapılmalı:

## Fonksiyonel test

- [ ] Mutlu akış çalışıyor.
- [ ] Geçersiz veri reddediliyor.
- [ ] Eksik veri anlaşılır hata veriyor.
- [ ] Yetkisiz kullanıcı engelleniyor.
- [ ] Aynı işlem tekrarlandığında veri bozulmuyor.
- [ ] Mobil ve masaüstü ekranlarda çalışıyor.

## Gizlilik testi

- [ ] Ağ istekleri incelendi.
- [ ] Gereksiz veri gönderilmiyor.
- [ ] Onay verilmeden isteğe bağlı izleme başlamıyor.
- [ ] Hassas alanlar analytics ve session replay'de maskeli veya tamamen hariç.
- [ ] Kullanıcı silme ve veri talebi akışı çalışıyor.

## Güvenlik testi

- [ ] Girdi doğrulaması backend'de yapılıyor.
- [ ] Yetki atlatma denemeleri başarısız oluyor.
- [ ] Rate limit çalışıyor.
- [ ] Hata yanıtları gizli bilgi sızdırmıyor.
- [ ] Token ve şifreler loglarda görünmüyor.

## Erişilebilirlik testi

- [ ] Sadece klavye ile kullanılabiliyor.
- [ ] Odak görünür ve sırası mantıklı.
- [ ] Form alanları ve hataları ekran okuyucu tarafından anlaşılabiliyor.
- [ ] Görsellerin alt metinleri kontrol edildi.
- [ ] Kontrast ve yazı boyutu kontrol edildi.

## Dokümantasyon testi

- [ ] Özelliğin topladığı veri dokümante edildi.
- [ ] Üçüncü taraf servis kullanımı dokümante edildi.
- [ ] Kullanıcıya gösterilen metinler güncellendi.
- [ ] Gizlilik politikası veya hizmet şartlarında değişiklik gerekiyorsa yapıldı.
- [ ] Yeni ayarlar ve varsayılanlar açıklanmış durumda.

---

# 14. Her yeni özellik için kısa kayıt şablonu

Yeni özellik eklenirken bu bölüm kopyalanıp doldurulmalı:

```md
## Özellik: [özelliğin adı]

- Amaç:
- Kullanıcı akışı:
- Toplanan veriler:
- Toplama gerekçesi:
- Zorunlu / isteğe bağlı alanlar:
- Kullanıcı onayı gerekiyor mu?:
- Kullanılan üçüncü taraf servisler:
- Verinin saklama süresi:
- Veriyi silme yöntemi:
- Erişilebilirlik kontrolü:
- Güvenlik kontrolü:
- Hata durumları:
- Testler:
- Güncellenmesi gereken yasal veya bilgilendirici metinler:
- Yayın öncesi kalan işler:
```

---

# 15. Yayın öncesi son kontrol listesi

## P0 — Yayını durdurabilecek eksikler

- [ ] Gizlilik politikası, hizmet şartları ve iade/iptal bilgileri gerçek bilgilerle hazır.
- [ ] İşletme ve destek iletişim bilgileri görünür.
- [ ] Gereksiz veri toplanmıyor.
- [ ] Onaylar ayrı, açık ve varsayılan olarak seçilmemiş.
- [ ] Çerez ve analytics tercihleri çalışıyor.
- [ ] Session replay hassas verileri toplamıyor veya kapalı.
- [ ] Şifre, token ve ödeme verisi loglanmıyor.
- [ ] Yetkisiz kullanıcı başka kullanıcıların verisine erişemiyor.
- [ ] Abonelik yenileme, fiyat, iptal ve iade koşulları açık.
- [ ] Pazarlama e-postalarında çıkış bağlantısı ve işletme bilgileri var.
- [ ] Dosya yükleme güvenlik kontrolleri tamam.
- [ ] Kritik akışlarda hata ve ağ kesintisi durumları tasarlanmış.

## P1 — Yayından önce tamamlanmalı

- [ ] Site klavye ve ekran okuyucu ile temel olarak kullanılabiliyor.
- [ ] Alt metin, kontrast, odak ve form hata mesajları kontrol edildi.
- [ ] Tüm üçüncü taraf SDK'lar listelendi ve gereksiz olanlar kaldırıldı.
- [ ] Paket ve bağımlılık güvenlik taraması yapıldı.
- [ ] Kullanıcı veri silme ve dışa aktarma süreci çalışıyor.
- [ ] İçerik raporlama, telif bildirimi ve kaldırma akışı tanımlı.
- [ ] Audit log ve hata izleme kişisel veri sızdırmıyor.
- [ ] Mobil, masaüstü ve yavaş ağ testleri yapıldı.

---

# Değişmez kurallar

1. **Çalışıyor olması güvenli olduğu anlamına gelmez.** Her özellik için güvenlik, gizlilik ve erişilebilirlik kontrolü yapılmalı.
2. **Gereksiz veri hiç toplanmamalı.** Sonradan silmekten önce toplamamak tercih edilmeli.
3. **Frontend kontrolleri tek başına güvenlik değildir.** Yetki, doğrulama ve onay kontrolleri backend'de de yapılmalı.
4. **Hassas veriler üçüncü taraflara gönderilmemeli.** Özellikle şifreler, ödeme bilgileri, tokenlar ve tuş vuruşları korunmalı.
5. **Kullanıcıyı şaşırtan ücret veya izin olmamalı.** Fiyat, yenileme, iptal ve veri kullanımı işlemden önce açıkça gösterilmeli.
6. **Kullanıcı hesabı ve verisi üzerinde gerçek kontrol olmalı.** Görme, düzeltme, dışa aktarma ve silme süreçleri sadece sözde kalmamalı.
7. **Erişilebilirlik sonradan eklenecek bir süs değildir.** Her yeni arayüz bileşeni klavye, ekran okuyucu ve mobil kullanım düşünülerek yapılmalı.
8. **Hukuki metinler kopyala-yapıştır placeholder olarak yayınlanmamalı.** Gerçek ürün, şirket ve veri akışına göre hazırlanıp incelenmeli.
9. **Her yeni dış servis yeni bir risk alanıdır.** Kullanılmadan önce amacı, gönderdiği veri ve kapatma yöntemi belirlenmeli.
10. **Kontrol listesinde işaretlenmeyen madde tamamlanmış kabul edilmemeli.**
