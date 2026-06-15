import type { TemplateConfig } from "@/types";

// Keyed by template title — the apply route reads from here when the DB config column is null.
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "Soft Life Weekly Planner": {
    habits: [
      { name: "Weekly intention setting", emoji: "🌸", frequency: "weekly", category: "mindset" },
      { name: "Plan my week", emoji: "📅", frequency: "weekly", category: "planning" },
      { name: "Weekly self-care ritual", emoji: "💆", frequency: "weekly", category: "self_care" },
    ],
    tasks: [
      { title: "Write down 3 priorities for the week", category: "must_do", emoji: "🎯" },
      { title: "Block time for something I enjoy", category: "must_do", emoji: "🌈" },
    ],
    welcome_message:
      "Your soft life weekly planner is ready! 3 habits and 2 tasks have been added to get you started gently. 🌸",
  },

  "Daily Gentle Reset": {
    habits: [
      { name: "Morning gratitude (3 things)", emoji: "☀️", frequency: "daily", category: "mindset" },
      { name: "Drink water before coffee", emoji: "💧", frequency: "daily", category: "wellness" },
      { name: "5-minute tidy", emoji: "🧹", frequency: "daily", category: "home" },
      { name: "Evening wind-down", emoji: "🌙", frequency: "daily", category: "self_care" },
    ],
    tasks: [
      { title: "Set your one thing for today", category: "must_do", emoji: "⭐" },
      { title: "Do one thing for future you", category: "should_do", emoji: "🌱" },
    ],
    welcome_message:
      "Your daily gentle reset is set up! 4 habits added to help you start and end each day with ease. 🌿",
  },

  "Habit Stack Builder": {
    habits: [
      { name: "Morning movement (10 min)", emoji: "🧘", frequency: "daily", category: "wellness" },
      { name: "Read before bed (15 min)", emoji: "📚", frequency: "daily", category: "growth" },
      { name: "No phone first 30 min", emoji: "📵", frequency: "daily", category: "mindset" },
      { name: "Prep tomorrow tonight", emoji: "📝", frequency: "daily", category: "planning" },
      { name: "One kind thing for myself", emoji: "💝", frequency: "daily", category: "self_care" },
    ],
    tasks: [
      { title: "Pick ONE habit to focus on first — add the rest gradually", category: "must_do", emoji: "🎯" },
    ],
    welcome_message:
      "Your habit stack is loaded! 5 habits added. Start with just one — let it stick before adding more. 🌿",
  },

  "Slow Sunday Journal": {
    habits: [
      { name: "Sunday journaling session", emoji: "📓", frequency: "weekly", category: "mindset" },
      { name: "Weekly reflection", emoji: "🔍", frequency: "weekly", category: "growth" },
      { name: "Prep for the week ahead", emoji: "📅", frequency: "weekly", category: "planning" },
    ],
    tasks: [
      { title: "Write about one thing I'm proud of this week", category: "must_do", emoji: "✨" },
      { title: "Identify one thing to let go of", category: "should_do", emoji: "🍃" },
      { title: "Choose a theme or word for next week", category: "if_energy", emoji: "🌿" },
    ],
    welcome_message:
      "Your Slow Sunday ritual is ready! 3 weekly habits and 3 journal prompts added. Enjoy your gentle Sunday. 🍵",
  },

  "Monthly Money Check-In": {
    habits: [
      { name: "Weekly spending check-in", emoji: "💰", frequency: "weekly", category: "finance" },
      { name: "No-spend challenge day", emoji: "🚫", frequency: "weekly", category: "finance" },
    ],
    tasks: [
      { title: "Review last month spending — no judgment", category: "must_do", emoji: "💳" },
      { title: "Set 1 financial intention for this month", category: "must_do", emoji: "🎯" },
      { title: "Find one subscription to review or cancel", category: "should_do", emoji: "📱" },
    ],
    welcome_message:
      "Your money check-in is ready! No shame, just clarity. 2 weekly habits and 3 tasks to help you feel in control. 💰",
  },

  "Goal Getter Quarterly Roadmap": {
    habits: [
      { name: "Review quarterly goals", emoji: "🎯", frequency: "weekly", category: "goals" },
      { name: "Weekly progress check-in", emoji: "📊", frequency: "weekly", category: "goals" },
      { name: "Celebrate a small win", emoji: "🎉", frequency: "weekly", category: "mindset" },
    ],
    tasks: [
      { title: "Define my top 3 goals for the quarter", category: "must_do", emoji: "🌟" },
      { title: "Break goal 1 into monthly milestones", category: "must_do", emoji: "🗓️" },
      { title: "Schedule a monthly check-in with myself", category: "should_do", emoji: "📅" },
    ],
    welcome_message:
      "Your quarterly roadmap is loaded! 3 habits and 3 starter tasks added. Let's reach those goals, softly. 🎯",
  },

  "Anxiety-Free Morning Routine": {
    habits: [
      { name: "Wake up without snoozing", emoji: "⏰", frequency: "daily", category: "wellness" },
      { name: "10 min gentle movement", emoji: "🧘", frequency: "daily", category: "wellness" },
      { name: "Nourishing breakfast", emoji: "🥣", frequency: "daily", category: "wellness" },
      { name: "Set 1 intention for the day", emoji: "🌟", frequency: "daily", category: "mindset" },
      { name: "3 worries + 3 possible solutions", emoji: "📓", frequency: "daily", category: "mindset" },
    ],
    tasks: [
      { title: "Prep your morning the night before", category: "must_do", emoji: "🌙" },
      { title: "Set a calming alarm tone", category: "should_do", emoji: "⏰" },
    ],
    welcome_message:
      "Your anxiety-free morning is set! 5 habits added to help you start the day grounded. 🌸",
  },

  "Dream Life Vision Board": {
    habits: [
      { name: "Visualize my dream life (5 min)", emoji: "✨", frequency: "daily", category: "mindset" },
      { name: "Daily affirmations", emoji: "💬", frequency: "daily", category: "mindset" },
      { name: "One action toward my dream", emoji: "🌟", frequency: "daily", category: "goals" },
    ],
    tasks: [
      { title: "Write out my dream life in full detail", category: "must_do", emoji: "📝" },
      { title: "Identify 3 life areas to focus on", category: "must_do", emoji: "🎯" },
      { title: "Find images that inspire your vision", category: "if_energy", emoji: "🖼️" },
    ],
    welcome_message:
      "Your dream life template is live! 3 daily habits and 3 tasks to get clear on what you really want. ✨",
  },
};
