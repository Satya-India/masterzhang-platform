# Master Zhang — Property Care Platform (张师傅)

Production-grade multi-service platform for **Markham & York Region (GTA, Ontario)**:
Residential/Office Moving · Turnover Deep Cleaning · Junk & Estate Clear-outs ·
Seasonal Yard Care · Commercial & Residential Snow Clearing.

## Stack

- **Astro 5** (static-first; only `/api/*` runs on-demand)
- **Tailwind CSS 4** via `@tailwindcss/vite` (design tokens in `src/styles/global.css`)
- **Cloudflare Pages** via `@astrojs/cloudflare` (compile-mode image service, platformProxy for dev)
- **Vanilla TypeScript islands** — zero framework runtime shipped to the browser
- **Bilingual EN / 简体中文** — EN at `/`, ZH at `/zh/`, hreflang + OG locale alternates automated
- **JSON-LD enterprise schema** — `MovingCompany` + `HomeAndConstructionBusiness` + `LocalBusiness`
  with York Region FSAs, geo radius, opening hours, CVOR/WSIB/$5M CGL credentials, offer catalog

## Commands

```bash
npm install
npm run dev        # astro dev (Cloudflare bindings via platformProxy)
npm run build      # static build → ./dist
npm run preview    # wrangler pages dev ./dist (tests /api/quote with real bindings)
npm run deploy     # build + wrangler pages deploy
```

## Secrets (never commit)

```bash
npx wrangler pages secret put QUOTE_WEBHOOK_URL     # Slack/Discord/Make webhook
npx wrangler pages secret put RESEND_API_KEY        # transactional email
npx wrangler pages secret put QUOTE_DESTINATION_EMAIL
```

Non-secret vars live in `wrangler.toml` `[vars]`.

## Architecture

```
src/
├── content.config.ts          # locations collection (Zod-validated frontmatter)
├── content/locations/*.md     # Markham, Richmond Hill, Vaughan, Thornhill, Unionville
├── layouts/BaseLayout.astro   # fonts, header/footer, skip-link, a11y
├── lib/i18n.ts + dict.zh.ts   # typed bilingual dictionaries
├── components/
│   ├── SEO.astro              # canonical, OG, Twitter, hreflang, JSON-LD @graph
│   ├── HeroSection.astro      # dual-funnel hero + trust badges
│   ├── ServiceCards.astro     # 5 verticals
│   ├── InstantEstimator.astro # 3-step quote island → POST /api/quote
│   ├── BeforeAfterGallery.astro # drag comparison slider (no images = no CLS)
│   ├── Reviews.astro / DualFunnelCTA.astro / Footer.astro
│   └── HomeView.astro / LocationView.astro  # shared per-locale page bodies
└── pages/
    ├── index.astro, zh/index.astro
    ├── locations/[slug].astro, zh/locations/[slug].astro
    └── api/quote.ts           # edge fn: zod validation, honeypot, rate limit,
                               # webhook + Resend dispatch, FSA region check
```

## Pricing source of truth

Ballpark ranges are defined **twice on purpose** (UI chips + server re-derivation
in `api/quote.ts`). The client's reported range is stored only for audit; the
server value wins. Update both when pricing changes.

## Before launch

1. Replace placeholder NAP (phone `+1 (905) 555-0148`, address, CVOR #) in `src/lib/i18n.ts`.
2. Point `site` in `astro.config.mjs` + `PUBLIC_SITE_URL` in `wrangler.toml` at the real domain.
3. Swap CSS-composed gallery scenes for real job photos (keep `aspect-[16/10]` and
   `astro:assets` `<Image>` for AVIF/WebP).
4. Add real Google reviews (update `aggregateRating` in `SEO.astro`).
