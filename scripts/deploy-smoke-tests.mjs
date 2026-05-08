const DEFAULT_BASE_URL = 'https://pzm.ae'
const DEFAULT_SITEMAP_SAMPLE_SIZE = 20
const DEFAULT_URL_CHECK_CONCURRENCY = 8
const REQUEST_HEADERS = {
  'user-agent': 'pzm-deploy-smoke-test/1.0',
}

const baseUrl = new URL(process.argv[2] || process.env.PZM_SMOKE_BASE_URL || DEFAULT_BASE_URL)
baseUrl.pathname = ''
baseUrl.search = ''
baseUrl.hash = ''

const sitemapSampleSize = parsePositiveInteger(process.env.PZM_SMOKE_SITEMAP_SAMPLE_SIZE, DEFAULT_SITEMAP_SAMPLE_SIZE)
const urlCheckConcurrency = parsePositiveInteger(process.env.PZM_SMOKE_URL_CONCURRENCY, DEFAULT_URL_CHECK_CONCURRENCY)

const checks = [
  {
    path: '/',
    label: 'Homepage',
    expect: ['<title>', 'canonical', 'Choose your route'],
  },
  {
    path: '/services/brand-new/',
    label: 'Brand-new catalog',
    expect: ['Brand New Devices', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/services/secondhand/',
    label: 'Secondhand catalog',
    expect: ['Pre-Owned Devices', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/services/buy-iphone/',
    label: 'Buy iPhone',
    expect: ['Buy iPhone', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/services/gaming-pc/',
    label: 'Gaming PC service',
    expect: ['Build your gaming PC with PZM', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/services/laptop-shop/',
    label: 'Laptop shop service',
    expect: ['Shop laptops in Dubai from our Al Barsha store', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/services/computer-shop/',
    label: 'Computer shop service',
    expect: ['Shop computers, desktops, and monitors in Dubai', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/areas/al-barsha/',
    label: 'Al Barsha area page',
    expect: ['Al Barsha', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/blog/gold-record-highs-tech-buyers-dubai-2026/',
    label: 'Featured blog article',
    expect: ['Gold Prices Hit Record Highs', 'canonical', 'BreadcrumbList'],
  },
  {
    path: '/robots.txt',
    label: 'Robots',
    expect: ['Sitemap:'],
  },
  {
    path: '/sitemap.xml',
    label: 'Sitemap',
    expect: ['<urlset', '<loc>https://pzm.ae/'],
  },
  {
    path: '/merchant-feed.xml',
    label: 'Merchant feed',
    expect: ['<rss', '<g:link>https://pzm.ae/product/'],
  },
]

function buildRedirectChecks() {
  const checks = [
    {
      url: buildUrl('/product/prod-mnnyld0a-ejxqds/'),
      label: 'Retired Samsung A06 redirect',
      location: buildUrl('/services/brand-new/'),
    },
    {
      url: buildUrl('/product/prod-mntdtfjh-cb8f5v/'),
      label: 'Retired iPhone 16 White redirect',
      location: buildUrl('/services/buy-iphone/'),
    },
    {
      url: buildUrl('/product/services/'),
      label: 'Phantom services redirect',
      location: buildUrl('/services/'),
    },
  ]

  if (baseUrl.hostname === 'pzm.ae' || baseUrl.hostname === 'www.pzm.ae') {
    checks.push({
      url: 'https://r2.pzm.ae/',
      label: 'R2 root redirect',
      location: buildUrl('/'),
    })
  }

  return checks
}

function buildUrl(pathname) {
  return new URL(pathname, baseUrl).toString()
}

function parsePositiveInteger(rawValue, fallbackValue) {
  const parsed = Number.parseInt(rawValue || '', 10)

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed
  }

  return fallbackValue
}

function decodeXmlEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function extractXmlValues(body, pattern, label) {
  const values = []

  for (const match of body.matchAll(pattern)) {
    const value = decodeXmlEntities(String(match[1] || '').trim())

    if (value) {
      values.push(value)
    }
  }

  const uniqueValues = Array.from(new Set(values))

  if (uniqueValues.length === 0) {
    throw new Error(`${label} did not contain any URLs`)
  }

  return uniqueValues
}

function selectSitemapSamples(urls) {
  if (urls.length <= sitemapSampleSize * 2) {
    return urls
  }

  return Array.from(new Set([...urls.slice(0, sitemapSampleSize), ...urls.slice(-sitemapSampleSize)]))
}

async function fetchResponse(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...REQUEST_HEADERS,
      ...options.headers,
    },
    redirect: 'follow',
  })
}

async function runRedirectCheck(check) {
  const response = await fetch(check.url, {
    headers: REQUEST_HEADERS,
    redirect: 'manual',
  })

  if (response.status !== 301) {
    throw new Error(`${check.label} returned ${response.status} instead of 301`)
  }

  const location = response.headers.get('location')
  if (!location) {
    throw new Error(`${check.label} did not include a Location header`)
  }

  const normalizedLocation = new URL(location, check.url).toString()
  if (normalizedLocation !== check.location) {
    throw new Error(`${check.label} redirected to ${normalizedLocation} instead of ${check.location}`)
  }

  return `${check.label}: OK (301 -> ${normalizedLocation})`
}

async function fetchUrlStatus(url) {
  let response = await fetchResponse(url, {
    method: 'HEAD',
    headers: {
      accept: '*/*',
    },
  })

  if (response.status === 405 || response.status === 501) {
    response = await fetchResponse(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8',
      },
    })
  }

  return response
}

async function runUrlStatusChecks({ label, urls, sourceCount = urls.length }) {
  const failures = []

  for (let index = 0; index < urls.length; index += urlCheckConcurrency) {
    const batch = urls.slice(index, index + urlCheckConcurrency)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const response = await fetchUrlStatus(url)

        if (!response.ok) {
          return `${url} -> ${response.status}`
        }

        return null
      })
    )

    failures.push(...batchResults.filter(Boolean))
  }

  if (failures.length > 0) {
    throw new Error(`${label} failed for ${failures.length}/${urls.length} URLs: ${failures.slice(0, 5).join(', ')}`)
  }

  const scope = sourceCount === urls.length ? `${urls.length} URLs` : `${urls.length} sampled of ${sourceCount} URLs`
  return `${label}: OK (${scope} returned 200)`
}

