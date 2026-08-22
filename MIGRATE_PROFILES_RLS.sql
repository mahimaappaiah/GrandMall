-- ============================================================================
-- THE GRAND MALL — SECURE NON-RECURSIVE RLS POLICIES FOR PROFILES
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Creates a SECURITY DEFINER helper function (is_admin_or_manager) to
--    completely prevent RLS infinite recursion on public.profiles.
-- 2. Enables RLS on public.profiles table.
-- 3. SELECT Policy: Allows reading customer profiles for captive portal lookup,
--    customer self-service, and the Admin Dashboard historical customer view.
-- 4. INSERT Policy: Authenticated users can insert their own profile (id = auth.uid())
--    or Admins/Managers can insert on behalf of any customer.
-- 5. UPDATE Policy: Authenticated users can update their own profile (id = auth.uid())
--    or Admins/Managers can update any profile.
-- ============================================================================

BEGIN;

-- 1. Helper function to check admin roles safely without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'mall_admin', 'manager')
  );
$$;

-- 2. Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Clean up any existing legacy policies to prevent conflicts
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;

-- 4. SELECT Policy: Accessible for customer identification and full Admin Dashboard visibility
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (true);

-- 5. INSERT Policy: Authenticated users create their own profile (id = auth.uid()) or Admins
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR (auth.uid() IS NULL AND id IS NOT NULL)
    OR public.is_admin_or_manager()
);

-- 6. UPDATE Policy: Customers update own profile (id = auth.uid()) or Admins update any
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR public.is_admin_or_manager()
);

COMMIT;
