"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type AuthFormState } from "@/app/hesabim/actions";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);
  return <form action={action} className="space-y-5"><label className="block text-sm font-semibold">E-posta<input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full border border-black/25 bg-white px-3 outline-none focus:border-ink" /></label><p className="text-xs leading-5 text-muted">Hesap güvenliği için, kayıtlı olsun olmasın aynı bilgilendirme mesajı gösterilir.</p>{state.message ? <p role="status" className={`text-sm font-medium ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p> : null}<button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Bağlantı hazırlanıyor…" : "Şifre yenileme bağlantısı gönder"}</button><Link href="/hesabim/giris" className="block text-center text-sm font-bold underline underline-offset-4">Girişe dön</Link></form>;
}
