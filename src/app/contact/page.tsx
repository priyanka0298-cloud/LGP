import React from "react";
import Link from "next/link";
import { Mail, MessageCircle, Bug, Shield, Clock, Inbox } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Contact Us — Softlivi",
  description: "Get in touch with the Softlivi team.",
};

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: "General question",
    description: "Anything and everything",
    label: "Send a message",
    href: "mailto:hello@softlivi.com?subject=Question%20about%20Softlivi",
  },
  {
    icon: MessageCircle,
    title: "Feature request",
    description: "Got an idea? We're all ears",
    label: "Share your idea",
    href: "mailto:hello@softlivi.com?subject=Feature%20Request",
  },
  {
    icon: Bug,
    title: "Report a bug",
    description: "Something not working right?",
    label: "Report it",
    href: "mailto:hello@softlivi.com?subject=Bug%20Report",
  },
  {
    icon: Shield,
    title: "Privacy request",
    description: "Data export, account deletion, and more",
    label: "Submit request",
    href: "mailto:hello@softlivi.com?subject=Privacy%20Request",
  },
  {
    icon: Inbox,
    title: "Something else?",
    description: "Not sure where to start? Just drop us a line — we read everything",
    label: "Email us directly",
    href: "mailto:hello@softlivi.com",
  },
];

export default function ContactPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-bold mb-2">Contact us</h1>
        <p className="text-muted-foreground mb-10">
          We&apos;d love to hear from you. Tap a topic below and your email app will open — no copy-pasting needed.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {CONTACT_OPTIONS.map((option) => (
            <a
              key={option.title}
              href={option.href}
              rel="noopener noreferrer"
              className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <option.icon className="h-5 w-5 text-primary mb-3" />
              <p className="font-medium text-sm mb-1">{option.title}</p>
              <p className="text-xs text-muted-foreground mb-3">{option.description}</p>
              <span className="text-sm text-primary underline underline-offset-2 group-hover:no-underline">
                {option.label} →
              </span>
            </a>
          ))}
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-border/40 p-5 mb-10">
          <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-0.5">We reply within 1–2 business days</p>
            <p className="text-xs text-muted-foreground">
              For bugs, include what you were doing, what happened, and what you expected — it helps us fix things faster.
            </p>
          </div>
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
