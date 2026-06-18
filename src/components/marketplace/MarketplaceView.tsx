"use client";

import React, { useState } from "react";
import { Star, Filter, Search, Sparkles, Lock, CheckCircle2, Wand2, X, ListChecks, Repeat2, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import type { PlannerTemplate } from "@/types";
import { TEMPLATE_CONFIGS } from "@/lib/template-configs";
import { CustomBundleBuilder } from "./CustomBundleBuilder";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MarketplaceViewProps {
  templates: PlannerTemplate[];
  purchasedIds: Set<string>;
  userId: string | null;
  isPremium: boolean;
}

const CATEGORIES = ["All", "weekly", "daily", "monthly", "goal", "habit", "journal", "vision_board"];

const CATEGORY_EMOJI: Record<string, string> = {
  weekly: "📅",
  daily: "☀️",
  monthly: "🗓️",
  goal: "🎯",
  habit: "🌿",
  journal: "📓",
  vision_board: "✨",
};

export function MarketplaceView({ templates, purchasedIds, userId, isPremium }: MarketplaceViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [unapplying, setUnapplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set(purchasedIds));
  const [preview, setPreview] = useState<PlannerTemplate | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
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
      setPreview(null);
      setTimeout(() => router.push("/planner"), 1500);
    } catch {
      toast.error("Couldn't apply the template. Try again 🌸");
    } finally {
      setApplying(null);
    }
  }

  async function handleUnapply(template: PlannerTemplate) {
    setUnapplying(template.id);
    try {
      const res = await fetch("/api/templates/unapply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong 🌸");
        return;
      }
      setApplied((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
      toast.success(data.message, { duration: 5000 });
      setPreview(null);
      router.refresh();
    } catch {
      toast.error("Couldn't remove the template. Try again 🌸");
    } finally {
      setUnapplying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold">Template Marketplace 🛍️</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Skip the blank page. Each template instantly adds a curated set of habits and tasks to your planner — so instead of starting from scratch, you just pick what fits your life and go.
        </p>
      </div>

      {/* Build Your Own Bundle */}
      <button
        onClick={() => setShowCustomBuilder(true)}
        className="w-full rounded-2xl border border-dashed border-primary/40 bg-gradient-to-r from-rose-50/60 to-purple-50/60 dark:from-rose-950/20 dark:to-purple-950/20 p-4 flex items-center gap-4 hover:border-primary/60 hover:shadow-sm transition-all text-left group"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 shadow-sm">
          <Shuffle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Build Your Own Bundle ✨</p>
          <p className="text-xs text-muted-foreground mt-0.5">Pick any habits from all our templates — mix and match to create your perfect routine</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
      </button>

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
                onPreview={() => setPreview(template)}
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
                onPreview={() => setPreview(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom bundle builder — rendered via portal to escape overflow clipping */}
      {showCustomBuilder && <CustomBundleBuilder onClose={() => setShowCustomBuilder(false)} isPremium={isPremium} />}

      {/* Preview panel */}
      {preview && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          />
          {/* Slide-up panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background border-t border-border shadow-2xl sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-950/40 dark:to-purple-950/40 text-2xl">
                    {CATEGORY_EMOJI[preview.category] ?? "📋"}
                  </div>
                  <div>
                    <h2 className="font-semibold text-base leading-snug">{preview.title}</h2>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{preview.category.replace("_", " ")} template</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-xl p-1.5 hover:bg-muted transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-5">{preview.description}</p>

              {/* What's included */}
              {(() => {
                const cfg = TEMPLATE_CONFIGS[preview.title];
                if (!cfg) return null;
                return (
                <div className="space-y-4 mb-5">
                  {(cfg.habits?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Repeat2 className="h-3.5 w-3.5" />
                        Habits added ({cfg.habits?.length})
                      </p>
                      <div className="space-y-1.5">
                        {(cfg.habits ?? []).map((h, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                            <span>{h.emoji ?? "🌸"}</span>
                            <span>{h.name}</span>
                            <Badge variant="outline" className="ml-auto text-[10px] capitalize">{h.frequency}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(cfg.tasks?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        Tasks added ({cfg.tasks?.length})
                      </p>
                      <div className="space-y-1.5">
                        {(cfg.tasks ?? []).map((t, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                            <span>{t.emoji ?? "✅"}</span>
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}

              {/* Tags */}
              {preview.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-5">
                  {preview.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground capitalize">
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              {/* Apply / Unapply buttons */}
              {applied.has(preview.id) ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Applied to your planner
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleUnapply(preview)}
                    disabled={unapplying === preview.id}
                  >
                    {unapplying === preview.id ? "Removing..." : "Remove this template"}
                  </Button>
                </div>
              ) : !userId ? (
                <Button variant="gradient" className="w-full gap-2" onClick={() => window.location.href = "/signup"}>
                  <Sparkles className="h-4 w-4" />
                  Sign up free to apply this template
                </Button>
              ) : preview.price_cents > 0 ? (
                <Button variant="gradient" className="w-full gap-2" onClick={() => handleApply(preview)}>
                  <Lock className="h-4 w-4" />
                  Buy for {formatCurrency(preview.price_cents)}
                </Button>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Habits go to your Habits list · Tasks land on today&apos;s planner
                  </p>
                  <Button
                    variant="gradient"
                    className="w-full gap-2"
                    onClick={() => handleApply(preview)}
                    disabled={applying === preview.id}
                  >
                    {applying === preview.id ? (
                      <><span className="animate-spin">✨</span> Applying...</>
                    ) : (
                      <><Wand2 className="h-4 w-4" /> Apply this template</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isApplied,
  onPreview,
  featured,
}: {
  template: PlannerTemplate;
  isApplied: boolean;
  onPreview: () => void;
  featured?: boolean;
}) {
  const isFree = template.price_cents === 0;
  const config = TEMPLATE_CONFIGS[template.title];

  return (
    <div
      onClick={onPreview}
      className={cn(
        "rounded-2xl border border-border/50 bg-card overflow-hidden group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all",
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
          <div className="absolute top-2 right-2">
            <Badge className="bg-emerald-500 text-white border-0 text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" /> Applied
            </Badge>
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

        {/* What's inside preview */}
        {config && (
          <div className="flex gap-3 text-xs text-muted-foreground mb-3">
            {(config.habits?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Repeat2 className="h-3 w-3" /> {config.habits?.length} habits
              </span>
            )}
            {(config.tasks?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <ListChecks className="h-3 w-3" /> {config.tasks?.length} tasks
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Wand2 className="h-3 w-3" />
            {template.download_count.toLocaleString()} applied
          </span>
          <span className="flex items-center gap-1 text-primary font-medium">
            Preview <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
