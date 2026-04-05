import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const distRoot = path.join(frontendRoot, 'dist')
const templatePath = path.join(distRoot, 'index.html')
const contentRoot = path.join(frontendRoot, 'src', 'content')
const SITE_URL = (process.env.VITE_SITE_URL || 'https://shop.pzm.ae').replace(/\/+$/, '')
const DEFAULT_IMAGE = `${SITE_URL}/images/mini_logo.png`
const LASTMOD = '2026-04-05'

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeSingleQuotedString(value) {
  return value.replace(/\\'/g, "'")
}

function normalizeCanonicalPath(routePath) {
  if (routePath === '/blog') {
    return '/blog/'
  }

  return routePath
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return DEFAULT_IMAGE
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE_URL}${normalizedPath}`
}

function outputPathForRoute(routePath) {
  const normalized = routePath.replace(/^\/+/, '')

  if (!normalized) {
    return templatePath
  }

  if (normalized.endsWith('.html')) {
    return path.join(distRoot, normalized)
  }

  return path.join(distRoot, normalized.replace(/\/+$/, ''), 'index.html')
}

function buildStoreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: 'PZM Computers & Phones Store',
    description:
      'PZM Computers and Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and local service support.',
    url: `${SITE_URL}/`,
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hessa Street Branch, Inside Hessa Union Coop Hypermarket, Ground Floor',
      addressCountry: 'AE',
    },
    image: DEFAULT_IMAGE,
    priceRange: 'AED 150 - AED 7,000',
  }
}

function buildCollectionJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: toAbsoluteUrl(route.canonicalPath),
    name: route.title,
    description: route.description,
  }
}

function buildArticleJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: route.articleTitle,
    name: route.title,
    description: route.description,
    image: [toAbsoluteUrl(route.imageUrl)],
    datePublished: `${route.publishedAt}T00:00:00+04:00`,
    dateModified: `${route.publishedAt}T00:00:00+04:00`,
    author: {
      '@type': 'Organization',
      name: 'PZM Computers & Phones Store',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PZM Computers & Phones Store',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
    mainEntityOfPage: toAbsoluteUrl(route.canonicalPath),
  }
}

async function readSourceFile(fileName) {
  return fs.readFile(path.join(contentRoot, fileName), 'utf8')
}

function extractServiceRoutes(serviceCatalogSource) {
  const pattern = /^\s{2}(?:'([^']+)'|([a-z-]+)):\s*\{\s*[\r\n\s]*slug:\s*'((?:\\'|[^'])+)'[\s\S]*?title:\s*'((?:\\'|[^'])+)'[\s\S]*?description:\s*'((?:\\'|[^'])+)'/gm
  const routes = []

  for (const match of serviceCatalogSource.matchAll(pattern)) {
    const slug = decodeSingleQuotedString(match[3])
    const title = decodeSingleQuotedString(match[4])
    const description = decodeSingleQuotedString(match[5])

    routes.push({ slug, title, description })
  }

  return routes
}

function extractAreaRoutes(areaCatalogSource) {
  const pattern = /^\s{2}(?:'([^']+)'|([a-z-]+)):\s*\{\s*[\r\n\s]*slug:\s*'((?:\\'|[^'])+)'[\s\S]*?metaTitle:\s*'((?:\\'|[^'])+)'[\s\S]*?description:\s*'((?:\\'|[^'])+)'/gm
  const routes = []

  for (const match of areaCatalogSource.matchAll(pattern)) {
    routes.push({
      slug: decodeSingleQuotedString(match[3]),
      metaTitle: decodeSingleQuotedString(match[4]),
      description: decodeSingleQuotedString(match[5]),
    })
  }

  return routes
}

function extractBlogRoutes(blogCatalogSource) {
  const pattern = /^\s{2}\{\s*[\r\n\s]*title:\s*'((?:\\'|[^'])+)'[\s\S]*?slug:\s*'((?:\\'|[^'])+)'[\s\S]*?seoDescription:\s*'((?:\\'|[^'])+)'[\s\S]*?imageUrl:\s*blogMedia\('((?:\\'|[^'])+)'\)[\s\S]*?publishedAt:\s*'((?:\\'|[^'])+)'/gm
  const routes = []

  for (const match of blogCatalogSource.matchAll(pattern)) {
    routes.push({
      title: decodeSingleQuotedString(match[1]),
      slug: decodeSingleQuotedString(match[2]),
      description: decodeSingleQuotedString(match[3]),
      imageFile: decodeSingleQuotedString(match[4]),
      publishedAt: decodeSingleQuotedString(match[5]),
    })
  }

  return routes
}

function buildHtml(template, route) {
  const canonicalPath = normalizeCanonicalPath(route.canonicalPath || route.path)
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const robots = route.robots || 'index, follow'
  const imageUrl = toAbsoluteUrl(route.imageUrl)
  const ogType = route.ogType || 'website'
  const jsonLd = route.jsonLd ? `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>` : ''

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
    .replace(
      /<meta name="description" content="[\s\S]*?"\s*\/?\s*>/i,
      `<meta name="description" content="${escapeHtml(route.description)}" />`
    )

  const headBlock = [
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:site_name" content="PZM Computers & Phones Store" />`,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
    jsonLd,
  ]
    .filter(Boolean)
    .join('\n    ')

  html = html.replace('</head>', `    ${headBlock}\n  </head>`)
  return html
}

