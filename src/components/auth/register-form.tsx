"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/app/hesabim/actions";
import { GoogleAuthButton } from "./google-auth-button";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad" name="firstName" autoComplete="given-name" error={state.errors?.firstName?.[0]} />
        <Field label="Soyad" name="lastName" autoComplete="family-name" error={state.errors?.lastName?.[0]} />
      </div>
      <Field label="E-posta" name="email" type="email" autoComplete="email" error={state.errors?.email?.[0]} />
      <Field label="Şifre" name="password" type="password" autoComplete="new-password" error={state.errors?.password?.[0]} />
      <p className="text-xs leading-5 text-muted">En az 12 karakter; harf, rakam ve özel karakter kullanın.</p>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terms" required className="mt-1" /><span>Kullanım koşullarını ve gizlilik politikasını okudum. Yayına alınmadan önce güncel metinler burada yayınlanır.</span></label>
      {state.errors?.terms?.[0] ? <p className="text-xs text-danger">{state.errors.terms[0]}</p> : null}
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="marketing" className="mt-1" /><span>CLERIS kampanya ve yeni ürün e-postalarını almak istiyorum. Bu izin zorunlu değildir ve geri çekilebilir.</span></label>
      {state.message ? <p className={`text-sm font-medium ${state.ok ? "text-success" : "text-danger"}`} role="status">{state.message}</p> : null}
      <button type="submit" className="primary-button w-full" disabled={pending}>{pending ? "Hesap oluşturuluyor…" : "Hesap oluştur"}</button>
      <div className="auth-divider"><span>veya</span></div>
      <GoogleAuthButton />
    </form>
  );
}

function Field({ label, name, type = "text", autoComplete, error }: { label: string; name: string; type?: string; autoComplete: string; error?: string }) {
  const id = `register-${name}`;
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label><input id={id} name={name} type={type} autoComplete={autoComplete} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="h-12 w-full border border-black/25 bg-white px-3 outline-none focus:border-ink" />{error ? <p id={`${id}-error`} className="mt-1 text-xs text-danger">{error}</p> : null}</div>;
}
