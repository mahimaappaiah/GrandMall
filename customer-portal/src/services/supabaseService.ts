import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BACKEND_URL } from '../lib/config';

export interface CustomerProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  loyalty_tier?: string;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// CUSTOMER AUTH & PROFILES
// ---------------------------------------------------------------------------
export async function authenticateOrGetCustomerProfile(name: string, phone: string, email?: string): Promise<{ profile: CustomerProfile | null; error?: string }> {
  if (!isSupabaseConfigured) {
    return { profile: null };
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '');

    // 1. Ensure we always have an active authenticated Supabase session
    let { data: sessData } = await supabase.auth.getSession();
    let currentAuthUser = sessData?.session?.user;

    if (!currentAuthUser) {
      const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) console.warn('[Supabase Auth] signInAnonymously error:', anonErr.message);
      currentAuthUser = anonData?.user || undefined;
    }

    const userId = currentAuthUser?.id;
    if (!userId) {
      return { profile: null, error: 'Could not obtain active session' };
    }

    // 2. Check if a profile with this phone already exists in public.profiles
    let returningProfile: any = null;
    if (cleanPhone) {
      const { data: phoneMatch } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (phoneMatch) {
        returningProfile = phoneMatch;
      }
    }

    const profileData: any = {
      id: userId,
      full_name: name.trim() || returningProfile?.full_name || 'Mall Guest',
      phone: cleanPhone || returningProfile?.phone || undefined,
      role: returningProfile?.role || 'customer',
      loyalty_tier: returningProfile?.loyalty_tier || 'Bronze',
      is_active: true
    };
    if (email && email.trim()) {
      profileData.email = email.trim();
    } else if (returningProfile?.email) {
      profileData.email = returningProfile.email;
    }

    const { data: upserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (upsertErr) {
      console.warn('[Supabase Profiles] Upsert error:', upsertErr.message);
    }

    // Log WiFi connection activity for customer
    logActivityInSupabase({
      userId,
      customerName: profileData.full_name,
      action: 'connected',
      detail: 'Wi-Fi Connected',
      details: `${profileData.full_name} connected to AXIONIX High-Speed Mall WiFi.`,
      storeName: 'The Grand Mall'
    }).catch(() => {});

    // Notify Axionix Backend Live Telemetry
    try {
      fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profileData.phone,
          name: profileData.full_name,
          email: profileData.email,
          otp: '1234',
          captive: true
        })
      }).catch(() => {});
    } catch (e) {}

    return { profile: upserted || profileData };
  } catch (err: any) {
    console.error('[Supabase Auth] Exception in authenticateOrGetCustomerProfile:', err);
    return { profile: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// BRANDS & PRODUCTS
// ---------------------------------------------------------------------------
export async function fetchBrandsFromSupabase(): Promise<{ data: any[]; isLive: boolean }> {
  if (!isSupabaseConfigured) return { data: [], isLive: false };

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, category, floor, zone, logo_url, logo_variant, banner_url, open_hours, rating, status')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchBrands error:', error?.message);
      return { data: [], isLive: false };
    }

    return { data, isLive: true };
  } catch (err) {
    return { data: [], isLive: false };
  }
}

export async function fetchProductsFromSupabase(): Promise<{ data: any[]; isLive: boolean }> {
  if (!isSupabaseConfigured) return { data: [], isLive: false };

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, brand_id, name, category, description, price, image_url, sku, stock_quantity, is_available, brands(id, name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchProducts error:', error?.message);
      return { data: [], isLive: false };
    }

    return { data, isLive: true };
  } catch (err) {
    return { data: [], isLive: false };
  }
}

// ---------------------------------------------------------------------------
// HELPER: Resolve Effective User ID matching Supabase Auth session
// ---------------------------------------------------------------------------
export async function getEffectiveUserId(providedUserId?: string): Promise<string | null> {
  try {
    const { data: sessData } = await supabase.auth.getSession();
    const currentSessionUserId = sessData?.session?.user?.id;
    if (currentSessionUserId) {
      return currentSessionUserId;
    }
    const { data: anonData } = await supabase.auth.signInAnonymously();
    return anonData?.user?.id || providedUserId || null;
  } catch (e) {
    return providedUserId || null;
  }
}

