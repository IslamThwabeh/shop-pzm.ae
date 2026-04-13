# Google Search Console - Fix "Crawled Not Indexed" Issues

**Date:** April 13, 2026  
**Status:** Technical implementation complete ✓

---

## ✅ Completed Technical Fixes

1. **Deleted outdated workspace files** — Removed `sitemap.xml` and `robots.txt` from workspace root (they had wrong domain `shop.pzm.ae`)
2. **Updated .gitignore** — Added exclusions to prevent workspace-root deployment artifacts
3. **Added crawlable product-detail links** — Catalog cards now expose crawlable `/product/:id` links so Google can reach product pages from the retail flows
4. **Added homepage device finder + URL-synced catalog filters** — Users can start from the homepage and land on pre-filtered catalog states
5. **Applied strict indexing policy for product pages**:
   - Only in-stock products with description length >= 90 characters are included in the sitemap
   - Low-quality product pages remain reachable for users but now serve `noindex, follow`
6. **Verified production deployment**:
   - ✓ Deployed sitemap at `https://pzm.ae/sitemap.xml` uses the correct `https://pzm.ae` domain only
   - ✓ Current sitemap contains **55 total URLs**, including **24 product URLs** that meet the quality threshold
   - ✓ Low-quality product pages are excluded from the sitemap and should not be manually requested for indexing

---

## 📋 Required Google Search Console Steps

**You need to complete these steps manually in your Google Search Console account:**

### Step 1: Verify GSC Property Configuration
1. Go to [Google Search Console](https://search.google.com/search-console)
2. **Verify** you're using the property for `pzm.ae` (NOT `shop.pzm.ae`)
   - If you have a property for `shop.pzm.ae`, you may need to migrate or create a new property for `pzm.ae`
   - Domain properties should show `pzm.ae` in the property switcher

### Step 2: Submit the Correct Sitemap
1. In Google Search Console, select your `pzm.ae` property
2. Navigate to **Sitemaps** (left sidebar)
3. **Submit the sitemap**: Enter `https://pzm.ae/sitemap.xml` and click Submit
4. **Remove old sitemaps** (if present):
   - Look for any entries like `https://shop.pzm.ae/sitemap.xml`
   - Click the three-dot menu → "Remove sitemap"

### Step 3: Request Indexing for Sample URLs
1. In Google Search Console, navigate to **URL Inspection** (top search bar or left sidebar)
2. Test these 10 sample URLs (copy/paste one at a time):
   ```
   https://pzm.ae/areas/al-barsha/
   https://pzm.ae/areas/dubai-marina/
   https://pzm.ae/blog/essential-pc-maintenance-tips/
   https://pzm.ae/blog/gold-record-highs-tech-buyers-dubai-2026/
   https://pzm.ae/services/repair/
   https://pzm.ae/services/brand-new/
   https://pzm.ae/product/prod-mntdu0pp-uvtxu6/
   https://pzm.ae/product/prod-mntdtz27-kybe2d/
   https://pzm.ae/terms/
   https://pzm.ae/return-policy/
   ```
3. For each URL:
   - Wait for inspection to complete
   - If it shows "URL is on Google" - great!
   - If it shows "URL is not on Google" or "Crawled - currently not indexed":
     - Click **"Request Indexing"**
     - Confirm the request
     - Wait ~30 seconds, then test the next URL
4. **Important**: Only request indexing for URLs that are in the sitemap or are intentionally meant to index. Do **not** request indexing for low-quality product pages that are now excluded from the sitemap.
5. **Note**: You're limited to a few dozen indexing requests per day, so start with these 10 samples

### Step 4: Monitor Coverage Report
1. In Google Search Console, navigate to **Coverage** (or **Pages** in newer interface)
2. Look for the "Crawled - currently not indexed" and "Excluded by 'noindex' tag" sections
3. Expect some previously submitted thin product pages to move out of the crawl queue and into the correct excluded/noindex bucket over time
4. **Wait 3-7 days** for Google to re-crawl after sitemap submission
5. Return to this report weekly to monitor the indexed quality URLs stabilizing and the noisy low-quality set dropping out

---

## 📊 Expected Timeline

- **Day 0 (Today)**: Submit sitemap + request indexing for the sample quality URLs
- **Day 1-3**: Google begins re-crawling with the new stricter sitemap
- **Day 7**: Check Coverage report — low-value product URLs should start moving out of the active crawl queue
- **Day 14**: Quality product URLs and core service/blog/area pages should stabilize
- **Day 21-30**: Remaining low-quality URLs should settle into excluded/noindex buckets unless content is improved later

---

## 🔍 Verification Checklist

Before leaving Google Search Console, verify:

- [ ] Property is set to `pzm.ae` (not `shop.pzm.ae`)
- [ ] Sitemap `https://pzm.ae/sitemap.xml` is submitted and shows "Success" status
- [ ] Old `shop.pzm.ae` sitemap removed (if it existed)
- [ ] URL inspection passed for at least 5 of the 10 sample URLs
- [ ] Indexing requests submitted only for core pages and quality product pages

---

## ⚠️ Troubleshooting

**If URLs remain "Crawled - currently not indexed" after 2 weeks:**

1. **Check whether the URL is intentionally excluded**: If the product is not in the sitemap and now serves `noindex, follow`, that is expected behavior
2. **Check for duplicates**: Ensure canonicals point to preferred versions
3. **Check internal linking**: Verify affected pages are linked from high-priority pages (homepage, category pages)
4. **Manual review**: Use URL Inspection tool to see Google's specific reason for not indexing
5. **Content upgrade path**: If you want a currently excluded product to index, improve its description first, then re-include it in a later sitemap pass

**If you see "Submitted URL not found (404)":**
- This shouldn't happen for the 81 URLs we verified, but if it does:
- Check that the URL exists at `https://pzm.ae/...`
- Verify it's not a typo in the sitemap
- Report the specific URL if verification shows it exists but Google sees 404

---

## 📞 Questions?

If you encounter issues during these steps or need clarification, let me know!

---

## Summary

**The technical side is fixed** — your sitemap, product indexing policy, internal links, and domain configuration are now aligned. The remaining work in Search Console is to submit the stricter sitemap, request indexing only for quality URLs, and let Google re-crawl the low-value product pages into the proper excluded buckets.
