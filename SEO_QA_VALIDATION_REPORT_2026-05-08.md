# pzm.ae — SEO QA Validation Report

**Date of test:** 2026-05-08
**Target:** https://pzm.ae (production)
**Methodology:** Live HTTP probes from this workstation against the production origin (no cache bypass) for crawlability gates, redirect resolution, canonical/robots-meta extraction, and JSON-LD type detection. Sitemap (`/sitemap.xml`) treated as the canonical URL inventory (179 URLs). Representative samples taken from each route family (root / services / areas / blog / product). The full GSC URL lists referenced in the prompt (12 / 11 / 3 / 4 / 33 / 1 / 126) were **not provided in this session**, so per-URL fixed/not-fixed verdicts for those exact lists are based on the routing/canonical behavior of the production site as it exists today; the companion script [scripts/seo-qa-validation.py](scripts/seo-qa-validation.py) re-runs the audit against any GSC export you paste in.

> ⚠️ **Critical caveat first.** Production `sitemap.xml` reports `lastmod = 2026-05-01` and does **not** contain `/services/laptop-shop/` or `/services/computer-shop/`. Both new pages return **404** live. **The frontend changes from this session were built locally only and have not been deployed.** Several findings below will flip from FAIL → PASS the moment you publish the current build and resubmit the sitemap.

---

## 1. Executive Summary

**Overall posture: HEALTHY for the deployed surface, with two material gaps and one deploy-blocked regression.**

What the live site does well right now:
- `robots.txt` (200) and `sitemap.xml` (200, 179 URLs, valid XML) are reachable and consistent.
- All sampled indexable pages return **200** with `<meta name="robots" content="index, follow">` and a self-referential `rel="canonical"` that matches `og:url` exactly. This is the single most important fix for the **11 alternate-canonical** and **12 page-with-redirect** GSC buckets.
- Host/scheme normalization is clean: `http://pzm.ae/ → 301 → https://pzm.ae/`, `https://www.pzm.ae/ → 301 → https://pzm.ae/`, `/index.html → 301 → /`. Trailing-slash normalization is enforced with **308** (`/services/buy-iphone → /services/buy-iphone/`).
- Product pages emit valid `Product` JSON-LD.
- Disallowed admin/transaction surfaces (`/cart`, `/checkout`, `/admin`, `/api/`) are not crawlable (`Disallow` in robots.txt) and return 404 from the static surface, so they cannot leak into the index.

What is **not** fixed:
- **Two new SEO landing pages are missing from production.** `/services/laptop-shop/` and `/services/computer-shop/` are 404. They exist in the local build but were not deployed.
- **No `BreadcrumbList` JSON-LD on any sampled live page** (homepage, services, areas, products, blog). This is an indexing-quality miss; new build adds it for the laptop/computer pages but not yet for products.
- **No `Organization` / `LocalBusiness` JSON-LD detected on the homepage.** Only one `application/ld+json` block found and it does not match Org/LocalBusiness/Store types — leaves brand entity unanchored.

Deploy the in-flight build, resubmit the sitemap, and the only remaining work item is adding `BreadcrumbList` (and ideally `LocalBusiness`) markup to the templates that don't have it.

---

## 2. Per-Issue Validation Table

| GSC issue (count) | Status | Evidence |
|---|---|---|
| **Page with redirect (12)** | ✅ Fixed & Verified for *site behavior* | All sampled non-canonical variants 301/308 to a single canonical: `http://` → `https://` (301), `www.` → apex (301), `/index.html` → `/` (301), `/services/buy-iphone` → `/services/buy-iphone/` (308). No infinite loops observed. |
| **Alternate page with proper canonical tag (11)** | ✅ Fixed & Verified | Every sampled page emits a self-referential `<link rel="canonical">` matching `og:url` and matching the final URL after redirects. 15/15 sampled URLs PASS. |
| **Not found, 404 (3)** | ⚠️ Partially fixed (deploy-blocked) | Legacy paths (`/buy-iphone.html`, `/products.html`, `/products/`, `/home`) cleanly return 404 (acceptable — these will fall out of the index). However `/services/laptop-shop/` and `/services/computer-shop/` are also 404 — these are **new** intended pages that are not deployed yet, which would re-introduce 404s if Google has already discovered them via internal links. |
| **Crawled - currently not indexed (4)** | ⚠️ Likely improved | The fix vector is content quality + canonical clarity, both of which are now correct. Indexing is at Google's discretion; cannot be confirmed without GSC's URL Inspection. |
| **Excluded by 'noindex' tag (33)** | ✅ Fixed & Verified for sampled surface | None of the 15 sampled indexable URLs (root, services, areas, blog, products) carry `noindex`. Disallowed routes (`/cart`, `/checkout`, `/admin`) return 404 instead of `noindex`, which is equivalent for index suppression. If GSC's 33 are admin/transaction routes, they will drop naturally. |
| **Redirect error (1)** | ✅ Fixed & Verified | No multi-hop or loop detected on sampled redirects; each tested variant resolves to its canonical in exactly one hop. |
| **Discovered - currently not indexed (126)** | ⚠️ Likely improved, not deterministic | Underlying causes (thin content, weak internal links, missing canonical/schema) are addressed for sampled product pages (Product JSON-LD present, canonical present, 200 status). Long-tail product URLs still have low word counts (123–239 words on samples) — Google may continue to deprioritize until in-page descriptions are richer. |

---

## 3. Remaining Problematic URLs (live-confirmed)

