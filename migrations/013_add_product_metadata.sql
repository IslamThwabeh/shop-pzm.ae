ALTER TABLE products ADD COLUMN brand TEXT;
ALTER TABLE products ADD COLUMN product_type TEXT;
ALTER TABLE products ADD COLUMN google_product_category TEXT;
ALTER TABLE products ADD COLUMN gtin TEXT;
ALTER TABLE products ADD COLUMN mpn TEXT;
ALTER TABLE products ADD COLUMN item_group_id TEXT;
ALTER TABLE products ADD COLUMN warranty TEXT;
ALTER TABLE products ADD COLUMN accessories_included TEXT;
ALTER TABLE products ADD COLUMN cosmetic_grade TEXT;
ALTER TABLE products ADD COLUMN repair_history TEXT;
ALTER TABLE products ADD COLUMN battery_health INTEGER;
ALTER TABLE products ADD COLUMN release_year INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin);
CREATE INDEX IF NOT EXISTS idx_products_item_group_id ON products(item_group_id);