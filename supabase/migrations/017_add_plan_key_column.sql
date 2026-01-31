-- =============================================================================
-- Add plan_key column to pricing_submissions
-- =============================================================================
-- This migration adds the plan_key column that was missing from the initial
-- pricing_submissions table creation.
-- =============================================================================

-- Add plan_key column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pricing_submissions'
    AND column_name = 'plan_key'
  ) THEN
    ALTER TABLE public.pricing_submissions
    ADD COLUMN plan_key VARCHAR(20);

    -- Update existing rows to have plan_key based on plan_name
    UPDATE public.pricing_submissions
    SET plan_key = LOWER(plan_name)
    WHERE plan_key IS NULL;

    -- Make it NOT NULL after populating
    ALTER TABLE public.pricing_submissions
    ALTER COLUMN plan_key SET NOT NULL;

    -- Add comment
    COMMENT ON COLUMN public.pricing_submissions.plan_key IS 'Database tier key: free, basic, regular, pro';
  END IF;
END $$;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_pricing_submissions_plan_key ON public.pricing_submissions(plan_key);
