import React from "react";
import Link from "next/link";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Contact Us — Softlivi",
  description: "Get in touch with the Softlivi team.",
};

export default function ContactPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-bold mb-2">Contact us</h1>
        <p className="text-muted-foreground mb-10">
          We&apos;d love to hear from you — whether it&apos;s a question, a bug, or just a hello.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <Mail className="h-5 w-5 text-primary mb-3" />
            <p className="font-medium text-sm mb-1">Email us</p>
            <p className="text-xs text-muted-foreground mb-3">For anything and everything</p>
            <a href="mailto:hello@softlivi.com" className="text-sm text-primary underline underline-offset-2">
              hello@softlivi.com
            </a>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <MessageCircle className="h-5 w-5 text-primary mb-3" />
            <p className="font-medium text-sm mb-1">Feature requests</p>
            <p className="text-xs text-muted-foreground mb-3">Got an idea? We&apos;re all ears</p>
            <a href="mailto:hello@softlivi.com?subject=Feature request" className="text-sm text-primary underline underline-offset-2">
              Send a request
            </a>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <Clock className="h-5 w-5 text-primary mb-3" />
            <p className="font-medium text-sm mb-1">Response time</p>
            <p className="text-xs text-muted-foreground mb-3">We aim to reply within</p>
            <p className="text-sm font-medium">1–2 business days</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-border/40 p-6 mb-10">
          <h2 className="font-semibold mb-1">Before you reach out</h2>
          <p className="text-sm text-muted-foreground">
            If you have a question about your account, billing, or a bug — include as much detail
            as possible (what you were doing, what happened, what you expected). It helps us get
            back to you faster.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            For privacy-related requests (data export, account deletion, etc.) email us at{" "}
            <a href="mailto:hello@softlivi.com" className="text-primary underline underline-offset-2">
              hello@softlivi.com
            </a>{" "}
            with the subject line <span className="font-medium text-foreground">"Privacy Request"</span>.
          </p>
        </div>

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
