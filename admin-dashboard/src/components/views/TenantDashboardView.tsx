import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store as StoreIcon, 
  ShoppingBag, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp,
  PackageCheck,
  RefreshCw,
  Users,
  QrCode,
  BarChart3,
  Send,
  Edit3,
  Plus,
  Minus,
  Search,
  Tag,
  Barcode,
  Sparkles,
  Zap,
  Check,
  UserCheck,
  UserX,
  BellRing,
  X,
  Phone,
  MapPin,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Eye
} from 'lucide-react';
import { MOCK_STORES, MOCK_ORDERS, MOCK_RESERVATIONS } from '../../data/mockData';
import { 
  fetchStoresFromSupabase, 
  fetchProductsFromSupabase, 
  fetchOrdersFromSupabase, 
  fetchReservationsFromSupabase,
  updateProductStockApi,
  broadcastEvent,
  recordAuditLog
} from '../../services/supabaseService';
import { Store, Order, Reservation } from '../../types';
import { BACKEND_URL } from '../../lib/config';

export const TenantDashboardView: React.FC = () => {
  const [storesList, setStoresList] = useState<Store[]>(MOCK_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(MOCK_STORES[0]?.id || 'store-food-1');
  const [allLiveOrders, setAllLiveOrders] = useState<Order[]>([]);
  const [allLiveReservations, setAllLiveReservations] = useState<Reservation[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals for full orders queue and single order step-by-step fulfillment
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [queueSearchQuery, setQueueSearchQuery] = useState('');
  const [queueStatusFilter, setQueueStatusFilter] = useState('ALL');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isAllStoresMode = selectedStoreId === 'ALL';
  const currentStore: Store = isAllStoresMode
    ? {
        id: 'ALL',
        name: 'All Stores (Live Mall Feed)',
        floor: 'All Floors (GF, L1, L2, L3)',
        category: 'Mall-Wide Live Activity',
        zone: 'Whole Mall',
        revenueToday: storesList.reduce((acc, s) => acc + (s.revenueToday || 0), 0),
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&auto=format&fit=crop&q=80',
        activeOccupancy: 120,
        status: 'Open',
        contactPhone: '+91 80 4900 1200'
      }
    : (storesList.find(s => s.id === selectedStoreId) || storesList[0] || MOCK_STORES[0]);

  // Comprehensive Data Fetch & Sync with Backend REST + Supabase + LocalStorage
  const fetchLiveTenantData = useCallback(async () => {
    // 1. Fetch live stores
    try {
      const supaStores = await fetchStoresFromSupabase();
      if (supaStores.data && supaStores.data.length > 0) {
        const storeMap = new Map();
        MOCK_STORES.forEach(s => storeMap.set(s.name.toLowerCase(), s));
        supaStores.data.forEach((s: any) => storeMap.set(s.name.toLowerCase(), s));
        setStoresList(Array.from(storeMap.values()));
      }
    } catch (e) {}

    // 2. Fetch live orders
    let backendOrders: any[] = [];
    let localOrders: any[] = [];
    let supaOrders: any[] = [];

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        backendOrders = data.orders;
      }
    } catch (e) {}

    try {
      const local = JSON.parse(localStorage.getItem('axionix_orders_list') || '[]');
      if (Array.isArray(local)) localOrders = local;
    } catch (e) {}

    try {
      const supa = await fetchOrdersFromSupabase();
      if (supa.data && supa.isLive) supaOrders = supa.data;
    } catch (e) {}

    const combinedOrders: any[] = [...backendOrders, ...localOrders, ...supaOrders, ...MOCK_ORDERS];
    const seenOrderIds = new Set();
    const formattedOrders: Order[] = [];

    for (const o of combinedOrders) {
      const orderNum = o.orderNumber || o.order_number || o.id;
      if (!seenOrderIds.has(orderNum)) {
        seenOrderIds.add(orderNum);
        formattedOrders.push({
          id: String(o.id || orderNum),
          orderNumber: orderNum,
          customerName: o.customerName || o.customer_name || 'VIP Guest',
          customerPhone: o.customerPhone || o.customer_phone || '+91 98000 00000',
          storeName: o.storeName || o.store_name || 'The Grand Mall',
          storeCategory: o.storeCategory || o.category || 'General',
          itemsList: Array.isArray(o.itemsList) ? o.itemsList : (Array.isArray(o.items) ? o.items.map((i: any) => i.name || i) : ['Signature Boutique Item']),
          itemsCount: Number(o.itemsCount || o.items_count || 1),
          totalAmount: Number(o.totalAmount || o.total_amount || 2499),
          orderType: o.orderType || o.order_type || 'Click & Collect',
          paymentMethod: o.paymentMethod || o.payment_method || 'UPI / Mall Wallet',
          status: o.status || 'Pending',
          timestamp: o.timestamp || o.created_at || 'Just now',
          payment_status: o.payment_status || o.paymentStatus || 'Paid (Mall Wallet)'
        });
      }
    }
    setAllLiveOrders(prev => {
      const map = new Map<string, Order>();
      prev.forEach(o => {
        const k = (o.orderNumber || o.id || '').trim();
        if (k) map.set(k, o);
      });
      formattedOrders.forEach(o => {
        const k = (o.orderNumber || o.id || '').trim();
        const existing = map.get(k);
        map.set(k, { ...existing, ...o });
      });
      return Array.from(map.values());
    });

    // 3. Fetch live reservations
    let backendRes: any[] = [];
    let localRes: any[] = [];
    let supaRes: any[] = [];

    try {
      const res = await fetch(`${BACKEND_URL}/api/reservations`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        backendRes = data.reservations;
      }
    } catch (e) {}

    try {
      const local = JSON.parse(localStorage.getItem('axionix_reservations_list') || localStorage.getItem('axionix_reservations') || '[]');
      if (Array.isArray(local)) localRes = local;
    } catch (e) {}

    try {
      const supa = await fetchReservationsFromSupabase();
      if (supa.data && supa.isLive) supaRes = supa.data;
    } catch (e) {}

    const combinedRes: any[] = [...backendRes, ...localRes, ...supaRes, ...MOCK_RESERVATIONS];
    const seenRefs = new Set();
    const seenSemanticKeys = new Set();
    const formattedRes: Reservation[] = [];

    for (const r of combinedRes) {
      const storeName = r.storeName || r.venue || r.store_name || 'Starbucks Reserve';
      const guestName = r.guestName || r.user_name || r.guest_name || 'Valued Guest';
      const guestPhone = r.guestPhone || r.user_phone || r.guest_phone || '+91 84950 93170';
      const refCode = r.refCode || r.ref_code || (`RES-${storeName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`);
      const partySize = Number(r.partySize || r.guest_count || r.party_size || 2);
      const timeSlot = r.timeSlot || r.preferred_time || r.reservation_time || '17:00 PM';
      const date = r.date || (r.created_at ? r.created_at.split('T')[0] : 'Today');
      const specialNotes = r.specialNotes || r.special_notes || r.specialRequest || r.special_request || 'VIP Fitting Suite / Dining';
      const status = r.status || 'Confirmed';

      const cleanDate = date === 'Today' ? new Date().toISOString().split('T')[0] : date;
      const cleanSlot = (timeSlot || '').replace(' PM', '').replace(' AM', '').trim();
      const semanticKey = `${guestName.toLowerCase().trim()}_${storeName.toLowerCase().trim()}_${cleanDate}_${cleanSlot}`;

      if (!seenRefs.has(refCode) && !seenSemanticKeys.has(semanticKey)) {
        seenRefs.add(refCode);
        seenSemanticKeys.add(semanticKey);
        formattedRes.push({
          id: String(r.id || refCode),
          refCode,
          guestName,
          guestPhone,
          storeName,
          partySize,
          timeSlot,
          date,
          specialNotes,
          specialRequest: specialNotes,
          status: status as any
        });
      }
    }
    setAllLiveReservations(prev => {
      const map = new Map<string, Reservation>();
      prev.forEach(r => {
        const k = (r.refCode || r.id || '').trim();
        if (k) map.set(k, r);
      });
      formattedRes.forEach(r => {
        const k = (r.refCode || r.id || '').trim();
        const existing = map.get(k);
        map.set(k, { ...existing, ...r });
      });
      return Array.from(map.values());
    });
  }, []);

  // Sync Inventory for the selected store
  useEffect(() => {
    let isMounted = true;
    if (selectedStoreId && currentStore) {
      fetchProductsFromSupabase(selectedStoreId).then(prodsRes => {
        if (!isMounted) return;
        if (prodsRes.data && prodsRes.data.length > 0) {
          const mapped = prodsRes.data.map((p: any) => ({
            id: p.id,
            name: p.name || `${currentStore.name} Item`,
            category: p.category || currentStore.category,
            stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : 12,
            minStock: 4,
            sku: p.sku || `${currentStore.name.slice(0, 3).toUpperCase()}-${p.id.slice(-4)}`,
            price: `₹${Number(p.price || 2999).toLocaleString()}`,
            history: [15, 14, 12, 10, 8, 6, typeof p.stock_quantity === 'number' ? p.stock_quantity : 12]
          }));
          setInventory(mapped);
          if (mapped[0]) setSelectedHistoryItem(mapped[0].id);
        } else {
          const fallbackProds = [
            { id: 'p-1', name: `${currentStore.name} Flagship Exclusive`, category: currentStore.category, stock: 14, minStock: 5, sku: `${currentStore.name.slice(0, 3).toUpperCase()}-FLG-01`, price: '₹4,999', history: [18, 16, 15, 14] },
            { id: 'p-2', name: `${currentStore.name} Signature Collection`, category: currentStore.category, stock: 8, minStock: 3, sku: `${currentStore.name.slice(0, 3).toUpperCase()}-SIG-02`, price: '₹8,499', history: [12, 10, 9, 8] },
            { id: 'p-3', name: `${currentStore.name} Premium Edition`, category: currentStore.category, stock: 2, minStock: 5, sku: `${currentStore.name.slice(0, 3).toUpperCase()}-PRM-03`, price: '₹14,999', history: [8, 6, 4, 2] },
            { id: 'p-4', name: `${currentStore.name} Classic Heritage`, category: currentStore.category, stock: 20, minStock: 6, sku: `${currentStore.name.slice(0, 3).toUpperCase()}-CLS-04`, price: '₹2,999', history: [22, 21, 20, 20] }
          ];
          setInventory(fallbackProds);
          setSelectedHistoryItem('p-1');
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [selectedStoreId, currentStore]);

  // Initial Load and Real-time SSE / BroadcastChannel / Polling Setup
  useEffect(() => {
    fetchLiveTenantData();
    const interval = setInterval(fetchLiveTenantData, 2500);

    // SSE Stream
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'NEW_ORDER' ||
            data.type === 'ORDER_STATUS_UPDATE' ||
            data.type === 'NEW_RESERVATION' ||
            data.type === 'RESERVATION_CREATED' ||
            data.type === 'RESERVATION_STATUS_UPDATE' ||
            data.type === 'RESERVATION_NO_SHOW' ||
            data.type === 'RESERVATION_SLOT_FREED' ||
            data.type === 'RESERVATION_RESCHEDULED' ||
            data.type === 'STOCK_UPDATED'
          ) {
            fetchLiveTenantData();
            if (data.type === 'NEW_ORDER') {
              showToast(`⚡ Live Order Alert! #${data.data?.orderNumber || data.data?.id} received for ${data.data?.storeName || 'Boutique'}`, 'info');
            } else if (data.type === 'NEW_RESERVATION' || data.type === 'RESERVATION_CREATED') {
              showToast(`🎉 Live Reservation! ${data.data?.guestName} booked ${data.data?.storeName} (${data.data?.timeSlot})`, 'info');
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    // BroadcastChannels
    let bcOrders: BroadcastChannel | null = null;
    let bcRes: BroadcastChannel | null = null;
    try {
      bcOrders = new BroadcastChannel('axionix_events');
      bcOrders.onmessage = () => fetchLiveTenantData();
    } catch (e) {}

    try {
      bcRes = new BroadcastChannel('axionix_reservation_events');
      bcRes.onmessage = () => fetchLiveTenantData();
    } catch (e) {}

    window.addEventListener('axionix_order_added', fetchLiveTenantData);
    window.addEventListener('axionix_reservation_added', fetchLiveTenantData);
    window.addEventListener('axionix_reservation_created', fetchLiveTenantData);

    return () => {
      clearInterval(interval);
      es?.close();
      bcOrders?.close();
      bcRes?.close();
      window.removeEventListener('axionix_order_added', fetchLiveTenantData);
      window.removeEventListener('axionix_reservation_added', fetchLiveTenantData);
      window.removeEventListener('axionix_reservation_created', fetchLiveTenantData);
    };
  }, [fetchLiveTenantData]);

  // Filter orders and reservations strictly for the currently selected store (or ALL stores when in Live mode)
  const storeOrders = isAllStoresMode ? allLiveOrders : allLiveOrders.filter(o => {
    const oStore = (o.storeName || '').toLowerCase().trim();
    const currName = (currentStore?.name || '').toLowerCase().trim();
    const hasItemStore = Array.isArray(o.items) && o.items.some((it: any) => {
      const itSt = (it.storeName || it.brandName || '').toLowerCase().trim();
      return itSt === currName || itSt.includes(currName) || currName.includes(itSt);
    });
    return oStore === currName || oStore.includes(currName) || currName.includes(oStore) || hasItemStore;
  });

  const storeReservations = isAllStoresMode ? allLiveReservations : allLiveReservations.filter(r => {
    const rStore = (r.storeName || '').toLowerCase().trim();
    const currName = (currentStore?.name || '').toLowerCase().trim();
    return rStore === currName || rStore.includes(currName) || currName.includes(rStore);
  });

  // Calculate live dynamic metrics for current boutique (or combined across mall)
  const dynamicOrdersRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const displayRevenue = (currentStore.revenueToday || 0) + dynamicOrdersRevenue;
  const activeOrdersCount = storeOrders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const activeReservationsCount = storeReservations.filter(r => r.status !== 'Cancelled' && r.status !== 'No Show').length;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    const targetOrder = allLiveOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    const targetStore = targetOrder?.storeName || currentStore.name;

    setAllLiveOrders(prev => prev.map(o => o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrderForModal && (selectedOrderForModal.id === orderId || selectedOrderForModal.orderNumber === orderId)) {
      setSelectedOrderForModal(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Order ${targetOrder?.orderNumber || orderId} status updated to '${newStatus}'`);

    broadcastEvent('ORDER_STATUS_UPDATE', { 
      id: orderId, 
      orderNumber: targetOrder?.orderNumber || orderId, 
      customerName: targetOrder?.customerName,
      customerPhone: targetOrder?.customerPhone,
      status: newStatus, 
      storeName: targetStore 
    });

    try {
      await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          orderNumber: targetOrder?.orderNumber || orderId,
          customerName: targetOrder?.customerName,
          customerPhone: targetOrder?.customerPhone,
          storeName: targetStore
        })
      });
    } catch (e) {}
  };

  const handleUpdateReservationStatus = async (resId: string, newStatus: string) => {
    const targetRes = allLiveReservations.find(r => r.id === resId || r.refCode === resId);
    const targetStore = targetRes?.storeName || currentStore.name;

    setAllLiveReservations(prev => prev.map(r => r.id === resId || r.refCode === resId ? { ...r, status: newStatus as any } : r));
    showToast(`Reservation updated to '${newStatus}'`);

    broadcastEvent('RESERVATION_STATUS_UPDATE', { 
      id: resId, 
      refCode: targetRes?.refCode || resId, 
      status: newStatus, 
      storeName: targetStore 
    });

    try {
      await fetch(`${BACKEND_URL}/api/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  const handleMarkNoShow = async (resId: string, refCode: string) => {
    const targetRes = allLiveReservations.find(r => r.id === resId || r.refCode === resId);
    const targetStore = targetRes?.storeName || currentStore.name;

    setAllLiveReservations(prev => prev.map(r => r.id === resId || r.refCode === resId ? { ...r, status: 'No Show' as any } : r));
    showToast(`❌ Marked ${refCode} as No-Show. Slot freed!`, 'warning');

    broadcastEvent('RESERVATION_STATUS_UPDATE', { 
      id: resId, 
      refCode: refCode, 
      status: 'No Show', 
      storeName: targetStore 
    });

    try {
      await fetch(`${BACKEND_URL}/api/reservations/${resId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {}
  };

  const handleUpdateStockDirect = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const finalStock = Math.max(0, newStock);
        const isLow = finalStock < item.minStock;

        updateProductStockApi(itemId, finalStock, 'set', item.sku, item.minStock);

        if (isLow) {
          broadcastEvent('LOW_STOCK_ALERT', {
            storeId: selectedStoreId,
            storeName: currentStore.name,
            productId: item.id,
            productName: item.name,
            sku: item.sku,
            currentStock: finalStock,
            minStockThreshold: item.minStock,
            timestamp: new Date().toISOString()
          });
          recordAuditLog('LOW_STOCK_WARNING', 'inventory', item.sku, { productName: item.name, stock: finalStock, minStock: item.minStock });
          showToast(`⚠️ LOW STOCK ALERT! ${item.name} is now ${finalStock} units (Below min: ${item.minStock})`, 'warning');
        } else {
          showToast(`Stock updated for ${item.name}: ${finalStock} units`);
        }

        const updatedHistory = [...(item.history || [10, 8, 6, 4]), finalStock].slice(-7);
        return { ...item, stock: finalStock, history: updatedHistory };
      }
      return item;
    }));
  };

  const handleUpdateStockDelta = (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      handleUpdateStockDirect(itemId, item.stock + delta);
    }
  };

  const handleRequestRestock = (item: any) => {
    broadcastEvent('REORDER_REQUEST', {
      storeId: selectedStoreId,
      storeName: currentStore.name,
      productId: item.id,
      productName: item.name,
      sku: item.sku,
      requestedQuantity: item.minStock * 3,
      timestamp: new Date().toISOString()
    });

    recordAuditLog('RESTOCK_REQUESTED', 'inventory', item.sku, { productName: item.name, requestedBy: 'Tenant Store Manager' });
    showToast(`🚀 Restock Request for ${item.name} (${item.sku}) sent to Admin Notifications!`, 'info');
  };

  const handleScanBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery) return;

    const queryLower = barcodeQuery.trim().toLowerCase();
    const matched = inventory.find(i => 
      (i.sku && i.sku.toLowerCase().includes(queryLower)) || 
      (i.name && i.name.toLowerCase().includes(queryLower)) ||
      i.id.toLowerCase() === queryLower
    );

    if (matched) {
      setScannedItemId(matched.id);
      setSelectedHistoryItem(matched.id);
      showToast(`⚡ Barcode Scanned! Matched SKU '${matched.sku}' (${matched.name})`);
    } else {
      showToast(`❌ No product found matching barcode SKU '${barcodeQuery}'`, 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border animate-in slide-in-from-bottom-4 duration-200 ${
            toastType === 'warning'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : toastType === 'info'
              ? 'bg-indigo-900 text-indigo-100 border-indigo-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastType === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : toastType === 'info' ? (
            <BellRing className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span className="font-extrabold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* STORE SELECTION HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold shadow-xs border border-emerald-100">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Tenant Store Queue Manager</span>
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE SYNC
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <span>{currentStore.name}</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                {currentStore.floor} • {currentStore.category}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setSelectedStoreId('ALL')}
            className={`px-3.5 py-2.5 text-xs font-black rounded-2xl border transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
              selectedStoreId === 'ALL'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/40'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
            }`}
            title="View Live activity across ALL mall stores"
          >
            <span className={`w-2 h-2 rounded-full ${selectedStoreId === 'ALL' ? 'bg-white' : 'bg-emerald-600'} animate-ping`} />
            <span>⚡ Live (All Stores)</span>
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchLiveTenantData().then(() => {
                setIsRefreshing(false);
                showToast('Refreshed live tenant feed!');
              });
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer border border-slate-200"
            title="Refresh Live Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">Boutique:</span>
            <select
              value={selectedStoreId}
              onChange={e => setSelectedStoreId(e.target.value)}
              className="px-4 py-2.5 text-xs font-extrabold border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 text-slate-900 cursor-pointer shadow-xs"
            >
              <option value="ALL">🌐 All Stores (Live Mall Feed)</option>
              {storesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.floor})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TENANT STATS METRICS (DYNAMIC LIVE DATA - CLICKABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => showToast(`💰 ${currentStore.name} Total Daily Sales: ₹${displayRevenue.toLocaleString()} across ${storeOrders.length} orders.`)}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all active:scale-98"
          title="Click to view Revenue summary"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{displayRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs yesterday</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setIsQueueModalOpen(true);
            const el = document.getElementById('tenant-orders-queue');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            showToast(`📦 Opening Concierge Orders Queue (${storeOrders.length} orders total)`);
          }}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all active:scale-98 group"
          title="Click to view full Concierge Orders Queue modal"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">Active Queue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeOrdersCount} Orders</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Avg Prep: 12 mins • {storeOrders.length} Total</span>
            <span className="text-blue-600 font-extrabold flex items-center gap-1 group-hover:underline">View All →</span>
          </div>
        </div>

        <div 
          onClick={() => {
            const el = document.getElementById('tenant-reservations-queue');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            showToast(`📅 ${activeReservationsCount} scheduled appointments for ${currentStore.name}`);
          }}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all active:scale-98"
          title="Click to jump to Reservations"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {currentStore.category === 'Food' ? 'Table Reservations' : 'Fitting Reservations'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeReservationsCount} Appointments</p>
          <span className="text-xs text-purple-600 font-extrabold">
            {storeReservations.filter(r => r.status === 'Confirmed').length} Confirmed Today
          </span>
        </div>

        <div 
          onClick={() => showToast(`⭐ ${currentStore.name} Verified Rating: ${currentStore.rating || 4.9} / 5.0 (98% Customer Satisfaction)`)}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all active:scale-98"
          title="Click to view Customer Satisfaction"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Customer Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{currentStore.rating || 4.9} / 5.0</p>
          <span className="text-xs text-slate-500 font-medium">Based on 142 reviews</span>
        </div>
      </div>

      {/* TWO COLUMN GRID: ORDERS & RESERVATIONS QUEUES (FILTERED TO CURRENT STORE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IN-MALL ORDERS QUEUE FOR THIS TENANT */}
        <div id="tenant-orders-queue" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Concierge Delivery Orders Queue</h3>
                <p className="text-[11px] text-slate-400 font-medium">Live orders placed for {currentStore.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQueueModalOpen(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Open full orders queue modal"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Queue ({storeOrders.length})</span>
              </button>
              <span className="text-xs bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                Live Feed
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {storeOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium space-y-1">
                <p className="font-bold text-slate-600">No pending orders for {currentStore.name}</p>
                <p className="text-[11px]">Orders placed from Customer Portal will appear here in real time.</p>
              </div>
            ) : (
              storeOrders.slice(0, 10).map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrderForModal(order)}
                  className="p-4 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-200/70 hover:border-blue-300 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-black text-xs text-slate-900 group-hover:text-blue-700 transition-colors">{order.customerName}</span>
                      <span className="text-[10px] font-mono text-blue-600 font-bold">({order.orderNumber})</span>
                      <span className="text-[10px] bg-slate-200/80 text-slate-800 font-extrabold px-2 py-0.5 rounded-md border border-slate-300/60">
                        {order.storeName}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        order.status === 'Completed' || order.status === 'Delivered'
                          ? 'bg-slate-200 text-slate-700'
                          : order.status === 'Ready for Pickup' || order.status === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Processing' || order.status === 'Preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'Declined' || order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      {Array.isArray(order.itemsList) ? order.itemsList.join(', ') : 'Signature Item'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{order.timestamp} • {order.orderType} • <span className="text-slate-500 font-semibold">{order.deliveryLocation}</span></span>
                      <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <span className="font-black text-sm text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                    <div className="flex items-center space-x-1.5 flex-wrap justify-end gap-y-1">
                      {order.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            title="Accept and start preparing order"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Declined')}
                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                            title="Decline order"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            title="Mark order ready for customer collection"
                          >
                            Ready
                          </button>
                        </>
                      )}
                      {(order.status === 'Processing' || order.status === 'Preparing') && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                          title="Mark order ready for customer collection"
                        >
                          Ready for Pickup
                        </button>
                      )}
                      {(order.status === 'Ready for Pickup' || order.status === 'Ready') && (
                        <>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                            Ready for Pickup ✓
                          </span>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            title="Hand over to customer & complete"
                          >
                            Handed Over
                          </button>
                        </>
                      )}
                      {(order.status === 'Completed' || order.status === 'Delivered') && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg border border-slate-200">
                          Completed ✓
                        </span>
                      )}
                      {(order.status === 'Declined' || order.status === 'Cancelled') && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg border border-rose-200">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FITTING ROOM / DINING APPOINTMENTS FOR THIS TENANT */}
        <div id="tenant-reservations-queue" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {currentStore.category === 'Food' ? 'Table Dining Appointments' : 'VIP Fitting Suite Appointments'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Reservations scheduled for {currentStore.name}</p>
              </div>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-extrabold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              Live Lounges ({storeReservations.length})
            </span>
          </div>

          <div className="space-y-3">
            {storeReservations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium space-y-1">
                <p className="font-bold text-slate-600">No reservations currently booked for {currentStore.name}</p>
                <p className="text-[11px]">Bookings from Customer Portal will sync here instantly.</p>
              </div>
            ) : (
              storeReservations.slice(0, 6).map(res => (
                <div key={res.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-black text-xs text-slate-900">{res.guestName}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-md">
                        {res.partySize} {res.partySize === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">({res.refCode})</span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2 py-0.5 rounded-md border border-purple-200">
                        {res.storeName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Slot: <strong className="text-slate-900">{res.timeSlot}</strong> ({res.date || 'Today'}) • {res.guestPhone}
                    </p>
                    {(res.specialNotes || res.specialRequest) && (
                      <span className="text-[11px] text-amber-700 italic block font-medium">
                        "{res.specialNotes || res.specialRequest}"
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      {res.status === 'Confirmed' && (
                        <>
                          <button 
                            onClick={() => handleUpdateReservationStatus(res.id, 'Checked-in')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            Check-In
                          </button>
                          <button 
                            onClick={() => handleMarkNoShow(res.id, res.refCode)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                          >
                            No-Show
                          </button>
                        </>
                      )}
                      {res.status === 'Checked-in' && (
                        <button 
                          onClick={() => handleUpdateReservationStatus(res.id, 'Completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          Complete
                        </button>
                      )}
                      {res.status === 'Completed' && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                          Completed ✓
                        </span>
                      )}
                      {res.status === 'No Show' && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg border border-rose-200">
                          No Show
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BOUTIQUE LIVE INVENTORY MANAGEMENT & BARCODE SCANNER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base">Boutique Inventory &amp; Stock Management</h3>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                {inventory.length} SKUs Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-time stock level monitoring with instant threshold alerts and barcode lookup.</p>
          </div>

          {/* Barcode Quick Scanner */}
          <form onSubmit={handleScanBarcode} className="flex items-center gap-2">
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Scan or enter SKU..."
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventory.map(item => {
            const isLowStock = item.stock < item.minStock;
            const isScanned = scannedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isScanned
                    ? 'ring-2 ring-emerald-500 bg-emerald-50/40 border-emerald-300'
                    : isLowStock
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                    {item.sku}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isLowStock ? 'bg-rose-200 text-rose-900 font-extrabold animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                <p className="text-[11px] font-black text-emerald-600 mt-0.5">{item.price}</p>

                {/* Stock Controls */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleUpdateStockDelta(item.id, -1)}
                      className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 font-black rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer active:scale-90 transition-all text-xs"
                    >
                      -
                    </button>
                    <span className="font-black text-sm text-slate-900 w-8 text-center">{item.stock}</span>
                    <button
                      onClick={() => handleUpdateStockDelta(item.id, 1)}
                      className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 font-black rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer active:scale-90 transition-all text-xs"
                    >
                      +
                    </button>
                  </div>

                  {isLowStock ? (
                    <button
                      onClick={() => handleRequestRestock(item)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      Reorder
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Min: {item.minStock}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. MODAL: ALL CONCIERGE ORDERS QUEUE (CLICKED FROM ACTIVE QUEUE OR HEADER) */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">Live Customer Portal Orders Queue</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {storeOrders.length} Orders
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Click any order to inspect details and perform step-by-step fulfillment actions.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQueueModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by customer, phone, order #, or store..."
                  value={queueSearchQuery}
                  onChange={e => setQueueSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Declined'].map(st => (
                  <button
                    key={st}
                    onClick={() => setQueueStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      queueStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
              {(() => {
                const filtered = storeOrders.filter(o => {
                  const matchStatus = queueStatusFilter === 'ALL' || 
                    (queueStatusFilter === 'Preparing' && (o.status === 'Preparing' || o.status === 'Processing')) ||
                    (queueStatusFilter === 'Ready for Pickup' && (o.status === 'Ready for Pickup' || o.status === 'Ready')) ||
                    (queueStatusFilter === 'Completed' && (o.status === 'Completed' || o.status === 'Delivered')) ||
                    (queueStatusFilter === 'Declined' && (o.status === 'Declined' || o.status === 'Cancelled')) ||
                    o.status === queueStatusFilter;

                  const q = queueSearchQuery.toLowerCase().trim();
                  const matchQuery = !q || 
                    (o.customerName || '').toLowerCase().includes(q) ||
                    (o.customerPhone || '').toLowerCase().includes(q) ||
                    (o.orderNumber || '').toLowerCase().includes(q) ||
                    (o.storeName || '').toLowerCase().includes(q) ||
                    (Array.isArray(o.itemsList) && o.itemsList.some((it: string) => it.toLowerCase().includes(q)));

                  return matchStatus && matchQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 space-y-1">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                      <p className="font-bold text-slate-700 text-sm">No orders matching your criteria</p>
                      <p className="text-xs">Any new order placed in Customer Portal will immediately appear here.</p>
                    </div>
                  );
                }

                return filtered.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderForModal(order)}
                    className="p-4 bg-slate-50/70 hover:bg-blue-50/50 rounded-2xl border border-slate-200/70 hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-black text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{order.customerName}</span>
                        <span className="text-xs font-mono text-blue-600 font-bold">({order.orderNumber})</span>
                        <span className="text-[10px] bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-md border border-slate-300/60">
                          {order.storeName}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          order.status === 'Completed' || order.status === 'Delivered'
                            ? 'bg-slate-200 text-slate-700'
                            : order.status === 'Ready for Pickup' || order.status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Processing' || order.status === 'Preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'Declined' || order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {Array.isArray(order.itemsList) ? order.itemsList.join(', ') : 'Signature Item'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {order.timestamp} • {order.paymentMethod || 'Paid (Mall Wallet)'} • Delivery: <strong className="text-slate-600">{order.deliveryLocation}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3" onClick={e => e.stopPropagation()}>
                      <span className="font-black text-base text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                      
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Declined')}
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                            >
                              Decline
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              Ready
                            </button>
                          </>
                        )}
                        {(order.status === 'Processing' || order.status === 'Preparing') && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            Ready for Pickup
                          </button>
                        )}
                        {(order.status === 'Ready for Pickup' || order.status === 'Ready') && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            Hand Over / Deliver
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForModal(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                          title="View order details"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: SINGLE ORDER STEP-BY-STEP FULFILLMENT & NOTIFICATION TRIGGER */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">Order {selectedOrderForModal.orderNumber}</h3>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-md border border-slate-300/60">
                      {selectedOrderForModal.storeName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Placed on {selectedOrderForModal.timestamp}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForModal(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* Stepper Status Indicator */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Fulfillment Lifecycle</span>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black">
                  <div className={`p-2 rounded-xl border ${
                    selectedOrderForModal.status === 'Pending'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    1. Pending
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    selectedOrderForModal.status === 'Preparing' || selectedOrderForModal.status === 'Processing'
                      ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300'
                      : (selectedOrderForModal.status === 'Ready for Pickup' || selectedOrderForModal.status === 'Completed' || selectedOrderForModal.status === 'Delivered')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    2. Preparing
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    selectedOrderForModal.status === 'Ready for Pickup' || selectedOrderForModal.status === 'Ready'
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                      : (selectedOrderForModal.status === 'Completed' || selectedOrderForModal.status === 'Delivered')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    3. Ready
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    selectedOrderForModal.status === 'Completed' || selectedOrderForModal.status === 'Delivered'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    4. Delivered
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                  <p className="font-extrabold text-slate-900">{selectedOrderForModal.customerName}</p>
                  <p className="text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedOrderForModal.customerPhone || '+91 98987 65432'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Location &amp; Payment</span>
                  <p className="font-extrabold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {selectedOrderForModal.deliveryLocation || 'Concierge Pickup Counter'}
                  </p>
                  <p className="text-slate-500 font-medium flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    {selectedOrderForModal.paymentMethod || 'Mall Pay (Unified Wallet)'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Order Items</span>
                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3 divide-y divide-slate-100 text-xs">
                  {Array.isArray(selectedOrderForModal.items) && selectedOrderForModal.items.length > 0 ? (
                    selectedOrderForModal.items.map((it: any, idx: number) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-slate-900">{it.name || it.item?.name || 'Item'}</p>
                          <span className="text-[11px] text-slate-400">Qty: {it.quantity || 1} • {it.brandName || it.storeName || selectedOrderForModal.storeName}</span>
                        </div>
                        <span className="font-extrabold text-slate-900">₹{((Number(it.price || it.item?.price) || 0) * (Number(it.quantity) || 1)).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{Array.isArray(selectedOrderForModal.itemsList) ? selectedOrderForModal.itemsList.join(', ') : 'Signature Item'}</span>
                      <span className="font-extrabold text-slate-900">₹{selectedOrderForModal.totalAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-2 pt-1 font-black text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 text-base">₹{selectedOrderForModal.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Step-by-Step Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Perform Lifecycle Action (Broadcasts to Customer Portal)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedOrderForModal.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrderForModal.id, 'Preparing')}
                        className="p-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>👨‍🍳 Accept &amp; Prepare Order</span>
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrderForModal.id, 'Declined')}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>❌ Decline Order</span>
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrderForModal.id, 'Ready for Pickup')}
                        className="p-3 col-span-1 sm:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>🛍️ Mark Ready for Pickup Directly</span>
                      </button>
                    </>
                  )}

                  {(selectedOrderForModal.status === 'Preparing' || selectedOrderForModal.status === 'Processing') && (
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrderForModal.id, 'Ready for Pickup')}
                      className="p-3 col-span-1 sm:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🛍️ Mark Ready for Customer Pickup</span>
                    </button>
                  )}

                  {(selectedOrderForModal.status === 'Ready for Pickup' || selectedOrderForModal.status === 'Ready') && (
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrderForModal.id, 'Completed')}
                      className="p-3 col-span-1 sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>📦 Mark Delivered &amp; Handed Over</span>
                    </button>
                  )}

                  {(selectedOrderForModal.status === 'Completed' || selectedOrderForModal.status === 'Delivered') && (
                    <div className="col-span-1 sm:col-span-2 p-3 bg-slate-100 text-slate-800 text-center font-extrabold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Order is Delivered &amp; Completed ✓</span>
                    </div>
                  )}

                  {(selectedOrderForModal.status === 'Declined' || selectedOrderForModal.status === 'Cancelled') && (
                    <div className="col-span-1 sm:col-span-2 p-3 bg-rose-50 text-rose-800 text-center font-extrabold text-xs rounded-2xl border border-rose-200 flex items-center justify-center gap-2">
                      <span>Order has been Declined / Cancelled</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
