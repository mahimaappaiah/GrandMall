-- ============================================================================
-- AXIONIX MALL ADMIN DASHBOARD — VALIDATED & COHERENT SUPABASE SEED SQL
-- ============================================================================
-- Description : 100% Deterministic, mathematically coherent, idempotent SQL seed.
-- Architecture: Strictly follows verified schema dependencies with zero FK violations.
-- Tables Seeded: users (25), wifi_sessions (18), store_visits (28), orders (22),
--                order_items (31), reservations (10), coupons (8),
--                coupon_redemptions (12), campaigns (8), notifications (18),
--                activity_logs (28), telemetry_events (25).
-- Updates     : public.mall_dashboard_metrics and public.brands metrics strictly
--               computed from the seeded dataset with zero artificial benchmarks.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (25 Mall Guests / Customers)
-- ----------------------------------------------------------------------------
INSERT INTO public.users (
    id,
    name,
    phone,
    email,
    mac_address,
    status,
    loyalty_tier,
    created_at,
    updated_at
) VALUES
('10000000-0000-0000-0000-000000000001', 'Aarav Sharma', '+91 98201 12345', 'aarav.sharma@example.com', 'A4:C3:F0:8A:12:01', 'active', 'Platinum', NOW() - INTERVAL '250 minutes', NOW()),
('10000000-0000-0000-0000-000000000002', 'Ananya Iyer', '+91 98450 23456', 'ananya.iyer@example.com', 'B2:D4:E1:9B:23:02', 'active', 'Gold', NOW() - INTERVAL '240 minutes', NOW()),
('10000000-0000-0000-0000-000000000003', 'Rohan Verma', '+91 98110 34567', 'rohan.verma@example.com', 'C6:E5:A2:8C:34:03', 'active', 'Silver', NOW() - INTERVAL '230 minutes', NOW()),
('10000000-0000-0000-0000-000000000004', 'Pooja Patel', '+91 98790 45678', 'pooja.patel@example.com', 'D8:F6:B3:7D:45:04', 'active', 'Bronze', NOW() - INTERVAL '220 minutes', NOW()),
('10000000-0000-0000-0000-000000000005', 'Vikram Malhotra', '+91 98210 56789', 'vikram.malhotra@example.com', 'E1:A7:C4:6E:56:05', 'active', 'Platinum', NOW() - INTERVAL '210 minutes', NOW()),
('10000000-0000-0000-0000-000000000006', 'Sneha Reddy', '+91 98490 67890', 'sneha.reddy@example.com', 'F3:B8:D5:5F:67:06', 'active', 'Gold', NOW() - INTERVAL '200 minutes', NOW()),
('10000000-0000-0000-0000-000000000007', 'Arjun Nair', '+91 98470 78901', 'arjun.nair@example.com', '12:C9:E6:4A:78:07', 'active', 'Silver', NOW() - INTERVAL '190 minutes', NOW()),
('10000000-0000-0000-0000-000000000008', 'Meera Joshi', '+91 98220 89012', 'meera.joshi@example.com', '24:DA:F7:3B:89:08', 'active', 'Bronze', NOW() - INTERVAL '180 minutes', NOW()),
('10000000-0000-0000-0000-000000000009', 'Rahul Sengupta', '+91 98300 90123', 'rahul.sengupta@example.com', '36:EB:08:2C:90:09', 'active', 'Platinum', NOW() - INTERVAL '170 minutes', NOW()),
('10000000-0000-0000-0000-000000000010', 'Kavita Rao', '+91 98800 01234', 'kavita.rao@example.com', '48:FC:19:1D:01:10', 'active', 'Gold', NOW() - INTERVAL '160 minutes', NOW()),
('10000000-0000-0000-0000-000000000011', 'Aditya Kapoor', '+91 98100 12346', 'aditya.kapoor@example.com', '5A:0D:2A:0E:12:11', 'active', 'Silver', NOW() - INTERVAL '150 minutes', NOW()),
('10000000-0000-0000-0000-000000000012', 'Ishita Mukherjee', '+91 98310 23457', 'ishita.mukherjee@example.com', '6C:1E:3B:FF:23:12', 'active', 'Bronze', NOW() - INTERVAL '140 minutes', NOW()),
('10000000-0000-0000-0000-000000000013', 'Siddharth Menon', '+91 98460 34568', 'siddharth.menon@example.com', '7E:2F:4C:EE:34:13', 'active', 'Gold', NOW() - INTERVAL '130 minutes', NOW()),
('10000000-0000-0000-0000-000000000014', 'Tanvi Choudhury', '+91 98600 45679', 'tanvi.choudhury@example.com', '80:3A:5D:DD:45:14', 'active', 'Bronze', NOW() - INTERVAL '120 minutes', NOW()),
('10000000-0000-0000-0000-000000000015', 'Varun Deshmukh', '+91 98230 56780', 'varun.deshmukh@example.com', '92:4B:6E:CC:56:15', 'active', 'Platinum', NOW() - INTERVAL '110 minutes', NOW()),
('10000000-0000-0000-0000-000000000016', 'Neha Bhatt', '+91 98250 67891', 'neha.bhatt@example.com', 'A4:5C:7F:BB:67:16', 'active', 'Silver', NOW() - INTERVAL '100 minutes', NOW()),
('10000000-0000-0000-0000-000000000017', 'Karan Mehra', '+91 98180 78902', 'karan.mehra@example.com', 'B6:6D:80:AA:78:17', 'active', 'Gold', NOW() - INTERVAL '90 minutes', NOW()),
('10000000-0000-0000-0000-000000000018', 'Rhea Pillai', '+91 98480 89013', 'rhea.pillai@example.com', 'C8:7E:91:99:89:18', 'active', 'Bronze', NOW() - INTERVAL '80 minutes', NOW()),
('10000000-0000-0000-0000-000000000019', 'Gaurav Nanda', '+91 98190 90124', 'gaurav.nanda@example.com', 'DA:8F:A2:88:90:19', 'active', 'Platinum', NOW() - INTERVAL '70 minutes', NOW()),
('10000000-0000-0000-0000-000000000020', 'Divya Saxena', '+91 98101 01235', 'divya.saxena@example.com', 'EC:90:B3:77:01:20', 'active', 'Silver', NOW() - INTERVAL '60 minutes', NOW()),
('10000000-0000-0000-0000-000000000021', 'Akash Singhania', '+91 98202 12347', 'akash.singhania@example.com', 'FE:A1:C4:66:12:21', 'active', 'Gold', NOW() - INTERVAL '50 minutes', NOW()),
('10000000-0000-0000-0000-000000000022', 'Swati Trivedi', '+91 98791 23458', 'swati.trivedi@example.com', '10:B2:D5:55:23:22', 'active', 'Bronze', NOW() - INTERVAL '40 minutes', NOW()),
('10000000-0000-0000-0000-000000000023', 'Harsh Vardhan', '+91 98111 34569', 'harsh.vardhan@example.com', '22:C3:E6:44:34:23', 'active', 'Silver', NOW() - INTERVAL '30 minutes', NOW()),
('10000000-0000-0000-0000-000000000024', 'Anushka Das', '+91 98301 45670', 'anushka.das@example.com', '34:D4:F7:33:45:24', 'active', 'Gold', NOW() - INTERVAL '20 minutes', NOW()),
('10000000-0000-0000-0000-000000000025', 'Nikhil Agarwal', '+91 98451 56781', 'nikhil.agarwal@example.com', '46:E5:08:22:56:25', 'active', 'Platinum', NOW() - INTERVAL '10 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SEED WIFI SESSIONS (18 Sessions: 13 Active + 5 Completed)
-- ----------------------------------------------------------------------------
INSERT INTO public.wifi_sessions (
    id,
    user_id,
    mac_address,
    ip_address,
    is_active,
    connected_at,
    disconnected_at
) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'A4:C3:F0:8A:12:01', '192.168.10.101', true, NOW() - INTERVAL '3 hours 50 minutes', NULL),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'B2:D4:E1:9B:23:02', '192.168.10.102', true, NOW() - INTERVAL '3 hours 30 minutes', NULL),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'C6:E5:A2:8C:34:03', '192.168.10.103', false, NOW() - INTERVAL '3 hours 20 minutes', NOW() - INTERVAL '45 minutes'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'D8:F6:B3:7D:45:04', '192.168.10.104', true, NOW() - INTERVAL '3 hours 5 minutes', NULL),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'E1:A7:C4:6E:56:05', '192.168.10.105', true, NOW() - INTERVAL '2 hours 50 minutes', NULL),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'F3:B8:D5:5F:67:06', '192.168.10.106', false, NOW() - INTERVAL '2 hours 40 minutes', NOW() - INTERVAL '20 minutes'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', '12:C9:E6:4A:78:07', '192.168.10.107', true, NOW() - INTERVAL '2 hours 20 minutes', NULL),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', '24:DA:F7:3B:89:08', '192.168.10.108', false, NOW() - INTERVAL '2 hours 10 minutes', NOW() - INTERVAL '15 minutes'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', '36:EB:08:2C:90:09', '192.168.10.109', true, NOW() - INTERVAL '1 hour 55 minutes', NULL),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', '48:FC:19:1D:01:10', '192.168.10.110', true, NOW() - INTERVAL '1 hour 45 minutes', NULL),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '5A:0D:2A:0E:12:11', '192.168.10.111', false, NOW() - INTERVAL '1 hour 35 minutes', NOW() - INTERVAL '10 minutes'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', '6C:1E:3B:FF:23:12', '192.168.10.112', true, NOW() - INTERVAL '1 hour 25 minutes', NULL),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', '7E:2F:4C:EE:34:13', '192.168.10.113', true, NOW() - INTERVAL '1 hour 15 minutes', NULL),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', '80:3A:5D:DD:45:14', '192.168.10.114', false, NOW() - INTERVAL '1 hour 5 minutes', NOW() - INTERVAL '5 minutes'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', '92:4B:6E:CC:56:15', '192.168.10.115', true, NOW() - INTERVAL '55 minutes', NULL),
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'A4:5C:7F:BB:67:16', '192.168.10.116', true, NOW() - INTERVAL '45 minutes', NULL),
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'B6:6D:80:AA:78:17', '192.168.10.117', true, NOW() - INTERVAL '35 minutes', NULL),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'C8:7E:91:99:89:18', '192.168.10.118', true, NOW() - INTERVAL '25 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. SEED STORE VISITS (28 Visits linking Users to Brands)
-- ----------------------------------------------------------------------------
INSERT INTO public.store_visits (
    id,
    user_id,
    brand_id,
    duration_seconds,
    created_at
)
SELECT 
    v.id::uuid,
    v.user_id::uuid,
    b.id,
    v.duration_seconds,
    v.created_at
