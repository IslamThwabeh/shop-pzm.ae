import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
const widgetSelector = 'iframe[src*="elfsight"], iframe[src*="elfsightcdn"], iframe[src*="elfsight.com"]';

await page.goto('https://shop.pzm.ae/', { waitUntil: 'networkidle' });
await page.mouse.move(240, 220);
await page.locator('text=Customer Reviews').scrollIntoViewIfNeeded();
await page.waitForTimeout(6000);
const reviewFrames = await page.locator(widgetSelector).count();
await page.screenshot({ path: '.checkshots/home-reviews-live.png' });

await page.locator('text=Frequently Asked Questions').scrollIntoViewIfNeeded();
await page.waitForTimeout(6000);
const faqFrames = await page.locator(widgetSelector).count();
await page.screenshot({ path: '.checkshots/home-faq-live.png' });

console.log(JSON.stringify({ reviewFrames, faqFrames }));
await browser.close();
