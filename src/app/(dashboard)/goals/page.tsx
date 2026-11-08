import { createClient } from "@/lib/supabase/server";
import { GoalsView } from "@/components/goals/GoalsView";
import { isPremiumPlan } from "@/lib/utils";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: goals }, { data: subscription }] = await Promise.all([
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return <GoalsView userId={user.id} initialGoals={goals ?? []} isPremium={isPremiumPlan(subscription?.plan)} />;
}
