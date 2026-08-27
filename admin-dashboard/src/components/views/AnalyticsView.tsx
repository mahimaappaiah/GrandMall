import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Users, ShoppingBag, Download,
  Activity, Wifi, CalendarCheck, Receipt, X, ArrowRight,
  ChevronRight, RefreshCw, Star, Package
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { downloadCSV } from '../../utils/exportUtils';
import {
  fetchDashboardMetricsFromSupabase,
  fetchOrdersFromSupabase,
  fetchStoresFromSupabase,
  fetchReservationsFromSupabase,
  fetchConnectedUsersFromSupabase,
  fetchDashboardAnalyticsChartsFromSupabase,
} from '../../services/supabaseService';
import { BACKEND_URL } from '../../lib/config';
import { ViewType } from '../../types';

type Period = 'Today (Real-time)' | 'Last 7 Days' | 'Last 30 Days';
interface DrilldownModal { type: 'kpi' | 'chart' | 'store'; title: string; data: any; }
interface Props { onSelectView?: (view: ViewType) => void; }

const KPI_CONFIG = [
  { id: 'footfall',     label: 'Live Footfall',     icon: Users,        color: 'blue',    nav: 'connected-users' as ViewType, navLabel: 'View Connected Users', desc: 'Total unique visitors tracked via Wi-Fi probe and captive portal check-ins.' },
  { id: 'orders',       label: 'Total Orders',       icon: Receipt,      color: 'emerald', nav: 'orders' as ViewType,          navLabel: 'View All Orders',      desc: 'All digital and counter orders placed across mall tenants.' },
  { id: 'revenue',      label: 'Total Revenue',      icon: TrendingUp,   color: 'purple',  nav: 'orders' as ViewType,          navLabel: 'View Revenue Detail',  desc: 'Aggregated real-time POS revenue synced from all connected tenant stores.' },
  { id: 'reservations', label: 'Reservations',       icon: CalendarCheck,color: 'amber',   nav: 'reservations' as ViewType,    navLabel: 'View Reservations',    desc: 'Table bookings and service reservations made via the guest concierge portal.' },
  { id: 'wifi',         label: 'Connected Users',    icon: Wifi,         color: 'indigo',  nav: 'connected-users' as ViewType, navLabel: 'View Wi-Fi Users',     desc: 'Real-time count of active Wi-Fi sessions on the mall captive portal network.' },
  { id: 'stores',       label: 'Active Stores',      icon: ShoppingBag,  color: 'rose',    nav: 'store-directory' as ViewType, navLabel: 'View Store Directory', desc: 'Total operational tenant stores registered and active in the mall directory.' },
];

const CM: Record<string, { bg: string; text: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600'  },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600'   },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600'    },
};

function buildBuckets(items: { created_at?: string }[]) {
  const b: Record<number, number> = {};
  for (let h = 6; h <= 22; h++) b[h] = 0;
  items.forEach(x => {
    if (!x.created_at) return;
    const h = new Date(x.created_at).getHours();
    if (h >= 6 && h <= 22) b[h]++;
  });
  return b;
}

