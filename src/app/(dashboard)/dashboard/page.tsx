import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch profile first to get timezone, so today's date is correct for the user's locale
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const userTz = profile?.timezone ?? "UTC";

  // Compute today in the user's local timezone (en-CA locale gives YYYY-MM-DD format)
  const today = new Date().toLocaleDateString("en-CA", { timeZone: userTz });

  const [
    { data: tasks },
    { data: habits },
    { data: completions },
    { data: mood },
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
