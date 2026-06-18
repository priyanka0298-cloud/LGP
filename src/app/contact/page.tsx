"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Bug, Shield, Inbox, Clock, Send, Loader2 } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SUBJECT_OPTIONS = [
  { value: "Question about Softlivi", label: "General question", icon: Mail },
  { value: "Feature Request", label: "Feature request", icon: MessageCircle },
  { value: "Bug Report", label: "Report a bug", icon: Bug },
  { value: "Privacy Request", label: "Privacy request", icon: Shield },
  { value: "Other", label: "Something else", icon: Inbox },
];

export default function ContactPage() {
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].value);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, replyTo }),
      });
      if (res.ok) {
        setSent(true);
        setMessage("");
        setReplyTo("");
      } else {
        const { error } = await res.json();
        toast.error(error ?? "Something went wrong. Try again?");
      }
    } catch {
      toast.error("Something went wrong. Try again?");
    }
    setSending(false);
  }

  if (sent) {
    return (
      <>
        <LandingNav />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-5xl mb-4">🌸</p>
          <h1 className="font-display text-3xl font-bold mb-3">Message sent!</h1>
          <p className="text-muted-foreground mb-8">
            We reply within 1–2 business days. We&apos;ll get back to you at {replyTo || "the address you provided"}.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
            <Button variant="gradient" asChild><Link href="/">Back to home</Link></Button>
          </div>
        </main>
        <LandingFooter />
      </>
    );
  }

  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-display text-4xl font-bold mb-2">Contact us</h1>
        <p className="text-muted-foreground mb-10">
          We&apos;d love to hear from you. Fill in the form below and we&apos;ll get back to you within 1–2 business days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic picker */}
          <div>
            <p className="text-sm font-medium mb-3">What&apos;s this about?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUBJECT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = subject === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSubject(opt.value)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border/50 bg-card hover:border-primary/20 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${selected ? "text-primary" : ""}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reply-to email */}
          <div>
            <label htmlFor="replyTo" className="text-sm font-medium block mb-1.5">
              Your email <span className="text-muted-foreground font-normal">(so we can reply)</span>
            </label>
            <input
              id="replyTo"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border/50 bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="text-sm font-medium block mb-1.5">
              Message <span className="text-rose-500">*</span>
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                subject === "Bug Report"
                  ? "What were you doing? What happened? What did you expect? (details help us fix it faster)"
                  : "Tell us anything..."
              }
              className="min-h-[160px] resize-none text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              We reply within 1–2 business days
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="gap-2 shrink-0"
              disabled={sending || !message.trim()}
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4" /> Send message</>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-border/50 flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Back to home</Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
