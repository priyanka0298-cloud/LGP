import { createClient } from "@/lib/supabase/server";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

export const metadata = { title: "Template Marketplace" };

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: templates }, { data: purchases }] = await Promise.all([
    supabase
      .from("planner_templates")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("download_count", { ascending: false }),
    user
      ? supabase.from("template_purchases").select("template_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const purchasedIds = new Set((purchases ?? []).map((p) => p.template_id));

  return (
    <MarketplaceView
      templates={templates ?? []}
      purchasedIds={purchasedIds}
      userId={user?.id ?? null}
    />
  );
}
