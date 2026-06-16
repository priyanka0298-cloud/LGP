import React from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Privacy Policy — Softlivi",
  description: "How Softlivi collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 15, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-7">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Who we are</h2>
            <p>
              Softlivi ("we", "us", "our") is a personal planning app at softlivi.com. If you have
              questions about this policy, contact us at{" "}
              <a href="mailto:hello@softlivi.com" className="text-primary underline">hello@softlivi.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. What we collect</h2>
            <p>We collect information you give us directly when you:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Create an account (name, email address, password)</li>
              <li>Fill in your profile (display name, timezone, preferences)</li>
              <li>Use app features (tasks, journal entries, mood logs, habit data, cycle data, goals, reminders)</li>
              <li>Subscribe to a paid plan (billing is handled by Stripe — we do not store card details)</li>
              <li>Contact us for support</li>
            </ul>
            <p className="mt-3">
              We also automatically collect basic usage data (pages visited, feature usage frequency)
              and device information (browser type, OS) to improve the product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the Softlivi service</li>
              <li>To send check-in and reminder emails you've opted into (you can turn these off in Settings)</li>
              <li>To process payments and manage your subscription</li>
              <li>To respond to support requests</li>
              <li>To improve the app through aggregated, anonymised usage analytics</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. AI features</h2>
            <p>
              Some features (AI assistant, journal insights, goal planning) send content you write to
              OpenAI's API to generate a response. This content is processed under OpenAI's{" "}
              <a href="https://openai.com/policies/privacy-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>
              . We do not use your content to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Who we share data with</h2>
            <p>We use the following third-party services to operate Softlivi:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>OpenAI</strong> — AI-powered features</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Vercel</strong> — hosting and infrastructure</li>
            </ul>
            <p className="mt-3">
              Each provider processes your data only as necessary to deliver their service and is
              bound by their own privacy commitments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Data retention</h2>
            <p>
              We keep your data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where we are required to
              retain it for legal or billing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Your rights</h2>
            <p>You can, at any time:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access and export your data from the Settings page</li>
              <li>Update or correct your profile information</li>
              <li>Opt out of marketing and check-in emails in Settings → Reminders</li>
              <li>Request deletion of your account by emailing hello@softlivi.com</li>
            </ul>
            <p className="mt-3">
              If you are in the EU or UK, you have additional rights under GDPR / UK GDPR, including
              the right to data portability and the right to lodge a complaint with your local
              supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Cookies</h2>
            <p>
              We use essential cookies only — for authentication sessions and user preferences.
              We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS),
              hashed passwords, and row-level security on our database. No method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we do, we'll update the "last
              updated" date at the top. For significant changes, we'll notify you by email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Contact</h2>
            <p>
              Questions about this policy or how we handle your data?{" "}
              <Link href="/contact" className="text-primary underline">Get in touch</Link> — we&apos;re
              happy to help. You can also email us directly at{" "}
              <a href="mailto:hello@softlivi.com" className="text-primary underline">hello@softlivi.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Back to home</Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
