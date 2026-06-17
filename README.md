# Rehouse Israel

Premium luxury real estate platform for the Israeli southern coastal region.

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS** — navy & gold design system
- **Framer Motion** — subtle luxury animations
- **TypeScript** — full type safety
- **RTL / Hebrew** — native right-to-left support

## Getting Started

```bash
cd rehouse-israel
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
rehouse-israel/
├── public/
│   └── images/              # Static assets (hero poster, logos)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout — RTL, fonts, SEO metadata
│   │   ├── page.tsx         # Homepage — hero + featured listings
│   │   ├── globals.css      # Tailwind + luxury utility classes
│   │   ├── properties/
│   │   │   ├── page.tsx         # Catalog page (SEO metadata + Suspense)
│   │   │   └── PropertiesPage.tsx  # Live-filter catalog
│   │   └── agents/
│   │       ├── page.tsx         # Agents page (SEO metadata)
│   │       └── AgentsPage.tsx   # Agent grid + meeting modal
│   ├── components/
│   │   ├── AgentCard.tsx      # Agent card with quick contact + CTA
│   │   ├── MeetingModal.tsx   # Schedule meeting dialog
│   │   ├── icons/SocialIcons.tsx
│   │   ├── Header.tsx       # Fixed navigation
│   │   ├── Footer.tsx       # Site footer
│   │   ├── HeroSection.tsx  # Full-screen video hero
│   │   ├── PropertySearch.tsx  # Filter bar (hero + catalog variants)
│   │   └── PropertyCard.tsx # Listing card with hover effects
│   └── lib/
│       ├── hooks/usePropertyFilters.ts  # URL-synced live filters
│       ├── types.ts         # Shared TypeScript interfaces
│       └── constants.ts     # Cities, neighborhoods, mock data, helpers
├── tailwind.config.ts       # Navy/gold color palette
├── next.config.ts
└── package.json
```

## Key Features

| Feature | Status |
|---------|--------|
| Full-screen hero with video | ✅ |
| Property search (Buy/Rent, City, Filters) | ✅ |
| Advanced filters (price, rooms, mamad, balcony, parking) | ✅ |
| Property cards with hover effects | ✅ |
| RTL Hebrew layout + SEO metadata | ✅ |
| Agent portfolio page | ✅ |
| Properties catalog + live search | ✅ |
| Property detail + inquiry flow | 🔜 Next phase |

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `navy-950` (#0a1929) |
| Accent | `gold-500` (#c9952e) |
| Display font | Heebo |
| Body font | Rubik |

## License

Private — Rehouse Israel © 2026
