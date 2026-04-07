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
const PRODUCT_FEED_URL = `${SITE_URL}/api/products`
const LASTMOD = '2026-04-07'

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

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

function normalizeProductValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getProductDeduplicationKey(product) {
  return [product.model, product.storage, product.color, product.condition]
    .map((value) => normalizeProductValue(value))
    .join('|')
}

function getProductTimestamp(product) {
  return Date.parse(product.updated_at || product.updatedAt || product.created_at || product.createdAt || '') || 0
}

function sortProducts(left, right) {
  if (left.price !== right.price) {
    return left.price - right.price
  }

  return String(left.model || '').localeCompare(String(right.model || ''))
}

function dedupeProducts(products) {
  const uniqueProducts = new Map()

  for (const product of products) {
    const key = getProductDeduplicationKey(product)
    const existing = uniqueProducts.get(key)

    if (!existing) {
      uniqueProducts.set(key, product)
      continue
    }

    const existingTimestamp = getProductTimestamp(existing)
    const nextTimestamp = getProductTimestamp(product)
    const keepNext = nextTimestamp >= existingTimestamp

    if (keepNext) {
      uniqueProducts.set(key, product)
    }
  }

  return Array.from(uniqueProducts.values())
}

const colorReplacements = new Map([
  ['latest stock', 'Contact us'],
  ['mixed stock', 'Various options'],
  ['contact for color', 'Color options'],
])

const descriptionReplacements = [
  [/contact us for the exact edition in stock\.?/gi, 'Contact us for the exact edition.'],
  [/contact us for the latest stock details\.?/gi, 'Contact us for the latest details.'],
  [/contact us for the latest color availability\.?/gi, 'Contact us for color options.'],
  [/\s+and multiple units available\.?/gi, '.'],
  [/\s+with multiple units available\.?/gi, '.'],
]

function cleanProductText(value) {
  return String(value || '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\.\s*\./g, '.')
    .trim()
}

function sanitizeProductForDisplay(product) {
  const colorKey = String(product.color || '').trim().toLowerCase()
  let description = String(product.description || '').trim()

  for (const [pattern, replacement] of descriptionReplacements) {
    description = description.replace(pattern, replacement)
  }

  return {
    ...product,
    color: colorReplacements.get(colorKey) || product.color,
    description: cleanProductText(description) || undefined,
  }
}

function getProductImageUrl(product) {
  return toAbsoluteUrl(product.image_url || product.images?.[0] || DEFAULT_IMAGE)
}

function buildProductWhatsAppHref(product, kind) {
  const message = kind === 'new'
    ? `Hi, I'm interested in the brand-new ${product.model} ${product.storage} ${product.color} for ${formatPrice(product.price)} AED (via shop.pzm.ae)`
    : `Hi, I'm interested in the used ${product.model} ${product.storage} ${product.color} for ${formatPrice(product.price)} AED (via shop.pzm.ae)`

  return `https://wa.me/971528026677?text=${encodeURIComponent(message)}`
}

const brandNewSnapshotCategories = [
  {
    title: 'Phones, Tablets, and Wearables',
    description: 'iPhones, Samsung devices, tablets, and wearables listed on the site.',
    matcher: /(iphone|ipad|tablet|galaxy|samsung|pixel|watch|wearable|phone|mobile)/i,
  },
  {
    title: 'Laptops and Computers',
    description: 'MacBooks and other computers listed on the site.',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|xps|inspiron|spectre|envy|thinkpad|thinkbook|yoga|vivobook|zenbook)/i,
  },
  {
    title: 'Gaming Systems',
    description: 'Consoles and gaming hardware listed on the site.',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|vr|console)/i,
  },
  {
    title: 'Professional Equipment',
    description: 'Business and workstation hardware listed on the site.',
    matcher: /(workstation|desktop|monitor|business|network|router|server|surface|precision|elitebook|probook)/i,
  },
]

const secondhandSnapshotCategories = [
  {
    title: 'Used Phones and iPhones',
    description: 'Used phones with clear battery or condition details.',
    matcher: /(iphone|galaxy|samsung|pixel|android|phone|mobile|honor|redmi|tecno|nokia)/i,
  },
  {
    title: 'Used Laptops and MacBooks',
    description: 'Used MacBooks and Windows laptops listed on the site.',
    matcher: /(macbook|laptop|notebook|dell|hp|lenovo|asus|acer|latitude|elitebook|thinkpad|thinkbook|xps|inspiron|spectre|envy|probook|vivobook|zenbook|ultra)/i,
  },
  {
    title: 'Used Tablets and iPads',
    description: 'Used iPads and tablets listed on the site.',
    matcher: /(ipad|tablet|galaxy tab|surface|matepad|\btab\b)/i,
  },
  {
    title: 'Used Gaming Devices',
    description: 'Used gaming laptops, PCs, and monitors listed on the site.',
    matcher: /(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console|desktop|monitor|ultragear|swift|viewfinity|rtx|gtx|aorus)/i,
  },
]

