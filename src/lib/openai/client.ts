import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.startsWith("sk-your-")) {
      throw new Error("OPENAI_API_KEY_MISSING");
    }
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
