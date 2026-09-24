import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { databaseClient } from "@/db/client";

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("Çok fazla deneme. Lütfen daha sonra tekrar deneyin.");
  }
}

export async function enforceRateLimit(input: {
  action: string;
  key: string;
  limit: number;
  windowSeconds: number;
  blockSeconds?: number;
}) {
  const now = new Date();
  const nowIso = now.toISOString();
  const windowStart = new Date(now.getTime() - input.windowSeconds * 1000).toISOString();
  const keyHash = createHash("sha256").update(`${input.action}:${input.key}`).digest("hex");
  const id = randomUUID();

  await databaseClient.execute({
    sql: `INSERT INTO rate_limits (id, key_hash, action, window_started_at, count, updated_at)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(key_hash, action) DO UPDATE SET
        count = CASE WHEN rate_limits.window_started_at < ? THEN 1 ELSE rate_limits.count + 1 END,
        window_started_at = CASE WHEN rate_limits.window_started_at < ? THEN excluded.window_started_at ELSE rate_limits.window_started_at END,
        blocked_until = CASE WHEN rate_limits.window_started_at < ? THEN NULL ELSE rate_limits.blocked_until END,
        updated_at = excluded.updated_at`,
    args: [id, keyHash, input.action, nowIso, nowIso, windowStart, windowStart, windowStart],
  });

  const result = await databaseClient.execute({
    sql: "SELECT count, blocked_until FROM rate_limits WHERE key_hash = ? AND action = ? LIMIT 1",
    args: [keyHash, input.action],
  });
  const row = result.rows[0];
  const blockedUntil = row?.blocked_until ? new Date(String(row.blocked_until)) : null;

  if (blockedUntil && blockedUntil > now) {
    throw new RateLimitError(Math.max(1, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)));
  }

  if (Number(row?.count ?? 0) > input.limit) {
    const until = new Date(now.getTime() + (input.blockSeconds ?? input.windowSeconds) * 1000);
    await databaseClient.execute({
      sql: "UPDATE rate_limits SET blocked_until = ?, updated_at = ? WHERE key_hash = ? AND action = ?",
      args: [until.toISOString(), nowIso, keyHash, input.action],
    });
    throw new RateLimitError(Math.ceil((until.getTime() - now.getTime()) / 1000));
  }
}
