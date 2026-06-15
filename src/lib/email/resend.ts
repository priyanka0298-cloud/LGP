import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY_MISSING");
    client = new Resend(key);
  }
  return client;
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Lazy Girl Planner <hello@lazy-girl-planner.com>";
