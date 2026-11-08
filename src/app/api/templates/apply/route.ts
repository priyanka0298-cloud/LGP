import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TEMPLATE_CONFIGS } from "@/lib/template-configs";
import type { TemplateConfig } from "@/types";
import { format, addDays } from "date-fns";
import { isPremiumPlan } from "@/lib/utils";

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

  const [{ data: subscription }, { data: existing }] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("template_purchases")
      .select("id, amount_cents")
      .eq("user_id", user.id)
      .eq("template_id", templateId)
      .maybeSingle(),
  ]);
  const isPremium = isPremiumPlan(subscription?.plan);

  // Paid templates: Premium includes them all, otherwise the user must have bought it
  const purchased = (existing?.amount_cents ?? 0) > 0;
  if (template.price_cents > 0 && !isPremium && !purchased) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
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
      .select("name, is_active")
      .eq("user_id", user.id);

    const existingNames = new Set((existingHabits ?? []).map((h) => h.name.toLowerCase()));

    // Free plan holds 5 active habits — cap what a template can add
    const activeCount = (existingHabits ?? []).filter((h) => h.is_active).length;
    const remainingSlots = isPremium ? config.habits.length : Math.max(0, 5 - activeCount);

    const newHabits = config.habits
      .filter((h) => !existingNames.has(h.name.toLowerCase()))
      .slice(0, remainingSlots)
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

  // Record this application so the button shows "Applied" next time.
  // template_purchases and planner_templates are read-only to users, so write with the service role
  const admin = await createServiceClient();

  if (existing) {
    await admin.from("template_purchases").update({ applied: true }).eq("id", existing.id);
  } else {
    await admin.from("template_purchases").insert({
      user_id: user.id,
      template_id: templateId,
      amount_cents: 0,
      applied: true,
    });
  }

  // Bump download count
  await admin
    .from("planner_templates")
    .update({ download_count: template.download_count + 1 })
    .eq("id", templateId);

  const welcome =
    config.welcome_message ??
    `Your "${template.title}" template is live! ${habitsCreated > 0 ? `${habitsCreated} habit${habitsCreated !== 1 ? "s" : ""} added.` : ""} ${tasksCreated > 0 ? `${tasksCreated} task${tasksCreated !== 1 ? "s" : ""} added.` : ""} 🌸`.trim();

  return NextResponse.json({ habitsCreated, tasksCreated, welcome });
}
