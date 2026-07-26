// Generates public/sitemap.xml from static routes + every blog Markdown file.
// Runs automatically before each build (see package.json "prebuild").
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Pull just the frontmatter fields we need (slug/date/updated) without a
// dependency — keeps the build lean and avoids Node-only libs.
function frontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!m) return {}
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return data
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const SITE = 'https://www.finaltable.io'

// Static, indexable routes (exclude /admin, /delete-account, /hand/*).
const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
]

const blogDir = join(root, 'content', 'blog')
const blogEntries = readdirSync(blogDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md')
  .map((f) => {
    const data = frontmatter(readFileSync(join(blogDir, f), 'utf8'))
    const slug = data.slug || f.replace(/\.md$/, '')
    const lastmod = (data.updated || data.date || new Date())
    const d = new Date(lastmod)
    return {
      loc: `/blog/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: isNaN(d) ? undefined : d.toISOString().slice(0, 10),
    }
  })

const urls = [...staticRoutes, ...blogEntries]
  .map(
    (u) =>
      `  <url>\n    <loc>${SITE}${u.loc}</loc>` +
      (u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '') +
      `\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

writeFileSync(join(root, 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml written: ${staticRoutes.length + blogEntries.length} URLs`)
