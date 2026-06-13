import { createClient } from "@/lib/supabase/server";
import { CycleView } from "@/components/cycle/CycleView";
import type { PeriodLog, Subscription } from "@/types";

export const metadata = { title: "Cycle Tracker" };

export default async function CyclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: logs }, { data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("period_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("start_date", { ascending: false })
      .limit(12),
    supabase
      .from("profiles")
      .select("avg_cycle_length, avg_period_length, display_name, full_name")
      .eq("id", user!.id)
      .single(),
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).single(),
  ]);

  return (
    <CycleView
      logs={(logs ?? []) as PeriodLog[]}
      avgCycleLength={profile?.avg_cycle_length ?? 28}
      avgPeriodLength={profile?.avg_period_length ?? 5}
      userId={user!.id}
      subscription={subscription as Subscription | null}
    />
  );
}
