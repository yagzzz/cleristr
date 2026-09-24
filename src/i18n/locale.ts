export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "tr";
}

export const copy = {
  tr: {
    search: "Ara", account: "Hesabım", wishlist: "Favoriler", cart: "Sepet", shop: "Mağaza", signIn: "Giriş yap", signUp: "Kayıt ol", theme: "Tema", language: "Dil", themeLight: "Açık", themeDark: "Koyu", themeSystem: "Sistem", cookieTitle: "Çerez tercihlerin", cookieBody: "Gerekli tercihleri kullanıyoruz. Ölçüm ve pazarlama çerezleri yalnızca onayınla etkinleşir.", acceptAll: "Tümünü kabul et", rejectOptional: "Sadece gerekli", manage: "Ayarlar", savePreferences: "Tercihleri kaydet", cookieEssential: "Gerekli", cookieEssentialDescription: "Oturum, sepet ve tercihleri saklar.", cookieAnalytics: "Ölçüm", cookieAnalyticsDescription: "Site deneyimini anlamamıza yardımcı olur.", cookieMarketing: "Pazarlama", cookieMarketingDescription: "İzinli kampanya ölçümü için kullanılır.", feedback: "Geri bildirim", feedbackTitle: "Bu sayfa nasıl?", feedbackIdea: "Fikir", feedbackIssue: "Sorun", feedbackNote: "Kısa not", feedbackPlaceholder: "Ne iyi çalıştı, ne geliştirelim?", feedbackSuccess: "Teşekkürler, geri bildirimin kaydedildi.", feedbackFailure: "Geri bildirim kaydedilemedi.", feedbackSending: "Gönderiliyor", send: "Gönder", close: "Kapat",
  },
  en: {
    search: "Search", account: "Account", wishlist: "Wishlist", cart: "Cart", shop: "Shop", signIn: "Sign in", signUp: "Create account", theme: "Theme", language: "Language", themeLight: "Light", themeDark: "Dark", themeSystem: "System", cookieTitle: "Your cookie choices", cookieBody: "We use essential preferences. Analytics and marketing cookies are enabled only with your consent.", acceptAll: "Accept all", rejectOptional: "Essential only", manage: "Settings", savePreferences: "Save choices", cookieEssential: "Essential", cookieEssentialDescription: "Keeps your session, cart, and preferences.", cookieAnalytics: "Analytics", cookieAnalyticsDescription: "Helps us understand how the store is used.", cookieMarketing: "Marketing", cookieMarketingDescription: "Used for consented campaign measurement.", feedback: "Feedback", feedbackTitle: "How is this page?", feedbackIdea: "Idea", feedbackIssue: "Issue", feedbackNote: "Short note", feedbackPlaceholder: "What worked well? What should we improve?", feedbackSuccess: "Thanks, your feedback has been saved.", feedbackFailure: "Your feedback could not be saved.", feedbackSending: "Sending", send: "Send", close: "Close",
  },
} as const;

export type InterfaceCopy = (typeof copy)[Locale];

export const homeCopy = {
  tr: {
    heroNote: "Gerçek ürün görseli, ürün videosu ve yönetilebilir varyasyon altyapısı ile ilk CLERIS parçası.",
    inspect: "Ürünü incele", scroll: "Aşağı kaydır · ürün notları", productIntro: "İlk parça. Temel değil, başlangıç.", allProducts: "Tüm ürünler", notesTitle: "Tek parçanın etrafında tasarlandı.", notesText: "Bento alanı yalnızca katalogdaki gerçek ürün, ürün medyası ve yayın durumundan beslenir.", openProduct: "Ürünü aç", motionTitle: "Form, detay ve hareket üç ayrı kartta.", discoverCards: "Kartları keşfet", releaseOpen: "Satış açık", releasePending: "Hazırlık", newsletterTitle: "Yeni drop geldiğinde haberin olsun.", newsletterButton: "Katıl", newsletterConsent: "Kampanya ve yeni ürün e-postalarını almak istiyorum. İznimi istediğim zaman geri çekebilirim.",
  },
  en: {
    heroNote: "The first CLERIS piece with real product media, product video, and a manageable variant foundation.",
    inspect: "Explore product", scroll: "Scroll · product notes", productIntro: "First piece. Not a basic, a beginning.", allProducts: "All products", notesTitle: "Built around one piece.", notesText: "This bento area uses only real catalog product, media, and publishing data.", openProduct: "Open product", motionTitle: "Form, detail, and motion in three cards.", discoverCards: "Explore cards", releaseOpen: "On sale", releasePending: "Preparing", newsletterTitle: "Know when the next drop arrives.", newsletterButton: "Join", newsletterConsent: "I want to receive campaign and new product emails. I can withdraw consent at any time.",
  },
} as const;
