-- Services registered on the marketplace
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'summarization', 'code-review', 'image-analysis', 
    'data-lookup', 'translation', 'verification', 'other'
  )),
  endpoint_url TEXT NOT NULL,
  price_sats INTEGER NOT NULL CHECK (price_sats > 0),
  provider_id TEXT NOT NULL,          -- Alby wallet address or pubkey
  provider_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reputation scores per service
CREATE TABLE reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  total_sats_earned INTEGER DEFAULT 0,
  score NUMERIC(4,2) DEFAULT 5.00,    -- 0.00 to 10.00
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Payment events (from Person A's webhook)
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  payment_hash TEXT UNIQUE NOT NULL,
  amount_sats INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  buyer_id TEXT,                       -- optional: agent or human identifier
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- Trigger: auto-create reputation row when service is registered
CREATE OR REPLACE FUNCTION create_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO reputation (service_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_service_created
  AFTER INSERT ON services
  FOR EACH ROW EXECUTE FUNCTION create_reputation();

-- Trigger: update reputation when payment confirmed
CREATE OR REPLACE FUNCTION update_reputation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE reputation
    SET
      total_requests = total_requests + 1,
      successful_requests = successful_requests + 1,
      total_sats_earned = total_sats_earned + NEW.amount_sats,
      score = LEAST(10.0, score + 0.1),  -- small increment per success, max 10
      last_updated = now()
    WHERE service_id = NEW.service_id;
  ELSIF NEW.status = 'failed' AND OLD.status = 'pending' THEN
    UPDATE reputation
    SET
      total_requests = total_requests + 1,
      score = GREATEST(0.0, score - 0.5),  -- bigger penalty for failure
      last_updated = now()
    WHERE service_id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_status_change
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_reputation();

-- Indexes for fast queries
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_payments_hash ON payments(payment_hash);
CREATE INDEX idx_reputation_score ON reputation(score DESC);

-- Enable Row Level Security (allow public reads, authenticated writes)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active services"
  ON services FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read reputation"
  ON reputation FOR SELECT USING (true);

CREATE POLICY "Service role has full access to payments"
  ON payments FOR ALL USING (true);

CREATE POLICY "Service role can insert services"
  ON services FOR INSERT WITH CHECK (true);

CREATE POLICY "All" ON services FOR ALL USING (true);
