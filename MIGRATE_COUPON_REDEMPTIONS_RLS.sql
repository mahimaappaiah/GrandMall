-- ============================================================================
-- THE GRAND MALL — SECURE RLS POLICIES FOR COUPON REDEMPTIONS
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Enables RLS on public.coupon_redemptions.
-- 2. Allows authenticated customers to view their own redemptions (user_id = auth.uid())
--    and admins to view all redemptions.
-- 3. Allows authenticated customers & guest sessions to insert valid redemption records
--    linked to their checkout order.
-- 4. Prevents unauthorized modification/deletion of past redemption audit records.
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

    -- 2. INSERT Policy (Customers insert own; Guests insert NULL user_id; Admins insert any)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'coupon_redemptions_insert_policy'
    ) THEN
        CREATE POLICY "coupon_redemptions_insert_policy" ON public.coupon_redemptions
        FOR INSERT WITH CHECK (
            (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
            OR (auth.uid() IS NULL AND user_id IS NULL)
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
