-- ============================================================================
-- THE GRAND MALL — CUSTOMER JOURNEY / ACTIVITY VIEW & POLICIES
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Creates a unified public.customer_journey view over store_visits, profiles, and brands.
-- 2. Grants SELECT on the view to authenticated and anon roles.
-- ============================================================================

BEGIN;

CREATE OR REPLACE VIEW public.customer_journey AS
SELECT 
    sv.id,
    sv.user_id,
    sv.brand_id,
    sv.duration_seconds,
    sv.created_at,
    p.full_name AS customer_name,
    p.phone AS customer_phone,
    p.email AS customer_email,
    b.name AS brand_name,
    b.category AS brand_category,
    b.floor AS brand_floor,
    b.zone AS brand_zone
FROM public.store_visits sv
LEFT JOIN public.profiles p ON p.id = sv.user_id
LEFT JOIN public.brands b ON b.id = sv.brand_id;

GRANT SELECT ON public.customer_journey TO authenticated, anon;

COMMIT;
