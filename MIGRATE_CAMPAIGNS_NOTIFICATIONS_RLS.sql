-- ============================================================================
-- THE GRAND MALL — CAMPAIGNS & NOTIFICATIONS SUPABASE MIGRATION & RLS
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- Security & Access Model:
-- 1. Helper function: SECURITY DEFINER 'is_admin_or_manager()' prevents RLS recursion.
-- 2. Campaigns Table:
--    - SELECT: Open read access for dashboard / portal promotion visibility.
--    - INSERT, UPDATE, DELETE: Strictly restricted to authorized Admin / Manager roles.
-- 3. Notifications Table:
--    - SELECT: Restricted to authenticated users and Admins.
--    - INSERT, UPDATE, DELETE: Strictly restricted to authorized Admin / Manager roles.
-- 4. Initial Seed Data:
--    - Flagship marketing campaigns and system operational alerts.
-- ============================================================================

BEGIN;

-- 1. Helper function for admin check (reused across all tables safely)
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

-- 2. Ensure public.campaigns table structure
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT,
    name TEXT,
    title TEXT,
    description TEXT,
    campaign_type TEXT DEFAULT 'Omnichannel Mall Fest',
    status TEXT DEFAULT 'Active',
    is_active BOOLEAN DEFAULT true,
    reach BIGINT DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    qr_scans BIGINT DEFAULT 0,
    coupons_redeemed BIGINT DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0,
    roi NUMERIC DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure public.notifications table structure
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT,
    notification_type TEXT DEFAULT 'Footfall',
    severity TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Dynamically drop all legacy policies on campaigns and notifications
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'campaigns') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaigns;', pol.policyname);
    END LOOP;
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications;', pol.policyname);
    END LOOP;
END $$;

-- 5. Strict RLS Policies for public.campaigns
-- Read access for dashboard view
CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT USING (true);

-- Only Admin / Manager can create campaigns
CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT WITH CHECK (
    public.is_admin_or_manager()
);

-- Only Admin / Manager can update campaigns
CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE USING (
    public.is_admin_or_manager()
);

-- Only Admin / Manager can delete campaigns
CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE USING (
    public.is_admin_or_manager()
);

-- 6. Strict RLS Policies for public.notifications
-- Authenticated users and Admins can read notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
    (auth.uid() IS NOT NULL) OR public.is_admin_or_manager()
);

-- Only Admin / Manager can create system notifications
CREATE POLICY "notifications_insert_policy" ON public.notifications
FOR INSERT WITH CHECK (
    public.is_admin_or_manager()
);

-- Only Admin / Manager can update notification state (mark read / dismiss)
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
    public.is_admin_or_manager()
);

-- Only Admin / Manager can delete notifications
CREATE POLICY "notifications_delete_policy" ON public.notifications
FOR DELETE USING (
    public.is_admin_or_manager()
);

-- 7. Seed Initial Flagship Marketing Campaigns
INSERT INTO public.campaigns (name, title, description, campaign_type, status, is_active, reach, impressions, qr_scans, coupons_redeemed, revenue_generated, roi, start_date, end_date)
VALUES
  ('Summer Mega Shopping Fest 2026', 'Summer Mega Shopping Fest 2026', 'Mall-wide flash promotion with flat 20% off across all flagship fashion & dining stores.', 'Omnichannel Mall Fest', 'Active', true, 48500, 124000, 8400, 2450, 4280000, 380, '2026-08-01', '2026-08-15'),
  ('Monsoon Gourmet Dining Delight', 'Monsoon Gourmet Dining Delight', 'Complimentary artisanal dessert or beverage on minimum spend of Rs. 1,000 at Food Court.', 'Food Court & Dining Push', 'Active', true, 22100, 56000, 4100, 1320, 1850000, 290, '2026-07-25', '2026-08-10'),
  ('Back to School & Tech Expo', 'Back to School & Tech Expo', 'Special student discounts on laptops, electronics, and accessories at Apple & Samsung.', 'Electronics & Kids', 'Active', true, 18900, 42000, 2800, 640, 2950000, 410, '2026-08-01', '2026-08-20'),
  ('Weekend Midnight Blockbuster Drive', 'Weekend Midnight Blockbuster Drive', 'Late night entertainment, IMAX screening combo deals, and cafe perks.', 'Multiplex & Night Dining', 'Completed', false, 15400, 38000, 2200, 810, 1210000, 240, '2026-07-28', '2026-07-31');

-- 8. Seed Initial System Notifications & Operational Alerts
INSERT INTO public.notifications (title, message, notification_type, severity, is_read, location)
VALUES
  ('High Footfall Spike Detected', 'Central Atrium occupancy crossed 85% capacity threshold (1,400 visitors). Security and guest flow managers alerted.', 'Footfall', 'warning', false, 'Central Atrium Ground Floor'),
  ('WiFi AP-3 Gateway Offline Warning', 'Access Point 3 in East Wing Food Court experiencing latency (>120ms). Auto-failover to backup link active.', 'Network', 'warning', false, 'Food Court East Wing Floor 2'),
  ('Zara Flagship Restock Request', 'Summer Linen Shirt SKU-ZR-104 inventory fallen below safety threshold (8 units remaining).', 'Inventory', 'info', false, 'Zara Store Level 1'),
  ('Summer Fest Flash Promotion Triggered', 'Automated push alert sent to 450+ connected captive portal shoppers.', 'Campaign', 'info', true, 'Grand Mall Wi-Fi Network');

COMMIT;
