import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { enforceRateLimit, RateLimitError } from "@/modules/auth/rate-limit";
import { executeCheckout } from "@/modules/checkout/service";

export const runtime = "nodejs";

function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 64_000) {
    return NextResponse.json({ message: "İstek çok büyük." }, { status: 413 });
  }
  const ip = requestIp(request);
  try {
    await enforceRateLimit({ action: "checkout", key: ip, limit: 5, windowSeconds: 900, blockSeconds: 900 });
    const payload = await request.json();
    const user = await getCurrentUser();
    const result = await executeCheckout(payload, { userId: user?.id, userIp: ip });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ message: "Çok fazla deneme yapıldı. Lütfen daha sonra yeniden deneyin." }, { status: 429 });
    }
    return NextResponse.json(
      { message: "Ödeme şu anda başlatılamadı. Sepeti kontrol edip yeniden deneyin." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
}
