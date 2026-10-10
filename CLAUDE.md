# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (usually http://localhost:5173)
npm run build    # prebuild (sitemap + OG image) → Vite build → scripts/prerender.mjs → dist/
npm run preview  # Serve the dist/ build locally
```

No test suite or linter configured.

The `prebuild` script runs `scripts/gen-sitemap.mjs` (writes `public/sitemap.xml` from static routes + every blog post's frontmatter) and `scripts/gen-og-image.mjs` (rasterizes `public/logo_v2.svg` into `public/og-image-v2.png` via sharp). Both outputs are generated files — don't edit them by hand. The OG filename is versioned (`-v2`); bump the suffix (here, in `index.html`, and the `src/lib/blog.js` default) when the image must bust social-platform caches.

## Architecture

This is a **React + Vite SPA** for the **Final Table** poker manager app landing page, deployed on Vercel.

**Entry point:** `src/main.jsx` — handles all routing manually with `window.location.pathname` comparisons (no React Router). It also sets per-route `<title>`/meta description/canonical (`ROUTE_META`). Routes:
- `/` → `LandingPage`
- `/blog` → `BlogIndex`, `/blog/:slug` → `BlogPost` (both in `src/BlogPage.jsx`)
- `/about` → `AboutPage`
- `/privacy`, `/terms` → legal pages
- `/delete-account` → `DeleteAccountPage` (account-deletion request flow)
- `/admin` → `AdminPage`
- `/hand/:shareId` → `HandViewer` (shared hand replay, reads `shared_hands` Firestore collection)

Most routes are wrapped in `I18nProvider` and (for themed pages) `ThemeProvider`. `vercel.json` rewrites each of these specific paths (not a catch-all) — **a new route must be added there too** or it 404s in production.

**Prerendering (`scripts/prerender.mjs`, runs after `vite build`):** the SPA used to serve one identical shell for every route, so crawlers and link-preview bots that don't run JS saw the homepage's title/canonical and an empty `#root`. The script now bakes real HTML per route into `dist/`: `dist/index.html` (homepage), `dist/prerendered/{about,blog,privacy,terms}.html`, `dist/prerendered/blog/<slug>.html` (one per post), plus `dist/prerendered/shell.html` — the untouched SPA shell used for `/hand/*`, `/admin` and `/delete-account`. Each page gets its own title, description, canonical, OG/Twitter tags (and Article JSON-LD for posts) and a plain-HTML copy of its content inside `#root` (visually hidden for JS users, shown with JS disabled; React replaces it on mount). `vercel.json` rewrites point at these files. When you add a **static, indexable route**, add it to `pages` in `prerender.mjs` and to the rewrites; when you add a **blog post**, nothing to do (picked up from `content/blog/`). The homepage's crawler-readable feature list in `homeBody()` is English-only and drawn from the marketing master doc's verified facts — keep it in sync with `public/llms.txt` and the visible page. The generated HTML is build output only; never commit it.

`/reset_password` is **not** a React route: it's the standalone static page `public/reset_password.html` (vercel.json rewrites `/reset_password` to it). It's the Firebase Auth password-reset action page — reads `oobCode`/`apiKey` from the URL and calls the identitytoolkit REST API directly. Styled to match the mobile app (dark, IBM Plex Sans), not the landing page; `noindex`.

### Landing page (`src/LandingPage.jsx`)

This is a ~3400-line monolithic file. All section components are defined inline here with a `TP` prefix. Render order: `TPNavbar → TPHero → TPHowItWorks → TPNotHud → TPBuckleUp → TPBuiltForLive → TPBlogTeaser → TPDiscord → TPBottomHero → TPFooter` (`TPAnnouncement` is currently commented out at the top). Several other `TP` components exist in the file but are **not rendered** (`TPComparison`, `TPBgSection`, `TPCommunity`, `TPBottomCTA`, `TPProblems`, `TPFeaturesShowcase`, `TPFinalCTA`) — dead sections kept around. `TPNavbar`, `TPFooter`, and `TPBottomHero` are exported and reused by the blog pages. The `LandingPage` default export owns Lenis smooth scroll (skipped on touch devices) and exposes it on `window.__lenis`.

> **Note:** `src/App.jsx` and `src/components/` (Navbar, Hero, etc.) are not imported by any active route — they are unused legacy code.

The hero's player count (`getPlayerCount()`) is a **deterministic pseudo-random calculation** seeded by date, not real Firestore data. It increments predictably over 3-hour slots since a hardcoded start date (currently only referenced by the unrendered CTA sections).

The `--footer-height` CSS custom property is kept up-to-date via a `ResizeObserver` on the footer element (used for sticky-footer layout math in CSS).

### Blog (`content/blog/` + `src/lib/blog.js` + `src/BlogPage.jsx`)

Publishing a post = dropping a Markdown file with frontmatter into `content/blog/` — no route registration, no sitemap edit. **`content/blog/README.md` is the authoring guide** (frontmatter fields, SEO rules, keyword-mapped content calendar) — read it before writing or editing posts.

