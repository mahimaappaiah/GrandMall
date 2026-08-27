import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Core Operating Module Views
import { DashboardView } from './components/views/DashboardView';
import { MallOverviewView } from './components/views/MallOverviewView';
import { CaptivePortalView } from './components/views/CaptivePortalView';
import { TenantDashboardView } from './components/views/TenantDashboardView';
import { CustomerCrmView } from './components/views/CustomerCrmView';
import { StoreManagementView } from './components/views/StoreManagementView';
import { CampaignsView } from './components/views/CampaignsView';
import { NotificationsView } from './components/views/NotificationsView';
import { SuperAdminView } from './components/views/SuperAdminView';
import { LoginView } from './components/views/LoginView';

// Operations & Analytics Views
import { ConnectedUsersView } from './components/views/ConnectedUsersView';
import { StoreDirectoryView } from './components/views/StoreDirectoryView';
import { OrdersView } from './components/views/OrdersView';
import { ReservationsView } from './components/views/ReservationsView';
import { CouponsView } from './components/views/CouponsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { LoyaltyView } from './components/views/LoyaltyView';
import { BACKEND_URL } from './lib/config';

// Modals
import { StoreDetailModal } from './components/StoreDetailModal';
import { UserJourneyModal } from './components/UserJourneyModal';
import { ExportReportModal } from './components/ExportReportModal';

