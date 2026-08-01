// Vercel Edge Middleware — DataFast bot-traffic tracking (AI crawlers, search
// engines, model-training bots). Runs server-side because crawlers request raw
// HTML and never execute the browser analytics script in index.html.
// Docs: https://datafa.st/docs/bot-traffic-tracking
import { trackAICrawlerRequest } from '@datafast/ai-crawl'

// Match page routes and crawler-facing files (llms.txt, sitemap.xml,
// robots.txt) but skip /api and static assets by extension, so regular human
// traffic doesn't invoke the edge function for every image/chunk request.
export const config = {
  matcher: [
    '/((?!api/|assets/|_vercel|.*\\.(?:png|jpe?g|svg|webp|gif|ico|css|js|mjs|map|woff2?|ttf|otf|mp4|webm|json)).*)',
  ],
}

const DF_CONFIG = { websiteId: 'dfid_rn8wXaHNsJLmS4WRXBSzj', debug: true }

export default async function middleware(request, context) {
  // Liveness probe: proves the middleware is deployed and routed without
  // depending on the DataFast dashboard. Harmless to leave in.
  if (new URL(request.url).pathname === '/__mw-check') {
    return new Response('mw ok', { status: 200 })
  }

  if (context && typeof context.waitUntil === 'function') {
    // Fire-and-forget: the runtime keeps the background DataFast call alive
    // via context.waitUntil after we return.
    const result = trackAICrawlerRequest(request, context, DF_CONFIG)
    if (result.crawler) console.log('[datafast]', JSON.stringify(result))
  } else {
    // No waitUntil available — returning immediately would let the runtime
    // cancel the in-flight send, so await it. Resolves instantly (no network)
    // for non-crawler traffic.
    const result = await trackAICrawlerRequest(request, DF_CONFIG)
    if (result.crawler) console.log('[datafast][awaited]', JSON.stringify(result))
  }
  // Fall through to normal static serving.
}
