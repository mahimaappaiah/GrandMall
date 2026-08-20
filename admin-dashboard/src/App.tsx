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
  fetchNotificationsFromSupabase,
  getSupabaseAuthSession,
  verifyAdminUser,
  signOutAdmin,
  onSupabaseAuthStateChange
} from './services/supabaseService';
import { realtimeManager } from './services/realtimeService';
import { BACKEND_URL } from './lib/config';
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

  // Stores List State (Loaded from Supabase brands, falling back to mock)
  const [storesList, setStoresList] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_stores_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MOCK_STORES;
  });

  // Real-time Lists State (Preserved and Persistent across browser refreshes)
  const [usersList, setUsersList] = useState<ConnectedUser[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_USERS;
  });

  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_orders_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_ORDERS;
  });

  const [reservationsList, setReservationsList] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('axionix_reservations_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_RESERVATIONS;
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

  useEffect(() => {
    try { localStorage.setItem('axionix_stores_list', JSON.stringify(storesList)); } catch (e) {}
  }, [storesList]);

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

  // Centralized Controlled Supabase Realtime Subscriptions
  useEffect(() => {
    if (!currentUser) {
      realtimeManager.cleanup();
      return;
    }

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
      const guestName = payload.user?.name || 'Valued Guest';
      const guestFloor = payload.user?.floor || payload.floor || 'Ground Floor';
      const guestPhone = payload.user?.phone_number || '+91 98765 43210';

      const newUser: ConnectedUser = {
        id: 'usr-' + Date.now(),
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

      setUsersList(prev => [newUser, ...prev.filter(u => !matchUser(u, guestPhone, guestName))]);
      setLiveToast({
        title: 'New Guest Connected Wi-Fi',
        message: `${guestName} checked in at ${guestFloor}`
      });
    } else if (type === 'GUEST_DISCONNECTED') {
      const phone = payload.user?.phone_number;
      const name = payload.user?.name;

      setUsersList(prev => {
        let matched = false;
        const updated = prev.map(u => {
          if (matchUser(u, phone, name) || (name && u.name.toLowerCase().includes(name.toLowerCase())) || (phone && u.phone.includes(phone))) {
            matched = true;
            return { ...u, status: 'Disconnected' as const };
          }
          return u;
        });

        if (!matched && prev.length > 0) {
          const activeIdx = prev.findIndex(u => u.status === 'Active');
          const targetIdx = activeIdx !== -1 ? activeIdx : 0;
          return prev.map((u, i) => i === targetIdx ? { ...u, status: 'Disconnected' as const } : u);
        }

        return updated;
      });

      setLiveToast({
        title: 'Guest Disconnected / Logged Out',
        message: `${payload.user?.name || 'Guest'} session closed.`
      });
    } else if (type === 'STORE_VISITED') {
      const phone = payload.user_phone;
      const name = payload.user_name;
      const store = payload.store_name;
      if (!store) return;

      setUsersList(prev => prev.map((u, idx) => {
        if (matchUser(u, phone, name) || idx === 0) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const stores = currentStores.includes(store) ? currentStores : [...currentStores, store];
          return { ...u, visitedStores: stores, dataUsed: `${(stores.length * 20) + 15} MB` };
        }
        return u;
      }));

      // Reflect live store footfall on Mall Twin
      setStoresList(prevStores => prevStores.map(s => {
        const sNameLower = s.name.toLowerCase().trim();
        const targetLower = store.toLowerCase().trim();
        if (sNameLower.includes(targetLower) || targetLower.includes(sNameLower)) {
          return { ...s, visitorsToday: (s.visitorsToday || 0) + 1 };
        }
        return s;
      }));
    } else if (type === 'ORDER_CREATED' || type === 'NEW_ORDER' || type === 'order_created') {
      const orderPayload = payload?.order || payload || {};
      const orderNum = orderPayload.orderNumber || orderPayload.order_number || `#AX-${Math.floor(1000 + Math.random() * 9000)}`;
      const targetStore = orderPayload.storeName || orderPayload.store_name || orderPayload.brand_name || 'Starbucks Reserve';
      const custName = orderPayload.customerName || orderPayload.user_name || orderPayload.guest_name || 'Valued Guest';
      const custPhone = orderPayload.customerPhone || orderPayload.user_phone || '+91 84950 93170';

      const itemsList = Array.isArray(orderPayload.itemsList) ? orderPayload.itemsList :
                        Array.isArray(orderPayload.items) ? orderPayload.items.map((i: any) => `${i.name || i.item_name} (x${i.quantity || i.qty || 1})`) :
                        [orderPayload.item_name ? `${orderPayload.item_name} (x${orderPayload.quantity || 1})` : 'Designer Fashion Item'];

      const rawItems = Array.isArray(orderPayload.items) && orderPayload.items.length > 0 ? orderPayload.items.map((i: any) => ({
        name: i.name || i.item_name || 'Designer Item',
        quantity: Number(i.quantity || i.qty || 1),
        price: Number(i.price || 2495)
      })) : [
        { name: orderPayload.item_name || 'Designer Item', quantity: Number(orderPayload.quantity || 1), price: Number(orderPayload.totalAmount || 2495) }
      ];

      const orderTotal = Number(orderPayload.totalAmount || orderPayload.total_amount || 2495);

      const newOrder: Order = {
        id: String(orderPayload.id || 'ord-' + Date.now()),
        orderNumber: orderNum,
        customerName: custName,
        customerPhone: custPhone,
        storeName: targetStore,
        storeCategory: orderPayload.storeCategory || 'Fashion',
        orderType: orderPayload.orderType || 'Click & Collect',
        paymentMethod: orderPayload.paymentMethod || 'UPI / GPay',
        totalAmount: orderTotal,
        itemsCount: Number(orderPayload.itemsCount || rawItems.reduce((acc: number, i: any) => acc + i.quantity, 0)),
        timestamp: orderPayload.timestamp || 'Just now',
        status: 'Completed',
        itemsList,
        items: rawItems
      };

      setOrdersList(prev => [newOrder, ...prev.filter(o => o.orderNumber !== newOrder.orderNumber)]);

      // Update visited stores for customer
      setUsersList(prev => prev.map((u, idx) => {
        if (matchUser(u, custPhone, custName) || idx === 0) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const stores = currentStores.includes(targetStore) ? currentStores : [...currentStores, targetStore];
          return { ...u, visitedStores: stores, dataUsed: `${(stores.length * 25) + 20} MB` };
        }
        return u;
      }));

      // Reflect live store revenue, orders, and visitors immediately on Mall Twin
      setStoresList(prevStores => prevStores.map(s => {
        const sNameLower = s.name.toLowerCase().trim();
        const targetLower = targetStore.toLowerCase().trim();
        if (sNameLower.includes(targetLower) || targetLower.includes(sNameLower)) {
          return {
            ...s,
            ordersCount: (s.ordersCount || 0) + 1,
            revenueToday: (s.revenueToday || 0) + orderTotal,
            visitorsToday: (s.visitorsToday || 0) + 1
          };
        }
        return s;
      }));

      setLiveToast({
        title: `Order ${newOrder.orderNumber} Placed`,
        message: `${newOrder.customerName} placed order for ${newOrder.itemsCount} items at ${targetStore}!`
      });
    } else if (type === 'RESERVATION_CREATED' || type === 'NEW_RESERVATION' || type === 'reservation_created') {
      const resPayload = payload?.reservation || payload || {};
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

      setUsersList(prev => prev.map((u, idx) => {
        if (matchUser(u, gPhone, gName) || idx === 0) {
          const currentStores = (u.visitedStores || []).filter(s => s !== 'Wi-Fi Captive Portal');
          const stores = currentStores.includes(targetVenue) ? currentStores : [...currentStores, targetVenue];
          return { ...u, visitedStores: stores };
        }
        return u;
      }));

      // Reflect live reservations on Mall Twin
      setStoresList(prevStores => prevStores.map(s => {
        const sNameLower = s.name.toLowerCase().trim();
        const targetLower = targetVenue.toLowerCase().trim();
        if (sNameLower.includes(targetLower) || targetLower.includes(sNameLower)) {
          return {
            ...s,
            reservationsCount: (s.reservationsCount || 0) + 1,
            visitorsToday: (s.visitorsToday || 0) + Number(resPayload.partySize || 2)
          };
        }
        return s;
      }));

      setLiveToast({
        title: 'Fitting Room / Table Reserved',
        message: `Reservation ${newRes.refCode} confirmed for ${newRes.guestName} at ${targetVenue}.`
      });
    } else if (type === 'COUPON_REDEEMED' || type === 'coupon_redeemed') {
      const code = payload?.code || payload?.redemption?.code;
      setCouponsList(prev => prev.map(c => {
        if (c.code === code) {
          return {
            ...c,
            redeemedCount: c.redeemedCount + 1,
            redeemedCustomers: [
              {
                id: 'rdm-' + Date.now(),
                customerName: payload.user_name || payload.redemption?.customerName || 'Valued Guest',
                customerPhone: payload.user_phone || payload.redemption?.customerPhone || '+91 98765 43210',
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
        message: `Coupon code '${code}' redeemed by ${payload.user_name || payload.redemption?.customerName || 'Guest'}`
      });
    }
  };

  const fetchBackendConnectedUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/connected-users`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsersList(data.users);
      }
    } catch (e) {}
  };

  // Initial Supabase Data Fetching (Read-only data loading)
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
  }, []);

  useEffect(() => {
    fetchBackendConnectedUsers();
    const interval = setInterval(fetchBackendConnectedUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Multi-Channel Listener (SSE + BroadcastChannel + LocalStorage Event Bus)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let bc: BroadcastChannel | null = null;
    let resBc: BroadcastChannel | null = null;

    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data.type, data.payload);
          fetchBackendConnectedUsers();
        } catch (e) {}
      };
    } catch (e) {}

    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = (event) => {
        if (event.data?.type) {
          handleRealtimeEvent(event.data.type, event.data.payload || event.data);
          fetchBackendConnectedUsers();
        }
      };
    } catch (e) {}

    try {
      resBc = new BroadcastChannel('axionix_reservation_events');
      resBc.onmessage = (event) => {
        if (event.data) {
          handleRealtimeEvent('RESERVATION_CREATED', event.data);
        }
      };
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'axionix_stores_list' && e.newValue) {
        try { setStoresList(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'axionix_users_list' && e.newValue) {
        try { setUsersList(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'axionix_orders_list' && e.newValue) {
        try { setOrdersList(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'axionix_reservations_list' && e.newValue) {
        try { setReservationsList(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'axionix_last_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type) {
            handleRealtimeEvent(data.type, data.payload || data);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      eventSource?.close();
      bc?.close();
      resBc?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto hide live toast
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

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
            <NotificationsView />
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

          {currentView === 'analytics' && <AnalyticsView />}

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
        />
      )}

    </div>
  );
}