FROM (VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Zara', 2400, NOW() - INTERVAL '3 hours'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Nike Flagship', 1800, NOW() - INTERVAL '2 hours'),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Apple Store', 3600, NOW() - INTERVAL '3 hours 15 minutes'),
    ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Starbucks', 1500, NOW() - INTERVAL '1 hour 45 minutes'),
    ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Brew & Bean', 1200, NOW() - INTERVAL '2 hours 30 minutes'),
    ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'Domino''s', 2100, NOW() - INTERVAL '2 hours 45 minutes'),
    ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', 'Rolex Boutique', 2700, NOW() - INTERVAL '2 hours 20 minutes'),
    ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'Gucci', 1900, NOW() - INTERVAL '1 hour 10 minutes'),
    ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000006', 'H&M', 3200, NOW() - INTERVAL '2 hours'),
    ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000007', 'Adidas', 1800, NOW() - INTERVAL '1 hour 50 minutes'),
    ('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000008', 'Häagen-Dazs', 900, NOW() - INTERVAL '1 hour 30 minutes'),
    ('30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000009', 'Louis Vuitton', 3600, NOW() - INTERVAL '1 hour 40 minutes'),
    ('30000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000010', 'Sephora', 2200, NOW() - INTERVAL '1 hour 20 minutes'),
    ('30000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000011', 'Samsung Experience', 2500, NOW() - INTERVAL '1 hour 15 minutes'),
    ('30000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000012', 'MAC Cosmetics', 1400, NOW() - INTERVAL '1 hour 10 minutes'),
    ('30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000013', 'Sony Center', 2800, NOW() - INTERVAL '1 hour 5 minutes'),
    ('30000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000014', 'Hamleys', 1900, NOW() - INTERVAL '50 minutes'),
    ('30000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000015', 'PVR Cinemas', 7200, NOW() - INTERVAL '45 minutes'),
    ('30000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000016', 'Zara', 1600, NOW() - INTERVAL '40 minutes'),
    ('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000017', 'Nike Flagship', 2100, NOW() - INTERVAL '35 minutes'),
    ('30000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000018', 'Starbucks', 1200, NOW() - INTERVAL '30 minutes'),
    ('30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000019', 'The Grand VIP Lounge', 4800, NOW() - INTERVAL '25 minutes'),
    ('30000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000020', 'Brew & Bean', 1100, NOW() - INTERVAL '20 minutes'),
    ('30000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000021', 'Apple Store', 3100, NOW() - INTERVAL '15 minutes'),
    ('30000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000022', 'Domino''s', 1500, NOW() - INTERVAL '12 minutes'),
    ('30000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000023', 'Adidas', 1900, NOW() - INTERVAL '10 minutes'),
    ('30000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000024', 'Sephora', 1700, NOW() - INTERVAL '8 minutes'),
    ('30000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000025', 'AXIONIX Services', 900, NOW() - INTERVAL '3 minutes')
) AS v(id, user_id, brand_name, duration_seconds, created_at)
JOIN public.brands b ON b.name = v.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. SEED ORDERS (22 Real Orders mapped to Brands and Users)
-- ----------------------------------------------------------------------------
INSERT INTO public.orders (
    id,
    order_number,
    user_id,
    brand_id,
    customer_name,
    store_name,
    total_amount,
    payment_method,
    status,
    created_at,
    updated_at
)
SELECT
    o.id::uuid,
    o.order_number,
    o.user_id::uuid,
    b.id,
    o.customer_name,
    b.name,
    o.total_amount,
    o.payment_method,
    o.status,
    o.created_at,
    o.created_at
