-- ============================================================================
-- THE GRAND MALL — 33 FLAGSHIP STORES SEED & MIGRATION SCRIPT FOR SUPABASE
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gulrhstrgfjosxhinehv/sql
--
-- This script:
-- 1. Updates RLS policies to allow full read, insert, and update operations on public.brands
-- 2. Preserves existing UUIDs for the 12 existing brands so products and FKs stay intact
-- 3. Inserts/Updates all 33 canonical flagship stores across Ground (16), 1st (13), and 2nd (4) floors.
-- ============================================================================

BEGIN;

-- 1. Ensure RLS policies permit full public and application access on brands, profiles, coupons, and coupon_redemptions
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Brands policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Allow public select on brands'
    ) THEN
        CREATE POLICY "Allow public select on brands" ON public.brands FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Allow public insert on brands'
    ) THEN
        CREATE POLICY "Allow public insert on brands" ON public.brands FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Allow public update on brands'
    ) THEN
        CREATE POLICY "Allow public update on brands" ON public.brands FOR UPDATE USING (true);
    END IF;

    -- Profiles policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public select on profiles'
    ) THEN
        CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public insert on profiles'
    ) THEN
        CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public update on profiles'
    ) THEN
        CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
    END IF;

    -- Coupons policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow public select on coupons'
    ) THEN
        CREATE POLICY "Allow public select on coupons" ON public.coupons FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow public insert on coupons'
    ) THEN
        CREATE POLICY "Allow public insert on coupons" ON public.coupons FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow public update on coupons'
    ) THEN
        CREATE POLICY "Allow public update on coupons" ON public.coupons FOR UPDATE USING (true);
    END IF;

    -- Coupon Redemptions policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'Allow public select on coupon_redemptions'
    ) THEN
        CREATE POLICY "Allow public select on coupon_redemptions" ON public.coupon_redemptions FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'Allow public insert on coupon_redemptions'
    ) THEN
        CREATE POLICY "Allow public insert on coupon_redemptions" ON public.coupon_redemptions FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'Allow public update on coupon_redemptions'
    ) THEN
        CREATE POLICY "Allow public update on coupon_redemptions" ON public.coupon_redemptions FOR UPDATE USING (true);
    END IF;
END $$;

