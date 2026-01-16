-- Update order/product foreign keys so products can be deleted without constraint errors
-- Makes product_id nullable and sets foreign keys to SET NULL on delete

PRAGMA foreign_keys = OFF;

-- Recreate orders table with nullable product_id and ON DELETE SET NULL
CREATE TABLE orders_new (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  product_id TEXT,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO orders_new (
  id, customer_id, customer_name, customer_email, customer_phone, customer_address,
  product_id, quantity, total_price, payment_method, status, notes, created_at, updated_at
)
SELECT
  id, customer_id, customer_name, customer_email, customer_phone, customer_address,
  product_id, quantity, total_price, payment_method, status, notes, created_at, updated_at
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Recreate order_items with nullable product_id and ON DELETE SET NULL
CREATE TABLE order_items_new (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO order_items_new (
  id, order_id, product_id, quantity, unit_price, subtotal, created_at
)
SELECT
  id, order_id, product_id, quantity, unit_price, subtotal, created_at
FROM order_items;

DROP TABLE order_items;
ALTER TABLE order_items_new RENAME TO order_items;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

PRAGMA foreign_keys = ON;
