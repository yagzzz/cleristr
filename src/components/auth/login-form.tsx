"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/app/hesabim/actions";
import { GoogleAuthButton } from "./google-auth-button";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Field label="E-posta" name="email" type="email" autoComplete="email" error={state.errors?.email?.[0]} />
      <Field label="Şifre" name="password" type="password" autoComplete="current-password" error={state.errors?.password?.[0]} />
      <div className="flex justify-end text-sm"><Link href="/hesabim/sifremi-unuttum" className="font-bold underline underline-offset-4">Şifremi unuttum</Link></div>
      {state.message ? <p className="text-sm font-medium text-danger" role="alert">{state.message}</p> : null}
      <button type="submit" className="primary-button w-full" disabled={pending}>{pending ? "Giriş yapılıyor…" : "Giriş yap"}</button>
      <div className="auth-divider"><span>veya</span></div>
      <GoogleAuthButton />
    </form>
  );
}

function Field({ label, name, type, autoComplete, error }: { label: string; name: string; type: string; autoComplete: string; error?: string }) {
  const id = `login-${name}`;
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label><input id={id} name={name} type={type} autoComplete={autoComplete} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="h-12 w-full border border-black/25 bg-white px-3 outline-none focus:border-ink" />{error ? <p id={`${id}-error`} className="mt-1 text-xs text-danger">{error}</p> : null}</div>;
}
