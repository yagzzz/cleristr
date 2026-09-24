import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { consents, contacts } from "@/db/schema";
import { enforceRateLimit } from "@/modules/auth/rate-limit";
import { parseNewsletterInput } from "@/modules/marketing/newsletter";

export async function POST(request: Request) {
  const destination = new URL("/newsletter/sonuc", request.url);
  try {
    const formData = await request.formData();
    const input = parseNewsletterInput({
      email: String(formData.get("email") || ""),
      consent: String(formData.get("consent") || ""),
      company: String(formData.get("company") || ""),
    });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    await enforceRateLimit({ action: "newsletter", key: `${input.email}:${ip}`, limit: 3, windowSeconds: 3600 });

    const existing = await db.select({ id: contacts.id }).from(contacts).where(eq(contacts.email, input.email)).limit(1);
    const contactId = existing[0]?.id || randomUUID();
    const now = new Date().toISOString();
    await db.batch([
      db
        .insert(contacts)
        .values({ id: contactId, email: input.email, status: "active", createdAt: now, updatedAt: now })
        .onConflictDoUpdate({ target: contacts.email, set: { status: "active", updatedAt: now } }),
      db.insert(consents).values({
        id: randomUUID(),
        contactId,
        purpose: "email_marketing",
        granted: true,
        source: "homepage_newsletter",
        policyVersion: "2026-09",
        grantedAt: now,
        createdAt: now,
      }),
    ]);
    destination.searchParams.set("status", "ok");
  } catch (error) {
    destination.searchParams.set("status", error instanceof Error && error.message === "SPAM" ? "ok" : "error");
  }
  return NextResponse.redirect(destination, 303);
}
