export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          pronouns: string | null;
          bio: string | null;
          theme: "light" | "dark" | "auto";
          accent_color: "rose" | "lavender" | "peach" | "sage" | "sky";
          planning_style: "minimal" | "balanced" | "detailed";
          onboarding_completed: boolean;
          onboarding_step: number;
          cycle_tracking_enabled: boolean;
          cycle_length: number | null;
          last_period_date: string | null;
          avg_cycle_length: number;
          avg_period_length: number;
          daily_reminder_enabled: boolean;
          daily_reminder_time: string;
          weekly_review_day: number;
          push_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          pronouns?: string | null;
          bio?: string | null;
          theme?: "light" | "dark" | "auto";
          accent_color?: "rose" | "lavender" | "peach" | "sage" | "sky";
          planning_style?: "minimal" | "balanced" | "detailed";
          onboarding_completed?: boolean;
          onboarding_step?: number;
          cycle_tracking_enabled?: boolean;
          push_enabled?: boolean;
        };
        Update: {
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          pronouns?: string | null;
          bio?: string | null;
          theme?: "light" | "dark" | "auto";
          accent_color?: "rose" | "lavender" | "peach" | "sage" | "sky";
          planning_style?: "minimal" | "balanced" | "detailed";
          onboarding_completed?: boolean;
          onboarding_step?: number;
          cycle_tracking_enabled?: boolean;
          cycle_length?: number | null;
          last_period_date?: string | null;
          avg_cycle_length?: number;
          avg_period_length?: number;
          daily_reminder_enabled?: boolean;
          daily_reminder_time?: string;
          weekly_review_day?: number;
          push_enabled?: boolean;
        };
        Relationships: [];
      };
      period_logs: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string | null;
          flow_intensity: "spotting" | "light" | "medium" | "heavy" | null;
          symptoms: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date?: string | null;
          flow_intensity?: "spotting" | "light" | "medium" | "heavy" | null;
          symptoms?: string[];
          notes?: string | null;
        };
        Update: {
          end_date?: string | null;
          flow_intensity?: "spotting" | "light" | "medium" | "heavy" | null;
          symptoms?: string[];
          notes?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan: "free" | "premium" | "lifetime";
          status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
          trial_end: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan?: "free" | "premium" | "lifetime";
          status?: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          trial_end?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan?: "free" | "premium" | "lifetime";
          status?: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
          trial_end?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: "must_do" | "should_do" | "if_energy" | "someday";
          priority: number;
          status: "pending" | "in_progress" | "done" | "skipped" | "rolled_over";
          completed_at: string | null;
          due_date: string | null;
          due_time: string | null;
          scheduled_date: string | null;
          time_block_start: string | null;
          time_block_end: string | null;
          estimated_minutes: number | null;
          actual_minutes: number | null;
          tags: string[];
          color: string | null;
          emoji: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          parent_task_id: string | null;
          from_brain_dump: boolean;
          ai_generated: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          category?: "must_do" | "should_do" | "if_energy" | "someday";
          priority?: number;
          status?: "pending" | "in_progress" | "done" | "skipped" | "rolled_over";
          completed_at?: string | null;
          due_date?: string | null;
          scheduled_date?: string | null;
          tags?: string[];
          color?: string | null;
          emoji?: string | null;
          is_recurring?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: "must_do" | "should_do" | "if_energy" | "someday";
          priority?: number;
          status?: "pending" | "in_progress" | "done" | "skipped" | "rolled_over";
          completed_at?: string | null;
          due_date?: string | null;
          scheduled_date?: string | null;
          time_block_start?: string | null;
          time_block_end?: string | null;
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          tags?: string[];
          sort_order?: number;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          emoji: string | null;
          color: string;
          frequency: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
          frequency_days: number[] | null;
          target_count: number;
          streak_current: number;
          streak_longest: number;
          total_completions: number;
          category: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          emoji?: string | null;
          color?: string;
          frequency?: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
          frequency_days?: number[] | null;
          target_count?: number;
          category?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          emoji?: string | null;
          color?: string;
          frequency?: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
          streak_current?: number;
          streak_longest?: number;
          total_completions?: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          count: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          habit_id: string;
          user_id: string;
          completed_date: string;
          count?: number;
          note?: string | null;
        };
        Update: {
          count?: number;
          note?: string | null;
        };
        Relationships: [];
      };
      moods: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood_score: number | null;
          mood_emoji: string | null;
          mood_label: string | null;
          energy_level: number | null;
          note: string | null;
          tags: string[];
          cycle_phase: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          mood_score?: number | null;
          mood_emoji?: string | null;
          mood_label?: string | null;
          energy_level?: number | null;
          note?: string | null;
          tags?: string[];
          cycle_phase?: string | null;
        };
        Update: {
          mood_score?: number | null;
          mood_emoji?: string | null;
          mood_label?: string | null;
          energy_level?: number | null;
          note?: string | null;
          tags?: string[];
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          entry_type: "daily" | "weekly_reflection" | "monthly_reflection" | "free_write" | "gratitude" | "brain_dump";
          title: string | null;
          content: Json;
          mood_snapshot: number | null;
          energy_snapshot: number | null;
          ai_summary: string | null;
          ai_insights: string | null;
          is_private: boolean;
          is_pinned: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entry_date: string;
          entry_type?: "daily" | "weekly_reflection" | "monthly_reflection" | "free_write" | "gratitude" | "brain_dump";
          title?: string | null;
          content?: Json;
          mood_snapshot?: number | null;
          energy_snapshot?: number | null;
          is_private?: boolean;
          is_pinned?: boolean;
          tags?: string[];
        };
        Update: {
          entry_type?: "daily" | "weekly_reflection" | "monthly_reflection" | "free_write" | "gratitude" | "brain_dump";
          title?: string | null;
          content?: Json;
          mood_snapshot?: number | null;
          energy_snapshot?: number | null;
          ai_summary?: string | null;
          ai_insights?: string | null;
          is_private?: boolean;
          is_pinned?: boolean;
          tags?: string[];
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          why: string | null;
          vision_note: string | null;
          category: string;
          time_horizon: string;
          target_date: string | null;
          status: "active" | "paused" | "achieved" | "released";
          progress_percent: number;
          emoji: string | null;
          color: string | null;
          is_pinned: boolean;
          sort_order: number;
          ai_steps: Json | null;
          achieved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          why?: string | null;
          category?: string;
          time_horizon?: string;
          target_date?: string | null;
          status?: "active" | "paused" | "achieved" | "released";
          progress_percent?: number;
          emoji?: string | null;
          color?: string | null;
          is_pinned?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          why?: string | null;
          status?: "active" | "paused" | "achieved" | "released";
          progress_percent?: number;
          emoji?: string | null;
          is_pinned?: boolean;
          ai_steps?: Json | null;
          achieved_at?: string | null;
        };
        Relationships: [];
      };
      weekly_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          week_end: string;
          theme: string | null;
          intention: string | null;
          big_three: string[];
          energy_forecast: string | null;
          reflection_done: boolean;
          reflection_content: Json | null;
          ai_suggestion: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          week_start: string;
          week_end: string;
          theme?: string | null;
          intention?: string | null;
          big_three?: string[];
          energy_forecast?: string | null;
          reflection_done?: boolean;
          status?: string;
        };
        Update: {
          theme?: string | null;
          intention?: string | null;
          big_three?: string[];
          energy_forecast?: string | null;
          reflection_done?: boolean;
          reflection_content?: Json | null;
          ai_suggestion?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          generation_type: string;
          input_data: Json | null;
          output_data: Json | null;
          tokens_used: number | null;
          model_used: string | null;
          user_rating: number | null;
          user_feedback: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          generation_type: string;
          input_data?: Json | null;
          output_data?: Json | null;
          tokens_used?: number | null;
          model_used?: string | null;
        };
        Update: {
          user_rating?: number | null;
          user_feedback?: string | null;
        };
        Relationships: [];
      };
      planner_templates: {
        Row: {
          id: string;
          creator_id: string | null;
          title: string;
          description: string | null;
          long_description: string | null;
          category: string;
          tags: string[];
          preview_images: string[] | null;
          file_url: string | null;
          file_type: string;
          file_size_kb: number | null;
          price_cents: number;
          stripe_price_id: string | null;
          download_count: number;
          rating_average: number | null;
          rating_count: number;
          is_published: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          category: string;
          creator_id?: string | null;
          description?: string | null;
          long_description?: string | null;
          tags?: string[];
          preview_images?: string[] | null;
          file_url?: string | null;
          file_type?: string;
          price_cents?: number;
          stripe_price_id?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          long_description?: string | null;
          tags?: string[];
          preview_images?: string[] | null;
          file_url?: string | null;
          price_cents?: number;
          download_count?: number;
          rating_average?: number | null;
          rating_count?: number;
          is_published?: boolean;
          is_featured?: boolean;
        };
        Relationships: [];
      };
      template_purchases: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          stripe_payment_intent_id: string | null;
          amount_cents: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          template_id: string;
          stripe_payment_intent_id?: string | null;
          amount_cents?: number | null;
        };
        Update: {
          stripe_payment_intent_id?: string | null;
          amount_cents?: number | null;
        };
        Relationships: [];
      };
      focus_rooms: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          focus_topic: string | null;
          is_public: boolean;
          max_participants: number;
          duration_minutes: number;
          status: string;
          started_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          creator_id: string;
          name: string;
          description?: string | null;
          focus_topic?: string | null;
          is_public?: boolean;
          max_participants?: number;
          duration_minutes?: number;
        };
        Update: {
          name?: string;
          status?: string;
          started_at?: string | null;
          ends_at?: string | null;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_email: string;
          referred_user_id: string | null;
          referral_code: string;
          status: string;
          reward_granted: boolean;
          reward_type: string | null;
          created_at: string;
          converted_at: string | null;
        };
        Insert: {
          referrer_id: string;
          referred_email: string;
          referral_code: string;
          status?: string;
        };
        Update: {
          referred_user_id?: string | null;
          status?: string;
          reward_granted?: boolean;
          converted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
