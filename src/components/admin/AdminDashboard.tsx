"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, CheckSquare, CreditCard, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AdminDashboardProps {
  stats: {
    users: number;
    tasks: number;
    premium: number;
    conversionRate: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    onboarding_completed: boolean;
  }>;
}

export function AdminDashboard({ stats, recentUsers }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/30">
          <Shield className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Platform overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: stats.users.toLocaleString(), icon: Users, color: "text-blue-500" },
          { label: "Total Tasks", value: stats.tasks.toLocaleString(), icon: CheckSquare, color: "text-emerald-500" },
          { label: "Premium Users", value: stats.premium.toLocaleString(), icon: CreditCard, color: "text-rose-500" },
          { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-purple-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card>
              <CardContent className="pt-5">
                <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{user.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.onboarding_completed ? (
                    <Badge variant="sage" className="text-xs">Onboarded</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
