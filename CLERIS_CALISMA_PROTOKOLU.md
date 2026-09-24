# Cléris çalışma protokolü

Bu dosya, proje boyunca uygulanacak geliştirme, test, güvenlik ve performans akışını tanımlar. Ana site kodlanmaya başlamadan önce oluşturulmuştur; gerçek sayfalar ve işlevler kullanıcı gereksinimleri geldikten sonra belirlenecektir.

## Proje sınırları

- PHP kullanılmayacak.
- Üçüncü taraf referans sitelere aktif güvenlik testi, exploit, brute-force veya saldırı yapılmayacak.
- Referans siteler yalnızca tasarım, etkileşim ve ürün sunumu açısından incelenecek.
- Güvenlik testleri yalnızca Cléris projesine ve yetkili local/dev/staging ortamlarına uygulanacak.
- Gereksiz backend, framework, paket ve JavaScript eklenmeyecek.
- Site içeriği, sayfaları ve ana işlevleri kullanıcı gereksinimleri netleşmeden uygulanmayacak.

## Ana referanslar

- `vibecoded_app_videolari_analiz.md`: Gizlilik, güvenlik, erişilebilirlik, veri kullanımı, ödeme, e-posta, telif ve yayın öncesi kontrol listesi.
- `CLERIS_TASARIM_REFERANSLARI.md`: Referans sitelerden çıkarılan tasarım ve motion ilkeleri.
- Bu dosya: Proje çalışma, test ve güvenlik süreci.

Yeni bir özellik geliştirilmeden önce bu dosyalar okunmalı. Özellik tamamlandığında ilgili checklist maddeleri güncellenmeli veya özelliğin neden kapsam dışı kaldığı yazılmalı.

---

# Geliştirme akışı

Her önemli özellik için sıra değişmemeli:

1. Gereksinimi netleştir.
2. Mevcut proje dosyalarını ve ilgili referans maddelerini incele.
3. En küçük uygun mimariyi ve teknoloji kullanımını seç.
4. Özelliği geliştir.
5. Gerçek local/dev ortamında çalıştır.
6. Fonksiyonel test yap.
7. Responsive ve erişilebilirlik kontrolü yap.
8. Console, runtime ve network hatalarını kontrol et.
9. Performans kontrolü yap.
10. Güvenlik kontrolü yap.
11. Bulunan sorunları düzelt.
12. Aynı testleri tekrar çalıştır.
13. Değişiklikleri ve kalan işleri kaydet.

Sadece bir ekranın açılması veya bir butonun çalışması tamamlanmış kabul edilmez.

---

# Aşamalar

## Aşama 0 — Gereksinim ve kapsam

- [ ] Kullanıcı akışları yazıldı.
- [ ] Sayfalar ve rotalar listelendi.
- [ ] Her sayfanın amacı belirlendi.
- [ ] Kullanıcı rolleri ve yetkileri belirlendi.
- [ ] Form, ödeme, hesap, dosya yükleme veya harici servis ihtiyacı belirlendi.
- [ ] Toplanacak veriler ve saklama ihtiyaçları belirlendi.
- [ ] Yayın ortamı ve domain/deployment yaklaşımı belirlendi.
- [ ] P0/P1/P2 kapsamı ayrıldı.

## Aşama 1 — Kod tabanı ve mimari

- [ ] Proje klasörü ve mevcut asset'ler incelendi.
- [ ] Kullanılan veya seçilecek teknoloji gereksinime göre gerekçelendirildi.
- [ ] PHP dışı, kolay hostlanabilir ve mümkün olduğunca statik-first yaklaşım değerlendirildi.
- [ ] Backend yalnızca gerçekten gereken işlevler için planlandı.
- [ ] API, form, auth, ödeme ve dosya yükleme sınırları belirlendi.
- [ ] Public ve private veriler ayrıldı.
- [ ] Üçüncü taraf bağımlılıkların amacı yazıldı.
- [ ] Gizli bilgiler için güvenli yapılandırma yöntemi belirlendi.

## Aşama 2 — Tasarım sistemi

