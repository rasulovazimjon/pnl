# Personal P&L

Track personal finances like a corporate Profit & Loss statement. Log income
and expenses, categorize them with a chart of accounts, set budgets, define
recurring items, and get a monthly P&L (Revenue − COGS = Gross Profit −
Expenses = Net Profit). Reporting currency: **UZS**. Multi-user (household).

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind 4**
- **Prisma 6** ORM — SQLite locally, Postgres (Supabase) in production
- App-level auth: hashed passwords (bcrypt) + signed session cookie (jose)
- **Recharts** for dashboard charts

## Run locally

```bash
cd "PnL Personal/pnl"
npm install
npx prisma migrate dev      # creates dev.db and applies schema
npm run dev                 # http://localhost:3000
```

Then open http://localhost:3000 and create an account. The first account
creates a household and a starter chart of accounts. Family members can join
the same household (see "Inviting family" below).

Environment variables live in `.env`:

- `DATABASE_URL` — SQLite file locally (`file:./dev.db`)
- `AUTH_SECRET` — long random string used to sign session cookies

## Data model

- **Household** — the shared books; users belong to one household.
- **User** — email + hashed password, linked to a household.
- **Category** — typed INCOME / COGS / EXPENSE, optional parent (2-level).
- **Transaction** — positive UZS amount; meaning comes from the category type.
- **Budget** — per category, per month.
- **RecurringRule** — fixed monthly item; auto-posts a transaction each month
  (idempotent via `lastPosted`). Materialized lazily when you open the
  dashboard or P&L.

## Features

- Fast daily transaction entry (mobile friendly)
- Monthly P&L statement with budget-vs-actual variance
- Budgets screen (set targets per category/month)
- Recurring transactions (rent, salary, subscriptions)
- Dashboard: KPIs, 6-month net-profit trend, top expenses

## Inviting family (same household)

Auth is single-household per user. To add a family member to *your* household,
have them register with the `householdId` of your household (the register API
accepts an optional `householdId` to join instead of creating a new one). A
simple invite-link UI can be added later; for now the id can be copied from the
database or a future settings screen.

## Deploy to Supabase + Vercel

1. **Create a Supabase project** (free tier). Copy the Postgres connection
   string (use the "Connection pooling" / port 6543 string for serverless).
2. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` to the Supabase string, delete the SQLite-based
   `prisma/migrations` folder, then run:
   ```bash
   npx prisma migrate dev --name init      # regenerate Postgres migration
   ```
4. **Push to a Git repo**, then import it in **Vercel**.
5. In Vercel project settings → Environment Variables, set:
   - `DATABASE_URL` = Supabase connection string
   - `AUTH_SECRET`  = a long random string (e.g. `openssl rand -base64 48`)
6. Deploy. Because auth is app-level (not Supabase Auth), Supabase is used
   purely as the Postgres host — no other code changes needed.
