-- Create payout requests table for franchises
CREATE TABLE public.franchise_payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_owner_id UUID NOT NULL REFERENCES franchise_owners(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payout_method TEXT,
  payout_details JSONB DEFAULT '{}',
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payout requests table for affiliates
CREATE TABLE public.affiliate_payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payout_method TEXT,
  payout_details JSONB DEFAULT '{}',
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.franchise_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for franchise payout requests
CREATE POLICY "Franchise owners can view own payout requests"
ON public.franchise_payout_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM franchise_owners fo
  WHERE fo.id = franchise_payout_requests.franchise_owner_id
  AND fo.user_id = auth.uid()
));

CREATE POLICY "Franchise owners can create own payout requests"
ON public.franchise_payout_requests FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM franchise_owners fo
  WHERE fo.id = franchise_payout_requests.franchise_owner_id
  AND fo.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all franchise payout requests"
ON public.franchise_payout_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate payout requests
CREATE POLICY "Affiliates can view own payout requests"
ON public.affiliate_payout_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM affiliates a
  WHERE a.id = affiliate_payout_requests.affiliate_id
  AND a.user_id = auth.uid()
));

CREATE POLICY "Affiliates can create own payout requests"
ON public.affiliate_payout_requests FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM affiliates a
  WHERE a.id = affiliate_payout_requests.affiliate_id
  AND a.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all affiliate payout requests"
ON public.affiliate_payout_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add available_balance_cents columns
ALTER TABLE franchise_owners ADD COLUMN IF NOT EXISTS available_balance_cents BIGINT NOT NULL DEFAULT 0;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS available_balance_cents BIGINT NOT NULL DEFAULT 0;

-- Update earnings functions to add to available balance
CREATE OR REPLACE FUNCTION public.update_franchise_balance_on_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE franchise_owners
  SET available_balance_cents = available_balance_cents + NEW.franchise_amount_cents
  WHERE id = NEW.franchise_owner_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_affiliate_balance_on_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE affiliates
  SET available_balance_cents = available_balance_cents + NEW.affiliate_amount_cents
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_franchise_earning_update_balance ON franchise_earnings;
CREATE TRIGGER on_franchise_earning_update_balance
  AFTER INSERT ON franchise_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_franchise_balance_on_earning();

DROP TRIGGER IF EXISTS on_affiliate_earning_update_balance ON affiliate_earnings;
CREATE TRIGGER on_affiliate_earning_update_balance
  AFTER INSERT ON affiliate_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_balance_on_earning();

-- Deduct balance when payout request is approved
CREATE OR REPLACE FUNCTION public.deduct_balance_on_payout_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    IF TG_TABLE_NAME = 'franchise_payout_requests' THEN
      UPDATE franchise_owners
      SET available_balance_cents = available_balance_cents - NEW.amount_cents
      WHERE id = NEW.franchise_owner_id;
    ELSIF TG_TABLE_NAME = 'affiliate_payout_requests' THEN
      UPDATE affiliates
      SET available_balance_cents = available_balance_cents - NEW.amount_cents
      WHERE id = NEW.affiliate_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_franchise_payout_approved ON franchise_payout_requests;
CREATE TRIGGER on_franchise_payout_approved
  AFTER UPDATE ON franchise_payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION deduct_balance_on_payout_approved();

DROP TRIGGER IF EXISTS on_affiliate_payout_approved ON affiliate_payout_requests;
CREATE TRIGGER on_affiliate_payout_approved
  AFTER UPDATE ON affiliate_payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION deduct_balance_on_payout_approved();