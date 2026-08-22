-- ============================================================================
-- THE GRAND MALL — SECURE NON-RECURSIVE RLS POLICIES FOR PROFILES
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- Security & Access Model:
-- 1. Helper function: SECURITY DEFINER 'is_admin_or_manager()' prevents RLS recursion.
-- 2. SELECT Policy:
--    - Customers can SELECT ONLY their own profile (id = auth.uid()).
--    - Authorized Admins/Managers can SELECT ALL profiles.
--    - Anonymous / unauthenticated access is strictly blocked (returns 0 rows).
-- 3. INSERT Policy:
--    - Authenticated users can insert ONLY their own profile (id = auth.uid()).
--    - Admins/Managers can insert profiles on behalf of any customer.
--    - Anonymous unauthenticated inserts are strictly blocked.
-- 4. UPDATE Policy:
--    - Customers can update ONLY their own profile (id = auth.uid()).
--    - Admins/Managers can update any profile.
-- 5. No DELETE policy is created (profiles cannot be deleted).
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

-- 2. Enable Row-Level Security on public.profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Clean up any existing or conflicting legacy policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 4. SELECT Policy: Customer reads ONLY own row (id = auth.uid()); Admin/Manager reads ALL
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR public.is_admin_or_manager()
);

-- 5. INSERT Policy: Authenticated user inserts ONLY own row (id = auth.uid()); Admin/Manager inserts any
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR public.is_admin_or_manager()
);

-- 6. UPDATE Policy: Customer updates ONLY own row (id = auth.uid()); Admin/Manager updates any
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR public.is_admin_or_manager()
);

COMMIT;
