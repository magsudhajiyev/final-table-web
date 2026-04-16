# Figma → Final Table Design System Rules

This document guides Figma MCP integration for the Final Table landing page. The project is **vanilla HTML + CSS + JS** — no framework, no build step, no Tailwind.

---

## 1. Design Tokens

All tokens are CSS custom properties defined in `:root` in `styles.css` (lines 1–23). Dark mode overrides them via `body.dark-theme` (lines 1502–1509).

### Color Tokens

```css
/* Light mode (default) */
--bg-main: #FFFFFF
--bg-backdrop: #F6F8F6
--bg-card: #F9FAFB

--primary: #A2F69A              /* green accent — buttons, focus rings, highlights */
--primary-gradient-start: #A2F69A
--primary-gradient-end: #E0FF96

--text-main: #000000
--text-muted: #4B5563

--border-subtle: #E5E7EB

--about-bg: #1B3B36             /* dark green — about section background */
--contact-bg: #A2F69A           /* green — contact section background */
--footer-bg: #111111
--success-green: #27AE60

/* Dark mode overrides (body.dark-theme) */
--bg-main: #000000
--bg-backdrop: #08090A
--bg-card: #111214
--text-main: #F7F8F8
--text-muted: #8A8F98
--border-subtle: #27282B
```

**When mapping Figma colors:** Always use a CSS variable if one exists. Only use raw hex for values not covered by the token set (e.g. section-specific backgrounds like `--about-bg`).

### Typography Tokens

```css
--font-heading: 'Playfair Display', serif   /* h1, h2, h3, .logo-text — weight 500 */
--font-body: 'Inter', sans-serif            /* all other text */
```

**Type scale in use:**

| Element | Size | Weight | Line-height |
|---|---|---|---|
| Hero title | 80px (→ 56px → 42px → 36px) | 500 | 1.1 |
| Section title | ~1.75–2rem | 500 | 1.1 |
| Body / nav | 14–18px | 400 | 1.6 |
| Button | 14px (large: 15px) | 400–600 | — |

### Spacing

No spacing scale tokens — spacing is expressed as raw values inline. Common values in use: `8px`, `16px`, `24px`, `32px`, `40px`, `60px`.

### Border Radius

Buttons and pill inputs use `border-radius: 40px`. Cards use `border-radius: 16–32px`. Small UI elements (hamburger hover, bento icons) use `8px` or `50%`.

---

## 2. Component Patterns

There are no separate component files — all components live in `index.html` (markup) and `styles.css` (styles). When translating a Figma component, add its HTML directly into `index.html` and its CSS into `styles.css`.

### Buttons

Four variants, all using base class `.btn`:

```html
<!-- Primary (green fill) -->
<a href="#" class="btn btn-primary">Label</a>

<!-- Secondary (ghost/outline) -->
<a href="#" class="btn btn-secondary">Label</a>

<!-- Gradient -->
<a href="#" class="btn btn-gradient">Label</a>

<!-- Dark (black fill) -->
<a href="#" class="btn btn-dark">Label</a>

<!-- Large size modifier -->
<a href="#" class="btn btn-primary btn-large">Label</a>
```

Base `.btn`: `padding: 12px 24px`, `border-radius: 40px`, `font-size: 14px`, `font-weight: 400`.

### Waitlist Input (pill input with inline button)

```html
<div class="waitlist-input-wrapper">
    <input type="email" class="email-input" placeholder="...">
    <button class="waitlist-button">
        <span class="button-front">Join Waitlist</span>
        <span class="button-back"><!-- checkmark SVG --></span>
    </button>
</div>
```

The wrapper owns the border/background. Focus ring is applied to `.waitlist-input-wrapper:focus-within`.

### Section Layout Pattern

```html
<section class="section-name">
    <div class="section-header observe-me">
        <h2 class="section-title">...</h2>
        <p class="section-subtitle">...</p>
    </div>
    <!-- content -->
</section>
```

