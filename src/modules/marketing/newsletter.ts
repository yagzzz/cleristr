import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
  consent: z.literal("on"),
  company: z.string().max(0),
});

export function parseNewsletterInput(input: { email: string; consent: string; company: string }) {
  if (input.company) throw new Error("SPAM");
  const parsed = newsletterSchema.parse(input);
  return { email: parsed.email, consent: true as const };
}
