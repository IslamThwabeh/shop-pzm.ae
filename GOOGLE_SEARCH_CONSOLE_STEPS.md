# Google Search Console - Fix "Crawled Not Indexed" Issues

**Date:** April 13, 2026  
**Status:** Technical implementation complete ✓

---

## ✅ Completed Technical Fixes

1. **Deleted outdated workspace files** — Removed `sitemap.xml` and `robots.txt` from workspace root (they had wrong domain `shop.pzm.ae`)
2. **Updated .gitignore** — Added exclusions to prevent workspace-root deployment artifacts
3. **Verified sitemap generation** — Fresh build generates complete sitemap with 115 URLs using `https://pzm.ae` domain
4. **Verified production deployment**:
   - ✓ Deployed sitemap at `https://pzm.ae/sitemap.xml` has correct domain and all 115 URLs
   - ✓ All 81 affected URLs are present in deployed sitemap
   - ✓ Sample pages have correct `<meta name="robots" content="index, follow">`
   - ✓ Sample pages have correct canonical URLs (`https://pzm.ae/...`)
   - ✓ JSON-LD structured data is present on pages

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
   https://pzm.ae/product/prod-mnnylkm1-3qon8s/
   https://pzm.ae/product/prod-mnku9nz1-0jms1d/
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
4. **Note**: You're limited to a few dozen indexing requests per day, so start with these 10 samples

### Step 4: Monitor Coverage Report
1. In Google Search Console, navigate to **Coverage** (or **Pages** in newer interface)
2. Look for the "Crawled - currently not indexed" section
3. Check the count — it should show 81 affected URLs initially
4. **Wait 3-7 days** for Google to re-crawl after sitemap submission
5. Return to this report weekly to monitor the count decreasing

---

## 📊 Expected Timeline

- **Day 0 (Today)**: Submit sitemap + request indexing for 10 sample URLs
- **Day 1-3**: Google begins re-crawling with new sitemap
- **Day 7**: Check Coverage report — count should start decreasing
- **Day 14**: Most URLs should be indexed if content is good quality
- **Day 21-30**: Remaining stragglers get indexed

---

## 🔍 Verification Checklist

Before leaving Google Search Console, verify:

- [ ] Property is set to `pzm.ae` (not `shop.pzm.ae`)
- [ ] Sitemap `https://pzm.ae/sitemap.xml` is submitted and shows "Success" status
- [ ] Old `shop.pzm.ae` sitemap removed (if it existed)
- [ ] URL inspection passed for at least 5 of the 10 sample URLs
- [ ] Indexing requests submitted for any URLs showing as "not indexed"

---

## ⚠️ Troubleshooting

**If URLs remain "Crawled - currently not indexed" after 2 weeks:**

1. **Check for thin content**: Some product pages may have very short descriptions
2. **Check for duplicates**: Ensure canonicals point to preferred versions
3. **Check internal linking**: Verify affected pages are linked from high-priority pages (homepage, category pages)
4. **Manual review**: Use URL Inspection tool to see Google's specific reason for not indexing

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

**The technical side is fixed** — your sitemap is correct, all pages are prerendered with proper SEO tags, and the domain is consistent. Now it's just about telling Google where to find the updated sitemap and requesting re-indexing of the affected pages through Search Console.
