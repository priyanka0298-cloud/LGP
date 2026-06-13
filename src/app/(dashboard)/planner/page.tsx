import { createClient } from "@/lib/supabase/server";
import { WeeklyPlannerView } from "@/components/planner/WeeklyPlannerView";
import { startOfWeek, endOfWeek, format, addDays } from "date-fns";
import type { Task } from "@/types";

export const metadata = { title: "Planner" };

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  // Build date range array
  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );

  const [
    { data: tasks },
    { data: weeklyPlan },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", weekStartStr)
      .lte("scheduled_date", weekEndStr)
      .order("sort_order"),
    supabase
      .from("weekly_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .single(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(5),
  ]);

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  dates.forEach((d) => { tasksByDate[d] = []; });
  (tasks ?? []).forEach((task) => {
    if (task.scheduled_date && tasksByDate[task.scheduled_date]) {
      tasksByDate[task.scheduled_date].push(task as Task);
    }
  });

  return (
    <WeeklyPlannerView
      userId={user.id}
      weekStart={weekStart}
      weekEnd={weekEnd}
      tasksByDate={tasksByDate}
      weeklyPlan={weeklyPlan ?? null}
      goals={goals ?? []}
    />
  );
}
