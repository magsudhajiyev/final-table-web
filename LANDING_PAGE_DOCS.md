# Final Table Landing Page -- Complete Reference Documentation

This document describes every section, every piece of text content, layout, animation, responsive behavior, and asset used on the Final Table landing page (`TestPage.jsx` + `TestPage.css`).

---

## Table of Contents

1. [Page Structure & Render Order](#page-structure--render-order)
2. [Typography System](#typography-system)
3. [Color Palette](#color-palette)
4. [External Dependencies](#external-dependencies)
5. [Section 1: Navbar (TPNavbar)](#section-1-navbar-tpnavbar)
6. [Section 2: Hero (TPHero)](#section-2-hero-tphero)
7. [Section 3: Tab/Mockup Section (TPBgSection)](#section-3-tabmockup-section-tpbgsection)
8. [Section 4: Stacking Cards / Problems (TPProblems)](#section-4-stacking-cards--problems-tpproblems)
9. [Section 5: Features Showcase Bento Grid (TPFeaturesShowcase)](#section-5-features-showcase-bento-grid-tpfeaturesshowcase)
10. [Section 6: Reserve Username (TPReserveUsername)](#section-6-reserve-username-tpreserveusername)
11. [Section 7: Contact (TPContact)](#section-7-contact-tpcontact)
12. [Section 8: Footer (TPFooter)](#section-8-footer-tpfooter)
13. [Firebase Integration](#firebase-integration)
14. [Unused / Legacy Components](#unused--legacy-components)

---

## Page Structure & Render Order

The root component is `TestPage` (default export). It renders:

```jsx
<div className="tp-root">
  <TPNavbar />
  <main>
    <TPHero />
    <TPBgSection />
    <TPProblems />
    <TPFeaturesShowcase />
    <TPReserveUsername />
    <TPContact />
  </main>
  <TPFooter />
</div>
```

The wrapper `.tp-root` sets `font-family: var(--font-sans)`, white background, black text, `overflow-x: clip`.

---

## Typography System

### Font Stacks (CSS Custom Properties)

| Variable | Value |
|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` |
| `--font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif` |

Fonts are loaded via Google Fonts import at the top of `TestPage.css`:
```
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Inter:wght@400;500;600&display=swap');
```

### Type Scale

| Token | Value | Usage |
|---|---|---|
| `--type-display` | `clamp(48px, 8vw, 96px)` | Hero CTA headline (gt-headline) |
| `--type-h1` | `clamp(44px, 5.5vw, 80px)` | Page hero heading |
| `--type-h2` | `clamp(30px, 3.8vw, 52px)` | Section headings |
| `--type-h3` | `clamp(20px, 2.2vw, 28px)` | Subsection / large card headings |
| `--type-h4` | `18px` | Card titles, form section titles |
| `--type-h5` | `15px` | Small headings, UI labels |
| `--type-body-lg` | `18px` | Lead paragraphs, intro copy |
| `--type-body` | `16px` | Standard body copy |
| `--type-body-sm` | `14px` | Secondary copy, card descriptions |
| `--type-caption` | `13px` | Labels, supporting text, fine print |
| `--type-micro` | `12px` | All-caps eyebrows, utility text |

### Line Heights

| Token | Value |
|---|---|
| `--lh-display` | `1.0` |
| `--lh-heading` | `1.1` |
| `--lh-subhead` | `1.2` |
| `--lh-body` | `1.65` |
| `--lh-tight` | `1.4` |

### Letter Spacing

| Token | Value |
|---|---|
| `--ls-display` | `-0.02em` |
| `--ls-heading` | `-0.01em` |
| `--ls-body` | `0em` |
| `--ls-caps` | `0.08em` |

---

## Color Palette

### index.css (global theme, applies to older/non-TestPage components)

| Variable | Value | Usage |
|---|---|---|
| `--bg-main` | `#FFFFFF` | Page background |
| `--bg-backdrop` | `#F6F8F6` | Backdrop sections |
| `--bg-card` | `#F9FAFB` | Card backgrounds |
| `--primary` | `#A2F69A` | Primary accent green |
| `--primary-gradient-start` | `#A2F69A` | Gradient start |
| `--primary-gradient-end` | `#E0FF96` | Gradient end |
| `--text-main` | `#000000` | Primary text |
| `--text-muted` | `#4B5563` | Muted text |
| `--border-subtle` | `#E5E7EB` | Subtle borders |
| `--about-bg` | `#1B3B36` | About section bg |
| `--contact-bg` | `#A2F69A` | Contact section accent |
| `--footer-bg` | `#111111` | Footer background |
| `--success-green` | `#27AE60` | Success state |

### TestPage-specific colors (hardcoded in CSS)

| Color | Usage |
|---|---|
| `#ffffff` | Page bg, card backgrounds, nav pill bg |
| `#0a0a0a` | Dark section backgrounds (stacking cards, contact) |
| `#f5f5f5` | Hero bg, reserve username bg, feature showcase visual bg |
| `#fafafa` | Feature cards bg |
| `#000000` | Primary text, button backgrounds |
| `#08a85b` | Green label text (feature labels) |
| `#0a7a3c` | Reserve section green (eyebrow, avatars, success) |
| `#16a34a` | Waitlist success checkmark |
| `#a2f69a` | CTA button green (contact submit, dark section CTA) |
| `#3b82f6` | Blue (bankroll chart line) |
| `#2563eb` | Blue accent (AI chip, dealer role) |
| `#dc2626` | Red error, LAG badge |
| `#e74c3c` | Calling Station tag color |
| `#f39c12` | LAG tag color (orange) |
| `#3498db` | Nit tag color (blue) |
| `#ef4444` | Red bar (VPIP stat) |
| `#f97316` | Orange bar (PFR stat) |
| `#60a5fa` | Blue bar (3-bet stat) |
| `#a78bfa` | Purple bar (Agg stat) |

---

## External Dependencies

| Dependency | How loaded | Usage |
|---|---|---|
| **React** | npm package (`react`, `react-dom`) | UI framework |
| **Firebase** | npm package (`firebase/app`, `firebase/firestore`) | Waitlist, nickname claims, contact form |
| **lucide-react** | npm package | Icons: `Eye`, `Activity`, `Scale`, `TrendingUp`, `Crosshair`, `Clock`, `Users`, `BarChart2` |
| **Google Fonts** | CSS `@import` | `Playfair Display` (display/heading), `Inter` (body/sans) |

Social brand icons (Facebook, GitHub, Instagram, LinkedIn, Twitter/X, YouTube) are defined as inline SVG components at the top of `TestPage.jsx` because lucide-react v1+ dropped brand icons.

---

## Section 1: Navbar (TPNavbar)

### CSS classes
- `.tp-nav-wrap` -- Fixed wrapper, z-index 100
- `.tp-nav` -- The pill-shaped navigation bar
- `.tp-nav-dark` / `.tp-nav-light` -- Theme variants
- `.tp-nav-scrolled` -- Applied when `scrollY > 40`
- `.tp-nav-menu-open` -- Mobile menu open state

### Text content

| Element | Text |
|---|---|
| Nav link 1 | `Features` |
| Nav link 2 | `Stats` |
| Nav link 3 | `Pricing` |
| Nav link 4 | `Help` |
| CTA button | `Get the app` (with mobile phone icon) |
| Mobile menu links | Same as above + `Get the app` as `.tp-nav-mobile-cta` |

### Assets

| Asset | Path |
|---|---|
| Light theme logo | `/assets/logo_light.svg` |
| Dark theme logo | `/assets/Logo_dark.svg` |
| Icon-only logo (scrolled state) | `/assets/logo_cion.svg` |
| CTA phone icon | `/device-mobile-camera.svg` |

### Layout
- Fixed at top of viewport, centered horizontally
- Pill shape: `border-radius: 999px`, `max-width: 820px`, `height: 52px`
- Flexbox: logo left, links centered, CTA right
- Backdrop blur: `blur(24px)`
- On scroll: pill narrows to `max-width: 660px`, full logo hides, icon logo shows

### Theme switching behavior
- Nav theme is determined by which section the nav center (26px from top) overlaps with
- Sections declare their theme via `data-nav-theme="light"` or `data-nav-theme="dark"`
- Dark theme: semi-transparent white border/bg, white link text
- Light theme: semi-transparent black border, dark link text

### Animations
- Width transition: `0.65s cubic-bezier(0.87, 0, 0.13, 1)` on max-width
- Background/border transitions: `0.5s ease`
- Logo opacity: `0.3s ease`

### Mobile (max-width: 768px)
- Nav links hidden, hamburger button shown
- CTA button stays visible, smaller (font-size: caption, height: 30px)
- Hamburger animates to X when open (3 spans rotate)
- Mobile dropdown menu: full-width, dark semi-transparent bg with blur
- Menu slides open with `max-height` transition (0 to 400px, 0.35s)
- Mobile CTA styled as white pill button

---

## Section 2: Hero (TPHero)

### CSS classes
- `.tp-hero` -- Section wrapper, `background: #f5f5f5`
- `.tp-hero-content` -- Centered content container
- `.tp-hero-h1` -- Main headline
- `.tp-hero-sub` -- Subtitle paragraph
- `.tp-hero-waitlist` -- Email form row
- `.tp-hero-waitlist-success` -- Success state

### Text content

| Element | Text |
|---|---|
| H1 headline | `Your poker game,` (line break) `fully tracked.` |
| Subtitle | `The only app that tells you everything about your game. Real-time stats, opponent reads, and hand history -- all in one place.` |
| Email placeholder | `Enter your email` |
| Error placeholder | `Something went wrong. Try again.` |
| Submit button | `Join the waitlist` |
| Loading state | `Joining...` |
| Success message | `You're on the list!` (with green checkmark SVG) |

### Layout
- Centered flexbox column layout
- `max-width: 1150px`, padding `140px 40px 64px`
- `gap: 24px` between elements
- H1: Playfair Display, `--type-h1` size (clamp 44px - 80px)
- Subtitle: Inter, 18px, `rgba(0,0,0,0.55)`, max-width 500px
- Email form: pill shape (`border-radius: 999px`), white bg, max-width 440px
- Submit button: black bg, white text, 14px font-weight 600

### data-nav-theme
`light`

### Animations/Interactions
- **Scroll parallax**: As user scrolls, content applies blur (up to 14px), fades (to 10% opacity), and shifts up (24px) using quadratic easing
- **Waitlist success**: Fade-in animation (`tp-fade-in`, 0.35s, scale 0.95 to 1)
- Button hover: `opacity: 0.8`
- Button disabled: `opacity: 0.6`, `cursor: not-allowed`

### Firebase integration
- On form submit, calls `submitToWaitlist(email)` which writes to `waitlist` collection

### Mobile
- Padding reduces, content fills width

### Large screens
- `min-width: 1440px`: padding-top increases to 160px
- `min-width: 2560px`: padding-top increases to 200px

---

## Section 3: Tab/Mockup Section (TPBgSection)

### CSS classes
- `.tp-bg-section` -- Tall section (`height: 500vh`) that drives scroll-based tab switching
- `.tp-bg-sticky` -- Sticky viewport container (`position: sticky; top: 0; height: 100vh`)
- `.tp-tab-info` -- Left-side text panel (absolutely positioned)
- `.tp-tabbar-wrap` -- Bottom-center tab bar
- `.tp-bg-mockup-wrap` -- Phone mockup container

### data-nav-theme
`light`

### Tab data (4 tabs)

| # | Icon | Label | Mockup image |
|---|---|---|---|
| 1 | File/document SVG | `Hand-by hand logging` | `/phonemain_1.png` |
| 2 | Bar chart SVG | `7 Core Statistics` | `/phonemain_2.png` |
| 3 | Users SVG | `Play Style Detection` | `/phonemain_3.png` |
| 4 | Download SVG | `Download` | `/phonemain_3.png` |

### Tab info panel content (left side)

**Tab 1 -- Logging:**
- Eyebrow: `LOGGING`
- Title: `Every hand,` (newline) `captured live.`
- Body: `Log each action as it happens -- raises, calls, folds, and showdowns. Your full hand history builds automatically in real time.`

**Tab 2 -- Statistics:**
- Eyebrow: `STATISTICS`
- Title: `Seven stats` (newline) `that tell the truth.`
- Body: `VPIP, PFR, 3-bet %, aggression factor, and more. Know exactly where you're winning and where you're leaking chips.`

**Tab 3 -- Play Style:**
- Eyebrow: `PLAY STYLE`
- Title: `Know your` (newline) `game inside out.`
- Body: `Final Table reads your tendencies and classifies your style -- TAG, LAG, Nit, or Calling Station -- so you can adjust.`

**Tab 4 -- Download:**
- Eyebrow: `DOWNLOAD`
- Title: `Ready when` (newline) `you are.`
- Body: `Free to download on iOS and Android. No credit card required. Your first session takes 60 seconds to set up.`

### Layout
- Section is 500vh tall -- user scrolls through 5 viewport heights
- Sticky container locks to viewport, centering content
- Left info panel: positioned absolutely at `left: max(48px, calc((100vw - 1150px) / 2))`, 320px wide
- Phone mockup: 560px wide, `height: min(96vh, 800px)`, offset `translateX(50px) translateY(-20px)`
- Tab bar: fixed at bottom 24px, centered, white pill with rounded tabs

### Tab bar styling
- White bg, `border-radius: 120px`, `padding: 10px`
- Individual tabs: `border-radius: 50px`, transparent bg
- Active tab: black bg, white text, icon inverted to white
- Inactive: transparent bg, 40% opacity text, icon at 50% opacity
- Transition: `0.35s cubic-bezier(0.4, 0, 0.2, 1)`

### Animations
- Tab switches at each 100vh scroll boundary
- Info panel slides: `opacity 0.55s` and `translateY(16px)` transition; active slide returns to `translateY(0)` and `opacity: 1`
- Mockup crossfade: `opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)`
- Eyebrow text: 12px uppercase, 600 weight, `letter-spacing: 0.08em`

### Mobile (max-width: 900px)
- Sticky container becomes vertical column (`flex-direction: column`), padding-top 72px
- Info panel becomes relative, full width, centered text
- Mockup shrinks: `max-width: 420px`
- Title font shrinks: `clamp(1.6rem, 5vw, 2.2rem)`

### Mobile tab bar (max-width: 768px)
- Tab labels hidden except active tab
- Tab padding reduces, icon size increases to 22px
- Tab bar gap increases to 4px

---

## Section 4: Stacking Cards / Problems (TPProblems)

### CSS classes
- `.sc-section` -- Dark bg (`#0a0a0a`), dynamic height (`N * 130vh` desktop, `N * 100vh` mobile)
- `.sc-sticky` -- Sticky 100vh viewport lock
- `.sc-inner` -- 2-column grid layout
- `.sc-left` -- Left panel with stat text and question
- `.sc-right` -- Right panel with stacking cards
- `.sc-card` -- Individual glass-morphism card

### data-nav-theme
`dark`

### Content (8 cards)

Each card has a left-side text panel (stat + question) and a right-side card (icon + body text):

**Card 1 (Icon: Eye)**
- Stat: `Live poker players play` **`~25-30 hands/hour`** `on average.`
- Question: `How many of those hands do you actually remember?`
- Body: `Final Table tracks every hand you play, so you can review every action and find leaks you never knew you had.`

**Card 2 (Icon: Activity)**
- Stat: `Online players review thousands of hands to find leaks.`
- Question: `How do you spot that you overfold rivers vs aggression with zero data?`
- Body: `Final Table logs your decisions across hundreds of hands and surfaces the patterns so your leaks have nowhere to hide.`

**Card 3 (Icon: Scale)**
- Stat: `You study GTO solvers for hours before a session.`
- Question: `But can you actually compare your live play to what the solver says?`
- Body: `Final Table lets you export your logged hands and review them against solver outputs -- bridging the gap between study and real play.`

**Card 4 (Icon: TrendingUp)**
- Stat: `Ask any live player their win rate. Most guess.`
- Question: `Do you actually know your $/hr by stakes, casino, or game type?`
- Body: `Final Table tracks every session with precision -- win rate, duration, stakes -- so you always know exactly where you stand.`

**Card 5 (Icon: Crosshair)**
- Stat: `Position is the single biggest edge in poker.`
- Question: `Do you know your actual stats from the BTN vs the BB vs UTG?`
- Body: `Final Table breaks down your performance by position, so you can see where you print money and where you bleed chips.`

**Card 6 (Icon: Clock)**
- Stat: `Hour 1 you and Hour 7 you are not the same player.`
- Question: `Can you tell when your game starts falling apart during a long session?`
- Body: `Final Table tracks your performance over time within a session, so you can see exactly when tilt creeps in -- and learn when to walk away.`

**Card 7 (Icon: Users)**
- Stat: `"He always 3-bets light." "She never folds the river."`
- Question: `Are those real reads or just feelings from one memorable hand?`
- Body: `Final Table builds opponent profiles from logged hands -- real stats, real tendencies -- so your reads are backed by data, not memory.`

**Card 8 (Icon: BarChart2)**
- Stat: `Moving up in stakes is the dream. Going broke is the nightmare.`
- Question: `Are you making that decision based on actual ROI or just a hot streak?`
- Body: `Final Table gives you the bankroll data to make smart stake decisions -- track your true ROI and know when you're actually ready.`

### Layout
- 2-column grid, 80px gap, max-width 1150px
- Left column: 340px height, displays current card's stat + question
- Right column: 340px height, overflow hidden, cards stack from bottom
- Card number displayed: `01` through `08` (large light font, 200 weight)
- Bottom fade gradient on right column (35% height, `linear-gradient(to bottom, transparent, #0a0a0a)`)

### Card styling
- White/light gradient background: `linear-gradient(160deg, #ffffff 0%, #f0f0f0 100%)`
- `border-radius: 20px`, `padding: 44px`
- Heavy box shadow for stacked depth effect
- Icon color: `#2a7a25` (dark green)

### Animations
- **Scroll-driven stacking**: Cards enter from bottom of container, lerp-smoothed (factor 0.1) for silky movement
- **Peek stacking**: Once a card reaches active position, subsequent cards push it up by 10px (`PEEK = 10`)
- **Letter reveal**: Question text letters individually transition from `rgba(255,255,255,0.18)` to full white, revealing progressively as user scrolls during the 0.5 scroll-unit window before the next card enters
- **Left text entrance**: `sc-left-in` keyframe -- opacity 0 to 1, translateY(14px) to 0, 0.45s
- **Icon draw**: SVG stroke-dasharray animation (`sc-icon-draw`, 1.2s) -- icon strokes draw on when card enters
- **Card z-index**: Dynamically managed -- entering card gets `z-index: n + i`, settled cards get `z-index: i`

### WebGL Shader Background
- `SCShaderBg` component renders a `<canvas>` with custom vertex/fragment shaders
- Green-tinted organic noise pattern with animated time uniform
- Colors: dark greens (`rgb(0.04, 0.10, 0.05)` to `rgb(0.07, 0.22, 0.10)`)
- Note: This component is defined but NOT rendered in the current page composition

### Mobile (max-width: 860px)
- Grid becomes single column, 24px gap
- Left column: auto height, smaller fonts (num: 2rem, question: 1.4rem)
- Right column: 260px height
- Cards: 28px padding, 16px border-radius
- Section height per card: 100vh (vs 130vh desktop)
- Container height: 260px (vs 340px desktop)
- Active card Y position: 32px (vs 48px desktop)

---

## Section 5: Features Showcase Bento Grid (TPFeaturesShowcase)

### CSS classes
- `.fs-section` -- White bg, 120px vertical padding
- `.fs-container` -- 1150px max-width
- `.fs-head` -- 2-column grid header
- `.fs-grid` -- 3-column bento grid
- `.fs-card` -- Individual feature card
- `.fs-card-1` / `.fs-card-2` / `.fs-card-3` -- Span 1, 2, or 3 columns

### data-nav-theme
`light`

### Header text

| Element | Text |
|---|---|
| Title (`.fs-title`) | `Built for every` (line break) `kind of player.` |
| Subtitle (`.fs-subtitle`) | `From casual home games to serious grinders -- Final Table has the tools to match how you play.` |

### 10 Feature Cards

Each card has a visual area (`.fs-visual`) and text body (`.fs-card-body`).

---

#### Card 1: Opponent Profiles (wide, spans 2 columns)

**Visual**: Opponent profile card showing:
- Avatar: `MR`
- Name: `Mike Reynolds`
- Badge: `LAG` (red badge)
- Hands: `312 hands`
- Stat bars:
  - `VPIP` -- 51% (red `#ef4444`)
  - `PFR` -- 38% (orange `#f97316`)
  - `3-bet` -- 15% (blue `#60a5fa`)
  - `Agg` -- 42% (purple `#a78bfa`)

**Title**: `Opponent Profiles`
**Description**: `Automatically build profiles on the players you face. Track their stats, classify their style, and review every hand you've played against them.`

**Animation**: Bar fills grow with `fs-bar-grow` (4.5s loop), staggered 0.15s per bar.

---

#### Card 2: Bankroll Tracking (narrow, spans 1 column)

**Visual**: SVG line chart (blue gradient fill) + goal progress card:
- Goal label: `Goal`
- Goal amount: `$5,000`
- Progress: `$3,420 . 68% reached`

**Title**: `Bankroll Tracking`
**Description**: `Set a bankroll goal and watch your progress. Pinch-to-zoom earnings chart shows cumulative results over time.`

**Animation**: Chart line draws with `fs-chart-draw` (6s loop). Goal fill grows with `fs-goal-grow` (6s loop).

---

#### Card 3: Quick Session Logger (narrow, spans 1 column)

**Visual**: Session log card:
- `Buy-in` -- `$200`
- `Cash-out` -- `$485`
- `Duration` -- `3h 40m`
- `Net profit` -- `+$285` (green)

**Title**: `Quick Session Logger`
**Description**: `Don't want full hand tracking? Just log your buy-in, cash-out, and session duration for a quick profit/loss record.`

**Animation**: Rows slide in from left with `fs-slide-left` (4.5s loop), staggered 0.15s per row.

---

#### Card 4: AI Hand Analysis (wide, spans 2 columns)

**Visual**: Hand history + AI analysis:
- Hand rows:
  - `UTG` -- `Raise 3x . $6` -- `A(spade) K(heart)`
  - `BTN` -- `3-bet . $18`
  - `UTG` -- `Call`
- AI bubble: chip labeled `AI`, message: `Consider a 4-bet here. AK plays better as a 4-bet than a flat call vs this player's 3-bet frequency.`

**Title**: `AI Hand Analysis`
**Description**: `Get GTO-based feedback on your hands. The AI reviews your decisions and suggests improvements.`

**Animation**: Hand rows slide up with `fs-slide-up` (5s loop), staggered. AI bubble uses `fs-bubble-in` (5s loop, delay 0.68s).

---

#### Card 5: Multi-Table Tournaments (wide, spans 2 columns)

**Visual**: Tournament table list:
- `Table 1` -- 9/9 players -- `Running` (green tag)
- `Table 2` -- 8/9 players -- `Running` (green tag)
- `Table 3` -- 6/9 players -- `Breaking` (orange tag)
- `Final Table` -- 4/9 players -- `Live` (red tag)

Player pips: filled circles for seated players, hollow for empty seats.

**Title**: `Multi-Table Tournaments`
**Description**: `Run live tournaments with multiple tables, real-time rankings, final standings, and prize distribution.`

**Animation**: Rows slide up with `fs-slide-up` (4.5s loop), staggered 0.14s per row.

---

#### Card 6: Club Management (narrow, spans 1 column)

**Visual**: Member list:
- `A` -- `Alex` -- `Admin` (green badge)
- `J` -- `Jordan` -- `Dealer` (blue badge)
- `S` -- `Sam` -- `Member` (gray badge)
- `C` -- `Chris` -- `Member` (gray badge)

**Title**: `Club Management`
**Description**: `Create or join a poker club. Manage members, roles, tables, and run events -- all from the app.`

**Animation**: Rows slide in from left with `fs-slide-left` (4.5s loop), staggered.

---

#### Card 7: Dealer Mode (narrow, spans 1 column)

**Visual**: Centered microphone icon with 3 pulsing concentric rings + voice command text:
- Command: `"Next hand. Blinds: 200/400"`

**Title**: `Dealer Mode`
**Description**: `Dealers can run a table hands-free using voice commands. Players follow along on their own phones in real time.`

**Animation**: Rings pulse with `dealerPulse` (2.4s, staggered 0.5s per ring). Command text fades with `fs-fade-loop` (5s loop).

---

#### Card 8: QR Seat Assignments (narrow, spans 1 column)

**Visual**: QR code grid (10x10 pattern of cells) + seat info:
- Seat: `Seat 4`
- Sub: `Table 1 . $2/$5`

**Title**: `QR Seat Assignments`
**Description**: `Players scan a QR code to claim their seat. No manual setup, no confusion.`

**Animation**: QR cells pop in with `fs-qr-pop` (4s loop), staggered by index (5ms per cell).

---

#### Card 9: Real-Time Sync (narrow, spans 1 column)

**Visual**: 3 device outlines connected by animated dot chains.
- Label: `Instant broadcast . all devices`

**Title**: `Real-Time Sync`
**Description**: `Every action broadcasts instantly to all players and spectators via live updates.`

**Animation**: Sync dots pulse with `syncPop` (1.5s, staggered 0.2s per dot).

---

#### Card 10: Cash Game Waitlists (full width, spans 3 columns)

**Visual**: 3-column stakes-scoped waitlist:

**$1/$2 NLH:**
- #1 `Alex M.` -- `8m`
- #2 `Jordan K.` -- `6m`
- #3 `Sam R.` -- `4m`

**$2/$5 NLH:**
- #1 `Chris P.` -- `3m`
- #2 `Mike R.` -- `1m`

**$5/$10 NLH:**
- #1 `Taylor B.` -- `12m`

**Title**: `Cash Game Waitlists`
**Description**: `Stakes-scoped waitlists let players queue for the game they want. Admins manage seating from the dashboard.`

**Animation**: Columns slide up with `fs-col-up` (5.5s loop, staggered 0.2s). Rows within columns slide left with `fs-slide-left` (5.5s loop, staggered).

---

### Bento grid responsive behavior

- **Desktop** (default): 3-column grid, 10px gap
- **Tablet** (max-width: 900px): 2-column grid; full-width card spans 2
- **Mobile** (max-width: 600px): 1-column; all cards span 1; waitlist columns become 2-col
- Container padding reduces to 20px on mobile

### Card entrance animation
- Cards start at `opacity: 0; transform: translateY(28px)`
- IntersectionObserver (threshold 0.12) adds `.fs-card--visible`
- Animation: `fs-card-in` 0.55s with staggered delay (`--i * 80ms`)
- `prefers-reduced-motion`: All animations disabled, elements shown statically

---

## Section 6: Reserve Username (TPReserveUsername)

### CSS classes
- `.ru-section` -- Light gray bg (`#f5f5f5`), 120px padding, border-top
- `.ru-inner` -- 2-column grid (1fr 1fr), 80px gap
- `.ru-left` -- Copy + FAQ column
- `.ru-right` -- Form card column
- `.ru-card` -- White form card with sticky positioning

### data-nav-theme
`light`

### Left column text content

| Element | Text |
|---|---|
| Eyebrow (`.ru-eyebrow`) | `EARLY ACCESS` |
| Title (`.ru-title`) | `Reserve your username` (line break) `before anyone else does.` |
| Body (`.ru-body`) | `Claim your permanent handle ahead of launch. Usernames are first-come, first-served -- once it's gone, it's gone.` |

### Social proof

- 5 avatar circles with letters: `A`, `J`, `K`, `Q`, `T`
- Overlapping stack with green gradient backgrounds
- Text: **`2,400+`** `players already on the waitlist`

### FAQ accordion (4 items)

**Q1**: `Can I change my username later?`
**A1**: `Once reserved, your username is locked in. Choose carefully -- this becomes your permanent handle in Final Table.`

**Q2**: `Is reserving free?`
**A2**: `Yes. Reserving your username is completely free. Just enter your email and desired handle below.`

**Q3**: `What if my username is taken?`
**A3**: `Usernames are first-come, first-served. If your preferred handle is gone, try a variation -- underscores and numbers are fair game.`

**Q4**: `When will the app launch?`
**A4**: `Final Table is in closed beta. Waitlist members get early access before the public launch.`

### Right column -- Form card

| Element | Text |
|---|---|
| Card title (`.ru-card-title`) | `Claim your handle` |
| Card subtitle (`.ru-card-sub`) | `Free . Takes 10 seconds` |
| Email label | `Email` |
| Email placeholder | `you@example.com` |
| Email hint | `Your future sign-in email -- can't be changed later.` |
| Username label | `Username` with character count `0/20` |
| Username prefix | `@` |
| Username placeholder | `yourhandle` |
| Username hint | `Letters, numbers and underscores only. 3-20 characters.` |
| Submit button | `Reserve my spot ->` |
| Loading state | `Reserving...` |
| Taken error | `That username is already taken. Try a different one.` |
| Generic error | `Something went wrong. Please try again.` |

### Success state

| Element | Text |
|---|---|
| Chip | `Reserved` (with checkmark) |
| Title | `You're on the list.` |
| Body | `@{username}` `is reserved for you. We'll reach out when Final Table opens.` |
| Reset button | `Reserve another` |

### Layout
- Form card: white bg, rounded 24px, 40px padding, sticky at `top: 88px`
- Background glow: radial gradient green (`rgba(8,168,91,0.07)`), 700px circle, positioned top-right
- Username input: `@` prefix absolutely positioned inside input
- Username validation: strips non-alphanumeric/underscore, max 20 chars

### Animations/Interactions
- FAQ chevron rotates 180 degrees on open
- FAQ answer: `max-height` transition (0 to 120px, 0.35s)
- Submit button hover: `opacity: 0.82; translateY(-1px)`
- Input focus: green border (`rgba(10,122,60,0.4)`), white bg

### Firebase integration
- Calls `submitNicknameClaim(username, email)`:
  1. Checks if username exists in `usernames` collection (live users)
  2. Checks if username already claimed in `nickname_claims` collection with `status: 'pending'`
  3. If available, saves claim to `nickname_claims`
- Also calls `submitToWaitlist(email)` on success (silently catches errors)

### Mobile (max-width: 900px)
- Grid becomes single column, 48px gap
- Card loses sticky positioning
- Section padding reduces to 80px
- Background glow hidden
- Container padding: 20px

---

## Section 7: Contact (TPContact)

### CSS classes
- `.ct-section` -- Dark bg (`#0a0a0a`), 120px padding
- `.ct-inner` -- 2-column grid (1fr 1fr), 80px gap
- `.ct-left` -- Copy column
- `.ct-right` -- Form column

### data-nav-theme
`dark`

### Left column text content

| Element | Text |
|---|---|
| Eyebrow (`.ct-eyebrow`) | `GET IN TOUCH` |
| Title (`.ct-title`) | `Questions? We'd love to hear from you.` |
| Body (`.ct-body`) | `Whether you're curious about features, need help with your account, or just want to say hello -- drop us a message.` |
| Detail 1 label | `RESPONSE TIME` |
| Detail 1 value | `Usually within 24 hours` |
| Detail 2 label | `SUPPORT EMAIL` |
| Detail 2 value | `support@finaltable.app` |

### Right column -- Contact form

| Element | Text |
|---|---|
| Name label | `Name` |
| Name placeholder | `Your name` |
| Email label | `Email` |
| Email placeholder | `you@example.com` |
| Message label | `Message` |
| Message placeholder | `Tell us what's on your mind...` |
| Submit button | `Send message` |
| Loading state | `Sending...` |
| Error message | `Something went wrong. Please try again.` |

### Success state

| Element | Text |
|---|---|
| Icon | `checkmark` (48px green circle) |
| Title | `Message sent` |
| Body | `Thanks for reaching out. We'll get back to you shortly.` |
| Reset button | `Send another` |

### Layout
- Name and Email side-by-side in 2-column grid row
- Message textarea: 5 rows
- Submit button: green bg (`#a2f69a`), black text, pill shape
- Success card: dark bg with green-tinted border/bg
- Form inputs: semi-transparent white bg, subtle border, rounded 12px

### Firebase integration
- Calls `window.submitContactForm(name, email, message)` (uses the global function pattern)
- Note: The contact form function is imported but called via `window.submitContactForm`

### Mobile (max-width: 768px)
- Grid becomes single column, 48px gap
- Name/Email row becomes single column
- Section padding reduces to 80px

---

## Section 8: Footer (TPFooter)

### CSS classes
- `.mf-footer` -- White bg
- `.mf-inner` -- 1150px max-width, 24px horizontal padding
- `.mf-grid` -- 3-column grid (2fr 1fr 1fr)
- `.mf-brand` -- Brand column (logo + tagline + socials)
- `.mf-col` -- Link column

### Text content

**Brand column:**
- Logo: `/assets/Logo_dark.svg` (22px height)
- Tagline: `Your poker game, fully tracked.`

**Resources column:**
| Link | Href |
|---|---|
| `Features` | `#` |
| `Stats` | `#` |
| `Pricing` | `#` |
| `Help` | `#` |
| `Contact Support` | `#` |

**Company column:**
| Link | Href |
|---|---|
| `About Us` | `#` |
| `Careers` | `#` |
| `Brand assets` | `#` |
| `Privacy Policy` | `/privacy.html` |
| `Terms of Service` | `/terms.html` |

**Social links (6 icons in rounded square buttons):**
- Facebook, GitHub, Instagram, LinkedIn, Twitter/X, YouTube
- All link to `#` (placeholder)
- Icons are custom inline SVG components (16x16)
- Button style: 30x30px, 1px border, 6px border-radius

**Copyright:**
`(c) Final Table. All rights reserved {year}` (dynamic year from `new Date().getFullYear()`)

### Layout
- Top border: 1px `rgba(0,0,0,0.08)` separator
- 3-column grid for content
- Bottom border + copyright centered below
- Column headers: 12px uppercase, 0.08em letter-spacing, 40% opacity
- Links: 14px, 70% opacity, hover underline

### Mobile (max-width: 768px)
- Grid becomes 2 columns
- Brand column spans both columns

---

## Firebase Integration

### Configuration
Firebase project: `poker-tracker-52df8`

```
apiKey: "AIzaSyDTw_1lOHmIl_gDY3ex-N_l8NLxRzy6AtA"
authDomain: "poker-tracker-52df8.firebaseapp.com"
projectId: "poker-tracker-52df8"
storageBucket: "poker-tracker-52df8.firebasestorage.app"
appId: "1:311745459306:web:4d53385d198139f8d00613"
measurementId: "G-GZND8S84WX"
```

### Firestore Collections

#### `waitlist`
- **Written by**: Hero waitlist form, Reserve username form (as side effect)
- **Fields**: `email`, `source: 'final-table'`, `timestamp` (server)

#### `nickname_claims`
- **Written by**: Reserve username form
- **Fields**: `nickname` (lowercase, trimmed), `email` (lowercase, trimmed), `source: 'final-table-web'`, `timestamp` (server), `status: 'pending'`
- **Read operations**: Query by `nickname` + `status == 'pending'` to check availability

#### `usernames`
- **Read only**: Checked by `submitNicknameClaim` to see if username is taken by a live user
- **Lookup**: Document ID = normalized username

#### `contact_submissions`
- **Written by**: Contact form
- **Fields**: `name`, `email`, `message`, `source: 'final-table'`, `timestamp` (server), `status: 'new'`

### Exported Functions

| Function | Parameters | Used in |
|---|---|---|
| `submitToWaitlist(email)` | email string | Hero, Reserve Username |
| `submitNicknameClaim(nickname, email)` | nickname string, email string | Reserve Username |
| `submitContactForm(name, email, message)` | name, email, message strings | Contact (via `window.submitContactForm`) |

---

## Unused / Legacy Components

The following components and data are defined in `TestPage.jsx` but are NOT rendered in the current page composition:

### TPFeaturesGrid
- A Chronicle-style editorial layout with dark bg (`#0a0a0a`)
- Contains two phone screenshots and a 10-item feature list
- Section title: `The core experience.`
- Subtitle: `Hand-by-hand logging and seven statistics that give you a complete picture of your game.`
- Two hero cells with phone images (`/phonemain_1.png`, `/phonemain_2.png`)
- 10 supporting features in a 2-column spec-sheet list (same data as `fgBottomFeatures` array)

### TPMoreReasons
- Light section with heading and 2 cards
- Heading: `More reasons you'll want to bring Final Table to your next game`
- Card 1: **Club sharing.** `Share Final Table with your home game club -- everyone tracks hands together.`
- Card 2: **Privacy first.** `All of your hand history and stats are viewable only by you.`

### TPTabBar
- Standalone tab bar component (used inline in TPBgSection instead)

### tabCards (notification cards data)
- 4 sets of notification cards corresponding to each tab, not currently rendered

### heroTabs
- Tab data for the hero section (separate from `tabs` array), not currently rendered

### darkTabs
- Empty array (no tabs trigger dark nav theme)

### SCShaderBg
- WebGL shader background component defined but not rendered

### GooeyFilter
- SVG gooey effect filter component defined but not rendered

### problems array
- Alternative text format for the stacking cards data (superseded by `STACK_CARDS`)

---

## Assets Summary

### Local assets (in `/public` or root)

| Path | Usage |
|---|---|
| `/assets/logo_light.svg` | Navbar light theme logo |
| `/assets/Logo_dark.svg` | Navbar dark theme logo, footer logo |
| `/assets/logo_cion.svg` | Navbar scrolled icon-only logo |
| `/device-mobile-camera.svg` | Navbar CTA phone icon |
| `/phonemain_1.png` | Tab section mockup 1, features grid |
| `/phonemain_2.png` | Tab section mockup 2, features grid |
| `/phonemain_3.png` | Tab section mockup 3 and 4 |
| `/Frame 9.png` | Hero background (defined but not rendered) |
| `/phone_mockup_1.png` | Hero mockup 1 (defined but not rendered) |
| `/phone_mockup_2.png` | Hero mockup 2 (defined but not rendered) |
| `/phone_mockup_3.png` | Hero mockup 3 (defined but not rendered) |
| `/phone_mockup_4.png` | Hero mockup 4 (defined but not rendered) |

### Remote assets (Figma CDN)

| Variable | Usage |
|---|---|
| `IMG_DARK_CARD1_BG` | Dark section card backgrounds (not rendered) |
| `IMG_DARK_CARD2_BG` | Dark section card backgrounds (not rendered) |
| `IMG_DARK_CARD2_INNER` | Dark section inner image (not rendered) |
| `IMG_DARK_CARD3_BG` | Dark section card backgrounds (not rendered) |
| `IMG_DARK_CARD4_BG` | Dark section card backgrounds (not rendered) |
| `IMG_PHONE_BACK` | Feature section back phone image |
| `IMG_PHONE_FRONT` | Feature section front phone image |
| `IMG_MORE_ICON1` | More reasons icon 1 (not rendered) |
| `IMG_MORE_ICON2` | More reasons icon 2 (not rendered) |

### Inline SVG data URIs

| Variable | Description |
|---|---|
| `IMG_TAB_ICON_1` | File/document icon (Lucide-style) |
| `IMG_TAB_ICON_2` | Bar chart icon (Lucide-style) |
| `IMG_TAB_ICON_3` | Users icon (Lucide-style) |
| `IMG_TAB_ICON_4` | Download icon (Lucide-style) |
