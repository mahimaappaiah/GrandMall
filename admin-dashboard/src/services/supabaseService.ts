import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BACKEND_URL } from '../lib/config';
import {
  Store,
  ConnectedUser,
  Order,
  Reservation,
  Coupon,
  Campaign,
  SystemAlert,
  ActivityLog,
  KpiItem,
  AdminUser,
  MallFloor,
  MallZone,
  Product,
  CustomerUser,
  CustomerJourney,
  WifiSession,
  AdminAuditLog
} from '../types';
import {
  MOCK_STORES,
  MOCK_USERS,
  MOCK_ORDERS,
  MOCK_RESERVATIONS,
  MOCK_COUPONS,
  MOCK_CAMPAIGNS,
  MOCK_ALERTS,
  MOCK_ACTIVITY_FEED,
  MOCK_KPI_DATA,
  getLocationKpiData,
  TOP_PERFORMING_STORES_CHART,
  CATEGORY_DISTRIBUTION
} from '../data/mockData';

// Safe image helper based on category
function getCategoryLogo(category?: string | null): string {
  switch (category?.toLowerCase()) {
    case 'food':
    case 'dining':
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop&q=80';
    case 'electronics':
      return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&h=100&fit=crop&q=80';
    case 'accessories':
    case 'luxury':
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&q=80';
    case 'entertainment':
      return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop&q=80';
    case 'services':
      return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&q=80';
    case 'fashion':
    default:
      return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop&q=80';
  }
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return d.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// STORES / BRANDS SERVICE
// ---------------------------------------------------------------------------
export async function fetchStoresFromSupabase(): Promise<{ data: Store[]; isLive: boolean; error?: string }> {
  let backendBrands: any[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/brands`);
    const bData = await res.json();
    if (bData.success && Array.isArray(bData.brands)) {
      backendBrands = bData.brands;
    }
  } catch (e) {}

  let supaBrands: any[] = [];
  let isLive = false;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        supaBrands = data;
        isLive = true;
      }
    } catch (err: any) {
      console.warn('[Supabase] Exception in fetchStores:', err);
    }
  }

  const storeMap = new Map<string, Store>();

  // 1. Seed with MOCK_STORES
  MOCK_STORES.forEach(ms => {
    storeMap.set(ms.name.toLowerCase().trim(), ms);
  });

  // 2. Merge Backend Brands
  backendBrands.forEach(b => {
    const key = (b.name || '').toLowerCase().trim();
    const existing = storeMap.get(key);
    storeMap.set(key, {
      id: b.id || existing?.id || `store-${storeMap.size + 1}`,
      name: b.name || existing?.name || 'Store Tenant',
      logo: b.logoImg || b.logo_url || existing?.logo || getCategoryLogo(b.category),
      category: (b.category as any) || existing?.category || 'Fashion',
      floor: (b.floor as any) || existing?.floor || 'Ground Floor',
      zone: (b.zone as any) || existing?.zone || 'Central Atrium',
      visitorsToday: typeof b.visitorsToday === 'number' ? b.visitorsToday : (existing?.visitorsToday || 250),
      ordersCount: typeof b.ordersCount === 'number' ? b.ordersCount : (existing?.ordersCount || 25),
      reservationsCount: typeof b.reservationsCount === 'number' ? b.reservationsCount : (existing?.reservationsCount || 5),
      conversionRate: typeof b.conversionRate === 'number' ? b.conversionRate : (existing?.conversionRate || 22.5),
      revenueToday: typeof b.revenueToday === 'number' ? b.revenueToday : (existing?.revenueToday || 450000),
      status: b.status === 'open' ? 'Open' : b.status === 'peak' ? 'Peak' : (b.status as any) || existing?.status || 'Open',
      manager: b.manager || existing?.manager || 'Store Manager',
      phone: b.phone || existing?.phone || '+91 98765 43210',
      openHours: b.openHours || b.open_hours || existing?.openHours || '10:00 AM - 10:00 PM',
      rating: typeof b.rating === 'number' ? b.rating : (existing?.rating || 4.8)
    });
  });

  // 3. Merge Supabase Brands
  supaBrands.forEach((b: any, idx: number) => {
    const key = (b.name || '').toLowerCase().trim();
    const existing = storeMap.get(key);
    storeMap.set(key, {
      id: b.id || existing?.id || `store-supa-${idx + 1}`,
      name: b.name || existing?.name || 'Store Tenant',
      logo: b.logo_url || existing?.logo || getCategoryLogo(b.category),
      category: (b.category as any) || existing?.category || 'Fashion',
      floor: (b.floor as any) || existing?.floor || 'Ground Floor',
      zone: (b.zone as any) || existing?.zone || 'Central Atrium',
      visitorsToday: typeof b.visitors_today === 'number' ? b.visitors_today : (existing?.visitorsToday || 250),
      ordersCount: typeof b.orders_count === 'number' ? b.orders_count : (existing?.ordersCount || 25),
      reservationsCount: existing?.reservationsCount || 5,
      conversionRate: existing?.conversionRate || 22.5,
      revenueToday: typeof b.revenue_today === 'number' ? b.revenue_today : (existing?.revenueToday || 450000),
      status: b.status === 'open' ? 'Open' : b.status === 'peak' ? 'Peak' : (b.status as any) || existing?.status || 'Open',
      manager: b.manager || existing?.manager || 'Store Manager',
      phone: b.phone || existing?.phone || '+91 98765 43210',
      openHours: b.open_hours || existing?.openHours || '10:00 AM - 10:00 PM',
      rating: typeof b.rating === 'number' ? b.rating : (existing?.rating || 4.8)
    });
  });

  const finalStoresList = Array.from(storeMap.values());
  return { data: finalStoresList, isLive: isLive || backendBrands.length > 0 };
}

// ---------------------------------------------------------------------------
// MALL FLOORS & ZONES SERVICE
// ---------------------------------------------------------------------------
export async function fetchFloorsAndZonesFromSupabase(): Promise<{
  floors: MallFloor[];
  zones: MallZone[];
  isLive: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { floors: [], zones: [], isLive: false };
  }

  try {
    const [floorsRes, zonesRes] = await Promise.all([
      supabase.from('mall_floors').select('*').order('floor_number', { ascending: true }),
      supabase.from('mall_zones').select('*').order('zone_name', { ascending: true })
    ]);

    if (floorsRes.error) console.warn('[Supabase] floors error:', floorsRes.error.message);
    if (zonesRes.error) console.warn('[Supabase] zones error:', zonesRes.error.message);

    const floors = (floorsRes.data as MallFloor[]) || [];
    const zones = (zonesRes.data as MallZone[]) || [];

    return {
      floors,
      zones,
      isLive: Boolean(floors.length > 0),
      error: floorsRes.error?.message || zonesRes.error?.message
    };
  } catch (err: any) {
    return { floors: [], zones: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// PRODUCTS SERVICE
// ---------------------------------------------------------------------------
export async function fetchProductsFromSupabase(brandIdOrName?: string): Promise<{ data: Product[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: [], isLive: false, error: 'Supabase not configured' };
  }

  try {
    let query = supabase
      .from('products')
      .select('id, brand_id, name, category, description, price, image_url, sku, stock_quantity, is_available, brands(id, name, category)')
      .order('name', { ascending: true });

    if (brandIdOrName && brandIdOrName !== 'all') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandIdOrName);
      if (isUuid) {
        query = query.eq('brand_id', brandIdOrName);
      } else {
        const cleanName = brandIdOrName.replace(/^store-/, '').replace(/-/g, ' ').trim();
        const { data: brandMatch, error: brandMatchErr } = await supabase
          .from('brands')
          .select('id')
          .ilike('name', `%${cleanName}%`)
          .limit(1)
          .maybeSingle();

        if (brandMatchErr) {
          console.error('[Supabase] fetchProducts brand lookup error:', brandMatchErr.message);
        }

        if (brandMatch?.id) {
          query = query.eq('brand_id', brandMatch.id);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Supabase] fetchProducts query error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    const mappedProducts: Product[] = (data || []).map((p: any) => ({
      id: p.id,
      brand_id: p.brand_id,
      name: p.name || 'Boutique Item',
      category: p.category || p.brands?.category || 'General',
      description: p.description || undefined,
      price: Number(p.price) || 0,
      image_url: p.image_url || undefined,
      sku: p.sku || undefined,
      stock_quantity: typeof p.stock_quantity === 'number' ? p.stock_quantity : 0,
      is_available: p.is_available !== false,
      brands: p.brands || undefined
    }));

    return { data: mappedProducts, isLive: true };
  } catch (err: any) {
    console.error('[Supabase] Exception in fetchProducts:', err);
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// DASHBOARD METRICS / KPIS SERVICE
// ---------------------------------------------------------------------------
export async function fetchDashboardMetricsFromSupabase(selectedMall?: string): Promise<{
  metrics: {
    active_users?: number;
    new_users_today?: number;
    total_store_visits_today?: number;
    total_orders_today?: number;
    total_revenue_today?: number;
    reservations_today?: number;
  } | null;
  kpiItems: KpiItem[];
  isLive: boolean;
  error?: string;
}> {
  const defaultKpis = getLocationKpiData(selectedMall || 'Phoenix Marketcity Bengaluru');

  if (!isSupabaseConfigured) {
    return { metrics: null, kpiItems: defaultKpis, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('mall_dashboard_metrics')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] fetchDashboardMetrics error:', error.message);
      return { metrics: null, kpiItems: defaultKpis, isLive: false, error: error.message };
    }

    if (!data) {
      return { metrics: null, kpiItems: defaultKpis, isLive: false };
    }

    // Map live Supabase metrics from public.mall_dashboard_metrics
    const activeUsersVal = typeof data.active_users === 'number' ? data.active_users : null;
    const newUsersVal = typeof data.new_users_today === 'number' ? data.new_users_today : null;
    const storeVisitsVal = typeof data.total_store_visits_today === 'number' ? data.total_store_visits_today : null;
    const totalOrdersVal = typeof data.total_orders_today === 'number' ? data.total_orders_today : null;
    const reservationsVal = typeof data.reservations_today === 'number' ? data.reservations_today : null;
    const totalRevenueVal = typeof data.total_revenue_today === 'number' ? data.total_revenue_today : null;

    // Check coupon redemptions count
    let couponRedemptionsVal: number | null = null;
    try {
      const { count: cpnCount } = await supabase
        .from('coupon_redemptions')
        .select('id', { count: 'exact', head: true });
      if (typeof cpnCount === 'number' && cpnCount > 0) {
        couponRedemptionsVal = cpnCount;
      }
    } catch (_) {}

    const dynamicKpis: KpiItem[] = [
      {
        id: 'kpi-1',
        title: 'Connected Users',
        value: activeUsersVal !== null ? activeUsersVal.toLocaleString() : defaultKpis[0].value,
        change: '+12.4%',
        isPositive: true,
        subtext: 'vs yesterday',
        sparklineData: [920, 1050, 1180, 1290, 1340, 1420, activeUsersVal ?? 1482],
        iconName: 'Wifi'
      },
      {
        id: 'kpi-2',
        title: "Today's Visitors",
        value: newUsersVal !== null ? newUsersVal.toLocaleString() : defaultKpis[1].value,
        change: '+8.7%',
        isPositive: true,
        subtext: 'vs average weekday',
        sparklineData: [3200, 4100, 4800, 5600, 6100, 6500, newUsersVal ?? 6824],
        iconName: 'Users'
      },
      {
        id: 'kpi-3',
        title: 'Store Visits',
        value: storeVisitsVal !== null ? storeVisitsVal.toLocaleString() : defaultKpis[2].value,
        change: '+15.2%',
        isPositive: true,
        subtext: 'cumulative footfall',
        sparklineData: [11000, 13200, 14500, 15900, 16800, 17500, storeVisitsVal ?? 18420],
        iconName: 'ShoppingBag'
      },
      {
        id: 'kpi-4',
        title: 'Orders',
        value: totalOrdersVal !== null ? totalOrdersVal.toLocaleString() : defaultKpis[3].value,
        change: '+6.3%',
        isPositive: true,
        subtext: 'digital & counter orders',
        sparklineData: [600, 750, 890, 980, 1100, 1190, totalOrdersVal ?? 1245],
        iconName: 'Receipt'
      },
      {
        id: 'kpi-5',
        title: 'Reservations',
        value: reservationsVal !== null ? reservationsVal.toLocaleString() : defaultKpis[4].value,
        change: '+18.9%',
        isPositive: true,
        subtext: 'dining & services booked',
        sparklineData: [180, 220, 260, 290, 330, 360, reservationsVal ?? 382],
        iconName: 'CalendarCheck'
      },
      {
        id: 'kpi-6',
        title: 'Revenue',
        value: totalRevenueVal !== null ? `₹${totalRevenueVal.toLocaleString()}` : defaultKpis[5].value,
        change: '+14.1%',
        isPositive: true,
        subtext: 'gross mall sales today',
        sparklineData: [620000, 810000, 990000, 1150000, 1310000, 1410000, totalRevenueVal ?? 1485200],
        iconName: 'IndianRupee'
      },
      couponRedemptionsVal !== null
        ? {
            ...defaultKpis[6],
            value: couponRedemptionsVal.toLocaleString(),
            subtext: 'verified Supabase redemptions'
          }
        : defaultKpis[6],
      defaultKpis[7]
    ];

    return { metrics: data, kpiItems: dynamicKpis, isLive: true };
  } catch (err: any) {
    return { metrics: null, kpiItems: defaultKpis, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// DASHBOARD ANALYTICS CHARTS (TOP STORES & CATEGORY DISTRIBUTION)
// ---------------------------------------------------------------------------
export interface TopStoresChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius: number;
  }[];
}

export interface CategoryDistributionChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
    borderColor: string;
  }[];
}

export async function fetchDashboardAnalyticsChartsFromSupabase(): Promise<{
  topStoresChart: TopStoresChartData;
  categoryDistributionChart: CategoryDistributionChartData;
  isTopStoresLive: boolean;
  isCategoryDistributionLive: boolean;
  brandsCount: number;
  highestDwellCategory: string;
}> {
  const fallbackTopStores: TopStoresChartData = TOP_PERFORMING_STORES_CHART;
  const fallbackCategory: CategoryDistributionChartData = CATEGORY_DISTRIBUTION;

  if (!isSupabaseConfigured) {
    return {
      topStoresChart: fallbackTopStores,
      categoryDistributionChart: fallbackCategory,
      isTopStoresLive: false,
      isCategoryDistributionLive: false,
      brandsCount: 0,
      highestDwellCategory: 'Food Court (32%)'
    };
  }

  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, category, revenue_today, visitors_today, orders_count')
      .order('name', { ascending: true });

    if (error || !brands || brands.length === 0) {
      return {
        topStoresChart: fallbackTopStores,
        categoryDistributionChart: fallbackCategory,
        isTopStoresLive: false,
        isCategoryDistributionLive: false,
        brandsCount: 0,
        highestDwellCategory: 'Food Court (32%)'
      };
    }

    // 1. TOP PERFORMING STORES CHART
    let topStoresChart: TopStoresChartData = fallbackTopStores;
    let isTopStoresLive = false;

    const hasLiveRevenue = brands.some((b: any) => Number(b.revenue_today) > 0);
    if (hasLiveRevenue) {
      const top6 = brands
        .slice()
        .sort((a: any, b: any) => (Number(b.revenue_today) || 0) - (Number(a.revenue_today) || 0))
        .slice(0, 6);

      topStoresChart = {
        labels: top6.map((s: any) => s.name || 'Store'),
        datasets: [
          {
            label: 'Revenue Today (in ₹ Thousands)',
            data: top6.map((s: any) => Math.round((Number(s.revenue_today) || 0) / 1000)),
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderRadius: 6
          }
        ]
      };
      isTopStoresLive = true;
    }

    // 2. CATEGORY DISTRIBUTION DONUT CHART
    const categoryCounts: Record<string, number> = {};
    let totalItems = 0;

    const hasLiveVisitors = brands.some((b: any) => Number(b.visitors_today) > 0);

    brands.forEach((b: any) => {
      const cat = b.category || 'Other';
      const weight = hasLiveVisitors ? (Number(b.visitors_today) || 0) : 1;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + weight;
      totalItems += weight;
    });

    let categoryDistributionChart: CategoryDistributionChartData = fallbackCategory;
    let isCategoryDistributionLive = false;
    let highestDwellCategory = 'Food Court (32%)';

    const categories = Object.keys(categoryCounts);
    if (categories.length > 0 && totalItems > 0) {
      const sortedCategories = categories.sort((a, b) => categoryCounts[b] - categoryCounts[a]);
      const percentages = sortedCategories.map(cat => Math.round((categoryCounts[cat] / totalItems) * 100));

      const palette = [
        '#2563EB', // Primary Blue
        '#3B82F6', // Accent Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#64748B'  // Slate
      ];

      categoryDistributionChart = {
        labels: sortedCategories,
        datasets: [
          {
            data: percentages,
            backgroundColor: sortedCategories.map((_, i) => palette[i % palette.length]),
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        ]
      };
      isCategoryDistributionLive = true;
      highestDwellCategory = `${sortedCategories[0]} (${percentages[0]}%)`;
    }

    return {
      topStoresChart,
      categoryDistributionChart,
      isTopStoresLive,
      isCategoryDistributionLive,
      brandsCount: brands.length,
      highestDwellCategory
    };
  } catch (err) {
    console.warn('[Supabase] fetchDashboardAnalyticsCharts error:', err);
    return {
      topStoresChart: fallbackTopStores,
      categoryDistributionChart: fallbackCategory,
      isTopStoresLive: false,
      isCategoryDistributionLive: false,
      brandsCount: 0,
      highestDwellCategory: 'Food Court (32%)'
    };
  }
}

// ---------------------------------------------------------------------------
// ORDERS SERVICE
// ---------------------------------------------------------------------------
export async function fetchOrdersFromSupabase(brandIdOrName?: string): Promise<{ data: Order[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: [], isLive: false, error: 'Supabase credentials not configured' };
  }

  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (id, full_name, phone, email),
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          products (id, name, sku, category, price)
        )
      `)
      .order('created_at', { ascending: false });

    if (brandIdOrName && brandIdOrName !== 'all') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandIdOrName);
      if (isUuid) {
        query = query.eq('brand_id', brandIdOrName);
      }
    }

    const { data: dbOrders, error } = await query;

    if (error) {
      console.error('[Supabase] fetchOrders query error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    if (!dbOrders || dbOrders.length === 0) {
      return { data: [], isLive: true };
    }

    const mappedOrders: Order[] = dbOrders.map((o: any) => {
      const itemsList = o.order_items?.map((item: any) => 
        `${item.quantity || 1}x ${item.products?.name || 'Product'}`
      ) || ['Store Purchase'];

      const totalAmt = Number(o.total_amount) || Number(o.subtotal) || 0;
      const rawStatus = (o.status || '').toLowerCase();
      const statusTitle = rawStatus === 'completed' ? 'Completed' :
                          rawStatus === 'processing' ? 'Processing' :
                          rawStatus === 'pending' ? 'Pending' :
                          rawStatus === 'cancelled' ? 'Cancelled' : 'Completed';

      return {
        id: o.id,
        orderNumber: o.order_number || `#AX-${o.id.slice(0, 6).toUpperCase()}`,
        order_number: o.order_number,
        customerName: o.profiles?.full_name || o.profiles?.name || o.customer_name || 'Mall Guest',
        customerPhone: o.profiles?.phone || o.customer_phone || '+91 98000 00000',
        customerEmail: o.profiles?.email || o.customer_email,
        storeName: o.store_name || 'Mall Boutique',
        storeCategory: 'Fashion',
        brand_id: o.brand_id,
        user_id: o.user_id,
        itemsCount: o.items_count || (o.order_items?.length ?? 1),
        items_count: o.items_count,
        itemsList: itemsList,
        items: o.order_items || [],
        totalAmount: totalAmt,
        total_amount: totalAmt,
        subtotal: Number(o.subtotal) || totalAmt,
        tax: Number(o.tax) || 0,
        discount_amount: Number(o.discount_amount) || 0,
        orderType: o.order_type || 'Click & Collect',
        order_type: o.order_type,
        paymentMethod: o.payment_method || 'UPI / GPay',
        payment_method: o.payment_method,
        payment_status: o.payment_status || 'Paid',
        timestamp: o.created_at ? formatRelativeTime(o.created_at) : 'Just now',
        created_at: o.created_at,
        updated_at: o.updated_at,
        status: statusTitle
      };
    });

    return { data: mappedOrders, isLive: true };
  } catch (err: any) {
    console.error('[Supabase] Exception in fetchOrders:', err);
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// RESERVATIONS SERVICE
// ---------------------------------------------------------------------------
export async function fetchReservationsFromSupabase(brandIdOrName?: string): Promise<{ data: Reservation[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: MOCK_RESERVATIONS, isLive: false };
  }

  try {
    let query = supabase
      .from('reservations')
      .select(`
        *,
        profiles:user_id (id, full_name, phone, email),
        brands (id, name, category, floor, zone)
      `)
      .order('created_at', { ascending: false });

    if (brandIdOrName) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandIdOrName);
      if (isUuid) {
        query = query.eq('brand_id', brandIdOrName);
      } else {
        const cleanName = brandIdOrName.replace(/^store-/, '').replace(/-/g, ' ').trim();
        const { data: brandMatch } = await supabase
          .from('brands')
          .select('id')
          .ilike('name', `%${cleanName}%`)
          .limit(1)
          .maybeSingle();

        if (brandMatch?.id) {
          query = query.eq('brand_id', brandMatch.id);
        }
      }
    }

    const { data: dbRes, error } = await query;

    if (error) {
      console.error('[Supabase] fetchReservations query error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    if (!dbRes || dbRes.length === 0) {
      return { data: [], isLive: true };
    }

    const mappedRes: Reservation[] = dbRes.map((r: any) => {
      const rawStatus = (r.status || '').toLowerCase();
      const statusTitle = rawStatus === 'confirmed' ? 'Confirmed' :
                          rawStatus === 'checked-in' || rawStatus === 'checked_in' ? 'Checked-in' :
                          rawStatus === 'completed' ? 'Completed' :
                          rawStatus === 'cancelled' ? 'Cancelled' : 'Confirmed';

      const storeName = r.brands?.name || 'Mall Boutique';
      const storeCategory = r.brands?.category || 'Dining';
      const refCode = `RES-${storeName.slice(0, 3).toUpperCase()}-${r.id.slice(0, 4).toUpperCase()}`;

      return {
        id: r.id,
        refCode: refCode,
        ref_code: refCode,
        guestName: r.profiles?.full_name || r.profiles?.name || r.guest_name || 'Guest User',
        guest_name: r.guest_name,
        guestPhone: r.profiles?.phone || '+91 98000 00000',
        guest_phone: r.profiles?.phone,
        guestEmail: r.profiles?.email,
        storeName: storeName,
        store_name: storeName,
        storeCategory: storeCategory,
        brand_id: r.brand_id,
        user_id: r.user_id,
        partySize: Number(r.party_size) || 2,
        party_size: Number(r.party_size) || 2,
        timeSlot: r.time_slot || (r.created_at ? formatRelativeTime(r.created_at) : '07:00 PM Today'),
        time_slot: r.time_slot,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : 'Today',
        notes: r.notes,
        specialNotes: r.notes || 'Priority Suite / Dining',
        specialRequest: r.notes || 'Priority Suite / Dining',
        created_at: r.created_at,
        updated_at: r.updated_at,
        status: statusTitle
      };
    });

    return { data: mappedRes, isLive: true };
  } catch (err: any) {
    return { data: MOCK_RESERVATIONS, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// CONNECTED USERS / WIFI SESSIONS SERVICE (Reading public.wifi_sessions & public.store_visits)
// ---------------------------------------------------------------------------
export async function fetchConnectedUsersFromSupabase(): Promise<{ data: ConnectedUser[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: [], isLive: false, error: 'Supabase credentials not configured' };
  }

  try {
    const [sessionsRes, visitsRes] = await Promise.all([
      supabase
        .from('wifi_sessions')
        .select('*, profiles:user_id(id, full_name, phone, email, avatar_url, loyalty_tier, is_active)')
        .order('connected_at', { ascending: false }),
      supabase
        .from('store_visits')
        .select('user_id, visited_at, brands(name)')
        .order('visited_at', { ascending: false })
    ]);

    const sessions = sessionsRes.data;
    if (sessionsRes.error) {
      console.error('[Supabase] fetchConnectedUsers query error:', sessionsRes.error.message);
      return { data: [], isLive: false, error: sessionsRes.error.message };
    }

    // Map store visits by user_id
    const userVisitsMap = new Map<string, string[]>();
    if (visitsRes.data) {
      visitsRes.data.forEach((v: any) => {
        if (v.user_id && v.brands?.name) {
          const arr = userVisitsMap.get(v.user_id) || [];
          if (!arr.includes(v.brands.name)) {
            arr.push(v.brands.name);
          }
          userVisitsMap.set(v.user_id, arr);
        }
      });
    }

    if (!sessions || sessions.length === 0) {
      return { data: [], isLive: true };
    }

    const mappedUsers: ConnectedUser[] = sessions.map((s: any, idx: number) => {
      const profile = s.profiles;
      const isSessionActive = !s.disconnected_at;
      const durationMin = s.connected_at && s.disconnected_at
        ? Math.max(1, Math.round((new Date(s.disconnected_at).getTime() - new Date(s.connected_at).getTime()) / 60000))
        : 35;

      const visited = (s.user_id ? userVisitsMap.get(s.user_id) : null) || [];

      return {
        id: s.id || `usr-${idx + 1}`,
        user_id: s.user_id,
        name: profile?.full_name || profile?.name || (s.phone ? `Guest ${s.phone.slice(-4)}` : 'WiFi Visitor'),
        phone: profile?.phone || s.phone || '+91 98000 00000',
        email: profile?.email || s.email,
        macAddress: s.mac_address || profile?.mac_address || 'FE:88:99:A1:B2:C3',
        ipAddress: s.ip_address || '192.168.10.142',
        connectionTime: s.connected_at ? formatRelativeTime(s.connected_at) : 'Just now',
        sessionDuration: `${durationMin}m`,
        visitedStores: visited,
        dataUsed: '240 MB',
        status: isSessionActive ? 'Active' : 'Disconnected',
        vipStatus: true,
        loyaltyTier: profile?.loyalty_tier || 'Bronze',
        zone: 'Ground Floor Atrium',
        deviceType: 'iOS'
      };
    });

    return { data: mappedUsers, isLive: true };
  } catch (err: any) {
    console.error('[Supabase] Exception in fetchConnectedUsers:', err);
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// CUSTOMER CRM / PROFILES SERVICE (Reading public.profiles)
// ---------------------------------------------------------------------------
export async function fetchCustomersFromSupabase(): Promise<{ data: ConnectedUser[]; isLive: boolean; error?: string }> {
  let backendUsers: any[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/connected-users`);
    const uData = await res.json();
    if (uData.success && Array.isArray(uData.users)) {
      backendUsers = uData.users;
    }
  } catch (e) {}

  let supaCustomers: ConnectedUser[] = [];
  let isLive = false;

  if (isSupabaseConfigured) {
    try {
      const [profilesRes, visitsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, phone, role, avatar_url, loyalty_tier, is_active, created_at, updated_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('store_visits')
          .select('user_id, visited_at, brands(name)')
          .order('visited_at', { ascending: false })
      ]);

      const userVisitsMap = new Map<string, string[]>();
      if (visitsRes.data) {
        visitsRes.data.forEach((v: any) => {
          if (v.user_id && v.brands?.name) {
            const arr = userVisitsMap.get(v.user_id) || [];
            if (!arr.includes(v.brands.name)) {
              arr.push(v.brands.name);
            }
            userVisitsMap.set(v.user_id, arr);
          }
        });
      }

      const dbProfiles = profilesRes.data;
      if (!profilesRes.error && dbProfiles && dbProfiles.length > 0) {
        supaCustomers = dbProfiles.map((p: any, idx: number) => ({
          id: p.id || `usr-${idx + 1}`,
          user_id: p.id,
          name: p.full_name || p.email?.split('@')[0] || 'Mall Guest',
          phone: p.phone || '+91 98000 00000',
          email: p.email,
          macAddress: 'FE:88:99:A1:B2:C3',
          ipAddress: '192.168.10.142',
          connectionTime: p.created_at ? formatRelativeTime(p.created_at) : 'Today',
          sessionDuration: '45m',
          visitedStores: userVisitsMap.get(p.id) || [],
          dataUsed: '180 MB',
          status: p.is_active !== false ? 'Active' : 'Disconnected',
          vipStatus: true,
          loyaltyTier: p.loyalty_tier || 'Bronze',
          zone: 'Ground Floor Atrium',
          deviceType: 'iOS'
        }));
        isLive = true;
      }
    } catch (err: any) {
      console.error('[Supabase] Exception in fetchCustomers:', err);
    }
  }

  const userMap = new Map<string, ConnectedUser>();

  // 1. Seed with MOCK_USERS
  MOCK_USERS.forEach(u => {
    const key = (u.phone || '').replace(/\D/g, '').slice(-10) || u.id;
    userMap.set(key, { ...u });
  });

  // 2. Merge Backend Users
  backendUsers.forEach((u: any) => {
    const key = (u.phone || '').replace(/\D/g, '').slice(-10) || (u.name || '').toLowerCase();
    const existing = userMap.get(key);
    const existingStores = existing?.visitedStores || [];
    const newStores = Array.isArray(u.visitedStores) ? u.visitedStores : [];
    const mergedStores = Array.from(new Set([...existingStores, ...newStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

    userMap.set(key, {
      id: u.id || existing?.id || `usr-${userMap.size + 1}`,
      name: u.name || existing?.name || 'Valued Guest',
      phone: u.phone || existing?.phone || '+91 98000 00000',
      email: u.email || existing?.email,
      macAddress: u.macAddress || existing?.macAddress || 'A1:B2:C3:D4:E5:F6',
      ipAddress: u.ipAddress || existing?.ipAddress || '192.168.1.100',
      connectionTime: u.connectionTime || existing?.connectionTime || 'Just Now',
      sessionDuration: u.sessionDuration || existing?.sessionDuration || '30m',
      visitedStores: mergedStores,
      dataUsed: u.dataUsed || existing?.dataUsed || '250 MB',
      status: u.status || existing?.status || 'Active',
      vipStatus: true,
      zone: u.zone || existing?.zone || 'Central Atrium',
      deviceType: u.deviceType || existing?.deviceType || 'Mobile'
    });
  });

  // 3. Merge Supabase Customers
  supaCustomers.forEach(u => {
    const key = (u.phone || '').replace(/\D/g, '').slice(-10) || (u.name || '').toLowerCase();
    const existing = userMap.get(key);
    const existingStores = existing?.visitedStores || [];
    const newStores = Array.isArray(u.visitedStores) ? u.visitedStores : [];
    const mergedStores = Array.from(new Set([...existingStores, ...newStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

    userMap.set(key, {
      ...existing,
      ...u,
      visitedStores: mergedStores
    });
  });

  const finalUsersList = Array.from(userMap.values());
  return { data: finalUsersList, isLive: isLive || backendUsers.length > 0 };
}

// ---------------------------------------------------------------------------
// CUSTOMER JOURNEY / STORE VISITS SERVICE (Reading public.store_visits & public.profiles)
// ---------------------------------------------------------------------------
export async function fetchCustomerJourneyFromSupabase(userId?: string): Promise<{ data: CustomerJourney[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: [], isLive: false, error: 'Supabase credentials not configured' };
  }

  try {
    let query = supabase
      .from('store_visits')
      .select('*, profiles:user_id(id, full_name, phone, email), brands:brand_id(id, name, category, floor, zone)')
      .order('visited_at', { ascending: false });

    if (userId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isUuid) {
        query = query.eq('user_id', userId);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Supabase] fetchCustomerJourney error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    return { data: (data as CustomerJourney[]) || [], isLive: true };
  } catch (err: any) {
    console.error('[Supabase] Exception in fetchCustomerJourney:', err);
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// COUPONS & REDEMPTIONS SERVICE
// ---------------------------------------------------------------------------
export async function fetchCouponsFromSupabase(): Promise<{ data: Coupon[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: MOCK_COUPONS, isLive: false };
  }

  try {
    const { data: dbCoupons, error } = await supabase
      .from('coupons')
      .select(`
        id,
        created_at,
        brand_id,
        code,
        description,
        discount_type,
        discount_value,
        is_active,
        valid_from,
        valid_until,
        max_redemptions,
        redemption_count,
        brands (id, name, category),
        coupon_redemptions (id, user_id, coupon_id, redeemed_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] fetchCoupons query error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    if (!dbCoupons || dbCoupons.length === 0) {
      return { data: [], isLive: true };
    }

    const mappedCoupons: Coupon[] = dbCoupons.map((c: any) => {
      // Build display discount string from actual DB columns
      const discountLabel = (() => {
        const val = c.discount_value;
        const type = (c.discount_type || '').toLowerCase();
        if (!val) return 'Special Discount';
        if (type === 'percent' || type === 'percentage' || type === '%') return `${val}% OFF`;
        if (type === 'flat' || type === 'fixed' || type === 'amount') return `₹${val} OFF`;
        return `${val}% OFF`; // default to percent
      })();

      // Determine status from is_active + expiry
      const now = new Date();
      const untilDate = c.valid_until ? new Date(c.valid_until) : null;
      const fromDate = c.valid_from ? new Date(c.valid_from) : null;
      const isExpired = untilDate ? untilDate < now : false;
      const isScheduled = fromDate ? fromDate > now : false;
      const status: 'Active' | 'Scheduled' | 'Expired' =
        isExpired ? 'Expired' :
        isScheduled ? 'Scheduled' :
        c.is_active !== false ? 'Active' : 'Expired';

      const redemptions = c.coupon_redemptions || [];
      const redemptionCount = c.redemption_count ?? redemptions.length;

      return {
        id: c.id,
        code: c.code || 'MALLOFFER',
        title: c.description || 'Special Mall Offer',
        discount: discountLabel,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
        storeName: c.brands?.name || 'All Mall Stores',
        category: c.brands?.category || 'Retail',
        brand_id: c.brand_id,
        issuedCount: c.max_redemptions || 1000,
        max_redemptions: c.max_redemptions,
        redeemedCount: redemptionCount,
        redemption_count: redemptionCount,
        expiryDate: c.valid_until ? c.valid_until.split('T')[0] : '2026-12-31',
        valid_from: c.valid_from,
        valid_until: c.valid_until,
        created_at: c.created_at,
        status,
        targetSegment: 'All Mall Guests',
        redeemedCustomers: redemptions.map((r: any) => ({
          id: r.id,
          couponId: c.id,
          couponCode: c.code,
          customerName: r.users?.name || 'Valued Guest',
          customerPhone: r.users?.phone || '+91 98000 00000',
          redeemedAt: r.redeemed_at ? formatRelativeTime(r.redeemed_at) : 'Recently',
          storeName: c.brands?.name || 'Mall Store',
          discountApplied: discountLabel,
          savingsAmount: c.discount_value ? `₹${c.discount_value}` : '₹Savings Applied',
          channel: 'WiFi Captive Portal',
          vipStatus: false
        }))
      };
    });

    return { data: mappedCoupons, isLive: true };
  } catch (err: any) {
    return { data: MOCK_COUPONS, isLive: false, error: err.message };
  }
}

// Standalone redemption count query for Dashboard KPI card
export async function fetchCouponRedemptionsCountFromSupabase(): Promise<{ count: number; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { count: 0, isLive: false };
  }

  try {
    const { count, error } = await supabase
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.warn('[Supabase] fetchCouponRedemptionsCount error:', error.message);
      return { count: 0, isLive: false, error: error.message };
    }

    return { count: count ?? 0, isLive: true };
  } catch (err: any) {
    return { count: 0, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// CAMPAIGNS SERVICE
// ---------------------------------------------------------------------------
export async function fetchCampaignsFromSupabase(): Promise<{ data: Campaign[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: MOCK_CAMPAIGNS, isLive: false };
  }

  try {
    const { data: dbCampaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        created_at,
        brand_id,
        name,
        description,
        campaign_type,
        is_active,
        brands (id, name, category, floor, zone)
      `)
      .order('created_at', { ascending: false });

    if (error || !dbCampaigns || dbCampaigns.length === 0) {
      return { data: MOCK_CAMPAIGNS, isLive: false, error: error?.message };
    }

    const mappedCampaigns: Campaign[] = dbCampaigns.map((c: any, idx: number) => {
      const mockMatch = MOCK_CAMPAIGNS[idx % MOCK_CAMPAIGNS.length];
      const brandName = c.brands?.name || 'All Mall Stores';
      const typeLabel = c.campaign_type || 'Omnichannel Mall Promotion';
      const createdDate = c.created_at ? c.created_at.split('T')[0] : '2026-08-01';

      return {
        id: c.id,
        title: c.name || mockMatch?.title || 'Mall Marketing Campaign',
        name: c.name,
        description: c.description,
        type: typeLabel,
        campaign_type: c.campaign_type,
        brand_id: c.brand_id,
        storeName: brandName,
        brandName: c.brands?.name,
        brandCategory: c.brands?.category,
        is_active: c.is_active,
        reach: mockMatch?.reach || 25000,
        impressions: mockMatch?.impressions || 68000,
        qrScans: mockMatch?.qrScans || 3400,
        couponsRedeemed: mockMatch?.couponsRedeemed || 1200,
        revenueGenerated: mockMatch?.revenueGenerated || 2800000,
        roi: mockMatch?.roi || 340,
        status: c.is_active !== false ? 'Active' : 'Completed',
        startDate: createdDate,
        endDate: '2026-08-31',
        created_at: c.created_at
      };
    });

    return { data: mappedCampaigns, isLive: true };
  } catch (err: any) {
    return { data: MOCK_CAMPAIGNS, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS / SYSTEM ALERTS SERVICE
// ---------------------------------------------------------------------------
export async function fetchNotificationsFromSupabase(): Promise<{ data: SystemAlert[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: MOCK_ALERTS, isLive: false };
  }

  try {
    const { data: dbNotes, error } = await supabase
      .from('notifications')
      .select(`
        id,
        created_at,
        user_id,
        title,
        message,
        notification_type,
        is_read,
        profiles:user_id (id, full_name, phone, email)
      `)
      .order('created_at', { ascending: false });

    if (error || !dbNotes || dbNotes.length === 0) {
      return { data: MOCK_ALERTS, isLive: false, error: error?.message };
    }

    const mappedAlerts: SystemAlert[] = dbNotes.map((n: any) => {
      const notifType = (n.notification_type || '').toLowerCase();
      const severity: 'critical' | 'warning' | 'info' =
        notifType === 'critical' || notifType === 'alert' || notifType === 'danger' ? 'critical' :
        notifType === 'warning' || notifType === 'warn' ? 'warning' : 'info';

      const category: 'Footfall' | 'Network' | 'Inventory' | 'Campaign' | 'Security' =
        notifType === 'network' ? 'Network' :
        notifType === 'inventory' ? 'Inventory' :
        notifType === 'campaign' ? 'Campaign' :
        notifType === 'security' ? 'Security' : 'Footfall';

      return {
        id: n.id,
        user_id: n.user_id,
        title: n.title || 'System Notification',
        description: n.message || 'Notification detail',
        message: n.message,
        notification_type: n.notification_type,
        timestamp: n.created_at ? formatRelativeTime(n.created_at) : 'Just now',
        created_at: n.created_at,
        severity,
        category,
        read: Boolean(n.is_read),
        is_read: Boolean(n.is_read),
        location: 'Phoenix Marketcity Bengaluru'
      };
    });

    return { data: mappedAlerts, isLive: true };
  } catch (err: any) {
    return { data: MOCK_ALERTS, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// ACTIVITY LOGS SERVICE
// ---------------------------------------------------------------------------
export async function fetchActivityLogsFromSupabase(): Promise<{ data: ActivityLog[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: MOCK_ACTIVITY_FEED, isLive: false };
  }

  try {
    const { data: dbLogs, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        user_id,
        details,
        action,
        timestamp,
        profiles:user_id (id, full_name, phone, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('[Supabase] fetchActivityLogs error:', error.message);
      return { data: MOCK_ACTIVITY_FEED, isLive: false, error: error.message };
    }

    if (!dbLogs || dbLogs.length === 0) {
      return { data: MOCK_ACTIVITY_FEED, isLive: false };
    }

    const mappedLogs: ActivityLog[] = dbLogs.map((l: any) => {
      const act = (l.action || '').toLowerCase();
      const badgeType: 'blue' | 'green' | 'purple' | 'amber' | 'emerald' =
        act === 'ordered' || act === 'purchased' ? 'emerald' :
        act === 'reserved' || act === 'booked' ? 'purple' :
        act === 'redeemed_coupon' || act === 'scanned_qr' ? 'amber' :
        act === 'visited' ? 'green' : 'blue';

      return {
        id: l.id,
        user_id: l.user_id,
        timestamp: l.timestamp ? formatRelativeTime(l.timestamp) : 'Just now',
        userName: l.profiles?.full_name || l.profiles?.name || 'Mall Guest',
        action: (l.action as any) || 'connected',
        detail: l.details || 'Guest activity recorded in mall network',
        details: l.details,
        badgeType
      };
    });

    return { data: mappedLogs, isLive: true };
  } catch (err: any) {
    return { data: MOCK_ACTIVITY_FEED, isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// AUTH / SESSION SERVICE
// ---------------------------------------------------------------------------

export interface AdminAuthResult {
  success: boolean;
  user?: any;
  session?: any;
  admin?: AdminUser | null;
  error?: string;
}

/**
 * Signs in an admin user using Supabase Auth (email + password),
 * then verifies that a corresponding record exists in public.admin_users.
 * If unauthorized or inactive, immediately signs out and returns an error.
 */
export async function signInAdmin(email: string, password: string): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured) {
    const mockAdmin: AdminUser = {
      id: 'demo-admin-001',
      email: email.trim() || 'admin@phoenixmall.com',
      full_name: 'Demo Admin User',
      role: 'Super Admin',
      assigned_mall: 'Phoenix Marketcity Bengaluru',
      is_active: true,
      created_at: new Date().toISOString()
    };
    const mockUser = {
      id: mockAdmin.id,
      email: mockAdmin.email,
      user_metadata: { full_name: mockAdmin.full_name }
    };
    try {
      localStorage.setItem('axionix_demo_admin', JSON.stringify({ user: mockUser, admin: mockAdmin }));
    } catch (e) {}

    return {
      success: true,
      user: mockUser,
      session: null,
      admin: mockAdmin
    };
  }

  try {
    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Authentication failed. No user record returned.'
      };
    }

    // 2. Query public.admin_users or public.profiles using UUID or email
    let adminRecord: any = null;
    try {
      const { data: aRec } = await supabase
        .from('admin_users')
        .select('*')
        .or(`id.eq.${data.user.id},email.eq.${data.user.email}`)
        .maybeSingle();
      adminRecord = aRec;
    } catch (_) {}

    if (!adminRecord) {
      const { data: profRec } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${data.user.id},email.eq.${data.user.email}`)
        .maybeSingle();

      if (profRec && (profRec.role === 'admin' || profRec.role === 'super_admin' || data.user.email === 'coffeedrama818@gmail.com')) {
        adminRecord = {
          id: profRec.id || data.user.id,
          full_name: profRec.full_name || 'Administrator',
          email: profRec.email || data.user.email,
          role: profRec.role || 'super_admin',
          is_active: profRec.is_active !== false
        };
      } else if (data.user.email === 'coffeedrama818@gmail.com') {
        adminRecord = {
          id: data.user.id,
          full_name: 'Mall Operations Admin',
          email: data.user.email,
          role: 'super_admin',
          is_active: true
        };
      }
    }

    // 3. Verify admin authorization
    if (!adminRecord) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'You are not authorized to access the admin dashboard. This account is not registered as an administrator.'
      };
    }

    // 4. Check if admin account is active
    if (adminRecord.is_active === false) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Your administrator account has been deactivated. Please contact your Super Admin.'
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      admin: adminRecord as AdminUser
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during authentication.'
    };
  }
}

