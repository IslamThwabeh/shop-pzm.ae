ALTER TABLE orders ADD COLUMN items_total REAL;
ALTER TABLE orders ADD COLUMN delivery_fee REAL;

UPDATE orders
SET items_total = total_price
WHERE items_total IS NULL;