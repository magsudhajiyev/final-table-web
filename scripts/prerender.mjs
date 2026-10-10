// Post-build prerender. Runs after `vite build` (see package.json "build").
//
// Why: the site is a client-rendered SPA, so every route used to be served the
// same index.html shell — same <title>, same canonical (the homepage), and an
// empty <div id="root">. Crawlers, link-preview bots and AI agents that don't run
// JavaScript saw one page with no content. This script bakes, per route:
//   - its own <title>, meta description, canonical, Open Graph / Twitter tags
//   - a plain-HTML copy of the page content inside #root (replaced by React on
//     mount; visually hidden for JS users, shown when JavaScript is disabled)
//   - real <a href> store links
//
// Output layout (served by the rewrites in vercel.json):
//   dist/index.html                  prerendered homepage
//   dist/prerendered/shell.html      the untouched SPA shell (for /hand/*, /admin, /delete-account)
//   dist/prerendered/<name>.html     /about, /blog, /privacy, /terms
//   dist/prerendered/blog/<slug>.html one per post in content/blog/
//
// The generated files live only in dist/ — nothing here is committed.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const out = join(dist, 'prerendered')

const SITE = 'https://www.finaltable.io'
const APP_STORE_URL = 'https://apps.apple.com/us/app/final-table/id6760188970'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.finaltable.app'
const DEFAULT_IMAGE = `${SITE}/og-image-v2.png`

// ---------------------------------------------------------------- helpers

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function fail(msg) {
  console.error(`[prerender] ${msg}`)
  process.exit(1)
}

// Replace the first match of `re`; fail the build loudly if the template no
// longer contains the tag (so a head refactor can't silently drop metadata).
function swap(html, re, replacement, label) {
  if (!re.test(html)) fail(`template is missing ${label} — update scripts/prerender.mjs`)
  return html.replace(re, () => replacement)
}

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, content: raw }
  const [, yaml, content] = m
  const data = {}
  for (const line of yaml.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const val = kv[2].trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      data[kv[1]] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    } else {
      data[kv[1]] = val.replace(/^["']|["']$/g, '')
    }
  }
  return { data, content }
}

