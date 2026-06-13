import { NextResponse } from "next/server";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai/client";
import { SYSTEM_PROMPT_BASE } from "@/lib/openai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { input, context = {} } = await request.json();

  try {
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT_BASE}

You are currently acting as a gentle planning chat assistant. Keep responses concise (max 3 paragraphs), warm, and actionable. Format with markdown when helpful. Always end with something encouraging.`,
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content ?? "I'm having trouble thinking right now. Try again in a moment? 🌸";
    return NextResponse.json({ response });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json({ error: "AI features aren't set up yet — add your OpenAI key to get started." }, { status: 503 });
    }
    return NextResponse.json({ error: "Something went wrong. Try again in a moment? 🌸" }, { status: 500 });
  }
}
