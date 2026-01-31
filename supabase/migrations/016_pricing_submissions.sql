-- =============================================================================
-- Pricing Submissions Table
-- =============================================================================
-- This migration creates a table to store pricing plan submission requests
-- from the landing page. These are leads that need to be followed up by admins.
-- =============================================================================

-- Create pricing_submissions table
CREATE TABLE IF NOT EXISTS public.pricing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company_name VARCHAR(255),
  message TEXT,

  -- Plan Information
  plan_key VARCHAR(20) NOT NULL,  -- Database tier key: free, basic, regular, pro
  plan_name VARCHAR(50) NOT NULL,  -- Display name: Free, Basic, Regular, Pro
  plan_price INTEGER NOT NULL DEFAULT 0,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',  -- pending, contacted, converted, rejected
  notes TEXT,  -- Admin notes for follow-up

  -- Tracking
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id),
  converted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Source tracking
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_email ON public.pricing_submissions(email);
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_status ON public.pricing_submissions(status);
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_plan_key ON public.pricing_submissions(plan_key);
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_plan ON public.pricing_submissions(plan_name);
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_created ON public.pricing_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE public.pricing_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only super admins can access this table
DROP POLICY IF EXISTS "Super admins can manage pricing submissions" ON public.pricing_submissions;
CREATE POLICY "Super admins can manage pricing submissions" ON public.pricing_submissions
  FOR ALL
  USING (public.is_super_admin());

-- Allow inserts from API (service role)
DROP POLICY IF EXISTS "Service role can insert pricing submissions" ON public.pricing_submissions;
CREATE POLICY "Service role can insert pricing submissions" ON public.pricing_submissions
  FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_pricing_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS pricing_submissions_updated_at ON public.pricing_submissions;
CREATE TRIGGER pricing_submissions_updated_at
  BEFORE UPDATE ON public.pricing_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pricing_submissions_updated_at();

-- =============================================================================
-- View for admin dashboard
-- =============================================================================
CREATE OR REPLACE VIEW public.pricing_submissions_summary AS
SELECT
  ps.*,
  u.email as contacted_by_email
FROM public.pricing_submissions ps
LEFT JOIN auth.users u ON ps.contacted_by = u.id
ORDER BY ps.created_at DESC;

-- Grant access to the view for authenticated users (RLS will filter)
GRANT SELECT ON public.pricing_submissions_summary TO authenticated;
