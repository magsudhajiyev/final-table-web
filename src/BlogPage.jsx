import { useEffect } from 'react'
import { TPFooter, TPNavbar } from './LandingPage'
import { posts, getPost } from './lib/blog'
import './LandingPage.css'
import './BlogPage.css'

const SITE = 'https://www.finaltable.io'

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Runtime meta (mirrors main.jsx pattern). SSG build also bakes these into
// the static HTML — see scripts/prerender.mjs.
function setMeta({ title, description, canonical, image, jsonLd }) {
  document.title = title
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel)
    if (el) el.setAttribute(attr, val)
  }
  set('meta[name="description"]', 'content', description)
  set('meta[property="og:title"]', 'content', title)
  set('meta[property="og:description"]', 'content', description)
  set('meta[property="og:url"]', 'content', canonical)
  if (image) set('meta[property="og:image"]', 'content', SITE + image)
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.setAttribute('href', canonical)

  document.getElementById('blog-jsonld')?.remove()
  if (jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'blog-jsonld'
    s.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(s)
  }
}

export function BlogIndex() {
  useEffect(() => {
    setMeta({
      title: 'Poker Strategy & Stats Blog — Final Table',
      description:
        'Guides on poker stats, ranges, and live-game strategy from the team behind Final Table — the live poker tracker.',
      canonical: `${SITE}/blog`,
      image: '/og-image.png',
    })
  }, [])

  return (
    <div className="blog-root">
      <TPNavbar />
      <main className="blog-list">
        <header className="blog-list-head">
          <p className="blog-eyebrow">Final Table Blog</p>
          <h1>Poker stats, ranges, and how to actually study your game</h1>
          <p className="blog-sub">
            Straight from the people who built the tracker. No fluff, correct math.
          </p>
        </header>
        <ul className="blog-cards">
          {posts.map((p) => (
            <li key={p.slug} className="blog-card">
              <a href={`/blog/${p.slug}`}>
                <span className="blog-card-meta">
                  {fmtDate(p.date)} · {p.readingMinutes} min read
                </span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <span className="blog-card-link">Read →</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <TPFooter />
    </div>
  )
}

export function BlogPost({ slug }) {
  const post = getPost(slug)

  useEffect(() => {
    if (!post) {
      document.title = 'Not found — Final Table'
      return
    }
    const canonical = `${SITE}/blog/${post.slug}`
    setMeta({
      title: `${post.title} — Final Table`,
      description: post.description,
      canonical,
      image: post.image,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        image: SITE + post.image,
        datePublished: post.date.toISOString(),
        dateModified: (post.updated || post.date).toISOString(),
        author: { '@type': 'Organization', name: post.author },
        publisher: {
          '@type': 'Organization',
          name: 'Final Table',
          logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
        },
        mainEntityOfPage: canonical,
        keywords: post.keywords.join(', '),
      },
    })
  }, [post])

  if (!post) {
    return (
      <div className="blog-root">
        <TPNavbar />
        <main className="blog-article">
          <h1>Post not found</h1>
          <p><a href="/blog">← Back to the blog</a></p>
        </main>
        <TPFooter />
      </div>
    )
  }

  return (
    <div className="blog-root">
      <TPNavbar />
      <article className="blog-article">
        <a className="blog-back" href="/blog">← All posts</a>
        <p className="blog-card-meta">
          {fmtDate(post.date)} · {post.readingMinutes} min read
        </p>
        <h1>{post.title}</h1>
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="blog-cta">
          <h3>Track your real poker stats</h3>
          <p>Log hands at the table and see your VPIP, PFR, 3-bet and more — by position.</p>
          <div className="blog-cta-btns">
            <a href="https://apps.apple.com/us/app/final-table/id6760188970">Download for iOS</a>
            <a href="https://play.google.com/store/apps/details?id=com.finaltable.app">Get it on Android</a>
          </div>
        </div>
      </article>
      <TPFooter />
    </div>
  )
}
