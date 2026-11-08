import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { isPremiumPlan } from "@/lib/utils";

export async function loadMarketplaceData(supabase: SupabaseClient<Database>, userId: string | null) {
  const [{ data: templates }, { data: purchases }, { data: subscription }] = await Promise.all([
    supabase
      .from("planner_templates")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("download_count", { ascending: false }),
    userId
      ? supabase.from("template_purchases").select("template_id, applied, amount_cents").eq("user_id", userId)
      : Promise.resolve({ data: [] as { template_id: string; applied: boolean; amount_cents: number | null }[] }),
    userId
      ? supabase.from("subscriptions").select("plan").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    templates: templates ?? [],
    // Templates currently on the user's planner
    appliedIds: new Set((purchases ?? []).filter((p) => p.applied).map((p) => p.template_id)),
    // Paid templates the user has bought
    ownedIds: new Set((purchases ?? []).filter((p) => (p.amount_cents ?? 0) > 0).map((p) => p.template_id)),
    isPremium: isPremiumPlan(subscription?.plan),
  };
}
