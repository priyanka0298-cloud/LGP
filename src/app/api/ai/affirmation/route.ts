import { NextResponse } from "next/server";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai/client";
import { AFFIRMATION_PROMPT } from "@/lib/openai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { moodScore, energyLevel, displayName } = await request.json();

  let openai;
  try {
    openai = getOpenAIClient();
  } catch {
    return NextResponse.json({ affirmation: "" }, { status: 200 });
  }

  const userMessage = `Context: User is ${displayName ?? "a planner user"}.
Current mood: ${moodScore ? `${moodScore}/7` : "not tracked yet"}
Energy level: ${energyLevel ? `${energyLevel}/5` : "not tracked yet"}
Time of day: ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}

Generate one meaningful, warm daily affirmation for this person.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: AFFIRMATION_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 100,
    temperature: 0.9,
  });

  const affirmation = completion.choices[0]?.message?.content?.trim() ?? "";

  // Log to AI generations table
  await supabase.from("ai_generations").insert({
    user_id: user.id,
    generation_type: "affirmation",
    input_data: { moodScore, energyLevel },
    output_data: { affirmation },
    tokens_used: completion.usage?.total_tokens,
    model_used: AI_MODEL,
  });

  return NextResponse.json({ affirmation });
}
