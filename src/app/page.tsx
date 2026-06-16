import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