// ---------------------------------------------------------------------------
// ORDERS & ORDER ITEMS
// ---------------------------------------------------------------------------
export async function createOrderInSupabase(orderData: {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeName: string;
  brandId?: string;
  items: { productId?: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  rawAmount: number;
  discountAmount: number;
  appliedCoupon?: string | null;
  paymentMethod: string;
}): Promise<{ order: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { order: null };

  try {
    const activeUserId = await getEffectiveUserId(orderData.userId);
    const orderNumber = `#AX-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRow: any = {
      order_number: orderNumber,
      user_id: activeUserId,
      customer_name: orderData.customerName || 'Valued Customer',
      customer_phone: orderData.customerPhone || null,
      customer_email: orderData.customerEmail || null,
      subtotal: orderData.rawAmount || orderData.totalAmount || 0,
      tax: 0,
      discount_amount: orderData.discountAmount || 0,
      total_amount: orderData.totalAmount,
      order_type: 'Click & Collect',
      payment_method: orderData.paymentMethod || 'UPI / GPay',
      payment_status: 'Paid',
      status: 'Pending'
    };

    const { data: createdOrder, error: orderErr } = await supabase
      .from('orders')
      .insert(orderRow)
      .select()
      .maybeSingle();

    if (orderErr) {
      console.error('[Supabase] createOrder error:', orderErr.message);
      return { order: null, error: orderErr.message };
    }

    // Insert order_items if order created
    if (createdOrder?.id && orderData.items && orderData.items.length > 0) {
      let prodMap = new Map<string, string>();
      try {
        const { data: dbProducts } = await supabase.from('products').select('id, name');
        if (dbProducts) {
          dbProducts.forEach((p: any) => {
            if (p.name) prodMap.set(p.name.toLowerCase().trim(), p.id);
          });
        }
      } catch (e) {}

      const itemRows = orderData.items.map(item => {
        const isProdUuid = item.productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
        const resolvedProdId = isProdUuid ? item.productId : (item.name ? prodMap.get(item.name.toLowerCase().trim()) || null : null);
        return {
          order_id: createdOrder.id,
          product_id: resolvedProdId,
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
          subtotal: (item.price || 0) * (item.quantity || 1)
        };
      });

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemRows);

      if (itemsErr) {
        console.warn('[Supabase] order_items insert error:', itemsErr.message);
      }
    }

    // Record coupon redemption if order was placed with a valid coupon
    if (createdOrder?.id && orderData.appliedCoupon) {
      redeemCouponInSupabase({
        couponCode: orderData.appliedCoupon,
        userId: activeUserId || undefined,
        orderId: createdOrder.id,
        discountApplied: orderData.discountAmount,
        savingsAmount: orderData.discountAmount
      }).catch(err => {
        console.warn('[Supabase] coupon redemption link notice:', err);
      });
    }

    // Log Activity for Live Admin Feed
    if (createdOrder?.id) {
      logActivityInSupabase({
        userId: activeUserId || undefined,
        action: 'ordered',
        detail: 'Placed Order',
        details: `${orderData.customerName || 'Mall Guest'} completed order #${createdOrder.order_number || '#AX-Order'} at ${orderData.storeName || 'Mall Store'} for ₹${orderData.totalAmount.toLocaleString()}.`,
        storeName: orderData.storeName || undefined
      }).catch(() => {});
    }

    // Notify Axionix Backend Live Telemetry
    try {
      fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: createdOrder?.order_number || orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          storeName: orderData.storeName,
          items: orderData.items,
          totalAmount: orderData.totalAmount,
          rawAmount: orderData.rawAmount,
          discountAmount: orderData.discountAmount,
          appliedCoupon: orderData.appliedCoupon,
          paymentMethod: orderData.paymentMethod
        })
      }).catch(() => {});
    } catch (e) {}

    return { order: createdOrder };
  } catch (err: any) {
    console.error('[Supabase] Exception in createOrder:', err);
    return { order: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// RESERVATIONS
// ---------------------------------------------------------------------------
export async function createReservationInSupabase(resData: {
  id?: string;
  refCode?: string;
  userId?: string;
  brandId?: string;
  storeName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  timeSlot: string;
  reservationDate?: string;
  date?: string;
  specialNotes?: string;
}): Promise<{ reservation: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { reservation: null };

  try {
    const activeUserId = await getEffectiveUserId(resData.userId);
    const refCode = resData.refCode || `RES-${(resData.storeName || 'MAL').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;

    let brandId = resData.brandId || null;
    if (!brandId && resData.storeName) {
      const { data: b } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', resData.storeName.trim())
        .maybeSingle();
      if (b?.id) {
        brandId = b.id;
      }
    }

    const bookingDate = resData.reservationDate || resData.date || new Date().toISOString().split('T')[0];

    const resRow = {
      ref_code: refCode,
      user_id: activeUserId,
      brand_id: brandId,
      guest_name: resData.guestName || 'Valued Guest',
      guest_phone: resData.guestPhone || null,
      guest_email: resData.guestEmail || null,
      party_size: Number(resData.partySize) || 2,
      reservation_date: bookingDate,
      time_slot: resData.timeSlot || '17:00 PM',
      notes: resData.specialNotes || 'VIP Guest Booking',
      status: 'Confirmed'
    };

    const { data: createdRes, error } = await supabase
      .from('reservations')
      .insert(resRow)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Supabase] createReservation error:', error.message);
      return { reservation: null, error: error.message };
    }

    // Log Activity for Live Admin Feed
    if (createdRes?.id) {
      logActivityInSupabase({
        userId: activeUserId || undefined,
        action: 'reserved',
        detail: 'Table Reservation',
        details: `${resData.guestName || 'VIP Guest'} booked a table/slot at ${resData.storeName || 'Mall Store'} (${resData.timeSlot}, party of ${resData.partySize}).`,
        storeName: resData.storeName || undefined
      }).catch(() => {});
    }

    // Notify Axionix Backend Live Telemetry
    try {
      fetch(`${BACKEND_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: createdRes?.id,
          refCode: createdRes?.ref_code || refCode,
          storeName: resData.storeName,
          guestName: resData.guestName,
          guestPhone: resData.guestPhone,
          guestEmail: resData.guestEmail,
          partySize: resData.partySize,
          timeSlot: resData.timeSlot,
          date: bookingDate,
          specialNotes: resData.specialNotes
        })
      }).catch(() => {});
    } catch (e) {}

    return { reservation: createdRes };
  } catch (err: any) {
    console.error('[Supabase] Exception in createReservation:', err);
    return { reservation: null, error: err.message };
  }
}

