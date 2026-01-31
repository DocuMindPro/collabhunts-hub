-- Add price tiers for unbox_review package
INSERT INTO service_price_tiers (service_type, tier_name, min_price_cents, max_price_cents, sort_order, is_enabled)
VALUES 
  ('unbox_review', 'Basic', 5000, 15000, 1, true),
  ('unbox_review', 'Standard', 15000, 30000, 2, true),
  ('unbox_review', 'Premium', 30000, 50000, 3, true);

-- Add price tiers for social_boost package
INSERT INTO service_price_tiers (service_type, tier_name, min_price_cents, max_price_cents, sort_order, is_enabled)
VALUES 
  ('social_boost', 'Standard', 20000, 40000, 1, true),
  ('social_boost', 'Premium', 40000, 70000, 2, true),
  ('social_boost', 'Elite', 70000, 100000, 3, true);

-- Disable legacy service types that are not part of the new package system
UPDATE service_price_tiers 
SET is_enabled = false 
WHERE service_type IN ('brand_activation', 'nightlife', 'private_event', 'content_collab', 'workshop');