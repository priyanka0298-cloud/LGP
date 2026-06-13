# 🌸 Lazy Girl Planner

> **Plan softly. Live fully.**

A full-stack SaaS digital planning and wellness platform designed for overwhelmed, ambitious women who want structure without burnout. Anti-hustle culture. ADHD-friendly. Emotionally intelligent.

---

## ✨ Features

### Core App
- **Weekly Planner** — Lazy Girl framework: Must Do / Should Do / If I Have Energy
- **Daily Planning Pages** — Top 3 priorities, brain dump, mood + energy tracking, habit tracker, gratitude, "what can wait?" section
- **Habit Tracker** — Streak tracking, no-shame resets, dopamine-friendly progress
- **Journal & Reflection** — Daily pages, weekly/monthly reflection prompts, free write
- **Goal Setting** — Set goals with your "why", AI breaks them into tiny steps
- **Mood Analytics** — 30-day trends, mood × productivity correlation, burnout indicators

### AI Features (OpenAI GPT-4o-mini)
- **Brain Dump → Task List** — Converts messy thoughts into organized, gentle tasks
- **Task Prioritization** — Energy-aware, compassionate prioritization
- **Daily Schedule** — Realistic time blocking with built-in breaks
- **Goal Breakdown** — Turns big goals into tiny, achievable steps
- **Daily Affirmations** — Context-aware, non-cheesy morning messages
- **Burnout Check** — Pattern detection with gentle nudges
- **Low Energy Mode** — Micro-task planning for rough days
- **Romanticize Life Mode** — Makes ordinary days feel magical

### Monetization
- Free tier (5 habits, 3 goals, 5 AI/month)
- Premium subscription (Stripe, $9.99/month or $79.99/year)
- 7-day free trial
- Digital template marketplace (free + paid PDFs)
- Stripe billing portal for self-service management

