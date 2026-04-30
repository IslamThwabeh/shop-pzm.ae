# QA Prompt — GSC 404 Cleanup And Redirect Review (2026-04-30)

Use the prompt below with another AI agent for an independent QA and completeness review of the Google Search Console 404 cleanup implemented and deployed in this session.

```text
You are performing a full QA and completeness review of the Google Search Console 404 cleanup shipped to the `shop-pzm.ae` repository on 2026-04-30. Your goal is to:

1. Verify that the implemented fix fully addresses the reported 404 issues
2. Identify anything missed, risky, or likely to regress
3. Confirm whether any further technical or operational actions are still needed

Read every file mentioned before forming any opinion. Do not assume the implementation is correct just because smoke tests passed. Read it.

---

## Context

- Repo root: `C:\Users\islamt\shop-pzm.ae`
- Production site: `https://pzm.ae`
- Frontend: React + Vite + Tailwind, deployed to Cloudflare Pages from `frontend/`
- Backend: Cloudflare Worker API deployed from `backend/`
- Product detail pages remain intentional and live on `/product/:id` for current products
- Google Search Console issue bucket was `Not found (404)`

### Reported GSC Example URLs

- `https://pzm.ae/product/prod-mnnyld0a-ejxqds/`
- `https://pzm.ae/product/prod-mnttdfjh-cb8f5v/`
- `https://r2.pzm.ae/`

### Important nuance

- `prod-mnttdfjh-cb8f5v` appears to be a typo/variant observed in GSC. The confirmed deleted catalog ID in the repo is `prod-mntdtfjh-cb8f5v`.
- The implementation intentionally redirects both the confirmed deleted ID and the observed typo variant.

---

## Root Cause Summary

### Product URL 404s

Some product detail URLs indexed by Google pointed to products that had been deliberately deleted from the catalog. Those IDs were no longer valid live products, but Google still had them from prior crawl/feed exposure.

Confirmed deleted IDs were recorded in:
- `backend/catalog-refresh-2026-04-18.sql`

### R2 root 404 / unresolved host

The backend worker had an `r2.pzm.ae/*` route, but the hostname itself was not provisioned as a reachable public hostname. That meant the bare `https://r2.pzm.ae/` example could fail before even reaching the worker. The fix switched this from a route-only setup to a Worker custom domain so Cloudflare provisions DNS and certificates automatically.

---

## Intended Fix

### 1. Retired product redirects

A new source of truth maps known retired product IDs to replacement destinations:
- Brand-new deleted SKUs redirect to `/services/brand-new/`
- Deleted iPhone / Apple variant SKUs redirect to `/services/buy-iphone/`
- Deleted used-device SKUs redirect to `/services/secondhand/`
- Phantom `/product/services` redirects to `/services/`

### 2. Edge redirect behavior

The frontend prerender step now injects explicit 301 rules for retired product URLs into the generated Cloudflare Pages `_redirects` output before the existing `/product/* /product/:splat/index.html 200` SPA fallback.

### 3. Runtime redirect behavior

The React product page now uses the same retired-product mapping so known retired IDs client-redirect instead of rendering a generic missing-product state.

### 4. Preserve unknown misses

Unknown product IDs must still fall through to the existing not-found/noindex behavior so actual broken links remain visible and not silently masked.

### 5. R2 root redirect

The backend worker now redirects only the bare `https://r2.pzm.ae/` root to `https://pzm.ae/` with HTTP 301.

Important:
- `/robots.txt` on `r2.pzm.ae` should still serve the existing robots block
- Actual object/media paths should still work
- Search bots should still be blocked on that host per existing logic

### 6. Production validation coverage

The deploy smoke test was extended to verify:
- retired Samsung A06 redirect
- retired iPhone 16 White redirect
- phantom `/product/services` redirect
- bare `r2.pzm.ae` redirect
- homepage, catalog pages, robots, sitemap, merchant feed
- all merchant feed product URLs return HTTP 200
- a first/last sample of sitemap URLs return HTTP 200

---

## Files To Read

Read these files fully before answering:

- `backend/catalog-refresh-2026-04-18.sql`
- `backend/src/index.ts`
- `backend/wrangler.toml`
- `frontend/package.json`
- `frontend/public/_redirects`
- `frontend/scripts/prerender-seo-routes.mjs`
- `frontend/src/App.tsx`
- `frontend/src/pages/ProductDetails.tsx`
- `frontend/src/content/retiredProductRedirects.json`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/FeaturedProductsSection.tsx`
- `frontend/src/components/IphoneFamilyCard.tsx`
- `frontend/src/components/VariantCard.tsx`
- `scripts/deploy-smoke-tests.mjs`
- `products_2026-04-21_20-42-50.tsv`

If available, also inspect generated build output after a fresh frontend production build:

- `frontend/dist/_redirects`
- `frontend/dist/sitemap.xml`
- `frontend/dist/merchant-feed.xml`
- `frontend/dist/merchant-feed.txt`
- `frontend/dist/merchant-products.txt`

---

## Production State Already Verified In Session

These production checks already passed in the implementation session, but you must still assess whether they are sufficient:

- `https://pzm.ae/product/prod-mnnyld0a-ejxqds/` -> 301 -> `https://pzm.ae/services/brand-new/`
- `https://pzm.ae/product/prod-mntdtfjh-cb8f5v/` -> 301 -> `https://pzm.ae/services/buy-iphone/`
- `https://pzm.ae/product/services/` -> 301 -> `https://pzm.ae/services/`
- `https://r2.pzm.ae/` -> 301 -> `https://pzm.ae/`
- `npm run smoke:deploy` passed against production, including 148 merchant feed product URLs and 40 sampled sitemap URLs

