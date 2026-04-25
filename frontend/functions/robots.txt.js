/**
 * Cloudflare Pages Function — serves robots.txt directly from the function layer.
 * This runs before static file serving and before any Cloudflare edge-level
 * managed robots.txt injection, guaranteeing the exact content below is what
 * Googlebot and all crawlers receive.
 */

const ROBOTS_TXT = `User-agent: *
Allow: /
Allow: /api/media/

# Do not index sensitive or transactional routes
Disallow: /cart
Disallow: /checkout
Disallow: /order
Disallow: /admin
Disallow: /api

# Sitemap location
Sitemap: https://pzm.ae/sitemap.xml
`

export function onRequest() {
  return new Response(ROBOTS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
