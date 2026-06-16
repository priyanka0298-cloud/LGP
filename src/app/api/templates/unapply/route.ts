import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_CONFIGS } from "@/lib/template-configs";

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

  const { data: template } = await supabase
    .from("planner_templates")
    .select("id, title")
    .eq("id", templateId)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const config = TEMPLATE_CONFIGS[template.title];
  if (!config) {
    return NextResponse.json({ error: "No config for this template" }, { status: 400 });
  }

  let habitsRemoved = 0;
  let tasksRemoved = 0;

  // Remove habits by name
  if (config.habits?.length) {
    const habitNames = config.habits.map((h) => h.name);
    const { data: deleted } = await supabase
      .from("habits")
      .delete()
      .eq("user_id", user.id)
      .in("name", habitNames)
      .select("id");
    habitsRemoved = deleted?.length ?? 0;
  }

  // Remove tasks by title
  if (config.tasks?.length) {
    const taskTitles = config.tasks.map((t) => t.title);
    const { data: deleted } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id)
      .in("title", taskTitles)
      .select("id");
    tasksRemoved = deleted?.length ?? 0;
  }

  // Remove purchase record so it shows as unapplied
  await supabase
    .from("template_purchases")
    .delete()
    .eq("user_id", user.id)
    .eq("template_id", templateId);

  return NextResponse.json({
    habitsRemoved,
    tasksRemoved,
    message: `"${template.title}" removed — ${habitsRemoved} habit${habitsRemoved !== 1 ? "s" : ""} and ${tasksRemoved} task${tasksRemoved !== 1 ? "s" : ""} deleted.`,
  });
}
