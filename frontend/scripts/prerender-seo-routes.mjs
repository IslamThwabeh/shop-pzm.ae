import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const distRoot = path.join(frontendRoot, 'dist')
const templatePath = path.join(distRoot, 'index.html')
const contentRoot = path.join(frontendRoot, 'src', 'content')
const SITE_URL = (process.env.VITE_SITE_URL || 'https://pzm.ae').replace(/\/+$/, '')
const DEFAULT_IMAGE = `${SITE_URL}/images/mini_logo.png`
const PRODUCT_FEED_URL = process.env.PZM_PRODUCT_FEED_URL || 'https://shop.pzm.ae/api/products'
const LASTMOD = '2026-04-07'

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function decodeSingleQuotedString(value) {
  return value.replace(/\\'/g, "'")
}

function splitPathSuffix(pathValue) {
  const match = pathValue.match(/^([^?#]*)([?#].*)?$/)

  return {
    basePath: match?.[1] || pathValue,
    suffix: match?.[2] || '',
  }
}

function normalizeCanonicalPath(routePath) {
  if (!routePath) {
    return '/'
  }

  const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`
  const { basePath, suffix } = splitPathSuffix(normalizedPath)

  if (basePath === '/' || /\.[a-z\d]+$/i.test(basePath) || /^\/api(?:\/|$)/i.test(basePath)) {
    return `${basePath}${suffix}`
  }

  return `${basePath.replace(/\/+$/, '')}/${suffix}`
}

function normalizePublicHref(href) {
  if (!href || href.startsWith('#') || /^(?:mailto:|tel:|sms:|javascript:)/i.test(href)) {
    return href
  }

  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href)

      if (url.origin !== SITE_URL) {
        return href
      }

      return `${SITE_URL}${normalizeCanonicalPath(`${url.pathname}${url.search}${url.hash}`)}`
    } catch {
      return href
    }
  }

  if (!href.startsWith('/')) {
    return href
  }

  return normalizeCanonicalPath(href)
}

function normalizeEmbeddedInternalLinks(html) {
  return html.replace(/href="(\/[^\"]*)"/g, (_, href) => `href="${normalizePublicHref(href)}"`)
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

function formatMerchantPrice(value) {
  const numericValue = Number(value)
  return `${Number.isFinite(numericValue) ? numericValue.toFixed(2) : '0.00'} AED`
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value
  }

  const truncated = value.slice(0, maxLength - 1)
  const safeBoundary = truncated.lastIndexOf(' ')

  return `${(safeBoundary > 60 ? truncated.slice(0, safeBoundary) : truncated).trim()}…`
}

function formatLastmodDate(value) {
  if (!value) {
    return LASTMOD
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? LASTMOD : parsed.toISOString().slice(0, 10)
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

function getOptionalProductText(value) {
  return cleanProductText(value) || undefined
}

const placeholderProductColors = new Set(['contact us', 'various options', 'color options'])

const productBrandPatterns = [
  [/^iphone|^ipad/i, 'Apple'],
  [/^macbook/i, 'Apple'],
  [/^samsung|^galaxy/i, 'Samsung'],
  [/^honor/i, 'Honor'],
  [/^nokia/i, 'Nokia'],
  [/^tecno/i, 'Tecno'],
  [/^playstation|^ps[45]/i, 'PlayStation'],
  [/^xbox/i, 'Xbox'],
  [/^nintendo/i, 'Nintendo'],
  [/^hp\b/i, 'HP'],
  [/^lenovo/i, 'Lenovo'],
  [/^dell/i, 'Dell'],
  [/^alienware/i, 'Alienware'],
  [/^asus|^rog\b/i, 'ASUS'],
  [/^aorus/i, 'AORUS'],
  [/^microsoft|^surface/i, 'Microsoft'],
  [/^huawei|^matepad/i, 'Huawei'],
  [/^redmi|^xiaomi/i, 'Xiaomi'],
  [/^lg\b/i, 'LG'],
  [/^gaming pc/i, 'Gaming PC'],
]

function isPlaceholderProductColor(color) {
  return placeholderProductColors.has(String(color || '').trim().toLowerCase())
}

function extractProductBrand(model) {
  const normalizedModel = String(model || '').trim()

  for (const [pattern, brand] of productBrandPatterns) {
    if (pattern.test(normalizedModel)) {
      return brand
    }
  }

  return undefined
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
    brand: getOptionalProductText(product.brand),
    product_type: getOptionalProductText(product.product_type),
    google_product_category: getOptionalProductText(product.google_product_category),
    gtin: getOptionalProductText(product.gtin),
    mpn: getOptionalProductText(product.mpn),
    item_group_id: getOptionalProductText(product.item_group_id),
    warranty: getOptionalProductText(product.warranty),
    accessories_included: getOptionalProductText(product.accessories_included),
    cosmetic_grade: getOptionalProductText(product.cosmetic_grade),
    repair_history: getOptionalProductText(product.repair_history),
  }
}

function getKnownProductBrand(product) {
  return getOptionalProductText(product.brand) || extractProductBrand(product.model)
}

function buildProductDetailEntries(product) {
  const brand = getKnownProductBrand(product)
  const entries = []

  if (brand) entries.push({ label: 'Brand', value: brand })
  if (product.release_year) entries.push({ label: 'Release year', value: String(product.release_year) })
  if (product.battery_health != null) entries.push({ label: 'Battery health', value: `${product.battery_health}%` })
  if (product.cosmetic_grade) entries.push({ label: 'Cosmetic grade', value: product.cosmetic_grade })
  if (product.repair_history) entries.push({ label: 'Repair history', value: product.repair_history })
  if (product.accessories_included) entries.push({ label: 'Included', value: product.accessories_included })
  if (product.warranty) entries.push({ label: 'Warranty', value: product.warranty })

  return entries
}

function buildProductFallbackHighlights(product) {
  const highlights = []

  if (product.release_year) highlights.push(`Released ${product.release_year}`)
  if (product.battery_health != null) highlights.push(`Battery ${product.battery_health}%`)
  if (product.cosmetic_grade) highlights.push(`Cosmetic grade ${product.cosmetic_grade}`)
  if (product.repair_history) highlights.push(product.repair_history)
  if (product.accessories_included) highlights.push(`Includes ${product.accessories_included}`)
  if (product.warranty) highlights.push(product.warranty)

  return highlights
}

function hasProductIdentifiers(product) {
  return Boolean(getOptionalProductText(product.gtin) || (getOptionalProductText(product.mpn) && getKnownProductBrand(product)))
}

function getProductImageUrl(product) {
  return toAbsoluteUrl(product.image_url || product.images?.[0] || DEFAULT_IMAGE)
}

function buildProductWhatsAppHref(product, kind) {
  const productLabel = buildProductLabel(product)
  const message = kind === 'new'
    ? `Hi, I'm interested in the brand-new ${productLabel} for ${formatPrice(product.price)} AED (via pzm.ae)`
    : `Hi, I'm interested in the used ${productLabel} for ${formatPrice(product.price)} AED (via pzm.ae)`

  return `https://wa.me/971528026677?text=${encodeURIComponent(message)}`
}

function buildProductPath(product) {
  return `/product/${String(product.id || '').trim()}`
}

function getProductBrowsePath(product) {
  if (product.condition === 'used') {
    return '/services/secondhand'
  }

  if (/iphone/i.test(String(product.model || ''))) {
    return '/services/buy-iphone'
  }

  return '/services/brand-new'
}

function getProductConditionLabel(product) {
  return product.condition === 'used' ? 'Used' : 'Brand New'
}

function buildProductLabel(product) {
  const segments = [product.model, product.storage]

  if (product.color && !isPlaceholderProductColor(product.color)) {
    segments.push(product.color)
  }

  return cleanProductText(segments.filter(Boolean).join(' ')) || String(product.model || 'Product').trim()
}

function buildProductRichDescription(product) {
  const description = cleanProductText(String(product.description || '').trim())
  if (description) {
    return description
  }

  const highlights = buildProductFallbackHighlights(product)
  const fallbackDescription = `${buildProductLabel(product)} from PZM in Dubai with ${product.condition === 'used' ? 'used-device' : 'brand-new'} availability, local support, and Cash on Delivery.`
  return cleanProductText([fallbackDescription, ...highlights].join(' '))
}

function buildProductMetaDescription(product) {
  return truncateText(buildProductRichDescription(product), 160)
}

function buildMerchantProductType(product) {
  if (product.product_type) {
    return product.product_type
  }

  const model = String(product.model || '').toLowerCase()
  const inventoryType = product.condition === 'used' ? 'Used Devices' : 'Brand New Devices'

  if (/(iphone|galaxy|pixel|android|phone|mobile|ipad|tablet|\btab\b|watch|wearable)/i.test(model)) {
    return `${inventoryType} > Phones & Tablets`
  }

  if (/(macbook|laptop|notebook|surface|thinkpad|lenovo|hp|dell|asus|acer|elitebook|probook|xps|inspiron|spectre|envy)/i.test(model)) {
    return `${inventoryType} > Laptops & Computers`
  }

  if (/(playstation|ps5|ps4|xbox|nintendo|switch|gaming|rog|alienware|console)/i.test(model)) {
    return `${inventoryType} > Gaming`
  }

  return inventoryType
}

function buildMerchantGoogleProductCategory(product) {
  return getOptionalProductText(product.google_product_category)
}

function buildProductJsonLd(product) {
  const imageUrl = getProductImageUrl(product)
  const brand = getKnownProductBrand(product)
  const canonicalPath = normalizeCanonicalPath(buildProductPath(product))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: buildProductLabel(product),
    description: buildProductRichDescription(product),
    sku: product.id,
    url: toAbsoluteUrl(canonicalPath),
    image: imageUrl ? [imageUrl] : [],
    offers: {
      '@type': 'Offer',
      url: toAbsoluteUrl(canonicalPath),
      priceCurrency: 'AED',
      price: Number(product.price || 0).toFixed(2),
      availability: (product.quantity ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: product.condition === 'used'
        ? 'https://schema.org/UsedCondition'
        : 'https://schema.org/NewCondition',
    },
  }

  if (brand) {
    jsonLd.brand = {
      '@type': 'Brand',
      name: brand,
    }
  }

  if (product.color && !isPlaceholderProductColor(product.color)) {
    jsonLd.color = product.color
  }

  if (product.gtin) {
    jsonLd.gtin = product.gtin
  }

  if (product.mpn) {
    jsonLd.mpn = product.mpn
  }

  return jsonLd
}

function buildProductSnapshot(product) {
  const label = buildProductLabel(product)
  const imageUrl = getProductImageUrl(product)
  const description = buildProductRichDescription(product)
  const browsePath = getProductBrowsePath(product)
  const inStock = (product.quantity ?? 0) > 0
  const conditionLabel = getProductConditionLabel(product)
  const detailEntries = buildProductDetailEntries(product)
  const stockText = inStock ? `${product.quantity} in stock - Cash on Delivery` : 'Out of stock - Contact us for the latest restock details'
  const whatsappHref = buildProductWhatsAppHref(product, product.condition === 'used' ? 'used' : 'new')
  const warrantyLabel = product.warranty || (product.condition === 'new' ? 'Warranty' : 'Inspected & Tested')
  const conditionClassName = product.condition === 'used'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-emerald-50 text-emerald-700'

  return `
    <div class="space-y-8">
      <nav class="flex items-center gap-2 text-sm text-brandTextMedium">
        <a href="${normalizeCanonicalPath(browsePath)}" class="font-semibold text-primary hover:underline flex items-center gap-1">
          Back to catalog
        </a>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-[28px] border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <div class="flex items-center justify-center rounded-2xl border border-[#eee] bg-slate-50 p-6 min-h-[280px]">
          <div class="flex h-full w-full items-center justify-center">
            <img src="${imageUrl}" alt="${escapeHtml(label)}" loading="eager" style="max-width:100%;max-height:320px;object-fit:contain;" />
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div>
            <span class="inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${conditionClassName}">
              ${conditionLabel}
            </span>
            <h1 class="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">${escapeHtml(product.model)}</h1>
            <p class="mt-2 text-sm leading-relaxed text-brandTextMedium">${escapeHtml(description)}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            ${product.storage ? `<span class="rounded-full border border-[#eee] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">${escapeHtml(product.storage)}</span>` : ''}
            ${product.color && !isPlaceholderProductColor(product.color) ? `<span class="rounded-full border border-[#eee] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">${escapeHtml(product.color)}</span>` : ''}
          </div>

          ${detailEntries.length > 0 ? `
            <dl class="grid grid-cols-1 gap-3 rounded-2xl border border-[#eee] bg-slate-50/70 p-4 sm:grid-cols-2">
              ${detailEntries.map((entry) => `
                <div>
                  <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">${escapeHtml(entry.label)}</dt>
                  <dd class="mt-1 text-sm font-medium text-slate-700">${escapeHtml(entry.value)}</dd>
                </div>
              `).join('')}
            </dl>
          ` : ''}

          <div>
            <p class="text-3xl font-bold text-slate-900">AED ${formatPrice(product.price)}</p>
            <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-brandTextMedium">${escapeHtml(stockText)}</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a href="${whatsappHref}" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#eee] px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#25D366]">
              Order via WhatsApp
            </a>
            <a href="${normalizeCanonicalPath(browsePath)}" class="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark">
              Browse Similar Devices
            </a>
          </div>

          <div class="grid grid-cols-3 gap-3 border-t border-[#eee] pt-5">
            <div class="text-center">
              <p class="text-[11px] font-medium text-slate-500">Dubai delivery</p>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-medium text-slate-500">${escapeHtml(warrantyLabel)}</p>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-medium text-slate-500">Store pickup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function buildProductRoutes(products) {
  const uniqueProducts = new Map()

  for (const product of products) {
    const productId = String(product.id || '').trim()
    if (!productId) {
      continue
    }

    const existing = uniqueProducts.get(productId)
    if (!existing || getProductTimestamp(product) >= getProductTimestamp(existing)) {
      uniqueProducts.set(productId, product)
    }
  }

  return Array.from(uniqueProducts.values())
    .sort(sortProducts)
    .map((product) => ({
      path: buildProductPath(product),
      title: `${buildProductLabel(product)} | PZM Computers & Phones`,
      description: buildProductMetaDescription(product),
      canonicalPath: buildProductPath(product),
      imageUrl: getProductImageUrl(product),
      priority: (product.quantity ?? 0) > 0 ? '0.8' : '0.5',
      changefreq: 'daily',
      lastmod: formatLastmodDate(product.updated_at || product.updatedAt || product.created_at || product.createdAt),
      rootHtml: buildProductSnapshot(product),
      preloadedProducts: [product],
      jsonLd: buildProductJsonLd(product),
    }))
}

function buildMerchantFeed(products) {
  const uniqueProducts = new Map()

  for (const product of products) {
    const productId = String(product.id || '').trim()
    if (!productId || Number(product.price) <= 0 || (product.quantity ?? 0) <= 0) {
      continue
    }

    const existing = uniqueProducts.get(productId)
    if (!existing || getProductTimestamp(product) >= getProductTimestamp(existing)) {
      uniqueProducts.set(productId, product)
    }
  }

  const feedProducts = Array.from(uniqueProducts.values()).sort(sortProducts)

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    '    <title>PZM Merchant Feed</title>',
    `    <link>${escapeXml(`${SITE_URL}/`)}</link>`,
    `    <description>${escapeXml('Live in-stock products from PZM Computers & Phones Store in Dubai.')}</description>`,
  ]

  for (const product of feedProducts) {
    const brand = getKnownProductBrand(product)
    const googleProductCategory = buildMerchantGoogleProductCategory(product)
    const gtin = getOptionalProductText(product.gtin)
    const mpn = getOptionalProductText(product.mpn)
    const itemGroupId = getOptionalProductText(product.item_group_id)
    const canonicalPath = normalizeCanonicalPath(buildProductPath(product))
    const imageLinks = [getProductImageUrl(product), ...(Array.isArray(product.images) ? product.images : [])]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, 11)

    lines.push('    <item>')
    lines.push(`      <g:id>${escapeXml(String(product.id))}</g:id>`)
    lines.push(`      <g:title>${escapeXml(buildProductLabel(product))}</g:title>`)
    lines.push(`      <g:description>${escapeXml(buildProductRichDescription(product))}</g:description>`)
    lines.push(`      <g:link>${escapeXml(toAbsoluteUrl(canonicalPath))}</g:link>`)
    lines.push(`      <g:image_link>${escapeXml(imageLinks[0] || DEFAULT_IMAGE)}</g:image_link>`)

    for (const additionalImage of imageLinks.slice(1)) {
      lines.push(`      <g:additional_image_link>${escapeXml(toAbsoluteUrl(additionalImage))}</g:additional_image_link>`)
    }

    lines.push(`      <g:availability>${(product.quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>`)
    lines.push(`      <g:price>${escapeXml(formatMerchantPrice(product.price))}</g:price>`)
    lines.push(`      <g:condition>${product.condition === 'used' ? 'used' : 'new'}</g:condition>`)
    lines.push(`      <g:product_type>${escapeXml(buildMerchantProductType(product))}</g:product_type>`)

    if (googleProductCategory) {
      lines.push(`      <g:google_product_category>${escapeXml(googleProductCategory)}</g:google_product_category>`)
    }

    if (itemGroupId) {
      lines.push(`      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>`)
    }

    if (brand) {
      lines.push(`      <g:brand>${escapeXml(brand)}</g:brand>`)
    }

    if (gtin) {
      lines.push(`      <g:gtin>${escapeXml(gtin)}</g:gtin>`)
    }

    if (mpn) {
      lines.push(`      <g:mpn>${escapeXml(mpn)}</g:mpn>`)
    }

    if (!hasProductIdentifiers(product)) {
      lines.push('      <g:identifier_exists>no</g:identifier_exists>')
    }

    lines.push('    </item>')
  }

  lines.push('  </channel>')
  lines.push('</rss>')

  return `${lines.join('\n')}\n`
}

function escapeMerchantTabValue(value) {
  return String(value || '')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildMerchantTabFeed(products) {
  const uniqueProducts = new Map()

  for (const product of products) {
    const productId = String(product.id || '').trim()
    if (!productId || Number(product.price) <= 0 || (product.quantity ?? 0) <= 0) {
      continue
    }

    const existing = uniqueProducts.get(productId)
    if (!existing || getProductTimestamp(product) >= getProductTimestamp(existing)) {
      uniqueProducts.set(productId, product)
    }
  }

  const feedProducts = Array.from(uniqueProducts.values()).sort(sortProducts)
  const rows = [
    [
      'id',
      'title',
      'description',
      'link',
      'image_link',
      'availability',
      'price',
      'condition',
      'brand',
      'product_type',
      'google_product_category',
      'gtin',
      'mpn',
      'item_group_id',
      'identifier_exists',
    ].join('\t'),
  ]

  for (const product of feedProducts) {
    const brand = getKnownProductBrand(product) || ''
    const canonicalPath = normalizeCanonicalPath(buildProductPath(product))
    const row = [
      product.id,
      buildProductLabel(product),
      buildProductRichDescription(product),
      toAbsoluteUrl(canonicalPath),
      getProductImageUrl(product),
      (product.quantity ?? 0) > 0 ? 'in stock' : 'out of stock',
      formatMerchantPrice(product.price),
      product.condition === 'used' ? 'used' : 'new',
      brand,
      buildMerchantProductType(product),
      buildMerchantGoogleProductCategory(product) || '',
      getOptionalProductText(product.gtin) || '',
      getOptionalProductText(product.mpn) || '',
      getOptionalProductText(product.item_group_id) || '',
      hasProductIdentifiers(product) ? '' : 'no',
    ].map((value) => escapeMerchantTabValue(value))

    rows.push(row.join('\t'))
  }

  return `${rows.join('\n')}\n`
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

const buyIphoneSnapshotFamilies = [
  {
    key: 'iphone-17-pro-max',
    title: 'iPhone 17 Pro Max',
    shortTitle: 'Pro Max',
    description: 'Flagship size, colors, and top-tier iPhone options.',
    matcher: /\biphone\s*17\s*pro\s*max\b/i,
  },
  {
    key: 'iphone-17-pro',
    title: 'iPhone 17 Pro',
    shortTitle: 'Pro',
    description: 'Flagship performance in the smaller Pro size.',
    matcher: /\biphone\s*17\s*pro\b(?!\s*max)/i,
  },
  {
    key: 'iphone-17-air',
    title: 'iPhone 17 Air',
    shortTitle: 'Air',
    description: 'Thin-and-light iPhone options in the Air line.',
    matcher: /\biphone\s*17\s*air\b/i,
  },
  {
    key: 'iphone-17',
    title: 'iPhone 17',
    shortTitle: 'Standard',
    description: 'Current-generation iPhone options outside the Pro tier.',
    matcher: /\biphone\s*17\b(?!\s*pro\b)(?!\s*air\b)/i,
  },
]

const defaultSnapshotLinks = [
  { title: 'Home', description: 'Go back to the main storefront overview.', href: '/', cta: 'Open home' },
  { title: 'Services', description: 'Browse all service and retail category pages.', href: '/services', cta: 'Open services' },
  { title: 'Areas', description: 'See the Dubai communities served by the store.', href: '/areas', cta: 'Open areas' },
  { title: 'Blog', description: 'Read buying guides, repair advice, and market updates.', href: '/blog/', cta: 'Open blog' },
]

const termsSnapshotSections = [
  {
    title: '1. Business Information',
    paragraphs: [
      'PZM Computers & Phones Store operates from Al Barsha on Hessa Street inside Hessa Union Coop Hypermarket, Ground Floor, Dubai, United Arab Emirates.',
      'Phone and WhatsApp support is available on +971 52 802 6677 for questions about ordering, pricing, delivery, and store visits.',
    ],
  },
  {
    title: '2. Products & Pricing',
    items: [
      'All prices displayed on the site are in AED and can change without prior notice.',
      'Product details, colors, and configurations can vary based on stock and supplier availability.',
      'Images are illustrative and the final color or finish can look slightly different in person.',
      'Products marked as contact-required need direct confirmation for the latest pricing and availability.',
    ],
  },
  {
    title: '3. How to Order',
    items: [
      'Message the store on WhatsApp with the product or service you want.',
      'Call the team directly for immediate assistance or confirmation.',
      'Visit the Al Barsha branch in person if you prefer a walk-in purchase or consultation.',
    ],
  },
  {
    title: '4. Payment Methods',
    items: [
      'Cash on Delivery is available where applicable.',
      'Pay-by-link can be sent after order confirmation.',
      'In-store payment can be completed by cash or card.',
    ],
  },
  {
    title: '5. Delivery',
    items: [
      'Same-day delivery is offered within Dubai subject to timing and driver scheduling.',
      'Delivery across the UAE usually takes 1 to 3 business days.',
      'Free delivery may apply to eligible Dubai orders.',
      'Any delivery charges are confirmed before the order is finalized.',
      'Customers should be available to receive and inspect the product on delivery.',
    ],
  },
  {
    title: '6. Warranty',
    items: [
      'New devices come with official manufacturer warranty coverage.',
      'Used and pre-owned devices carry the store warranty disclosed at the time of sale.',
      'Warranty does not cover misuse, accidents, or unauthorized modifications.',
      'Custom PC builds are covered at the component level according to each manufacturer.',
    ],
  },
  {
    title: '7. Returns & Refunds',
    paragraphs: [
      'Return and refund handling follows the dedicated return policy. Customers should review the full return rules before ordering a sealed device, a configured build, or a pre-owned item.',
      'Read the dedicated <a href="/return-policy" style="color:#00A76F;text-decoration:none;font-weight:700;">Return &amp; Refund Policy</a> for the exact terms.',
    ],
  },
  {
    title: '8. Intellectual Property',
    paragraphs: [
      'Text, images, branding, design, and storefront content on the site remain the property of PZM Computers & Phones Store and may not be reproduced, distributed, or modified without written permission.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    items: [
      'PZM is not liable for indirect, incidental, or consequential damages arising from product use.',
      'Total liability is limited to the purchase price of the product in question.',
      'Courier delays and force majeure events are outside the store’s direct responsibility.',
    ],
  },
  {
    title: '10. Privacy',
    paragraphs: [
      'Personal information collected during ordering is used only to process the order, arrange delivery, and support after-sales service. It is not shared with third parties for marketing purposes.',
    ],
  },
  {
    title: '11. Governing Law',
    paragraphs: [
      'These terms are governed by the laws of the United Arab Emirates and any disputes fall under the jurisdiction of the courts of Dubai.',
    ],
  },
  {
    title: '12. Changes to Terms',
    paragraphs: [
      'The store may update these terms over time. Continued use of the website or the purchase flow means the updated terms are accepted once posted.',
    ],
  },
  {
    title: '13. Contact Us',
    paragraphs: [
      'For questions about the terms, contact the store on <a href="https://wa.me/971528026677?text=Hi%2C%20I%20have%20a%20question%20about%20your%20terms.%20(via%20pzm.ae)" style="color:#00A76F;text-decoration:none;font-weight:700;">WhatsApp</a>, call <a href="tel:+971528026677" style="color:#00A76F;text-decoration:none;font-weight:700;">+971 52 802 6677</a>, or visit the Al Barsha branch.',
    ],
  },
]

const returnPolicySnapshotSections = [
  {
    title: '1. Return Eligibility',
    paragraphs: [
      'Products can be returned within 7 days of delivery or purchase when they remain sealed, unused, undamaged, and complete with original accessories, manuals, warranty cards, and proof of purchase.',
    ],
  },
  {
    title: '2. Non-Returnable Items',
    items: [
      'Opened, activated, or used products.',
      'Applied or used cases, screen protectors, and similar accessories.',
      'Products damaged after delivery by the customer.',
      'Custom-built PCs and configured-to-order items.',
      'Software, digital products, and gift cards.',
    ],
  },
  {
    title: '3. Defective or Damaged Products',
    items: [
      'Report defects or shipping damage within 48 hours of delivery.',
      'Eligible cases may qualify for a replacement or full refund.',
      'Manufacturer-warranty items may be processed through the official warranty channel.',
    ],
  },
  {
    title: '4. How to Initiate a Return',
    paragraphs: [
      'Start the process by messaging the store on <a href="https://wa.me/971528026677?text=Hi%2C%20I%20would%20like%20to%20initiate%20a%20return.%20(via%20pzm.ae)" style="color:#00A76F;text-decoration:none;font-weight:700;">WhatsApp</a>, calling <a href="tel:+971528026677" style="color:#00A76F;text-decoration:none;font-weight:700;">+971 52 802 6677</a>, or visiting the Al Barsha store.',
      'The team reviews the case and responds with the next steps, usually within 24 hours.',
    ],
  },
  {
    title: '5. Refund Process',
    items: [
      'Cash on Delivery orders are refunded through cash at the store or bank transfer within 5 to 7 business days.',
      'Pay-by-link orders are refunded to the original payment method within 5 to 7 business days.',
      'Shipping fees are only refunded when the return is caused by a defective or incorrect item.',
    ],
  },
  {
    title: '6. Exchange Policy',
    paragraphs: [
      'Exchanges are possible during the 7-day return window if the same return conditions are met. Higher-value exchanges require payment of the price difference.',
    ],
  },
  {
    title: '7. Used & Pre-owned Devices',
    paragraphs: [
      'Used and pre-owned devices are sold as-is. Returns are only accepted if an undisclosed hardware defect is discovered within 3 days of purchase.',
    ],
  },
  {
    title: '8. Contact Us',
    paragraphs: [
      'If you need help with a return or refund question, contact the team on <a href="https://wa.me/971528026677?text=Hi%2C%20I%20have%20a%20question%20about%20your%20return%20policy.%20(via%20pzm.ae)" style="color:#00A76F;text-decoration:none;font-weight:700;">WhatsApp</a>, call <a href="tel:+971528026677" style="color:#00A76F;text-decoration:none;font-weight:700;">+971 52 802 6677</a>, or visit the store in Al Barsha.',
    ],
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

function formatPublishedDate(publishedAt) {
  return new Date(`${publishedAt}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildBlogIndexSnapshot(entries) {
  const articleCards = entries
    .map(
      (entry) => `
        <article style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#00A76F;">${escapeHtml(entry.category)}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#64748b;">${escapeHtml(formatPublishedDate(entry.publishedAt))}</p>
          <h2 style="margin:14px 0 0;font-size:24px;line-height:1.3;color:#0f172a;">
            <a href="${escapeHtml(normalizePublicHref(`/blog/${entry.slug}`))}" style="color:inherit;text-decoration:none;">${escapeHtml(entry.title)}</a>
          </h2>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#475569;">${escapeHtml(entry.excerpt)}</p>
          <a href="${escapeHtml(normalizePublicHref(`/blog/${entry.slug}`))}" style="display:inline-block;margin-top:18px;font-size:14px;font-weight:700;color:#00A76F;text-decoration:none;">Read article</a>
        </article>`
    )
    .join('')

  return `
    <div data-pzm-prerender-blog="true" style="max-width:1280px;margin:0 auto;padding:48px 16px 64px;font-family:'Open Sans',system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
      <div style="max-width:960px;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#00A76F;">PZM Blog</p>
        <h1 style="margin:14px 0 0;font-size:42px;line-height:1.08;color:#0f172a;">Latest Tech Updates</h1>
        <p style="margin:18px 0 0;font-size:16px;line-height:1.8;color:#64748b;">Stay informed with the latest tech news, buying guides, repair advice, and local market insights from Dubai.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:28px;">
        ${articleCards}
      </div>
    </div>`
}

function buildBlogArticleSnapshot(entry) {
  return `
    <div data-pzm-prerender-blog-article="true" style="max-width:1100px;margin:0 auto;padding:48px 16px 64px;font-family:'Open Sans',system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
      <a href="${escapeHtml(normalizePublicHref('/blog/'))}" style="display:inline-block;font-size:14px;font-weight:700;color:#00A76F;text-decoration:none;">&larr; Back to blog</a>
      <div style="margin-top:18px;max-width:860px;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#00A76F;">${escapeHtml(entry.category)}</p>
        <p style="margin:12px 0 0;font-size:14px;color:#64748b;">${escapeHtml(formatPublishedDate(entry.publishedAt))}</p>
        <h1 style="margin:14px 0 0;font-size:42px;line-height:1.12;color:#0f172a;">${escapeHtml(entry.title)}</h1>
        <p style="margin:18px 0 0;font-size:16px;line-height:1.8;color:#475569;">${escapeHtml(entry.excerpt)}</p>
      </div>
      <article style="margin-top:28px;border:1px solid #e2e8f0;border-radius:28px;background:#ffffff;padding:32px;box-shadow:0 1px 3px rgba(15,23,42,0.06);font-size:16px;line-height:1.9;color:#334155;">
        ${normalizeEmbeddedInternalLinks(entry.bodyHtml)}
      </article>
      <section style="margin-top:24px;border:1px solid #e2e8f0;border-radius:28px;background:#ffffff;padding:24px;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
        <h2 style="margin:0;font-size:28px;line-height:1.2;color:#0f172a;">Related store pages</h2>
        <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#64748b;max-width:820px;">Continue from the article into the product, repair, and contact pages that connect with the same buying or support journey.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:18px;">
          <a href="${escapeHtml(normalizePublicHref('/services/buy-iphone'))}" style="display:block;border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:18px;color:#0f172a;text-decoration:none;">
            <strong style="display:block;font-size:18px;line-height:1.35;">Buy iPhone</strong>
            <span style="display:block;margin-top:10px;font-size:14px;line-height:1.75;color:#475569;">Open the iPhone buying page for the latest listed models and direct contact options.</span>
          </a>
          <a href="${escapeHtml(normalizePublicHref('/services/secondhand'))}" style="display:block;border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:18px;color:#0f172a;text-decoration:none;">
            <strong style="display:block;font-size:18px;line-height:1.35;">Certified Pre-Owned</strong>
            <span style="display:block;margin-top:10px;font-size:14px;line-height:1.75;color:#475569;">Browse used devices, grading details, and current stock listed on the storefront.</span>
          </a>
          <a href="${escapeHtml(normalizePublicHref('/services/repair'))}" style="display:block;border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:18px;color:#0f172a;text-decoration:none;">
            <strong style="display:block;font-size:18px;line-height:1.35;">Repair Services</strong>
            <span style="display:block;margin-top:10px;font-size:14px;line-height:1.75;color:#475569;">Move from the article into repair intake, quote requests, and same-day support options.</span>
          </a>
        </div>
      </section>
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

function buildPageShell({ eyebrow, title, intro, stats = [], sections = [] }) {
  const statsHtml = stats.length > 0
    ? `
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">
        ${stats
          .map(
            (stat) => `<span style="display:inline-flex;align-items:center;border:1px solid #dbe4ee;border-radius:999px;background:#ffffff;padding:10px 14px;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(stat)}</span>`
          )
          .join('')}
      </div>`
    : ''

  return `
    <div data-pzm-prerender-page="true" style="max-width:1280px;margin:0 auto;padding:48px 16px 64px;font-family:'Open Sans',system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
      <div style="max-width:960px;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#00A76F;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin:14px 0 0;font-size:42px;line-height:1.08;color:#0f172a;">${escapeHtml(title)}</h1>
        <p style="margin:18px 0 0;font-size:16px;line-height:1.8;color:#475569;">${escapeHtml(intro)}</p>
        ${statsHtml}
      </div>
      ${sections.join('')}
      ${buildSnapshotSection(
        'Explore more pages',
        'Use the links below to continue through the storefront, local area coverage, and blog content.',
        buildLinkGrid(defaultSnapshotLinks)
      )}
    </div>`
}

function buildSnapshotSection(title, description, contentHtml) {
  return `
    <section style="margin-top:28px;border:1px solid #e2e8f0;border-radius:28px;background:#ffffff;padding:24px;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
      <h2 style="margin:0;font-size:28px;line-height:1.2;color:#0f172a;">${escapeHtml(title)}</h2>
      ${description ? `<p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#64748b;max-width:920px;">${escapeHtml(description)}</p>` : ''}
      <div style="margin-top:18px;">${contentHtml}</div>
    </section>`
}

function buildLinkGrid(items) {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
      ${items
        .map(
          (item) => `
            <article style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:20px;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
              ${item.eyebrow ? `<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#00A76F;">${escapeHtml(item.eyebrow)}</p>` : ''}
              <h3 style="margin:12px 0 0;font-size:20px;line-height:1.35;color:#0f172a;">${escapeHtml(item.title)}</h3>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.75;color:#475569;">${escapeHtml(item.description)}</p>
                <a href="${escapeHtml(normalizePublicHref(item.href))}" style="display:inline-block;margin-top:16px;font-size:14px;font-weight:700;color:#00A76F;text-decoration:none;">${escapeHtml(item.cta || 'Open page')}</a>
            </article>`
        )
        .join('')}
    </div>`
}

function buildBulletList(items) {
  return `
    <ul style="margin:0;padding-left:20px;display:grid;gap:10px;font-size:15px;line-height:1.75;color:#334155;">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>`
}

function buildParagraphs(paragraphs) {
  return paragraphs
    .map(
      (paragraph) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.85;color:#334155;">${normalizeEmbeddedInternalLinks(paragraph)}</p>`
    )
    .join('')
}

function buildChipList(items) {
  return `
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${items
        .map(
          (item) => `<span style="display:inline-flex;align-items:center;border:1px solid #dbe4ee;border-radius:999px;background:#f8fafc;padding:10px 14px;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(item)}</span>`
        )
        .join('')}
    </div>`
}

function buildStepsList(steps) {
  return `
    <ol style="margin:0;padding-left:20px;display:grid;gap:12px;font-size:15px;line-height:1.8;color:#334155;">
      ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
    </ol>`
}

function buildActionLinks(actions) {
  return `
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      ${actions
        .map(
          (action) => `<a href="${escapeHtml(normalizePublicHref(action.href))}" style="display:inline-block;border:1px solid #dbe4ee;border-radius:999px;background:#ffffff;padding:12px 16px;font-size:14px;font-weight:700;color:#0f172a;text-decoration:none;">${escapeHtml(action.label)}</a>`
        )
        .join('')}
    </div>`
}

function buildLegalSnapshot({ eyebrow, title, intro, lastUpdated, sections }) {
  return buildPageShell({
    eyebrow,
    title,
    intro: `${intro} Last updated: ${lastUpdated}.`,
    sections: sections.map((section) => {
      const contentParts = []

      if (section.paragraphs?.length) {
        contentParts.push(buildParagraphs(section.paragraphs))
      }

      if (section.items?.length) {
        contentParts.push(buildBulletList(section.items))
      }

      return buildSnapshotSection(section.title, section.description || '', contentParts.join(''))
    }),
  })
}

function buildHomeSnapshot(serviceEntries, areaEntries, blogEntries) {
  return buildPageShell({
    eyebrow: 'PZM Storefront',
    title: 'PZM Computers & Phones Store',
    intro:
      'Your integrated device solutions hub in Al Barsha, Dubai, serving Barsha 1-3, Dubai Science Park, JVC, Meadows Village, JLT, Springs, Barsha Heights, Tecom, and Al Sufouh with devices, repairs, accessories, and buying guides.',
    stats: [
      `${serviceEntries.length} service pages`,
      `${areaEntries.length} Dubai area pages`,
      `${blogEntries.length} blog articles`,
    ],
    sections: [
      buildSnapshotSection(
        'Our Services',
        'Everything you need for phones, laptops, and PCs from the Al Barsha branch on Hessa Street.',
        buildLinkGrid(
          serviceEntries.map((entry) => ({
            eyebrow: 'Service',
            title: entry.title,
            description: entry.heroDescription || entry.description,
            href: `/services/${entry.slug}`,
            cta: 'Open service',
          }))
        )
      ),
      buildSnapshotSection(
        'Latest Tech Updates',
        'Stay informed with current buying guides, repair advice, and market updates that connect directly to the retail and service pages.',
        buildLinkGrid(
          blogEntries.slice(0, 3).map((entry) => ({
            eyebrow: `${entry.category} • ${formatPublishedDate(entry.publishedAt)}`,
            title: entry.title,
            description: entry.excerpt,
            href: `/blog/${entry.slug}`,
            cta: 'Read article',
          }))
        )
      ),
      buildSnapshotSection(
        'Areas We Serve in Dubai',
        'Open your local page for Barsha 1-3, Dubai Science Park, JVC, JLT, Springs, Meadows Village, Barsha Heights, Tecom, Al Sufouh, and nearby communities.',
        buildLinkGrid(
          areaEntries.map((entry) => ({
            eyebrow: entry.badge,
            title: entry.title,
            description: `${entry.heroDescription} ${entry.travelNote}`,
            href: `/areas/${entry.slug}`,
            cta: 'Open area page',
          }))
        )
      ),
      buildSnapshotSection(
        'Need help with our services or products?',
        'Visit the store inside Hessa Union Coop Hypermarket or contact the team directly for pricing, repairs, model selection, and pickup support.',
        buildActionLinks([
          { href: 'tel:+971528026677', label: 'Call Us' },
          { href: 'https://wa.me/971528026677?text=Hi%2C%20I%27m%20interested%20in%20the%20services%20listed%20on%20your%20website.%20Can%20you%20tell%20me%20more%3F%20(via%20pzm.ae)', label: 'WhatsApp Us' },
          { href: '/services/brand-new', label: 'Browse Brand-New Devices' },
          { href: '/services/secondhand', label: 'Browse Used Devices' },
        ])
      ),
    ],
  })
}

function buildServicesIndexSnapshot(serviceEntries) {
  return buildPageShell({
    eyebrow: 'PZM Service Hub',
    title: 'Our Services',
    intro: 'Everything you need for phones, laptops, and PCs from the Al Barsha store on Hessa Street.',
    stats: [`${serviceEntries.length} public service pages`],
    sections: [
      buildSnapshotSection(
        'Available services',
        'Open the service page that matches the device, category, or request type you need right now.',
        buildLinkGrid(
          serviceEntries.map((entry) => ({
            eyebrow: 'Service',
            title: entry.title,
            description: entry.cardDescription || entry.heroDescription || entry.description,
            href: `/services/${entry.slug}`,
            cta: 'Open service',
          }))
        )
      ),
      buildSnapshotSection(
        'How to get started',
        'The storefront is designed to keep the path simple whether you want to buy, repair, sell, or compare before visiting the store.',
        buildStepsList([
          'Open the service page that matches the product or outcome you want.',
          'Review the overview, highlights, and contact options for that category.',
          'Use WhatsApp, phone, or the store visit route to continue with the team.',
        ])
      ),
    ],
  })
}

function buildServiceSnapshot(entry) {
  const overviewParagraphs = [
    `${entry.title} at PZM is designed to help customers move from browsing to a clear next step without unnecessary back-and-forth.`,
    `${entry.heroDescription || entry.description} The page explains what the service covers, what kinds of requests fit best, and how to contact the team in Dubai before you visit or confirm an order.`,
  ]

  const sections = [
    buildSnapshotSection(
      'What this service covers',
      entry.description,
      `${buildParagraphs(overviewParagraphs)}${entry.highlights?.length ? buildBulletList(entry.highlights) : ''}`
    ),
  ]

  if (entry.detailSections?.length) {
    for (const section of entry.detailSections) {
      sections.push(buildSnapshotSection(section.title, '', buildBulletList(section.items)))
    }
  } else {
    sections.push(
      buildSnapshotSection(
        'How to start',
        'Use the service page to send the model, issue, budget, or goal before the follow-up starts.',
        buildStepsList([
          `Review the ${entry.title.toLowerCase()} overview and compare it with other service pages if needed.`,
          'Message or call the store with the exact model, problem, or configuration you want.',
          'Confirm the next step, whether that is a quote, callback, store visit, or guided recommendation.',
        ])
      )
    )
  }

  sections.push(
    buildSnapshotSection(
      'Need help now?',
      'Use the links below to continue with the store team or compare nearby public pages.',
      buildActionLinks([
        { href: '/services', label: 'Back to services' },
        { href: 'tel:+971528026677', label: 'Call Us' },
        { href: 'https://wa.me/971528026677?text=Hi%2C%20I%27m%20interested%20in%20the%20services%20listed%20on%20your%20website.%20Can%20you%20tell%20me%20more%3F%20(via%20pzm.ae)', label: 'WhatsApp Us' },
      ])
    )
  )

  return buildPageShell({
    eyebrow: 'Service page',
    title: entry.heroTitle || entry.title,
    intro: entry.heroDescription || entry.description,
    stats: entry.highlights?.length ? [`${entry.highlights.length} service highlights`] : [],
    sections,
  })
}

function buildAreasIndexSnapshot(areaEntries) {
  return buildPageShell({
    eyebrow: 'Local coverage',
    title: 'Areas We Serve in Dubai',
    intro:
      'We are based in Al Barsha on Hessa Street and serve customers across Dubai, including Barsha 1-3, Dubai Science Park, JVC, JLT, Springs, Meadows Village, Barsha Heights, Tecom, and Al Sufouh.',
    stats: [`${areaEntries.length} area pages live`],
    sections: [
      buildSnapshotSection(
        'Browse Dubai areas',
        'Each area page connects nearby communities with service links, travel notes, and a cleaner route into the storefront.',
        buildLinkGrid(
          areaEntries.map((entry) => ({
            eyebrow: entry.badge,
            title: entry.title,
            description: `${entry.heroDescription} ${entry.travelNote}`,
            href: `/areas/${entry.slug}`,
            cta: 'Open area page',
          }))
        )
      ),
      buildSnapshotSection(
        'Need another area?',
        'If your neighborhood is not listed yet, the team still serves you from the Al Barsha branch.',
        buildActionLinks([
          { href: 'https://wa.me/971528026677?text=Hi%2C%20I%27m%20interested%20in%20the%20services%20listed%20on%20your%20website.%20Can%20you%20tell%20me%20more%3F%20(via%20pzm.ae)', label: 'WhatsApp Us' },
          { href: 'tel:+971528026677', label: 'Call +971 52 802 6677' },
          { href: '/services', label: 'Browse services' },
        ])
      ),
    ],
  })
}

function buildAreaSnapshot(entry) {
  return buildPageShell({
    eyebrow: entry.badge,
    title: entry.title,
    intro: `${entry.heroDescription} ${entry.travelNote} ${entry.localSummary}`,
    stats: [
      `${entry.nearbyCommunities.length} nearby communities`,
      `${entry.featuredServices.length} featured service links`,
    ],
    sections: [
      buildSnapshotSection(
        `Why customers from ${entry.name} use PZM`,
        entry.localSummary,
        buildBulletList(entry.advantages)
      ),
      buildSnapshotSection(
        'Nearby communities',
        entry.travelNote,
        buildChipList(entry.nearbyCommunities)
      ),
      buildSnapshotSection(
        `Popular services for ${entry.name}`,
        'Open the service page that best matches the next step you want to take.',
        buildLinkGrid(
          entry.featuredServices.map((service) => ({
            eyebrow: entry.name,
            title: service.label,
            description: service.description,
            href: service.to,
            cta: 'Open service',
          }))
        )
      ),
      buildSnapshotSection(
        'Need directions or quick help?',
        'Use the store, phone, or service links below before you travel.',
        buildActionLinks([
          { href: '/areas', label: 'Back to areas' },
          { href: '/services', label: 'Browse services' },
          { href: 'https://maps.app.goo.gl/e5Rhfo8YY3i8CatM7?g_st=ic', label: 'Get directions' },
          { href: 'https://wa.me/971528026677?text=Hi%2C%20I%27m%20interested%20in%20the%20services%20listed%20on%20your%20website.%20Can%20you%20tell%20me%20more%3F%20(via%20pzm.ae)', label: 'WhatsApp Us' },
        ])
      ),
    ],
  })
}

function getBuyIphoneSnapshotProducts(products) {
  return dedupeProducts(
    products.filter((product) => normalizeProductValue(product.model).includes('iphone'))
  ).sort(sortProducts)
}

function groupBuyIphoneSnapshotProducts(products) {
  const liveProducts = getBuyIphoneSnapshotProducts(products)

  return buyIphoneSnapshotFamilies.map((family) => ({
    family,
    products: liveProducts.filter((product) => family.matcher.test(normalizeProductValue(product.model))),
  }))
}

function buildBuyIphoneSnapshot(products) {
  const groups = groupBuyIphoneSnapshotProducts(products)
  const liveProducts = getBuyIphoneSnapshotProducts(products)
  const listedFamilies = groups.filter((group) => group.products.length > 0).length
  const lowestPrice = liveProducts.length > 0 ? Math.min(...liveProducts.map((product) => product.price)) : null

  return buildPageShell({
    eyebrow: 'Apple retail',
    title: 'Buy iPhone 17 Pro Max, Pro, Air & iPhone 17 in Dubai',
    intro:
      'Browse the current iPhone lineup listed on the site, compare families, and message the store for the exact storage and color you want.',
    stats: [
      `${liveProducts.length} iPhone models listed`,
      `${listedFamilies}/${buyIphoneSnapshotFamilies.length} families listed`,
      lowestPrice ? `From AED ${formatPrice(lowestPrice)}` : 'Request pricing',
    ],
    sections: [
      buildSnapshotSection(
        'Start with the iPhone family',
        'Use the family view first, then move into the currently listed models or contact the team for a missing configuration.',
        buildLinkGrid(
          groups.map((group) => ({
            eyebrow: group.products.length > 0 ? `${group.products.length} listed now` : 'Message us',
            title: group.family.title,
            description: group.family.description,
            href: group.products.length > 0 ? `/services/buy-iphone` : '/services/buy-iphone#buy-iphone-contact',
            cta: group.products.length > 0 ? 'Browse models' : 'Ask about this family',
          }))
        )
      ),
      buildSnapshotSection(
        'Current iPhone models on the site',
        'The latest listed iPhone models are grouped below so shoppers can compare variants before starting a WhatsApp order or store visit.',
        groups
          .map((group) => {
            if (group.products.length === 0) {
              return `
                <article style="margin-top:18px;border:1px solid #e2e8f0;border-radius:24px;background:#f8fafc;padding:20px;">
                  <h3 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(group.family.title)}</h3>
                  <p style="margin:10px 0 0;font-size:14px;line-height:1.75;color:#475569;">${escapeHtml(group.family.description)} This family is not listed right now, but the team can still confirm the closest available option.</p>
                </article>`
            }

            return `
              <article style="margin-top:18px;border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:20px;">
                <h3 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(group.family.title)}</h3>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.75;color:#475569;">${escapeHtml(group.family.description)}</p>
                <ul style="margin:16px 0 0;padding-left:20px;display:grid;gap:10px;font-size:15px;line-height:1.75;color:#334155;">
                  ${group.products
                    .slice(0, 6)
                    .map(
                      (product) => `<li><strong>${escapeHtml(product.model)}</strong> - ${escapeHtml(product.storage)} - ${escapeHtml(product.color)} - AED ${formatPrice(product.price)}</li>`
                    )
                    .join('')}
                </ul>
              </article>`
          })
          .join('')
      ),
      buildSnapshotSection(
        'How to order',
        'The iPhone route is designed to keep the buying flow simple even when inventory changes quickly.',
        buildStepsList([
          'Browse the current iPhone models listed on the site.',
          'Message the store for the exact model, storage, and color you want.',
          'Use the service hub or store visit links if you want to compare broader device categories first.',
        ])
      ),
    ],
  })
}

function extractCatalogSlice(source, startMarker, endMarker) {
  const startIndex = source.indexOf(startMarker)
  if (startIndex === -1) {
    return source
  }

  const endIndex = endMarker ? source.indexOf(endMarker, startIndex) : -1
  return source.slice(startIndex, endIndex === -1 ? source.length : endIndex)
}

function findBalancedEnd(source, startIndex, openChar, closeChar) {
  let depth = 0
  let quote = null

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index]
    const previousChar = source[index - 1]

    if (quote) {
      if (char === quote && previousChar !== '\\') {
        quote = null
      }
      continue
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char
      continue
    }

    if (char === openChar) {
      depth += 1
      continue
    }

    if (char === closeChar) {
      depth -= 1
      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

function extractFieldBlock(source, fieldName, openChar, closeChar) {
  const pattern = new RegExp(`${fieldName}:\\s*\\${openChar}`)
  const match = pattern.exec(source)

  if (!match) {
    return ''
  }

  const startIndex = source.indexOf(openChar, match.index)
  const endIndex = findBalancedEnd(source, startIndex, openChar, closeChar)

  if (startIndex === -1 || endIndex === -1) {
    return ''
  }

  return source.slice(startIndex + 1, endIndex)
}

function extractStringField(source, fieldName) {
  const pattern = new RegExp(`${fieldName}:\\s*'((?:\\\\'|[^'])+)'`)
  const match = pattern.exec(source)
  return match ? decodeSingleQuotedString(match[1]) : ''
}

function extractStringArrayField(source, fieldName) {
  const arrayContent = extractFieldBlock(source, fieldName, '[', ']')
  return Array.from(arrayContent.matchAll(/'((?:\\'|[^'])+)'/g), (match) => decodeSingleQuotedString(match[1]))
}

function extractObjectBlocks(arrayContent) {
  const blocks = []

  for (let index = 0; index < arrayContent.length; index += 1) {
    if (arrayContent[index] !== '{') {
      continue
    }

    const endIndex = findBalancedEnd(arrayContent, index, '{', '}')
    if (endIndex === -1) {
      break
    }

    blocks.push(arrayContent.slice(index + 1, endIndex))
    index = endIndex
  }

  return blocks
}

function extractDetailSections(source) {
  const arrayContent = extractFieldBlock(source, 'detailSections', '[', ']')
  if (!arrayContent) {
    return []
  }

  return extractObjectBlocks(arrayContent)
    .map((block) => ({
      title: extractStringField(block, 'title'),
      items: extractStringArrayField(block, 'items'),
    }))
    .filter((section) => section.title && section.items.length > 0)
}

function extractFeaturedServices(source) {
  const arrayContent = extractFieldBlock(source, 'featuredServices', '[', ']')
  if (!arrayContent) {
    return []
  }

  return extractObjectBlocks(arrayContent)
    .map((block) => ({
      label: extractStringField(block, 'label'),
      to: extractStringField(block, 'to'),
      description: extractStringField(block, 'description'),
    }))
    .filter((service) => service.label && service.to)
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

const HOME_ROUTE_TITLE = 'Buy iPhones, Laptops & Repair in Al Barsha, JVC & Tecom | PZM'
const HOME_ROUTE_DESCRIPTION =
  "PZM's Al Barsha store serves Barsha 1-3, Dubai Science Park, JVC, Meadows Village, JLT, Springs, Barsha Heights, Tecom, and Al Sufouh for phones, laptops, repairs, and device support."
const HOME_AREA_SERVED = [
  'Al Barsha, Dubai',
  'Barsha 1, Dubai',
  'Barsha 2, Dubai',
  'Barsha 3, Dubai',
  'Dubai Science Park, Dubai',
  'Jumeirah Village Circle (JVC), Dubai',
  'Meadows Village, Dubai',
  'Jumeirah Lakes Towers (JLT), Dubai',
  'Springs, Dubai',
  'Barsha Heights, Dubai',
  'Tecom, Dubai',
  'Al Sufouh, Dubai',
]
const AREAS_INDEX_DESCRIPTION =
  'Explore the Dubai communities served by PZM, including Barsha 1-3, Dubai Science Park, JVC, JLT, Springs, Meadows Village, Barsha Heights, Tecom, and Al Sufouh.'

function buildStoreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: 'PZM Computers & Phones Store',
    description: HOME_ROUTE_DESCRIPTION,
    url: `${SITE_URL}/`,
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hessa Street Branch, Inside Hessa Union Coop Hypermarket, Ground Floor',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    areaServed: HOME_AREA_SERVED.map((name) => ({ '@type': 'Place', name })),
    image: DEFAULT_IMAGE,
    priceRange: 'AED 150 - AED 7,000',
  }
}

function buildAreaJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: `PZM Computers & Phones Store - ${route.name}, Dubai`,
    description: route.description,
    url: `${SITE_URL}/areas/${route.slug}/`,
    telephone: '+971528026677',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hessa Street Branch, Inside Hessa Union Coop Hypermarket, Ground Floor',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.0848627,
      longitude: 55.1992671,
    },
    areaServed: route.areaServed.map((name) => ({ '@type': 'Place', name })),
    image: DEFAULT_IMAGE,
    priceRange: 'AED 150 - AED 7,000',
  }
}

function buildCollectionJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: toAbsoluteUrl(normalizeCanonicalPath(route.canonicalPath)),
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
    mainEntityOfPage: toAbsoluteUrl(normalizeCanonicalPath(route.canonicalPath)),
  }
}

async function readSourceFile(fileName) {
  return fs.readFile(path.join(contentRoot, fileName), 'utf8')
}

function extractServiceRoutes(serviceCatalogSource) {
  const scopedSource = extractCatalogSlice(serviceCatalogSource, 'export const serviceCatalog', 'const serviceAliases')
  const pattern = /^\s{2}(?:'([^']+)'|([a-z-]+)):\s*\{([\s\S]*?)^\s{2}\},?/gm
  const routes = []

  for (const match of scopedSource.matchAll(pattern)) {
    const block = match[3]
    const slug = extractStringField(block, 'slug')
    const title = extractStringField(block, 'title')
    const description = extractStringField(block, 'description')

    routes.push({
      slug,
      title,
      description,
      heroTitle: extractStringField(block, 'heroTitle'),
      heroDescription: extractStringField(block, 'heroDescription'),
      highlights: extractStringArrayField(block, 'highlights'),
      detailSections: extractDetailSections(block),
      cardDescription: extractStringField(block, 'cardDescription'),
    })
  }

  return routes
}

function extractAreaRoutes(areaCatalogSource) {
  const scopedSource = extractCatalogSlice(areaCatalogSource, 'export const areaCatalog', 'export const areaCatalogList')
  const pattern = /^\s{2}(?:'([^']+)'|([a-z-]+)):\s*\{([\s\S]*?)^\s{2}\},?/gm
  const routes = []

  for (const match of scopedSource.matchAll(pattern)) {
    const block = match[3]
    routes.push({
      slug: extractStringField(block, 'slug'),
      name: extractStringField(block, 'name'),
      badge: extractStringField(block, 'badge'),
      title: extractStringField(block, 'title'),
      metaTitle: extractStringField(block, 'metaTitle'),
      description: extractStringField(block, 'description'),
      heroDescription: extractStringField(block, 'heroDescription'),
      travelNote: extractStringField(block, 'travelNote'),
      localSummary: extractStringField(block, 'localSummary'),
      nearbyCommunities: extractStringArrayField(block, 'nearbyCommunities'),
      areaServed: extractStringArrayField(block, 'areaServed'),
      advantages: extractStringArrayField(block, 'advantages'),
      featuredServices: extractFeaturedServices(block),
    })
  }

  return routes
}

function extractBlogRoutes(blogCatalogSource) {
  const pattern = /^\s{2}\{\s*[\r\n\s]*title:\s*'((?:\\'|[^'])+)'[\s\S]*?slug:\s*'((?:\\'|[^'])+)'[\s\S]*?excerpt:\s*'((?:\\'|[^'])+)'[\s\S]*?seoDescription:\s*'((?:\\'|[^'])+)'[\s\S]*?category:\s*'((?:\\'|[^'])+)'[\s\S]*?imageUrl:\s*blogMedia\('((?:\\'|[^'])+)'\)[\s\S]*?publishedAt:\s*'((?:\\'|[^'])+)'[\s\S]*?bodyHtml:\s*`([\s\S]*?)`\s*,?\s*\}/gm
  const routes = []

  for (const match of blogCatalogSource.matchAll(pattern)) {
    routes.push({
      title: decodeSingleQuotedString(match[1]),
      slug: decodeSingleQuotedString(match[2]),
      excerpt: decodeSingleQuotedString(match[3]),
      description: decodeSingleQuotedString(match[4]),
      category: decodeSingleQuotedString(match[5]),
      imageFile: decodeSingleQuotedString(match[6]),
      publishedAt: decodeSingleQuotedString(match[7]),
      bodyHtml: match[8].trim(),
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
    lines.push(`    <lastmod>${route.lastmod || LASTMOD}</lastmod>`)
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
    title: HOME_ROUTE_TITLE,
    description: HOME_ROUTE_DESCRIPTION,
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
    description: AREAS_INDEX_DESCRIPTION,
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
      'Return and refund policy for PZM Computers & Phones Store in Dubai — eligibility, defective items, exchanges, and used devices.',
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
        imageUrl: '/api/media/generated/buy-iphone/iphone-17-pro-max-family.webp',
      },
      'brand-new': {
        title: 'Brand New Devices in Dubai | PZM Dubai',
        description: 'Browse brand-new devices in Dubai from PZM, including phones, laptops, consoles, and more.',
        imageUrl: '/api/media/legacy/Catigories/brand_new.jpg',
      },
      secondhand: {
        title: 'Buy Used iPhones, Laptops & Gaming PCs | PZM Dubai',
        description: 'Browse certified pre-owned devices in Dubai from PZM, including phones, laptops, tablets, and gaming hardware.',
        imageUrl: '/api/media/generated/services/secondhand/secondhand-service.webp',
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
    jsonLd: buildAreaJsonLd(entry),
  })),
  ...blogEntries.map((entry) => {
    const suffix = ' | PZM Blog'
    const maxTitleLen = 60 - suffix.length
    const trimmedTitle = entry.title.length > maxTitleLen ? entry.title.slice(0, maxTitleLen - 1) + '…' : entry.title
    return {
    path: `/blog/${entry.slug}`,
    title: `${trimmedTitle}${suffix}`,
    description: entry.description,
    canonicalPath: `/blog/${entry.slug}`,
    imageUrl: `/api/media/blog/${entry.imageFile}`,
    priority: blogPriorityMap[entry.slug] || '0.6',
    changefreq: 'monthly',
    ogType: 'article',
    articleTitle: entry.title,
    publishedAt: entry.publishedAt,
    rootHtml: buildBlogArticleSnapshot(entry),
    jsonLd: buildArticleJsonLd({
      title: `${entry.title} | PZM Blog`,
      articleTitle: entry.title,
      description: entry.description,
      canonicalPath: `/blog/${entry.slug}`,
      imageUrl: `/api/media/blog/${entry.imageFile}`,
      publishedAt: entry.publishedAt,
    }),
  }}),
]

const serviceEntryMap = new Map(serviceEntries.map((entry) => [entry.slug, entry]))
const areaEntryMap = new Map(areaEntries.map((entry) => [entry.slug, entry]))

for (const route of canonicalRoutes) {
  const normalizedCanonicalPath = normalizeCanonicalPath(route.canonicalPath || route.path)

  if (normalizedCanonicalPath === '/') {
    route.rootHtml = buildHomeSnapshot(serviceEntries, areaEntries, blogEntries)
    continue
  }

  if (normalizedCanonicalPath === '/services/') {
    route.rootHtml = buildServicesIndexSnapshot(serviceEntries)
    continue
  }

  if (normalizedCanonicalPath === '/areas/') {
    route.rootHtml = buildAreasIndexSnapshot(areaEntries)
    continue
  }

  if (normalizedCanonicalPath === '/terms/') {
    route.rootHtml = buildLegalSnapshot({
      eyebrow: 'Store policy',
      title: 'Terms & Conditions',
      intro: 'Read the terms and conditions for ordering, payment, delivery, warranty, and returns at PZM Computers & Phones Store in Dubai.',
      lastUpdated: 'March 24, 2026',
      sections: termsSnapshotSections,
    })
    continue
  }

  if (normalizedCanonicalPath === '/return-policy/') {
    route.rootHtml = buildLegalSnapshot({
      eyebrow: 'Store policy',
      title: 'Return & Refund Policy',
      intro: 'Read the return and refund policy for products purchased from the store in Al Barsha or delivered across the UAE.',
      lastUpdated: 'March 24, 2026',
      sections: returnPolicySnapshotSections,
    })
    continue
  }

  if (normalizedCanonicalPath.startsWith('/areas/')) {
    const areaSlug = normalizedCanonicalPath.replace('/areas/', '').replace(/\/$/, '')
    const areaEntry = areaEntryMap.get(areaSlug)

    if (areaEntry) {
      route.rootHtml = buildAreaSnapshot(areaEntry)
    }

    continue
  }

  if (normalizedCanonicalPath.startsWith('/services/')) {
    const serviceSlug = normalizedCanonicalPath.replace('/services/', '').replace(/\/$/, '')

    if (!['brand-new', 'secondhand', 'buy-iphone'].includes(serviceSlug)) {
      const serviceEntry = serviceEntryMap.get(serviceSlug)

      if (serviceEntry) {
        route.rootHtml = buildServiceSnapshot(serviceEntry)
      }
    }
  }
}

const blogIndexRootHtml = buildBlogIndexSnapshot(blogEntries)

for (const route of canonicalRoutes) {
  if (route.path === '/blog') {
    route.rootHtml = blogIndexRootHtml
  }
}

const canonicalRouteMap = new Map(canonicalRoutes.map((route) => [normalizeCanonicalPath(route.canonicalPath || route.path), route]))
const blogRoute = canonicalRouteMap.get('/blog/')
const secondhandRoute = canonicalRouteMap.get('/services/secondhand/')

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
    canonicalPath: '/services/secondhand/',
    robots: 'noindex, follow',
  },
  {
    ...secondhandRoute,
    path: '/services/buy-used.html',
    canonicalPath: '/services/secondhand/',
    robots: 'noindex, follow',
  },
]

const liveProducts = await fetchLiveProducts()
const productRoutes = buildProductRoutes(liveProducts)

if (productRoutes.length > 0) {
  canonicalRoutes.push(...productRoutes)
}

const buyIphoneSnapshotHtml = buildBuyIphoneSnapshot(liveProducts)

if (liveProducts.length > 0) {
  const brandNewSnapshotHtml = buildBrandNewSnapshot(liveProducts)
  const secondhandSnapshotHtml = buildSecondhandSnapshot(liveProducts)

  for (const route of [...canonicalRoutes, ...aliasRoutes]) {
    const normalizedCanonicalPath = normalizeCanonicalPath(route.canonicalPath || route.path)

    if (normalizedCanonicalPath === '/services/buy-iphone/') {
      route.rootHtml = buyIphoneSnapshotHtml
      route.preloadedProducts = liveProducts
    }

    if (normalizedCanonicalPath === '/services/brand-new/') {
      route.rootHtml = brandNewSnapshotHtml
      route.preloadedProducts = liveProducts
    }

    if (normalizedCanonicalPath === '/services/secondhand/') {
      route.rootHtml = secondhandSnapshotHtml
      route.preloadedProducts = liveProducts
    }
  }
} else {
  for (const route of [...canonicalRoutes, ...aliasRoutes]) {
    const normalizedCanonicalPath = normalizeCanonicalPath(route.canonicalPath || route.path)

    if (normalizedCanonicalPath === '/services/buy-iphone/') {
      route.rootHtml = buyIphoneSnapshotHtml
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
await fs.writeFile(path.join(distRoot, 'merchant-feed.xml'), buildMerchantFeed(liveProducts), 'utf8')
await fs.writeFile(path.join(distRoot, 'merchant-feed.txt'), buildMerchantTabFeed(liveProducts), 'utf8')