export async function cancelReservationInSupabase(refCodeOrId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'Cancelled' })
      .or(`ref_code.eq.${refCodeOrId},id.eq.${refCodeOrId}`);

    if (error) {
      console.warn('[Supabase] cancelReservation error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchReservationAvailability(storeName: string, date?: string): Promise<{ success: boolean; slots: any[] }> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  let liveReservations: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data: dbRes } = await supabase
        .from('reservations')
        .select('*, brands(name)')
        .eq('reservation_date', targetDate)
        .neq('status', 'Cancelled')
        .neq('status', 'No Show');

      if (dbRes && Array.isArray(dbRes)) {
        liveReservations = dbRes.map((r: any) => ({
          storeName: r.brands?.name || r.store_name || storeName,
          timeSlot: r.time_slot,
          partySize: Number(r.party_size) || 2,
          date: r.reservation_date
        }));
      }
    } catch (e) {}
  }

  // Fetch real-time capacity configurations & waitlist from backend (with fast timeout fallback)
  let backendCapacities: any = {};
  let backendWaitlist: any[] = [];
  try {
    const fetchCap = Promise.race([
      fetch(`${BACKEND_URL}/api/reservations/capacity?store=${encodeURIComponent(storeName)}`),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
    ]).then(r => r.json()).then(capData => {
      if (capData?.capacities) backendCapacities = capData.capacities;
    }).catch(() => {});

    const fetchWl = Promise.race([
      fetch(`${BACKEND_URL}/api/reservations/waitlist?store=${encodeURIComponent(storeName)}&date=${targetDate}`),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
    ]).then(r => r.json()).then(wlData => {
      if (wlData?.waitlist) backendWaitlist = wlData.waitlist;
    }).catch(() => {});

    await Promise.allSettled([fetchCap, fetchWl]);
  } catch (e) {}

  const DEFAULT_SLOT_CAPACITIES: Record<string, { default: number; [slot: string]: number }> = {
    // Food & Dining
    'Starbucks Reserve': { default: 8, '16:00 PM': 8, '17:00 PM': 8, '18:30 PM': 6, '20:00 PM': 6 },
    'Häagen-Dazs': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6 },
    'Din Tai Fung': { default: 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6, '21:30 PM': 4 },
    'PizzaExpress Gourmet': { default: 8, '17:00 PM': 8, '18:30 PM': 8, '20:00 PM': 8 },
    'Coffee Drama Cafe': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6 },
    'Subway Fresh Gourmet': { default: 6, '12:00 PM': 6, '14:00 PM': 6, '17:00 PM': 6 },

    // Fashion & Apparel
    'Nike Flagship': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 3 },
    'Zara Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
    'Zara Boutique': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
    'Gucci Boutique': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Prada Atelier': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'U.S. Polo Assn.': { default: 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 4 },
    'H&M Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 5 },

    // Accessories, Watches & Luxury
    'Rolex Boutique': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
    'Louis Vuitton Maison': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Tiffany & Co.': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Cartier High Jewelry': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
    'Apple Experience Store': { default: 6, '14:00 PM': 6, '16:00 PM': 6, '17:00 PM': 6 },
    'Ray-Ban Sunglass Hut': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
    'Sephora Beauty': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
    "PVR Director's Cut": { default: 10, '17:00 PM': 10, '20:00 PM': 10 }
  };

  const defaultCapsForStore = DEFAULT_SLOT_CAPACITIES[storeName] || { default: 6 };
  const storeCaps = { ...defaultCapsForStore, ...backendCapacities };
  const storeRes = liveReservations.filter((r: any) => 
    !storeName || storeName === 'All Stores' || (r.storeName?.toLowerCase().trim() === storeName.toLowerCase().trim())
  );

  const STANDARD_TIME_SLOTS = ['12:00 PM', '14:00 PM', '16:00 PM', '17:00 PM', '18:30 PM', '20:00 PM', '21:30 PM'];

  const slots = STANDARD_TIME_SLOTS.map(slot => {
    const maxCapacity = storeCaps[slot] !== undefined ? Number(storeCaps[slot]) : (storeCaps.default !== undefined ? Number(storeCaps.default) : 6);
    const cleanSlot = slot.replace(' PM', '').replace(' AM', '').trim();
    const slotRes = storeRes.filter((r: any) => {
      const rSlotClean = (r.timeSlot || '').replace(' PM', '').replace(' AM', '').trim();
      return rSlotClean === cleanSlot || (r.timeSlot || '').includes(cleanSlot) || r.timeSlot === slot;
    });
    const bookedCount = slotRes.reduce((sum: number, r: any) => sum + (Number(r.partySize) || 1), 0);
    const available = Math.max(0, maxCapacity - bookedCount);
    const isFull = available <= 0;
    const waitingCount = backendWaitlist.filter((w: any) => 
      (w.timeSlot === slot || (w.timeSlot || '').includes(cleanSlot)) && w.status === 'Waiting'
    ).length;

    return {
      timeSlot: slot,
      maxCapacity,
      bookedCount,
      available,
      isFull,
      waitlistCount: waitingCount
    };
  });

  return { success: true, slots };
}

