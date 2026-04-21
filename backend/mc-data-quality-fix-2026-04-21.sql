-- MC data quality fixes 2026-04-21
-- Phase 2: Fix item_group_id, google_product_category, and brand issues identified via MC product export

-- 2.1: Silver Pro Max variants are missing item_group_id and google_product_category,
--      making them orphaned from the Cosmic Orange / Deep Blue color group.
UPDATE products SET
  item_group_id = 'apple-iphone-17-pro-max-256gb',
  google_product_category = 'Electronics > Communications > Telephony > Mobile Phones'
WHERE id = 'prod-mo7h67vb-dpn2yx'; -- iPhone 17 Pro Max 256GB Silver

UPDATE products SET
  item_group_id = 'apple-iphone-17-pro-max-512gb',
  google_product_category = 'Electronics > Communications > Telephony > Mobile Phones'
WHERE id = 'prod-mo7h68vb-l3tiaq'; -- iPhone 17 Pro Max 512GB Silver

UPDATE products SET
  item_group_id = 'apple-iphone-17-pro-max-1tb',
  google_product_category = 'Electronics > Communications > Telephony > Mobile Phones'
WHERE id = 'prod-mo7h69um-a32bid'; -- iPhone 17 Pro Max 1TB Silver

-- 2.2: PS5 Disk Edition has brand = 'Sony' but all other PlayStation products use 'PlayStation'.
--      Also missing google_product_category.
UPDATE products SET
  brand = 'PlayStation',
  google_product_category = 'Electronics > Video Game Consoles'
WHERE id = 'prod-mo4qu7vw-p79g80'; -- PS5 Disk Edition 1TB White

-- 2.3: Monitors missing google_product_category (all 8 monitor products)
UPDATE products SET
  google_product_category = 'Electronics > Video > Video Components > Monitors'
WHERE id IN (
  'prod-mnnz7mm7-a76u51', -- LG UltraGear 45" OLED
  'prod-mnnz7n1b-cyflma', -- ASUS ROG Swift 27"
  'prod-mnnz7nhe-sbagxe', -- Samsung ViewFinity S7 32"
  'prod-mo4qvizj-w7unz0', -- Samsung DG502 Flat 32"
  'prod-mo4qviia-t4t7si', -- Samsung S3 Curved 24"
  'prod-mo4qvi13-zp6a78', -- Samsung CF390 Curved 27"
  'prod-mo4qvjd7-6ydt7y', -- Dell Monitor 24"
  'prod-mo4qvjs4-gox7cc'  -- BenQ 27" FHD
);

-- 2.4: Apple accessories missing google_product_category
UPDATE products SET
  google_product_category = 'Electronics > Communications > Wearable Technology'
WHERE id = 'prod-mo4quzkt-96k1wf'; -- Apple Watch SE 40mm GPS

UPDATE products SET
  google_product_category = 'Electronics > Audio > Audio Components > Headphones & Headsets'
WHERE id = 'prod-mo4quz43-0qdj92'; -- AirPods 4 ANC

UPDATE products SET
  google_product_category = 'Electronics > Computers > Computer Peripherals > Stylus Pens'
WHERE id = 'prod-mo4quzyw-nxxqq1'; -- Apple Pencil USB-C
