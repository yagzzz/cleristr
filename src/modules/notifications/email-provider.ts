import "server-only";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(message: EmailMessage) {
  const provider = process.env.EMAIL_PROVIDER || "console";
  if (provider === "console") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Production email provider is not configured");
    }
    console.info("[CLERIS email:console]", { to: message.to, subject: message.subject, text: message.text });
    return { provider: "console", id: `console-${Date.now()}` };
  }
  throw new Error(`Unsupported email provider: ${provider}`);
}