async function writeRouteHtml(template, route) {
  const outputPath = outputPathForRoute(route.path)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, buildHtml(template, route), 'utf8')
}

function buildSitemap(routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]

  for (const route of routes) {
    lines.push('  <url>')
    lines.push(`    <loc>${toAbsoluteUrl(normalizeCanonicalPath(route.canonicalPath || route.path))}</loc>`)
    lines.push(`    <lastmod>${LASTMOD}</lastmod>`)
    if (route.changefreq) {
      lines.push(`    <changefreq>${route.changefreq}</changefreq>`)
    }
    if (route.priority) {
      lines.push(`    <priority>${route.priority}</priority>`)
    }
    lines.push('  </url>')
  }

  lines.push('</urlset>')
  return `${lines.join('\n')}\n`
}

const baseRoutes = [
  {
    path: '/',
    title: 'Buy iPhones, Laptops and Repair Dubai | PZM Store',
    description:
      'PZM Computers and Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and local service support.',
    canonicalPath: '/',
    priority: '1.0',
    changefreq: 'daily',
    jsonLd: buildStoreJsonLd(),
  },
  {
    path: '/shop',
    title: 'Shop Devices in Dubai | PZM Computers & Phones',
    description:
      'Browse current device listings from PZM in Dubai with filters for condition, price, and availability, or jump into the dedicated new, used, and iPhone pages.',
    canonicalPath: '/shop',
    priority: '0.95',
    changefreq: 'daily',
  },
  {
    path: '/services',
    title: 'Services in Dubai | PZM Computers & Phones',
    description:
      'Explore repair, trade-in, gaming PC, accessories, iPhone, and device support pages from PZM Computers & Phones in Dubai.',
    canonicalPath: '/services',
    priority: '0.85',
    changefreq: 'weekly',
  },
  {
    path: '/areas',
    title: 'Areas We Serve in Dubai | PZM Computers & Phones',
    description: 'Explore the Dubai communities served by PZM, including Al Barsha, JVC, JBR, Dubai Marina, Tecom, and more.',
    canonicalPath: '/areas',
    priority: '0.75',
    changefreq: 'monthly',
  },
  {
    path: '/blog',
    title: 'Tech Blog | PZM Dubai',
    description: 'Latest market updates, repair advice, iPhone tips, used-device buying guides, and PC articles from PZM in Dubai.',
    canonicalPath: '/blog/',
    priority: '0.75',
    changefreq: 'weekly',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | PZM Computers & Phones',
    description: 'Read PZM Computers & Phones Store terms, refunds, and warranty policies.',
    canonicalPath: '/terms',
    priority: '0.6',
    changefreq: 'monthly',
  },
  {
    path: '/return-policy',
    title: 'Return and Refund Policy | PZM Dubai',
    description:
      'Read the return and refund policy for PZM Computers & Phones Store in Dubai, including the 7-day return window and used-device conditions.',
    canonicalPath: '/return-policy',
    priority: '0.6',
    changefreq: 'monthly',
  },
]

