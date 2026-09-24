import "server-only";
import { cookies } from "next/headers";
import { normalizeLocale } from "./locale";

export async function getLocale() {
  return normalizeLocale((await cookies()).get("cleris_locale")?.value);
}