- `src/lib/blog.js` loads every post at build time via `import.meta.glob(..., { eager: true, query: '?raw' })`, parses frontmatter with a hand-rolled browser-safe parser (gray-matter breaks in-browser — needs Node's Buffer), and renders Markdown with `marked`. Files starting with `_` and `README.md` are skipped.
- `BlogPost` sets `<title>`, meta description, canonical, OG tags, and injects Article JSON-LD at runtime; the post-page CTA is `TPBottomHero` (auto-appended — posts shouldn't end with their own big CTA).
- The sitemap picks up each post automatically at build (`lastmod` from `updated`/`date` frontmatter).

### i18n (`src/i18n.jsx`)

All user-facing text lives here. **Always add/update translations for all 11 languages when changing any copy:** `de`, `en`, `es`, `fr`, `pl`, `pt`, `ro`, `ru`, `sk`, `tr`, `uk`. (Blog post bodies are the exception — they are English-only Markdown.)

- `I18nProvider` detects locale from `localStorage` (`ft_lang`) or `navigator.language`
- `useT()` hook returns a translation function `t(key, params?)`
- Translation values can be strings or render functions returning JSX (e.g., `hero.h1`)
- Language switcher flag icons use the `flag-icons` npm package; `FLAG_ISO` in `LandingPage.jsx` maps locale codes to ISO country codes (`pt` → `br`, `en` → `gb`, `uk` → `ua`)

### Theming (`src/theme.jsx`)

`ThemeProvider` stores a mode (`light`/`dark`/`auto`) in `localStorage` key `ft_theme` and toggles `.dark-theme`/`.light-theme` on `<body>`. **Light mode is currently disabled**: `resolveTheme()` always returns `'dark'` and the footer `ThemeToggle` returns `null` — the full toggle UI is kept below the early return for re-enabling later.

### Firebase (`src/lib/firebase.js`)

Firebase is imported via the **npm package** (not CDN), config hardcoded in the file. All Firestore operations are centralized here — **except `HandViewer.jsx`**, which initializes its own Firebase app instance directly (using `getApps().length` guard to avoid duplicate initialization). Firestore security rules live in `firestore.rules` (deployed via `firebase.json` / Firebase CLI). Collections:
- `waitlist` — email sign-ups with optional first/last name and platform (ios/android)
- `nickname_claims` — username reservations (checks `usernames` collection for live-app conflicts)
- `contact_submissions` — contact form entries
- `shared_hands` — hand replay data written by the mobile app, read by `HandViewer`
- `users` — the live app's user records; the admin dashboard reads these (synced with Firebase Auth)
- Live-app data queried by the admin dashboard for user detail/deletion: `opponents`, `poker_sessions`, `session_results` (all keyed by `userId`). Logged hands live in the `poker_sessions/{id}/poker_hands` subcollection, with any AI analysis embedded on the hand doc as `aiAnalysis`.
- Admin email tooling: `email_templates`, `email_logs`, `inbox_replies`, `inbox_status`
- `daily_stats` — one doc per UTC day (`YYYY-MM-DD`) with `dau`/`wau`/`mau`/`totalUsers`, written by `api/cron-daily-stats.js`; activity is derived from `users/{uid}.lastActiveAt`, a heartbeat the mobile app writes on app open

Also exports admin auth: Google sign-in via Firebase Auth popup, gated by a hardcoded `ADMIN_EMAILS` allowlist. Note the **two-tier gating**: `ADMIN_EMAILS` only gates the admin UI, while `firestore.rules` grants data access via `isSuperAdmin()`, which checks the single `SUPER_ADMIN_EMAIL` — a non-super admin can sign in but will get permission errors on super-admin-only collections (most admin tooling and `daily_stats`).

### Serverless API (`api/`)

Vercel serverless functions. Secrets live server-side: `RESEND_API_KEY` (Resend email) and `FIREBASE_SERVICE_ACCOUNT_KEY` (firebase-admin service account JSON) in `.env` locally / Vercel env in prod — never in client code.
- `send-email.js` — generic Resend send (raw HTML or template mode), used by AdminPage bulk email and its "email a blog post" feature
- `send-welcome.js` — waitlist welcome email; auto-sends the iOS TestFlight beta invite when `platform === 'ios'`. **The email HTML is inlined in this file** — the `.html` files in `src/email-templates/` are only read by the dev middleware (see below), so prod copy changes must be made in `send-welcome.js` itself.
- `get-email.js`, `list-inbox.js`, `list-templates.js` — Resend read endpoints used by the admin dashboard
- `list-auth-users.js`, `delete-auth-user.js` — Firebase Auth admin operations (firebase-admin v13+ API), sharing the init helper in `_admin.js`
- `cron-daily-stats.js` — daily Vercel cron (00:05 UTC) that snapshots DAU/WAU/MAU counts (aggregate queries over `users.lastActiveAt`) into `daily_stats/{YYYY-MM-DD}`; feeds the Overview tab's active-user cards and DAU trend chart
- `cron-founder-call.js` — daily Vercel cron (`crons` in `vercel.json`, 09:00 UTC) that emails the founder-call invite ("book a Calendly call, get 3 months free") to users 30–37 days after signup. Dedups via the `founder_call_sends` Firestore collection (doc id = uid) and logs runs to `email_logs`. The email HTML lives in `_founder-call-email.js` and is duplicated in `AdminPage.jsx` `BUILTIN_TEMPLATES` — keep both in sync. Optionally guarded by a `CRON_SECRET` env var.

**Dev/prod duplication gotcha:** `vite.config.js` contains an `apiDevPlugin` that re-implements the admin-facing `/api/*` endpoints as dev-server middleware, so the admin dashboard works under plain `npm run dev` (no `vercel dev` needed). Any change to an `api/*.js` function must be mirrored in the corresponding middleware in `vite.config.js`, or dev and prod behavior will diverge. The two `cron-*` endpoints are the exception — they are **not** mirrored in dev and only run in prod via Vercel crons.

### Analytics (DataFast)

- **Browser:** the cookieless DataFast script in `index.html`. Scroll goals via `data-fast-scroll` attributes on landing/blog sections (thresholds tuned per section height — tall sticky sections can never reach the 0.5 default ratio) and click goals via `data-fast-goal` on every store link, with a `data-fast-goal-placement` param. The script disables itself on localhost.
- **Bots:** root-level `middleware.js` is Vercel Edge Middleware running `@datafast/ai-crawl` in front of static serving — tracks AI/search/training crawlers (which never run the browser script). Fire-and-forget, never awaited; the matcher excludes `/api` and static assets. Does not run under `npm run dev`.

### Admin page (`src/AdminPage.jsx`)

Google sign-in gate (`ADMIN_EMAILS` allowlist in `firebase.js` — there is no password gate anymore). Tabs: Overview, Users, Statistics (onboarding-survey charts), Shared Hands, Inbox (Resend inbox; `api/list-inbox.js` filters out blocked sender domains), and Email. The old Waitlist and Nickname Claims sections were removed from the UI, though their Firestore helpers remain in `firebase.js`.

- **Overview tab** — signup and shared-hand counts, plus active users: the DAU/WAU/MAU cards are computed live via Firestore aggregate count queries over `users.lastActiveAt` (`getActiveUserCounts`), while the DAU trend chart reads the `daily_stats` cron snapshots (`getDailyStats`). Both degrade gracefully (— / empty state) until the mobile app ships the heartbeat and the cron has run.
- **Users tab** — live-app users (Firebase Auth list/delete via the `/api` endpoints) with onboarding survey results. The user detail view lists sessions, each expandable to its logged hands (`poker_hands` subcollection) with AI analysis.
- **Share a hand via email** — each logged hand has a "Share via email" action; `buildHandEmailHtml` in `AdminPage.jsx` builds a branded replay email mirroring the in-app hand details. Anonymization is enforced there: players appear by table position only, the sharer as "Hero"; names/UIDs/free-text notes never appear. Money is formatted per game type (cash shows `$`, tournaments plain chip counts). The mobile app sometimes records per-action `playerPosition` labels shifted by a stale button seat; `correctedPositionMap` rebuilds seat → position from the hand's seat geometry and is used only when it reproduces `heroPositionName` exactly, otherwise the recorded labels are kept.
- Supports CSV export and bulk email through the `/api/*` Resend endpoints (raw HTML or Resend template mode), including sending a blog post as an email to selected users.
- **`BUILTIN_TEMPLATES`** — hardcoded announcement emails in `AdminPage.jsx` (founder-call invite, Leak Detector announcement) selectable in the Email tab alongside Resend templates. Images they reference are served from `public/email/` on finaltable.io, so new images must be deployed before the email is sent.

### Animations & scroll

- **Lenis** smooth scroll and **GSAP** are loaded as CDN globals in `index.html` (`window.Lenis`, `window.gsap`). Lenis is initialized in `LandingPage.jsx` and exposed as `window.__lenis`. GSAP is loaded but not currently wired to anything.
- **Scroll reveal:** add `.observe-me` class to any element; an `IntersectionObserver` adds `.in-view` when it enters the viewport. Wired up in `LandingPage.jsx` (and separately in `BlogPage.jsx` for reused landing components).

### Fonts & theming

- Headings: `Playfair Display` (serif) via `--font-heading`; body: `Inter` via `--font-body`; mono accents: `Roboto Mono`
- Primary accent color: `#A2F69A` (green)

### Legacy files

`index-legacy.html`, `script.js`, and `styles.css` in the project root are the old vanilla JS version of the page. They are **not part of the React app**. `FIGMA_RULES.md` and `LANDING_PAGE_DOCS.md` describe an older architecture — they are stale and should not be relied on.

## LLM Discovery (`public/llms.txt`)

**Update `public/llms.txt` whenever landing page content changes** (features, copy, FAQ, positioning). It helps AI tools recommend Final Table.

## Rules

- **Never push to remote without explicit user approval.**
- **Never commit unless explicitly asked.**
- **Translate every added text** into all 11 languages in `src/i18n.jsx` whenever user-facing copy is added or changed.
