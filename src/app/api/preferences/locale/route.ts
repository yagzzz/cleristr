import { NextResponse } from "next/server";
import { normalizeLocale } from "@/i18n/locale";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = normalizeLocale(body?.locale);
  const response = NextResponse.json({ locale }, { headers: { "cache-control": "no-store" } });
  response.cookies.set("cleris_locale", locale, { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