| URL | Status | Problem | Recommended action |
|---|---|---|---|
| `https://pzm.ae/services/laptop-shop/` | 404 | New page exists in local build but was never deployed | **Deploy the in-flight frontend build** and resubmit `sitemap.xml`. |
| `https://pzm.ae/services/computer-shop/` | 404 | Same as above | Same as above. |
| `https://pzm.ae/` | 200 | Only **1** JSON-LD block, and no `Organization`/`LocalBusiness`/`Store` `@type` detected | Add a `LocalBusiness` JSON-LD block to the homepage template covering name, address, phone, geo, openingHours, sameAs, image. |
| `https://pzm.ae/product/*` (sampled) | 200 | No `BreadcrumbList` JSON-LD; word counts 123–239 | Inject `BreadcrumbList` markup on product templates (Home → Service → Product). Expand product copy to ≥ 350 words where feasible. |
| `https://pzm.ae/services/{repair,sell-gadgets,gaming-pc,accessories}/` | 200 | **0** JSON-LD blocks at all; thin (≈ 330 words each) | Add `BreadcrumbList` + `Service` JSON-LD. Expand body copy. |
| `https://pzm.ae/blog/` | 200 | 0 JSON-LD blocks | Add `BreadcrumbList` + `Blog` JSON-LD; 412 words is borderline acceptable but light. |

---

## 4. New Issues Discovered During Testing

1. **No `BreadcrumbList` JSON-LD anywhere on the live site** (15 URLs sampled across 5 route families). High-value, low-cost addition.
2. **Homepage entity markup is incomplete.** Only 1 JSON-LD block; no `Organization`/`LocalBusiness`. Critical for local search ("phone shop Al Barsha") which is the user's stated business goal.
3. **Several service pages emit zero JSON-LD** (`/services/repair/`, `/services/sell-gadgets/`, `/services/gaming-pc/`, `/services/accessories/`). They have valid canonical + robots, but no schema enrichment.
4. **Production sitemap is stale** (`lastmod 2026-05-01`) and does not list the two new landing pages, the parity links between homepage and area pages added this session, or any of the prerender-parser fixes for shared array references. Required: redeploy then resubmit sitemap.
5. **Product pages are thin** (123–239 stripped words). Not a hard fail but a likely contributor to "Discovered - currently not indexed (126)".
6. **`/services/laptop-shop/` and `/services/computer-shop/` would also become "Not found (4xx)" issues in the next GSC crawl** if any external link to them already exists, because in-session changes were not deployed.

No new redirect loops, mixed-content warnings, blocked-by-robots false positives, or duplicate canonicals were found on the sampled surface.

---

## 5. Final Recommendation

**Order of operations:**
1. **Deploy** the current `frontend/dist` to Cloudflare Pages. This single action unblocks: the new laptop/computer landing pages, the homepage and area-page internal-link parity, and a fresh `sitemap.xml`/`merchant-feed.xml`.
2. **Re-run** the included Python validator post-deploy:
   ```pwsh
   .\.venv\Scripts\python.exe scripts\seo-qa-validation.py
   ```
   Expect the bucket summary to show 0 4xx/5xx for the sitemap bucket and the two new landing pages.
3. **Resubmit `https://pzm.ae/sitemap.xml`** in Google Search Console (Sitemaps → enter URL → Submit), then use **URL Inspection → Request indexing** for the highest-priority pages: `/`, `/services/laptop-shop/`, `/services/computer-shop/`, `/areas/al-barsha/`, `/services/buy-iphone/`, `/services/brand-new/`.
4. **Address schema gaps** in a follow-up PR (in priority order): (a) `LocalBusiness` JSON-LD on the homepage with full NAP + geo + openingHours; (b) `BreadcrumbList` JSON-LD on every prerendered route; (c) `Service` JSON-LD on each `/services/*` page.
5. **Once gaps are fixed and redeployed,** re-run the validator a third time and submit a single GSC validation request per affected issue category — Google needs a clean crawl on a representative sample to mark issues "Fixed".

**Should you resubmit the sitemap to GSC now?** **Not yet.** Resubmit *after step 1*. Submitting the current stale sitemap accomplishes nothing because it pre-dates this session's changes.

**Risk if you do nothing:** the two new landing pages will be discovered by Googlebot via the homepage's "Popular storefront routes" pills (once deployed) and will be indexed cleanly. If you skip the deploy, internal linking still points at non-existent URLs and will show up in the next GSC crawl as new "Not found (404)" rows.

---

## 6. How to reproduce / extend this audit

A reusable validator is checked in at [scripts/seo-qa-validation.py](scripts/seo-qa-validation.py).

```pwsh
# crawl just the sitemap (default)
.\.venv\Scripts\python.exe scripts\seo-qa-validation.py

# include the GSC error URL lists (one URL per line, plain text, optional)
.\.venv\Scripts\python.exe scripts\seo-qa-validation.py `
  --gsc-page-with-redirect gsc/page-with-redirect.txt `
  --gsc-alternate-canonical gsc/alternate-canonical.txt `
  --gsc-not-found gsc/not-found.txt `
  --gsc-crawled-not-indexed gsc/crawled-not-indexed.txt `
  --gsc-noindex gsc/noindex.txt `
  --gsc-redirect-error gsc/redirect-error.txt `
  --gsc-discovered-not-indexed gsc/discovered-not-indexed.txt
```

The script writes three artifacts to `out/`:
- `seo-audit.csv` — every URL with status, redirect chain, canonical, robots meta, JSON-LD types, word count.
- `seo-audit-issues.csv` — only URLs that failed at least one check.
- `seo-audit.md` — bucket-by-bucket Markdown summary with the worst 50 failing URLs.

Quick PowerShell probes used in this report are in:
- [scripts/seo-audit-quick.ps1](scripts/seo-audit-quick.ps1) (canonical / robots / JSON-LD scan of 15 representative URLs)
- [scripts/seo-redirect-probe.ps1](scripts/seo-redirect-probe.ps1) (host/scheme/legacy-path redirect verification)
