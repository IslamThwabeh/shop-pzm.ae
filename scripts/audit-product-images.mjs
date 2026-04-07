#!/usr/bin/env node
/**
 * Audit product images — fetches the product list from the live API
 * and HEAD-checks every image URL, reporting broken / missing ones.
 *
 * Usage:
 *   node scripts/audit-product-images.mjs
 *   node scripts/audit-product-images.mjs https://shop.pzm.ae
 */

const BASE = process.argv[2] || 'https://shop.pzm.ae'
const API = `${BASE}/api/products`

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { url, status: res.status, ok: res.ok }
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message }
  }
}

async function main() {
  console.log(`Fetching products from ${API} …`)
  const res = await fetch(API)
  if (!res.ok) {
    console.error(`API returned ${res.status}`)
    process.exit(1)
  }

  const products = await res.json()
  console.log(`Got ${products.length} products\n`)

  const checks = []

  for (const p of products) {
    const urls = [...(p.images || []), p.image_url].filter(Boolean)
    if (urls.length === 0) {
      checks.push({ product: p, url: null, status: 'missing', note: 'No image URL at all' })
      continue
    }
    for (const raw of urls) {
      const url = raw.startsWith('http') ? raw : `${BASE}${raw.startsWith('/') ? '' : '/'}${raw}`
      checks.push({ product: p, url, status: 'pending' })
    }
  }

  const pending = checks.filter((c) => c.status === 'pending')
  console.log(`Checking ${pending.length} image URLs (concurrency 20) …\n`)

  // Process in batches of 20
  for (let i = 0; i < pending.length; i += 20) {
    const batch = pending.slice(i, i + 20)
    const results = await Promise.all(batch.map((c) => head(c.url)))
    for (let j = 0; j < batch.length; j++) {
      batch[j].result = results[j]
      batch[j].status = results[j].ok ? 'ok' : 'broken'
    }
  }

  const broken = checks.filter((c) => c.status !== 'ok')

  if (broken.length === 0) {
    console.log('All images OK.')
    return
  }

  console.log(`Found ${broken.length} issue(s):\n`)
  for (const c of broken) {
    const id = c.product.id
    const model = `${c.product.model} ${c.product.storage} ${c.product.color}`.trim()
    if (c.status === 'missing') {
      console.log(`  [MISSING]  id=${id}  ${model}`)
    } else {
      console.log(`  [${c.result?.status || '???'}]  id=${id}  ${model}  →  ${c.url}`)
    }
  }

  process.exit(broken.length > 0 ? 1 : 0)
}

main()
