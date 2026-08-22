import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, CheckCircle2, Clock, XCircle, ShoppingBag, Eye, ExternalLink, Download, FileSpreadsheet, Printer, X, Tag } from 'lucide-react';
import { MOCK_ORDERS } from '../../data/mockData';
import { Order } from '../../types';
import { downloadOrdersCSV, downloadOrderReceiptTXT } from '../../utils/exportUtils';
import { fetchOrdersFromSupabase, recordAuditLog } from '../../services/supabaseService';
import { BACKEND_URL } from '../../lib/config';

interface OrdersViewProps {
  ordersList?: Order[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ ordersList = MOCK_ORDERS }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [liveOrdersList, setLiveOrdersList] = useState<Order[]>(ordersList);

  const fetchLiveOrders = async () => {
    let rawOrders: any[] = [];

    // 1. Fetch from Supabase FIRST so database orders take precedence
    try {
      const supaRes = await fetchOrdersFromSupabase();
      if (supaRes.data && supaRes.isLive) {
        rawOrders.push(...supaRes.data);
      }
    } catch (e) {}

    // 2. Read from LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem('axionix_orders_list') || '[]');
      if (Array.isArray(local)) {
        rawOrders.push(...local);
      }
    } catch (e) {}

    // 3. Fetch from Backend REST endpoint
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        rawOrders.push(...data.orders);
      }
    } catch (e) {}

    // 4. Always include initial mock orders as baseline
    rawOrders.push(...ordersList);

    // Deduplicate and parse order objects
    const orderMap = new Map<string, Order>();

    for (const o of rawOrders) {
      const orderIdKey = String(o.id || o.orderNumber || o.order_number || '');
      const orderNum = o.orderNumber || o.order_number || `#AX-${orderIdKey.replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

      const dedupeKey = orderNum.trim();
      if (orderMap.has(dedupeKey)) continue;

      const custName = String(o.customerName || o.user_name || 'Valued Guest').trim();
      const custPhone = o.customerPhone || o.user_phone || '+91 84950 93170';
      const rawItems = Array.isArray(o.items) && o.items.length > 0 ? o.items.map((i: any) => {
        const itemName = i.name || (i.item && i.item.name) || i.item_name || 'Designer Item';
        const itemPrice = Number(i.price !== undefined ? i.price : (i.item && i.item.price !== undefined ? i.item.price : 2495));
        const itemQty = Number(i.quantity || i.qty || 1);
        const itemStore = i.brandName || (i.item && i.item.brandName) || i.storeName || i.store_name || o.storeName || o.store_name || 'Grand Mall Store';
        return {
          name: itemName,
          quantity: itemQty,
          price: itemPrice,
          brandName: itemStore,
          storeName: itemStore
        };
      }) : [
        { name: o.item_name || 'Designer Item', quantity: Number(o.quantity || o.itemsCount || 1), price: Number(o.totalAmount || 2495), storeName: o.storeName || o.store_name || 'Grand Mall Store', brandName: o.storeName || o.store_name || 'Grand Mall Store' }
      ];

      const itemStores = Array.from(new Set(rawItems.map((it: any) => it.storeName || it.brandName).filter(Boolean)));
      const finalStoreName = o.storeName || (itemStores.length > 1 ? itemStores.join(', ') : (itemStores[0] || (o.store_name || 'Nike Flagship')));

      let storeCategory = o.storeCategory || 'Fashion';
      const snLower = finalStoreName.toLowerCase();
      if (snLower.includes('starbucks') || snLower.includes('dintai') || snLower.includes('kfc') || snLower.includes('cirque') || snLower.includes('haagen') || snLower.includes('food')) {
        storeCategory = 'Food';
      } else if (snLower.includes('rolex') || snLower.includes('tag') || snLower.includes('leather') || snLower.includes('cartier') || snLower.includes('tiffany') || snLower.includes('sunglass') || snLower.includes('ray-ban')) {
        storeCategory = 'Accessories';
      } else if (snLower.includes('timezone') || snLower.includes('arcade')) {
        storeCategory = 'Entertainment';
      } else if (snLower.includes('spa') || snLower.includes('salon')) {
        storeCategory = 'Services';
      }

      const itemsList = Array.isArray(o.itemsList) ? o.itemsList : 
                        rawItems.map((i: any) => `${i.name} (x${i.quantity})`);

      const totalAmount = Number(o.totalAmount || o.total_amount || rawItems.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0));
      const itemsCount = Number(o.itemsCount || o.quantity || rawItems.reduce((acc: number, i: any) => acc + i.quantity, 0));

      orderMap.set(dedupeKey, {
        id: String(o.id || `ord-${Date.now()}`),
        orderNumber: orderNum,
        customerName: custName,
        customerPhone: custPhone,
        storeName: finalStoreName,
        storeCategory: storeCategory,
        orderType: o.orderType || o.order_type || 'Click & Collect',
        paymentMethod: o.paymentMethod || o.payment_method || 'UPI / GPay',
        itemsCount: itemsCount,
        totalAmount: totalAmount,
        timestamp: o.timestamp || 'Just now',
        status: o.status === 'Completed' || o.status === 'completed' ? 'Completed' : 'Processing',
        itemsList: itemsList,
        items: rawItems
      });
    }

    const parseOrderTimeRank = (ord: Order): number => {
      const ts = String(ord.timestamp || '').toLowerCase();
      if (ts.includes('just now')) return 2000000000000;
      if (ts.includes('pm') || ts.includes('am')) return 1900000000000;
      if (ts.includes('mins ago')) {
        const mins = parseInt(ts) || 0;
        return 1800000000000 - (mins * 60 * 1000);
      }
      if (ts.includes('hour ago') || ts.includes('hours ago')) {
        const hrs = parseInt(ts) || 1;
        return 1700000000000 - (hrs * 3600 * 1000);
      }
      return 1000000000000;
    };

    const sortedList = Array.from(orderMap.values()).sort((a, b) => parseOrderTimeRank(b) - parseOrderTimeRank(a));
    setLiveOrdersList(sortedList);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    setLiveOrdersList(prev => prev.map(o => {
      if (o.id === orderId || o.orderNumber === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    }));

    recordAuditLog('ORDER_STATUS_CHANGED', 'order', orderId, { newStatus: nextStatus });

    fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});
  };

  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 1500);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      eventSource.onmessage = () => {
        fetchLiveOrders();
      };
    } catch (e) {}

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = () => {
        fetchLiveOrders();
      };
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'axionix_orders_list' || e.key === 'axionix_last_event') {
        fetchLiveOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('axionix_order_added', fetchLiveOrders);

    return () => {
      clearInterval(interval);
      eventSource?.close();
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('axionix_order_added', fetchLiveOrders);
    };
  }, []);

  const currentOrders = liveOrdersList.length > 0 ? liveOrdersList : ordersList;

  const orders = currentOrders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          o.storeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 animate-pulse" />
            Mall Digital & Counter Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time unified order feed. Every customer cart checkout generates a single order ID.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadOrdersCSV(orders)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download Orders (CSV)
          </button>

          <div className="text-right border-l border-slate-200 pl-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Total Orders</div>
            <div className="text-lg font-black text-slate-900">{orders.length} Orders</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or Store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={() => downloadOrdersCSV(orders)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV ({orders.length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Store Tenant</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 text-xs font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-400 font-normal">{order.customerPhone}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{order.storeName}</div>
                      <div className="text-xs text-slate-400 font-normal">{order.storeCategory}</div>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium">
                      <span className={`px-2.5 py-1 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 ${
                        order.paymentMethod.includes('UPI') || order.paymentMethod.includes('GPay') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        order.paymentMethod.includes('Card') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        order.paymentMethod.includes('Counter') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        💳 {order.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-black text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {order.timestamp}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        order.status === 'Preparing' || order.status === 'Processing' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        order.status === 'Ready for Pickup' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {order.status !== 'Completed' ? (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs text-[11px] cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-extrabold text-[11px] flex items-center gap-1 mr-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" /> Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Receipt Modal */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md max-h-[85vh] rounded-3xl border border-slate-200 shadow-2xl p-6 flex flex-col justify-between animate-scale-up relative overflow-hidden space-y-4"
          >
            
            {/* Top Close Button (X) */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 p-2 rounded-full transition-all cursor-pointer z-20"
              title="Close Receipt"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto space-y-4 pr-1">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-slate-100 pb-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-1">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">AXIONIX Digital Receipt</h3>
                <p className="text-xs text-blue-600 font-mono font-bold">{selectedOrder.orderNumber}</p>
                <p className="text-[11px] text-slate-400">{selectedOrder.timestamp} • Phoenix Marketcity Bengaluru</p>
              </div>

              {/* Receipt Body Info */}
              <div className="space-y-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Customer Name:</span>
                    <strong className="text-slate-900 font-bold">{selectedOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mobile Phone:</span>
                    <strong className="text-slate-900 font-semibold">{selectedOrder.customerPhone}</strong>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Store Venue:</span>
                    <strong className="text-slate-900 font-bold text-right max-w-[65%]">{selectedOrder.storeName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Payment Mode:</span>
                    <strong className="text-slate-900 font-semibold">{selectedOrder.paymentMethod}</strong>
                  </div>
                </div>

                {/* Items List Breakdown */}
                <div className="space-y-2 pt-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                    <span>Purchased Products ({selectedOrder.itemsCount})</span>
                    <span>Price</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => {
                        const itName = item.name || item.item?.name || item.item_name || 'Item';
                        const itQty = Number(item.quantity || item.qty || 1);
                        const itPrice = Number(item.price !== undefined ? item.price : (item.item?.price !== undefined ? item.item.price : 0));
                        const itStore = item.storeName || item.brandName || item.item?.brandName || selectedOrder.storeName;

                        return (
                          <div key={idx} className="flex justify-between items-start text-xs py-1.5 border-b border-slate-50">
                            <div className="pr-2">
                              <div className="font-semibold text-slate-800 leading-snug">{itName}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {itStore ? <span className="font-medium text-blue-600 mr-1.5">{itStore} •</span> : null}
                                Qty: {itQty} • ₹{itPrice.toLocaleString()} each
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 flex-shrink-0">₹{(itPrice * itQty).toLocaleString()}</span>
                          </div>
                        );
                      })
                    ) : (
                      (selectedOrder.itemsList || []).map((itemStr, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50">
                          <span className="font-medium text-slate-800">{itemStr}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total Paid */}
                <div className="pt-2 border-t border-slate-200 space-y-0.5 text-xs">
                  <div className="flex justify-between items-center font-black text-slate-900 text-sm">
                    <span>Total Paid Amount:</span>
                    <span className="text-emerald-600 text-base">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">Verified Digital Tax Invoice • Keep for store returns</p>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions (ALWAYS VISIBLE CLOSE & DOWNLOAD BUTTONS) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
              <button
                onClick={() => downloadOrderReceiptTXT(selectedOrder)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download Receipt TXT"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                TXT
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print Receipt"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                Print
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
