# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000 with live reload
npm run serve    # Start server at http://localhost:8080
npm run build    # Copy files to public/ for deployment
```

There is no test suite or linter configured.

## Architecture

This is a vanilla HTML/CSS/JS static landing page for the **Final Table** poker manager app. There is no framework, bundler, or build step beyond copying files.

**Three source files:**
- `index.html` — single-page structure with all sections (hero, features, download CTA, contact)
- `styles.css` — all styles; uses CSS custom properties defined in `:root` for theming
- `script.js` — all client-side logic loaded as an ES module (`type="module"`)

**Deployment:** Vercel reads `vercel.json`, runs `npm run build`, and serves from `public/`.

### Firebase backend (`script.js`)
`script.js` initializes Firebase directly via CDN ESM imports (not the npm package). Two Firestore collections are written to:
- `waitlist` — email + timestamp, submitted from the hero/download section
- `contact_submissions` — name, email, message + timestamp, submitted from the contact form

Both write functions are exposed on `window` (`window.submitToWaitlist`, `window.submitContactForm`) so they can be called from inline HTML handlers if needed.

### Theming
Dark/light theme is toggled by adding `.dark-theme` to `<body>`. The current preference is persisted in `localStorage` under the key `theme`. CSS variables for both modes are declared in `styles.css`.

### Animations
- **Scroll reveal:** Elements with class `.observe-me` fade/slide in via `IntersectionObserver` adding `.in-view`.
- **Hero 3D scroll effect:** On scroll, `rotateX` and `scale` are applied to `.app-screenshot` and `translateY` to `.hero-content` using `requestAnimationFrame`.
- **Chart bars:** `.fake-chart .bar` elements animate their height in when scrolled into view.
- **Smooth scroll:** Lenis library (loaded via CDN in `index.html`) handles scroll easing; GSAP is also loaded for potential animation use.

### Fonts
- Headings: `Playfair Display` (serif) via `--font-heading`
- Body: `Inter` (sans-serif) via `--font-body`
- Both loaded from Google Fonts in `<head>`

## LLM Discovery (`public/llms.txt`)

The file `public/llms.txt` helps AI tools (ChatGPT, Claude, Perplexity, etc.) understand and recommend Final Table. **Whenever you make changes to the landing page content — features, copy, FAQ, team info, or product positioning — update `public/llms.txt` to reflect those changes.** Keep it accurate and in sync with the site.

## Rules

- **Never push to remote without explicit user approval.** Always wait for the user to confirm before running `git push`.
- **Never commit or push unless the user explicitly asks.** Do not auto-commit after completing a task.
- **Translate every added text.** Whenever you add or change user-facing text, translate it into all 7 supported languages (DE, EN, ES, FR, PL, PT, RU) in `src/i18n.jsx`.