function groupCatalogProducts(products, condition, categories) {
  const grouped = categories.map((category) => ({
    category,
    products: [],
  }))

  const visibleProducts = dedupeProducts(
    products.filter((product) => product.condition === condition)
  ).sort(sortProducts)

  for (const product of visibleProducts) {
    const normalizedModel = normalizeProductValue(product.model)
    const targetGroup = grouped.find((group) => group.category.matcher.test(normalizedModel))

    if (targetGroup) {
      targetGroup.products.push(product)
    }
  }

  return grouped.filter((group) => group.products.length > 0)
}

function buildSnapshotCard(product, kind) {
  const badge = kind === 'new' ? 'Brand new' : 'Used'

  return `
    <article style="overflow:hidden;border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
      <div style="display:flex;align-items:center;justify-content:center;min-height:172px;padding:16px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
        <img src="${escapeHtml(getProductImageUrl(product))}" alt="${escapeHtml(product.model)}" loading="lazy" style="max-width:100%;max-height:136px;object-fit:contain;" />
      </div>
      <div style="padding:18px;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">${escapeHtml(`${badge} • ${product.storage} • ${product.color}`)}</p>
        <h2 style="margin:10px 0 0;font-size:18px;line-height:1.35;font-weight:700;color:#0f172a;">${escapeHtml(product.model)}</h2>
        <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#64748b;">${escapeHtml(product.description || `${product.color} ${product.model}`)}</p>
        <div style="margin-top:16px;">
          <strong style="font-size:24px;line-height:1;color:#0f172a;">AED ${formatPrice(product.price)}</strong>
        </div>
        <a href="${escapeHtml(buildProductWhatsAppHref(product, kind))}" style="display:inline-block;margin-top:16px;padding:12px 16px;border-radius:12px;border:1px solid #e2e8f0;color:#0f172a;font-weight:700;text-decoration:none;">Contact us</a>
      </div>
    </article>`
}

function buildCatalogSnapshot({ eyebrow, title, intro, groups, emptyTitle, emptyDescription, kind }) {
  const content = groups.length > 0
    ? groups
        .map(
          (group) => `
      <section style="margin-top:28px;">
        <div style="display:flex;align-items:start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
          <div style="max-width:820px;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#00A76F;">${escapeHtml(group.category.title)}</p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#64748b;">${escapeHtml(group.category.description)}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          ${group.products.map((product) => buildSnapshotCard(product, kind)).join('')}
        </div>
      </section>`
        )
        .join('')
    : `
      <section style="margin-top:28px;border:1px solid #e2e8f0;border-radius:28px;background:#ffffff;padding:24px;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
        <h2 style="margin:0;font-size:28px;line-height:1.2;color:#0f172a;">${escapeHtml(emptyTitle)}</h2>
        <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#64748b;">${escapeHtml(emptyDescription)}</p>
      </section>`

  return `
    <div data-pzm-prerender-catalog="true" style="max-width:1280px;margin:0 auto;padding:48px 16px 64px;font-family:'Open Sans',system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
      <div style="max-width:960px;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#00A76F;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin:14px 0 0;font-size:42px;line-height:1.08;color:#0f172a;">${escapeHtml(title)}</h1>
        <p style="margin:18px 0 0;font-size:16px;line-height:1.8;color:#64748b;">${escapeHtml(intro)}</p>
      </div>
      ${content}
    </div>`
}

function buildBrandNewSnapshot(products) {
  const groups = groupCatalogProducts(products, 'new', brandNewSnapshotCategories)

  return buildCatalogSnapshot({
    eyebrow: 'Brand-new retail',
    title: 'Brand New Devices in Dubai',
    intro: 'Browse brand-new devices listed on the site, including phones, laptops, and gaming hardware.',
    groups,
    emptyTitle: 'No brand-new products are currently listed on the site.',
    emptyDescription: 'Use the contact options on the site to ask about models and pricing.',
    kind: 'new',
  })
}

function buildSecondhandSnapshot(products) {
  const groups = groupCatalogProducts(products, 'used', secondhandSnapshotCategories)

  return buildCatalogSnapshot({
    eyebrow: 'Certified pre-owned',
    title: 'Pre-Owned Devices',
    intro: 'Browse used devices listed on the site, including phones, laptops, tablets, gaming PCs, and monitors.',
    groups,
    emptyTitle: 'No used products are currently listed on the site.',
    emptyDescription: 'Use the contact options on the site to ask about used-device details.',
    kind: 'used',
  })
}

