-- ============================================================================
-- THE GRAND MALL — SEED 40 CANONICAL COUPONS INTO SUPABASE (STRICT BRAND MATCH)
-- ============================================================================
-- Ready for review. Do not execute until approved.
--
-- This script:
-- 1. Sets secure RLS policies for public.coupons (Active select for customers, Admin manage)
-- 2. Inserts/Upserts all 40 valid canonical coupons matching the 33 public.brands
--    (38 store-specific coupons + 2 mall-wide coupons with brand_id = NULL).
-- 3. Strictly EXCLUDES legacy non-existent stores: DOMINOSBOGO, SEPHORA10, PVRCOMBO.
-- ============================================================================

BEGIN;

-- 1. Ensure RLS Policy allows secure reading of active coupons
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_select_active'
    ) THEN
        CREATE POLICY "coupons_select_active" ON public.coupons
        FOR SELECT USING (
            is_active = true
            OR (
                auth.uid() IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() 
                      AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
                )
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_admin_insert'
    ) THEN
        CREATE POLICY "coupons_admin_insert" ON public.coupons
        FOR INSERT WITH CHECK (
            auth.uid() IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                  AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_admin_update'
    ) THEN
        CREATE POLICY "coupons_admin_update" ON public.coupons
        FOR UPDATE USING (
            auth.uid() IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                  AND profiles.role IN ('admin', 'super_admin', 'mall_admin', 'manager')
            )
        );
    END IF;
END $$;

