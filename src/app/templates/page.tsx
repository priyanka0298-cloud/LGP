import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadMarketplaceData } from "@/lib/marketplace";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Planner Templates",
  description: "Ready-made habit and planning bundles you can add to Softlivi in one tap.",
};

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/marketplace");

  const { templates, purchasedIds, isPremium } = await loadMarketplaceData(supabase, null);

  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <MarketplaceView templates={templates} purchasedIds={purchasedIds} userId={null} isPremium={isPremium} />
      </main>
      <LandingFooter />
    </>
  );
}
