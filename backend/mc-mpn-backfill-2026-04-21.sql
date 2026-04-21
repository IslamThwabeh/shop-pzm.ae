-- MC Phase 3: Backfill official MPNs for products with identifier_exists=no
-- Source: Apple support.apple.com/en-ae/HT3939 and support.apple.com/en-us/102869
--         Samsung official model numbers (international/MENA variants)
-- Strategy: MPN + brand = identifier_exists:yes in MC feed
-- Do NOT run on products that already have mpn set (see WHERE clause).

-- ============================================================
-- 1. iPhone 17 Pro (UAE model A3522) — 9 SKUs, all new stock
-- ============================================================
UPDATE products SET mpn = 'A3522' WHERE id IN (
  'prod-mo4qtqv4-tougpx', -- iPhone 17 Pro 256GB Cosmic Orange
  'prod-mo4qtru7-zvxcd4', -- iPhone 17 Pro 256GB Silver
  'prod-mo4qtrgk-ajcp0z', -- iPhone 17 Pro 256GB Deep Blue
  'prod-mo4qtu5y-9qn5fg', -- iPhone 17 Pro 512GB Silver
  'prod-mo4qttpa-oqdrk9', -- iPhone 17 Pro 512GB Deep Blue
  'prod-mo4qtt5g-vc9uze', -- iPhone 17 Pro 512GB Cosmic Orange
  'prod-mo4qtvwt-m4lafk', -- iPhone 17 Pro 1TB Silver
  'prod-mo4qtvia-13noxy', -- iPhone 17 Pro 1TB Deep Blue
  'prod-mo4qtv50-4n6gws'  -- iPhone 17 Pro 1TB Cosmic Orange
);

-- ============================================================
-- 2. iPhone 17 Pro Max (UAE model A3525) — 9 SKUs, all new stock
-- ============================================================
UPDATE products SET mpn = 'A3525' WHERE id IN (
  'prod-mo4qtkrb-gp5r0d', -- iPhone 17 Pro Max 256GB Cosmic Orange
  'prod-mo4qtl68-w7ak8x', -- iPhone 17 Pro Max 256GB Deep Blue
  'prod-mo7h67vb-dpn2yx', -- iPhone 17 Pro Max 256GB Silver
  'prod-mo4qtmqa-h7xolq', -- iPhone 17 Pro Max 512GB Cosmic Orange
  'prod-mo4qtn8o-i0ayrh', -- iPhone 17 Pro Max 512GB Deep Blue
  'prod-mo7h68vb-l3tiaq', -- iPhone 17 Pro Max 512GB Silver
  'prod-mo4qtoyr-r82epy', -- iPhone 17 Pro Max 1TB Cosmic Orange
  'prod-mo4qtph8-fbi2nx', -- iPhone 17 Pro Max 1TB Deep Blue
  'prod-mo7h69um-a32bid'  -- iPhone 17 Pro Max 1TB Silver
);

-- ============================================================
-- 3. Older iPhones (used/secondhand) — official UAE/international model A-numbers
-- ============================================================
UPDATE products SET mpn = 'A3295' WHERE id = 'prod-mnnylguu-t5h6b2'; -- iPhone 16 Pro Max 256GB Desert Titanium (UAE A3295)
UPDATE products SET mpn = 'A3292' WHERE id = 'prod-mnnylhk1-chkb48'; -- iPhone 16 Pro 128GB White (UAE A3292)
UPDATE products SET mpn = 'A3106' WHERE id = 'prod-mnnyli5x-ahzdn4'; -- iPhone 15 Pro Max 256GB Black (intl A3106)
UPDATE products SET mpn = 'A2892' WHERE id = 'prod-mnnz785s-i7iu13'; -- iPhone 14 Pro 512GB Black (intl A2892)
UPDATE products SET mpn = 'A2643' WHERE id = 'prod-mnnz79rn-hqlaav'; -- iPhone 13 Pro Max 256GB Blue (intl A2643)
UPDATE products SET mpn = 'A2638' WHERE id = 'prod-mnnz7aii-6j2evv'; -- iPhone 13 Pro 1TB Blue (intl A2638)
UPDATE products SET mpn = 'A2399' WHERE id = 'prod-mnnz7b8r-fzll92'; -- iPhone 12 Mini 64GB Rose White (intl A2399)