export async function joinReservationWaitlist(waitlistData: {
  storeName: string;
  date: string;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  specialNotes?: string;
}): Promise<{ success: boolean; position?: number; entry?: any }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/reservations/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waitlistData)
    });
    const data = await res.json();
    return { success: data.success, position: data.position, entry: data.waitlistEntry };
  } catch (e) {
    return { success: true, position: 1 };
  }
}

// ---------------------------------------------------------------------------
// COUPONS
// ---------------------------------------------------------------------------
export async function fetchCouponsFromSupabase(): Promise<{ data: any[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { data: [], isLive: false };

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*, brands(id, name, category)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchCoupons error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    if (!data) return { data: [], isLive: true };

    const activeCoupons = data.filter((c: any) => {
      if (c.valid_until && new Date(c.valid_until) < new Date()) return false;
      if (c.valid_from && new Date(c.valid_from) > new Date()) return false;
      return true;
    });

    return { data: activeCoupons, isLive: true };
  } catch (err: any) {
    return { data: [], isLive: false, error: err.message };
  }
}

export async function validateCouponInSupabase(couponCode: string): Promise<{ coupon: any | null; isValid: boolean; error?: string }> {
  if (!isSupabaseConfigured || !couponCode) {
    return { coupon: null, isValid: false };
  }

  try {
    const cleanCode = couponCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from('coupons')
      .select('*, brands(id, name, category)')
      .eq('is_active', true)
      .ilike('code', cleanCode)
      .maybeSingle();

    if (error || !data) {
      return { coupon: null, isValid: false, error: error?.message || 'Coupon not found' };
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return { coupon: null, isValid: false, error: 'Coupon has expired' };
    }

    if (data.valid_from && new Date(data.valid_from) > new Date()) {
      return { coupon: null, isValid: false, error: 'Coupon is not yet active' };
    }

    return { coupon: data, isValid: true };
  } catch (err: any) {
    return { coupon: null, isValid: false, error: err.message };
  }
}

