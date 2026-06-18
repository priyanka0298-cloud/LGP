import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { HabitSuggestion } from "@/lib/template-configs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habits }: { habits: HabitSuggestion[] } = await request.json();
  if (!habits?.length) return NextResponse.json({ error: "No habits selected" }, { status: 400 });

  const { data: existingHabits } = await supabase
    .from("habits")
    .select("name, sort_order")
    .eq("user_id", user.id);

  const existingNames = new Set((existingHabits ?? []).map((h) => h.name.toLowerCase()));
  const baseOrder = existingHabits?.length ?? 0;

  const newHabits = habits
    .filter((h) => !existingNames.has(h.name.toLowerCase()))
    .map((h, i) => ({
      user_id: user.id,
      name: h.name,
      emoji: h.emoji,
      frequency: h.frequency,
      category: h.category,
      color: "#f43f5e",
      sort_order: baseOrder + i,
      is_active: true,
    }));

  const skipped = habits.length - newHabits.length;

  if (newHabits.length) {
    const { error } = await supabase.from("habits").insert(newHabits);
    if (error) return NextResponse.json({ error: "Failed to save habits" }, { status: 500 });
  }

  const added = newHabits.length;
  const msg = added === 0
    ? "You already have all those habits! 🌸"
    : skipped > 0
    ? `${added} new habit${added !== 1 ? "s" : ""} added! (${skipped} already existed) 🌿`
    : `${added} habit${added !== 1 ? "s" : ""} added to your tracker 🌸`;

  return NextResponse.json({ added, skipped, message: msg });
}
