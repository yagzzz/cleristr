import { NextResponse } from "next/server";
import { createSessionToken } from "@/modules/auth/crypto";
import { createGoogleAuthorizationUrl } from "@/modules/auth/google";

const STATE_COOKIE = "cleris_google_oauth_state";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  if (!clientId || !appUrl) return NextResponse.redirect(new URL("/hesabim/giris?oauth=unavailable", appUrl || request.url));
  const state = createSessionToken();
  const response = NextResponse.redirect(createGoogleAuthorizationUrl({ clientId, redirectUri: `${appUrl}/api/auth/google/callback`, state }));
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