FROM (VALUES
    ('40000000-0000-0000-0000-000000000001', '#AX-9401', '10000000-0000-0000-0000-000000000001', 'Zara', 'Aarav Sharma', 10998.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '3 hours 30 minutes'),
    ('40000000-0000-0000-0000-000000000002', '#AX-9402', '10000000-0000-0000-0000-000000000001', 'Nike Flagship', 'Aarav Sharma', 15498.00, 'Credit Card', 'Completed', NOW() - INTERVAL '2 hours 15 minutes'),
    ('40000000-0000-0000-0000-000000000003', '#AX-9403', '10000000-0000-0000-0000-000000000002', 'Apple Store', 'Ananya Iyer', 249800.00, 'Apple Pay', 'Completed', NOW() - INTERVAL '2 hours 45 minutes'),
    ('40000000-0000-0000-0000-000000000004', '#AX-9404', '10000000-0000-0000-0000-000000000002', 'Starbucks', 'Ananya Iyer', 748.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '1 hour 40 minutes'),
    ('40000000-0000-0000-0000-000000000005', '#AX-9405', '10000000-0000-0000-0000-000000000003', 'Brew & Bean', 'Rohan Verma', 548.00, 'Mall Pay', 'Completed', NOW() - INTERVAL '2 hours 10 minutes'),
    ('40000000-0000-0000-0000-000000000006', '#AX-9406', '10000000-0000-0000-0000-000000000004', 'Domino''s', 'Pooja Patel', 1397.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '2 hours 20 minutes'),
    ('40000000-0000-0000-0000-000000000007', '#AX-9407', '10000000-0000-0000-0000-000000000005', 'Gucci', 'Vikram Malhotra', 65000.00, 'Credit Card', 'Completed', NOW() - INTERVAL '1 hour 5 minutes'),
    ('40000000-0000-0000-0000-000000000008', '#AX-9408', '10000000-0000-0000-0000-000000000006', 'H&M', 'Sneha Reddy', 5998.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '1 hour 45 minutes'),
    ('40000000-0000-0000-0000-000000000009', '#AX-9409', '10000000-0000-0000-0000-000000000007', 'Adidas', 'Arjun Nair', 14999.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '1 hour 30 minutes'),
    ('40000000-0000-0000-0000-000000000010', '#AX-9410', '10000000-0000-0000-0000-000000000008', 'Häagen-Dazs', 'Meera Joshi', 900.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '1 hour 15 minutes'),
    ('40000000-0000-0000-0000-000000000011', '#AX-9411', '10000000-0000-0000-0000-000000000009', 'Louis Vuitton', 'Rahul Sengupta', 285000.00, 'Credit Card', 'Completed', NOW() - INTERVAL '1 hour 25 minutes'),
    ('40000000-0000-0000-0000-000000000012', '#AX-9412', '10000000-0000-0000-0000-000000000010', 'Sephora', 'Kavita Rao', 8999.00, 'Credit Card', 'Completed', NOW() - INTERVAL '1 hour 10 minutes'),
    ('40000000-0000-0000-0000-000000000013', '#AX-9413', '10000000-0000-0000-0000-000000000011', 'Samsung Experience', 'Aditya Kapoor', 139999.00, 'Credit Card', 'Completed', NOW() - INTERVAL '1 hour'),
    ('40000000-0000-0000-0000-000000000014', '#AX-9414', '10000000-0000-0000-0000-000000000012', 'MAC Cosmetics', 'Ishita Mukherjee', 7000.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '55 minutes'),
    ('40000000-0000-0000-0000-000000000015', '#AX-9415', '10000000-0000-0000-0000-000000000013', 'Sony Center', 'Siddharth Menon', 34990.00, 'Credit Card', 'Completed', NOW() - INTERVAL '50 minutes'),
    ('40000000-0000-0000-0000-000000000016', '#AX-9416', '10000000-0000-0000-0000-000000000014', 'Hamleys', 'Tanvi Choudhury', 6998.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '40 minutes'),
    ('40000000-0000-0000-0000-000000000017', '#AX-9417', '10000000-0000-0000-0000-000000000015', 'PVR Cinemas', 'Varun Deshmukh', 1350.00, 'UPI / GPay', 'Completed', NOW() - INTERVAL '35 minutes'),
    ('40000000-0000-0000-0000-000000000018', '#AX-9418', '10000000-0000-0000-0000-000000000016', 'Zara', 'Neha Bhatt', 14997.00, 'UPI / GPay', 'Processing', NOW() - INTERVAL '25 minutes'),
    ('40000000-0000-0000-0000-000000000019', '#AX-9419', '10000000-0000-0000-0000-000000000017', 'Nike Flagship', 'Karan Mehra', 17997.00, 'Credit Card', 'Processing', NOW() - INTERVAL '15 minutes'),
    ('40000000-0000-0000-0000-000000000020', '#AX-9420', '10000000-0000-0000-0000-000000000018', 'Starbucks', 'Rhea Pillai', 1097.00, 'UPI / GPay', 'Pending', NOW() - INTERVAL '10 minutes'),
    ('40000000-0000-0000-0000-000000000021', '#AX-9421', '10000000-0000-0000-0000-000000000019', 'The Grand VIP Lounge', 'Gaurav Nanda', 5000.00, 'Mall Pay', 'Completed', NOW() - INTERVAL '8 minutes'),
    ('40000000-0000-0000-0000-000000000022', '#AX-9422', '10000000-0000-0000-0000-000000000020', 'AXIONIX Services', 'Divya Saxena', 999.00, 'UPI / GPay', 'Cancelled', NOW() - INTERVAL '5 minutes')
) AS o(id, order_number, user_id, brand_name, customer_name, total_amount, payment_method, status, created_at)
JOIN public.brands b ON b.name = o.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. SEED ORDER ITEMS (${orderItemRows.length} Order Items strictly referencing Products)
-- ----------------------------------------------------------------------------
INSERT INTO public.order_items (
    id,
    order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    subtotal,
    created_at
)
SELECT
    oi.id::uuid,
    oi.order_id::uuid,
    p.id,
    p.name,
    oi.quantity,
    p.price,
    (oi.quantity * p.price),
    NOW() - INTERVAL '2 hours'
