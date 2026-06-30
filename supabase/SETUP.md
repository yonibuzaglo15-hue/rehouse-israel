# Supabase setup — Rehouse Israel website

The **rehouse-israel** website does **not** use Prisma. Property data is stored in PostgreSQL table `catalog_properties` via `@supabase/supabase-js`.

The CRM project (`rehouse_website`) has its own Prisma schema (`Property`, `Agency`, etc.) — that is a **separate** data model and does **not** include `catalog_properties`.

## Required environment variables

Add to **rehouse-israel** `.env.local` (local) and **Vercel → Project → Settings → Environment Variables** (production):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB + admin storage |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional: browser image uploads |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional: browser image uploads |
| `DATABASE_URL` | Optional: run migration script / SQL tools |

## Where to copy values in Supabase Dashboard

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) → your project
2. **Project Settings** (gear) → **API**
   - `SUPABASE_URL` ← **Project URL**
   - `SUPABASE_SERVICE_ROLE_KEY` ← **service_role** (secret)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← **anon public**
3. **Project Settings** → **Database** → **Connection string**
   - `DATABASE_URL` ← **URI** (Transaction pooler, port 6543) — for app migrations
   - `DIRECT_URL` ← **URI** (Session mode, port 5432) — for Prisma in CRM only

Storage bucket `properties` must exist and be **public** (you already created this).

## Create `catalog_properties` table

### Option A — Prisma (after `npm install` + `.env.local` configured)

```bash
npm run db:push
```

Uses `DIRECT_URL` from `.env.local` via `prisma.config.ts`.

### Option B — SQL Editor (one-time)

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Paste contents of `supabase/migrations/001_catalog_properties.sql`
3. Click **Run**

### Option C — Terminal script

From `rehouse-israel` root, after setting `DATABASE_URL` in `.env.local`:

```bash
npm install
npm run db:setup-catalog
```

Uses Node + `pg` to apply the same SQL file.

## Verify

In SQL Editor:

```sql
select count(*) from public.catalog_properties;
```

Then submit a property at `/admin/property/new` — the error should be gone.
