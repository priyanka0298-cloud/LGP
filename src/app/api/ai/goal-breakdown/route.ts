import { NextResponse } from "next/server";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai/client";
import { GOAL_BREAKDOWN_PROMPT } from "@/lib/openai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalId, title, why, timeHorizon, targetDate, extraDetail } = await request.json();

  let openai;
  try {
    openai = getOpenAIClient();
  } catch {
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }

  const deadlineStr = targetDate
    ? `Deadline: ${new Date(targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : null;

  const userMessage = [
    `Goal: "${title}"`,
    why ? `Why this matters to me: "${why}"` : null,
    `Time horizon: ${timeHorizon || "monthly"}`,
    deadlineStr,
    extraDetail ? `Additional context: ${extraDetail}` : null,
    "",
    "Break this down into small, realistic steps I can actually follow through on.",
  ].filter(Boolean).join("\n");

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: GOAL_BREAKDOWN_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 800,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  // Normalise steps into { title, done } shape for storage
  const steps = (parsed.steps ?? []).map((s: { title: string }) => ({
    title: s.title,
    done: false,
  }));

  // Persist steps + reframed goal back to the DB
  await supabase
    .from("goals")
    .update({
      ai_steps: steps,
      description: parsed.reframed_goal ?? null,
    })
    .eq("id", goalId)
    .eq("user_id", user.id);

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    generation_type: "goal_breakdown",
    input_data: { goalId, title, why, timeHorizon },
    output_data: parsed,
    tokens_used: completion.usage?.total_tokens,
    model_used: AI_MODEL,
  });

  return NextResponse.json({ steps, mindset_note: parsed.mindset_note, permission_slip: parsed.permission_slip });
}
