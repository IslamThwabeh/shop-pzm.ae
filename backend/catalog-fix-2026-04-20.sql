-- =========================================================
-- Catalog Fix — April 20, 2026
-- iPhone 17 Pro Max & iPhone 17 Pro: wrong colors/images fix
-- =========================================================

-- Step 1: Remove any stale old-gen iPhone 17 Pro Max brand-new products
-- (the non-prod-mo4qt* IDs that survived the April 18 cleanup and cause
-- "From AED 4500" to appear on the storefront)
UPDATE order_items SET product_id = NULL
WHERE product_id IN (
  SELECT id FROM products
  WHERE condition = 'new'
    AND model LIKE '%iPhone 17 Pro Max%'
    AND id NOT LIKE 'prod-mo4qt%'
);

DELETE FROM products
WHERE condition = 'new'
  AND model LIKE '%iPhone 17 Pro Max%'
  AND id NOT LIKE 'prod-mo4qt%';

-- Step 2: Remove also stale old-gen iPhone 17 Pro brand-new products
UPDATE order_items SET product_id = NULL
WHERE product_id IN (
  SELECT id FROM products
  WHERE condition = 'new'
    AND model LIKE '%iPhone 17 Pro%'
    AND model NOT LIKE '%iPhone 17 Pro Max%'
    AND id NOT LIKE 'prod-mo4qt%'
);

DELETE FROM products
WHERE condition = 'new'
  AND model LIKE '%iPhone 17 Pro%'
  AND model NOT LIKE '%iPhone 17 Pro Max%'
  AND id NOT LIKE 'prod-mo4qt%';

-- Step 3: Delete unwanted iPhone 17 Pro Max SKUs
-- (Desert Titanium x3 + Blue spot x1 — these have no correct color equivalent)
UPDATE order_items SET product_id = NULL WHERE product_id IN (
  'prod-mo4qtm60-kpzoqn', -- Desert Titanium 256GB
  'prod-mo4qtoaa-8psfcw', -- Desert Titanium 512GB
  'prod-mo4qtqbl-z585t9', -- Desert Titanium 1TB
  'prod-mo4qtwqe-sah82m'  -- Blue 256GB (spot unit)
);
DELETE FROM products WHERE id IN (
  'prod-mo4qtm60-kpzoqn',
  'prod-mo4qtoaa-8psfcw',
  'prod-mo4qtqbl-z585t9',
  'prod-mo4qtwqe-sah82m'
);

-- Step 4: Rename surviving iPhone 17 Pro Max colors in-place
-- Black Titanium → Cosmic Orange
UPDATE products SET color = 'Cosmic Orange', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtkrb-gp5r0d', -- 256GB
  'prod-mo4qtmqa-h7xolq', -- 512GB
  'prod-mo4qtoyr-r82epy'  -- 1TB
);

-- White Titanium → Deep Blue
UPDATE products SET color = 'Deep Blue', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtl68-w7ak8x', -- 256GB
  'prod-mo4qtn8o-i0ayrh', -- 512GB
  'prod-mo4qtph8-fbi2nx'  -- 1TB
);

-- Natural Titanium → Silver
UPDATE products SET color = 'Silver', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtls0-z97uk7', -- 256GB
  'prod-mo4qtns9-bnldvd', -- 512GB
  'prod-mo4qtpv7-dolz7h'  -- 1TB
);

-- Step 5: Delete unwanted iPhone 17 Pro SKUs
-- (Desert Titanium x3 + Silver spot x1 + Ceramic Orange spot x1)
UPDATE order_items SET product_id = NULL WHERE product_id IN (
  'prod-mo4qtsqo-mv7wjd', -- Desert Titanium 256GB
  'prod-mo4qtumv-yyyavh', -- Desert Titanium 512GB
  'prod-mo4qtwbm-y3nmz1', -- Desert Titanium 1TB
  'prod-mo4qtxbr-yqvkbe', -- Silver spot 256GB (superseded by rename)
  'prod-mo4qtxso-wo6qie'  -- Ceramic Orange spot
);
DELETE FROM products WHERE id IN (
  'prod-mo4qtsqo-mv7wjd',
  'prod-mo4qtumv-yyyavh',
  'prod-mo4qtwbm-y3nmz1',
  'prod-mo4qtxbr-yqvkbe',
  'prod-mo4qtxso-wo6qie'
);

-- Step 6: Rename surviving iPhone 17 Pro colors in-place
-- Black Titanium → Cosmic Orange
UPDATE products SET color = 'Cosmic Orange', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtqv4-tougpx', -- 256GB
  'prod-mo4qtt5g-vc9uze', -- 512GB
  'prod-mo4qtv50-4n6gws'  -- 1TB
);

-- White Titanium → Deep Blue
UPDATE products SET color = 'Deep Blue', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtrgk-ajcp0z', -- 256GB
  'prod-mo4qttpa-oqdrk9', -- 512GB
  'prod-mo4qtvia-13noxy'  -- 1TB
);

-- Natural Titanium → Silver
UPDATE products SET color = 'Silver', updated_at = datetime('now')
WHERE id IN (
  'prod-mo4qtru7-zvxcd4', -- 256GB
  'prod-mo4qtu5y-9qn5fg', -- 512GB
  'prod-mo4qtvwt-m4lafk'  -- 1TB
);

-- Verification queries (run after to confirm)
-- SELECT id, model, color, storage, price FROM products
-- WHERE condition = 'new' AND model LIKE '%iPhone 17 Pro%'
-- ORDER BY model, color, storage;