FROM (VALUES
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Tailored Blazer', 1),
    ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Premium Linen Shirt', 1),
    ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 'Air Max 270', 1),
    ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 'Sports Dri-FIT T-Shirt', 1),
    ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', 'iPhone 17 Pro', 1),
    ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000003', 'MacBook Air', 1),
    ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000004', 'Caramel Macchiato', 1),
    ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000004', 'Java Chip Frappuccino', 1),
    ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000005', 'Classic Cappuccino', 1),
    ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000005', 'Cold Brew', 1),
    ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000006', 'Farmhouse Pizza', 1),
    ('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000006', 'Margherita Pizza', 2),
    ('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000007', 'GG Leather Wallet', 1),
    ('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000008', 'Oversized Cotton Hoodie', 2),
    ('50000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000009', 'Ultraboost Running Shoes', 1),
    ('50000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000010', 'Belgian Chocolate Ice Cream', 2),
    ('50000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000011', 'Leather Handbag', 1),
    ('50000000-0000-0000-0000-000000000018', '40000000-0000-0000-0000-000000000012', 'Luxury Beauty Collection', 1),
    ('50000000-0000-0000-0000-000000000019', '40000000-0000-0000-0000-000000000013', 'Galaxy S26 Ultra', 1),
    ('50000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000014', 'Studio Fix Foundation', 2),
    ('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000015', 'WH-1000XM6 Headphones', 1),
    ('50000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000016', 'Premium Building Set', 2),
    ('50000000-0000-0000-0000-000000000023', '40000000-0000-0000-0000-000000000017', 'Premium Movie Ticket', 3),
    ('50000000-0000-0000-0000-000000000024', '40000000-0000-0000-0000-000000000018', 'Tailored Blazer', 1),
    ('50000000-0000-0000-0000-000000000025', '40000000-0000-0000-0000-000000000018', 'Premium Linen Shirt', 2),
    ('50000000-0000-0000-0000-000000000026', '40000000-0000-0000-0000-000000000019', 'Air Max 270', 1),
    ('50000000-0000-0000-0000-000000000027', '40000000-0000-0000-0000-000000000019', 'Sports Dri-FIT T-Shirt', 2),
    ('50000000-0000-0000-0000-000000000028', '40000000-0000-0000-0000-000000000020', 'Java Chip Frappuccino', 1),
    ('50000000-0000-0000-0000-000000000029', '40000000-0000-0000-0000-000000000020', 'Caramel Macchiato', 2),
    ('50000000-0000-0000-0000-000000000030', '40000000-0000-0000-0000-000000000021', 'VIP Lounge Access', 2),
    ('50000000-0000-0000-0000-000000000031', '40000000-0000-0000-0000-000000000022', 'Premium Concierge Pass', 1)
) AS oi(id, order_id, product_name, quantity)
JOIN public.products p ON p.name = oi.product_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. SEED RESERVATIONS (10 Dining & Lounge Appointments)
-- ----------------------------------------------------------------------------
INSERT INTO public.reservations (
    id,
    user_id,
    brand_id,
    guest_name,
    store_name,
    party_size,
    time_slot,
    status,
    notes,
    created_at,
    updated_at
)
SELECT
    r.id::uuid,
    r.user_id::uuid,
    b.id,
    r.guest_name,
    b.name,
    r.party_size,
    r.time_slot,
    r.status,
    r.notes,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
