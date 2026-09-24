# Marketing automation: özgün uygulama kararı

## Notifuse incelemesinin sonucu

Notifuse yalnızca **ürün fikri ve davranış modeli** için araştırıldı. CLERIS içine Notifuse kodu, bileşeni, e-posta şablonu, marka varlığı, tasarım dili veya kopyalanmış workflow tanımı alınmayacaktır.

Güncel Notifuse ana lisansı (v40+), Business Source License 1.1'dir; ayrıca bazı production özellikleri lisans anahtarı gerektirir. `web_analytics_sdk/` ayrı olarak AGPL-3.0-or-later altındadır. Bu nedenle CLERIS tarafında doğrudan kopyalama, türetilmiş kod veya bağımlılık kullanımı seçilmemiştir.

Kaynaklar:

- https://github.com/Notifuse/notifuse
- https://raw.githubusercontent.com/notifuse/notifuse/main/LICENSE

## Kavramsal olarak alınacak ilkeler

1. Otomasyon, bir **tetikleyiciyle** başlar ve kullanıcı/kişi bazında ayrı çalışma durumu taşır.
2. Her akış taslak, canlı veya duraklatılmış olabilir. Taslak üzerinde düzenleme, çalışan akışı değiştirmez.
3. Bir akış adımı şu genel sınıflardan biri olur: tetikleyici, koşul, gecikme, eylem, dallanma veya çıkış.
4. Eylemler database outbox/job kaydına yazılır; e-posta/SMS/webhook göndermek HTTP isteği içinde yapılmaz.
5. Her adımın sonucu kaydedilir: bekliyor, çalışıyor, tamamlandı, atlandı veya hata verdi.
6. Gönderimden önce açık rıza, unsubscribe tercihi, sıklık limiti ve suppression kontrolü zorunludur.
7. Sağlayıcılar (e-posta, SMS, webhook) küçük adapter'lar arkasında değiştirilebilir tutulur.
8. Segmentler, müşteri verisi ve izinli etkinlik kayıtlarına göre sunucuda hesaplanır; tarayıcıdan güvenilmez hedef listesi alınmaz.

## CLERIS'in özgün ilk sürümü

İlk sürümde sadece bu node türleri uygulanacaktır:

- **Trigger:** newsletter üyeliği, ürün görüntüleme, sepete ekleme, checkout başlatma, ödeme başarısız/başarılı, sipariş teslim edildi.
- **Delay:** belirli dakika/saat/gün bekleme.
- **Condition:** izin durumu, segment üyeliği, sipariş/sepette ürün varlığı, kupon kullanımı.
- **Action:** e-posta, SMS (sağlayıcı ayarı yapıldığında), site popup hedefi, kupon atama, etiket ekleme/çıkarma, webhook.
- **Exit:** akışı güvenli biçimde bitirme.

A/B test, çoklu dil, görsel e-posta tasarımcısı ve karmaşık izin setleri ancak gerçek kullanım gereksinimi ortaya çıktığında eklenir. Bunlar ihtiyaç oluşmadan kodlanmayacaktır.

## Güvenlik ve operasyon kuralları

- Sadece marketing izni olan kişilere ticari ileti gönderilir.
- Transactional sipariş bildirimleri, marketing akışından ayrı şablon ve kayıtla yürür.
- Webhook URL'leri SSRF önleme politikasıyla doğrulanır; yerel/ağ içi adreslere istek yapılmaz.
- İşler idempotency anahtarı taşır; tekrar deneme aynı bildirimi iki kez göndermemelidir.
- Sağlayıcı cevabı, gönderim ve hata metadatası audit/event kayıtlarında tutulur; gizli anahtarlar tutulmaz.
- UI akış editörü ileride `@xyflow/react` ile yazılabilir; yalnızca CLERIS'in kendi node şeması ve kendi arayüzü kullanılacaktır.

## Uygulama sırası

1. Event/outbox/job ve consent/frequency-cap çekirdeği.
2. E-posta adapter'i ve unsubscribe tercihi.
3. Segment filtreleri ve temel kampanya kaydı.
4. API ile yaratılan basit akışlar.
5. Ancak bu akışlar gerçek kullanımda doğrulandıktan sonra görsel canvas editörü.