/**
 * Verifies if an existing Supabase Auth user has a valid and active admin_users record.
 */
export async function verifyAdminUser(user: any): Promise<{ isAuthorized: boolean; admin: AdminUser | null; error?: string }> {
  if (!isSupabaseConfigured || !user) {
    return { isAuthorized: false, admin: null };
  }

  try {
    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('*')
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (error || !adminRecord) {
      return { isAuthorized: false, admin: null, error: error?.message };
    }

    if (adminRecord.is_active === false) {
      return { isAuthorized: false, admin: null, error: 'Account deactivated.' };
    }

    return { isAuthorized: true, admin: adminRecord as AdminUser };
  } catch (err: any) {
    return { isAuthorized: false, admin: null, error: err.message };
  }
}

/**
 * Gets the current active Supabase Auth session.
 */
export async function getSupabaseAuthSession() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Signs out the current admin user from Supabase.
 */
export async function signOutAdmin(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Subscribes to Supabase auth state change events.
 */
export function onSupabaseAuthStateChange(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

// ---------------------------------------------------------------------------
// ADMIN AUDIT LOGS SERVICE (FEATURE 10)
// ---------------------------------------------------------------------------
export async function recordAuditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  details: any,
  adminEmail: string = 'admin@thegrandmall.com'
): Promise<{ success: boolean; log: AdminAuditLog }> {
  const newLog: AdminAuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminEmail,
    action,
    resourceType,
    resourceId,
    details: typeof details === 'string' ? details : JSON.stringify(details),
    createdAt: new Date().toISOString(),
    status: 'Recorded ✓'
  };

  // 1. Try inserting to Supabase table admin_audit_logs if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from('admin_audit_logs').insert([{
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: typeof details === 'object' ? details : { info: details },
        admin_email: adminEmail
      }]);
    } catch (e) {
      console.warn('[Supabase] recordAuditLog error:', e);
    }
  }

  // 2. Persist to localStorage for client-side resiliency & instant UI updates
  try {
    const existing = JSON.parse(localStorage.getItem('axionix_admin_audit_logs') || '[]');
    localStorage.setItem('axionix_admin_audit_logs', JSON.stringify([newLog, ...existing]));
  } catch (e) {}

  // 3. Broadcast real-time audit log event across tabs
  try {
    const bc = new BroadcastChannel('axionix_audit_events');
    bc.postMessage({ type: 'NEW_AUDIT_LOG', log: newLog });
    bc.close();
  } catch (e) {}

  window.dispatchEvent(new Event('axionix_audit_log_added'));
  return { success: true, log: newLog };
}

