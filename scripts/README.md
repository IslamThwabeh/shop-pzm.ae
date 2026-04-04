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