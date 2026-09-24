import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { accountTokens, users } from "@/db/schema";
import { hashSessionToken } from "@/modules/auth/crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const destination = new URL("/hesabim/giris", request.url);
  if (!token) {
    destination.searchParams.set("verified", "invalid");
    return NextResponse.redirect(destination);
  }

  const rows = await db
    .select({ id: accountTokens.id, userId: accountTokens.userId })
    .from(accountTokens)
    .where(
      and(
        eq(accountTokens.type, "email_verification"),
        eq(accountTokens.tokenHash, hashSessionToken(token)),
        isNull(accountTokens.consumedAt),
        gt(accountTokens.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  const record = rows[0];
  if (!record) {
    destination.searchParams.set("verified", "invalid");
    return NextResponse.redirect(destination);
  }

  const now = new Date().toISOString();
  await db.batch([
    db.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId)),
    db.update(accountTokens).set({ consumedAt: now }).where(eq(accountTokens.id, record.id)),
  ]);
  destination.searchParams.set("verified", "1");
  return NextResponse.redirect(destination);
}
