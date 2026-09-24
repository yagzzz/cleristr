import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { createSessionToken, hashSessionToken } from "./crypto";
import { can, type Permission, type UserRole } from "./permissions";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "cleris_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string, metadata?: { ipHash?: string; userAgent?: string }) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
    lastSeenAt: now.toISOString(),
    ipHash: metadata?.ipHash,
    userAgent: metadata?.userAgent?.slice(0, 500),
    createdAt: now.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      sessionId: sessions.id,
      sessionExpiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, new Date().toISOString()),
        eq(users.status, "active"),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user.role as UserRole, permission)) throw new Error("FORBIDDEN");
  return user;
}
