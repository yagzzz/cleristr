import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { oauthAccounts, users } from "@/db/schema";
import { createSessionToken, hashPassword } from "@/modules/auth/crypto";
import { createSession } from "@/modules/auth/session";

const STATE_COOKIE = "cleris_google_oauth_state";

type GoogleProfile = { sub?: string; email?: string; email_verified?: boolean; given_name?: string; family_name?: string };

function fail(origin: string, reason: string) {
  const response = NextResponse.redirect(new URL(`/hesabim/giris?oauth=${reason}`, origin));
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;
  const origin = appUrl || new URL(request.url).origin;
  if (!code || !state || !expectedState || state !== expectedState || !clientId || !clientSecret || !appUrl) return fail(origin, "failed");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${appUrl}/api/auth/google/callback`, grant_type: "authorization_code" }), signal: AbortSignal.timeout(15_000), cache: "no-store" });
    if (!tokenResponse.ok) return fail(origin, "failed");
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) return fail(origin, "failed");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15_000), cache: "no-store" });
    const profile = await profileResponse.json() as GoogleProfile;
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) return fail(origin, "failed");

    const now = new Date().toISOString();
    const existingAccount = await db.select().from(oauthAccounts).where(and(eq(oauthAccounts.provider, "google"), eq(oauthAccounts.providerAccountId, profile.sub))).limit(1);
    let userId = existingAccount[0]?.userId;
    if (!userId) {
      const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, profile.email.toLowerCase())).limit(1);
      userId = existingUser[0]?.id || randomUUID();
      await db.transaction(async (tx) => {
        if (!existingUser[0]) await tx.insert(users).values({ id: userId!, email: profile.email!.toLowerCase(), passwordHash: await hashPassword(createSessionToken()), firstName: profile.given_name?.slice(0, 60), lastName: profile.family_name?.slice(0, 60), role: "customer", status: "active", emailVerifiedAt: now, marketingEmailOptIn: false, marketingSmsOptIn: false, totpEnabled: false, createdAt: now, updatedAt: now });
        await tx.insert(oauthAccounts).values({ id: randomUUID(), userId: userId!, provider: "google", providerAccountId: profile.sub!, email: profile.email!.toLowerCase(), createdAt: now, updatedAt: now }).onConflictDoNothing();
      });
    }
    await createSession(userId, { userAgent: request.headers.get("user-agent") || undefined });
    const response = NextResponse.redirect(new URL("/hesabim", origin));
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch { return fail(origin, "failed"); }
}
