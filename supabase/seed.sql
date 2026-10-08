-- ─────────────────────────────────────────────────────────────
-- RaktFlow Initial Seed Data for Supabase PostgreSQL
-- ─────────────────────────────────────────────────────────────

-- Blood Banks
INSERT INTO public.blood_banks (id, name, short_name, type, address, city, state, latitude, longitude, phone, email, status, operating_hours, confidence_score, freshness_status, total_units) VALUES
('bank-001', 'City Blood Bank', 'City BB', 'government', '24 MG Road, Central Bangalore', 'Bangalore', 'Karnataka', 12.9750, 77.6060, '+91 80 2222 1111', 'city@raktflow.demo', 'operational', '24/7', 96, 'fresh', 128),
('bank-002', 'District Blood Centre', 'District BC', 'government', '88 Jayanagar, South Bangalore', 'Bangalore', 'Karnataka', 12.9250, 77.5830, '+91 80 2222 2222', 'district@raktflow.demo', 'operational', '24/7', 88, 'fresh', 95),
('bank-003', 'LifeLine Blood Bank', 'LifeLine', 'private', '12 Koramangala, East Bangalore', 'Bangalore', 'Karnataka', 12.9352, 77.6245, '+91 80 2222 3333', 'lifeline@raktflow.demo', 'operational', '8 AM – 10 PM', 54, 'stale', 112),
('bank-004', 'Hope Foundation Blood Bank', 'Hope BB', 'ngo', '56 Whitefield, East Bangalore', 'Bangalore', 'Karnataka', 12.9698, 77.7500, '+91 80 2222 4444', 'hope@raktflow.demo', 'operational', '24/7', 92, 'fresh', 76),
('bank-005', 'Red Cross Blood Bank', 'Red Cross', 'ngo', '3 Rajajinagar, West Bangalore', 'Bangalore', 'Karnataka', 12.9900, 77.5520, '+91 80 2222 5555', 'redcross@raktflow.demo', 'operational', '24/7', 85, 'aging', 148),
('bank-006', 'St. Martha''s Hospital Blood Bank', 'St. Martha''s', 'hospital', '1 Nandidurg Road, North Bangalore', 'Bangalore', 'Karnataka', 13.0050, 77.5950, '+91 80 2222 6666', 'stmarthas@raktflow.demo', 'operational', '24/7', 94, 'fresh', 64),
('bank-007', 'Manipal Blood Bank', 'Manipal BB', 'hospital', '98 HAL Airport Road', 'Bangalore', 'Karnataka', 12.9580, 77.6480, '+91 80 2222 7777', 'manipal@raktflow.demo', 'operational', '24/7', 78, 'aging', 89),
('bank-008', 'Yelahanka Blood Centre', 'Yelahanka BC', 'government', '45 Yelahanka New Town', 'Bangalore', 'Karnataka', 13.1010, 77.5940, '+91 80 2222 8888', 'yelahanka@raktflow.demo', 'limited', '8 AM – 8 PM', 62, 'stale', 42)
ON CONFLICT (id) DO NOTHING;

-- Key Inventory Items
INSERT INTO public.inventory (id, bank_id, blood_group, component, available_units, reserved_units, protected_units, transferable_units, average_daily_usage, average_daily_donations, days_of_stock, stock_status, freshness_status, confidence_score, nearest_expiry, demand_trend) VALUES
('inv-001-bp-plt', 'bank-001', 'B+', 'Platelets', 8, 0, 4, 4, 3.10, 2.70, 2.58, 'warning', 'fresh', 96, NOW() + INTERVAL '18 hours', 12.00),
('inv-001-op-rbc', 'bank-001', 'O+', 'RBC', 35, 3, 20, 12, 5.80, 6.20, 5.50, 'healthy', 'fresh', 96, NOW() + INTERVAL '18 days', 3.00),
('inv-002-bp-plt', 'bank-002', 'B+', 'Platelets', 1, 0, 1, 0, 4.20, 2.10, 0.24, 'critical', 'fresh', 88, NOW() + INTERVAL '24 hours', 18.00),
('inv-003-bp-plt', 'bank-003', 'B+', 'Platelets', 10, 0, 5, 5, 2.80, 3.00, 3.60, 'healthy', 'stale', 54, NOW() + INTERVAL '48 hours', 8.00),
('inv-005-bp-plt', 'bank-005', 'B+', 'Platelets', 6, 1, 3, 2, 2.00, 2.20, 2.50, 'warning', 'aging', 85, NOW() + INTERVAL '36 hours', 3.00)
ON CONFLICT (id) DO NOTHING;

-- Hospitals
INSERT INTO public.hospitals (id, name, short_name, address, city, latitude, longitude, phone, type) VALUES
('hosp-001', 'District General Hospital', 'District GH', '15 Victoria Road, Central Bangalore', 'Bangalore', 12.9680, 77.5990, '+91 80 3333 1111', 'government'),
('hosp-002', 'Apollo Hospitals', 'Apollo', '154/11 Bannerghatta Road', 'Bangalore', 12.8950, 77.5970, '+91 80 3333 2222', 'private')
ON CONFLICT (id) DO NOTHING;

-- Donors (Masked Privacy)
INSERT INTO public.donors (id, anonymous_id, blood_group, eligible_components, latitude, longitude, availability, is_eligible, masked_phone) VALUES
('donor-001', 'Donor #A192', 'B+', ARRAY['Platelets', 'RBC'], 12.9710, 77.6020, 'available', true, '+91 ******421'),
('donor-002', 'Donor #B481', 'B+', ARRAY['Platelets', 'RBC'], 12.9650, 77.6150, 'available', true, '+91 ******839'),
('donor-003', 'Donor #C882', 'B+', ARRAY['RBC'], 12.9820, 77.5800, 'unavailable', true, '+91 ******156')
ON CONFLICT (id) DO NOTHING;
