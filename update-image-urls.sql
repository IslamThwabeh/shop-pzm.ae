-- PZM iPhone Shop - Database Image URL Update Script
-- Run this in Cloudflare D1 Console after uploading images to R2

-- IMPORTANT: Replace YOUR_ACCOUNT_ID with your actual Cloudflare account ID
-- Or use your custom R2 domain if configured

-- Update product image URLs with R2 bucket URLs
UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-pro-max-black.png' 
WHERE id = 'iphone-15-pro-max-256-new-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-pro-max-gold.png' 
WHERE id = 'iphone-15-pro-max-256-new-gold';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-pro-max-black.png' 
WHERE id = 'iphone-15-pro-max-512-new-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-pro-black.png' 
WHERE id = 'iphone-15-pro-256-new-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-black.png' 
WHERE id = 'iphone-15-128-new-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-15-blue.png' 
WHERE id = 'iphone-15-128-new-blue';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-14-pro-black.png' 
WHERE id = 'iphone-14-pro-256-new-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-14-pro-max-black.png' 
WHERE id = 'iphone-14-pro-max-256-used-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-14-blue.png' 
WHERE id = 'iphone-14-128-used-blue';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-13-pro-gold.png' 
WHERE id = 'iphone-13-pro-256-used-gold';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-13-black.png' 
WHERE id = 'iphone-13-128-used-black';

UPDATE products SET image_url = 'https://pzm-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/products/iphone-12-white.png' 
WHERE id = 'iphone-12-64-used-white';

-- Verify the updates
SELECT id, model, color, image_url FROM products ORDER BY price DESC;
