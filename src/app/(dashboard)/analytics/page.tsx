import { createClient } from "@/lib/supabase/server";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { subDays, format } from "date-fns";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  const thirtyDaysAgo = format(subDays(today, 30), "yyyy-MM-dd");

  const [
    { data: moods },
    { data: tasks },
    { data: habits },
    { data: completions },
  ] = await Promise.all([
    supabase
      .from("moods")
      .select("date, mood_score, energy_level, mood_label, note")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo)
      .order("date"),
    supabase
      .from("tasks")
      .select("scheduled_date, status, category")
      .eq("user_id", user.id)
      .gte("scheduled_date", thirtyDaysAgo),
    supabase
      .from("habits")
      .select("id, name, emoji, streak_current, streak_longest, total_completions")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("habit_completions")
      .select("habit_id, completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", thirtyDaysAgo),
  ]);

  return (
    <AnalyticsView
      moods={moods ?? []}
      tasks={tasks ?? []}
      habits={habits ?? []}
      completions={completions ?? []}
    />
  );
}
