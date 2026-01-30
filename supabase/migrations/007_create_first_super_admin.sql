-- =============================================================================
-- Create First Super Admin
-- =============================================================================
-- This migration sets up the first super admin user.
-- Run this AFTER the user has registered through the normal auth flow.
--
-- IMPORTANT: Replace 'admin@yourcompany.com' with the actual email address
-- of the user you want to make a super admin.
-- =============================================================================

-- Option 1: Set super admin by email
-- UPDATE public.user_profiles
-- SET role = 'super_admin'
-- WHERE email = 'admin@yourcompany.com';

-- Option 2: Set super admin by user_id (from auth.users)
-- UPDATE public.user_profiles
-- SET role = 'super_admin'
-- WHERE user_id = 'your-user-uuid-here';

-- Option 3: Make the first registered user a super admin (if no super admin exists)
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM public.user_profiles
  ORDER BY created_at ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE role = 'super_admin'
);

-- Verify super admin was created
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_profiles WHERE role = 'super_admin';
  IF admin_count = 0 THEN
    RAISE NOTICE 'No super admin found. Please register a user first, then run the UPDATE statement manually.';
  ELSE
    RAISE NOTICE 'Super admin configured successfully. Count: %', admin_count;
  END IF;
END $$;
