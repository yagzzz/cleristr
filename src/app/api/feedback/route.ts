import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { feedback } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";
import { enforceRateLimit, RateLimitError } from "@/modules/auth/rate-limit";
import { parseFeedbackInput } from "@/modules/feedback/input";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    await enforceRateLimit({ action: "feedback", key: ip, limit: 5, windowSeconds: 3600, blockSeconds: 3600 });
    const input = parseFeedbackInput(await request.json());
    const user = await getCurrentUser();
    const now = new Date().toISOString();
    await db.insert(feedback).values({ id: randomUUID(), userId: user?.id, type: input.type, message: input.message, pageUrl: input.pageUrl, status: "new", createdAt: now, updatedAt: now });
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof RateLimitError ? 429 : 400;
    return NextResponse.json({ ok: false, message: status === 429 ? "Çok fazla geri bildirim gönderildi. Lütfen daha sonra tekrar deneyin." : "Geri bildirim kaydedilemedi." }, { status, headers: { "cache-control": "no-store" } });
  }
}