-- 2. Seed / Upsert Preloaded Coupons into public.coupons
INSERT INTO public.coupons (
    id,
    code,
    description,
    discount_type,
    discount_value,
    max_redemptions,
    is_active,
    valid_from,
    valid_until,
    created_at
) VALUES
('70000000-0000-0000-0000-000000000001', 'GRAND50', 'Flat 50% Off Grand Welcome Promo (Orders Above ₹1,000)', 'percentage', 50.00, 5000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000002', 'LUXE1000', 'Flat ₹1,000 Off Luxury Collections (Orders Above ₹3,000)', 'flat', 1000.00, 3000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000003', 'FASHION20', 'Flat 20% Off All Fashion Boutiques (Orders Above ₹2,000)', 'percentage', 20.00, 4000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000004', 'TASTE15', 'Flat 15% Off All Gourmet Dining & Cafes (Orders Above ₹500)', 'percentage', 15.00, 5000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000005', 'GOLD5000', 'Flat ₹5,000 Off Fine Jewelry & Watches (Orders Above ₹50,000)', 'flat', 5000.00, 1000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000006', 'NIKE20', 'Flat 20% Off Footwear & Sportswear at Nike Flagship', 'percentage', 20.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000007', 'ZARA15', 'Flat 15% Off Autumn Menswear & Dresses at Zara Flagship', 'percentage', 15.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000008', 'STARBUCKSBOGO', 'Flat ₹300 Off Artisan Cold Brew & Brunch at Starbucks Reserve', 'flat', 300.00, 2000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000009', 'GUCCI5000', 'Flat ₹5,000 Off Luxury Leather Goods at Gucci Boutique', 'flat', 5000.00, 500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW()),
('70000000-0000-0000-0000-000000000010', 'APPLECARE500', 'Flat ₹500 Off Accessories at Apple Experience Store', 'flat', 500.00, 1000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    max_redemptions = EXCLUDED.max_redemptions,
    is_active = EXCLUDED.is_active,
    valid_until = EXCLUDED.valid_until;

-- 3. Link Brand IDs for Brand-Specific Coupons
UPDATE public.coupons c
SET brand_id = b.id
FROM public.brands b
WHERE (c.code = 'NIKE20' AND b.name = 'Nike Flagship')
   OR (c.code = 'ZARA15' AND b.name = 'Zara Flagship')
   OR (c.code = 'STARBUCKSBOGO' AND b.name = 'Starbucks Reserve')
   OR (c.code = 'GUCCI5000' AND b.name = 'Gucci Boutique')
   OR (c.code = 'APPLECARE500' AND b.name = 'Apple Experience Store');

-- 4. Seed / Upsert All 33 Flagship Stores
INSERT INTO public.brands (
    id,
    name,
    category,
    floor,
    zone,
    manager,
    phone,
    logo_variant,
    logo_url,
    banner_url,
    open_hours,
    rating,
    status,
    visitors_today,
    orders_count,
    reservations_count,
    conversion_rate,
    revenue_today,
    created_at,
    updated_at
) VALUES
-- ============================================================================
-- GROUND FLOOR (16 FLAGSHIP BOUTIQUES & CAFES)
-- ============================================================================
('0e208bad-be40-4575-a229-4a87a3c64972', 'Starbucks Reserve', 'Food', 'Ground Floor', 'East Wing', 'Ananya Sharma', '+91 98555 66778', 'starbucks', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', '08:00 AM - 11:00 PM', 4.8, 'open', 950, 420, 15, 65.0, 480000, NOW(), NOW()),
('0e208bad-be40-4575-a229-4a87a3c64973', 'Häagen-Dazs', 'Food', 'Ground Floor', 'Central Atrium', 'Rahul K.', '+91 98222 11990', 'haagen', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80', '10:00 AM - 11:00 PM', 4.7, 'open', 820, 340, 8, 52.0, 198000, NOW(), NOW()),
('8b8893e8-5d16-4068-ae0a-8b2e707fbf16', 'Gucci Boutique', 'Fashion', 'Ground Floor', 'North Wing', 'Alessandro V.', '+91 98111 22334', 'gucci', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 420, 38, 12, 28.5, 3450000, NOW(), NOW()),
('85d1f262-3cd6-4b9f-9ce3-74eb04b09360', 'Prada Atelier', 'Fashion', 'Ground Floor', 'South Wing', 'Chiara M.', '+91 98222 33445', 'prada', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 380, 32, 10, 26.0, 2890000, NOW(), NOW()),
('5aeeb291-fc4a-444d-a1a2-483f99f7452f', 'Louis Vuitton Maison', 'Accessories', 'Ground Floor', 'Central Atrium', 'Jean-Paul D.', '+91 98333 44556', 'lv', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 5.0, 'open', 610, 45, 18, 31.0, 5200000, NOW(), NOW()),
('5aeeb291-fc4a-444d-a1a2-483f99f74530', 'Hermès Leather Lounge', 'Accessories', 'Ground Floor', 'Central Atrium', 'Claire B.', '+91 98444 55667', 'hermes', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 5.0, 'open', 290, 18, 14, 22.0, 6800000, NOW(), NOW()),
('5aeeb291-fc4a-444d-a1a2-483f99f74531', 'Bottega Veneta', 'Accessories', 'Ground Floor', 'East Wing', 'Matteo R.', '+91 98555 66778', 'bottega', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 310, 24, 6, 24.5, 3100000, NOW(), NOW()),
('542fec8b-af5f-4b77-b5a4-fac63d73f087', 'Tiffany & Co.', 'Accessories', 'Ground Floor', 'North Wing', 'Victoria S.', '+91 98666 77889', 'tiffany', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 340, 28, 9, 25.0, 4250000, NOW(), NOW()),
('0201712d-9ebc-43ea-9682-ed568f3ebcaa', 'Cartier High Jewelry', 'Accessories', 'Ground Floor', 'South Wing', 'Henri L.', '+91 98777 88990', 'cartier', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 5.0, 'open', 260, 16, 11, 21.0, 7500000, NOW(), NOW()),
('0201712d-9ebc-43ea-9682-ed568f3ebcab', 'Bvlgari Haute Joaillerie', 'Accessories', 'Ground Floor', 'Central Atrium', 'Lucia F.', '+91 98888 99001', 'bvlgari', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 280, 19, 7, 23.0, 5900000, NOW(), NOW()),
('0201712d-9ebc-43ea-9682-ed568f3ebcac', 'Tanishq Royal Heritage', 'Accessories', 'Ground Floor', 'West Wing', 'Sanjay Verma', '+91 98999 00112', 'tanishq', 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 520, 65, 12, 34.0, 3800000, NOW(), NOW()),
('0201712d-9ebc-43ea-9682-ed568f3ebcad', 'Malabar Gold & Diamonds', 'Accessories', 'Ground Floor', 'West Wing', 'Faizal K.', '+91 98000 11223', 'malabar', 'https://images.unsplash.com/photo-1611591470452-47520b22a00c?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1611591470452-47520b22a00c?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 490, 58, 9, 32.5, 3400000, NOW(), NOW()),
('0201712d-9ebc-43ea-9682-ed568f3ebcae', 'Tom Ford Eyewear', 'Accessories', 'Ground Floor', 'South Wing', 'Julian T.', '+91 98450 77889', 'tomford', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 350, 42, 5, 27.0, 1850000, NOW(), NOW()),
('6846d3a9-5f4b-4636-b712-86e9fa6ce24d', 'Rolex Boutique', 'Accessories', 'Ground Floor', 'Central Atrium', 'Philippe M.', '+91 98123 45678', 'rolex', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 5.0, 'open', 410, 22, 16, 20.0, 8900000, NOW(), NOW()),
('6846d3a9-5f4b-4636-b712-86e9fa6ce24e', 'Omega Watch Atelier', 'Accessories', 'Ground Floor', 'Central Atrium', 'Markus W.', '+91 98234 56789', 'omega', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 360, 26, 8, 22.5, 4600000, NOW(), NOW()),
('134ace18-25a5-4be9-ba84-37fc15d4b961', 'Apple Experience Store', 'Accessories', 'Ground Floor', 'East Wing', 'Rohan Mehta', '+91 98345 67890', 'apple', 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 1450, 185, 25, 48.0, 7200000, NOW(), NOW()),

-- ============================================================================
-- 1ST FLOOR (13 HIGH-STREET FASHION & ACCESSORIES FLAGSHIPS)
-- ============================================================================
('bca27519-461e-444e-8055-3bd6ad1a9849', 'Nike Flagship', 'Fashion', '1st Floor', 'North Wing', 'Vikram Seth', '+91 98456 78901', 'nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.9, 'open', 1150, 310, 14, 58.0, 2450000, NOW(), NOW()),
('1796067d-cca9-43b2-81c6-7803b840d5ba', 'Zara Flagship', 'Fashion', '1st Floor', 'South Wing', 'Elena Gomez', '+91 98567 89012', 'zara', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 1280, 390, 12, 62.0, 2980000, NOW(), NOW()),
('1796067d-cca9-43b2-81c6-7803b840d5bb', 'U.S. Polo Assn.', 'Fashion', '1st Floor', 'Central Atrium', 'Karthik N.', '+91 98678 90123', 'uspolo', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.7, 'open', 780, 195, 6, 45.0, 1120000, NOW(), NOW()),
('1796067d-cca9-43b2-81c6-7803b840d5bc', 'H&M Flagship', 'Fashion', '1st Floor', 'East Wing', 'Sarah Lindqvist', '+91 98789 01234', 'hm', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.6, 'open', 1050, 320, 8, 54.0, 1680000, NOW(), NOW()),
('1796067d-cca9-43b2-81c6-7803b840d5bd', 'Coach New York', 'Accessories', '1st Floor', 'Central Atrium', 'Amanda H.', '+91 98890 12345', 'coach', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 460, 68, 8, 32.0, 1950000, NOW(), NOW()),
('1796067d-cca9-43b2-81c6-7803b840d5be', 'Swarovski Crystal Pavilion', 'Accessories', '1st Floor', 'East Wing', 'Monika W.', '+91 98901 23456', 'swarovski', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.7, 'open', 390, 54, 4, 29.0, 1250000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50ef', 'Ray-Ban Sunglass Hut', 'Accessories', '1st Floor', 'West Wing', 'Rajesh K.', '+91 98012 34567', 'rayban', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.7, 'open', 580, 92, 5, 36.0, 1420000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f0', 'Sunglass Hut Premier', 'Accessories', '1st Floor', 'Central Atrium', 'Pooja S.', '+91 98123 09876', 'sunglasshut', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.6, 'open', 420, 65, 3, 31.0, 980000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f1', 'Oakley Performance Vision', 'Accessories', '1st Floor', 'North Wing', 'Dave C.', '+91 98234 10987', 'oakley', 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.7, 'open', 370, 48, 2, 28.0, 890000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f2', 'Lenskart Gold Lounge', 'Accessories', '1st Floor', 'East Wing', 'Amit Roy', '+91 98345 21098', 'lenskart', 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.5, 'open', 640, 110, 4, 38.0, 780000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f3', 'TAG Heuer Flagship', 'Accessories', '1st Floor', 'North Wing', 'Christian G.', '+91 98567 43210', 'tagheuer', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 320, 24, 6, 21.0, 3200000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f4', 'Tissot Swiss Watches', 'Accessories', '1st Floor', 'West Wing', 'Felix B.', '+91 98765 11223', 'tissot', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.7, 'open', 290, 21, 5, 24.0, 980000, NOW(), NOW()),
('8a1cfd0b-4f33-44cd-bbf7-2d9c3cca50f5', 'Titan Nebula Gold Watches', 'Accessories', '1st Floor', 'Central Atrium', 'Venkat R.', '+91 98450 66778', 'nebula', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:00 PM', 4.8, 'open', 390, 32, 8, 23.5, 1450000, NOW(), NOW()),

-- ============================================================================
-- 2ND FLOOR (4 GOURMET DINING & ARTISAN BISTROS)
-- ============================================================================
('e9c2f972-d6a5-487a-b08e-9de322aab3cb', 'Din Tai Fung', 'Food', '2nd Floor', 'Dining Hub North', 'Master Chef Chen', '+91 98666 12345', 'dintaifung', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80', '11:00 AM - 11:00 PM', 4.9, 'open', 680, 240, 22, 48.0, 380000, NOW(), NOW()),
('e9c2f972-d6a5-487a-b08e-9de322aab3cc', 'PizzaExpress Gourmet', 'Food', '2nd Floor', 'Food Court South', 'Chef Marco B.', '+91 98777 23456', 'pizzaexpress', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', '11:00 AM - 11:00 PM', 4.7, 'open', 590, 195, 14, 44.0, 290000, NOW(), NOW()),
('e9c2f972-d6a5-487a-b08e-9de322aab3cd', 'Coffee Drama Cafe', 'Food', '2nd Floor', 'Dining Hub North', 'Kavita M.', '+91 98888 34567', 'coffeedrama', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', '09:00 AM - 10:30 PM', 4.6, 'open', 440, 160, 6, 42.0, 145000, NOW(), NOW()),
('e9c2f972-d6a5-487a-b08e-9de322aab3ce', 'Subway Fresh Gourmet', 'Food', '2nd Floor', 'Food Court South', 'Sunil P.', '+91 98999 45678', 'subway', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=200&h=200&q=80', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', '10:00 AM - 10:30 PM', 4.5, 'open', 510, 210, 4, 46.0, 175000, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    floor = EXCLUDED.floor,
    zone = EXCLUDED.zone,
    manager = EXCLUDED.manager,
    phone = EXCLUDED.phone,
    logo_variant = EXCLUDED.logo_variant,
    logo_url = EXCLUDED.logo_url,
    banner_url = EXCLUDED.banner_url,
    open_hours = EXCLUDED.open_hours,
    rating = EXCLUDED.rating,
    status = EXCLUDED.status,
    visitors_today = EXCLUDED.visitors_today,
    orders_count = EXCLUDED.orders_count,
    reservations_count = EXCLUDED.reservations_count,
    conversion_rate = EXCLUDED.conversion_rate,
    revenue_today = EXCLUDED.revenue_today,
    updated_at = NOW();

COMMIT;