-- ============================================================
-- 4. MacBooks — official Apple Model Identifiers as MPN
-- ============================================================
UPDATE products SET mpn = 'Mac16,12'        WHERE id = 'prod-mnnyldsg-91l1yj'; -- MacBook Air 13" M4 2025 Silver (new)
UPDATE products SET mpn = 'MacBookAir10,1'  WHERE id = 'prod-mnnz7ini-ebpaz7'; -- MacBook Air M1 2020 8GB/256GB
UPDATE products SET mpn = 'Mac14,2'         WHERE id = 'prod-mnnylj55-ahu1yf'; -- MacBook Air M2 2022 8GB/256GB
UPDATE products SET mpn = 'MacBookPro15,1'  WHERE id = 'prod-mnnz7i37-f45q0m'; -- MacBook Pro 15" 2019 32GB/512GB
UPDATE products SET mpn = 'Mac15,7'         WHERE id = 'prod-mnnz7hfp-d4coml'; -- MacBook Pro 16" M3 Pro 36GB/512GB

-- ============================================================
-- 5. iPads — official Apple model A-numbers (Wi-Fi variants)
-- ============================================================
UPDATE products SET mpn = 'A2270' WHERE id = 'prod-mnnz7kbm-9xdr7p'; -- iPad 8th Gen 32GB Rose Gold
UPDATE products SET mpn = 'A2602' WHERE id = 'prod-mnnyll1d-42xb7j'; -- iPad 9th Gen 64GB Grey

-- ============================================================
-- 6. Samsung Galaxy phones (new) — international/MENA model numbers
-- ============================================================
-- Galaxy A36 5G 128GB (SM-A366B international)
UPDATE products SET mpn = 'SM-A366B' WHERE id IN (
  'prod-mo4qu2la-ng0cwp', -- Samsung Galaxy A36 5G 128GB Lavender
  'prod-mo4qu27n-k24acc', -- Samsung Galaxy A36 5G 128GB White
  'prod-mo4qu15p-hpx8sd', -- Samsung Galaxy A36 5G 128GB Black
  'prod-mo4qu1n0-1vrmx9'  -- Samsung Galaxy A36 5G 128GB Blue
);

-- Galaxy A56 5G 128GB (SM-A566B international)
UPDATE products SET mpn = 'SM-A566B' WHERE id IN (
  'prod-mo4qtyy3-6ur2l6', -- Samsung Galaxy A56 5G 128GB Graphite
  'prod-mo4qtzd9-r42rfy', -- Samsung Galaxy A56 5G 128GB Blue
  'prod-mo4qu0lz-2vjsc1', -- Samsung Galaxy A56 5G 128GB Lavender
  'prod-mo4qtzwv-6l7kb9'  -- Samsung Galaxy A56 5G 128GB White
);

-- Galaxy A06 4G 64GB (SM-A065F international)
UPDATE products SET mpn = 'SM-A065F' WHERE id IN (
  'prod-mo4qu7dq-207z49', -- Samsung Galaxy A06 4G 64GB White
  'prod-mo4qu6mp-ambodb', -- Samsung Galaxy A06 4G 64GB Black
  'prod-mo4qu70a-3nkedx'  -- Samsung Galaxy A06 4G 64GB Blue
);

-- Galaxy A07 4G 64GB (SM-A075F international)
UPDATE products SET mpn = 'SM-A075F' WHERE id IN (
  'prod-mo4qu53t-7ls8gf', -- Samsung Galaxy A07 4G 64GB Black
  'prod-mo4qu5ie-8pjqn6', -- Samsung Galaxy A07 4G 64GB Blue
  'prod-mo4qu66z-v8pijq'  -- Samsung Galaxy A07 4G 64GB White
);

-- ============================================================
-- 7. Samsung used devices
-- ============================================================
UPDATE products SET mpn = 'SM-A736B' WHERE id = 'prod-mnnz7crj-1msd5r'; -- Samsung Galaxy A73 5G 128GB Good Condition
UPDATE products SET mpn = 'SM-T580'  WHERE id = 'prod-mnnz7lck-2n3b85'; -- Samsung Tab A6 32GB Good Condition (WiFi)
