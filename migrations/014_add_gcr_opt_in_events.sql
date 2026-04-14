CREATE TABLE IF NOT EXISTS gcr_opt_in_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt_style TEXT,
  source TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_origin TEXT,
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  debug_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gcr_opt_in_events_order_id
  ON gcr_opt_in_events(order_id);

CREATE INDEX IF NOT EXISTS idx_gcr_opt_in_events_created_at
  ON gcr_opt_in_events(created_at);

CREATE INDEX IF NOT EXISTS idx_gcr_opt_in_events_status
  ON gcr_opt_in_events(status);