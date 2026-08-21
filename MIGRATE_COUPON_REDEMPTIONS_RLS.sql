-- ============================================================================
-- THE GRAND MALL — SECURE RLS POLICIES FOR COUPON REDEMPTIONS
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Enables RLS on public.coupon_redemptions.
-- 2. SELECT Policy: Customers view own redemptions (user_id = auth.uid()); Admins view all.
-- 3. INSERT Policy: Customers must be authenticated and can ONLY insert where user_id = auth.uid().
--    Admin/Manager roles can insert on behalf of any customer.
-- 4. UPDATE Policy: Modification restricted to Admins/Managers only.
-- ============================================================================

BEGIN;

ALTER TABLE IF EXISTS public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- 1. SELECT Policy (Customers view own; Admins view all)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'coupon_redemptions_select_policy'
    ) THEN
        CREATE POLICY "coupon_redemptions_select_policy" ON public.coupon_redemptions
        FOR SELECT USING (
            (auth.uid() IS NOT NULL AND user_id = auth.uid())
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() 
                      AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;

    -- 2. INSERT Policy (Strictly authenticated: Customers insert only where user_id = auth.uid(); Admins insert on behalf of any customer)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'coupon_redemptions_insert_policy'
    ) THEN
        CREATE POLICY "coupon_redemptions_insert_policy" ON public.coupon_redemptions
        FOR INSERT WITH CHECK (
            (auth.uid() IS NOT NULL AND user_id = auth.uid())
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() 
                      AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;

    -- 3. ADMIN UPDATE Policy (Only Admins can modify redemption records)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'coupon_redemptions_admin_update_policy'
    ) THEN
        CREATE POLICY "coupon_redemptions_admin_update_policy" ON public.coupon_redemptions
        FOR UPDATE USING (
            auth.uid() IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                  AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
            )
        );
    END IF;
END $$;

COMMIT;
