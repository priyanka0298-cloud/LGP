"use client";

import React, { useState } from "react";
import { Users, CheckSquare, CreditCard, TrendingUp, Shield, Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { PlannerTemplate } from "@/types";

interface AdminDashboardProps {
  stats: { users: number; tasks: number; premium: number; conversionRate: number };
  recentUsers: Array<{ id: string; email: string; full_name: string | null; created_at: string; onboarding_completed: boolean }>;
  templates: PlannerTemplate[];
}

const CATEGORIES = ["weekly", "daily", "monthly", "goal", "habit", "journal", "vision_board"];

const emptyForm = {
  title: "", description: "", category: "weekly", price_cents: 0,
  file_url: "", tags: "", is_featured: false, is_published: true,
};

type Tab = "overview" | "templates";

export function AdminDashboard({ stats, recentUsers, templates: initialTemplates }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [templates, setTemplates] = useState(initialTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(t: PlannerTemplate) {
    setForm({
      title: t.title,
      description: t.description ?? "",
      category: t.category,
      price_cents: t.price_cents,
      file_url: t.file_url ?? "",
      tags: (t.tags ?? []).join(", "),
      is_featured: t.is_featured,
      is_published: t.is_published,
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price_cents: Math.max(0, Number(form.price_cents)),
      file_url: form.file_url.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      is_featured: form.is_featured,
      is_published: form.is_published,
    };

    if (editingId) {
      const { data, error } = await supabase.from("planner_templates").update(payload).eq("id", editingId).select().single();
      if (error) { toast.error("Couldn't save."); } else {
        setTemplates(prev => prev.map(t => t.id === editingId ? data as PlannerTemplate : t));
        toast.success("Template updated ✨");
        setShowForm(false);
      }
    } else {
      const { data, error } = await supabase.from("planner_templates").insert(payload).select().single();
      if (error) { toast.error("Couldn't create template."); } else {
        setTemplates(prev => [data as PlannerTemplate, ...prev]);
        toast.success("Template created 🌸");
        setShowForm(false);
      }
    }
    setSaving(false);
  }

  async function togglePublished(t: PlannerTemplate) {
    const { error } = await supabase.from("planner_templates").update({ is_published: !t.is_published }).eq("id", t.id);
    if (!error) setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_published: !x.is_published } : x));
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template? This can't be undone.")) return;
    const { error } = await supabase.from("planner_templates").delete().eq("id", id);
    if (error) { toast.error("Couldn't delete."); }
    else { setTemplates(prev => prev.filter(t => t.id !== id)); toast.success("Deleted."); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/30">
            <Shield className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Platform overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["overview", "templates"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all capitalize",
                tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
              {t === "templates" ? `Templates (${templates.length})` : t}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Users", value: stats.users.toLocaleString(), icon: Users, color: "text-blue-500" },
              { label: "Total Tasks", value: stats.tasks.toLocaleString(), icon: CheckSquare, color: "text-emerald-500" },
              { label: "Premium Users", value: stats.premium.toLocaleString(), icon: CreditCard, color: "text-rose-500" },
              { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-purple-500" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-5">
                  <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Signups</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{user.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.onboarding_completed
                        ? <Badge variant="sage" className="text-xs">Onboarded</Badge>
                        : <Badge variant="outline" className="text-xs">Pending</Badge>}
                      <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "templates" && (
        <div className="space-y-4">
          {/* Add / edit form */}
          {showForm && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">{editingId ? "Edit Template" : "New Template"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Weekly Soft Planner" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A short description..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (cents) — 0 for free</Label>
                    <Input type="number" min={0} value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: Number(e.target.value) }))} placeholder="0" />
                    {form.price_cents > 0 && <p className="text-xs text-muted-foreground">= {formatCurrency(form.price_cents)}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tags (comma-separated)</Label>
                    <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="weekly, minimal, free" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>File URL (optional — PDF, Notion link, etc.)</Label>
                    <Input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                      <span className="text-sm">Featured (Staff Pick)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={save} disabled={saving} size="sm">
                    {saving ? "Saving..." : editingId ? "Save changes" : "Create template"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{templates.length} templates · {templates.filter(t => t.is_published).length} published</p>
            {!showForm && (
              <Button size="sm" onClick={startCreate} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add template
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    {t.is_featured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                    <Badge variant="outline" className="text-[10px] capitalize">{t.category.replace("_", " ")}</Badge>
                    {t.price_cents === 0
                      ? <Badge variant="sage" className="text-[10px]">Free</Badge>
                      : <Badge variant="soft" className="text-[10px]">{formatCurrency(t.price_cents)}</Badge>}
                    {!t.is_published && <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublished(t)} title={t.is_published ? "Unpublish" : "Publish"}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    {t.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => startEdit(t)} title="Edit"
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteTemplate(t.id)} title="Delete"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
