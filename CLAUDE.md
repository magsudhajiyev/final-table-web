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

This is a **React + Vite SPA** for the **Final Table** poker manager app landing page.

**Entry point:** `src/main.jsx` — handles all routing manually with `window.location.pathname` comparisons (no React Router). Routes:
- `/` → `LandingPage` (wrapped in `I18nProvider`)
- `/about` → `AboutPage`
- `/privacy`, `/terms` → legal pages
- `/admin` → `AdminPage` (password-protected, hardcoded `ADMIN_PASS`)
- `/hand/:shareId` → `HandViewer` (shared hand replay, reads `shared_hands` Firestore collection)

Vercel rewrites all paths to `/index.html` (`vercel.json`).

### Landing page (`src/LandingPage.jsx`)

This is a ~1300-line monolithic file. All section components are defined inline here with a `TP` prefix (`TPNavbar`, `TPHero`, `TPHowItWorks`, `TPNotHud`, `TPFeaturesShowcase`, `TPComparison`, `TPFinalCTA`, `TPBottomCTA`, `TPFooter`). The `LandingPage` default export owns Lenis smooth scroll and exposes it on `window.__lenis`.

> **Note:** `src/App.jsx` and `src/components/` (Navbar, Hero, etc.) are not imported by any active route — they are unused legacy code.

The hero's player count (`getPlayerCount()`) is a **deterministic pseudo-random calculation** seeded by date, not real Firestore data. It increments predictably over 3-hour slots since a hardcoded start date.

### i18n (`src/i18n.jsx`)

All user-facing text lives here. **Always add/update translations for all 7 languages when changing any copy:** `de`, `en`, `es`, `fr`, `pl`, `pt`, `ru`.

- `I18nProvider` detects locale from `localStorage` (`ft_lang`) or `navigator.language`
- `useT()` hook returns a translation function `t(key, params?)`
- Translation values can be strings or render functions returning JSX (e.g., `hero.h1`, `compare.title`)
- Language switcher flag icons use the `flag-icons` npm package; `FLAG_ISO` in `LandingPage.jsx` maps locale codes to ISO country codes (`pt` → `br`, `en` → `gb`)

### Firebase (`src/lib/firebase.js`)

Firebase is imported via the **npm package** (not CDN). All Firestore operations are centralized here. Collections:
- `waitlist` — email sign-ups with optional first/last name
- `nickname_claims` — username reservations (checks `usernames` collection for live-app conflicts)
- `contact_submissions` — contact form entries
- `shared_hands` — hand replay data written by the mobile app, read by `HandViewer`

### Admin page (`src/AdminPage.jsx`)

Password gate (`ADMIN_PASS` hardcoded). Tabs for waitlist users, nickname claims, contact submissions, and shared hands. Supports CSV export and bulk email via Resend API (key entered at runtime, stored in `sessionStorage`).

### Animations & scroll

- **Lenis** smooth scroll and **GSAP** are loaded as CDN globals in `index.html` (`window.Lenis`, `window.gsap`). Lenis is initialized in `LandingPage.jsx` and exposed as `window.__lenis`. GSAP is loaded but not currently wired to anything.
- **Scroll reveal:** add `.observe-me` class to any element; an `IntersectionObserver` adds `.in-view` when it enters the viewport. Wired up in `LandingPage.jsx`.

### Fonts & theming

- Headings: `Playfair Display` (serif) via `--font-heading`; body: `Inter` via `--font-body`; mono accents: `Roboto Mono`
- Dark/light theme toggled via `.dark-theme` on `<body>`; preference in `localStorage` key `theme`
- Primary accent color: `#A2F69A` (green)

### Legacy files

`index-legacy.html`, `script.js`, and `styles.css` in the project root are the old vanilla JS version of the page. They are **not part of the React app**. `FIGMA_RULES.md` also describes this old vanilla JS architecture and is stale.

## LLM Discovery (`public/llms.txt`)

**Update `public/llms.txt` whenever landing page content changes** (features, copy, FAQ, positioning). It helps AI tools recommend Final Table.

## Rules

- **Never push to remote without explicit user approval.**
- **Never commit unless explicitly asked.**
- **Translate every added text** into all 7 languages in `src/i18n.jsx` whenever user-facing copy is added or changed.