async function fetchLiveProducts() {
  try {
    const response = await fetch(PRODUCT_FEED_URL)
    if (!response.ok) {
      throw new Error(`Product feed request failed with ${response.status}`)
    }

    const payload = await response.json()
    return Array.isArray(payload.data) ? payload.data.map((product) => sanitizeProductForDisplay(product)) : []
  } catch (error) {
    console.warn(`Could not fetch live product feed for prerender snapshots: ${error instanceof Error ? error.message : error}`)
    return []
  }
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
      'PZM Computers & Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and same-day local support.',
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
  const preloadedProductsScript = Array.isArray(route.preloadedProducts) && route.preloadedProducts.length > 0
    ? `<script id="pzm-preloaded-products" type="application/json">${escapeJsonForHtml(route.preloadedProducts)}</script>`
    : ''

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

  if (route.rootHtml) {
    html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${route.rootHtml}</div>`)
  }

  if (preloadedProductsScript) {
    const moduleScriptPattern = /<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/i

    if (moduleScriptPattern.test(html)) {
      html = html.replace(moduleScriptPattern, `${preloadedProductsScript}\n    $&`)
    } else {
      html = html.replace('</body>', `    ${preloadedProductsScript}\n  </body>`)
    }
  }

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
    title: 'Buy iPhones, Laptops & Repair Dubai | PZM Store',
    description:
      'PZM Computers & Phones Store in Al Barsha, Dubai for new and used devices, expert repairs, custom PC builds, accessories, and same-day local support.',
    canonicalPath: '/',
    priority: '1.0',
    changefreq: 'daily',
    jsonLd: buildStoreJsonLd(),
  },
  {
    path: '/services',
    title: 'Our Services | PZM Computers & Phones Store',
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
    title: 'Tech Blog - iPhone, PC & Repair Tips | PZM Dubai',
    description: 'Latest market updates, repair advice, iPhone tips, used-device buying guides, and PC articles from PZM in Dubai.',
    canonicalPath: '/blog/',
    priority: '0.75',
    changefreq: 'weekly',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | PZM Dubai',
    description: 'Read the terms and conditions for PZM Computers & Phones Store in Dubai, including ordering, payment, delivery, warranty, and returns.',
    canonicalPath: '/terms',
    priority: '0.6',
    changefreq: 'monthly',
  },
  {
    path: '/return-policy',
    title: 'Return & Refund Policy | PZM Dubai',
    description:
      'Read the return and refund policy for PZM Computers & Phones Store in Dubai, including eligibility, defective items, exchanges, and used-device conditions.',
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
        description: 'Buy iPhone in Dubai from PZM with direct WhatsApp ordering and local support.',
        imageUrl: '/api/media/legacy/buy_iphone/iPhone_17_Pro_Max_all_colors.jpg',
      },
      'brand-new': {
        title: 'Brand New Devices in Dubai | PZM Dubai',
        description: 'Browse brand-new devices in Dubai from PZM, including phones, laptops, consoles, and more.',
        imageUrl: '/api/media/legacy/Catigories/brand_new.jpg',
      },
      secondhand: {
        title: 'Buy Used iPhones, Laptops & Gaming PCs | PZM Dubai',
        description: 'Browse certified pre-owned devices in Dubai from PZM, including phones, laptops, tablets, and gaming hardware.',
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
const secondhandRoute = canonicalRouteMap.get('/services/secondhand')

// NOTE: .html aliases removed for routes that have canonical clean-URL prerendered
// pages. Cloudflare Pages Pretty URLs resolves /path to path.html, which would
// serve the noindex alias instead of the canonical path/index.html.
// Those .html URLs are handled by 301 redirects in _redirects instead.
const aliasRoutes = [
  {
    ...blogRoute,
    path: '/blog-post.html',
    title: 'Tech Blog - iPhone, PC & Repair Tips | PZM Dubai',
    canonicalPath: '/blog/',
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

const liveProducts = await fetchLiveProducts()

if (liveProducts.length > 0) {
  const brandNewSnapshotHtml = buildBrandNewSnapshot(liveProducts)
  const secondhandSnapshotHtml = buildSecondhandSnapshot(liveProducts)

  for (const route of [...canonicalRoutes, ...aliasRoutes]) {
    const normalizedCanonicalPath = normalizeCanonicalPath(route.canonicalPath || route.path)

    if (normalizedCanonicalPath === '/services/brand-new') {
      route.rootHtml = brandNewSnapshotHtml
      route.preloadedProducts = liveProducts
    }

    if (normalizedCanonicalPath === '/services/secondhand') {
      route.rootHtml = secondhandSnapshotHtml
      route.preloadedProducts = liveProducts
    }
  }
}

const template = await fs.readFile(templatePath, 'utf8')

for (const route of canonicalRoutes) {
  await writeRouteHtml(template, route)
}

for (const route of aliasRoutes) {
  await writeRouteHtml(template, route)
}

await fs.writeFile(path.join(distRoot, 'sitemap.xml'), buildSitemap(canonicalRoutes), 'utf8')
