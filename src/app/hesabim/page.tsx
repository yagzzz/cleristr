import type { Metadata } from "next";
import Link from "next/link";
import { Heart, LogOut } from "lucide-react";
import { logoutAction } from "./actions";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false, follow: false } };

const accountLinks = [{ href: "/favoriler", label: "Favoriler", description: "Kaydettiğin ürünler", icon: Heart }];

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <section className="site-container grid min-h-[60svh] place-items-center py-12 text-center"><div><p className="eyebrow mb-4">CLERIS HESABI</p><h1 className="text-5xl font-black tracking-tight">Hesabını yönet</h1><p className="mx-auto mt-4 max-w-lg text-muted">Sipariş, favori, adres, iade ve destek işlemleri güvenli hesabında tutulur.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/hesabim/giris" className="primary-button">Giriş yap</Link><Link href="/hesabim/kayit" className="secondary-button">Kayıt ol</Link></div></div></section>;
  }

  return (
    <section className="site-container py-10 sm:py-16">
      <div className="flex flex-col gap-5 border-b border-black/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow mb-4">HESABIN</p><h1 className="text-5xl font-black tracking-tight">Merhaba, {user.firstName || "CLERIS üyesi"}</h1><p className="mt-3 text-sm text-muted">{user.email}</p></div>
        <form action={logoutAction}><button type="submit" className="secondary-button"><LogOut size={17} /> Çıkış yap</button></form>
      </div>
      {!user.emailVerifiedAt ? <div className="mt-6 border border-amber-400 bg-amber-50 p-4 text-sm">E-posta adresin henüz doğrulanmadı. Hesap güvenliği için doğrulama bağlantısını kullan.</div> : null}
      <p className="mt-8 max-w-2xl text-sm leading-6 text-muted">Profil, adres, sipariş ve destek ekranları gerçek operasyon verisi ve yasal metinler tamamlandığında açılır. Yayında olmayan ekranlara yönlendirme yapılmaz.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accountLinks.map(({ href, label, description, icon: Icon }) => <Link key={href} href={href} className="group border border-black/15 bg-white p-6 transition-colors hover:bg-acid"><Icon aria-hidden="true" /><h2 className="mt-8 text-xl font-bold">{label}</h2><p className="mt-2 text-sm text-muted group-hover:text-ink/70">{description}</p></Link>)}
      </div>
    </section>
  );
}
