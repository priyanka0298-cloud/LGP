import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_CONFIGS } from "@/lib/template-configs";
import type { TemplateConfig } from "@/types";
import { format, addDays } from "date-fns";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await request.json();
  if (!templateId) {
    return NextResponse.json({ error: "templateId required" }, { status: 400 });
  }

  // Fetch the template
  const { data: template, error: templateError } = await supabase
    .from("planner_templates")
    .select("id, title, price_cents, is_published, download_count")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (!template.is_published) {
    return NextResponse.json({ error: "Template not available" }, { status: 403 });
  }

  // For paid templates, verify purchase exists
  if (template.price_cents > 0) {
    const { data: purchase } = await supabase
      .from("template_purchases")
      .select("id")
      .eq("template_id", templateId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!purchase) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }
  }

  // Look up config — from file (works immediately, no DB migration needed)
  const config: TemplateConfig | undefined = TEMPLATE_CONFIGS[template.title];

  if (!config) {
    return NextResponse.json({ error: "This template has no config yet" }, { status: 400 });
  }

  let habitsCreated = 0;
  let tasksCreated = 0;

  // Create habits — skip any that already exist by name for this user
  if (config.habits?.length) {
    const { data: existingHabits } = await supabase
      .from("habits")
      .select("name")
      .eq("user_id", user.id);

    const existingNames = new Set((existingHabits ?? []).map((h) => h.name.toLowerCase()));

    const newHabits = config.habits
      .filter((h) => !existingNames.has(h.name.toLowerCase()))
      .map((h, i) => ({
        user_id: user.id,
        name: h.name,
        emoji: h.emoji ?? null,
        frequency: h.frequency ?? ("daily" as const),
        category: h.category ?? "wellness",
        color: h.color ?? "#f43f5e",
        description: h.description ?? null,
        sort_order: (existingHabits?.length ?? 0) + i,
        is_active: true,
      }));

    if (newHabits.length) {
      const { error } = await supabase.from("habits").insert(newHabits);
      if (!error) habitsCreated = newHabits.length;
    }
  }

  // Create tasks
  if (config.tasks?.length) {
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const baseOrder = (existingTasks?.[0]?.sort_order ?? 0) + 1;

    const today = new Date();
    const newTasks = config.tasks.map((t, i) => ({
      user_id: user.id,
      title: t.title,
      category: t.category ?? ("should_do" as const),
      emoji: t.emoji ?? null,
      sort_order: baseOrder + i,
      scheduled_date: format(addDays(today, i % 7), "yyyy-MM-dd"),
    }));

    const { error } = await supabase.from("tasks").insert(newTasks);
    if (!error) tasksCreated = newTasks.length;
  }

  // Record this application so the button shows "Applied" next time
  // Check first to avoid duplicate inserts (no unique constraint needed)
  const { data: existing } = await supabase
    .from("template_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("template_purchases").insert({
      user_id: user.id,
      template_id: templateId,
      amount_cents: 0,
    });
  }

  // Bump download count
  await supabase
    .from("planner_templates")
    .update({ download_count: template.download_count + 1 })
    .eq("id", templateId);

  const welcome =
    config.welcome_message ??
    `Your "${template.title}" template is live! ${habitsCreated > 0 ? `${habitsCreated} habit${habitsCreated !== 1 ? "s" : ""} added.` : ""} ${tasksCreated > 0 ? `${tasksCreated} task${tasksCreated !== 1 ? "s" : ""} added.` : ""} 🌸`.trim();

  return NextResponse.json({ habitsCreated, tasksCreated, welcome });
}
