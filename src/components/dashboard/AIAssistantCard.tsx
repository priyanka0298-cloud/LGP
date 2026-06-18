"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Brain, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, Mood, Profile } from "@/types";
import ReactMarkdown from "react-markdown";

interface AIAssistantCardProps {
  profile: Profile | null;
  tasks: Task[];
  mood: Mood | null;
}

type AssistantMode = "brain_dump" | "prioritize" | "schedule" | "chat";

const MODES = [
  { id: "brain_dump" as const, label: "Brain Dump", emoji: "🧠", placeholder: "Dump everything on your mind here — thoughts, tasks, worries, ideas. Just get it all out..." },
  { id: "prioritize" as const, label: "Prioritize", emoji: "🎯", placeholder: "Tell me about your tasks and I'll help you figure out what actually matters today..." },
  { id: "schedule" as const, label: "Plan My Day", emoji: "📅", placeholder: "Tell me how many hours you have and what you need to get done..." },
  { id: "chat" as const, label: "Chat", emoji: "💜", placeholder: "Ask me anything about planning, productivity, or how to make today gentler..." },
];

export function AIAssistantCard({ profile, tasks, mood }: AIAssistantCardProps) {
  const [mode, setMode] = useState<AssistantMode>("brain_dump");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMode = MODES.find((m) => m.id === mode)!;

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResponse("");

    const endpoint = mode === "brain_dump" ? "/api/ai/brain-dump" : "/api/ai/chat";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          mode,
          context: {
            moodScore: mood?.mood_score,
            energyLevel: mood?.energy_level,
            taskCount: tasks.length,
            existingTasks: tasks.slice(0, 5).map((t) => t.title),
            userGoals: profile?.onboarding_goals?.length ? profile.onboarding_goals : undefined,
          },
        }),
      });

      const data = await res.json();
      setResponse(data.response ?? data.output ?? "Sorry, I couldn't process that. Try again?");
    } catch {
      setResponse("Hmm, something went wrong. Give it another try in a moment 🌸");
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-purple-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            AI Planning Assistant
          </CardTitle>
          <Badge variant="soft" className="text-xs">Beta</Badge>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setResponse(""); setInput(""); }}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                mode === m.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentMode.placeholder}
            className="min-h-[100px] text-sm pr-10 resize-none"
          />
          <Button
            size="icon"
            variant="gradient"
            className="absolute bottom-2 right-2 h-7 w-7 rounded-lg"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">⌘+Enter to send</p>

        {/* Response */}
        <AnimatePresence>
          {(response || loading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rounded-2xl bg-gradient-to-br from-rose-50/80 to-purple-50/80 dark:from-rose-950/20 dark:to-purple-950/20 border border-border/30 p-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Thinking gently...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick prompts */}
        {!response && !loading && (
          <div className="flex flex-wrap gap-2">
            {[
              "I'm overwhelmed today",
              "Help me do a brain dump",
              "Low energy mode please",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
