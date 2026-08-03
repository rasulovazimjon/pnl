# Deploying Personal P&L (GitHub → Supabase → Vercel)

This is the full path from zero accounts to a live app. Do the browser steps
yourself; the terminal/git steps I (Claude) will run for you — just paste back
the values I ask for (repo URL, database URL).

Order matters: **GitHub → Supabase → Vercel**.

---

## 1. GitHub (host the code)

1. Sign up at https://github.com/signup (use rasulovazimjon@gmail.com).
2. Verify your email.
3. Create a new **empty** repository:
   https://github.com/new
   - Repository name: `pnl` (or anything)
   - Private (recommended)
   - **Do NOT** add a README, .gitignore, or license (the repo already has them)
4. Copy the repo URL shown (looks like `https://github.com/<you>/pnl.git`).
5. Paste that URL back to me. I'll wire up the remote and push the code.
   - First push will ask you to authenticate. Easiest: when prompted for a
     password, paste a **Personal Access Token** (create one at
     https://github.com/settings/tokens → "Generate new token (classic)" →
     scope `repo`). You enter the token yourself — I never handle it.

---

## 2. Supabase (the database)

1. Sign up at https://supabase.com → "Start your project" (sign in with GitHub
   is simplest now that you have it).
2. Create a new project:
   - Name: `pnl`
   - Database password: choose a strong one and **save it**
   - Region: closest to you (e.g. Central EU / Frankfurt)
3. Wait for it to provision (~2 min).
4. Get the connection string: Project → **Connect** (top bar) → **ORMs** /
   **Prisma**, or Settings → Database → Connection string.
   - Use the **Connection pooling** string (Transaction mode, port **6543**).
   - It looks like:
     `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres`
   - Replace `[YOUR-PASSWORD]` with the password from step 2.
5. Paste that string back to me (or keep it private and just tell me it's ready —
   then you'll run the migrate command yourself; I'll give the exact line).

I will then:
- switch the Prisma provider from `sqlite` to `postgresql`,
- regenerate the migration for Postgres,
- run `prisma migrate deploy` against Supabase to create the tables.

---

## 3. Vercel (host the app)

1. Sign up at https://vercel.com/signup → **Continue with GitHub**.
2. **Add New… → Project** → import your `pnl` repo.
3. Framework preset: **Next.js** (auto-detected). Root directory: leave as is
   (the repo root is the app).
4. Before deploying, open **Environment Variables** and add:
   - `DATABASE_URL` = your Supabase pooling connection string (port 6543)
   - `AUTH_SECRET`  = the long random string I generated (or run
     `openssl rand -base64 48` for a new one)
5. Click **Deploy**. First build takes ~2 min.
6. Open the live URL, register the first account (creates your household +
   chart of accounts), then invite your partner with the household code shown
   on the dashboard.

---

## Notes

- **Migrations**: after switching to Postgres, tables are created by
  `prisma migrate deploy`. Run it once against Supabase before/at first deploy.
  Vercel's build runs `prisma generate` automatically (see package.json).
- **Auto-deploy**: every `git push` to the main branch redeploys on Vercel.
- **Costs**: GitHub, Supabase, and Vercel all have free tiers that comfortably
  cover a personal two-person app.
- **Secrets**: `.env` is gitignored — your real DATABASE_URL / AUTH_SECRET never
  get committed. They live only in your local `.env` and Vercel's env settings.
