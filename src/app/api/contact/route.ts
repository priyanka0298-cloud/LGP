import { NextResponse } from "next/server";
import { getResendClient, FROM_EMAIL } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.replace(/[\r\n]+/g, " ").trim().slice(0, 150) : "";
  const replyToRaw = typeof body.replyTo === "string" ? body.replyTo.trim() : "";
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyToRaw) && replyToRaw.length <= 254 ? replyToRaw : "";

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long (5,000 characters max)" }, { status: 400 });
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: "hello@softlivi.com",
      replyTo: replyTo || undefined,
      subject: subject || "Message from Softlivi contact form",
      text: `${replyTo ? `From: ${replyTo}\n\n` : ""}${message}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
