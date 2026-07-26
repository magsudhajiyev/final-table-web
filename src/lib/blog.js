import { marked } from 'marked'

// Minimal, browser-safe frontmatter parser. gray-matter pulls in Node's
// Buffer, which doesn't exist in the browser (ReferenceError at runtime).
// Our posts only use simple YAML-ish frontmatter, so we parse it directly.
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, content: raw }
  const [, yaml, content] = m
  const data = {}
  for (const line of yaml.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const key = kv[1]
    let val = kv[2].trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      // inline array: ["a", "b"]
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  return { data, content }
}

// Load every Markdown post at build time as a raw string. Vite inlines these
// so the blog is fully static — no runtime fetch, good for SEO + speed.
const rawPosts = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

marked.setOptions({ mangle: false, headerIds: true })

// External links open in a new tab with rel="noopener noreferrer" (security
// + keeps the reader's tab on-site). Internal links (/, /blog/...) stay
// same-tab and un-decorated. Works across marked v5+ token/string signatures.
const renderer = {
  link(href, title, text) {
    // marked v12+ passes a token object; older versions pass positional args
    if (href && typeof href === 'object') {
      title = href.title
      text = href.text ?? ''
      href = href.href
    }
    const isExternal = /^https?:\/\//i.test(href) && !href.includes('finaltable.io')
    const titleAttr = title ? ` title="${title}"` : ''
    if (isExternal) {
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    }
    return `<a href="${href}"${titleAttr}>${text}</a>`
  },
}
marked.use({ renderer })

function parsePost(raw, path) {
  const { data, content } = parseFrontmatter(raw)
  const slug = data.slug || path.split('/').pop().replace(/\.md$/, '')
  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date ? new Date(data.date) : new Date(0),
    updated: data.updated ? new Date(data.updated) : null,
    author: data.author || 'Final Table',
    keywords: data.keywords || [],
    image: data.image || '/og-image.png',
    readingMinutes: data.readingMinutes || Math.max(1, Math.round(content.split(/\s+/).length / 200)),
    html: marked.parse(content),
  }
}

// All posts, newest first. Skip scaffolding files (_TEMPLATE.md, README.md).
export const posts = Object.entries(rawPosts)
  .filter(([path]) => {
    const name = path.split('/').pop()
    return !name.startsWith('_') && name.toLowerCase() !== 'readme.md'
  })
  .map(([path, raw]) => parsePost(raw, path))
  .sort((a, b) => b.date - a.date)

export const postsBySlug = Object.fromEntries(posts.map((p) => [p.slug, p]))

export function getPost(slug) {
  return postsBySlug[slug] || null
}