- [ ] Renk token'ları belirlendi.
- [ ] Typography ve spacing ölçeği belirlendi.
- [ ] Container, grid ve breakpoint kuralları belirlendi.
- [ ] Button, input, card, modal, navigation ve feedback bileşenleri tanımlandı.
- [ ] Hover, focus, active, disabled, loading, success ve error durumları tasarlandı.
- [ ] Motion süreleri ve easing kuralları belirlendi.
- [ ] `prefers-reduced-motion` davranışı belirlendi.
- [ ] Tasarım referansları birebir kopyalanmadan tek bir Cléris dili altında birleştirildi.

## Aşama 3 — Uygulama

- [ ] Semantic HTML kullanıldı.
- [ ] Bileşenler tek sorumlulukla ve tekrar kullanılabilir yazıldı.
- [ ] Veri, görsel ve içerik ile layout ayrıldı.
- [ ] Gereksiz client-side JavaScript eklenmedi.
- [ ] Görseller uygun boyut, format ve kaliteyle sunuldu.
- [ ] Hero görseli ile below-the-fold görsellerin loading öncelikleri ayrıldı.
- [ ] Harici font ve script kullanımı en aza indirildi.
- [ ] Tüm kullanıcı girdileri backend'de doğrulandı.
- [ ] Loading, empty, error ve success durumları eklendi.

## Aşama 4 — Fonksiyonel test

- [ ] Tüm rotalar açılıyor.
- [ ] Header, menü, footer ve dahili linkler çalışıyor.
- [ ] Formlar doğru veriyle çalışıyor.
- [ ] Boş ve hatalı form gönderimleri doğru uyarı veriyor.
- [ ] Geri dönme, yenileme ve doğrudan URL açma senaryoları çalışıyor.
- [ ] Yetkisiz erişim engelleniyor.
- [ ] Aynı işlem iki kez gönderildiğinde veri bozulmuyor.
- [ ] Ağ kesintisi ve server error durumları kontrol edildi.
- [ ] 404 ve bilinmeyen rota davranışı belirlendi.
- [ ] Console ve runtime hatası yok.

## Aşama 5 — Responsive ve accessibility

- [ ] Küçük mobil ekran test edildi.
- [ ] Büyük mobil/tablet test edildi.
- [ ] Masaüstü ve geniş ekran test edildi.
- [ ] Yatay taşma yok.
- [ ] Klavye ile tüm ana akış tamamlanabiliyor.
- [ ] Focus görünür ve sırası mantıklı.
- [ ] Form label ve hata mesajları erişilebilir.
- [ ] Modal açıldığında focus ve scroll yönetiliyor.
- [ ] Görseller anlamlı alt metin taşıyor.
- [ ] Kontrast kontrol edildi.
- [ ] Reduced motion tercihi uygulanıyor.
- [ ] Ekran okuyucu ile kritik akış kontrol edildi.

## Aşama 6 — Performans ve SEO

- [ ] Production build alındı.
- [ ] JavaScript bundle gereksiz kodlardan arındırıldı.
- [ ] Görseller optimize edildi.
- [ ] Büyük görseller lazy-load edildi; ilk ekrandaki gerekli görseller önceliklendirildi.
- [ ] Fontlar sınırlı ağırlıkla ve uygun formatta yükleniyor.
- [ ] Layout shift azaltıldı.
- [ ] Animasyonlarda mümkün olduğunca `transform` ve `opacity` kullanıldı.
- [ ] Scroll ve resize listener'ları sınırlı ve temizlenebilir durumda.
- [ ] Lighthouse mobil ve desktop testleri yapıldı.
- [ ] Network waterfall incelendi.
- [ ] Title, description, canonical, heading hiyerarşisi ve sitemap/robots ihtiyacı kontrol edildi.
- [ ] Sosyal paylaşım metadata ihtiyacı kontrol edildi.

## Aşama 7 — Güvenlik

- [ ] `vibecoded_app_videolari_analiz.md` içindeki P0 maddeleri kontrol edildi.
- [ ] Secret, token ve credential araması yapıldı.
- [ ] Dependency güvenlik taraması yapıldı.
- [ ] Input validation ve output encoding kontrol edildi.
- [ ] Auth/session/access-control kontrol edildi.
- [ ] CORS, CSP, HTTPS ve güvenlik header'ları kontrol edildi.
- [ ] Dosya yükleme varsa tür, boyut, içerik ve depolama kontrol edildi.
- [ ] Loglarda hassas veri bulunmadığı doğrulandı.
- [ ] Strix ile uygun kapsamda local/dev/staging güvenlik testi yapıldı.
- [ ] Strix bulguları PoC ile doğrulandı.
- [ ] Düzeltme yapıldıktan sonra aynı PoC veya Strix taraması tekrarlandı.

