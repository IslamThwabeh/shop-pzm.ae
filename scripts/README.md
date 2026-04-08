# Catalog And Media Operations

This folder is for operator-side workflows so catalog and image changes do not need to be entered manually through the admin UI.

## Product Sync

Use the live product API to create or update products from a local JSON manifest:

```powershell
$env:PZM_ADMIN_USERNAME = "your-admin-username"
$env:PZM_ADMIN_PASSWORD = "your-admin-password"
npm run catalog:sync -- .\scripts\product-sync.example.json
```

Notes:

- The script updates an existing product when `id` matches or when `model + storage + condition + color` matches an existing item.
- Set `replaceImages: true` when the new files should replace the current product gallery instead of being appended.
- Image paths can be absolute Windows paths from anywhere on your PC.

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