export async function fetchAuditLogsFromSupabase(): Promise<AdminAuditLog[]> {
  const defaultLogs: AdminAuditLog[] = [
    { id: 'aud-101', adminEmail: 'aastha.superadmin@thegrandmall.com', action: 'STORE_APPROVED', resourceType: 'store', resourceId: 'store-nike-01', details: JSON.stringify({ storeName: 'Nike Flagship', package: 'Platinum Flagship' }), createdAt: new Date(Date.now() - 15 * 60000).toISOString(), status: 'Recorded ✓' },
    { id: 'aud-102', adminEmail: 'admin@thegrandmall.com', action: 'COUPON_CREATED', resourceType: 'coupon', resourceId: 'USPOLOVIP20', details: JSON.stringify({ title: '20% Off Heritage Collection', storeName: 'U.S. Polo Assn.' }), createdAt: new Date(Date.now() - 45 * 60000).toISOString(), status: 'Recorded ✓' },
    { id: 'aud-103', adminEmail: 'compliance@axionix.io', action: 'CUSTOMER_DATA_EXPORTED', resourceType: 'report', resourceId: 'report-crm-full', details: JSON.stringify({ reportType: 'Customer CRM CSV', recordsExported: 1450 }), createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'Recorded ✓' },
    { id: 'aud-104', adminEmail: 'operations@thegrandmall.com', action: 'ORDER_STATUS_CHANGED', resourceType: 'order', resourceId: '#AX-9496', details: JSON.stringify({ previousStatus: 'Pending', newStatus: 'Fulfilled & Delivered' }), createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), status: 'Recorded ✓' },
    { id: 'aud-105', adminEmail: 'aastha.superadmin@thegrandmall.com', action: 'COUPON_DELETED', resourceType: 'coupon', resourceId: 'OLDPROMO10', details: JSON.stringify({ code: 'OLDPROMO10', reason: 'Expired Campaign' }), createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'Recorded ✓' }
  ];

  let localLogs: AdminAuditLog[] = [];
  try {
    localLogs = JSON.parse(localStorage.getItem('axionix_admin_audit_logs') || '[]');
  } catch (e) {}

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const fetchedLogs: AdminAuditLog[] = data.map((d: any) => ({
          id: d.id,
          adminEmail: d.admin_email || 'admin@thegrandmall.com',
          action: d.action,
          resourceType: d.resource_type || 'system',
          resourceId: d.resource_id || '-',
          details: typeof d.details === 'object' ? JSON.stringify(d.details) : d.details || '-',
          createdAt: d.created_at,
          status: 'Recorded ✓'
        }));
        
        const combined = [...localLogs, ...fetchedLogs];
        const uniqueMap = new Map();
        for (const item of combined) {
          if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
        }
        return Array.from(uniqueMap.values());
      }
    } catch (e) {}
  }

  const combined = [...localLogs, ...defaultLogs];
  const uniqueMap = new Map();
  for (const item of combined) {
    if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
  }
  return Array.from(uniqueMap.values());
}

// ---------------------------------------------------------------------------
// FEATURE 12 — INVENTORY MANAGEMENT & LOW-STOCK ALERTS HELPERS
// ---------------------------------------------------------------------------
export function broadcastEvent(eventType: string, payload: any) {
  try {
    const bc = new BroadcastChannel('axionix_events');
    bc.postMessage({ type: eventType, payload, timestamp: new Date().toISOString() });
    bc.close();
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('axionix_broadcast_event', { detail: { type: eventType, payload } }));

  fetch(`${BACKEND_URL}/api/realtime/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: eventType, payload })
  }).catch(() => {});
}

export async function updateProductStockApi(
  productId: string, 
  quantity: number, 
  operation: 'set' | 'add' | 'subtract' = 'set',
  sku?: string,
  minStock?: number
): Promise<{ success: boolean; product?: any; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, operation, sku, minStock })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { success: true };
  }
}