Do not treat these passing checks as proof of completeness. Evaluate whether the checks are actually enough.

---

## QA Questions To Answer

1. Read `backend/catalog-refresh-2026-04-18.sql` and `frontend/src/content/retiredProductRedirects.json`. Confirm whether the retired-product map is consistent with the known deleted IDs.
   - Flag any deleted IDs missing from the redirect manifest.
   - Flag any redirect entries that do not appear to be justified by the deletion list or known GSC examples.

2. Review redirect target quality. For each redirect class, answer whether the chosen target is appropriate:
   - deleted no-color Samsung / generic brand-new SKU -> `/services/brand-new/`
   - deleted iPhone or Apple product page -> `/services/buy-iphone/`
   - deleted used device -> `/services/secondhand/`
   - phantom `/product/services` -> `/services/`
   If any target is too generic, risky, or likely to confuse users, say so.

3. Confirm the generated Pages redirect logic is safe.
   - Read `frontend/public/_redirects`
   - Read `frontend/scripts/prerender-seo-routes.mjs`
   - If available, inspect `frontend/dist/_redirects`
   Verify that explicit retired-product 301s are inserted before `/product/* /product/:splat/index.html 200`.
   If they are below that fallback, the fix is broken.

4. Read `frontend/src/pages/ProductDetails.tsx`. Verify the runtime behavior is correct:
   - known retired IDs should redirect using `<Navigate replace ...>`
   - unknown IDs should still render the generic missing-product page with `noindex`
   - live current products should still render normally

5. Read `frontend/src/App.tsx` and the product-card/linking components. Confirm the site still intentionally relies on `/product/:id` for current products and that this redirect work does not conflict with existing internal links.

6. Search for stale or accidental reintroduction sources.
   At minimum assess whether any current code or generated artifact can still emit:
   - `shop.pzm.ae`
   - `r2.pzm.ae/` as a page URL
   - deleted product IDs in sitemap/feed/canonical output
   Specifically inspect:
   - `frontend/scripts/prerender-seo-routes.mjs`
   - generated `frontend/dist/sitemap.xml`
   - generated `frontend/dist/merchant-feed.xml`
   - generated `frontend/dist/merchant-feed.txt`
   - generated `frontend/dist/merchant-products.txt`

7. Confirm the R2 fix is structurally correct.
   Read `backend/src/index.ts` and `backend/wrangler.toml`.
   Answer all of the following:
   - Does the root redirect only affect `/` on `r2.pzm.ae`?
   - Are `/robots.txt` and media object paths preserved?
   - Was switching `r2.pzm.ae/*` to `r2.pzm.ae` with `custom_domain = true` the correct Cloudflare configuration choice here?
   - Could this break any existing path-based assumptions or same-zone media access?

8. Evaluate whether the smoke test coverage is strong enough.
   Read `scripts/deploy-smoke-tests.mjs` and answer:
   - Are the new redirect checks sufficient?
   - Should it also check the typo variant `prod-mnttdfjh-cb8f5v` live?
   - Should it assert that sitemap/merchant feeds do not contain deleted IDs, not just that their URLs return 200?
   - Should it check `shop.pzm.ae` absence explicitly in merchant artifacts too?

9. Assess whether the implementation could hide real problems.
   For example:
   - Is the retired redirect map too broad?
   - Could future deleted products silently 404 again because the map is manual?
   - Should there be an operational checklist for updating `retiredProductRedirects.json` whenever products are deleted from the catalog?

10. Determine whether any post-deploy actions are still required outside the codebase.
   Consider:
   - Google Search Console `Validate Fix`
   - sitemap re-submission
   - monitoring for recrawl lag
   - whether the `Not found (404)` bucket may persist temporarily despite the fix

11. Give a final judgment:
   - Is the fix complete and production-safe?
   - Is any additional engineering work still needed?
   - Is any additional SEO ops follow-up still needed?

---

## Required Output Format

Return your answer in this order:

1. Findings
   - List concrete issues first, ordered by severity, with file references.
   - If there are no findings, explicitly say `No material findings.`

2. Residual Risks
   - Note anything that is probably acceptable but still worth monitoring.

3. Further Actions
   - State whether any additional engineering work is needed.
   - State whether any manual Search Console / SEO follow-up is still needed.

4. Final Verdict
   - One short paragraph: is everything fine, or not yet?

If you cannot verify a live production behavior from your environment, say exactly what you could not verify and why.
```