import { ViewType, Store, ConnectedUser, UserRole, Order, Reservation, Coupon, AdminUser, SystemAlert } from './types';
import { MOCK_STORES, MOCK_ALERTS, MOCK_USERS, MOCK_ORDERS, MOCK_RESERVATIONS, MOCK_COUPONS } from './data/mockData';
import { 
  fetchStoresFromSupabase, 
  fetchConnectedUsersFromSupabase, 
  fetchOrdersFromSupabase, 
  fetchReservationsFromSupabase, 
  fetchCouponsFromSupabase,
  fetchCampaignsFromSupabase,
  fetchNotificationsFromSupabase,
  markNotificationAsReadInSupabase,
  markAllNotificationsAsReadInSupabase,
  getSupabaseAuthSession,
  verifyAdminUser,
  signOutAdmin,
  onSupabaseAuthStateChange
} from './services/supabaseService';
import { realtimeManager } from './services/realtimeService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMall, setSelectedMall] = useState('Phoenix Marketcity Bengaluru');
  const [userRole, setUserRole] = useState<UserRole>('Super Admin');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active Modals state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [reportModalType, setReportModalType] = useState<string | null>(null);

  // Real-time toast state
  const [liveToast, setLiveToast] = useState<{ title: string; message: string } | null>(null);

  const [alertsList, setAlertsList] = useState<SystemAlert[]>(MOCK_ALERTS);
  const unreadAlertsCount = alertsList.filter(a => !a.read).length;

  const handleDismissAlert = (id: string) => {
    setAlertsList(prev => prev.filter(a => a.id !== id));
    markNotificationAsReadInSupabase(id).catch(() => {});
  };

  const handleMarkAllAlertsRead = () => {
    setAlertsList(prev => prev.map(a => ({ ...a, read: true, is_read: true })));
    markAllNotificationsAsReadInSupabase().catch(() => {});
  };

  // Stores List State (Loaded from Supabase brands, falling back to mock)
  const [storesList, setStoresList] = useState<Store[]>(MOCK_STORES);

  // Real-time Lists State (Preserved and Persistent across browser refreshes)
  const [usersList, setUsersList] = useState<ConnectedUser[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_orders_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [reservationsList, setReservationsList] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_reservations_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [couponsList, setCouponsList] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_coupons_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
    } catch (e) {}
    localStorage.removeItem('axionix_coupons_list');
    return MOCK_COUPONS;
  });

  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  useEffect(() => {
    try { localStorage.setItem('axionix_users_list', JSON.stringify(usersList)); } catch (e) {}
  }, [usersList]);

  useEffect(() => {
    try { localStorage.setItem('axionix_orders_list', JSON.stringify(ordersList)); } catch (e) {}
  }, [ordersList]);

  useEffect(() => {
    try { localStorage.setItem('axionix_reservations_list', JSON.stringify(reservationsList)); } catch (e) {}
  }, [reservationsList]);

  useEffect(() => {
    try { localStorage.setItem('axionix_coupons_list', JSON.stringify(couponsList)); } catch (e) {}
  }, [couponsList]);

  // Load live notifications / alerts from Supabase
  useEffect(() => {
    let isMounted = true;
    fetchNotificationsFromSupabase().then(res => {
      if (isMounted && res.data && res.isLive) {
        setAlertsList(res.data);
      }
    }).catch(err => {
      console.warn('[App] Notifications load error:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Restore existing Supabase session & listen for auth changes
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await getSupabaseAuthSession();
        if (session?.user) {
          const { isAuthorized, admin } = await verifyAdminUser(session.user);
          if (isMounted) {
            if (isAuthorized && admin) {
              setCurrentUser(session.user);
              setCurrentAdmin(admin);
              if (admin.role) {
                setUserRole(admin.role as UserRole);
              }
            } else {
              await signOutAdmin();
              setCurrentUser(null);
              setCurrentAdmin(null);
            }
          }
        } else {
          // Restore demo admin session if present
          try {
            const savedDemo = localStorage.getItem('axionix_demo_admin');
            if (savedDemo && isMounted) {
              const { user, admin } = JSON.parse(savedDemo);
              if (user && admin) {
                setCurrentUser(user);
                setCurrentAdmin(admin);
                if (admin.role) setUserRole(admin.role as UserRole);
              }
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[Supabase Auth] Session restore error:', err);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    const { data: authSub } = onSupabaseAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          setCurrentUser(null);
          setCurrentAdmin(null);
          setAuthLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { isAuthorized, admin } = await verifyAdminUser(session.user);
          if (isMounted) {
            if (isAuthorized && admin) {
              setCurrentUser(session.user);
              setCurrentAdmin(admin);
              if (admin.role) {
                setUserRole(admin.role as UserRole);
              }
            } else {
              await signOutAdmin();
              setCurrentUser(null);
              setCurrentAdmin(null);
            }
          }
        }
        if (isMounted) setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authSub?.subscription?.unsubscribe();
    };
  }, []);

  const loadSupabaseData = async () => {
    try {
      const [storesRes, usersRes, ordersRes, resRes, cpnRes, campRes] = await Promise.all([
        fetchStoresFromSupabase(),
        fetchConnectedUsersFromSupabase(),
        fetchOrdersFromSupabase(),
        fetchReservationsFromSupabase(),
        fetchCouponsFromSupabase(),
        fetchCampaignsFromSupabase()
      ]);

      if (storesRes.data && storesRes.data.length > 0) {
        setStoresList(storesRes.data);
      }
      if (usersRes.data && usersRes.isLive) {
        setUsersList(usersRes.data);
      }
      if (ordersRes.data && ordersRes.isLive) {
        setOrdersList(ordersRes.data);
      }
      if (resRes.data && resRes.isLive) {
        setReservationsList(resRes.data);
      }
      if (cpnRes.data && cpnRes.isLive) {
        setCouponsList(cpnRes.data);
      }
      if (campRes.data && campRes.data.length > 0) {
        setCampaignsList(campRes.data);
      }
    } catch (err) {
      console.warn('[App] Supabase data load error:', err);
    }
  };

  // Centralized Controlled Supabase Realtime Subscriptions
  useEffect(() => {
    if (!currentUser) {
      realtimeManager.cleanup();
      return;
    }

    // Load full historical baseline immediately when authenticated admin session is ready
    loadSupabaseData();

    realtimeManager.init();

    const unsubNotifs = realtimeManager.subscribe('notifications', () => {
      fetchNotificationsFromSupabase().then(res => {
        if (res.data && res.isLive) {
          setAlertsList(res.data);
        }
      });
    });

    const unsubOrders = realtimeManager.subscribe('orders', () => {
      fetchOrdersFromSupabase().then(res => {
        if (res.data && res.isLive) {
          setOrdersList(res.data);
        }
      });
    });

    const unsubRes = realtimeManager.subscribe('reservations', () => {
      fetchReservationsFromSupabase().then(res => {
        if (res.data && res.isLive) {
          setReservationsList(res.data);
        }
      });
    });

    const unsubWifi = realtimeManager.subscribe('wifi_sessions', () => {
      fetchConnectedUsersFromSupabase().then(res => {
        if (res.data && res.isLive) {
          setUsersList(res.data);
        }
      });
    });

    return () => {
      unsubNotifs();
      unsubOrders();
      unsubRes();
      unsubWifi();
    };
  }, [currentUser]);

  const handleSignOut = async () => {
    realtimeManager.cleanup();
    await signOutAdmin();
    try { localStorage.removeItem('axionix_demo_admin'); } catch (e) {}
    setCurrentUser(null);
    setCurrentAdmin(null);
  };

  const matchUser = (u: ConnectedUser, phone?: string, name?: string) => {
    const p1 = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const p2 = u.phone ? u.phone.replace(/\D/g, '').slice(-10) : '';
    const n1 = name ? name.toLowerCase().trim() : '';
    const n2 = u.name ? u.name.toLowerCase().trim() : '';
    return (p1 && p2 && p1 === p2) || (n1 && n2 && n1 === n2);
  };

  const handleRealtimeEvent = (type: string, payload: any) => {
    if (type === 'GUEST_CHECKIN') {
      const guestName = payload.user?.name || payload.name || 'Valued Guest';
      const guestFloor = payload.user?.floor || payload.floor || 'Ground Floor';
      const guestPhone = payload.user?.phone_number || payload.phone || '+91 98765 43210';
      const guestId = payload.user?.id || payload.userId || payload.id;

      const newUser: ConnectedUser = {
        id: guestId || 'usr-' + Date.now(),
        name: guestName,
        phone: guestPhone,
        macAddress: 'FE:88:99:A1:B2:C3',
        ipAddress: '192.168.10.199',
        connectionTime: 'Just now',
        sessionDuration: '1m',
        visitedStores: [],
        dataUsed: '15 MB',
        status: 'Active',
        vipStatus: true,
        zone: guestFloor,
        deviceType: 'iOS'
      };

      setUsersList(prev => {
        const cleanP = (guestPhone || '').replace(/\D/g, '').slice(-10);
        const cleanN = (guestName || '').trim().toLowerCase();
        const isDistinctName = cleanN && cleanN !== 'valued guest' && cleanN !== 'mall guest' && !cleanN.startsWith('guest ');

        const matchPredicate = (u: ConnectedUser) => {
          const uP = (u.phone || '').replace(/\D/g, '').slice(-10);
          if (cleanP && cleanP.length === 10 && uP === cleanP) return true;
          if (isDistinctName && u.name && u.name.trim().toLowerCase() === cleanN) return true;
          return false;
        };

        const existing = prev.find(matchPredicate);
        const filtered = prev.filter(u => !matchPredicate(u));
        const visitedStores = existing?.visitedStores || [];

        return [{
          ...newUser,
          ...existing,
          id: existing?.id || newUser.id,
          user_id: existing?.user_id || newUser.user_id,
          name: guestName || existing?.name,
          phone: guestPhone || existing?.phone,
          visitedStores,
          status: 'Active',
          connectionTime: 'Just now',
          _rawTimestamp: new Date().toISOString()
        }, ...filtered];
      });

      setLiveToast({
        title: 'New Guest Connected Wi-Fi',
        message: `${guestName} checked in at ${guestFloor}`
      });
    } else if (type === 'GUEST_DISCONNECTED' || type === 'GUEST_DISCONNECT') {
      const phone = payload.phone || payload.phone_number || payload.user?.phone_number || payload.user?.phone;
      const name = payload.name || payload.userName || payload.user?.name;
      const userId = payload.userId || payload.user_id || payload.id || payload.user?.id;

      setUsersList(prev => {
        return prev.map(u => {
          if (matchUser(u, phone, name) || (userId && (u.id === userId || (u as any).user_id === userId))) {
            return { ...u, status: 'Disconnected' as const };
          }
          return u;
        });
      });

      setLiveToast({
        title: 'Guest Disconnected / Logged Out',
        message: `${name || payload.user?.name || 'Guest'} session closed.`
      });
    } else if (type === 'STORE_VISITED' || type === 'STORE_VISIT') {
      const phone = payload.user_phone || payload.phone || (payload.user && payload.user.phone);
      const name = payload.user_name || payload.userName || (payload.user && payload.user.name);
      const store = payload.store_name || payload.storeName;
      if (!store || store === 'Wi-Fi Captive Portal') return;

      setUsersList(prev => prev.map(u => {
        if (matchUser(u, phone, name)) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const stores = currentStores.includes(store) ? currentStores : [...currentStores, store];
          return { ...u, visitedStores: stores, dataUsed: `${(stores.length * 45) + 15} MB` };
        }
        return u;
      }));

      fetchStoresFromSupabase().then(res => {
        if (res.data && res.data.length > 0) setStoresList(res.data);
      });
    } else if (type === 'ORDER_CREATED' || type === 'NEW_ORDER') {
      const orderPayload = payload.order || payload || {};
      const orderNum = orderPayload.orderNumber || orderPayload.order_number || `#AX-${Math.floor(1000 + Math.random() * 9000)}`;
      const targetStore = orderPayload.storeName || orderPayload.store_name || 'The Grand Mall Store';
      const custName = orderPayload.customerName || orderPayload.user_name || orderPayload.guest_name || 'Valued Guest';
      const custPhone = orderPayload.customerPhone || orderPayload.user_phone || '+91 84950 93170';

      const rawItems = Array.isArray(orderPayload.items) && orderPayload.items.length > 0 ? orderPayload.items.map((i: any) => {
        const itemName = i.name || (i.item && i.item.name) || i.item_name || 'Designer Item';
        const itemPrice = Number(i.price !== undefined ? i.price : (i.item && i.item.price !== undefined ? i.item.price : 2495));
        const itemQty = Number(i.quantity || i.qty || 1);
        const itemStore = i.brandName || (i.item && i.item.brandName) || i.storeName || i.store_name || targetStore;
        return {
          name: itemName,
          quantity: itemQty,
          price: itemPrice,
          brandName: itemStore,
          storeName: itemStore
        };
      }) : [
        { name: orderPayload.item_name || 'Designer Item', quantity: Number(orderPayload.quantity || 1), price: Number(orderPayload.totalAmount || 2495), storeName: targetStore, brandName: targetStore }
      ];

      const itemStores = Array.from(new Set(rawItems.map((it: any) => it.storeName || it.brandName).filter(Boolean)));
      const combinedStoreName = targetStore || (itemStores.length > 1 ? itemStores.join(', ') : (itemStores[0] || 'The Grand Mall Store'));

      const itemsList = Array.isArray(orderPayload.itemsList) ? orderPayload.itemsList :
                        rawItems.map((i: any) => `${i.name} (x${i.quantity})`);

      const newOrder: Order = {
        id: String(orderPayload.id || 'ord-' + Date.now()),
        orderNumber: orderNum,
        customerName: custName,
        customerPhone: custPhone,
        storeName: combinedStoreName,
        storeCategory: orderPayload.storeCategory || 'Fashion',
        orderType: orderPayload.orderType || 'Click & Collect',
        paymentMethod: orderPayload.paymentMethod || 'UPI / GPay',
        totalAmount: Number(orderPayload.totalAmount || orderPayload.total_amount || rawItems.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0)),
        itemsCount: Number(orderPayload.itemsCount || rawItems.reduce((acc: number, i: any) => acc + i.quantity, 0)),
        timestamp: orderPayload.timestamp || 'Just now',
        status: 'Completed',
        itemsList,
        items: rawItems
      };

      setOrdersList(prev => [newOrder, ...prev.filter(o => o.orderNumber !== newOrder.orderNumber)]);

      // Update visited stores only for the matched customer
      setUsersList(prev => prev.map(u => {
        if (matchUser(u, custPhone, custName)) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const storesToAdd = itemStores.length > 0 ? itemStores : [combinedStoreName];
          const stores = Array.from(new Set([...currentStores, ...storesToAdd])).filter(s => s && s !== 'Wi-Fi Captive Portal');
          return { ...u, visitedStores: stores, dataUsed: `${(stores.length * 45) + 15} MB` };
        }
        return u;
      }));

      // Refresh authoritative store metrics from Supabase
      fetchStoresFromSupabase().then(res => {
        if (res.data && res.data.length > 0) setStoresList(res.data);
      });

      setLiveToast({
        title: `Order ${newOrder.orderNumber} Placed`,
        message: `${newOrder.customerName} placed order for ${newOrder.itemsCount} items!`
      });
    } else if (type === 'RESERVATION_CREATED') {
      const resPayload = payload.reservation || payload || {};
      const targetVenue = resPayload.storeName || resPayload.store_name || resPayload.venue || 'Starbucks Reserve';
      const gName = resPayload.guestName || resPayload.guest_name || resPayload.user_name || 'Valued Guest';
      const gPhone = resPayload.guestPhone || resPayload.user_phone || resPayload.guest_phone || '+91 84950 93170';
      const refC = resPayload.refCode || resPayload.ref_code || `RES-${targetVenue.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const newRes: Reservation = {
        id: String(resPayload.id || 'res-' + Date.now()),
        refCode: refC,
        guestName: gName,
        guestPhone: gPhone,
        storeName: targetVenue,
        partySize: Number(resPayload.partySize || resPayload.guest_count || resPayload.party_size || 2),
        timeSlot: resPayload.timeSlot || resPayload.reservation_time || resPayload.preferred_time || '05:30 PM Today',
        specialNotes: resPayload.specialNotes || resPayload.special_notes || resPayload.specialRequest || 'VIP Concierge Booking',
        specialRequest: resPayload.specialNotes || resPayload.special_notes || 'VIP Concierge Booking',
        status: 'Confirmed'
      };

      setReservationsList(prev => [newRes, ...prev.filter(r => r.refCode !== newRes.refCode)]);

      setUsersList(prev => prev.map(u => {
        if (matchUser(u, gPhone, gName)) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const stores = currentStores.includes(targetVenue) ? currentStores : [...currentStores, targetVenue];
          return { ...u, visitedStores: stores };
        }
        return u;
      }));

      fetchStoresFromSupabase().then(res => {
        if (res.data && res.data.length > 0) setStoresList(res.data);
      });

      setLiveToast({
        title: 'Fitting Room / Table Reserved',
        message: `Reservation ${newRes.refCode} confirmed for ${newRes.guestName} at ${targetVenue}.`
      });
    } else if (type === 'COUPON_REDEEMED') {
      const code = payload.code;
      setCouponsList(prev => prev.map(c => {
        if (c.code === code) {
          return {
            ...c,
            redeemedCount: c.redeemedCount + 1,
            redeemedCustomers: [
              {
                id: 'rdm-' + Date.now(),
                customerName: payload.user_name || 'Valued Guest',
                customerPhone: payload.user_phone || '+91 98765 43210',
                timestamp: 'Just now',
                channel: 'WiFi Portal'
              },
              ...c.redeemedCustomers
            ]
          };
        }
        return c;
      }));

      setLiveToast({
        title: 'Promo Coupon Redeemed!',
        message: `Coupon code '${code}' redeemed by ${payload.user_name || 'Guest'}`
      });
    }
  };

  const fetchBackendConnectedUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/connected-users`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsersList(prev => {
          const map = new Map<string, ConnectedUser>();
          prev.forEach(u => {
            const key = (u.phone || '').replace(/\D/g, '').slice(-10) || (u.name || '').toLowerCase();
            map.set(key, { ...u });
          });
          data.users.forEach((u: any) => {
            const key = (u.phone || '').replace(/\D/g, '').slice(-10) || (u.name || '').toLowerCase();
            const existing = map.get(key);
            const existingStores = existing?.visitedStores || [];
            const incomingStores = Array.isArray(u.visitedStores) ? u.visitedStores : [];
            const mergedStores = Array.from(new Set([...existingStores, ...incomingStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

            map.set(key, {
              ...existing,
              ...u,
              visitedStores: mergedStores,
              status: u.status || existing?.status || 'Active'
            });
          });
          return Array.from(map.values());
        });
      }
    } catch (e) {}
  };

  // Initial Supabase Data Fetching & Realtime listener for Brands and Products
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        const storesRes = await fetchStoresFromSupabase();
        if (storesRes.data && storesRes.data.length > 0) {
          setStoresList(storesRes.data);
        }

        const usersRes = await fetchConnectedUsersFromSupabase();
        if (usersRes.data && usersRes.isLive) {
          setUsersList(usersRes.data);
        }

        const ordersRes = await fetchOrdersFromSupabase();
        if (ordersRes.data && ordersRes.isLive) {
          setOrdersList(ordersRes.data);
        }

        const resRes = await fetchReservationsFromSupabase();
        if (resRes.data && resRes.isLive) {
          setReservationsList(resRes.data);
        }

        const cpnRes = await fetchCouponsFromSupabase();
        if (cpnRes.data && cpnRes.isLive) {
          setCouponsList(cpnRes.data);
        }
      } catch (err) {
        console.warn('[App] Supabase initial load error:', err);
      }
    };

    loadSupabaseData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-brands-products-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, async () => {
          const res = await fetchStoresFromSupabase();
          if (res.data && res.data.length > 0) {
            setStoresList(res.data);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          const res = await fetchStoresFromSupabase();
          if (res.data && res.data.length > 0) {
            setStoresList(res.data);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  useEffect(() => {
    fetchBackendConnectedUsers();
    const interval = setInterval(fetchBackendConnectedUsers, 1500);
    return () => clearInterval(interval);
  }, []);

  // Real-time Multi-Channel Listener (SSE + BroadcastChannel + LocalStorage Event Bus)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let bc: BroadcastChannel | null = null;

    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data.type, data.payload || data.data);
          fetchBackendConnectedUsers();
        } catch (e) {}
      };
    } catch (e) {}

    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = (event) => {
        if (event.data?.type) {
          handleRealtimeEvent(event.data.type, event.data.payload || event.data.data);
          fetchBackendConnectedUsers();
        }
      };
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'axionix_last_event' || e.key === 'axionix_users_list') && e.newValue) {
        try {
          if (e.key === 'axionix_users_list') {
            setUsersList(JSON.parse(e.newValue));
          } else {
            const data = JSON.parse(e.newValue);
            if (data.type) {
              handleRealtimeEvent(data.type, data.payload);
            }
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      eventSource?.close();
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auth Loading Splash Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="text-center space-y-3 animate-pulse">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl shadow-blue-500/25 font-black text-2xl tracking-wider mb-2">
            AX
          </div>
          <div className="font-extrabold text-slate-900 text-base tracking-tight">AXIONIX OS</div>
          <p className="text-xs text-slate-500 font-medium">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // Login Screen Gate when not authenticated
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user, admin) => {
          setCurrentUser(user);
          setCurrentAdmin(admin);
          if (admin?.role) {
            setUserRole(admin.role as UserRole);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-800 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* REALTIME EVENT BROADCAST TOAST */}
      {liveToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-slide-down">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">{liveToast.title}</h4>
            <p className="text-[11px] text-slate-300">{liveToast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        unreadCount={unreadAlertsCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP HEADER */}
        <Header
          selectedMall={selectedMall}
          onSelectMall={setSelectedMall}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSelectView={setCurrentView}
          unreadCount={unreadAlertsCount}
          alerts={alertsList}
          stores={storesList}
          users={usersList}
          orders={ordersList}
          currentUser={currentUser}
          currentAdmin={currentAdmin}
          onSignOut={handleSignOut}
        />

        {/* MAIN DASHBOARD CANVAS */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. ADMIN DASHBOARD */}
          {currentView === 'dashboard' && (
            <DashboardView
              selectedMall={selectedMall}
              onSelectView={setCurrentView}
              onOpenReportModal={(type) => setReportModalType(type)}
              stores={storesList}
              users={usersList}
              orders={ordersList}
              reservations={reservationsList}
              coupons={couponsList}
              campaigns={campaignsList}
            />
          )}

          {/* 2. MALL OVERVIEW (DIGITAL TWIN) */}
          {currentView === 'mall-overview' && (
            <MallOverviewView
              stores={storesList}
              onSelectStore={(store) => setSelectedStore(store)}
            />
          )}

          {/* 3. CUSTOMER CAPTIVE PORTAL */}
          {currentView === 'captive-portal' && (
            <CaptivePortalView
              onCheckinSuccess={(user) => {
                setLiveToast({
                  title: 'Guest Connected Wi-Fi',
                  message: `${user.name} checked in on ${user.floor}`
                });
              }}
            />
          )}

          {/* 4. TENANT DASHBOARD */}
          {currentView === 'tenant-dashboard' && (
            <TenantDashboardView />
          )}

          {/* 5. CUSTOMER CRM */}
          {currentView === 'customer-crm' && (
            <CustomerCrmView users={usersList} />
          )}

          {/* 6. STORE MANAGEMENT */}
          {currentView === 'store-management' && (
            <StoreManagementView />
          )}

          {/* 7. CAMPAIGN MANAGEMENT */}
          {currentView === 'campaigns' && (
            <CampaignsView />
          )}



          {/* 9. NOTIFICATION CENTER */}
          {currentView === 'notifications' && (
            <NotificationsView
              alerts={alertsList}
              onDismiss={handleDismissAlert}
              onMarkAllRead={handleMarkAllAlertsRead}
            />
          )}

          {/* 10. SUPER ADMIN */}
          {currentView === 'super-admin' && (
            <SuperAdminView
              selectedMall={selectedMall}
              onSelectMall={setSelectedMall}
              userRole={userRole}
              onSelectRole={(r) => setUserRole(r as UserRole)}
            />
          )}

          {/* SECONDARY OPERATIONAL VIEWS */}
          {currentView === 'connected-users' && (
            <ConnectedUsersView
              users={usersList}
              onSelectUserJourney={(user) => setSelectedUser(user)}
            />
          )}

          {currentView === 'store-directory' && (
            <StoreDirectoryView
              storesList={storesList}
              onSelectStore={(store) => setSelectedStore(store)}
              onSelectStoreAnalytics={(store) => setCurrentView('analytics')}
            />
          )}

          {currentView === 'orders' && <OrdersView ordersList={ordersList} />}

          {currentView === 'reservations' && <ReservationsView reservationsList={reservationsList} />}

          {currentView === 'coupons' && <CouponsView couponsList={couponsList} />}

          {currentView === 'loyalty' && <LoyaltyView />}

          {currentView === 'analytics' && <AnalyticsView onSelectView={setCurrentView} />}

          {currentView === 'reports' && (
            <ReportsView onOpenReportModal={(type) => setReportModalType(type)} />
          )}

          {currentView === 'settings' && <SettingsView selectedMall={selectedMall} />}
        </main>
      </div>

      {/* MODALS */}
      {selectedStore && (
        <StoreDetailModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onSave={(updated) => {
            const idx = MOCK_STORES.findIndex(s => s.id === updated.id);
            if (idx !== -1) MOCK_STORES[idx] = updated;
          }}
        />
      )}

      {selectedUser && (
        <UserJourneyModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {reportModalType && (
        <ExportReportModal
          reportType={reportModalType}
          onClose={() => setReportModalType(null)}
          stores={storesList}
          users={usersList}
          orders={ordersList}
          reservations={reservationsList}
          coupons={couponsList}
          campaigns={campaignsList}
        />
      )}

      {/* LIVE EVENT PERMANENT NOTIFICATION BANNER */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all flex items-start justify-between gap-3 animate-slide-in">
          <div className="flex items-start gap-3">
            <span className="relative flex h-3 w-3 mt-1 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{liveToast.title}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">LIVE</span>
              </div>
              <p className="text-sm font-medium text-slate-100 mt-1 leading-snug">
                {liveToast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
