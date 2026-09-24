import { describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from "./crypto";

describe("password hashing", () => {
  it("verifies the original password and rejects a different password", async () => {
    const encoded = await hashPassword("Güçlü-Şifre-2026!");

    expect(encoded.startsWith("scrypt$")).toBe(true);
    await expect(verifyPassword("Güçlü-Şifre-2026!", encoded)).resolves.toBe(true);
    await expect(verifyPassword("yanlış", encoded)).resolves.toBe(false);
  });

  it("rejects malformed stored password hashes", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("creates an opaque token and stores only a deterministic hash", () => {
    const token = createSessionToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(hashSessionToken(token)).toHaveLength(64);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toContain(token);
  });
});