-- 2. Insert / Upsert the 40 Valid Canonical Project Coupons
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
-- Fashion & Sportswear (6)
('70000000-0000-0000-0000-000000000001', 'NIKEVIP15', '15% Off Nike Apparel & Shoes', 'percentage', 15.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000002', 'ZARASUMMER10', '10% Off Zara Summer Collection', 'percentage', 10.00, 2000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000003', 'USPOLOVIP20', '20% Off U.S. Polo Heritage Collection', 'percentage', 20.00, 1600, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000004', 'HMESSENTIALS20', '20% Off H&M Modern Apparel', 'percentage', 20.00, 2100, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000005', 'NIKE20', 'Flat 20% Off Footwear & Sportswear', 'percentage', 20.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000006', 'ZARA15', 'Flat 15% Off Autumn Menswear & Dresses', 'percentage', 15.00, 1000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Luxury & Haute Couture (7)
('70000000-0000-0000-0000-000000000007', 'GUCCIEXCLUSIVE', 'Flat ₹10,000 Off Luxury Orders', 'flat', 10000.00, 500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000008', 'PRADAVIP15', '15% Off Prada Haute Couture', 'percentage', 15.00, 450, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000009', 'LVMAISON10', '10% Off LV Monogram Leather & Bags', 'percentage', 10.00, 400, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000010', 'HERMESLUX10', '10% Off Hermès Leather & Birkin', 'percentage', 10.00, 300, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000011', 'COACHNEWYORK20', '20% Off Coach Leather Bags & Totes', 'percentage', 20.00, 800, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000012', 'BOTTEGAVIP15', '15% Off Intrecciato Woven Leather', 'percentage', 15.00, 420, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000013', 'GUCCI5000', 'Flat ₹5,000 Off Luxury Leather Goods', 'flat', 5000.00, 300, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Food & Dining (7)
('70000000-0000-0000-0000-000000000014', 'STARBUCKSFREE', 'Flat ₹300 Off Starbucks Brunch', 'flat', 300.00, 2200, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000015', 'STARBUCKSBOGO', 'Buy 1 Get 1 Free Cold Brew & Frappuccino', 'flat', 349.00, 2000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000016', 'DINTAIFUNG20', '20% Off Asian Fine Dining', 'percentage', 20.00, 1200, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000017', 'PIZZAEXPRESS15', '15% Off PizzaExpress Gourmet Dining', 'percentage', 15.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000018', 'COFFEEDAY100', 'Flat ₹100 Off Artisanal Coffee & Bakery', 'flat', 100.00, 2500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000019', 'SUBWAYFRESH15', '15% Off Subway Fresh Subs & Combos', 'percentage', 15.00, 3000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000020', 'HAAGEN20', '20% Off Gourmet Ice Cream & Waffles', 'percentage', 20.00, 1800, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Fine Jewelry & Watches (11)
('70000000-0000-0000-0000-000000000021', 'TIFFANYDIAMOND', 'Flat ₹15,000 Off Fine Jewelry', 'flat', 15000.00, 400, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000022', 'CARTIERLUX20', 'Flat ₹20,000 Off Diamond Jewelry', 'flat', 20000.00, 350, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000023', 'BVLGARI25', 'Flat ₹25,000 Off Serpenti & B.zero1', 'flat', 25000.00, 380, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000024', 'SWAROVSKI20', '20% Off Crystal Jewelry & Sets', 'percentage', 20.00, 900, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000025', 'TANISHQGOLD', 'Flat ₹10,000 Off Kundan & 22k Gold', 'flat', 10000.00, 600, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000026', 'MALABARVIP', 'Flat ₹12,000 Off Solitaire Diamonds', 'flat', 12000.00, 500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000027', 'ROLEX5000', 'Flat ₹5,000 Off Luxury Timepieces', 'flat', 5000.00, 250, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000028', 'OMEGACHRONO', 'Flat ₹15,000 Off Speedmaster & Seamaster', 'flat', 15000.00, 300, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000029', 'TAGHEUERVIP', 'Flat ₹10,000 Off Carrera Chronographs', 'flat', 10000.00, 350, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000030', 'TISSOTSWISS', '15% Off Tissot PRX Powermatic 80', 'percentage', 15.00, 950, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000031', 'NEBULA18K', 'Flat ₹20,000 Off 18k Solid Gold Watches', 'flat', 20000.00, 300, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Eyewear & Optics (5)
('70000000-0000-0000-0000-000000000032', 'RAYBAN20', '20% Off Designer Eyewear', 'percentage', 20.00, 1100, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000033', 'SUNGLASSHUT15', '15% Off Versace & Designer Shades', 'percentage', 15.00, 850, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000034', 'OAKLEYSPORT20', '20% Off Polarized & Prizm Vision', 'percentage', 20.00, 750, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000035', 'TOMFORDVIP', 'Flat ₹5,000 Off Luxury Eyewear', 'flat', 5000.00, 400, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000036', 'LENSKART500', 'Flat ₹500 Off John Jacobs Titanium', 'flat', 500.00, 1500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Electronics & Tech (2)
('70000000-0000-0000-0000-000000000037', 'APPLEVIP5', 'Flat ₹5,000 Off Apple Watch & Vision', 'flat', 5000.00, 420, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000038', 'APPLECARE500', 'Flat ₹500 Off AppleCare Protection Plan', 'flat', 500.00, 500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),

-- Mall-Wide Concierge & VIP Offers (2) - Applicable across all stores
('70000000-0000-0000-0000-000000000039', 'GRANDMALL20', '20% Off Concierge First Order', 'percentage', 20.00, 3000, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW()),
('70000000-0000-0000-0000-000000000040', 'MALLVIP25', 'Flat 25% Off VIP Mall Shopping', 'percentage', 25.00, 2500, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    max_redemptions = EXCLUDED.max_redemptions,
    is_active = EXCLUDED.is_active,
    valid_until = EXCLUDED.valid_until;

-- 3. Link Brand IDs for Brand-Specific Coupons (38 Store Coupons)
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code IN ('NIKEVIP15', 'NIKE20') AND b.name = 'Nike Flagship';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code IN ('ZARASUMMER10', 'ZARA15') AND b.name = 'Zara Flagship';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'USPOLOVIP20' AND b.name = 'U.S. Polo Assn.';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'HMESSENTIALS20' AND b.name = 'H&M Flagship';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code IN ('GUCCIEXCLUSIVE', 'GUCCI5000') AND b.name = 'Gucci Boutique';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'PRADAVIP15' AND b.name = 'Prada Atelier';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'LVMAISON10' AND b.name = 'Louis Vuitton Maison';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'HERMESLUX10' AND b.name = 'Hermès Leather Lounge';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'COACHNEWYORK20' AND b.name = 'Coach New York';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'BOTTEGAVIP15' AND b.name = 'Bottega Veneta';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code IN ('STARBUCKSFREE', 'STARBUCKSBOGO') AND b.name = 'Starbucks Reserve';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'DINTAIFUNG20' AND b.name = 'Din Tai Fung';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'PIZZAEXPRESS15' AND b.name = 'PizzaExpress Gourmet';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'COFFEEDAY100' AND b.name = 'Coffee Drama Cafe';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'SUBWAYFRESH15' AND b.name = 'Subway Fresh Gourmet';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'HAAGEN20' AND b.name = 'Häagen-Dazs';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'TIFFANYDIAMOND' AND b.name = 'Tiffany & Co.';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'CARTIERLUX20' AND b.name = 'Cartier High Jewelry';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'BVLGARI25' AND b.name = 'Bvlgari Haute Joaillerie';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'SWAROVSKI20' AND b.name = 'Swarovski Crystal Pavilion';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'TANISHQGOLD' AND b.name = 'Tanishq Royal Heritage';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'MALABARVIP' AND b.name = 'Malabar Gold & Diamonds';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'ROLEX5000' AND b.name = 'Rolex Boutique';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'OMEGACHRONO' AND b.name = 'Omega Watch Atelier';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'TAGHEUERVIP' AND b.name = 'TAG Heuer Flagship';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'TISSOTSWISS' AND b.name = 'Tissot Swiss Watches';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'NEBULA18K' AND b.name = 'Titan Nebula Gold Watches';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'RAYBAN20' AND b.name = 'Ray-Ban Sunglass Hut';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'SUNGLASSHUT15' AND b.name = 'Sunglass Hut Premier';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'OAKLEYSPORT20' AND b.name = 'Oakley Performance Vision';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'TOMFORDVIP' AND b.name = 'Tom Ford Eyewear';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code = 'LENSKART500' AND b.name = 'Lenskart Gold Lounge';
UPDATE public.coupons c SET brand_id = b.id FROM public.brands b WHERE c.code IN ('APPLEVIP5', 'APPLECARE500') AND b.name = 'Apple Experience Store';

-- 4. Ensure Mall-Wide Coupons have brand_id explicitly set to NULL
UPDATE public.coupons SET brand_id = NULL WHERE code IN ('GRANDMALL20', 'MALLVIP25');

COMMIT;