// English copy lives in src/i18n.jsx (first occurrence of a key = the `en` block).
const i18nSrc = readFileSync(join(root, 'src', 'i18n.jsx'), 'utf8')
function enString(key) {
  const re = new RegExp(`'${key.replace(/\./g, '\\.')}':\\s*'((?:\\\\'|[^'\\\\])*)'`)
  const m = re.exec(i18nSrc)
  if (!m) {
    console.warn(`[prerender] i18n key not found, skipped: ${key}`)
    return null
  }
  return m[1].replace(/\\'/g, "'")
}

// ---------------------------------------------------------------- posts

const blogDir = join(root, 'content', 'blog')
const posts = readdirSync(blogDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md')
  .map((f) => {
    const { data, content } = parseFrontmatter(readFileSync(join(blogDir, f), 'utf8'))
    const slug = data.slug || f.replace(/\.md$/, '')
    const date = data.date ? new Date(data.date) : new Date(0)
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date,
      updated: data.updated ? new Date(data.updated) : null,
      author: data.author || 'Final Table',
      keywords: data.keywords || [],
      image: data.image || '/og-image-v2.png',
      readingMinutes: data.readingMinutes || Math.max(1, Math.round(content.split(/\s+/).length / 200)),
      html: marked.parse(content),
    }
  })
  .sort((a, b) => b.date - a.date)

// ---------------------------------------------------------------- bodies

const downloadBlock = () =>
  `<p>Download Final Table: <a href="${APP_STORE_URL}">App Store</a> · <a href="${PLAY_STORE_URL}">Google Play</a></p>`

const topNav = () =>
  `<nav aria-label="Final Table"><a href="/">Final Table</a> · <a href="/blog">Blog</a> · <a href="/about">About</a></nav>`

const footerNav = () =>
  `<footer><p><a href="/">Home</a> · <a href="/blog">Blog</a> · <a href="/about">About</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a></p></footer>`

// Every claim below is taken from the verified-facts blocks of the marketing
// master doc. Keep it in sync with it (and with public/llms.txt).
function homeBody() {
  return `
${topNav()}
<h1>Final Table tracks every hand you play — not just your profit at the end of the night.</h1>
<p>Final Table is a mobile poker tracking app for live, in-person poker. Log actions street by street and watch your real stats build from your actual play. After enough hands, the app tells you what kind of player you are.</p>
${downloadBlock()}
<h2>What Final Table does</h2>
<ul>
<li><strong>Full hand logging.</strong> Log every action by every player on all four streets: fold, check, call, bet, raise and all-in. Side pots, chopped pots and dead-button situations are handled automatically, and undo restores the exact previous state. Works for cash games and tournaments, including blind level changes and BB ante formats.</li>
<li><strong>Quick session logging.</strong> Short on time? Enter buy-in and cash-out for a cash game or tournament, with rebuys and add-ons. Profit, hourly rate and ROI still build.</li>
<li><strong>7 core statistics.</strong> VPIP, PFR, 3-bet%, fold-to-3-bet%, c-bet%, steal% and check-raise%, plus win rate and aggression factor, calculated from your logged hands with position breakdowns.</li>
<li><strong>Play-style detection.</strong> After 50 logged hands the app classifies your game as TAG, LAG, Nit, Calling Station, Maniac or Balanced.</li>
<li><strong>Personal 13×13 range grid.</strong> Every logged hand with known hole cards fills a grid of 169 hand classes with raise, call, check and fold frequencies, filterable by position, stack depth and scenario.</li>
<li><strong>Opponent book.</strong> Profiles for the players you face, with notes, color tags and playing-style tags.</li>
<li><strong>Live scouting mode.</strong> An opt-in mode that keeps logging opponents' preflop actions and the winner after you fold, without distorting your own postflop stats.</li>
<li><strong>Tournament analytics and bankroll.</strong> ITM%, ROI, average finish, best finish, final tables, hourly rate, average buy-in and average field size, with cash and tournament results kept separate. Set a bankroll goal and chart your earnings over time.</li>
<li><strong>AI hand review.</strong> A street-by-street written analysis of any logged hand, written in the app's language and adapted to your experience level, saved so you can revisit it.</li>
<li><strong>GTO training drills.</strong> Practice open-raise, 3-bet, blind-defense and Nash push-fold drills against bots, with instant grading.</li>
<li><strong>Clubs and events.</strong> Create a poker club, invite players and dealers, and host cash games and multi-table tournaments with QR-code seat assignments, live rankings on every phone and a full-screen leaderboard for the venue TV. The club owner pays for one Club subscription; members, dealers and players use the app free.</li>
<li><strong>Dealer voice logging.</strong> A dealer narrates the hand and speech recognition logs it hands-free, while players follow the live hand on their own phones.</li>
<li><strong>Exports and sharing.</strong> Export sessions as PokerStars-format hand histories or CSV, or share a single hand as a link anyone can open.</li>
<li><strong>Offline-first.</strong> Everything saves locally on your phone and syncs when you are back online.</li>
<li><strong>11 languages.</strong> English, German, Spanish, French, Italian, Polish, Portuguese, Romanian, Russian, Slovak and Ukrainian. Poker terms stay in English.</li>
</ul>
<p>Final Table is a tracking and study tool. It does not host games, take bets or move money.</p>
${downloadBlock()}
${footerNav()}`
}

function aboutBody() {
  const paras = ['about.missionP1', 'about.missionP2', 'about.missionP3', 'about.missionP4', 'about.missionP5']
    .map(enString)
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n')
  const values = [1, 2, 3]
    .map((n) => [enString(`about.value${n}Title`), enString(`about.value${n}Desc`)])
    .filter(([t, d]) => t && d)
    .map(([t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`)
    .join('\n')
  return `
${topNav()}
<h1>About Final Table: make live poker smarter for everyone</h1>
${paras}
${values ? `<h2>What we believe</h2>\n<ul>\n${values}\n</ul>` : ''}
${downloadBlock()}
${footerNav()}`
}

// The legal text lives in React (PrivacyPage/TermsPage) and, mirrored, in the
// static public/privacy.html and public/terms.html. Reuse the static copy's
// <main> so these routes carry the real text. Falls back to a stub if the file
// changes shape.
function legalBody(file, heading, description) {
  let inner = ''
  try {
    const raw = readFileSync(join(root, 'public', file), 'utf8')
    const m = /<main class="container">([\s\S]*?)<\/main>/.exec(raw)
    if (m && !/<(script|style)/i.test(m[1])) inner = m[1].trim()
  } catch {
    // fall through to the stub
  }
  if (!inner) console.warn(`[prerender] could not read legal text from public/${file}; using a stub`)
  return `
${topNav()}
${inner || `<h1>${esc(heading)}</h1>\n<p>${esc(description)}</p>`}
${footerNav()}`
}

function blogIndexBody() {
  const items = posts
    .map((p) => `<li><h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2><p>${esc(p.description)}</p></li>`)
    .join('\n')
  return `
${topNav()}
<h1>Poker stats, ranges, and how to actually study your game</h1>
<p>Straight from the people who built the tracker. No fluff, correct math.</p>
<ul>
${items}
</ul>
${downloadBlock()}
${footerNav()}`
}

function postBody(p) {
  const date = p.date.toISOString().slice(0, 10)
  return `
${topNav()}
<article>
<h1>${esc(p.title)}</h1>
<p>By ${esc(p.author)} · ${date} · ${p.readingMinutes} min read</p>
${p.html}
</article>
${downloadBlock()}
${footerNav()}`
}

// ---------------------------------------------------------------- template

const shellPath = join(out, 'shell.html')
const distIndex = join(dist, 'index.html')
if (!existsSync(distIndex) && !existsSync(shellPath)) fail('dist/index.html not found — run `vite build` first')

mkdirSync(join(out, 'blog'), { recursive: true })
// First run: keep the pristine SPA shell. Re-runs reuse it (idempotent).
if (!existsSync(shellPath)) copyFileSync(distIndex, shellPath)
const shell = readFileSync(shellPath, 'utf8')

const PRERENDER_CSS =
  '<style>#prerender{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}</style>' +
  // Without JavaScript the content is the page, so show it.
  '<noscript><style>html,body{background:#0c0c0c}#prerender{position:static;width:auto;height:auto;margin:0 auto;overflow:visible;clip:auto;white-space:normal;max-width:760px;padding:48px 24px;color:#eaeaea;font-family:Inter,system-ui,sans-serif;line-height:1.6}#prerender a{color:#A2F69A}</style></noscript>'

function withBody(html, body) {
  html = swap(html, /<div id="root"><\/div>/, `<div id="root"><div id="prerender">${body}</div></div>`, '<div id="root"></div>')
  return swap(html, /<\/head>/, `${PRERENDER_CSS}</head>`, '</head>')
}

function withHead(html, { title, description, canonical, image = DEFAULT_IMAGE, ogType = 'website', jsonLd = null }) {
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, '<title>')
  html = swap(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}">`, 'meta description')
  html = swap(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(canonical)}">`, 'canonical')
  html = swap(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${ogType}">`, 'og:type')
  html = swap(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(canonical)}">`, 'og:url')
  html = swap(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}">`, 'og:title')
  html = swap(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}">`, 'og:description')
  html = swap(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(image)}">`, 'og:image')
  html = swap(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}">`, 'twitter:title')
  html = swap(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(description)}">`, 'twitter:description')
  html = swap(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${esc(image)}">`, 'twitter:image')
  // The homepage's MobileApplication JSON-LD must not appear on other pages.
  html = swap(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
    'JSON-LD block'
  )
  return html
}

// ---------------------------------------------------------------- write

// Homepage: head already comes from index.html; only inject the content.
writeFileSync(distIndex, withBody(shell, homeBody()))

const pages = [
  {
    file: 'about.html',
    meta: { title: 'About — Final Table', description: 'Meet the team building Final Table, the live poker tracker for the table.', canonical: `${SITE}/about` },
    body: aboutBody(),
  },
  {
    file: 'privacy.html',
    meta: { title: 'Privacy Policy — Final Table', description: 'How Final Table collects, uses, and protects your data.', canonical: `${SITE}/privacy` },
    body: legalBody('privacy.html', 'Privacy Policy', 'How Final Table collects, uses, and protects your data.'),
  },
  {
    file: 'terms.html',
    meta: { title: 'Terms of Service — Final Table', description: 'The terms that govern your use of Final Table.', canonical: `${SITE}/terms` },
    body: legalBody('terms.html', 'Terms of Service', 'The terms that govern your use of Final Table.'),
  },
  {
    file: 'blog.html',
    meta: {
      title: 'Poker Strategy & Stats Blog — Final Table',
      description: 'Guides on poker stats, ranges, and live-game strategy from the team behind Final Table — the live poker tracker.',
      canonical: `${SITE}/blog`,
    },
    body: blogIndexBody(),
  },
  ...posts.map((p) => {
    const canonical = `${SITE}/blog/${p.slug}`
    return {
      file: `blog/${p.slug}.html`,
      meta: {
        title: `${p.title} — Final Table`,
        description: p.description,
        canonical,
        image: SITE + p.image,
        ogType: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: p.title,
          description: p.description,
          image: SITE + p.image,
          datePublished: p.date.toISOString(),
          dateModified: (p.updated || p.date).toISOString(),
          author: { '@type': 'Organization', name: p.author },
          publisher: { '@type': 'Organization', name: 'Final Table', logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
          mainEntityOfPage: canonical,
          keywords: p.keywords.join(', '),
        },
      },
      body: postBody(p),
    }
  }),
]

for (const page of pages) {
  writeFileSync(join(out, page.file), withBody(withHead(shell, page.meta), page.body))
}

console.log(`[prerender] wrote dist/index.html + ${pages.length} pages (${posts.length} posts) + shell`)
