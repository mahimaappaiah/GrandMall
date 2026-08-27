-- ============================================================================
-- THE GRAND MALL — CUSTOMER NAME VISIBILITY MIGRATION
-- ============================================================================
-- Purpose: Add nullable 'customer_name' column to tables currently lacking direct
--          name visibility in Supabase Table Editor and backfill existing rows
--          from public.profiles.
-- ============================================================================

BEGIN;

-- 1. ADD COLUMN IF NOT EXISTS to store_visits
ALTER TABLE IF EXISTS public.store_visits 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 2. ADD COLUMN IF NOT EXISTS to customer_journey
ALTER TABLE IF EXISTS public.customer_journey 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 3. ADD COLUMN IF NOT EXISTS to coupon_redemptions
ALTER TABLE IF EXISTS public.coupon_redemptions 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 4. ADD COLUMN IF NOT EXISTS to activity_logs
ALTER TABLE IF EXISTS public.activity_logs 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 5. Backfill historical records in store_visits from public.profiles
UPDATE public.store_visits sv
SET customer_name = p.full_name
FROM public.profiles p
WHERE sv.user_id = p.id 
  AND sv.customer_name IS NULL 
  AND p.full_name IS NOT NULL;

-- 6. Backfill historical records in customer_journey from public.profiles
UPDATE public.customer_journey cj
SET customer_name = p.full_name
FROM public.profiles p
WHERE cj.user_id = p.id 
  AND cj.customer_name IS NULL 
  AND p.full_name IS NOT NULL;

-- 7. Backfill historical records in coupon_redemptions from public.profiles
UPDATE public.coupon_redemptions cr
SET customer_name = p.full_name
FROM public.profiles p
WHERE cr.user_id = p.id 
  AND cr.customer_name IS NULL 
  AND p.full_name IS NOT NULL;

-- 8. Backfill historical records in activity_logs from public.profiles
UPDATE public.activity_logs al
SET customer_name = p.full_name
FROM public.profiles p
WHERE al.user_id = p.id 
  AND al.customer_name IS NULL 
  AND p.full_name IS NOT NULL;

COMMIT;
