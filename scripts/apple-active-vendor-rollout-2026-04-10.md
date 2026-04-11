# Apple Active Vendor Rollout - 2026-04-10

This rollout converts the vendor sheet into a publishable phase-1 Apple expansion without pushing the full raw list into the public catalog.

## Scope

Publish first:

- iPhone 15 128GB in Blue
- iPhone 16 128GB in Black, White, and Teal
- iPad 11 Wi-Fi in 128GB and 256GB
- iPad Air 11-inch M3 Wi-Fi in 128GB and 256GB
- iPad Pro 11-inch M5 Wi-Fi 256GB

Hold for later:

- MacBook rows because the source section is explicitly marked non-active
- Apple Watch rows until the case, size, and band combinations are normalized into cleaner public offers
- Pencil, AirTag, adapters, AirPods, and gaming inventory because they add noise before the main-device expansion is stable
- iPhone 17 cleanup until the current live 17 catalog is rationalized into buyer-facing families instead of region-heavy variant names

## Image Batch

Create two owned family images for each family in this phase.

Families:

- iPhone 15 family
- iPhone 16 family
- iPad 11 family
- iPad Air 11-inch M3 family
- iPad Pro 11-inch M5 family

Asset rule:

- Primary image: clean front-plus-rear retail hero on white
- Secondary image: alternate angle for the same family on white
- Use the same two family images across all color variants until color-accurate variant images exist

## Prompt Packs

External prompt packs created for this batch:

- PHONE_IPHONE_ACTIVE_ADDITIONS_2026-04-10.md
- TABLET_IPAD_ACTIVE_ADDITIONS_2026-04-10.md

## Draft Catalog Manifest

Use [scripts/product-sync.apple-active-additions-2026-04-10.json](scripts/product-sync.apple-active-additions-2026-04-10.json) as the working manifest.

Important:

- The manifest now uses `quantity: 1` as a conservative live placeholder so the offers can surface on the storefront and remain cartable.
- Replace the placeholder quantity with real stock counts whenever a specific SKU becomes confirmed in-hand.
- Leave `gtin` and `mpn` empty until vendor identifiers are verified.
- Review iPad color naming before publish if the vendor confirms official finish names differently.

Suggested public prices were applied to the manifest based on competitive Dubai retail positioning with a stronger margin than raw vendor cost while staying commercially reasonable for active Apple devices.

## Publish Order

1. Generate and optimize the family images.
2. Review the draft manifest titles, prices, and quantities.
3. Set the intended live quantities.
4. Run `npm run catalog:sync -- .\scripts\product-sync.apple-active-additions-2026-04-10.json`.
5. Verify the new products in the public API and on the storefront routes.

## Notes

- The existing storefront already routes new iPads to the brand-new devices page without frontend changes.
- The current live catalog already contains Apple 17 and one MacBook listing, so this batch is focused on the missing active vendor additions rather than reworking existing live Apple rows.