export async function redeemCouponInSupabase(redemptionData: {
  couponId?: string;
  couponCode?: string;
  userId?: string;
  customerName?: string;
  orderId?: string;
  brandId?: string;
  savingsAmount?: number;
  discountApplied?: number;
}): Promise<{ redemption: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { redemption: null };

  try {
    const activeUserId = await getEffectiveUserId(redemptionData.userId);

    let customerName = redemptionData.customerName;
    if (!customerName && activeUserId) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', activeUserId).maybeSingle();
      if (p?.full_name) customerName = p.full_name;
    }

    let resolvedCoupon: any = null;
    if (redemptionData.couponId) {
      const { data: cpn } = await supabase
        .from('coupons')
        .select('id, brand_id, discount_type, discount_value')
        .eq('id', redemptionData.couponId)
        .maybeSingle();
      resolvedCoupon = cpn;
    } else if (redemptionData.couponCode) {
      const { data: cpn } = await supabase
        .from('coupons')
        .select('id, brand_id, discount_type, discount_value')
        .ilike('code', redemptionData.couponCode.trim())
        .maybeSingle();
      resolvedCoupon = cpn;
    }

    if (!resolvedCoupon) {
      return { redemption: null, error: 'Coupon not found in database' };
    }

    // Prevent duplicate redemptions for the same order and coupon
    if (redemptionData.orderId) {
      const { data: existing } = await supabase
        .from('coupon_redemptions')
        .select('*')
        .eq('order_id', redemptionData.orderId)
        .eq('coupon_id', resolvedCoupon.id)
        .maybeSingle();

      if (existing) {
        return { redemption: existing };
      }
    }

    // Resolve brand_id, discount_applied, and savings_amount from actual applied coupon & checkout calculation
    const brandId = redemptionData.brandId || resolvedCoupon.brand_id || null;
    const discountApplied = redemptionData.discountApplied !== undefined 
      ? Number(redemptionData.discountApplied) 
      : (Number(resolvedCoupon.discount_value) || 0);
    const savingsAmount = redemptionData.savingsAmount !== undefined 
      ? Number(redemptionData.savingsAmount) 
      : (resolvedCoupon.discount_type === 'flat' ? Number(resolvedCoupon.discount_value) || 0 : 0);

    const row: any = {
      coupon_id: resolvedCoupon.id,
      user_id: activeUserId,
      customer_name: customerName || null,
      order_id: redemptionData.orderId || null,
      brand_id: brandId,
      discount_applied: discountApplied,
      savings_amount: savingsAmount,
      redeemed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('coupon_redemptions')
      .insert(row)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] redeemCoupon error:', error.message);
      return { redemption: null, error: error.message };
    }

    // Log Activity for Live Admin Feed
    if (activeUserId) {
      logActivityInSupabase({
        userId: activeUserId,
        customerName: customerName || undefined,
        action: 'redeemed_coupon',
        detail: 'Coupon Redeemed',
        details: `${customerName || 'Customer'} redeemed voucher ${redemptionData.couponCode || 'PROMO'} for ₹${savingsAmount.toLocaleString()} savings.`,
        createdAt: row.redeemed_at
      }).catch(() => {});
    }

    return { redemption: data };
  } catch (err: any) {
    return { redemption: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// STORE VISITS & WIFI SESSIONS
// ---------------------------------------------------------------------------
export async function recordWifiSessionInSupabase(userId?: string): Promise<{ session: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { session: null };
  try {
    const activeUserId = await getEffectiveUserId(userId);
    const row = {
      user_id: activeUserId,
      mac_address: 'FE:88:99:A1:B2:C3',
      ip_address: '192.168.10.142',
      is_active: true,
      connected_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('wifi_sessions').insert(row).select().maybeSingle();
    if (error) {
      console.warn('[Supabase] recordWifiSession error:', error.message);
      return { session: null, error: error.message };
    }
    return { session: data };
  } catch (e: any) {
    return { session: null, error: e.message };
  }
}

export async function disconnectWifiSessionInSupabase(userId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const activeUserId = await getEffectiveUserId(userId);
    if (activeUserId) {
      await supabase
        .from('wifi_sessions')
        .update({ is_active: false, disconnected_at: new Date().toISOString() })
        .eq('user_id', activeUserId)
        .eq('is_active', true);
    }
  } catch (e) {}
}

export async function recordStoreVisitInSupabase(
  userId?: string,
  brandIdOrName?: string,
  durationSeconds: number = 1800,
  customerName?: string
): Promise<{ visit: any | null; error?: string }> {
  if (!isSupabaseConfigured || !brandIdOrName) return { visit: null };
  try {
    const activeUserId = await getEffectiveUserId(userId);

    let activeCustomerName = customerName;
    if (!activeCustomerName && activeUserId) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', activeUserId).maybeSingle();
      if (p?.full_name) activeCustomerName = p.full_name;
    }

    let resolvedBrandId = brandIdOrName;
    let storeName = typeof brandIdOrName === 'string' && !brandIdOrName.includes('-') ? brandIdOrName : '';
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandIdOrName);
    
    if (!isUuid) {
      const { data: b } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('name', brandIdOrName.trim())
        .maybeSingle();
      if (b?.id) {
        resolvedBrandId = b.id;
        storeName = b.name || brandIdOrName;
      } else {
        return { visit: null, error: `Brand not found: ${brandIdOrName}` };
      }
    } else {
      const { data: b } = await supabase
        .from('brands')
        .select('name')
        .eq('id', brandIdOrName)
        .maybeSingle();
      if (b?.name) {
        storeName = b.name;
      }
    }

    const row: any = {
      user_id: activeUserId,
      customer_name: activeCustomerName || null,
      brand_id: resolvedBrandId,
      duration_seconds: durationSeconds || 1800,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('store_visits')
      .insert(row)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] recordStoreVisit (store_visits) error:', error.message);
    }

    // Persist to customer_journey
    if (activeUserId) {
      const { error: journeyErr } = await supabase
        .from('customer_journey')
        .insert({
          user_id: activeUserId,
          customer_name: activeCustomerName || null,
          brand_id: resolvedBrandId,
          duration_seconds: durationSeconds || 1800,
          created_at: row.created_at
        });

      if (journeyErr) {
        console.warn('[Supabase] recordStoreVisit (customer_journey) error:', journeyErr.message);
      }

      // Persist to activity_logs
      logActivityInSupabase({
        userId: activeUserId,
        customerName: activeCustomerName || undefined,
        action: 'visited',
        detail: 'Store Visit',
        details: `${activeCustomerName || 'Customer'} visited ${storeName || 'store'} at The Grand Mall.`,
        storeName: storeName || undefined,
        createdAt: row.created_at
      }).catch(() => {});
    }

    if (error) {
      return { visit: null, error: error.message };
    }

    return { visit: data };
  } catch (e: any) {
    return { visit: null, error: e.message };
  }
}

