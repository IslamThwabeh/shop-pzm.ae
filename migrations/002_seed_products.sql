-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (id, username, email, password_hash, role, created_at, updated_at)
VALUES (
  'admin-001',
  'admin',
  'admin@pzm.ae',
  '3be4c7a27d487bfe47da0f60142933e326edc96a8fa3e27645c3c74ba39d714e',
  'admin',
  datetime('now'),
  datetime('now')
);

-- Insert new iPhone products
INSERT INTO products (id, model, storage, condition, color, price, description, quantity, created_at, updated_at)
VALUES
  ('prod-001', 'iPhone 15 Pro Max', '256GB', 'new', 'Space Black', 4499.00, 'Latest flagship iPhone with advanced camera system', 15, datetime('now'), datetime('now')),
  ('prod-002', 'iPhone 15 Pro Max', '512GB', 'new', 'Gold', 5199.00, 'Premium storage variant with stunning gold finish', 10, datetime('now'), datetime('now')),
  ('prod-003', 'iPhone 15 Pro', '256GB', 'new', 'Silver', 3999.00, 'Professional grade iPhone with excellent performance', 20, datetime('now'), datetime('now')),
  ('prod-004', 'iPhone 15', '128GB', 'new', 'Blue', 2999.00, 'Great all-rounder for everyday use', 25, datetime('now'), datetime('now')),
  ('prod-005', 'iPhone 15', '256GB', 'new', 'Pink', 3499.00, 'Same great features with more storage', 18, datetime('now'), datetime('now')),
  ('prod-006', 'iPhone 14 Pro', '256GB', 'new', 'Deep Purple', 3499.00, 'Previous generation flagship still powerful', 12, datetime('now'), datetime('now')),
  ('prod-007', 'iPhone 13', '128GB', 'new', 'Midnight', 2499.00, 'Reliable iPhone with great value', 22, datetime('now'), datetime('now'));

-- Insert used iPhone products
INSERT INTO products (id, model, storage, condition, color, price, description, quantity, created_at, updated_at)
VALUES
  ('prod-008', 'iPhone 14 Pro Max', '256GB', 'used', 'Space Black', 3299.00, 'Excellent condition, fully functional', 8, datetime('now'), datetime('now')),
  ('prod-009', 'iPhone 14 Pro', '256GB', 'used', 'Silver', 2799.00, 'Good condition with minor cosmetic wear', 6, datetime('now'), datetime('now')),
  ('prod-010', 'iPhone 14', '128GB', 'used', 'Blue', 2199.00, 'Well maintained, works perfectly', 10, datetime('now'), datetime('now')),
  ('prod-011', 'iPhone 13 Pro', '256GB', 'used', 'Gold', 2299.00, 'Excellent condition, like new', 5, datetime('now'), datetime('now')),
  ('prod-012', 'iPhone 13', '128GB', 'used', 'Pink', 1799.00, 'Good working condition', 12, datetime('now'), datetime('now')),
  ('prod-013', 'iPhone 12', '64GB', 'used', 'Green', 1299.00, 'Functional with normal wear', 7, datetime('now'), datetime('now'));
