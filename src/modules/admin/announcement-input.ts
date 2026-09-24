import { z } from "zod";

const safeHref = z.string().trim().max(400).refine((value) => !value || value.startsWith("/") || /^https:\/\/[a-zA-Z0-9.-]+(?:\/|$)/.test(value), "Bağlantı yalnızca güvenli dahili yol veya https URL olabilir.");

const schema = z.object({
  message: z.string().trim().min(2, "Duyuru metni gerekli.").max(240),
  href: safeHref,
  dismissible: z.string().optional(),
  isActive: z.string().optional(),
});

export function parseAnnouncementInput(input: unknown) {
  const parsed = schema.parse(input);
  return { message: parsed.message, href: parsed.href || null, dismissible: parsed.dismissible === "on", isActive: parsed.isActive === "on" };
}