export async function fetchCustomerJourneyFromSupabase(userId?: string): Promise<{ data: any[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { data: [], isLive: false };

  try {
    let query = supabase
      .from('customer_journey')
      .select('*, brands:brand_id(id, name, category, floor, zone)')
      .order('created_at', { ascending: false });

    if (userId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isUuid) {
        query = query.eq('user_id', userId);
      }
    }

    let { data, error } = await query;

    // Fallback to store_visits if customer_journey has no records yet
    if (!error && (!data || data.length === 0)) {
      let svQuery = supabase
        .from('store_visits')
        .select('*, brands:brand_id(id, name, category, floor, zone)')
        .order('created_at', { ascending: false });

      if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        svQuery = svQuery.eq('user_id', userId);
      }
      const svRes = await svQuery;
      if (svRes.data && svRes.data.length > 0) {
        data = svRes.data;
      }
    }

    if (error && (!data || data.length === 0)) {
      console.warn('[Supabase] fetchCustomerJourney error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    return { data: data || [], isLive: true };
  } catch (err: any) {
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// ACTIVITY LOGS SERVICE
// ---------------------------------------------------------------------------
export async function logActivityInSupabase(activity: {
  userId?: string;
  customerName?: string;
  action: 'connected' | 'visited' | 'ordered' | 'redeemed_coupon' | 'reserved' | 'scanned_qr' | string;
  detail?: string;
  details: string;
  storeName?: string;
  createdAt?: string;
}): Promise<{ log: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { log: null };

  try {
    const activeUserId = await getEffectiveUserId(activity.userId);
    let activeCustomerName = activity.customerName;
    if (!activeCustomerName && activeUserId) {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', activeUserId).maybeSingle();
      if (p?.full_name) activeCustomerName = p.full_name;
    }

    const row: any = {
      user_id: activeUserId,
      customer_name: activeCustomerName || null,
      action: activity.action,
      detail: activity.detail || activity.action.replace('_', ' ').toUpperCase(),
      details: activity.details,
      store_name: activity.storeName || null,
      created_at: activity.createdAt || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert(row)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] logActivity error:', error.message);
      return { log: null, error: error.message };
    }

    return { log: data };
  } catch (err: any) {
    return { log: null, error: err.message };
  }
}

export async function fetchActivityLogsFromSupabase(): Promise<{ data: any[]; isLive: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { data: [], isLive: false };

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, user_id, action, detail, details, store_name, created_at, profiles:user_id(id, full_name, phone, email)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('[Supabase] fetchActivityLogs error:', error.message);
      return { data: [], isLive: false, error: error.message };
    }

    return { data: data || [], isLive: true };
  } catch (err: any) {
    return { data: [], isLive: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// LOYALTY POINTS & REWARDS API HELPERS
// ---------------------------------------------------------------------------
export interface LoyaltyAccount {
  userId: string;
  pointsBalance: number;
  tier: string;
  lifetimePoints: number;
}

export async function fetchLoyaltyAccount(userId: string): Promise<LoyaltyAccount | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/loyalty/${userId}`);
    const data = await res.json();
    if (data.success && data.account) {
      return data.account;
    }
  } catch (e) {}
  return { userId, pointsBalance: 250, tier: 'Bronze', lifetimePoints: 250 };
}

export async function earnLoyaltyPoints(userId: string, amountSpent: number): Promise<{ pointsEarned: number; account: LoyaltyAccount } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/loyalty/earn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountSpent })
    });
    const data = await res.json();
    if (data.success) {
      return { pointsEarned: data.pointsEarned, account: data.account };
    }
  } catch (e) {}
  return null;
}

export async function redeemLoyaltyPoints(userId: string, pointsToRedeem: number): Promise<{ discountValue: number; account: LoyaltyAccount } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pointsToRedeem })
    });
    const data = await res.json();
    if (data.success) {
      return { discountValue: data.discountValue, account: data.account };
    }
  } catch (e) {}
  return null;
}

// ---------------------------------------------------------------------------
// MALL PAY UNIFIED WALLET (FEATURE 11)
// ---------------------------------------------------------------------------
export interface MallWalletData {
  walletId: string;
  userPhone: string;
  balance: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    referenceId?: string;
    description: string;
    createdAt: string;
  }>;
  familyMembers: Array<{
    id: string;
    name: string;
    phone: string;
    relation: string;
  }>;
}

const GLOBAL_WALLET_KEY = 'axionix_mall_wallet_global_active';

function saveWalletToStorage(wallet: MallWalletData, userPhone: string) {
  const cleanPhone = (userPhone || wallet.userPhone || '9342013563').replace(/\D/g, '') || '9342013563';
  const dataStr = JSON.stringify(wallet);
  try {
    localStorage.setItem(GLOBAL_WALLET_KEY, dataStr);
    localStorage.setItem(`axionix_mall_wallet_${cleanPhone}`, dataStr);
    localStorage.setItem('axionix_mall_wallet_latest', dataStr);
  } catch (e) {}
}

export function getMallWallet(userPhone: string = 'guest'): MallWalletData {
  const activePhoneFromStorage = localStorage.getItem('axionix_active_guest_phone') || '';
  const inputPhone = userPhone || activePhoneFromStorage || '8495093177';
  const cleanPhone = inputPhone.replace(/\D/g, '') || '8495093177';

  try {
    const existing = localStorage.getItem(`axionix_mall_wallet_${cleanPhone}`) || 
                     localStorage.getItem(GLOBAL_WALLET_KEY) || 
                     localStorage.getItem('axionix_mall_wallet_latest');
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed && parsed.balance !== undefined && !isNaN(Number(parsed.balance))) {
        parsed.balance = Number(parsed.balance);
        return parsed;
      }
    }
  } catch (e) {}

  const defaultWallet: MallWalletData = {
    walletId: `wlt-${cleanPhone}`,
    userPhone: cleanPhone,
    balance: 57000,
    transactions: [
      { id: `tx-101`, amount: 57000, type: 'credit', referenceId: 'TOPUP-INIT', description: 'Initial Mall Pay Balance', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    familyMembers: [
      { id: 'fam-1', name: 'Sophia Ricky', phone: '+91 98765 11111', relation: 'Spouse' }
    ]
  };

  saveWalletToStorage(defaultWallet, cleanPhone);
  return defaultWallet;
}

export function topUpMallWallet(userPhone: string, amount: number, paymentMethod: string = 'UPI / GPay'): MallWalletData {
  const wallet = getMallWallet(userPhone);
  const currentBal = Number(wallet.balance) || 0;
  const topAmt = Number(amount) || 0;
  const newBalance = currentBal + topAmt;

  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount: topAmt,
    type: 'credit' as const,
    referenceId: `TOPUP-${Math.floor(1000 + Math.random() * 9000)}`,
    description: `Wallet Top-Up via ${paymentMethod}`,
    createdAt: new Date().toISOString()
  };

  const updatedWallet: MallWalletData = {
    ...wallet,
    balance: newBalance,
    transactions: [newTx, ...(wallet.transactions || [])]
  };

  saveWalletToStorage(updatedWallet, userPhone);

  if (isSupabaseConfigured) {
    try {
      Promise.resolve(supabase.from('mall_wallets').upsert({ user_phone: wallet.userPhone, balance: newBalance })).catch(() => {});
      Promise.resolve(supabase.from('wallet_transactions').insert({ wallet_id: wallet.walletId, amount: topAmt, type: 'credit', description: newTx.description })).catch(() => {});
      recordAdminAuditLogToSupabase({
        action: 'MALL_PAY_TOPUP',
        resourceType: 'wallet',
        resourceId: newTx.referenceId,
        details: { customerPhone: userPhone, amount: topAmt, channel: paymentMethod, newBalance }
      }).catch(() => {});
    } catch (e) {}
  }

  try {
    const bc = new BroadcastChannel('axionix_wallet_events');
    bc.postMessage({ type: 'WALLET_TOPUP', wallet: updatedWallet });
    bc.close();
  } catch (e) {}

  window.dispatchEvent(new Event('axionix_wallet_updated'));
  return updatedWallet;
}

export function deductMallWallet(userPhone: string, amount: number, orderRef: string): { success: boolean; wallet: MallWalletData; error?: string } {
  const wallet = getMallWallet(userPhone);
  const currentBal = Number(wallet.balance) || 0;
  const deductAmt = Number(amount) || 0;

  if (currentBal < deductAmt) {
    return { success: false, wallet, error: `Insufficient Mall Pay balance. Available: ₹${currentBal.toLocaleString()}, Required: ₹${deductAmt.toLocaleString()}` };
  }

  const newBalance = currentBal - deductAmt;
  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount: deductAmt,
    type: 'debit' as const,
    referenceId: orderRef,
    description: `Order Checkout at Concierge (${orderRef}) - 2x VIP Points Earned!`,
    createdAt: new Date().toISOString()
  };

  const updatedWallet: MallWalletData = {
    ...wallet,
    balance: newBalance,
    transactions: [newTx, ...(wallet.transactions || [])]
  };

  saveWalletToStorage(updatedWallet, userPhone);

  if (isSupabaseConfigured) {
    try {
      Promise.resolve(supabase.from('mall_wallets').upsert({ user_phone: wallet.userPhone, balance: newBalance })).catch(() => {});
      Promise.resolve(supabase.from('wallet_transactions').insert({ wallet_id: wallet.walletId, amount: deductAmt, type: 'debit', reference_id: orderRef, description: newTx.description })).catch(() => {});
      recordAdminAuditLogToSupabase({
        action: 'MALL_PAY_TRANSACTION',
        resourceType: 'wallet',
        resourceId: orderRef,
        details: { customerPhone: userPhone, amount: deductAmt, type: 'DEBIT', orderRef, newBalance }
      }).catch(() => {});
    } catch (e) {}
  }

  try {
    const bc = new BroadcastChannel('axionix_wallet_events');
    bc.postMessage({ type: 'WALLET_DEBIT', wallet: updatedWallet });
    bc.close();
  } catch (e) {}

  window.dispatchEvent(new Event('axionix_wallet_updated'));
  return { success: true, wallet: updatedWallet };
}

export async function recordAdminAuditLogToSupabase(logData: {
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  adminEmail?: string;
}) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('admin_audit_logs').insert({
        action: logData.action,
        resource_type: logData.resourceType,
        resource_id: logData.resourceId,
        details: typeof logData.details === 'object' ? JSON.stringify(logData.details) : logData.details,
        admin_email: logData.adminEmail || 'customer.portal@axionix.io',
        created_at: new Date().toISOString()
      });
    } catch (e) {}
  }
}

export function addFamilyMemberToWallet(userPhone: string, name: string, phone: string, relation: string): MallWalletData {
  const wallet = getMallWallet(userPhone);
  const newMember = {
    id: `fam-${Date.now()}`,
    name,
    phone,
    relation
  };

  const updatedWallet: MallWalletData = {
    ...wallet,
    familyMembers: [...wallet.familyMembers, newMember]
  };

  saveWalletToStorage(updatedWallet, userPhone);

  if (isSupabaseConfigured) {
    try {
      Promise.resolve(supabase.from('family_members').insert({ wallet_id: wallet.walletId, member_name: name, member_phone: phone, relation })).catch(() => {});
    } catch (e) {}
  }

  window.dispatchEvent(new Event('axionix_wallet_updated'));
  return updatedWallet;
}

