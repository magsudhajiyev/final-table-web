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

export default function middleware(request, context) {
  // Fire-and-forget: the package detects crawler user agents itself and posts
  // in the background via context.waitUntil — do not await. Returning nothing
  // lets the request fall through to normal static serving.
  trackAICrawlerRequest(request, context, {
    websiteId: 'dfid_rn8wXaHNsJLmS4WRXBSzj',
  })
}
