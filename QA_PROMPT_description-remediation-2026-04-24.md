# QA Prompt For Catalog Description Remediation

Use the prompt below with another AI agent for an independent QA pass on the work already completed in this repository and in the live catalog.

```text
You are performing a full QA and risk review of a production catalog data-quality remediation and the related SEO/prerender hardening work in the `shop-pzm.ae` repository.

Your goal is to verify whether the implemented fixes fully address the real issue, identify anything missed, detect regressions or weak assumptions, and recommend any extra steps that could produce a better result before the pending frontend deployment.

Context

- Repo root: `C:\Users\islamt\shop-pzm.ae`
- Production site: `https://pzm.ae`
- Production product API: `https://pzm.ae/api/products`
- Latest snapshot TSV used as the remediation source: `products_2026-04-21_20-42-50.tsv`
- Current status: all automated batchable description backfills are complete, but the frontend has NOT been redeployed yet.

Problem Statement

The original production issue was not only deployment-related. The deeper problem was live catalog data quality:

1. Production D1 had real products, but almost no usable descriptions.
2. Only 3 products originally met the quality threshold for sitemap inclusion on their own.
3. The frontend prerender was compensating for poor live data by enriching from a snapshot at build time rather than fixing the source of truth in D1.
4. This caused weak SEO coverage and risked unstable sitemap/product schema quality.

There was also an infrastructure masking problem earlier in the same workstream:

1. The backend previously swallowed D1 binding/runtime failures and returned empty arrays or nulls.
2. This made the live API look healthy while actually hiding a production failure.

What Was Implemented

Backend hardening

- File: `backend/src/db.ts`
- Changes:
  - Throw if `PRAGMA table_info(products)` returns zero columns, instead of silently continuing.
  - Re-throw product read errors in `getProducts()` and `getProduct()` instead of returning `[]` or `null`.
- Intent:
  - Stop masking D1 binding/schema failures.
  - Ensure production incidents fail loudly instead of degrading into empty catalog output.

Frontend SEO/schema/prerender fixes

- File: `frontend/src/pages/BuyIphonePage.tsx`
  - JSON-LD offer availability now reflects `quantity > 0` instead of always being `InStock`.

- File: `frontend/src/pages/ProductDetails.tsx`
  - Product JSON-LD always emits a usable `image` via category-aware fallback.
  - `<Seo />` image fallback now follows the same logic.

- File: `frontend/scripts/prerender-seo-routes.mjs`
  - Added shared merchant return/shipping constants with `DAY` unit codes.
  - Added category-aware fallback images for products missing images.
  - Added local repo-root TSV snapshot loading.
  - Added live-vs-snapshot enrichment logic keyed by product ID.
  - Added quality counting helpers and quality-threshold evaluation.
  - If live feed is empty or fails, the prerender can fall back to the latest snapshot.
  - If live feed exists but descriptions/metadata are weak, the prerender can enrich from snapshot data.
- Intent:
  - Preserve SEO artifact quality while live data quality is being fixed.
  - Keep schema output consistent and valid.

Description remediation tooling

- File: `scripts/generate-live-description-backfill-manifest.mjs`
  - New generator added.
  - Compares live API products to the latest repo-root snapshot TSV.
  - Emits description-only manifests in the same sync shape used by the existing product sync tool.
  - Supports filtering by `--condition`, `--brand`, `--model-query`, `--ids`, `--offset`, `--limit`, and `--label`.
  - Produces markdown reports showing eligible rows, skipped buckets, ambiguous rows, missing snapshot rows, and below-threshold snapshot rows.

- File: `package.json`
  - Added `npm run catalog:description-backfill`.

- File: `scripts/README.md`
  - Added operator documentation for the live description backfill flow.

Sync tooling fix

- File: `scripts/sync-products-to-shop.mjs`
- Change:
  - Default `PZM_SITE_URL` changed from `https://shop.pzm.ae` to `https://pzm.ae`.
- Reason:
  - The old default host caused a `401 Unauthorized` during the first sync attempt even though the manifest and auth flow were otherwise correct.

Batch execution that was already applied live

Review these generated artifacts:

- `scripts/product-sync.description-backfill.batch-01-samsung-2026-04-24.json`
- `scripts/description-backfill-report.batch-01-samsung-2026-04-24.md`
- `scripts/product-sync.description-backfill.batch-02-iphone-17-pro-2026-04-24.json`
- `scripts/description-backfill-report.batch-02-iphone-17-pro-2026-04-24.md`
- `scripts/product-sync.description-backfill.batch-03-used-apple-2026-04-24.json`
- `scripts/description-backfill-report.batch-03-used-apple-2026-04-24.md`
- `scripts/product-sync.description-backfill.batch-04-used-windows-2026-04-24.json`
- `scripts/description-backfill-report.batch-04-used-windows-2026-04-24.md`
- `scripts/product-sync.description-backfill.batch-05-used-lenovo-microsoft-2026-04-24.json`
- `scripts/description-backfill-report.batch-05-used-lenovo-microsoft-2026-04-24.md`
- `scripts/product-sync.description-backfill.batch-06-final-remaining-2026-04-24.json`
- `scripts/description-backfill-report.batch-06-final-remaining-2026-04-24.md`

Observed progression during implementation

