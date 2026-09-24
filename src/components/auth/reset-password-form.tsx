"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type AuthFormState } from "@/app/hesabim/actions";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);
  return <form action={action} className="space-y-5"><input type="hidden" name="token" value={token} /><label className="block text-sm font-semibold">Yeni şifre<input name="password" type="password" required autoComplete="new-password" className="mt-2 h-12 w-full border border-black/25 bg-white px-3 outline-none focus:border-ink" /></label><label className="block text-sm font-semibold">Yeni şifre (tekrar)<input name="confirmPassword" type="password" required autoComplete="new-password" className="mt-2 h-12 w-full border border-black/25 bg-white px-3 outline-none focus:border-ink" /></label><p className="text-xs leading-5 text-muted">En az 12 karakter; harf, rakam ve özel karakter kullanın. Yenileme tamamlandığında açık oturumlar kapanır.</p>{state.message ? <p role="status" className={`text-sm font-medium ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p> : null}{state.ok ? <Link href="/hesabim/giris" className="primary-button w-full">Yeni şifreyle giriş yap</Link> : <button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Şifre yenileniyor…" : "Şifreyi yenile"}</button>}</form>;
}
