-- Migrate existing images from products table to product_images table
INSERT INTO product_images (id, product_id, image_url, image_order, is_primary, created_at)
SELECT 
  substr(id, 1, 8) || '-' || substr(id, 9, 4) || '-' || substr(id, 13) || '-img-0',
  id, 
  image_url, 
  0, 
  1,
  CURRENT_TIMESTAMP
FROM products
WHERE image_url IS NOT NULL AND image_url != '';
