import React from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Terms of Service — Softlivi",
  description: "The terms that govern your use of Softlivi.",
};

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 15, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-7">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of terms</h2>
            <p>
              By creating an account or using Softlivi ("the Service"), you agree to these Terms of
              Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Who can use Softlivi</h2>
            <p>
              You must be at least 16 years old to use Softlivi. By using the Service, you
              represent that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Your account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and
              for all activity that occurs under your account. Notify us immediately at
              hello@softlivi.com if you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Subscriptions and billing</h2>
            <p>
              Softlivi offers a free tier and a paid Premium plan. Paid subscriptions are billed
              monthly or annually via Stripe. By subscribing you authorise us to charge your
              payment method on a recurring basis until you cancel.
            </p>
            <p className="mt-3">
              You may cancel at any time from Settings → Subscription. Cancellation takes effect at
              the end of the current billing period — you keep access until then. We do not offer
              refunds for partial billing periods unless required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li>Scrape, copy, or redistribute content from the Service without permission</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Reverse-engineer or attempt to extract the source code of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Your content</h2>
            <p>
              You own the content you create in Softlivi (journal entries, tasks, notes, etc.).
              By using the Service, you grant us a limited licence to store and process your content
              solely to provide the Service to you.
            </p>
            <p className="mt-3">
              We do not use your personal content to train AI models or share it with third parties
              except as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. AI features — important notice</h2>
            <p>
              AI-generated suggestions (planning advice, journal prompts, goal breakdowns) are for
              personal productivity purposes only. They do not constitute medical, psychological,
              nutritional, financial, or any other professional advice. Always consult a qualified
              professional for matters affecting your health or wellbeing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Availability and changes</h2>
            <p>
              We aim to keep Softlivi available at all times but cannot guarantee uninterrupted
              access. We may update, modify, or discontinue features with reasonable notice. For
              significant changes that affect paid subscribers, we will provide at least 30 days'
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Intellectual property</h2>
            <p>
              All content, design, code, and branding of Softlivi (excluding your personal content)
              is owned by us and protected by applicable intellectual property laws. You may not
              copy, modify, or distribute it without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Disclaimer of warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind, express or implied.
              We do not warrant that the Service will be error-free, uninterrupted, or free of
              harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Softlivi will not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of (or inability
              to use) the Service, even if we have been advised of the possibility of such damages.
              Our total liability to you will not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate your account if
              you violate these Terms, with notice where reasonably practicable. Upon termination,
              your right to use the Service ceases and we will delete your data per our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Governing law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which Softlivi operates.
              Any disputes will be resolved in the competent courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">14. Contact</h2>
            <p>
              Questions about these Terms?{" "}
              <Link href="/contact" className="text-primary underline">Contact us</Link> — or email
              us directly at{" "}
              <a href="mailto:hello@softlivi.com" className="text-primary underline">hello@softlivi.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Back to home</Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
