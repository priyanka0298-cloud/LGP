import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { format } from "date-fns";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch all dashboard data in parallel
  const [
    { data: tasks },
    { data: habits },
    { data: completions },
    { data: mood },
    { data: profile },
    { data: subscription },
    { data: weeklyPlan },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("scheduled_date", today)
      .neq("status", "done")
      .order("sort_order"),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("completed_date", today),
    supabase
      .from("moods")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase
      .from("weekly_plans")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_end", today)
      .lte("week_start", today)
      .single(),
  ]);

  const completedHabitIds = new Set((completions ?? []).map((c) => c.habit_id));
  const habitsWithCompletion = (habits ?? []).map((h) => ({
    ...h,
    completedToday: completedHabitIds.has(h.id),
  }));

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent
        tasks={tasks ?? []}
        habits={habitsWithCompletion}
        mood={mood ?? null}
        profile={profile}
        subscription={subscription}
        weeklyPlan={weeklyPlan ?? null}
      />
    </Suspense>
  );
}
