import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function loadMarketplaceData(supabase: SupabaseClient<Database>, userId: string | null) {
  const [{ data: templates }, { data: purchases }, { data: subscription }] = await Promise.all([
    supabase
      .from("planner_templates")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("download_count", { ascending: false }),
    userId
      ? supabase.from("template_purchases").select("template_id").eq("user_id", userId)
      : Promise.resolve({ data: [] as { template_id: string }[] }),
    userId
      ? supabase.from("subscriptions").select("plan").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    templates: templates ?? [],
    purchasedIds: new Set((purchases ?? []).map((p) => p.template_id)),
    isPremium: subscription?.plan === "premium" || subscription?.plan === "lifetime",
  };
}
