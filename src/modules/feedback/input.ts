import { z } from "zod";

const schema = z.object({
  type: z.enum(["suggestion", "bug", "complaint", "general"]),
  message: z.string().trim().min(8, "Geri bildirim en az 8 karakter olmalı.").max(2000),
  pageUrl: z.string().trim().regex(/^\/[a-zA-Z0-9_\-/?.=&]*$/, "Sayfa adresi geçersiz.").max(500).optional(),
  company: z.string().max(100),
});

export function parseFeedbackInput(input: unknown) {
  const parsed = schema.parse(input);
  if (parsed.company) throw new Error("SPAM");
  return { type: parsed.type, message: parsed.message, pageUrl: parsed.pageUrl || undefined };
}
