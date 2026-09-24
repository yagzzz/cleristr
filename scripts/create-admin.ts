import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, databaseClient } from "../src/db/client";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/modules/auth/crypto";

const [emailArg, passwordArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const password = passwordArg;

if (!email || !email.includes("@") || !password || password.length < 12) {
  console.error("Usage: npm run admin:create -- owner@example.com 'at-least-12-characters'");
  process.exitCode = 1;
} else {
  const now = new Date().toISOString();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const passwordHash = await hashPassword(password);

  if (existing[0]) {
    await db
      .update(users)
      .set({ passwordHash, role: "owner", status: "active", emailVerifiedAt: now, updatedAt: now })
      .where(eq(users.id, existing[0].id));
  } else {
    await db.insert(users).values({
      id: randomUUID(),
      email,
      passwordHash,
      role: "owner",
      status: "active",
      emailVerifiedAt: now,
      marketingEmailOptIn: false,
      marketingSmsOptIn: false,
      totpEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`Owner account ready: ${email}`);
}

databaseClient.close();
