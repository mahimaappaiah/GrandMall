-- ============================================================================
-- THE GRAND MALL — SECURE RLS POLICIES FOR CUSTOMER JOURNEY TABLE
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Enables RLS on public.customer_journey table.
-- 2. SELECT Policy: Authenticated customers view their own journey records;
--    Admins and Managers view all customer journey records.
-- 3. INSERT Policy: Authenticated customers insert own records (user_id = auth.uid()),
--    Guest walk-ins can insert records with user_id = NULL,
--    and Admins/Managers can insert on behalf of any customer.
-- 4. UPDATE Policy: Modification restricted to Admins/Managers only.
-- ============================================================================

BEGIN;

ALTER TABLE IF EXISTS public.customer_journey ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- 1. SELECT Policy (Customers view own; Admins view all)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_journey' AND policyname = 'customer_journey_select_policy'
    ) THEN
        CREATE POLICY "customer_journey_select_policy" ON public.customer_journey
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

    -- 2. INSERT Policy (Customers insert own; Guests insert user_id = NULL; Admins insert any)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_journey' AND policyname = 'customer_journey_insert_policy'
    ) THEN
        CREATE POLICY "customer_journey_insert_policy" ON public.customer_journey
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

    -- 3. ADMIN UPDATE Policy (Only Admins can modify customer journey records)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_journey' AND policyname = 'customer_journey_admin_update_policy'
    ) THEN
        CREATE POLICY "customer_journey_admin_update_policy" ON public.customer_journey
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
