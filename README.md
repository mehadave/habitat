# Habit·at 🐬

A habit tracker built around consistency, not guilt. Track your habits, journal your thoughts, and watch your streaks grow — with a deep-navy ocean aesthetic and animated dolphins to keep you company.

**Live app:** [habitat-black.vercel.app](https://habitat-black.vercel.app)

---

## Features

- **Habit tracking** — Add up to 15 habits with emoji, priority, and notes. Tap to complete, view monthly calendar grids per habit
- **Dashboard** — Streak hero, quick-complete chips, winning/losing habit podium, and animated dolphins that swim across your screen
- **Journal** — Brain dump without filter. Categories (Dump, Journal, Vent, Ideas, Frog, To-do), mood tracking, voice dictation, timeline view with draft auto-save
- **Calendar** — Monthly view with per-day completion dots and streak visualization
- **Gamification** — XP system, level progression, streak shields, milestone celebrations
- **Dark/light mode** — Persisted per user, toggle from the profile menu
- **PWA** — Installable on mobile, works offline for cached content

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State | Zustand |
| Data fetching | TanStack Query |
| Backend | Supabase (Postgres + Auth + Storage) |
| Charts | Recharts |
| Routing | React Router v7 |
| Deploy | Vercel |

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/mehadave/habitat.git
cd habitat/web
npm install
```

Copy the env file and fill in your Supabase credentials:

```bash
cp ../.env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the dev server:

```bash
npm run dev
# → http://localhost:5173
```

### Database

Run the migrations in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_category.sql
```

## Project Structure

```
habitat/
├── web/
│   ├── src/
│   │   ├── components/    # NavBar, CommitGrid, DolphinLogo, etc.
│   │   ├── pages/         # Dashboard, Habits, Calendar, Journal, Profile
│   │   ├── hooks/         # useHabits, useJournal, useStreaks, useXP
│   │   ├── store/         # Zustand stores (auth, ui)
│   │   └── lib/           # supabase client, types, utils, quotes
│   └── public/            # PWA icons, manifest
└── supabase/
    └── migrations/        # SQL schema files
```

## License

MIT
