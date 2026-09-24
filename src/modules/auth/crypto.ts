import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function derivePassword(password: string, salt: Buffer, keyLength: number, N: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, { N, r, p, maxmem: 64 * 1024 * 1024 }, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await derivePassword(
    password.normalize("NFKC"),
    salt,
    KEY_LENGTH,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
  );

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encoded: string) {
  try {
    const [algorithm, nText, rText, pText, saltText, hashText] = encoded.split("$");
    if (algorithm !== "scrypt" || !nText || !rText || !pText || !saltText || !hashText) {
      return false;
    }

    const N = Number(nText);
    const r = Number(rText);
    const p = Number(pText);
    if (![N, r, p].every(Number.isSafeInteger) || N < SCRYPT_N || r < 1 || p < 1) {
      return false;
    }

    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    if (salt.length < 16 || expected.length !== KEY_LENGTH) return false;

    const actual = await derivePassword(password.normalize("NFKC"), salt, expected.length, N, r, p);

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
