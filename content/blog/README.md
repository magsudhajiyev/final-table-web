# Final Table Blog — Authoring System

Everything the blog needs is a Markdown file in this folder. Drop a `.md`
file here, run the build, and the post is live — list card, post page,
sitemap entry, and Article structured data are all generated automatically.

## How to publish a post (the whole workflow)

1. Copy `_TEMPLATE.md` to a new file. Name it after the slug:
   `content/blog/your-post-slug.md`
2. Fill in the frontmatter (see fields below) and write the body in Markdown.
3. Commit + push. Vercel builds it. Done.
   - The sitemap regenerates on every build (`prebuild` script).
   - The post appears at `finaltable.io/blog/your-post-slug`.

No code changes. No route to register. No sitemap to edit by hand.

## Frontmatter fields

| Field            | Required | Notes                                                             |
|------------------|----------|-------------------------------------------------------------------|
| `slug`           | yes      | URL segment. lowercase-with-hyphens. MUST match the filename.     |
| `title`          | yes      | ~55–60 chars, lead with the keyword. Shows as the H1 + `<title>`. |
| `description`    | yes      | 150–160 chars. This is the Google snippet — make it click-worthy. |
| `date`           | yes      | `YYYY-MM-DD`. Publish date.                                       |
| `updated`        | no       | `YYYY-MM-DD`. Bump when you edit — Google likes fresh dates.      |
| `keywords`       | no       | Array. The terms you're targeting (for your reference + JSON-LD). |
| `image`          | no       | OG/social image path. Defaults to `/og-image.png`.               |
| `readingMinutes` | no       | Auto-computed from word count if omitted.                         |

## SEO rules that actually matter (follow these, ignore the myths)

1. **One post = one keyword intent.** Don't try to rank for five things.
   Pick the phrase a real person would type ("what is a good 3-bet
   percentage") and own it.
2. **Answer the question in the first paragraph.** Google (and readers)
   reward pages that get to the point. Then go deep.
3. **Depth beats frequency.** One genuinely expert 1,200–1,800 word post per
   week outranks five thin 400-word ones — and avoids the "mass-produced
   content" penalty. Quality is the strategy.
4. **Write what only you can write.** Your edge is that you built the stats
   engine. Correct math, real edge cases, honest takes. Generic "top 10 tips"
   posts will lose to Upswing/PokerStrategy — don't compete there.
5. **Use real H2 subheadings** (`## Like this`). They become the page's
   outline and Google pulls them into results.
6. **Link internally.** Every post should link to 1–2 other posts + the app
   download. This spreads ranking authority across the site.
7. **End with a soft app CTA in prose** (the big CTA box is auto-appended, so
   your closing line can just be a natural "Final Table does this for you").

## The keyword-mapped content calendar

Ordered by value (search intent × how well only-we-can-answer-it). Work down
the list. Each is a real thing people search that maps to a product feature.

**Search-validated numbers to cite (from live SERP research, July 2026 —
so posts match what readers already expect):**
- **VPIP:** "good" range is 20–28% in 6-max, ~15–20% full ring. Loose vs tight
  tell. People literally search *"what is a good VPIP"*.
- **3-bet:** strong players 3-bet ~6–10% in cash games. Search: *"what is a
  good 3-bet percentage"*.
- **Sample size:** you need ~500–1,000 hands on a player before their 3-bet%
  means anything — good honest angle that builds trust.
- Highest-intent phrasing people actually type: **"what is a good [stat]"**,
  **"how to calculate [stat]"**, **"[stat] explained"**. Use these verbatim in
  H1s and H2s.

### Tier 1 — your wedge (own these first)
- [x] How to track your poker stats without a laptop  *(published — the money keyword)*
- [ ] What is VPIP? How to calculate it correctly (and why most get it wrong)  ← cite the 20–28% / 15–20% ranges
- [ ] What is a good 3-bet percentage? (by position)  ← cite ~6–10%
- [ ] Live poker vs online: why live players fly blind — and how to fix it
- [ ] How to read a range grid: what your 13×13 says about your leaks

### Tier 2 — supporting concept posts (broad reach, funnel to Tier 1)
- [ ] PFR explained: what pre-flop raise % says about a player
- [ ] C-bet frequency: how often should you continuation bet?
- [ ] Fold to 3-bet: the stat that exposes weak-tight players
- [ ] Steal percentage & blind defense for live players
- [ ] What's a good VPIP/PFR ratio? Reading the gap
- [ ] Poker player types explained: TAG, LAG, Nit, Station, Maniac  ← we classify these in-app; strong fit

### Tier 3 — game/lifestyle (wider net, softer intent)
- [ ] How to run a home poker game that people come back to
- [ ] Bankroll management for live cash and tournaments
- [ ] Tracking your tournament ROI: ITM%, average finish, and what they mean
- [ ] Should you show your hands? Live-poker etiquette and info leaks

### Tier 4 — EVENT / TRENDING (timely traffic spikes — publish BEFORE the event)
Timely posts catch search spikes competitors miss. Key move: **publish the
preview a week early so Google has it indexed when searches surge, then update
it with results.** Refresh the `updated:` date each time — freshness ranks.
- [x] WSOP 2026 Main Event Final Table preview  *(published — UPDATE with results after Aug 5, 2026)*
- [ ] WSOP Main Event: biggest final-table hands, analyzed *(after the finale)*
- [ ] WSOP 2027 schedule / how to satellite in *(publish when the schedule drops)*
- [ ] Recurring annual angle: every WSOP Main Event final table is a search
  spike — own the "[year] WSOP final table" preview each July.

## Distribution (content ranks in months — help it along)

- **Google Search Console**: add finaltable.io, submit `sitemap.xml`. This is
  how you tell Google the blog exists and watch what ranks. Do this first.
- Share each new post to your subreddit, any poker Discords, and X.
- Add a "Blog" link to the site nav and the app (Profile → resources) so
  users discover it.
