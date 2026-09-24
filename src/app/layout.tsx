import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store/store-provider";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { AnnouncementRibbon } from "@/components/store/announcement-ribbon";
import { CookieConsent } from "@/components/preferences/cookie-consent";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { copy } from "@/i18n/locale";
import { getLocale } from "@/i18n/server";
import { getActiveTopAnnouncement, getMenu } from "@/modules/content/queries";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://cleristr.com"),
  title: {
    default: "CLERIS",
    template: "%s | CLERIS",
  },
  description: "CLERIS giyim ve aksesuar mağazası.",
  applicationName: "CLERIS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "CLERIS",
    title: "CLERIS",
    description: "CLERIS giyim ve aksesuar mağazası.",
    images: ["/media/brand/cleris-black.webp"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [menu, announcement, locale] = await Promise.all([
    getMenu("header"),
    getActiveTopAnnouncement(),
    getLocale(),
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CLERIS",
    url: "https://cleristr.com",
    logo: "https://cleristr.com/media/brand/cleris-black.webp",
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var p=localStorage.getItem('cleris_theme');var t=p==='light'||p==='dark'?p:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}" }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">İçeriğe geç</a>
        <StoreProvider>
          {announcement ? <AnnouncementRibbon announcement={announcement} /> : null}
          <SiteHeader menu={menu} locale={locale} />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </StoreProvider>
        <CookieConsent copy={copy[locale]} />
        <FeedbackWidget copy={copy[locale]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
