# Rehouse Israel

Premium luxury real estate platform for the Israeli southern coastal region.

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS** — navy & gold design system
- **Framer Motion** — subtle luxury animations
- **TypeScript** — full type safety
- **Supabase** — production property catalog (`catalog_properties`) + image storage
- **NextAuth** — admin portal login (credentials / Google OAuth)
- **JWT sessions** — org staff login (dev / admin / agent roles)
- **RTL / Hebrew** — native right-to-left support

## Getting Started

```bash
cd rehouse-israel
npm install
cp .env.example .env.local   # configure Supabase, auth secrets, etc.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See `.env.example` and `supabase/SETUP.md` for database and Supabase setup.

## Project Structure

```
rehouse-israel/
├── public/assets/           # Brand logos, hero backgrounds
├── data/                    # Local catalog JSON seeds (dev only; not used on Vercel)
├── prisma/                  # CatalogProperty schema + db tooling
├── scripts/                 # Seeds, Google sync, catalog migration
├── supabase/                # SQL migrations + setup docs
└── src/
    ├── app/
    │   ├── (site)/          # Public pages — properties, agents, contact, about
    │   ├── admin/           # Agency admin — property create/edit
    │   ├── dashboard/       # Role-based dashboards (legacy redirect)
    │   ├── agent-dashboard/ # Agent workspace
    │   ├── dev/             # Dev console (dev role only)
    │   ├── login/           # Dual login — NextAuth admin + org staff
    │   └── api/
    │       ├── auth/        # NextAuth, org login, logout, session
    │       ├── catalog/     # Public property catalog (Supabase)
    │       └── properties/  # Managed properties (staff intake)
    ├── components/
    │   ├── Hero.tsx         # Homepage hero (day/night backgrounds + logo)
    │   ├── HomePage.tsx     # Landing section stack
    │   ├── Header.tsx       # Fixed navigation
    │   ├── PropertyCard.tsx # Listing card + admin action menu
    │   ├── PropertySearch.tsx
    │   └── admin/           # Property forms, edit modal, image upload
    └── lib/
        ├── auth/            # RBAC, sessions, NextAuth config
        ├── properties/      # Catalog schema, repository, sync
        ├── supabase/        # Server + browser clients, storage uploads
        ├── google/          # Sheets + Drive sync
        └── mock-data/       # Homepage / agents fallback content
```

## Authentication

Two login paths on `/login`:

| Path | Used by | Mechanism |
|------|---------|-----------|
| Default form (username / Google) | Admin portal | NextAuth JWT |
| “כניסה עם חשבון ארגוני” toggle | Staff (dev / admin / agent) | `POST /api/auth/login` → session cookie |

Middleware protects `/admin`, `/dashboard`, `/agent-dashboard`, and `/dev` routes.

## Key Features

| Feature | Status |
|---------|--------|
| Dynamic hero (day/night per city) + brand logo | ✅ |
| Property search (Buy/Rent, City, Filters) | ✅ |
| Advanced filters (price, rooms, mamad, balcony, parking) | ✅ |
| Property catalog + live search (Supabase) | ✅ |
| Property detail + inquiry form | ✅ |
| Agent portfolio page | ✅ |
| Staff dashboards + property intake | ✅ |
| Admin property CRUD + image upload | ✅ |
| Google Sheets / Drive property sync | ✅ |
| RTL Hebrew layout + SEO metadata | ✅ |
| Mortgage calculator wizard | ✅ |

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `navy-950` (#0a1929) |
| Accent | `gold-500` (#c9952e) |
| Display font | Heebo |
| Body font | Rubik |

## License

Private — Rehouse Israel © 2026
