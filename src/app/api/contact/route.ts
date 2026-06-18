import { NextResponse } from "next/server";
import { getResendClient, FROM_EMAIL } from "@/lib/email/resend";

export async function POST(request: Request) {
  const { subject, message, replyTo } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
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
