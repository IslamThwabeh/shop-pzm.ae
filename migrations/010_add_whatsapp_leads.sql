CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id TEXT PRIMARY KEY,
  lead_type TEXT NOT NULL CHECK(lead_type IN ('product', 'service', 'appointment')),
  reference_id TEXT,
  reference_label TEXT NOT NULL,
  reference_price REAL,
  source_page TEXT,
  whatsapp_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status ON whatsapp_leads(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_lead_type ON whatsapp_leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_created_at ON whatsapp_leads(created_at);