FROM (VALUES
    ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'The Grand VIP Lounge', 'Aarav Sharma', 2, '07:30 PM', 'Confirmed', 'Window table with atrium view requested'),
    ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Brew & Bean', 'Ananya Iyer', 4, '06:00 PM', 'Seated', 'Birthday celebration and outdoor seating'),
    ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'Rolex Boutique', 'Vikram Malhotra', 1, '04:30 PM', 'Completed', 'VIP watch styling consultation'),
    ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'Starbucks', 'Sneha Reddy', 2, '05:00 PM', 'Confirmed', 'Quiet meeting corner'),
    ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', 'PVR Cinemas', 'Arjun Nair', 3, '08:15 PM', 'Confirmed', 'Director''s cut luxury recliner seats'),
    ('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000009', 'Gucci', 'Rahul Sengupta', 2, '03:00 PM', 'Completed', 'Private personal shopper preview'),
    ('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000010', 'Sephora', 'Kavita Rao', 1, '02:30 PM', 'Completed', 'Skincare analysis and makeup masterclass'),
    ('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000013', 'The Grand VIP Lounge', 'Siddharth Menon', 5, '09:00 PM', 'Confirmed', 'Executive corporate dinner'),
    ('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000015', 'Zara', 'Varun Deshmukh', 1, '01:30 PM', 'Cancelled', 'Personal fitting room reservation'),
    ('60000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000019', 'Apple Store', 'Gaurav Nanda', 1, '06:30 PM', 'Confirmed', 'Genius Bar hardware assessment')
) AS r(id, user_id, brand_name, guest_name, party_size, time_slot, status, notes)
JOIN public.brands b ON b.name = r.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. SEED COUPONS (8 High-Converting Vouchers with Distinct Codes)
-- ----------------------------------------------------------------------------
INSERT INTO public.coupons (
    id,
    brand_id,
    code,
    description,
    discount_type,
    discount_value,
    max_redemptions,
    redemption_count,
    is_active,
    valid_from,
    valid_until,
    created_at
)
SELECT
    c.id::uuid,
    b.id,
    c.code,
    c.description,
    c.discount_type,
    c.discount_value,
    c.max_redemptions,
    c.redemption_count,
    true,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
