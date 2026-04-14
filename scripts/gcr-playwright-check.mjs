import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const SITE_URL = 'https://pzm.ae'
const ARTIFACT_DIR = path.resolve('artifacts', 'gcr-playwright-check')

async function chooseProduct() {
  const response = await fetch(`${SITE_URL}/api/products`)

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const payload = await response.json()
  const products = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
  const selectedProduct = products.find((product) => product?.condition === 'new' && (product?.quantity ?? 0) > 0)

  if (!selectedProduct?.id) {
    throw new Error('Could not find an in-stock brand-new product for the GCR flow test')
  }

  return selectedProduct
}

async function launchBrowser() {
  const launchOptions = [
    { channel: 'msedge', headless: true },
    { channel: 'chrome', headless: true },
    { headless: true },
  ]

  for (const options of launchOptions) {
    try {
      return await chromium.launch(options)
    } catch {
      // Try the next browser configuration.
    }
  }

  throw new Error('Unable to launch a Playwright browser for the GCR flow test')
}

function timestamp() {
  return new Date().toISOString()
}

await fs.mkdir(ARTIFACT_DIR, { recursive: true })

const selectedProduct = await chooseProduct()
const browser = await launchBrowser()
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  ignoreHTTPSErrors: false,
})

await context.addInitScript(() => {
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage)

  window.localStorage.removeItem = (key) => {
    if (key === 'lastOrderDetails') {
      return
    }

    return originalRemoveItem(key)
  }
})

const page = await context.newPage()
const consoleMessages = []
const requestFailures = []
let googleScriptStatus = 'not-requested'

page.on('console', (message) => {
  consoleMessages.push({
    type: message.type(),
    text: message.text(),
    timestamp: timestamp(),
  })
})

page.on('requestfailed', (request) => {
  requestFailures.push({
    url: request.url(),
    failure: request.failure()?.errorText ?? 'unknown',
    timestamp: timestamp(),
  })
})

page.on('response', (response) => {
  if (response.url().includes('apis.google.com/js/platform.js')) {
    googleScriptStatus = `${response.status()} ${response.url()}`
  }
})

try {
  await page.goto(`${SITE_URL}/product/${selectedProduct.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Add to Cart' }).click()

  await page.goto(`${SITE_URL}/cart`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click()
  await page.waitForURL('**/checkout', { timeout: 30000 })

  await page.locator('input[name="customerName"]').fill('GCR Diagnostic Test')
  await page.locator('input[name="customerEmail"]').fill('gcr-diagnostic@example.com')
  await page.locator('input[name="customerPhone"]').fill('+971500000001')
  await page.locator('textarea[name="customerAddress"]').fill('Dubai, Al Barsha 1, automated GCR verification test')
  await page.locator('input[name="acceptTerms"]').check()

  await Promise.all([
    page.waitForURL('**/order/**', { timeout: 45000 }),
    page.getByRole('button', { name: 'Place Order (Cash on Delivery)' }).click(),
  ])

  const orderUrl = page.url()
  const debugUrl = orderUrl.includes('?') ? `${orderUrl}&gcr-debug=1` : `${orderUrl}?gcr-debug=1`
  await page.goto(debugUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(12000)

  const gcrStatus = await page.locator('text=Status:').first().textContent().catch(() => null)
  const visibleDialogText = await page.locator('body').innerText()
  const googlePromptHints = [
    'Would you like to receive a survey',
    'Google Customer Reviews',
    'survey',
  ].filter((hint) => visibleDialogText.includes(hint))
  const iframeSources = await page.locator('iframe').evaluateAll((elements) => elements.map((element) => element.getAttribute('src') || ''))
  const iframeDiagnostics = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('iframe'))
      .map((iframe) => {
        const src = iframe.getAttribute('src') || ''
        if (!src.includes('customerreviews/optin')) {
          return null
        }

        const rect = iframe.getBoundingClientRect()
        const style = window.getComputedStyle(iframe)
        const parent = iframe.parentElement
        const parentStyle = parent ? window.getComputedStyle(parent) : null

        return {
          src,
          rect: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            bottom: Math.round(rect.bottom),
            right: Math.round(rect.right),
          },
          style: {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            position: style.position,
            zIndex: style.zIndex,
          },
          parent: parent ? {
            tag: parent.tagName,
            className: parent.className,
            display: parentStyle?.display,
            visibility: parentStyle?.visibility,
            opacity: parentStyle?.opacity,
            position: parentStyle?.position,
            zIndex: parentStyle?.zIndex,
          } : null,
        }
      })
      .filter(Boolean)
  })

  const screenshotPath = path.join(ARTIFACT_DIR, 'order-confirmation-gcr-debug.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const result = {
    timestamp: timestamp(),
    product: {
      id: selectedProduct.id,
      model: selectedProduct.model,
      price: selectedProduct.price,
    },
    orderUrl,
    debugUrl,
    gcrStatus,
    googleScriptStatus,
    googlePromptHints,
    iframeSources,
    iframeDiagnostics,
    consoleMessages,
    requestFailures,
    screenshotPath,
  }

  const resultPath = path.join(ARTIFACT_DIR, 'result.json')
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2), 'utf8')

  console.log(JSON.stringify(result, null, 2))
} finally {
  await context.close()
  await browser.close()
}