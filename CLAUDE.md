# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (usually http://localhost:5173)
npm run build    # Vite build → dist/
npm run preview  # Serve the dist/ build locally
```

No test suite or linter configured.

## Architecture

This is a **React + Vite SPA** for the **Final Table** poker manager app landing page, deployed on Vercel.

**Entry point:** `src/main.jsx` — handles all routing manually with `window.location.pathname` comparisons (no React Router). Routes:
- `/` → `LandingPage` (wrapped in `I18nProvider`)
- `/about` → `AboutPage`
- `/privacy`, `/terms` → legal pages
- `/delete-account` → `DeleteAccountPage` (account-deletion request flow, wrapped in `I18nProvider`)
- `/admin` → `AdminPage`
- `/hand/:shareId` → `HandViewer` (shared hand replay, reads `shared_hands` Firestore collection)

`vercel.json` rewrites each of these specific paths (not a catch-all) to `/index.html`.

### Landing page (`src/LandingPage.jsx`)

This is a ~1600-line monolithic file. All section components are defined inline here with a `TP` prefix. Render order: `TPNavbar → TPHero → TPHowItWorks → TPNotHud → TPBuckleUp → TPBuiltForLive → TPDiscord → TPFooter`. Several other `TP` components exist in the file but are **not rendered** (`TPComparison`, `TPBgSection`, `TPProblems`, `TPBottomCTA`, `TPFinalCTA`) — dead sections kept around. The `LandingPage` default export owns Lenis smooth scroll (skipped on touch devices) and exposes it on `window.__lenis`.

> **Note:** `src/App.jsx` and `src/components/` (Navbar, Hero, etc.) are not imported by any active route — they are unused legacy code.

The hero's player count (`getPlayerCount()`) is a **deterministic pseudo-random calculation** seeded by date, not real Firestore data. It increments predictably over 3-hour slots since a hardcoded start date (currently only referenced by the unrendered CTA sections).

The `--footer-height` CSS custom property is kept up-to-date via a `ResizeObserver` on the footer element (used for sticky-footer layout math in CSS).

### i18n (`src/i18n.jsx`)

All user-facing text lives here. **Always add/update translations for all 9 languages when changing any copy:** `de`, `en`, `es`, `fr`, `pl`, `pt`, `ru`, `tr`, `uk`.

- `I18nProvider` detects locale from `localStorage` (`ft_lang`) or `navigator.language`
- `useT()` hook returns a translation function `t(key, params?)`
- Translation values can be strings or render functions returning JSX (e.g., `hero.h1`)
- Language switcher flag icons use the `flag-icons` npm package; `FLAG_ISO` in `LandingPage.jsx` maps locale codes to ISO country codes (`pt` → `br`, `en` → `gb`, `uk` → `ua`)

### Firebase (`src/lib/firebase.js`)

Firebase is imported via the **npm package** (not CDN), config hardcoded in the file. All Firestore operations are centralized here — **except `HandViewer.jsx`**, which initializes its own Firebase app instance directly (using `getApps().length` guard to avoid duplicate initialization). Firestore security rules live in `firestore.rules` (deployed via `firebase.json` / Firebase CLI). Collections:
- `waitlist` — email sign-ups with optional first/last name and platform (ios/android)
- `nickname_claims` — username reservations (checks `usernames` collection for live-app conflicts)
- `contact_submissions` — contact form entries
- `shared_hands` — hand replay data written by the mobile app, read by `HandViewer`
- `users` — the live app's user records; the admin dashboard reads these (synced with Firebase Auth)
- Live-app data queried by the admin dashboard for user detail/deletion: `opponents`, `poker_sessions`, `session_results` (all keyed by `userId`)
- Admin email tooling: `email_templates`, `email_logs`, `inbox_replies`, `inbox_status`

The `firebase-admin` package is a dependency for server-side Auth/Firestore operations (admin dashboard syncs with Firebase Auth and deletes users from both Auth + Firestore). Note recent work standardized on the firebase-admin v13 API.

Also exports admin auth: Google sign-in via Firebase Auth popup, gated by a hardcoded `ADMIN_EMAILS` allowlist.

### Serverless API (`api/`)

Vercel serverless functions wrapping the **Resend** email API. The key lives server-side in the `RESEND_API_KEY` env var (`.env` locally / Vercel env in prod) — never in client code.
- `send-email.js` — generic send (raw HTML or Resend template mode), used by AdminPage bulk email
- `send-welcome.js` — waitlist welcome email; auto-sends the iOS TestFlight beta invite when `platform === 'ios'`. **The email HTML is inlined in this file** — the `.html` files in `src/email-templates/` are unreferenced source copies, so editing them alone changes nothing.
- `get-email.js`, `list-inbox.js`, `list-templates.js` — Resend read endpoints used by the admin dashboard

### Admin page (`src/AdminPage.jsx`)

Google sign-in gate (`ADMIN_EMAILS` allowlist in `firebase.js` — there is no password gate anymore). Tabs for waitlist users, nickname claims, contact submissions, and shared hands. Supports CSV export and bulk email through the `/api/*` Resend endpoints (raw HTML or Resend template mode).

### Animations & scroll

- **Lenis** smooth scroll and **GSAP** are loaded as CDN globals in `index.html` (`window.Lenis`, `window.gsap`). Lenis is initialized in `LandingPage.jsx` and exposed as `window.__lenis`. GSAP is loaded but not currently wired to anything.
- **Scroll reveal:** add `.observe-me` class to any element; an `IntersectionObserver` adds `.in-view` when it enters the viewport. Wired up in `LandingPage.jsx`.

### Fonts & theming

- Headings: `Playfair Display` (serif) via `--font-heading`; body: `Inter` via `--font-body`; mono accents: `Roboto Mono`
- Dark/light theme toggled via `.dark-theme` on `<body>`; preference in `localStorage` key `theme`
- Primary accent color: `#A2F69A` (green)

### Legacy files

`index-legacy.html`, `script.js`, and `styles.css` in the project root are the old vanilla JS version of the page. They are **not part of the React app**. `FIGMA_RULES.md` and `LANDING_PAGE_DOCS.md` describe an older architecture — they are stale and should not be relied on.

## LLM Discovery (`public/llms.txt`)

**Update `public/llms.txt` whenever landing page content changes** (features, copy, FAQ, positioning). It helps AI tools recommend Final Table.

## Rules

- **Never push to remote without explicit user approval.**
- **Never commit unless explicitly asked.**
- **Translate every added text** into all 9 languages in `src/i18n.jsx` whenever user-facing copy is added or changed.