FROM (VALUES
    ('70000000-0000-0000-0000-000000000001', 'Nike Flagship', 'NIKE20', 'Flat 20% Off Footwear & Sportswear', 'percentage', 20.00, 1500, 3),
    ('70000000-0000-0000-0000-000000000002', 'Starbucks', 'STARBUCKSBOGO', 'Buy 1 Get 1 Free Cold Brew & Frappuccino', 'flat', 349.00, 2000, 2),
    ('70000000-0000-0000-0000-000000000003', 'Zara', 'ZARA15', 'Flat 15% Off Autumn Menswear & Dresses', 'percentage', 15.00, 1000, 2),
    ('70000000-0000-0000-0000-000000000004', 'Apple Store', 'APPLECARE500', 'Flat ₹500 Off AppleCare Protection Plan', 'flat', 500.00, 500, 1),
    ('70000000-0000-0000-0000-000000000005', 'Domino''s', 'DOMINOSBOGO', 'Buy 1 Get 1 Free Gourmet Pizza Slice', 'flat', 399.00, 1200, 1),
    ('70000000-0000-0000-0000-000000000006', 'Gucci', 'GUCCI5000', 'Flat ₹5,000 Off Luxury Leather Goods', 'flat', 5000.00, 300, 1),
    ('70000000-0000-0000-0000-000000000007', 'Sephora', 'SEPHORA10', '10% Off Premium Beauty & Fragrances', 'percentage', 10.00, 800, 1),
    ('70000000-0000-0000-0000-000000000008', 'PVR Cinemas', 'PVRCOMBO', 'Flat ₹150 Off Caramel Popcorn Combo', 'flat', 150.00, 1000, 1)
) AS c(id, brand_name, code, description, discount_type, discount_value, max_redemptions, redemption_count)
JOIN public.brands b ON b.name = c.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. SEED COUPON REDEMPTIONS (12 Redemptions accurately linked to Coupons)
-- ----------------------------------------------------------------------------
INSERT INTO public.coupon_redemptions (
    id,
    coupon_id,
    user_id,
    order_id,
    redeemed_at
) VALUES
('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 hours 15 minutes'),
('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000019', NOW() - INTERVAL '15 minutes'),
('80000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', NULL, NOW() - INTERVAL '1 hour'),
('80000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 hour 40 minutes'),
('80000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000018', '40000000-0000-0000-0000-000000000020', NOW() - INTERVAL '10 minutes'),
('80000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 hours 30 minutes'),
('80000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000018', NOW() - INTERVAL '25 minutes'),
('80000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 hours 45 minutes'),
('80000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000006', NOW() - INTERVAL '2 hours 20 minutes'),
('80000000-0000-0000-0000-000000000010', '70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', NOW() - INTERVAL '1 hour 5 minutes'),
('80000000-0000-0000-0000-000000000011', '70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000012', NOW() - INTERVAL '1 hour 10 minutes'),
('80000000-0000-0000-0000-000000000012', '70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000017', NOW() - INTERVAL '35 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. SEED CAMPAIGNS (8 Marketing Promotions linked to Brands)
-- ----------------------------------------------------------------------------
INSERT INTO public.campaigns (
    id,
    brand_id,
    name,
    description,
    campaign_type,
    is_active,
    created_at
)
SELECT
    c.id::uuid,
    b.id,
    c.name,
    c.description,
    c.campaign_type,
    true,
    NOW() - INTERVAL '4 days'
FROM (VALUES
    ('90000000-0000-0000-0000-000000000001', 'Zara', 'Autumn Fashion Carnival', 'Seasonal collection promotion with exclusive loyalty vouchers', 'Omnichannel Mall Fest'),
    ('90000000-0000-0000-0000-000000000002', 'Nike Flagship', 'Midnight Run & Athleisure Fest', 'Digital captive portal push with footwear scratch cards', 'Flash Sale & Footfall Push'),
    ('90000000-0000-0000-0000-000000000003', 'Apple Store', 'Next-Gen Tech Expo', 'Interactive hardware demos across atrium digital signage', 'Product Launch Activation'),
    ('90000000-0000-0000-0000-000000000004', 'Starbucks', 'Summer Cold Brew Craze', 'Afternoon BOGO push targeted at WiFi connected shoppers', 'Food Court & Dining Push'),
    ('90000000-0000-0000-0000-000000000005', 'PVR Cinemas', 'Blockbuster Movie Weekend', 'Family popcorn combo deals and recliner upgrades', 'Multiplex & Night Dining'),
    ('90000000-0000-0000-0000-000000000006', 'Gucci', 'Luxury High Fashion Gala', 'Exclusive VIP lounge showcase and private fitting slots', 'VIP Concierge Special'),
    ('90000000-0000-0000-0000-000000000007', 'Sephora', 'Glamour Beauty Masterclass', 'Complimentary beauty makeover vouchers via mall kiosk', 'Beauty & Lifestyle Push'),
    ('90000000-0000-0000-0000-000000000008', 'Hamleys', 'Kids Magic Toy Parade', 'Weekend atrium activities and toy building competitions', 'Kids & Family Weekend')
) AS c(id, brand_name, name, description, campaign_type)
JOIN public.brands b ON b.name = c.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. SEED NOTIFICATIONS (18 System Alerts & Operational Broadcasts)
-- ----------------------------------------------------------------------------
INSERT INTO public.notifications (
    id,
    user_id,
    title,
    message,
    notification_type,
    is_read,
    created_at
) VALUES
('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'High Atrium Footfall Alert', 'Central Atrium footfall density exceeded 85% capacity threshold.', 'critical', false, NOW() - INTERVAL '15 minutes'),
('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'WiFi Access Point AP-04 Optimized', 'Access Point AP-04 on Level 2 auto-adjusted 5GHz channel power.', 'network', true, NOW() - INTERVAL '30 minutes'),
('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'VIP Lounge Arrival', 'Platinum guest Vikram Malhotra checked in at The Grand VIP Lounge.', 'info', false, NOW() - INTERVAL '45 minutes'),
('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'High-Value POS Order', 'Nike Flagship processed order #AX-9402 for ₹15,498.00.', 'info', true, NOW() - INTERVAL '1 hour'),
('a0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'HVAC Temperature Normalization', 'Zone 3 (Food Court) ambient temperature stabilized at 22.4°C.', 'info', true, NOW() - INTERVAL '1 hour 15 minutes'),
('a0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Luxury Zone Dwell Spike', 'Average dwell time in Luxury Fashion Zone reached 42 minutes.', 'info', false, NOW() - INTERVAL '1 hour 30 minutes'),
('a0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Tenant Daily Sales Milestone', 'Apple Store exceeded ₹5,00,000 gross revenue milestone today.', 'info', true, NOW() - INTERVAL '1 hour 45 minutes'),
('a0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Security Door Sensor Warning', 'Rear Emergency Exit Door 3B opened during mall open hours.', 'security', false, NOW() - INTERVAL '2 hours'),
('a0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Parking Multi-Level Occupancy', 'Level 2 Covered Parking reached 92% occupancy capacity.', 'warning', true, NOW() - INTERVAL '2 hours 15 minutes'),
('a0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'High QR Signage Conversion', 'Digital kiosk sign #K-08 recorded 120 voucher scans in 1 hour.', 'info', true, NOW() - INTERVAL '2 hours 30 minutes'),
('a0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'Low Stock Alert: Zara Blazer', 'Tailored Blazer inventory in Zara Flagship is below 5 units.', 'warning', false, NOW() - INTERVAL '2 hours 45 minutes'),
('a0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'Captive Portal Bandwidth Surge', 'Total guest WiFi data throughput surpassed 2.4 Gbps.', 'network', true, NOW() - INTERVAL '3 hours'),
('a0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'Dining Reservation Surge', 'Brew & Bean table bookings at 100% capacity for dinner shift.', 'info', true, NOW() - INTERVAL '3 hours 15 minutes'),
('a0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'Escalator E-02 Maintenance Due', 'Scheduled monthly health inspection recommended for Escalator E-02.', 'warning', false, NOW() - INTERVAL '3 hours 30 minutes'),
('a0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'VIP Guest Table Confirmed', 'Aarav Sharma table reservation for 2 confirmed at The Grand VIP Lounge.', 'info', true, NOW() - INTERVAL '3 hours 45 minutes'),
('a0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'Captive Portal OTP Gateway Online', 'SMS OTP Gateway latency is nominal at 42ms response time.', 'network', true, NOW() - INTERVAL '4 hours'),
('a0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'Cleanliness Inspection Complete', 'Food Court washroom sanitation checklist certified 10/10.', 'info', true, NOW() - INTERVAL '4 hours 15 minutes'),
('a0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'AXIONIX System Morning Boot', 'All 42 IoT beacon gateways and 20 tenant POS feeds operational.', 'info', true, NOW() - INTERVAL '4 hours 30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. SEED ACTIVITY LOGS (28 Action Events for Live Timeline)
-- ----------------------------------------------------------------------------
INSERT INTO public.activity_logs (
    id,
    user_id,
    action,
    details,
    timestamp
) VALUES
('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'connected', 'Aarav Sharma connected to AXIONIX High-Speed Mall WiFi.', NOW() - INTERVAL '3 hours 50 minutes'),
('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'visited', 'Aarav Sharma visited Zara (Ground Floor, Luxury Zone).', NOW() - INTERVAL '3 hours 40 minutes'),
('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ordered', 'Aarav Sharma completed order #AX-9401 at Zara for ₹10,998.00.', NOW() - INTERVAL '3 hours 30 minutes'),
('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'connected', 'Ananya Iyer authenticated via Captive Portal on Ground Floor.', NOW() - INTERVAL '3 hours 30 minutes'),
('b0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'visited', 'Ananya Iyer entered Apple Store (Main Entrance).', NOW() - INTERVAL '3 hours 15 minutes'),
('b0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'ordered', 'Ananya Iyer purchased iPhone 17 Pro and MacBook Air (#AX-9403) for ₹2,49,800.00.', NOW() - INTERVAL '2 hours 45 minutes'),
('b0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'visited', 'Rohan Verma walked into Brew & Bean (Level 1 Fashion Zone).', NOW() - INTERVAL '2 hours 30 minutes'),
('b0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'ordered', 'Pooja Patel completed dining order #AX-9406 at Domino''s.', NOW() - INTERVAL '2 hours 20 minutes'),
('b0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'redeemed_coupon', 'Aarav Sharma redeemed voucher NIKE20 at Nike Flagship.', NOW() - INTERVAL '2 hours 15 minutes'),
('b0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'visited', 'Vikram Malhotra entered Rolex Boutique (Ground Floor).', NOW() - INTERVAL '2 hours 20 minutes'),
('b0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'visited', 'Sneha Reddy browsing at H&M (Level 1).', NOW() - INTERVAL '2 hours'),
('b0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000007', 'scanned_qr', 'Arjun Nair scanned digital display QR code at Central Atrium.', NOW() - INTERVAL '1 hour 50 minutes'),
('b0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000002', 'redeemed_coupon', 'Ananya Iyer applied voucher STARBUCKSBOGO at Starbucks.', NOW() - INTERVAL '1 hour 40 minutes'),
('b0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000009', 'ordered', 'Rahul Sengupta bought Leather Handbag at Louis Vuitton (₹2,85,000.00).', NOW() - INTERVAL '1 hour 25 minutes'),
('b0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000010', 'visited', 'Kavita Rao entered Sephora beauty section.', NOW() - INTERVAL '1 hour 20 minutes'),
('b0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000011', 'ordered', 'Aditya Kapoor purchased Galaxy S26 Ultra at Samsung Experience.', NOW() - INTERVAL '1 hour'),
('b0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000012', 'ordered', 'Ishita Mukherjee completed order #AX-9414 at MAC Cosmetics.', NOW() - INTERVAL '55 minutes'),
('b0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000013', 'ordered', 'Siddharth Menon purchased WH-1000XM6 Headphones at Sony Center.', NOW() - INTERVAL '50 minutes'),
('b0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000014', 'visited', 'Tanvi Choudhury entered Hamleys Toy World (Level 3).', NOW() - INTERVAL '40 minutes'),
('b0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000015', 'reserved', 'Varun Deshmukh booked luxury recliner seats at PVR Cinemas.', NOW() - INTERVAL '35 minutes'),
('b0000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000016', 'ordered', 'Neha Bhatt placed click-and-collect order #AX-9418 at Zara.', NOW() - INTERVAL '25 minutes'),
('b0000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000017', 'redeemed_coupon', 'Karan Mehra redeemed voucher NIKE20 at Nike Flagship.', NOW() - INTERVAL '15 minutes'),
('b0000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000018', 'ordered', 'Rhea Pillai ordered Java Chip Frappuccino at Starbucks.', NOW() - INTERVAL '10 minutes'),
('b0000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000019', 'reserved', 'Gaurav Nanda reserved private table at The Grand VIP Lounge.', NOW() - INTERVAL '8 minutes'),
('b0000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000021', 'visited', 'Akash Singhania entered Apple Store on Ground Floor.', NOW() - INTERVAL '15 minutes'),
('b0000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000023', 'visited', 'Harsh Vardhan entered Adidas on Level 1.', NOW() - INTERVAL '10 minutes'),
('b0000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000024', 'scanned_qr', 'Anushka Das scanned Sephora Glamour promotion QR code.', NOW() - INTERVAL '5 minutes'),
('b0000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000025', 'connected', 'Nikhil Agarwal authenticated via VIP Portal.', NOW() - INTERVAL '2 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. SEED TELEMETRY EVENTS (25 IoT & Captive Portal Signals)
-- ----------------------------------------------------------------------------
INSERT INTO public.telemetry_events (
    id,
    user_id,
    brand_id,
    event_type,
    event_data,
    created_at
)
SELECT
    t.id::uuid,
    t.user_id::uuid,
    b.id,
    t.event_type,
    t.event_data::jsonb,
    NOW() - INTERVAL '1 hour'
FROM (VALUES
    ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Zara', 'wifi_connected', '{"rssi": -54, "ap": "AP-GF-01", "band": "5GHz", "speed_mbps": 320}'),
    ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Zara', 'store_entered', '{"ble_beacon": "BCN-ZARA-01", "zone": "Luxury Fashion Zone", "accuracy_m": 0.8}'),
    ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Nike Flagship', 'store_entered', '{"ble_beacon": "BCN-NIKE-01", "zone": "Luxury Fashion Zone", "accuracy_m": 0.5}'),
    ('c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Apple Store', 'wifi_connected', '{"rssi": -48, "ap": "AP-GF-02", "band": "5GHz", "speed_mbps": 450}'),
    ('c0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Apple Store', 'dwell_update', '{"dwell_time_mins": 45, "zone": "Main Entrance", "interaction_count": 3}'),
    ('c0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Starbucks', 'qr_scanned', '{"kiosk_id": "K-STARBUCKS-01", "campaign": "STARBUCKSBOGO"}'),
    ('c0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Brew & Bean', 'store_entered', '{"ble_beacon": "BCN-BREW-01", "floor": "Level 1"}'),
    ('c0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Domino''s', 'store_entered', '{"ble_beacon": "BCN-DOM-01", "floor": "Level 2 Food Court"}'),
    ('c0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Rolex Boutique', 'store_entered', '{"vip_detected": true, "rfid_tag": "TAG-VIP-005"}'),
    ('c0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Gucci', 'dwell_update', '{"dwell_time_mins": 30, "zone": "Luxury Zone"}'),
    ('c0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'H&M', 'store_entered', '{"ble_beacon": "BCN-HM-01", "floor": "Level 1"}'),
    ('c0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000007', 'Adidas', 'qr_scanned', '{"kiosk_id": "K-ADIDAS-01", "campaign": "Midnight Run"}'),
    ('c0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000008', 'Häagen-Dazs', 'store_entered', '{"ble_beacon": "BCN-HD-01"}'),
    ('c0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000009', 'Louis Vuitton', 'store_entered', '{"vip_detected": true, "rfid_tag": "TAG-VIP-009"}'),
    ('c0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000010', 'Sephora', 'store_entered', '{"ble_beacon": "BCN-SEPH-01"}'),
    ('c0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000011', 'Samsung Experience', 'store_entered', '{"ble_beacon": "BCN-SAMS-01"}'),
    ('c0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000012', 'MAC Cosmetics', 'store_entered', '{"ble_beacon": "BCN-MAC-01"}'),
    ('c0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000013', 'Sony Center', 'store_entered', '{"ble_beacon": "BCN-SONY-01"}'),
    ('c0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000014', 'Hamleys', 'store_entered', '{"ble_beacon": "BCN-HAM-01"}'),
    ('c0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000015', 'PVR Cinemas', 'store_entered', '{"ticket_scanner": "TCK-PVR-01"}'),
    ('c0000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000016', 'Zara', 'store_entered', '{"ble_beacon": "BCN-ZARA-02"}'),
    ('c0000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000017', 'Nike Flagship', 'store_entered', '{"ble_beacon": "BCN-NIKE-02"}'),
    ('c0000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000018', 'Starbucks', 'store_entered', '{"ble_beacon": "BCN-SB-02"}'),
    ('c0000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000019', 'The Grand VIP Lounge', 'wifi_connected', '{"vip_gateway": "AP-VIP-01", "priority": "high"}'),
    ('c0000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000025', 'AXIONIX Services', 'store_entered', '{"ble_beacon": "BCN-AX-01"}')
) AS t(id, user_id, brand_name, event_type, event_data)
JOIN public.brands b ON b.name = t.brand_name
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. UPDATE BRAND DAILY METRICS (Strictly Derived from Seeded Data)
-- ----------------------------------------------------------------------------
UPDATE public.brands b
SET 
    visitors_today = COALESCE((
        SELECT COUNT(*) 
        FROM public.store_visits sv 
        WHERE sv.brand_id = b.id
    ), 0),
    orders_count = COALESCE((
        SELECT COUNT(*) 
        FROM public.orders o 
        WHERE o.brand_id = b.id 
          AND o.status != 'Cancelled'
    ), 0),
    revenue_today = COALESCE((
        SELECT SUM(o.total_amount) 
        FROM public.orders o 
        WHERE o.brand_id = b.id 
          AND o.status != 'Cancelled'
    ), 0);

-- ----------------------------------------------------------------------------
-- 14. UPDATE MALL DASHBOARD METRICS (Strictly Derived from Seeded Data)
-- ----------------------------------------------------------------------------
UPDATE public.mall_dashboard_metrics
SET 
    active_users = (
        SELECT COUNT(*) 
        FROM public.wifi_sessions 
        WHERE is_active = true
    ),
    new_users_today = (
        SELECT COUNT(*) 
        FROM public.users
    ),
    total_store_visits_today = (
        SELECT COUNT(*) 
        FROM public.store_visits
    ),
    total_orders_today = (
        SELECT COUNT(*) 
        FROM public.orders
    ),
    total_revenue_today = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM public.orders 
        WHERE status != 'Cancelled'
    ),
    reservations_today = (
        SELECT COUNT(*) 
        FROM public.reservations
    );

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (RUN IN SQL EDITOR TO VALIDATE SEEDED DATA)
-- ============================================================================

-- 1. Verify Row Counts in All Seeded Tables
SELECT 'users' AS table_name, COUNT(*) AS total_rows FROM public.users
UNION ALL
SELECT 'wifi_sessions', COUNT(*) FROM public.wifi_sessions
UNION ALL
SELECT 'store_visits', COUNT(*) FROM public.store_visits
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'reservations', COUNT(*) FROM public.reservations
UNION ALL
SELECT 'coupons', COUNT(*) FROM public.coupons
UNION ALL
SELECT 'coupon_redemptions', COUNT(*) FROM public.coupon_redemptions
UNION ALL
SELECT 'campaigns', COUNT(*) FROM public.campaigns
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM public.activity_logs
UNION ALL
SELECT 'telemetry_events', COUNT(*) FROM public.telemetry_events;

-- 2. Verify Order Total Amount vs Order Items Subtotal Sum (Must return 0 rows)
SELECT 
    o.id AS order_id,
    o.order_number,
    o.total_amount AS order_total,
    COALESCE(SUM(oi.subtotal), 0) AS calculated_items_total,
    (o.total_amount - COALESCE(SUM(oi.subtotal), 0)) AS diff
FROM public.orders o
LEFT JOIN public.order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.total_amount
HAVING (o.total_amount - COALESCE(SUM(oi.subtotal), 0)) != 0;

-- 3. Verify Coupon redemption_count vs Actual coupon_redemptions Rows (Must return 0 rows)
SELECT 
    c.id AS coupon_id,
    c.code,
    c.redemption_count AS coupon_redemption_metric,
    COUNT(cr.id) AS actual_redemptions_count,
    (c.redemption_count - COUNT(cr.id)) AS diff
FROM public.coupons c
LEFT JOIN public.coupon_redemptions cr ON cr.coupon_id = c.id
GROUP BY c.id, c.code, c.redemption_count
HAVING (c.redemption_count - COUNT(cr.id)) != 0;

-- 4. Verify Dashboard Metrics Singleton Row Matches Exact Seed Sums
SELECT 
    m.active_users,
    (SELECT COUNT(*) FROM public.wifi_sessions WHERE is_active = true) AS expected_active_users,
    m.new_users_today,
    (SELECT COUNT(*) FROM public.users) AS expected_new_users,
    m.total_store_visits_today,
    (SELECT COUNT(*) FROM public.store_visits) AS expected_visits,
    m.total_orders_today,
    (SELECT COUNT(*) FROM public.orders) AS expected_orders,
    m.total_revenue_today,
    (SELECT SUM(total_amount) FROM public.orders WHERE status != 'Cancelled') AS expected_revenue,
    m.reservations_today,
    (SELECT COUNT(*) FROM public.reservations) AS expected_reservations
FROM public.mall_dashboard_metrics m;

-- 5. Verify Brand Performance Aggregations
SELECT 
    b.name,
    b.category,
    b.visitors_today,
    b.orders_count,
    b.revenue_today
FROM public.brands b
ORDER BY b.revenue_today DESC, b.visitors_today DESC;

-- ----------------------------------------------------------------------------
-- FEATURE 11 — INTEGRATED MALL PAY (UNIFIED WALLET & FAMILY WALLET TABLES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mall_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    user_phone TEXT UNIQUE,
    balance NUMERIC DEFAULT 2500.00 CHECK (balance >= 0),
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.mall_wallets(id),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    reference_id TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_wallet_id UUID REFERENCES public.mall_wallets(id),
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    relation TEXT DEFAULT 'Family',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mall_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of mall_wallets" ON public.mall_wallets FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update of mall_wallets" ON public.mall_wallets FOR ALL USING (true);
CREATE POLICY "Allow public read of wallet_transactions" ON public.wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert of wallet_transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public family_members access" ON public.family_members FOR ALL USING (true);
