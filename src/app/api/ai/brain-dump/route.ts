import { NextResponse } from "next/server";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai/client";
import { BRAIN_DUMP_PROMPT, TASK_PRIORITIZATION_PROMPT, SCHEDULE_SUGGESTION_PROMPT, LOW_ENERGY_MODE_PROMPT, ROMANTICIZE_LIFE_PROMPT } from "@/lib/openai/prompts";
import { createClient } from "@/lib/supabase/server";

const PROMPT_MAP: Record<string, string> = {
  brain_dump: BRAIN_DUMP_PROMPT,
  prioritize: TASK_PRIORITIZATION_PROMPT,
  schedule: SCHEDULE_SUGGESTION_PROMPT,
  low_energy: LOW_ENERGY_MODE_PROMPT,
  romanticize: ROMANTICIZE_LIFE_PROMPT,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { input, mode = "brain_dump", context = {} } = await request.json();

  const systemPrompt = PROMPT_MAP[mode] ?? BRAIN_DUMP_PROMPT;

  const userMessage = `Brain dump / input:
"${input}"

Additional context:
- Current mood: ${context.moodScore ?? "unknown"}/7
- Energy level: ${context.energyLevel ?? "unknown"}/5
- Existing tasks today: ${context.existingTasks?.length ?? 0} (${context.existingTasks?.join(", ") ?? "none"})${context.userGoals?.length ? `\n- What this user is working on: ${context.userGoals.join(", ")}` : ""}

Please help me organize this into a gentle, realistic plan.`;

  let openai;
  try {
    openai = getOpenAIClient();
  } catch {
    return NextResponse.json({ error: "AI features aren't set up yet — add your OpenAI key to get started." }, { status: 503 });
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const rawContent = completion.choices[0]?.message?.content ?? "";

  // Try to parse as JSON for structured responses, fallback to markdown
  let response = rawContent;
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Format the structured response as readable markdown
      response = formatStructuredResponse(parsed, mode);
    }
  } catch {
    // Keep raw response if JSON parsing fails
  }

  // Log generation
  await supabase.from("ai_generations").insert({
    user_id: user.id,
    generation_type: mode === "brain_dump" ? "brain_dump" : "task_prioritization",
    input_data: { input: input.slice(0, 500), mode, context },
    output_data: { response: response.slice(0, 2000) },
    tokens_used: completion.usage?.total_tokens,
    model_used: AI_MODEL,
  });

  return NextResponse.json({ response });
}

function formatStructuredResponse(parsed: Record<string, unknown>, mode: string): string {
  if (mode === "brain_dump") {
    const lines: string[] = [];

    if (parsed.encouragement) {
      lines.push(`✨ **${parsed.encouragement}**\n`);
    }

    if (Array.isArray(parsed.must_do) && parsed.must_do.length) {
      lines.push("## 🎯 Must Do (your non-negotiables today)\n");
      (parsed.must_do as Array<{title: string; estimated_minutes?: number; note?: string}>).forEach((t) => {
        lines.push(`- **${t.title}** (~${t.estimated_minutes ?? 30} min)${t.note ? ` — *${t.note}*` : ""}`);
      });
      lines.push("");
    }

    if (Array.isArray(parsed.should_do) && parsed.should_do.length) {
      lines.push("## ✨ Should Do (if possible)\n");
      (parsed.should_do as Array<{title: string}>).forEach((t) => lines.push(`- ${t.title}`));
      lines.push("");
    }

    if (Array.isArray(parsed.if_energy) && parsed.if_energy.length) {
      lines.push("## 🌸 If I Have Energy\n");
      (parsed.if_energy as Array<{title: string}>).forEach((t) => lines.push(`- ${t.title}`));
      lines.push("");
    }

    if (parsed.energy_check) {
      lines.push(`\n💜 *${parsed.energy_check}*`);
    }

    return lines.join("\n");
  }

  return JSON.stringify(parsed, null, 2);
}