### Technical
- Full SSR/RSC with Next.js 15 App Router
- Supabase Auth (email + Google OAuth)
- Row Level Security on all tables
- Real-time capable (Supabase subscriptions)
- PWA with offline support
- Dark/light mode
- Mobile responsive
- Framer Motion animations throughout

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Stripe](https://stripe.com) account

### 1. Clone & install

```bash
git clone <your-repo>
cd lazy-girl-planner
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see `.env.example` for reference).

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Optionally run `supabase/seed.sql` for sample marketplace templates
4. Enable **Google OAuth** in Authentication → Providers (optional)
5. Set your **Site URL** and **Redirect URLs** in Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URL: `http://localhost:3000/auth/callback`

### 4. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Create two products in the Stripe dashboard:
   - **Premium Monthly** — recurring, $9.99/month
   - **Premium Annual** — recurring, $79.99/year
3. Copy the Price IDs into your `.env.local`
4. Set up a webhook endpoint pointing to `your-url/api/stripe/webhook`
   - Events to listen for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

For local webhook testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` 🌸

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, onboarding
│   ├── (dashboard)/         # Protected app pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── planner/         # Weekly planner
│   │   ├── journal/         # Journal & reflections
│   │   ├── analytics/       # Mood & productivity analytics
│   │   ├── marketplace/     # Template marketplace
│   │   └── settings/        # User settings
│   ├── (admin)/             # Admin panel (role-gated)
│   ├── api/
│   │   ├── ai/              # OpenAI endpoints
│   │   └── stripe/          # Stripe checkout, webhooks, portal
│   ├── auth/callback/       # Supabase OAuth callback
│   ├── pricing/             # Pricing page
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── shared/              # Sidebar, Topbar, ThemeProvider
│   ├── dashboard/           # Dashboard-specific components
│   ├── planner/             # Planner components
│   ├── journal/             # Journal components
│   ├── analytics/           # Chart components
│   ├── marketplace/         # Template marketplace
│   ├── settings/            # Settings panels
│   ├── admin/               # Admin dashboard
│   └── landing/             # Marketing landing page
├── hooks/                   # useAuth, useTasks, etc.
├── lib/
│   ├── supabase/            # client.ts, server.ts
│   ├── stripe/              # Stripe client
│   ├── openai/              # OpenAI client + prompt library
│   └── utils.ts             # Utility functions
├── store/                   # Zustand state (plannerStore)
├── types/                   # TypeScript types + database schema
└── middleware.ts             # Auth redirect middleware

supabase/
├── migrations/
│   └── 001_initial_schema.sql   # Complete DB schema
└── seed.sql                     # Sample marketplace templates
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | Extended user profiles, preferences, onboarding state |
| `subscriptions` | Stripe subscription data, plan tier |
| `tasks` | Tasks with category (must_do/should_do/if_energy/someday), scheduling, recurrence |
| `habits` | Habits with frequency, streak tracking |
| `habit_completions` | Daily habit check-ins |
| `moods` | Daily mood + energy tracking with cycle phase support |
| `journal_entries` | Daily pages, weekly/monthly reflections, free writes |
| `goals` | Goals with "why", timeline, AI-generated steps |
| `weekly_plans` | Weekly theme, intention, big-three goals |
| `ai_generations` | AI generation history + token usage |
| `planner_templates` | Marketplace templates (free + paid) |
| `template_purchases` | Stripe purchase records for templates |
| `focus_rooms` | Body doubling / co-working rooms |
| `referrals` | Referral tracking |

All tables have **Row Level Security** enabled. Users can only access their own data.

---

## 🤖 AI Architecture

All AI prompts live in `src/lib/openai/prompts.ts` with a carefully engineered system persona:

- **Compassionate tone** — Never shame, never guilt
- **ADHD-aware** — Short, actionable, dopamine-friendly outputs
- **Energy-conscious** — Adapts suggestions to user's stated energy
- **Anti-hustle** — Always suggests rest, never aggressive productivity
- **Realistic** — Deliberately caps "must do" items at 3

### Prompt types
```
brain_dump → organized gentle task list
task_prioritization → energy-aware reordering
affirmation → context-specific daily message
schedule_suggestion → realistic time blocks with breaks
goal_breakdown → tiny achievable steps
burnout_check → pattern detection + gentle observations
weekly_reset → personalized new-week ritual
low_energy_mode → micro-task planning for hard days
romanticize_life → transform mundane tasks into beautiful moments
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

```bash
# Or via CLI
npx vercel --prod
```

### Environment variables for production
All variables from `.env.example` are required. Set them in your hosting provider's dashboard.

Make sure to:
- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Update Supabase redirect URLs to include your production domain
- Update Stripe webhook endpoint to your production URL

### Supabase production checklist
- [ ] Enable email confirmations in Auth settings
- [ ] Set up custom SMTP for emails (optional but recommended)
- [ ] Enable database backups
- [ ] Set row-level security policies (already in migration)
- [ ] Configure storage bucket policies if using file uploads

---

## 🎨 Design System

### Colors
- **Rose** `#f43f6e` — Primary brand, must-do tasks
- **Lavender** `#a78bfa` — Secondary, should-do tasks
- **Peach** `#fdba74` — Accent, warm touches
- **Sage** `#4ade80` — Success, if-energy tasks
- **Sky** `#38bdf8` — Info, calm elements

### Typography
- **Display**: Playfair Display — headings, brand moments
- **Body**: Inter — all body text, UI elements

### Key design principles
- `rounded-2xl` / `rounded-3xl` cards throughout
- `shadow-soft` for cards, `shadow-glow` for primary actions
- Soft gradients on key sections
- Framer Motion for all transitions (respects `prefers-reduced-motion`)
- Empty states always friendly, never blank

---

## 🧪 Adding Features

### Add a new AI prompt
1. Add your prompt constant in `src/lib/openai/prompts.ts`
2. Add a route in `src/app/api/ai/your-feature/route.ts`
3. Update `ai_generations.generation_type` check constraint in SQL

### Add a new page
1. Create `src/app/(dashboard)/your-page/page.tsx`
2. Add to `NAV_ITEMS` in `src/components/shared/Sidebar.tsx`
3. Fetch data server-side and pass to a client component

### Add a new Stripe product
1. Create in Stripe dashboard
2. Add Price ID to `.env.local`
3. Handle in webhook (`src/app/api/stripe/webhook/route.ts`)

---

## 📖 Philosophy

This app is built on the belief that **productivity tools should serve you, not shame you**. Every design decision asks: *does this make users feel better or worse about themselves?*

Key principles:
- No streak-shaming notifications
- "Good enough" is explicitly celebrated
- Rest is framed as productive, not as failure
- ADHD users are the design target, not an edge case
- Low-energy days are anticipated and planned for, not ignored

---

## 🤝 Contributing

PRs welcome. Please respect the anti-hustle philosophy in any copy changes — no aggressive productivity language, no guilt-based UX patterns.

---

*Made with 💜 for women who are doing their best*
