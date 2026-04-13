const DEFAULT_BASE_URL = 'https://pzm.ae'

const baseUrl = new URL(process.argv[2] || process.env.PZM_SMOKE_BASE_URL || DEFAULT_BASE_URL)
baseUrl.pathname = ''
baseUrl.search = ''
baseUrl.hash = ''

const checks = [
  {
    path: '/',
    label: 'Homepage',
    expect: ['<title>', 'canonical', 'Choose your route'],
  },
  {
    path: '/services/brand-new/',
    label: 'Brand-new catalog',
    expect: ['Brand New Devices', 'canonical'],
  },
  {
    path: '/services/secondhand/',
    label: 'Secondhand catalog',
    expect: ['Pre-Owned Devices', 'canonical'],
  },
  {
    path: '/services/buy-iphone/',
    label: 'Buy iPhone',
    expect: ['Buy iPhone', 'canonical'],
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
]

function buildUrl(pathname) {
  return new URL(pathname, baseUrl).toString()
}

async function runCheck(check) {
  const response = await fetch(buildUrl(check.path), {
    headers: {
      'user-agent': 'pzm-deploy-smoke-test/1.0',
      accept: 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
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

  return `${check.label}: OK (${response.status})`
}

async function main() {
  console.log(`Running smoke checks against ${baseUrl.toString()}`)

  const results = []

  for (const check of checks) {
    const result = await runCheck(check)
    results.push(result)
  }

  for (const result of results) {
    console.log(result)
  }
}

main().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`)
  process.exitCode = 1
})