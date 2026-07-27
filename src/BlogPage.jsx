import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { TPFooter, TPNavbar, TPBottomHero, BLOG_TAG_BY_SLUG } from './LandingPage'
import { useT } from './i18n'
import { posts, getPost } from './lib/blog'
import './LandingPage.css'
import './BlogPage.css'

// Parse the post HTML, inject stable IDs on H2/H3, and return the augmented
// HTML plus a flat TOC list. Runs at mount time in the browser (no SSR
// needed for this route — /blog/:slug is client-rendered).
function slugifyHeading(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}
function buildTOC(html) {
  if (typeof window === 'undefined' || !html) return { html: html || '', toc: [] }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')
  const toc = []
  const seen = new Map()
  headings.forEach((h) => {
    const base = slugifyHeading(h.textContent) || 'section'
    const n = (seen.get(base) || 0) + 1
    seen.set(base, n)
    const id = n === 1 ? base : `${base}-${n}`
    h.setAttribute('id', id)
    toc.push({ id, text: h.textContent, level: h.tagName === 'H2' ? 2 : 3 })
  })
  return { html: doc.body.innerHTML, toc }
}

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
  const { t } = useT()

  useEffect(() => {
    setMeta({
      title: 'Poker Strategy & Stats Blog — Final Table',
      description:
        'Guides on poker stats, ranges, and live-game strategy from the team behind Final Table — the live poker tracker.',
      canonical: `${SITE}/blog`,
      image: '/og-image.png',
    })
  }, [])

  const featured = posts[0]
  const rest = posts.slice(1)
  const tagFor = (slug) => t(`blogTeaser.tag.${BLOG_TAG_BY_SLUG[slug] || 'strategy'}`)

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

        {featured && (
          <a href={`/blog/${featured.slug}`} className="blog-featured">
            <div className="blog-featured-media">
              <img src={featured.image || '/og-image.png'} alt="" loading="eager" />
              <span className="blog-featured-badge">Featured</span>
            </div>
            <div className="blog-featured-body">
              <div className="blog-featured-meta">
                <span className="blog-tag">{tagFor(featured.slug)}</span>
                <span className="blog-dot" aria-hidden="true">·</span>
                <span>{fmtDate(featured.date)}</span>
                <span className="blog-dot" aria-hidden="true">·</span>
                <span>{t('blogTeaser.minRead', { n: featured.readingMinutes })}</span>
              </div>
              <h2 className="blog-featured-title">{featured.title}</h2>
              <p className="blog-featured-desc">{featured.description}</p>
              <span className="blog-featured-cta">
                {t('blogTeaser.read')} <ArrowRight size={16} strokeWidth={2} />
              </span>
            </div>
          </a>
        )}

        {rest.length > 0 && (
          <>
            <h3 className="blog-section-head">Latest posts</h3>
            <ul className="blog-grid">
              {rest.map((p) => (
                <li key={p.slug} className="blog-grid-card">
                  <a href={`/blog/${p.slug}`}>
                    <div className="blog-grid-media">
                      <img src={p.image || '/og-image.png'} alt="" loading="lazy" />
                    </div>
                    <div className="blog-grid-body">
                      <div className="blog-grid-meta">
                        <span className="blog-tag">{tagFor(p.slug)}</span>
                        <span className="blog-dot" aria-hidden="true">·</span>
                        <span>{t('blogTeaser.minRead', { n: p.readingMinutes })}</span>
                      </div>
                      <h2>{p.title}</h2>
                      <p>{p.description}</p>
                      <span className="blog-card-link">
                        {t('blogTeaser.read')} <ArrowRight size={14} strokeWidth={2} />
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <TPFooter />
    </div>
  )
}

export function BlogPost({ slug }) {
  const post = getPost(slug)
  const { t } = useT()
  const [activeId, setActiveId] = useState(null)

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

  const { html, toc } = useMemo(() => buildTOC(post?.html || ''), [post?.html])

  // .observe-me reveal: TPBottomHero (and any other landing components we
  // reuse here) rely on the IntersectionObserver that normally lives inside
  // <LandingPage/>. On this route that component isn't mounted, so we run the
  // same observer here — otherwise .observe-me elements stay at opacity: 0.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.observe-me').forEach(el => el.classList.add('in-view'))
      return
    }
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          obs.unobserve(entry.target)
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    const nodes = document.querySelectorAll('.observe-me')
    nodes.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) el.classList.add('in-view')
      else obs.observe(el)
    })
    return () => obs.disconnect()
  }, [post?.slug])

  // Scroll-spy: the last heading with top above a small offset is active.
  useEffect(() => {
    if (!toc.length) return
    const OFFSET = 120
    const onScroll = () => {
      let current = toc[0]?.id
      for (const item of toc) {
        const el = document.getElementById(item.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top - OFFSET <= 0) current = item.id
        else break
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [toc])

  const onTocClick = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    // Lenis is initialized on the landing page but not this route, so use
    // native smooth-scroll here. scroll-margin-top on headings handles the
    // fixed-header offset.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  const related = post ? posts.filter((p) => p.slug !== post.slug).slice(0, 3) : []
  const tagFor = (s) => t(`blogTeaser.tag.${BLOG_TAG_BY_SLUG[s] || 'strategy'}`)

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
      <div className="blog-post-layout">
        {/* Breadcrumbs span both columns */}
        <nav className="blog-crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <ChevronRight size={14} className="blog-crumb-sep" aria-hidden="true" />
          <a href="/blog">Blog</a>
          <ChevronRight size={14} className="blog-crumb-sep" aria-hidden="true" />
          <span className="blog-crumb-current" aria-current="page">{post.title}</span>
        </nav>

        <aside className="blog-toc" aria-label="Table of contents">
          <div className="blog-toc-sticky">
            {toc.length > 0 && (
              <>
                <p className="blog-toc-head">On this page</p>
                <ul className="blog-toc-list">
                  {toc.map((item) => (
                    <li key={item.id} className={`blog-toc-item blog-toc-l${item.level}${activeId === item.id ? ' is-active' : ''}`}>
                      <a href={`#${item.id}`} onClick={(e) => onTocClick(e, item.id)}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <article className="blog-article blog-article-with-toc">
          <p className="blog-card-meta">
            <span className="blog-tag">{tagFor(post.slug)}</span>
            <span className="blog-dot" aria-hidden="true">·</span>
            {fmtDate(post.date)}
            <span className="blog-dot" aria-hidden="true">·</span>
            {post.readingMinutes} min read
          </p>
          <h1>{post.title}</h1>
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />

          {related.length > 0 && (
            <section className="blog-related" aria-labelledby="related-heading">
              <h3 id="related-heading" className="blog-related-head">Read next</h3>
              <ul className="blog-related-grid">
                {related.map((p) => (
                  <li key={p.slug} className="blog-related-card">
                    <a href={`/blog/${p.slug}`}>
                      <div className="blog-related-media">
                        <img src={p.image || '/og-image.png'} alt="" loading="lazy" />
                      </div>
                      <div className="blog-related-body">
                        <div className="blog-related-meta">
                          <span className="blog-tag">{tagFor(p.slug)}</span>
                          <span className="blog-dot" aria-hidden="true">·</span>
                          <span>{p.readingMinutes} min read</span>
                        </div>
                        <h4>{p.title}</h4>
                        <span className="blog-card-link">
                          Read <ArrowRight size={14} strokeWidth={2} />
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </article>
      </div>
      <TPBottomHero />
      <TPFooter />
    </div>
  )
}