Add `.observe-me` to any element that should fade/slide in on scroll (handled by `IntersectionObserver` in `script.js`).

---

## 3. Framework & Libraries

- **No JS framework.** Pure vanilla JS (ES modules via `type="module"`).
- **No CSS preprocessor or utility framework.** Plain CSS with custom properties.
- **External libraries loaded via CDN in `<head>`:**
  - GSAP 3.12.2 (`gsap.min.js`) — available globally as `gsap`
  - Lenis — smooth scroll (expected as global `Lenis`)
  - Firebase 10.7.1 — loaded as ESM in `script.js`

---

## 4. Asset Management

All assets live in `assets/`:

```
assets/
  logo_light.svg          ← nav logo, light mode
  Logo_dark.svg           ← nav logo, dark mode
  Asset 4.svg             ← legacy logo (unused in nav)
  Asset 5.svg             ← legacy logo (unused in nav)
  logo.png                ← used only for OG/Twitter meta + favicon
  hero_screen.png         ← hero mockup
  bankroll_screen.png     ← feature mockup
  mockups/
    app_dashboard_preview.png
    cta_cluster.png
    feature_logging.png
    google-play-badge.svg
```

**Referencing assets:** Always use relative paths from the project root, e.g. `assets/hero_screen.png`. No CDN, no hashing.

**Logo swap (light/dark):** Done purely with CSS `.logo-light` / `.logo-dark` `display` toggling — not JavaScript.

```css
.logo-dark { display: none; }
body.dark-theme .logo-light { display: none; }
body.dark-theme .logo-dark { display: block; }
```

---

## 5. Icon System

Icons are **inline SVGs** embedded directly in `index.html`. No icon library or sprite sheet.

- Feature/bento icons: `24×24`, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"`
- Wrapper class: `.bento-icon-wrapper` or `.al-svg` (for feature list icons)
- Accent fill target: `.al-fill-target` — filled with `var(--primary)` via CSS

```css
.al-fill-target { fill: var(--primary); stroke: none; }
```

**When adding new icons from Figma:** Export as inline SVG, set `width="24" height="24"`, use `stroke="currentColor"` so the icon inherits text color.

---

## 6. Styling Approach

- **Methodology:** Flat BEM-lite. One global `styles.css`. No scoping, no CSS Modules.
- **Global reset:** `* { margin: 0; padding: 0; box-sizing: border-box; }`
- **Dark mode:** Class-based (`body.dark-theme`), toggled by JS, persisted in `localStorage`.
- **Scroll animations:** `.observe-me` class → `IntersectionObserver` adds `.in-view`.
- **Responsive breakpoints:**

| Breakpoint | Behaviour |
|---|---|
| `max-width: 1024px` | Desktop nav hidden → hamburger menu |
| `max-width: 900px` | Bento grid collapses to 1 column, footer stacks |
| `max-width: 768px` | Hero font shrinks, padding reduced |
| `max-width: 480px` | Hero font shrinks further |

---

## 7. Figma → Code Mapping Cheatsheet

| Figma property | Maps to |
|---|---|
| Primary green `#A2F69A` | `var(--primary)` |
| Background white | `var(--bg-main)` |
| Background tinted | `var(--bg-backdrop)` or `var(--bg-card)` |
| Heading text | `font-family: var(--font-heading)` |
| Body text | `font-family: var(--font-body)` |
| Muted/secondary text | `color: var(--text-muted)` |
| Dividers/borders | `var(--border-subtle)` |
| Pill button | `.btn .btn-primary` (or variant) |
| Card container | Add to `styles.css` using `--bg-card`, `border-radius: 16–32px`, `border: 1px solid var(--border-subtle)` |
| Scroll-in animation | Add class `.observe-me` to element |
| Section max-width | `max-width: 1200px; margin: 0 auto; padding: 0 40px` |
