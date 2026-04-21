-- Phase 3 supplemental: iPad MPN backfill
-- All SKUs are Wi-Fi models; model numbers from Apple support.apple.com/en-us/108043
-- iPad (A16, 2025) Wi-Fi = A3354
-- iPad Air 11-inch (M3, 2025) Wi-Fi = A3266
-- iPad Pro 11-inch (M5, 2025) Wi-Fi = A3357

-- iPad (A16) 2025 — 7 Wi-Fi SKUs
UPDATE products SET mpn = 'A3354' WHERE id IN (
  'prod-mntdtiic-z89l6o',
  'prod-mntdtk5y-ds0h7f',
  'prod-mntdtlgo-ipk06q',
  'prod-mntdtmvl-r1h6rv',
  'prod-mntdto2u-4p3089',
  'prod-mntdtpu8-m2te56',
  'prod-mntdtr87-jjomrn'
);

-- iPad Air 11-inch (M3) 2025 — 5 Wi-Fi SKUs
UPDATE products SET mpn = 'A3266' WHERE id IN (
  'prod-mntdtsg5-hahmqe',
  'prod-mntdttrw-hp71ny',
  'prod-mntdtv37-wdwlqw',
  'prod-mntdtwfb-mefjnt',
  'prod-mntdtxpv-r1ffjs'
);

-- iPad Pro 11-inch (M5) 2025 — 1 Wi-Fi SKU (the non-duplicate)
UPDATE products SET mpn = 'A3357' WHERE id = 'prod-mntdu0pp-uvtxu6';