## Aşama 8 — Yayın öncesi

- [ ] P0 bulgusu kalmadı.
- [ ] P1 bulguları tamamlandı veya açıkça kabul edildi.
- [ ] Production build tekrar alındı.
- [ ] Son responsive smoke test yapıldı.
- [ ] Son console/network kontrolü yapıldı.
- [ ] Son Lighthouse/PageSpeed ölçümü alındı.
- [ ] Link ve route taraması yapıldı.
- [ ] Privacy, terms, refund, cookie ve iletişim sayfaları gerçek bilgilerle kontrol edildi.
- [ ] Deployment ve rollback yöntemi hazır.
- [ ] Yayın sonrası izleme ve hata bildirim yöntemi hazır.

---

# Strix güvenlik çalışma planı

Strix yalnızca Cléris'e ait veya açıkça yetkilendirilmiş hedeflerde kullanılacak. Üçüncü taraf referans siteler Strix hedefi olmayacak.

## Strix skill seçimi

- Kod deposu veya çalışma ağacı: `find-security-vulnerabilities-in-code`
- Tüm ürün için risk haritası: `application-security-testing`
- Local/dev/staging web uygulaması: `web-app-penetration-testing`
- REST/GraphQL/gRPC API: `api-security-testing`
- OWASP kapsam raporu: `owasp-top-10-testing`
- Bulgu sonrası düzeltme ve yeniden doğrulama: `fix-security-vulnerabilities-with-strix`
- Pull request/CI kapısı: `ci-security-scanning-with-strix`

## Strix çalıştırma kuralları

1. Önce hedefin Cléris'e ait olduğu ve test izni olduğu doğrulanır.
2. Production yerine staging veya local ortam tercih edilir.
3. Ödeme, toplu e-posta ve geri döndürülemez yönetici işlemleri kapsam dışı bırakılır; açıkça test planına alınmadıkça çalıştırılmaz.
4. Mümkünse hem kaynak kod hem çalışan uygulama birlikte test edilir.
5. Kimlik doğrulama sorunları için farklı yetkilerde test hesapları gerekir; hesap/token tahmin edilmez.
6. Headless çalışmalarda `-n` ve belirli `--max-budget` kullanılır.
7. Local CLI için Docker, Strix kurulumu ve kullanıcı tarafından sağlanan LLM anahtarı gerekir.
8. Kaynak kodu managed cloud'a göndermeden önce hangi dosyaların gönderileceği dry-run manifest ile incelenir.
9. `run.json` içindeki durum ve bütçe kontrol edilmeden `0` çıkışı temiz sonuç olarak yorumlanmaz.
10. Bulgu raporlanmadan önce PoC tekrar kontrol edilir.
11. Düzeltme, tek payload'u engellemek yerine kök nedeni kapatır.
12. Düzeltme sonrası aynı hedefte yeniden tarama ve mümkünse manuel PoC tekrarı yapılır.

## Beklenen güvenlik çıktıları

- Executive rapor.
- Her doğrulanmış bulgu için PoC.
- Etkilenen dosya, endpoint veya akış.
- Kök neden.
- Düzeltme.
- Yeniden test sonucu.
- Test edilmeyen kapsam ve sınırlamalar.

Bir Strix taramasının bulgu vermemesi tüm sistemin güvenli olduğunu kanıtlamaz. Kapsam, süre, bütçe, yetkiler ve test edilen ortam her raporda yazılmalıdır.

---

# Özellik bitirme kuralı

Bir özellik ancak şu altı koşul birlikte sağlandığında tamamlanmış sayılır:

1. Kullanıcı akışı çalışıyor.
2. Hata ve edge-case durumları ele alınıyor.
3. Responsive ve accessibility kontrol edildi.
4. Production build ve performans kontrol edildi.
5. Güvenlik kontrol edildi.
6. İlgili referans doküman ve test kaydı güncellendi.
