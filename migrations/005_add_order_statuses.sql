-- Add new order statuses: in_progress and ready_for_delivery
-- We need to recreate the table with the new CHECK constraint since SQLite doesn't support altering constraints

-- Create a temporary table with the new constraint
CREATE TABLE orders_new (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  product_id TEXT,
  quantity INTEGER,
  total_price REAL NOT NULL,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_progress', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Copy data from old table to new table
INSERT INTO orders_new SELECT * FROM orders;

-- Drop old table
DROP TABLE orders;

-- Rename new table to original name
ALTER TABLE orders_new RENAME TO orders;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
