import { createClient } from "@/lib/supabase/server";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

export const metadata = { title: "Template Marketplace" };

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: templates }, { data: purchases }, { data: subscription }] = await Promise.all([
    supabase
      .from("planner_templates")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("download_count", { ascending: false }),
    user
      ? supabase.from("template_purchases").select("template_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const purchasedIds = new Set((purchases ?? []).map((p) => p.template_id));
  const isPremium = subscription?.plan === "premium" || subscription?.plan === "lifetime";

  return (
    <MarketplaceView
      templates={templates ?? []}
      purchasedIds={purchasedIds}
      userId={user?.id ?? null}
      isPremium={isPremium}
    />
  );
}
