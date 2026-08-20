export type ViewType = 
  | 'dashboard'
  | 'mall-overview'
  | 'captive-portal'
  | 'tenant-dashboard'
  | 'customer-crm'
  | 'store-management'
  | 'campaigns'
  | 'analytics'
  | 'ai-insights'
  | 'notifications'
  | 'super-admin'
  | 'connected-users'
  | 'store-directory'
  | 'orders'
  | 'reservations'
  | 'coupons'
  | 'reports'
  | 'loyalty'
  | 'settings';

export interface LoyaltyAccount {
  userId: string;
  pointsBalance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | string;
  lifetimePoints: number;
  userName?: string;
  userPhone?: string;
}

export type UserRole = 'Super Admin' | 'Mall Manager' | 'Tenant Store Manager';

export interface AdminAuditLog {
  id: string;
  adminId?: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any> | string;
  createdAt: string;
  status?: string;
}

export interface AIRecommendation {
  id: string;
  category: 'Footfall' | 'Inventory' | 'Campaign' | 'Pricing';
  title: string;
  description: string;
  impactScore: 'High' | 'Medium' | 'Critical';
  expectedGrowth: string;
  actionText: string;
}

export interface StoreRegistration {
  id: string;
  name: string;
  category: string;
  floor: string;
  manager: string;
  email: string;
  phone: string;
  package: 'Platinum Flagship' | 'Gold Tier' | 'Silver Boutique';
  status: 'Pending' | 'Approved' | 'Active' | 'Rejected';
  submittedAt: string;
}


export interface MallFloor {
  id: string;
  floor_number: number;
  floor_name: string;
  description?: string;
  created_at?: string;
}

export interface MallZone {
  id: string;
  floor_id: string;
  zone_name: string;
  zone_type?: string;
  x_position?: number;
  y_position?: number;
  z_position?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  brand_id?: string;
  name: string;
  category?: string;
  description?: string;
  price: number;
  image_url?: string | null;
  sku?: string;
  stock_quantity?: number;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
  brands?: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  logoVariant?: 'nike' | 'zara' | 'gucci' | 'prada' | 'lv' | 'apple' | 'rayban' | string;
  category: 'Food' | 'Fashion' | 'Accessories' | 'Entertainment' | 'Services' | 'Electronics' | 'Luxury' | string;
  floor: 'Ground Floor' | 'First Floor' | 'Second Floor' | 'Third Floor' | 'Fourth Floor' | 'Fifth Floor' | '1st Floor' | '2nd Floor' | '3rd Floor' | 'Food Court' | 'Multiplex' | string;
  zone: string;
  visitorsToday: number;
  ordersCount: number;
  reservationsCount: number;
  conversionRate: number; // percentage e.g. 24.5
  revenueToday: number; // in USD or INR
  status: 'Open' | 'Peak' | 'Closing Soon' | 'Maintenance' | string;
  manager: string;
  phone: string;
  openHours: string;
  rating: number;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status?: string;
  loyalty_tier?: string;
  mac_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerJourney {
  user_id: string;
  brand_id?: string;
  name?: string;
  phone?: string;
  status?: string;
  duration_seconds?: number;
  brands?: {
    id: string;
    name: string;
    category?: string;
    floor?: string;
    zone?: string;
  };
}

export interface WifiSession {
  id: string;
  user_id: string;
  mac_address?: string;
  ip_address?: string;
  connected_at?: string;
  disconnected_at?: string | null;
  users?: CustomerUser;
}

export interface ConnectedUser {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  macAddress: string;
  mac_address?: string;
  ipAddress: string;
  ip_address?: string;
  connectionTime: string; // e.g. "10:42 AM"
  sessionDuration: string; // e.g. "45 mins"
  visitedStores: string[];
  dataUsed: string; // e.g. "340 MB"
  status: 'Active' | 'Idle' | 'Disconnected' | string;
  vipStatus: boolean;
  loyaltyTier?: string;
  zone: string;
  deviceType: 'iOS' | 'Android' | 'Windows' | 'macOS' | string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  timestamp: string;
  userName: string;
  userAvatar?: string;
  action: 'connected' | 'visited' | 'scanned_qr' | 'redeemed_coupon' | 'reserved' | 'ordered' | 'left' | string;
  detail: string;
  details?: string;
  storeName?: string;
  badgeType: 'blue' | 'green' | 'purple' | 'amber' | 'emerald' | string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products?: {
    id?: string;
    name?: string;
    sku?: string;
    category?: string;
    price?: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  order_number?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeName: string;
  storeCategory: string;
  brand_id?: string;
  user_id?: string;
  itemsCount?: number;
  items_count?: number;
  itemsList?: string[];
  items?: OrderItem[] | any[];
  totalAmount: number;
  total_amount?: number;
  subtotal?: number;
  tax?: number;
  discount_amount?: number;
  orderType: 'Click & Collect' | 'Dine-in' | 'Store Pickup' | 'Express Delivery' | string;
  order_type?: string;
  paymentMethod: 'UPI / GPay' | 'Credit Card' | 'Apple Pay' | 'Mall Pay' | 'UPI' | 'Card' | 'Cash' | string;
  payment_method?: string;
  payment_status?: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled' | string;
}

export interface Reservation {
  id: string;
  refCode: string;
  ref_code?: string;
  guestName: string;
  guest_name?: string;
  guestPhone: string;
  guest_phone?: string;
  guestEmail?: string;
  storeName: string;
  store_name?: string;
  storeCategory?: string;
  brand_id?: string;
  user_id?: string;
  partySize: number;
  party_size?: number;
  timeSlot: string;
  time_slot?: string;
  date?: string;
  notes?: string;
  specialRequest?: string;
  specialNotes?: string;
  created_at?: string;
  updated_at?: string;
  status: 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled' | string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  couponCode: string;
  customerName: string;
  customerPhone: string;
  redeemedAt: string;
  storeName: string;
  discountApplied: string;
  savingsAmount: string;
  channel: string;
  orderNumber?: string;
  vipStatus?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  discount_type?: string;
  discount_value?: number;
  storeName: string;
  category: string;
  brand_id?: string;
  issuedCount: number;
  max_redemptions?: number;
  redeemedCount: number;
  redemption_count?: number;
  expiryDate: string;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  targetSegment: string;
  redeemedCustomers?: CouponRedemption[];
}

export interface Campaign {
  id: string;
  title: string;
  name?: string;
  description?: string;
  type: string;
  campaign_type?: string;
  brand_id?: string;
  storeName?: string;
  brandName?: string;
  brandCategory?: string;
  is_active?: boolean;
  reach: number;
  impressions: number;
  qrScans: number;
  couponsRedeemed: number;
  revenueGenerated: number;
  roi: number; // percentage e.g. 340
  status: 'Active' | 'Completed' | 'Draft' | string;
  startDate: string;
  endDate: string;
  created_at?: string;
}

export interface SystemAlert {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  message?: string;
  notification_type?: string;
  timestamp: string;
  created_at?: string;
  severity: 'critical' | 'warning' | 'info' | string;
  category: 'Footfall' | 'Network' | 'Inventory' | 'Campaign' | 'Security' | string;
  read: boolean;
  is_read?: boolean;
  location?: string;
}

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  change: string; // e.g. "+12.4%"
  changeType?: 'positive' | 'negative' | 'neutral' | string;
  period?: string;
  isPositive?: boolean;
  subtext?: string;
  sparklineData: number[];
  iconName: string;
}

export interface AdminUser {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  assigned_mall?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

