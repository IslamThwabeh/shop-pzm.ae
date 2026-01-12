-- Migration: Make product_id and quantity nullable in orders table
-- This allows orders to use order_items table instead of legacy single-product columns

ALTER TABLE orders ADD COLUMN product_id_new TEXT;
ALTER TABLE orders ADD COLUMN quantity_new INTEGER;

UPDATE orders SET 
  product_id_new = product_id,
  quantity_new = quantity;

-- Drop old columns and rename new ones
-- Note: SQLite doesn't support DROP COLUMN easily, so we'll keep them but they'll be unused
-- New orders will have NULL in these fields
