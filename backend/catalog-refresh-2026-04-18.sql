-- =========================================================
-- Catalog Refresh — April 18, 2026
-- =========================================================

-- Step 1: Null out product_id in order_items for products we're about to delete
-- (Samsung A17 no-color and Samsung A06 no-color have FK references)
UPDATE order_items SET product_id = NULL WHERE product_id IN (
  'prod-mnnylcht-o6llx3',
  'prod-mnnyld0a-ejxqds'
);

-- Step 2: Delete brand-new products no longer in the updated catalog
DELETE FROM products WHERE id IN (
  'prod-mntdtcr8-d0vmwe', -- iPhone 15 128GB Blue (no longer brand-new)
  'prod-mntdte6k-jv9z3l', -- iPhone 16 128GB Black
  'prod-mntdth2i-45do4s', -- iPhone 16 128GB Teal
  'prod-mntdtfjh-cb8f5v', -- iPhone 16 128GB White
  'prod-mnku9nz1-0jms1d', -- iPhone 17 eSIM 256GB Silver
  'prod-mnku9mqc-99c8wd', -- iPhone 17 Pro eSIM 256GB Deep Blue
  'prod-mknvs9uz-hvxekh', -- iPhone 17 Pro Max (ME eSIM) 1TB Cosmic Orange
  'prod-mknuqumj-3j89kt', -- iPhone 17 Pro Max (ME eSIM) 1TB Deep Blue
  'prod-mknvkqh4-r09vyc', -- iPhone 17 Pro Max (ME eSIM) 256GB Cosmic Orange
  'prod-mke7jjyb-sokfrf', -- iPhone 17 Pro Max (ME eSIM) 256GB Deep Blue
  'prod-mknvt9r4-rcv8iz', -- iPhone 17 Pro Max (ME eSIM) 2TB Cosmic Orange
  'prod-mknusqvw-d9butr', -- iPhone 17 Pro Max (ME eSIM) 2TB Deep Blue
  'prod-mknvlvka-5183je', -- iPhone 17 Pro Max (ME eSIM) 512GB Cosmic Orange
  'prod-mknumxrc-5kdqrp', -- iPhone 17 Pro Max (ME eSIM) 512GB Deep Blue
  'prod-mknvxaif-cv1v8g', -- iPhone 17 Pro Max (eSIM+Phys) 1TB Cosmic Orange
  'prod-mknv6fcz-frk68g', -- iPhone 17 Pro Max (eSIM+Phys) 1TB Deep Blue
  'prod-mknvvb95-87l8ks', -- iPhone 17 Pro Max (eSIM+Phys) 256GB Cosmic Orange
  'prod-mknv2rci-80a2e7', -- iPhone 17 Pro Max (eSIM+Phys) 256GB Deep Blue
  'prod-mknwhpm1-w3ypw6', -- iPhone 17 Pro Max (eSIM+Phys) 256GB Silver
  'prod-mknvw4iv-71wisb', -- iPhone 17 Pro Max (eSIM+Phys) 512GB Cosmic Orange
  'prod-mknv4zof-onc9d0', -- iPhone 17 Pro Max (eSIM+Phys) 512GB Deep Blue
  'prod-mnnylbbb-y7nfct', -- Samsung A56 (no color)
  'prod-mnnylbrz-gnvfvh', -- Samsung A36 (no color)
  'prod-mnnylcht-o6llx3', -- Samsung A17 (no color)
  'prod-mnnyld0a-ejxqds'  -- Samsung A06 (no color)
);

-- Step 3: Delete preowned products no longer in the updated catalog
DELETE FROM products WHERE id IN (
  'prod-mnnz7m0y-phqtnu', -- Gaming PC i7 14th Corsair (not in new list)
  'prod-mnnz7elc-iwnhq1', -- Nokia C20 (not in new list)
  'prod-mnnz7jsh-rh2ju7', -- iPad 5th Gen Wi-Fi+Cellular (not in new list)
  'prod-mnnylkm1-3qon8s', -- iPad Pro 11" 64GB (not in new list)
  'prod-mnnz7942-sy45e4', -- iPhone 14 Pro 128GB White (list has Black 128GB)
  'prod-mnnz78oc-j05d04', -- iPhone 14 Pro 256GB Purple (not in new list)
  'prod-mnnyliq5-vclzt3'  -- iPhone 15 Plus 256GB Pink (not in new list)
);

-- Step 4: Hide brand-new iPads (set qty=0 — stays in DB but hidden from storefront)
UPDATE products SET quantity = 0, updated_at = datetime('now')
WHERE condition = 'new' AND (
  model LIKE '%iPad%'
);

-- Step 5: Update prices for brand-new products
UPDATE products SET price = 500, updated_at = datetime('now')  WHERE id = 'prod-mnnylfgi-563z4b'; -- PS4 with Controller: 700→500
UPDATE products SET price = 650, updated_at = datetime('now')  WHERE id = 'prod-mnnylg1u-8oymq7'; -- Xbox One: 550→650

-- Step 6: Update preowned product prices
UPDATE products SET price = 3500, updated_at = datetime('now') WHERE id = 'prod-mnnyllrg-78sb84'; -- Gaming PC White i7 12th: 4500→3500
UPDATE products SET price = 350,  updated_at = datetime('now') WHERE id = 'prod-mnnz7dcf-h2lui0'; -- Redmi Note 8: 300→350

-- Step 7: Fix iPhone 17 Air — specific unit, set qty=1, add MPN
UPDATE products SET quantity = 1, mpn = '0044000141225', updated_at = datetime('now')
WHERE id = 'prod-mnku9nbd-ob74rl'; -- iPhone 17 Air Blue 1TB (specific unit)

-- Step 8: Update Lenovo ThinkBook qty to cover all 6 units in new list
UPDATE products SET quantity = 6, updated_at = datetime('now')
WHERE id = 'prod-mnnyljke-go92k4'; -- Lenovo ThinkBook i5 13th 8GB/256GB
