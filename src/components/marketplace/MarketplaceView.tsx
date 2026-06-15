"use client";

import React, { useState } from "react";
import { Star, Filter, Search, Sparkles, Lock, CheckCircle2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import type { PlannerTemplate } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MarketplaceViewProps {
  templates: PlannerTemplate[];
  purchasedIds: Set<string>;
  userId: string | null;
  isPremium: boolean;
}

const CATEGORIES = ["All", "weekly", "daily", "monthly", "goal", "habit", "journal", "vision_board"];

export function MarketplaceView({ templates, purchasedIds, userId, isPremium }: MarketplaceViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set(purchasedIds));
  const router = useRouter();

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featured = templates.filter((t) => t.is_featured);

  async function handleApply(template: PlannerTemplate) {
    if (!userId) {
      toast.error("Sign in to use templates 🌸");
      return;
    }

    // Paid template — check premium or go to checkout
    if (template.price_cents > 0 && !applied.has(template.id)) {
      const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
        !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_your-");
      if (!stripeReady) {
        toast.info("Paid templates coming soon — check back after launch! 🌸");
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: template.stripe_price_id }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      if (url) window.location.href = url;
      return;
    }

    // Free or already purchased — apply
    setApplying(template.id);
    try {
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong 🌸");
        return;
      }
      setApplied((prev) => new Set([...prev, template.id]));
      toast.success(data.welcome, { duration: 5000 });
      router.refresh();
    } catch {
      toast.error("Couldn't apply the template. Try again 🌸");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Template Marketplace 🛍️</h1>
        <p className="text-sm text-muted-foreground">Curated planning systems — apply one tap to your planner</p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Featured section */}
      {activeCategory === "All" && !searchQuery && featured.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            Staff Picks
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isApplied={applied.has(template.id)}
                isApplying={applying === template.id}
                onApply={() => handleApply(template)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All templates */}
      <div>
        {(activeCategory !== "All" || searchQuery) ? null : (
          <p className="text-sm font-semibold mb-3">All Templates ({filtered.length})</p>
        )}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-medium">No templates found</p>
            <p className="text-sm text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isApplied={applied.has(template.id)}
                isApplying={applying === template.id}
                onApply={() => handleApply(template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isApplied,
  isApplying,
  onApply,
  featured,
}: {
  template: PlannerTemplate;
  isApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
  featured?: boolean;
}) {
  const isFree = template.price_cents === 0;
  const canApply = isFree || isApplied;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card overflow-hidden group",
        featured && "ring-1 ring-primary/20"
      )}
    >
      {/* Preview image / color block */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-950/40 dark:to-purple-950/40 overflow-hidden">
        {template.preview_images?.[0] ? (
          <img
            src={template.preview_images[0]}
            alt={template.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {CATEGORY_EMOJI[template.category] ?? "📋"}
          </div>
        )}
        {featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-xs">
              ✨ Featured
            </Badge>
          </div>
        )}
        {isFree && (
          <div className="absolute top-2 left-2">
            <Badge variant="sage" className="text-xs">Free</Badge>
          </div>
        )}
        {isApplied && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Applied
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-1">{template.title}</h3>
          {!isFree && (
            <span className="text-sm font-bold text-primary shrink-0">
              {formatCurrency(template.price_cents)}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-3">
          {template.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Wand2 className="h-3 w-3" />
            {template.download_count.toLocaleString()} applied
          </span>
          {template.rating_average && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {template.rating_average.toFixed(1)} ({template.rating_count})
            </span>
          )}
        </div>

        <Button
          variant={isApplied ? "outline" : canApply ? "gradient" : "outline"}
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={onApply}
          disabled={isApplying || isApplied}
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Applied to your planner
            </>
          ) : isApplying ? (
            <>
              <span className="animate-spin">✨</span>
              Applying...
            </>
          ) : canApply ? (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              Use this template
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Buy • {formatCurrency(template.price_cents)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

const CATEGORY_EMOJI: Record<string, string> = {
  weekly: "📅",
  daily: "☀️",
  monthly: "🗓️",
  goal: "🎯",
  habit: "🌿",
  journal: "📓",
  vision_board: "✨",
};
