import type { TemplateConfig } from "@/types";

// Keyed by exact template title from the DB
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "The Softlivi Weekly Reset": {
    habits: [
      { name: "Weekly intention setting", emoji: "🌸", frequency: "weekly", category: "mindset" },
      { name: "Plan my week (15 min Sunday)", emoji: "📅", frequency: "weekly", category: "planning" },
      { name: "Weekly self-care ritual", emoji: "💆", frequency: "weekly", category: "self_care" },
      { name: "Celebrate one small win", emoji: "🎉", frequency: "weekly", category: "mindset" },
    ],
    tasks: [
      { title: "Write down 3 priorities for the week", category: "must_do", emoji: "🎯" },
      { title: "Block off time for something I enjoy", category: "must_do", emoji: "🌈" },
      { title: "Clear my inbox + to-do pile (no pressure, just a look)", category: "should_do", emoji: "📬" },
    ],
    welcome_message: "Your Softlivi Weekly Reset is live! 4 weekly habits and 3 gentle tasks added. Take it one step at a time. 🌸",
  },

  "Daily Soft Life Planner": {
    habits: [
      { name: "Morning gratitude (3 things)", emoji: "☀️", frequency: "daily", category: "mindset" },
      { name: "Drink water before coffee", emoji: "💧", frequency: "daily", category: "wellness" },
      { name: "Set 1 intention for today", emoji: "🌟", frequency: "daily", category: "mindset" },
      { name: "Evening wind-down routine", emoji: "🌙", frequency: "daily", category: "self_care" },
    ],
    tasks: [
      { title: "Set your one thing for today", category: "must_do", emoji: "⭐" },
      { title: "Do one thing for future you", category: "should_do", emoji: "🌱" },
    ],
    welcome_message: "Your Daily Soft Life Planner is ready! 4 habits added to help you start and end each day with ease. 🌿",
  },

  "Monthly Goal Setting Ritual": {
    habits: [
      { name: "Review monthly goals (weekly check-in)", emoji: "🎯", frequency: "weekly", category: "goals" },
      { name: "Monthly brain dump", emoji: "🧠", frequency: "weekly", category: "planning" },
      { name: "Celebrate a monthly milestone", emoji: "🎊", frequency: "weekly", category: "mindset" },
    ],
    tasks: [
      { title: "Define my top 3 goals for this month", category: "must_do", emoji: "🌟" },
      { title: "Break goal 1 into weekly actions", category: "must_do", emoji: "🗓️" },
      { title: "Schedule a monthly reflection date with myself", category: "should_do", emoji: "📅" },
      { title: "Identify 1 thing to stop doing this month", category: "should_do", emoji: "🚫" },
    ],
    welcome_message: "Your monthly ritual is set! 3 habits and 4 tasks to help you plan gently and intentionally. 🌙",
  },

  "Burnout Recovery Planner": {
    habits: [
      { name: "Rest without guilt (10+ min)", emoji: "🛌", frequency: "daily", category: "wellness" },
      { name: "One small act of nourishment", emoji: "🫶", frequency: "daily", category: "self_care" },
      { name: "Check in with my energy before saying yes", emoji: "🔋", frequency: "daily", category: "mindset" },
      { name: "Log one thing that restored me today", emoji: "💜", frequency: "daily", category: "mindset" },
    ],
    tasks: [
      { title: "Cancel or postpone one non-essential commitment", category: "must_do", emoji: "🚫" },
      { title: "Identify my top 3 energy drains", category: "must_do", emoji: "🔍" },
      { title: "Schedule 30 min of doing literally nothing", category: "should_do", emoji: "☁️" },
      { title: "Reach out to one person who energizes me", category: "if_energy", emoji: "💌" },
    ],
    welcome_message: "Your burnout recovery space is ready. No rush, no pressure. Start with just the rest habit. 💜",
  },

  "Vision Board Digital Kit": {
    habits: [
      { name: "Visualize my dream life (5 min)", emoji: "✨", frequency: "daily", category: "mindset" },
      { name: "Daily affirmations", emoji: "💬", frequency: "daily", category: "mindset" },
      { name: "One action toward my vision", emoji: "🌟", frequency: "daily", category: "goals" },
    ],
    tasks: [
      { title: "Write out my dream life in full detail", category: "must_do", emoji: "📝" },
      { title: "Identify 3 life areas to focus on", category: "must_do", emoji: "🎯" },
      { title: "Find images or words that represent your vision", category: "should_do", emoji: "🖼️" },
      { title: "Set one concrete goal toward the vision", category: "must_do", emoji: "🌱" },
    ],
    welcome_message: "Your Vision Board Kit is live! 3 daily habits and 4 tasks to get clear on what you really want. ✨",
  },

  "ADHD-Friendly Habit Tracker": {
    habits: [
      { name: "Body doubling session (work/study with someone)", emoji: "🧑‍💻", frequency: "daily", category: "focus" },
      { name: "2-minute tidy before bed", emoji: "🧹", frequency: "daily", category: "home" },
      { name: "Take meds / vitamins", emoji: "💊", frequency: "daily", category: "wellness" },
      { name: "Drink water (set alarm if needed)", emoji: "💧", frequency: "daily", category: "wellness" },
      { name: "One thing, then celebrate", emoji: "🎯", frequency: "daily", category: "focus" },
      { name: "Prep tomorrow's outfit or bag", emoji: "👜", frequency: "daily", category: "planning" },
    ],
    tasks: [
      { title: "Write today's ONE most important task", category: "must_do", emoji: "⭐" },
      { title: "Set a timer for 25 min and start (don't finish, just start)", category: "must_do", emoji: "⏱️" },
      { title: "Text a friend your plan for accountability", category: "should_do", emoji: "📱" },
    ],
    welcome_message: "Your ADHD-friendly tracker is set! 6 small habits — pick 1–2 to start. You've got this. 💜",
  },

  "Weekly Soft Planner": {
    habits: [
      { name: "Sunday evening reset", emoji: "🌙", frequency: "weekly", category: "planning" },
      { name: "Weekly self-care check-in", emoji: "💆", frequency: "weekly", category: "self_care" },
      { name: "Move my body once this week", emoji: "🚶", frequency: "weekly", category: "wellness" },
    ],
    tasks: [
      { title: "Set 3 intentions for the week", category: "must_do", emoji: "🌸" },
      { title: "Choose a word or theme for the week", category: "should_do", emoji: "✨" },
      { title: "Schedule one restorative activity", category: "must_do", emoji: "🫁" },
    ],
    welcome_message: "Your Weekly Soft Planner is ready! Gentle habits and a few simple tasks to ease into the week. 🌿",
  },

  "Daily Reset Template": {
    habits: [
      { name: "Morning check-in (how am I actually feeling?)", emoji: "🌅", frequency: "daily", category: "mindset" },
      { name: "5-minute tidy", emoji: "🧹", frequency: "daily", category: "home" },
      { name: "Unplug 30 min before bed", emoji: "📵", frequency: "daily", category: "wellness" },
    ],
    tasks: [
      { title: "Identify today's single most important task", category: "must_do", emoji: "⭐" },
      { title: "Clear yesterday's mental load (quick brain dump)", category: "must_do", emoji: "🧠" },
      { title: "Do something restorative by 8 PM", category: "should_do", emoji: "🌙" },
    ],
    welcome_message: "Your Daily Reset is loaded! 3 habits and 3 tasks to help you show up for yourself each day. 🌸",
  },

  "Habit Tracker Bundle": {
    habits: [
      { name: "Morning movement (10 min)", emoji: "🧘", frequency: "daily", category: "wellness" },
      { name: "Read before bed (15 min)", emoji: "📚", frequency: "daily", category: "growth" },
      { name: "No phone first 30 min", emoji: "📵", frequency: "daily", category: "mindset" },
      { name: "Prep tomorrow tonight", emoji: "📝", frequency: "daily", category: "planning" },
      { name: "One kind thing for myself", emoji: "💝", frequency: "daily", category: "self_care" },
      { name: "Connect with someone I love", emoji: "🫂", frequency: "weekly", category: "relationships" },
    ],
    tasks: [
      { title: "Pick ONE habit to focus on first — add the rest slowly", category: "must_do", emoji: "🎯" },
      { title: "Set a daily reminder for your chosen habit", category: "must_do", emoji: "🔔" },
    ],
    welcome_message: "Your Habit Bundle is loaded with 6 habits. Start with just ONE — let it stick before adding more. 🌿",
  },

  "Monthly Overview & Goals": {
    habits: [
      { name: "Weekly review of monthly goals", emoji: "📊", frequency: "weekly", category: "goals" },
      { name: "Monthly spending check-in", emoji: "💰", frequency: "weekly", category: "finance" },
      { name: "End-of-month celebration ritual", emoji: "🎊", frequency: "weekly", category: "mindset" },
    ],
    tasks: [
      { title: "Write this month's theme in one word", category: "must_do", emoji: "✨" },
      { title: "Set financial intention for the month", category: "must_do", emoji: "💰" },
      { title: "List 3 wins from last month", category: "must_do", emoji: "🏆" },
      { title: "Identify one thing to let go of this month", category: "should_do", emoji: "🍃" },
    ],
    welcome_message: "Your Monthly Overview is ready! 3 weekly habits and 4 reflective tasks to start the month right. 🌙",
  },

  "Goal Setting Workbook": {
    habits: [
      { name: "Review my top goal (2 min daily)", emoji: "🎯", frequency: "daily", category: "goals" },
      { name: "Weekly progress check-in", emoji: "📊", frequency: "weekly", category: "goals" },
      { name: "Celebrate a small win toward my goal", emoji: "🎉", frequency: "weekly", category: "mindset" },
    ],
    tasks: [
      { title: "Write my #1 goal in one clear sentence", category: "must_do", emoji: "🌟" },
      { title: "List 3 obstacles and how I'll handle them", category: "must_do", emoji: "🧱" },
      { title: "Identify my 'why' behind this goal", category: "must_do", emoji: "💜" },
      { title: "Break the goal into 4 monthly milestones", category: "should_do", emoji: "🗓️" },
    ],
    welcome_message: "Your Goal Setting Workbook is live! 3 habits and 4 tasks to help you pursue goals without the hustle pressure. 🎯",
  },

  "Brain Dump to Action Plan": {
    habits: [
      { name: "Daily brain dump (5 min)", emoji: "🧠", frequency: "daily", category: "mindset" },
      { name: "Weekly sort + prioritize dump", emoji: "📋", frequency: "weekly", category: "planning" },
    ],
    tasks: [
      { title: "Do a full brain dump right now — everything on your mind", category: "must_do", emoji: "🧠" },
      { title: "Sort the dump into: do, delegate, delete, defer", category: "must_do", emoji: "📋" },
      { title: "Pick the ONE thing from the dump to do today", category: "must_do", emoji: "⭐" },
      { title: "Let go of at least 3 items from the list", category: "should_do", emoji: "🍃" },
    ],
    welcome_message: "Your Brain Dump space is ready. Start by dumping everything out — then we'll sort it together. 🧠✨",
  },

  "Vision Board Workbook": {
    habits: [
      { name: "Morning visualization (5 min)", emoji: "✨", frequency: "daily", category: "mindset" },
      { name: "Write one thing I'm calling in", emoji: "💌", frequency: "daily", category: "mindset" },
      { name: "Weekly vision review", emoji: "🔍", frequency: "weekly", category: "goals" },
    ],
    tasks: [
      { title: "Write my vision in 5 years — no limits", category: "must_do", emoji: "🌟" },
      { title: "Choose 3 life domains to focus on (career, health, love, etc.)", category: "must_do", emoji: "🎯" },
      { title: "Collect 10 images or words that match your vision", category: "should_do", emoji: "🖼️" },
      { title: "Write one affirmation per domain", category: "should_do", emoji: "💬" },
    ],
    welcome_message: "Your Vision Board Workbook is set! 3 habits and 4 tasks to help you get crystal clear on your dream life. ✨",
  },

  "Soft Life Weekly Spread": {
    habits: [
      { name: "Sunday soft reset ritual", emoji: "🛁", frequency: "weekly", category: "self_care" },
      { name: "Weekly joy check-in", emoji: "💜", frequency: "weekly", category: "mindset" },
      { name: "Schedule something to look forward to", emoji: "🌈", frequency: "weekly", category: "self_care" },
    ],
    tasks: [
      { title: "Plan one thing per day that brings ease", category: "must_do", emoji: "🌿" },
      { title: "Set a boundary around one draining thing this week", category: "must_do", emoji: "🚧" },
      { title: "Add a non-negotiable rest block to your schedule", category: "must_do", emoji: "🛌" },
      { title: "Write about what 'soft life' means to you right now", category: "if_energy", emoji: "📝" },
    ],
    welcome_message: "Your Soft Life Weekly Spread is ready! 3 gentle weekly habits and 4 tasks. This week, choose ease. 🌸",
  },
};
