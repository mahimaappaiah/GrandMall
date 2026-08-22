-- ============================================================================
-- THE GRAND MALL — SECURE RLS POLICIES FOR CUSTOMER PROFILES TABLE
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Enables RLS on public.profiles table.
-- 2. SELECT Policy: Authenticated customers view their own profile,
--    and Admins/Managers/Authenticated Mall Staff view all profiles.
-- 3. INSERT Policy: Authenticated users can insert their own profile row (auth.uid() = id),
--    and Admins can insert on behalf of any customer.
-- 4. UPDATE Policy: Users can update their own profile (auth.uid() = id),
--    and Admins can update any profile.
-- ============================================================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- 1. SELECT Policy (Customers view own; Admins view all profiles)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy'
    ) THEN
        CREATE POLICY "profiles_select_policy" ON public.profiles
        FOR SELECT USING (
            (auth.uid() IS NOT NULL AND id = auth.uid())
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() 
                      AND p.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;

    -- 2. INSERT Policy (Authenticated user inserts own profile id = auth.uid())
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy'
    ) THEN
        CREATE POLICY "profiles_insert_policy" ON public.profiles
        FOR INSERT WITH CHECK (
            (auth.uid() IS NOT NULL AND id = auth.uid())
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() 
                      AND p.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;

    -- 3. UPDATE Policy (User updates own; Admins update all)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy'
    ) THEN
        CREATE POLICY "profiles_update_policy" ON public.profiles
        FOR UPDATE USING (
            (auth.uid() IS NOT NULL AND id = auth.uid())
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() 
                      AND p.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;
END $$;

COMMIT;