function fmtRev(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString()}`;
}

export const AnalyticsView: React.FC<Props> = ({ onSelectView }) => {
  const [period, setPeriod] = useState<Period>('Today (Real-time)');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [drilldown, setDrilldown] = useState<DrilldownModal | null>(null);

  const [kpis, setKpis] = useState({ footfall: 0, orders: 0, revenue: 0, reservations: 0, wifi: 0, stores: 0 });
  const [trafficLabels, setTrafficLabels] = useState<string[]>([]);
  const [trafficData,   setTrafficData]   = useState<number[]>([]);
  const [footfallLabels,setFootfallLabels]= useState<string[]>([]);
  const [footfallData,  setFootfallData]  = useState<number[]>([]);
  const [catChart,      setCatChart]      = useState<any>(null);
  const [tenantRows,    setTenantRows]    = useState<any[]>([]);
  const [tenantLabels,  setTenantLabels]  = useState<string[]>([]);
  const [tenantVals,    setTenantVals]    = useState<number[]>([]);
  const [orderRows,     setOrderRows]     = useState<any[]>([]);
  const [resRows,       setResRows]       = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [mRes, oRes, sRes, rRes, uRes, cRes] = await Promise.all([
        fetchDashboardMetricsFromSupabase().catch(() => null),
        fetchOrdersFromSupabase().catch(() => ({ data: [] as any[], isLive: false })),
        fetchStoresFromSupabase().catch(() => ({ data: [] as any[], isLive: false })),
        fetchReservationsFromSupabase().catch(() => ({ data: [] as any[], isLive: false })),
        fetchConnectedUsersFromSupabase().catch(() => ({ data: [] as any[], isLive: false })),
        fetchDashboardAnalyticsChartsFromSupabase().catch(() => null),
      ]);

      const orders = (oRes as any).data || [];
      const stores = (sRes as any).data || [];
      const reservations = (rRes as any).data || [];
      const users = (uRes as any).data || [];

      const liveRev = orders.reduce((s: number, o: any) => s + (Number(o.totalAmount) || 0), 0);
      const ff = (mRes as any)?.metrics?.new_users_today ?? users.length;

      setKpis({ footfall: ff, orders: orders.length, revenue: liveRev, reservations: reservations.length, wifi: users.length, stores: stores.length });

      const tb = buildBuckets(users);
      setTrafficLabels(Object.keys(tb).map(h => `${h}:00`));
      setTrafficData(Object.values(tb));

      const fb = buildBuckets([
        ...orders.map((o: any) => ({ created_at: o.createdAt || o.created_at })),
        ...reservations.map((r: any) => ({ created_at: r.created_at })),
      ]);
      setFootfallLabels(Object.keys(fb).map(h => `${h}:00`));
      setFootfallData(Object.values(fb));

      if ((cRes as any)?.categoryDistributionChart) setCatChart((cRes as any).categoryDistributionChart);

      const sm: Record<string, number> = {};
      orders.forEach((o: any) => { const s = o.storeName || 'Unknown'; sm[s] = (sm[s] || 0) + (Number(o.totalAmount) || 0); });
      stores.forEach((s: any) => { if (s.revenueToday && !sm[s.name]) sm[s.name] = Number(s.revenueToday); });
      const sorted = Object.entries(sm).sort(([, a], [, b]) => b - a).slice(0, 8);

      setTenantLabels(sorted.map(([k]) => k));
      setTenantVals(sorted.map(([, v]) => v));
      setTenantRows(sorted.map(([name, rev]) => {
        const obj = stores.find((s: any) => s.name === name);
        return { name, revenue: rev, orders: orders.filter((o: any) => o.storeName === name).length, category: obj?.category || 'Retail', floor: obj?.floor || '-' };
      }));

      setOrderRows(orders.slice(0, 10));
      setResRows(reservations.slice(0, 10));
      setLastUpdated(new Date());
      setLoading(false);
    } catch (_) { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 10000);
    let es: EventSource | null = null;
    try { es = new EventSource(`${BACKEND_URL}/api/realtime/stream`); es.onmessage = () => fetchAll(); } catch (_) {}
    return () => { clearInterval(iv); es?.close(); };
  }, [fetchAll]);

  const kpiVals: Record<string, string> = {
    footfall: kpis.footfall > 0 ? kpis.footfall.toLocaleString() : '—',
    orders: kpis.orders > 0 ? kpis.orders.toLocaleString() : '—',
    revenue: kpis.revenue > 0 ? fmtRev(kpis.revenue) : '—',
    reservations: kpis.reservations > 0 ? kpis.reservations.toLocaleString() : '—',
    wifi: kpis.wifi > 0 ? kpis.wifi.toLocaleString() : '—',
    stores: kpis.stores > 0 ? kpis.stores.toLocaleString() : '—',
  };

  const tChartData = {
    labels: trafficLabels.length > 0 ? trafficLabels : ['—'],
    datasets: [{ label: 'Wi-Fi Users', data: trafficData.length > 0 ? trafficData : [0], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.10)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#2563eb' }],
  };
  const fChartData = {
    labels: footfallLabels.length > 0 ? footfallLabels : ['—'],
    datasets: [{ label: 'Activity', data: footfallData.length > 0 ? footfallData : [0], backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 8 }],
  };
  const defCat = { labels: ['Food & Dining', 'Fashion', 'Electronics', 'Entertainment', 'Services'], datasets: [{ data: [35, 28, 18, 12, 7], backgroundColor: ['#2563eb','#f59e0b','#10b981','#8b5cf6','#ec4899'], borderWidth: 2, borderColor: '#fff' }] };
  const tenantChartData = {
    labels: tenantLabels.length > 0 ? tenantLabels : ['—'],
    datasets: [{ label: 'Revenue', data: tenantVals.length > 0 ? tenantVals : [0], backgroundColor: ['#2563eb','#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#f43f5e'], borderRadius: 8 }],
  };

  const handleExport = () => {
    downloadCSV(`AXIONIX_Analytics_${new Date().toISOString().split('T')[0]}.csv`, ['Metric', 'Value', 'Period'], [
      ['Footfall', kpis.footfall.toString(), period],
      ['Orders', kpis.orders.toString(), period],
      ['Revenue', fmtRev(kpis.revenue), period],
      ['Reservations', kpis.reservations.toString(), period],
      ['Wi-Fi Users', kpis.wifi.toString(), period],
      ['Active Stores', kpis.stores.toString(), period],
      ...tenantLabels.map((n, i) => [`Store: ${n}`, fmtRev(tenantVals[i] || 0), period]),
    ]);
  };

  const openKpi = (id: string) => {
    const cfg = KPI_CONFIG.find(k => k.id === id)!;
    const extra = id === 'orders' ? { rows: orderRows, type: 'orders' } : id === 'reservations' ? { rows: resRows, type: 'reservations' } : { type: id };
    setDrilldown({ type: 'kpi', title: cfg.label, data: { ...extra, cfg } });
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as any;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Mall Live Analytics &amp; Business Intelligence
            {period === 'Today (Real-time)' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any card or chart for a live drill-down. Auto-refreshes every 10s.{' '}
            <span className="text-slate-400">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchAll} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleExport} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all">
            <Download className="w-4 h-4" /> Download Analytics (CSV)
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Period:</span>
            <select value={period} onChange={e => setPeriod(e.target.value as Period)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="Today (Real-time)">Today (Real-time)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards — all clickable */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CONFIG.map(cfg => {
          const c = CM[cfg.color];
          const Icon = cfg.icon;
          return (
            <button key={cfg.id} onClick={() => openKpi(cfg.id)}
              className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-200 text-left cursor-pointer hover:-translate-y-0.5 active:scale-95 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.text}`} />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{cfg.label}</div>
              <div className={`text-lg font-extrabold ${loading ? 'text-slate-300' : c.text}`}>{loading ? '…' : kpiVals[cfg.id]}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">{cfg.navLabel}</div>
            </button>
          );
        })}
      </div>

      {/* Charts — all clickable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 group"
          onClick={() => setDrilldown({ type: 'chart', title: 'Wi-Fi Traffic Breakdown', data: { type: 'traffic', data: trafficData } })}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-500" /> Hourly Connected Wi-Fi Traffic
              {period === 'Today (Real-time)' && <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
            </h3>
            <span className="text-xs font-semibold text-blue-600">Live: {kpis.wifi} <ChevronRight className="w-3 h-3 inline" /></span>
          </div>
          <div className="h-52"><Line data={tChartData} options={{ ...chartOpts, scales: { y: { beginAtZero: true } } }} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 group"
          onClick={() => setDrilldown({ type: 'chart', title: 'Footfall & Activity by Hour', data: { type: 'footfall', data: footfallData } })}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" /> Hourly Footfall Distribution
            </h3>
            <span className="text-xs font-semibold text-emerald-600">Total: {kpis.footfall.toLocaleString()} <ChevronRight className="w-3 h-3 inline" /></span>
          </div>
          <div className="h-52"><Bar data={fChartData} options={{ ...chartOpts, scales: { y: { beginAtZero: true } } }} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 group"
          onClick={() => setDrilldown({ type: 'chart', title: 'Category Visitor Distribution', data: { type: 'category', chart: catChart || defCat } })}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" /> Category Distribution
            </h3>
            <span className="text-xs font-semibold text-purple-600">{kpis.stores} stores <ChevronRight className="w-3 h-3 inline" /></span>
          </div>
          <div className="h-52 flex items-center justify-center">
            <Doughnut data={catChart || defCat} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 group"
          onClick={() => setDrilldown({ type: 'chart', title: 'Tenant Revenue Ranking', data: { type: 'tenant', rows: tenantRows } })}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Tenant Sales Ranking
            </h3>
            <span className="text-xs font-semibold text-blue-600">{kpis.orders} orders <ChevronRight className="w-3 h-3 inline" /></span>
          </div>
          <div className="h-52"><Bar data={tenantChartData} options={{ ...chartOpts, indexAxis: 'y', scales: { x: { beginAtZero: true } } }} /></div>
        </div>

      </div>

      {/* Tenant Table — each row clickable */}
      {tenantRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Tenant Performance — Click a row for details
            </h3>
            <span className="text-xs text-slate-400">Ranked by live revenue</span>
          </div>
          <div className="divide-y divide-slate-50">
            {tenantRows.map((row, idx) => (
              <button key={row.name} onClick={() => setDrilldown({ type: 'store', title: row.name, data: row })}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50 transition-colors text-left group cursor-pointer">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{row.name}</div>
                  <div className="text-[10px] text-slate-400">{row.category} · {row.floor}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">{fmtRev(row.revenue)}</div>
                  <div className="text-[10px] text-slate-400">{row.orders} orders</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drill-down Modal */}
      {drilldown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setDrilldown(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> {drilldown.title}
              </h2>
              <button onClick={() => setDrilldown(null)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* KPI Drill-down */}
              {drilldown.type === 'kpi' && (() => {
                const d = drilldown.data;
                const cfg = d.cfg as typeof KPI_CONFIG[0];
                const c = CM[cfg.color];
                return (
                  <div className="space-y-4">
                    <div className={`${c.bg} rounded-2xl p-5 flex items-center gap-4`}>
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <cfg.icon className={`w-6 h-6 ${c.text}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-slate-900">{kpiVals[cfg.id]}</div>
                        <div className="text-sm text-slate-600">{cfg.label}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{cfg.desc}</p>

                    {d.type === 'orders' && d.rows?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Recent Orders</div>
                        {d.rows.map((o: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{o.customerName || 'Guest'}</div>
                              <div className="text-[11px] text-slate-500">{o.storeName} · {o.orderNumber || (o.id || '').slice(0, 8)}</div>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{fmtRev(Number(o.totalAmount) || 0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {d.type === 'reservations' && d.rows?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Recent Reservations</div>
                        {d.rows.map((r: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{r.guestName}</div>
                              <div className="text-[11px] text-slate-500">{r.storeName} · {r.refCode} · Party: {r.partySize}</div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {onSelectView && (
                      <button onClick={() => { setDrilldown(null); onSelectView(cfg.nav); }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all">
                        {cfg.navLabel} <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Chart Drill-down */}
              {drilldown.type === 'chart' && (() => {
                const d = drilldown.data;
                if (d.type === 'traffic' || d.type === 'footfall') {
                  const cd = d.type === 'traffic' ? tChartData : fChartData;
                  const arr = d.data as number[] || [];
                  return (
                    <div className="space-y-3">
                      <div className="h-64">
                        {d.type === 'traffic' ? <Line data={cd} options={{ responsive: true, maintainAspectRatio: false }} /> : <Bar data={cd} options={{ responsive: true, maintainAspectRatio: false }} />}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ l: 'Peak Count', v: Math.max(...(arr.length ? arr : [0])) }, { l: 'Hourly Avg', v: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0 }, { l: 'Total', v: arr.reduce((a, b) => a + b, 0) }].map(s => (
                          <div key={s.l} className="bg-slate-50 rounded-xl p-3 text-center">
                            <div className="text-lg font-extrabold text-slate-900">{s.v}</div>
                            <div className="text-[10px] text-slate-500">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (d.type === 'category') {
                  return (
                    <div className="space-y-3">
                      <div className="h-64 flex items-center justify-center">
                        <Doughnut data={d.chart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 12 } } } } }} />
                      </div>
                      <div className="space-y-2">
                        {d.chart?.labels?.map((label: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.chart.datasets[0].backgroundColor[i] }} />
                              <span className="text-sm font-medium text-slate-700">{label}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{d.chart.datasets[0].data[i]}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (d.type === 'tenant') {
                  return (
                    <div className="space-y-2">
                      {(d.rows || []).map((row: any, idx: number) => (
                        <button key={row.name} onClick={() => { setDrilldown(null); setTimeout(() => setDrilldown({ type: 'store', title: row.name, data: row }), 50); }}
                          className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors text-left group">
                          <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">{row.name}</div>
                            <div className="text-[10px] text-slate-400">{row.category} · {row.orders} orders</div>
                          </div>
                          <div className="text-sm font-bold text-blue-600">{fmtRev(row.revenue)}</div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Store Drill-down */}
              {drilldown.type === 'store' && (() => {
                const row = drilldown.data;
                return (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                      <div className="text-xl font-extrabold text-slate-900">{row.name}</div>
                      <div className="text-sm text-slate-500">{row.category} · {row.floor}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-extrabold text-blue-600">{fmtRev(row.revenue)}</div>
                        <div className="text-xs text-slate-500 mt-1">Total Revenue</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-extrabold text-emerald-600">{row.orders}</div>
                        <div className="text-xs text-slate-500 mt-1">Orders Placed</div>
                      </div>
                    </div>
                    {row.orders > 0 && (
                      <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div className="text-sm text-emerald-800 font-medium">
                          Avg order value: <span className="font-extrabold">{fmtRev(Math.round(row.revenue / row.orders))}</span>
                        </div>
                      </div>
                    )}
                    {onSelectView && (
                      <button onClick={() => { setDrilldown(null); onSelectView('store-directory'); }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all">
                        View in Store Directory <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
