-- Migration: Add product_images table for multiple product images
-- This allows each product to have up to 4 images with ordering

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, image_order);

-- Note: Existing products will continue to use image_url from products table
-- New products will store images in product_images table
-- When querying, if product_images exist, use those; otherwise fall back to products.image_url