async function runCheck(check) {
  const response = await fetchResponse(buildUrl(check.path), {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`${check.label} returned ${response.status}`)
  }

  const body = await response.text()
  const missing = check.expect.filter((value) => !body.includes(value))

  if (missing.length > 0) {
    throw new Error(`${check.label} is missing expected content: ${missing.join(', ')}`)
  }

  if (check.path === '/sitemap.xml' && body.includes('shop.pzm.ae')) {
    throw new Error('Sitemap still contains shop.pzm.ae')
  }

  return {
    check,
    body,
    status: response.status,
  }
}

async function main() {
  console.log(`Running smoke checks against ${baseUrl.toString()}`)

  const results = []
  const checkResults = new Map()
  const redirectChecks = buildRedirectChecks()

  for (const check of redirectChecks) {
    results.push(await runRedirectCheck(check))
  }

  for (const check of checks) {
    const result = await runCheck(check)
    checkResults.set(check.path, result)
    results.push(`${check.label}: OK (${result.status})`)
  }

  const merchantFeedBody = checkResults.get('/merchant-feed.xml')?.body
  const merchantLinks = extractXmlValues(merchantFeedBody, /<g:link>([\s\S]*?)<\/g:link>/g, 'Merchant feed')
  results.push(await runUrlStatusChecks({ label: 'Merchant feed URLs', urls: merchantLinks }))

  const sitemapBody = checkResults.get('/sitemap.xml')?.body
  const sitemapUrls = extractXmlValues(sitemapBody, /<loc>([\s\S]*?)<\/loc>/g, 'Sitemap')
  const sitemapSamples = selectSitemapSamples(sitemapUrls)
  results.push(
    await runUrlStatusChecks({
      label: 'Sitemap URL samples',
      urls: sitemapSamples,
      sourceCount: sitemapUrls.length,
    })
  )

  for (const result of results) {
    console.log(result)
  }
}

main().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`)
  process.exitCode = 1
})