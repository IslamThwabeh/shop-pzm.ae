-- Migration: Replace shop.pzm.ae media URLs with pzm.ae
-- Date: 2026-04-24
-- Context: shop.pzm.ae was removed from backend host normalization, 
-- but legacy product data still contained shop.pzm.ae URLs.
-- This migration updates all product media URLs to use pzm.ae.

-- Update products table
UPDATE products 
SET image_url = REPLACE(image_url, 'https://shop.pzm.ae/', 'https://pzm.ae/')
WHERE image_url LIKE '%shop.pzm.ae%';

-- Update product_images table
UPDATE product_images 
SET image_url = REPLACE(image_url, 'https://shop.pzm.ae/', 'https://pzm.ae/')
WHERE image_url LIKE '%shop.pzm.ae%';

-- Verification query (should return 0 for both):
-- SELECT COUNT(*) FROM products WHERE image_url LIKE '%shop.pzm.ae%';
-- SELECT COUNT(*) FROM product_images WHERE image_url LIKE '%shop.pzm.ae%';
