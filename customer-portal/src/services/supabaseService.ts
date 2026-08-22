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
    let userId: string | null = null;

    // 1. Check existing Auth session
    const { data: sessData } = await supabase.auth.getSession();
    if (sessData?.session?.user) {
      userId = sessData.session.user.id;
    } else {
      // 2. Sign In Anonymously if no active session
      const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) {
        console.warn('[Supabase Auth] signInAnonymously:', anonErr.message);
      }
      userId = anonData?.user?.id || null;
    }

    // 3. Query existing profile from public.profiles by userId
    if (userId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        // Update existing record if actual real name, phone, or email is provided
        const updates: any = {};
        if (name && name.trim() && existingProfile.full_name !== name.trim()) {
          updates.full_name = name.trim();
        }
        if (cleanPhone && cleanPhone.trim() && existingProfile.phone !== cleanPhone.trim()) {
          updates.phone = cleanPhone.trim();
        }
        if (email && email.trim() && existingProfile.email !== email.trim()) {
          updates.email = email.trim();
        }

        if (Object.keys(updates).length > 0) {
          const { data: updatedRecord } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .maybeSingle();

          const resData = updatedRecord || existingProfile;
          return {
            profile: {
              id: resData.id,
              full_name: resData.full_name || name.trim(),
              email: resData.email || email?.trim(),
              phone: resData.phone || cleanPhone.trim(),
              role: resData.role || 'customer',
              loyalty_tier: resData.loyalty_tier || 'Bronze',
              is_active: resData.is_active !== false
            }
          };
        }

        return {
          profile: {
            id: existingProfile.id,
            full_name: existingProfile.full_name || name.trim(),
            email: existingProfile.email || email?.trim(),
            phone: existingProfile.phone || cleanPhone.trim(),
            role: existingProfile.role || 'customer',
            loyalty_tier: existingProfile.loyalty_tier || 'Bronze',
            is_active: existingProfile.is_active !== false
          }
        };
      }

      // Check if a profile with this phone already exists to prevent duplicate profiles
      if (cleanPhone) {
        const { data: phoneMatch } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (phoneMatch) {
          const updates: any = {};
          if (name && name.trim() && phoneMatch.full_name !== name.trim()) {
            updates.full_name = name.trim();
          }
          if (email && email.trim() && phoneMatch.email !== email.trim()) {
            updates.email = email.trim();
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from('profiles').update(updates).eq('id', phoneMatch.id);
          }
          return {
            profile: {
              id: phoneMatch.id,
              full_name: name.trim() || phoneMatch.full_name || 'Mall Guest',
              email: email?.trim() || phoneMatch.email,
              phone: phoneMatch.phone || cleanPhone,
              role: phoneMatch.role || 'customer',
              loyalty_tier: phoneMatch.loyalty_tier || 'Bronze',
              is_active: phoneMatch.is_active !== false
            }
          };
        }
      }

      // Upsert profile into public.profiles with actual real customer information
      const newProfile: any = {
        id: userId,
        full_name: name.trim() || 'Mall Guest',
        phone: cleanPhone || undefined,
        role: 'customer',
        loyalty_tier: 'Bronze',
        is_active: true
      };
      if (email && email.trim()) {
        newProfile.email = email.trim();
      }

      const { data: upserted, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (upsertErr) {
        console.warn('[Supabase Profiles] Upsert error:', upsertErr.message);
      }

      return { profile: upserted || newProfile };
    }

    // Lookup existing profile by phone if auth session failed
    if (cleanPhone) {
      const { data: phoneProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (phoneProfile) {
        return {
          profile: {
            id: phoneProfile.id,
            full_name: phoneProfile.full_name || name.trim(),
            email: phoneProfile.email || email?.trim(),
            phone: phoneProfile.phone || cleanPhone,
            role: phoneProfile.role || 'customer',
            loyalty_tier: phoneProfile.loyalty_tier || 'Bronze',
            is_active: phoneProfile.is_active !== false
          }
        };
      }
    }

    return { profile: null };
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
      .order('name', { ascending: true });

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
      .order('name', { ascending: true });

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
    const { data: sessData } = await supabase.auth.getSession();
    const activeUserId = orderData.userId || sessData?.session?.user?.id || null;

    const orderNumber = `#AX-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRow: any = {
      order_number: orderNumber,
      user_id: activeUserId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail || null,
      subtotal: orderData.rawAmount,
      tax: 0,
      discount_amount: orderData.discountAmount || 0,
      total_amount: orderData.totalAmount,
      order_type: 'Click & Collect',
      payment_method: orderData.paymentMethod,
      payment_status: 'Paid',
      status: 'Completed'
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
      const itemRows = orderData.items.map(item => ({
        order_id: createdOrder.id,
        product_id: item.productId || null,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

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
        userId: activeUserId,
        orderId: createdOrder.id,
        brandId: createdOrder.brand_id || undefined,
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
        details: `${orderData.customerName || 'Mall Guest'} completed order #${createdOrder.order_number || '#AX-Order'} at ${orderData.storeName || 'Mall Store'} for ₹${orderData.totalAmount.toLocaleString()}.`
      }).catch(() => {});
    }

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
  specialNotes?: string;
}): Promise<{ reservation: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { reservation: null };

  try {
    const refCode = resData.refCode || `RES-${resData.storeName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;

    const resRow = {
      ref_code: refCode,
      user_id: resData.userId || null,
      brand_id: resData.brandId || null,
      guest_name: resData.guestName,
      guest_phone: resData.guestPhone,
      guest_email: resData.guestEmail || null,
      party_size: resData.partySize,
      time_slot: resData.timeSlot,
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
        userId: resData.userId || undefined,
        action: 'reserved',
        details: `${resData.guestName || 'VIP Guest'} booked a table/slot at ${resData.storeName} (${resData.timeSlot}, party of ${resData.partySize}).`
      }).catch(() => {});
    }

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
  try {
    const res = await fetch(`${BACKEND_URL}/api/reservations/availability?store=${encodeURIComponent(storeName)}&date=${date || new Date().toISOString().split('T')[0]}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.slots)) {
      return { success: true, slots: data.slots };
    }
  } catch (e) {}

  // Fallback default slots
  return {
    success: true,
    slots: [
      { timeSlot: '12:00 PM', maxCapacity: 8, bookedCount: 1, available: 7, isFull: false, waitlistCount: 0 },
      { timeSlot: '14:00 PM', maxCapacity: 8, bookedCount: 2, available: 6, isFull: false, waitlistCount: 0 },
      { timeSlot: '16:00 PM', maxCapacity: 8, bookedCount: 3, available: 5, isFull: false, waitlistCount: 0 },
      { timeSlot: '17:00 PM', maxCapacity: 8, bookedCount: 5, available: 3, isFull: false, waitlistCount: 0 },
      { timeSlot: '18:30 PM', maxCapacity: 6, bookedCount: 6, available: 0, isFull: true, waitlistCount: 1 },
      { timeSlot: '20:00 PM', maxCapacity: 6, bookedCount: 4, available: 2, isFull: false, waitlistCount: 0 },
      { timeSlot: '21:30 PM', maxCapacity: 6, bookedCount: 1, available: 5, isFull: false, waitlistCount: 0 }
    ]
  };
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
  orderId?: string;
  brandId?: string;
  savingsAmount?: number;
  discountApplied?: number;
}): Promise<{ redemption: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { redemption: null };

  try {
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
        .eq('code', redemptionData.couponCode.trim().toUpperCase())
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
      user_id: redemptionData.userId || null,
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

    return { redemption: data };
  } catch (err: any) {
    return { redemption: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// STORE VISITS & WIFI SESSIONS
// ---------------------------------------------------------------------------
export async function recordWifiSessionInSupabase(userId?: string, phone?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('wifi_sessions').insert({
      user_id: userId || null,
      phone: phone || null,
      mac_address: 'FE:88:99:A1:B2:C3',
      ip_address: '192.168.10.142'
    });
  } catch (e) {}
}

export async function recordStoreVisitInSupabase(
  userId?: string,
  brandIdOrName?: string,
  durationSeconds: number = 1800
): Promise<{ visit: any | null; error?: string }> {
  if (!isSupabaseConfigured || !brandIdOrName) return { visit: null };
  try {
    let resolvedBrandId = brandIdOrName;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandIdOrName);
    if (!isUuid) {
      const { data: b } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', brandIdOrName.trim())
        .maybeSingle();
      if (b?.id) {
        resolvedBrandId = b.id;
      } else {
        return { visit: null, error: `Brand not found: ${brandIdOrName}` };
      }
    }

    const row = {
      user_id: userId || null,
      brand_id: resolvedBrandId,
      duration_seconds: durationSeconds,
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

    // Persist to customer_journey only when an authenticated userId exists
    if (userId) {
      const { error: journeyErr } = await supabase
        .from('customer_journey')
        .insert({
          user_id: userId,
          brand_id: resolvedBrandId,
          duration_seconds: durationSeconds,
          created_at: row.created_at
        });

      if (journeyErr) {
        console.warn('[Supabase] recordStoreVisit (customer_journey) error:', journeyErr.message);
      }
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
  action: 'connected' | 'visited' | 'ordered' | 'redeemed_coupon' | 'reserved' | 'scanned_qr' | string;
  details: string;
  timestamp?: string;
}): Promise<{ log: any | null; error?: string }> {
  if (!isSupabaseConfigured) return { log: null };

  try {
    const row = {
      user_id: activity.userId || null,
      action: activity.action,
      details: activity.details,
      timestamp: activity.timestamp || new Date().toISOString()
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
      .select('*, profiles:user_id(id, full_name, phone, email)')
      .order('timestamp', { ascending: false })
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

