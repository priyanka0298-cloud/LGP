import { createClient } from "@/lib/supabase/server";
import { loadMarketplaceData } from "@/lib/marketplace";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

export const metadata = { title: "Template Marketplace" };

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { templates, purchasedIds, isPremium } = await loadMarketplaceData(supabase, user?.id ?? null);

  return (
    <MarketplaceView
      templates={templates}
      purchasedIds={purchasedIds}
      userId={user?.id ?? null}
      isPremium={isPremium}
    />
  );
}
