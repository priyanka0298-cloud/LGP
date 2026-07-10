import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { HabitSuggestion } from "@/lib/template-configs";

const FREE_HABIT_LIMIT = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habits }: { habits: HabitSuggestion[] } = await request.json();
  if (!habits?.length) return NextResponse.json({ error: "No habits selected" }, { status: 400 });

  const [{ data: existingHabits }, { data: subscription }] = await Promise.all([
    supabase.from("habits").select("name, sort_order, is_active").eq("user_id", user.id),
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
  ]);

  const existingNames = new Set((existingHabits ?? []).map((h) => h.name.toLowerCase()));
  const baseOrder = existingHabits?.length ?? 0;

  // Free plan holds 5 active habits — cap what a bundle can add
  const isPremium = subscription?.plan !== "free";
  const activeCount = (existingHabits ?? []).filter((h) => h.is_active).length;
  const remainingSlots = isPremium ? habits.length : Math.max(0, FREE_HABIT_LIMIT - activeCount);

  const dedupedHabits = habits.filter((h) => !existingNames.has(h.name.toLowerCase()));
  const cappedByPlan = Math.max(0, dedupedHabits.length - remainingSlots);
  const newHabits = dedupedHabits.slice(0, remainingSlots).map((h, i) => ({
    user_id: user.id,
    name: h.name,
    emoji: h.emoji,
    frequency: h.frequency,
    category: h.category,
    color: "#f43f5e",
    sort_order: baseOrder + i,
    is_active: true,
  }));

  const skipped = habits.length - dedupedHabits.length;

  if (newHabits.length) {
    const { error } = await supabase.from("habits").insert(newHabits);
    if (error) return NextResponse.json({ error: "Failed to save habits" }, { status: 500 });
  }

  const added = newHabits.length;
  const msg =
    added === 0 && cappedByPlan > 0
      ? `Your free plan is full (${FREE_HABIT_LIMIT} active habits). Upgrade for unlimited ✨`
      : added === 0
      ? "You already have all those habits! 🌸"
      : cappedByPlan > 0
      ? `${added} habit${added !== 1 ? "s" : ""} added — ${cappedByPlan} didn't fit the free plan's ${FREE_HABIT_LIMIT}-habit limit ✨`
      : skipped > 0
      ? `${added} new habit${added !== 1 ? "s" : ""} added! (${skipped} already existed) 🌿`
      : `${added} habit${added !== 1 ? "s" : ""} added to your tracker 🌸`;

  return NextResponse.json({ added, skipped: skipped + cappedByPlan, message: msg });
}
