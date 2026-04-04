CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL,
  request_kind TEXT NOT NULL CHECK(request_kind IN ('quote', 'booking', 'callback', 'availability')),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  details TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'phone' CHECK(preferred_contact_method IN ('phone', 'email', 'whatsapp')),
  preferred_date TEXT,
  preferred_time_period TEXT CHECK(preferred_time_period IN ('morning', 'afternoon', 'evening')),
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON service_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);