const servicePriorityMap = {
  'buy-iphone': '0.95',
  'brand-new': '0.85',
  secondhand: '0.85',
  repair: '0.9',
  'gaming-pc': '0.8',
  'sell-gadgets': '0.8',
  accessories: '0.7',
  'web-design': '0.6',
}

const areaPriorityMap = {
  'al-barsha': '0.7',
  'jumeirah-village': '0.7',
  tecom: '0.7',
  jbr: '0.7',
  'emirates-hills': '0.7',
  jumeirah: '0.6',
  'dubai-marina': '0.6',
  'al-quoz': '0.5',
}

const blogPriorityMap = {
  'gold-record-highs-tech-buyers-dubai-2026': '0.7',
  'us-tariffs-2026-electronics-prices-dubai': '0.7',
  'ultimate-guide-buying-used-laptops': '0.7',
  'how-to-choose-perfect-gaming-pc-build': '0.65',
  'top-5-iphone-repair-tips': '0.65',
  'essential-pc-maintenance-tips': '0.6',
  'latest-mobile-accessories-2025': '0.6',
  'understanding-smartphone-battery-life': '0.6',
  'iran-us-tensions-mobile-pc-prices-uae-2026': '0.6',
}

const serviceCatalogSource = await readSourceFile('serviceCatalog.ts')
const areaCatalogSource = await readSourceFile('areaCatalog.ts')
const blogCatalogSource = await readSourceFile('blogCatalog.ts')
const serviceEntries = extractServiceRoutes(serviceCatalogSource)
const areaEntries = extractAreaRoutes(areaCatalogSource)
const blogEntries = extractBlogRoutes(blogCatalogSource)

const canonicalRoutes = [
  ...baseRoutes,
  ...serviceEntries.map((entry) => {
    const dedicatedOverrides = {
      'buy-iphone': {
        title: 'Buy iPhone 17 Pro Max, Pro, Air & iPhone 17 in Dubai | PZM',
        description: 'Buy iPhone in Dubai with live stock, direct checkout, and availability support for missing models from the PZM team.',
        imageUrl: '/api/media/legacy/buy_iphone/iPhone_17_Pro_Max_all_colors.jpg',
      },
      'brand-new': {
        title: 'Brand New Devices in Dubai | PZM',
        description: 'Browse brand-new devices in Dubai with live iPhone stock, direct checkout, and availability requests for laptops, gaming hardware, and other new arrivals.',
        imageUrl: '/api/media/legacy/Catigories/brand_new.jpg',
      },
      secondhand: {
        title: 'Used Devices in Dubai | PZM',
        description: 'Browse used devices in Dubai with live stock when available and request support for certified pre-owned phones, laptops, tablets, and gaming hardware from PZM.',
        imageUrl: '/images/Catigories/Used_Phones.jpg',
      },
    }[entry.slug]

    const title = dedicatedOverrides?.title || `${entry.title} in Dubai | PZM Computers & Phones`
    const description = dedicatedOverrides?.description || entry.description

    return {
      path: `/services/${entry.slug}`,
      title,
      description,
      canonicalPath: `/services/${entry.slug}`,
      imageUrl: dedicatedOverrides?.imageUrl,
      priority: servicePriorityMap[entry.slug] || '0.7',
      changefreq: entry.slug === 'web-design' ? 'monthly' : 'weekly',
      jsonLd: ['buy-iphone', 'brand-new', 'secondhand'].includes(entry.slug)
        ? buildCollectionJsonLd({ title, description, canonicalPath: `/services/${entry.slug}` })
        : undefined,
    }
  }),
  ...areaEntries.map((entry) => ({
    path: `/areas/${entry.slug}`,
    title: entry.metaTitle,
    description: entry.description,
    canonicalPath: `/areas/${entry.slug}`,
    priority: areaPriorityMap[entry.slug] || '0.6',
    changefreq: 'monthly',
  })),
  ...blogEntries.map((entry) => ({
    path: `/blog/${entry.slug}`,
    title: `${entry.title} | PZM Blog`,
    description: entry.description,
    canonicalPath: `/blog/${entry.slug}`,
    imageUrl: `/api/media/blog/${entry.imageFile}`,
    priority: blogPriorityMap[entry.slug] || '0.6',
    changefreq: 'monthly',
    ogType: 'article',
    articleTitle: entry.title,
    publishedAt: entry.publishedAt,
    jsonLd: buildArticleJsonLd({
      title: `${entry.title} | PZM Blog`,
      articleTitle: entry.title,
      description: entry.description,
      canonicalPath: `/blog/${entry.slug}`,
      imageUrl: `/api/media/blog/${entry.imageFile}`,
      publishedAt: entry.publishedAt,
    }),
  })),
]

