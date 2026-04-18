# Catalog And Media Operations

This folder is for operator-side workflows so catalog and image changes do not need to be entered manually through the admin UI.

## Product Sync

Use the live product API to create or update products from a local JSON manifest:

```powershell
$env:ADMIN_SECRET = "your-worker-admin-secret"
npm run catalog:sync -- .\scripts\product-sync.example.json
```

Notes:

- Admin username/password login now uses 2FA. For unattended catalog sync runs, use `ADMIN_SECRET` or a pre-issued `PZM_ADMIN_TOKEN`.
- The script updates an existing product when `id` matches or when `model + storage + condition + color` matches an existing item.
- Set `replaceImages: true` when the new files should replace the current product gallery instead of being appended.
- Image paths can be absolute Windows paths from anywhere on your PC.
- `storage` and `color` are now optional for products where they are not real customer-facing attributes.
- Do not put warranty, stock status, repair notes, or bundle notes into `color` or `storage`.
- Supported optional metadata fields: `brand`, `product_type`, `google_product_category`, `gtin`, `mpn`, `item_group_id`, `warranty`, `accessories_included`, `cosmetic_grade`, `repair_history`, `battery_health`, `release_year`.
- For used devices, prefer filling `battery_health`, `cosmetic_grade`, `repair_history`, `accessories_included`, and `warranty` from your own inspection before writing the description.

## Metadata Backfill

Generate a minimal update manifest from the live catalog and then sync it back through the API:

```powershell
node .\scripts\generate-product-metadata-backfill.mjs
npm run catalog:sync -- .\scripts\product-metadata-backfill-2026-04-10.json
```

Notes:

- The generator fetches the live `new` and `used` catalog from `PZM_SITE_URL` and writes only rows that need metadata cleanup or enrichment.
- It is meant for safe backfills of obvious fields such as `brand`, `product_type`, `google_product_category`, `item_group_id`, `warranty`, `accessories_included`, `repair_history`, `battery_health`, and cleanup of fake `storage` or `color` values.
- Review the generated manifest before syncing if a row needs hand-edited product knowledge like GTIN or MPN.

## Merchant Description Remediation

Generate a focused description-update manifest from a Merchant Center CSV export and the live catalog:

```powershell
node .\scripts\generate-merchant-description-manifest.mjs "C:\Users\your-name\Desktop\merchant-issues.csv"
npm run catalog:sync -- .\scripts\product-sync.merchant-description-remediation-YYYY-MM-DD.json
```

Notes:

- The generator only produces updates for repo-backed live products with internal `prod-*` IDs.
- It skips non-catalog IDs or stale Merchant-only rows and writes those to a markdown report next to the generated manifest.
- Description enrichment is limited to verified catalog facts already present in the live API, such as storage, real color, SIM variant wording, battery health, repair history, warranty, and release year.
- Merchant feed files are static frontend build artifacts, so a description sync still requires a frontend rebuild and deploy before Google can fetch the updated copy.

## Merchant Local Inventory Feed

The frontend prerender can now generate a separate local inventory feed for Merchant Center at `frontend/dist/merchant-local-inventory.txt`.

Recommended workflow:

```powershell
$env:PZM_MERCHANT_STORE_CODE = "your-case-sensitive-business-profile-store-code"
cd .\frontend
npm run build:production
```

Notes:

- Configure the exact Google Business Profile `store_code` with `PZM_MERCHANT_STORE_CODE` or by filling `frontend/src/content/localInventoryConfig.json` after it is confirmed in Merchant Center.
- The primary Merchant product feed is now configured to exclude `Local_inventory_ads` and `Free_local_listings` by default through `primaryFeedExcludedDestinations` in `frontend/src/content/localInventoryConfig.json`, because the current Merchant account has no linked store profiles.
- The local inventory feed reuses the current primary Merchant product IDs exactly as they appear in `merchant-feed.txt`.
- Only positive-price, in-stock products are considered, then the local config further narrows the set with `includedProductIds` or `excludedProductIds`.
- If `includedProductIds` is non-empty, only those IDs are emitted. Otherwise, all eligible in-stock products are emitted except the IDs listed under `excludedProductIds`.
- The initial config excludes the 17 `Available soon` IDs from the 2026-04-15 Merchant export so they are not claimed as in-store stock on day one.
- If no store code is configured, the build skips the local inventory file instead of generating an invalid feed.
- Add `merchant-local-inventory.txt` in Merchant Center as a `Local product inventory` data source, not as a supplemental feed.
- Code-side exclusions help, but if the Merchant product source itself still has physical-store marketing methods enabled, you should also remove `Free local listings` / `Local inventory ads` in the data source settings until a real Business Profile store is linked.
- Like the main Merchant feed, this file is a frontend build artifact, so Merchant will only see updates after the frontend is rebuilt and deployed.

## Gemini Device Image Workflow

Use this workflow when generating new product or family imagery with Gemini and assigning it to live catalog items.

1. Create or update a prompt-pack markdown file in `D:\Personal\PZM Website\GiminiImages` using the existing naming pattern such as `PHONE_IPHONE_PROMPTS.md` or `PHONE_IPHONE_17_PRO_AND_PRO_MAX_PROMPTS.md`.
2. For every required asset, include all of the following in the prompt pack:
	- the exact product or family image being generated
	- the detailed generation prompt
	- the raw Gemini output filename
	- the raw save folder under the correct device directory, such as `D:\Personal\PZM Website\GiminiImages\phone\iphone`
	- the final expected `.webp` filename after optimization
	- whether the image is a single-variant product image or a family fallback image
3. Save the raw Gemini outputs as `.png`, `.jpg`, or `.jpeg` inside the target device folder without manual renaming outside the prompt pack.
4. Run the optimizer so the raw files are backed up and converted in place:

```powershell
python .\scripts\optimize_gemini_images.py "D:\Personal\PZM Website\GiminiImages"
```

5. If the storefront uses a stable shared fallback image, upload that optimized file to the expected generated media key.
6. Create a focused manifest in `scripts/` that maps the affected live product IDs to the new absolute Windows `.webp` paths.
7. Run the product sync with `replaceImages: true` so the optimized files are assigned to the correct products.
8. Verify the result in both `https://shop.pzm.ae/api/products` and the affected storefront page before considering the rollout complete.

Rules:

- Do not leave filenames or folders implicit inside the prompt pack. The markdown file should act as an execution checklist.
- Separate single-variant assets from family fallback assets. Variant images drive color-accurate swapping; family images are only the default/fallback card visuals.
- Confirm official manufacturer references before finalizing prompts when hardware accuracy matters.

## Owned Media Upload

Upload local files or a whole directory to R2 and get back the public URLs:

```powershell
npm run media:upload -- --folder products C:\Users\your-name\Pictures\pzm\catalog
npm run media:upload -- --folder blog C:\Users\your-name\Pictures\pzm\blog
```

Notes:

- The script loads `backend/.cloudflare-deploy.env` automatically when it exists.
- Uploads go to `https://shop.pzm.ae/api/media/<folder>/<filename>`.
- This script is for owned local files only. Do not rehost third-party blog images unless you have the right to use them.