- Original live quality count: 3
- After batch 1: 20
- After batch 2: 38
- After batch 3: 58
- After batch 4: 72
- After batch 5: 82
- After batch 6: 98

Current post-remediation state

- Final post-batch preview report:
  - `scripts/description-backfill-report.remaining-preview-after-batch-06-2026-04-24.md`
- Current summary from that report:
  - Eligible candidate updates remaining: 0
  - Live rows already qualified: 98
  - Missing snapshot rows: 13
  - Ambiguous rows: 1
  - Snapshot rows below threshold: 36

What You Need To QA

Please perform a rigorous review covering all of the following:

1. Root-cause fit
   - Confirm whether the implemented work actually fixes the real problem: poor source-of-truth description quality in production D1 and hidden backend failure behavior.
   - Confirm whether any part of the solution is still only compensating at build time instead of fixing source data.

2. Data-remediation correctness
   - Verify the new generator only updates `description` and does not silently mutate other fields.
   - Verify the manifests align with the reports.
   - Verify the generated descriptions are plausible, consistent, and not obviously malformed.
   - Flag suspicious generated strings or spec combinations that may indicate polluted snapshot data.
   - Pay special attention to copied facts like battery health, warranties, repair history, RAM/storage, monitor specs, and odd values that might be stale or incorrect.

3. Residual quality risk
   - Evaluate the remaining 50 non-eligible residual rows:
     - 13 missing snapshot rows
     - 36 below-threshold snapshot rows
     - 1 ambiguous row
   - Recommend the best next remediation strategy for each bucket.
   - Identify whether any of those residual rows are important enough to block frontend deployment.

4. SEO/prerender/schema correctness
   - Review the frontend changes and determine whether any SEO/schema regressions are still possible.
   - Check whether `frontend/scripts/prerender-seo-routes.mjs` is now internally consistent for:
     - quality threshold logic
     - fallback image logic
     - snapshot enrichment
     - merchant return policy
     - shipping details
     - sitemap-quality filtering
   - Check whether the product-level and collection-level JSON-LD output is likely correct after these changes.
   - Check whether the prerender should still enrich from snapshot after the live quality count has reached 98, or whether any new cleanup would improve clarity or reduce hidden coupling.

5. Deployment readiness
   - The frontend deploy has intentionally not been run yet.
   - Assess whether the repo is ready for frontend build and deploy.
   - Recommend any additional pre-deploy checks that should be run first.
   - Recommend post-deploy smoke checks for sitemap, product HTML, Merchant feed, and local inventory feed.

6. Regression and operational risk review
   - Inspect changed files and generated artifacts for anything risky, brittle, or incomplete.
   - Call out any workflow/documentation gaps that could cause future operators to repeat mistakes.
   - Specifically evaluate whether the sync host default fix in `scripts/sync-products-to-shop.mjs` is sufficient or whether any other scripts still reference retired `shop.pzm.ae` production paths in ways that matter operationally.

7. Stronger recommendations
   - Suggest any additional steps that would materially improve the final result, not just minor cleanup.
   - If there is a better strategy to handle the 50 residual rows before or after deploy, recommend it.
   - If you see reasons to split the next phase into “deploy now” vs “manual remediation first,” explain the tradeoff.

Required output format

Return your review in this structure:

1. Findings
   - Ordered by severity.
   - Include concrete file references and exact risk statements.

2. What appears correct
   - Short confirmation of the implemented parts that look sound.

3. Missing or risky assumptions
   - Any places where the implementation may be relying on weak data or hidden behavior.

4. Recommended extra steps before frontend deploy
   - Only steps with clear value.

5. Recommended extra steps after frontend deploy
   - Include live verification checks.

6. Residual remediation strategy
   - Break down the best path for the 13 missing rows, 36 below-threshold rows, and 1 ambiguous row.

Important constraints

- Do not assume the frontend deploy has already happened.
- Do not assume the snapshot TSV is perfect source of truth.
- Prefer identifying behavioral risks and data-quality risks over style commentary.
- Be skeptical of silently derived specs in generated descriptions.
- If you think some of the new descriptions are too formulaic but still acceptable, distinguish between “acceptable for deployment” and “needs better remediation later.”
```

## Remaining Steps

1. Run the QA prompt above with another agent and review its findings before touching deployment.
2. Decide whether any QA findings are blocking or whether the current state is good enough for frontend deployment.
3. If QA finds high-value issues in the 50 residual non-eligible rows, decide whether to do a manual remediation phase first:
   - 13 rows missing any snapshot source.
   - 36 rows whose snapshot descriptions are still below the 90-character quality bar.
   - 1 ambiguous row with brand mismatch.
4. If QA does not uncover blockers, run the pending frontend build and production deploy so prerendered SEO artifacts, sitemap output, Merchant feed artifacts, and local inventory artifacts are regenerated from the improved live catalog.
5. After frontend deployment, run focused live checks:
   - Verify build output quality counts and prerender logs.
   - Verify live `sitemap.xml` coverage and sample product URLs.
   - Verify sample product HTML includes correct `Product` JSON-LD, image, return policy, shipping details, and quantity-based availability.
   - Verify Merchant feed and local inventory feed outputs.
6. After deployment verification, choose whether to start a manual second-phase remediation for the remaining 50 non-eligible rows.