const canonicalRouteMap = new Map(canonicalRoutes.map((route) => [normalizeCanonicalPath(route.canonicalPath || route.path), route]))
const blogRoute = canonicalRouteMap.get('/blog/')
const servicesRoute = canonicalRouteMap.get('/services')
const areasRoute = canonicalRouteMap.get('/areas')
const termsRoute = canonicalRouteMap.get('/terms')
const returnPolicyRoute = canonicalRouteMap.get('/return-policy')
const buyIphoneRoute = canonicalRouteMap.get('/services/buy-iphone')
const brandNewRoute = canonicalRouteMap.get('/services/brand-new')
const secondhandRoute = canonicalRouteMap.get('/services/secondhand')

const aliasRoutes = [
  {
    ...blogRoute,
    path: '/blog.html',
    canonicalPath: '/blog/',
    robots: 'noindex, follow',
  },
  {
    ...blogRoute,
    path: '/blog-post.html',
    title: 'Tech Blog | PZM Dubai',
    canonicalPath: '/blog/',
    robots: 'noindex, follow',
  },
  {
    ...servicesRoute,
    path: '/services/index.html',
    canonicalPath: '/services',
    robots: 'noindex, follow',
  },
  {
    ...areasRoute,
    path: '/areas/index.html',
    canonicalPath: '/areas',
    robots: 'noindex, follow',
  },
  {
    ...termsRoute,
    path: '/terms.html',
    canonicalPath: '/terms',
    robots: 'noindex, follow',
  },
  {
    ...returnPolicyRoute,
    path: '/return-policy.html',
    canonicalPath: '/return-policy',
    robots: 'noindex, follow',
  },
  {
    ...buyIphoneRoute,
    path: '/services/buy-iphone.html',
    canonicalPath: '/services/buy-iphone',
    robots: 'noindex, follow',
  },
  {
    ...brandNewRoute,
    path: '/services/brand-new.html',
    canonicalPath: '/services/brand-new',
    robots: 'noindex, follow',
  },
  {
    ...secondhandRoute,
    path: '/services/secondhand.html',
    canonicalPath: '/services/secondhand',
    robots: 'noindex, follow',
  },
  {
    ...secondhandRoute,
    path: '/services/buy-used',
    canonicalPath: '/services/secondhand',
    robots: 'noindex, follow',
  },
  {
    ...secondhandRoute,
    path: '/services/buy-used.html',
    canonicalPath: '/services/secondhand',
    robots: 'noindex, follow',
  },
]

const template = await fs.readFile(templatePath, 'utf8')

for (const route of canonicalRoutes) {
  await writeRouteHtml(template, route)
}

for (const route of aliasRoutes) {
  await writeRouteHtml(template, route)
}

await fs.writeFile(path.join(distRoot, 'sitemap.xml'), buildSitemap(canonicalRoutes), 'utf8')
