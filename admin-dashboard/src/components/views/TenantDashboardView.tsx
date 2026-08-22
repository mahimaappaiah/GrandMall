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
  BellRing
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
    setAllLiveOrders(formattedOrders);

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
    setAllLiveReservations(formattedRes);
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
        body: JSON.stringify({ status: newStatus })
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
            const el = document.getElementById('tenant-orders-queue');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            showToast(`📦 ${activeOrdersCount} pending active orders in queue for ${currentStore.name}`);
          }}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-98"
          title="Click to jump to Orders Queue"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Queue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeOrdersCount} Orders</p>
          <span className="text-xs text-slate-500 font-medium">Avg Prep: 12 mins • {storeOrders.length} Total</span>
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
            <span className="text-xs bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Live Feed ({storeOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {storeOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium space-y-1">
                <p className="font-bold text-slate-600">No pending orders for {currentStore.name}</p>
                <p className="text-[11px]">Orders placed from Customer Portal will appear here in real time.</p>
              </div>
            ) : (
              storeOrders.slice(0, 10).map(order => (
                <div key={order.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-black text-xs text-slate-900">{order.customerName}</span>
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
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      {Array.isArray(order.itemsList) ? order.itemsList.join(', ') : 'Signature Item'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {order.timestamp} • {order.orderType} • <span className="text-slate-500 font-semibold">{order.deliveryLocation}</span>
                    </span>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
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
                            onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                            title="Mark order ready for customer collection"
                          >
                            Ready for Pickup
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

    </div>
  );
};
