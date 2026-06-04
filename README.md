# FitLog Pro — Full Stack Fitness Trainer System

## Stack
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Auth**: JWT (access + refresh tokens)
- **DB**: PostgreSQL

## Roles
- `admin` — Trainer/Admin: full access
- `member` — Client: view own data

## Quick Start

```bash
# 1. Clone & install
cd backend && npm install
cd ../frontend && npm install

# 2. Configure env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start DB (Docker)
docker-compose up -d db

# 4. Run migrations
cd backend && npm run migration:run

# 5. Start dev
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Project Structure

```
fitlog-pro/
├── docker-compose.yml
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT auth
│   │   ├── users/              # User management
│   │   ├── members/            # Member profiles
│   │   ├── sessions/           # Training sessions
│   │   ├── programs/           # Workout programs
│   │   ├── exercises/          # Exercise library
│   │   ├── workout-logs/       # Workout logging
│   │   ├── nutrition/          # TDEE/Macros
│   │   ├── calendar/           # Calendar events
│   │   └── database/           # TypeORM entities & migrations
│   └── ...
└── frontend/                   # Next.js App
    ├── app/
    │   ├── (auth)/             # Login page
    │   ├── admin/              # Admin dashboard
    │   │   ├── members/        # Member management
    │   │   ├── calendar/       # Calendar view
    │   │   ├── programs/       # Program builder
    │   │   └── nutrition/      # TDEE calculator
    │   └── member/             # Member portal
    ├── components/
    └── lib/
```
