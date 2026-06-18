"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, Goal } from "@/types";
import ReactMarkdown from "react-markdown";

interface PlannerAIAssistantProps {
  tasks: Task[];
  goals: Goal[];
}

const QUICK_PROMPTS = [
  { label: "Plan my week gently", prompt: "Help me create a realistic, gentle plan for this week. I want to make progress without burning out." },
  { label: "I'm overwhelmed", prompt: "I'm feeling overwhelmed by everything I have to do this week. Help me figure out what actually matters and what can wait." },
  { label: "What should I do today?", prompt: "Based on my tasks and goals, what should I focus on today? Keep it manageable." },
  { label: "Low energy day", prompt: "I'm having a low energy day. What's the most I can do that still counts as progress?" },
  { label: "Help me prioritize", prompt: "I have a lot on my plate. Help me decide what's truly important vs. what I should let go of this week." },
];

export function PlannerAIAssistant({ tasks, goals }: PlannerAIAssistantProps) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const taskSummary = tasks
    .filter((t) => t.status !== "done")
    .slice(0, 8)
    .map((t) => `• ${t.title}`)
    .join("\n");

  const goalSummary = goals.slice(0, 3).map((g) => g.title).join(", ");

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          context: {
            existingTasks: tasks.slice(0, 8).map((t) => t.title),
            userGoals: goals.length ? goals.map((g) => g.title) : undefined,
          },
        }),
      });
      const data = await res.json();
      setResponse(data.response ?? data.output ?? "I couldn't process that right now. Try again? 🌸");
    } catch {
      setResponse("Hmm, something went wrong. Give it another try in a moment 🌸");
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  function reset() {
    setInput("");
    setResponse("");
  }

  return (
    <div className="rounded-3xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-rose-50/50 to-purple-50/50 dark:from-rose-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-purple-500 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">AI Planning Assistant</p>
            <p className="text-xs text-muted-foreground">Soft planning, not hustle coaching</p>
          </div>
        </div>
        <Badge variant="soft" className="text-xs">Beta</Badge>
      </div>

      <div className="p-5 space-y-4">
        {/* Context pill */}
        {(taskSummary || goalSummary) && (
          <div className="rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground space-y-1">
            {taskSummary && <p>📋 <span className="font-medium">Tasks this week:</span> {tasks.filter(t => t.status !== "done").length} remaining</p>}
            {goalSummary && <p>🎯 <span className="font-medium">Active goals:</span> {goalSummary}</p>}
          </div>
        )}

        {/* Quick prompts */}
        {!response && !loading && (
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => setInput(p.prompt)}
                className={cn(
                  "rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors",
                  "hover:border-primary/50 hover:text-primary hover:bg-primary/5",
                  input === p.prompt && "border-primary/50 text-primary bg-primary/5"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Response */}
        {(response || loading) && (
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
        )}

        {/* Input */}
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your plan, priorities, or how to make this week lighter..."
            className="min-h-[90px] text-sm pr-12 resize-none"
          />
          <Button
            size="icon"
            variant="gradient"
            className="absolute bottom-2 right-2 h-8 w-8 rounded-xl"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">⌘+Enter to send</p>
          {(response || input) && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
