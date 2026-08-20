import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wifi, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Megaphone, 
  FileSpreadsheet, 
  PlusCircle, 
  RefreshCw,
  HardDrive,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { KpiCard } from '../KpiCard';
import { 
  MOCK_KPI_DATA, 
  getLocationKpiData,
  LOCATION_METRICS,
  HOURLY_CONNECTED_USERS, 
  DAILY_FOOTFALL, 
  CATEGORY_DISTRIBUTION, 
  TOP_PERFORMING_STORES_CHART,
  MOCK_ACTIVITY_FEED,
  MOCK_CAMPAIGNS
} from '../../data/mockData';
import { 
  fetchDashboardMetricsFromSupabase, 
  fetchActivityLogsFromSupabase, 
  fetchCampaignsFromSupabase,
  fetchDashboardAnalyticsChartsFromSupabase,
  TopStoresChartData,
  CategoryDistributionChartData
} from '../../services/supabaseService';
import { realtimeManager } from '../../services/realtimeService';
import { ViewType, KpiItem, Campaign, ActivityLog } from '../../types';
import { BACKEND_URL } from '../../lib/config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  selectedMall: string;
  onSelectView: (view: ViewType) => void;
  onOpenReportModal: (type: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedMall,
  onSelectView,
  onOpenReportModal
}) => {
  const [activityFeed, setActivityFeed] = useState<ActivityLog[]>(MOCK_ACTIVITY_FEED);
  const [timeframeFilter, setTimeframeFilter] = useState<'Today' | 'Yesterday' | 'Last Week'>('Today');
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [kpiData, setKpiData] = useState<KpiItem[]>(() => getLocationKpiData(selectedMall));
  const [rawMetrics, setRawMetrics] = useState<{ active_users?: number; new_users_today?: number } | null>(null);
  const [topStoresChart, setTopStoresChart] = useState<TopStoresChartData>(TOP_PERFORMING_STORES_CHART);
  const [categoryDistributionChart, setCategoryDistributionChart] = useState<CategoryDistributionChartData>(CATEGORY_DISTRIBUTION);
  const [highestDwellZone, setHighestDwellZone] = useState<string>('Food Court (32%)');
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLiveAxionixMetrics = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/metrics`);
      const data = await res.json();
      if (data.success) {
        setRawMetrics({
          active_users: data.activeUsers,
          new_users_today: data.totalFootfall
        });

        const liveRevNum = Number(data.totalRevenue || 19500000);
        const liveRevenueStr = liveRevNum >= 10000000 
          ? `₹${(liveRevNum / 10000000).toFixed(2)} Cr`
          : `₹${(liveRevNum / 100000).toFixed(2)} L`;

        const updatedKpis: KpiItem[] = [
          {
            id: 'connected-users',
            title: 'CONNECTED USERS',
            value: `${data.activeUsers || 6} Active`,
            change: '+12.4%',
            changeType: 'increase',
            period: 'vs yesterday',
            iconName: 'Wifi',
            sparklineData: [40, 55, 65, 80, 95, 110, data.activeUsers || 6]
          },
          {
            id: 'todays-visitors',
            title: "TODAY'S VISITORS",
            value: Number(data.totalFootfall || 4965).toLocaleString(),
            change: '+8.7%',
            changeType: 'increase',
            period: 'vs average weekday',
            iconName: 'Users',
            sparklineData: [3200, 3800, 4200, 4500, 4800, data.totalFootfall || 4965]
          },
          {
            id: 'store-visits',
            title: 'STORE VISITS',
            value: Number(data.storeVisits || data.totalFootfall || 4965).toLocaleString(),
            change: '+15.2%',
            changeType: 'increase',
            period: 'cumulative footfall',
            iconName: 'ShoppingBag',
            sparklineData: [12000, 14000, 16000, 17500, data.storeVisits || 4965]
          },
          {
            id: 'reservations',
            title: 'RESERVATIONS',
            value: String(data.totalReservations || 2),
            change: '+18.9%',
            changeType: 'increase',
            period: 'dining & services booked',
            iconName: 'CalendarCheck',
            sparklineData: [100, 150, 220, 310, data.totalReservations || 2]
          },
          {
            id: 'revenue',
            title: 'REVENUE',
            value: liveRevenueStr,
            change: '+14.1%',
            changeType: 'increase',
            period: 'gross mall sales today',
            iconName: 'IndianRupee',
            sparklineData: [800000, 1100000, 1400000, 1700000, liveRevNum]
          },
          {
            id: 'coupon-redemptions',
            title: 'COUPON REDEMPTIONS',
            value: String(data.totalRedemptions || 13),
            change: '+22.5%',
            changeType: 'increase',
            period: 'via AXIONIX app',
            iconName: 'Ticket',
            sparklineData: [300, 450, 600, 750, data.totalRedemptions || 13]
          }
        ];

        setKpiData(updatedKpis);
      }
    } catch (err) {}
  };

  useEffect(() => {
    let isMounted = true;
    fetchLiveAxionixMetrics();
    const interval = setInterval(fetchLiveAxionixMetrics, 2000);

    const loadSupabaseDashboard = async () => {
      try {
        const [metricsRes, logsRes, campRes, chartsRes] = await Promise.all([
          fetchDashboardMetricsFromSupabase(selectedMall),
          fetchActivityLogsFromSupabase(),
          fetchCampaignsFromSupabase(),
          fetchDashboardAnalyticsChartsFromSupabase()
        ]);

        if (isMounted) {
          if (logsRes.data && logsRes.isLive) setActivityFeed(logsRes.data);
          if (campRes.data && campRes.isLive) setCampaignsList(campRes.data);
          if (chartsRes.topStoresChart) setTopStoresChart(chartsRes.topStoresChart);
          if (chartsRes.categoryDistributionChart) setCategoryDistributionChart(chartsRes.categoryDistributionChart);
          if (chartsRes.highestDwellCategory) setHighestDwellZone(chartsRes.highestDwellCategory);
        }
      } catch (err) {}
    };

    loadSupabaseDashboard();
    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [selectedMall]);

  // Realtime live updates for Dashboard Metrics and Activity Feed
  useEffect(() => {
    const unsubMetrics = realtimeManager.subscribe('mall_dashboard_metrics', () => {
      fetchDashboardMetricsFromSupabase(selectedMall).then(res => {
        if (res.kpiItems) setKpiData(res.kpiItems);
        if (res.metrics) setRawMetrics(res.metrics);
      });
    });

    const unsubLogs = realtimeManager.subscribe('activity_logs', () => {
      if (!isLivePaused) {
        fetchActivityLogsFromSupabase().then(res => {
          if (res.data && res.isLive) setActivityFeed(res.data);
        });
      }
    });

    return () => {
      unsubMetrics();
      unsubLogs();
    };
  }, [selectedMall, isLivePaused]);

  const metrics = LOCATION_METRICS[selectedMall] || LOCATION_METRICS['Phoenix Marketcity Bengaluru'];
  const dynamicKpiData = kpiData;

  const connectedDevicesDisplay = rawMetrics?.active_users !== undefined
    ? `${rawMetrics.active_users.toLocaleString()} Devices`
    : `${metrics.connectedUsers} Devices`;

  const todaysVisitorsDisplay = rawMetrics?.new_users_today !== undefined
    ? `${rawMetrics.new_users_today.toLocaleString()} Guests`
    : `${metrics.visitors} Guests`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. LARGE WELCOME CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-600/15">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Gateway Active
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, Administrator
            </h1>

            <p className="text-blue-100 text-sm max-w-xl">
              Real-time operational oversight for <strong className="text-white font-semibold">{selectedMall}</strong>. Network bandwidth and footfall density are operating within optimal capacity.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl">
                <div className="text-[11px] text-blue-200 font-semibold uppercase">MALL LOCATION</div>
                <div className="text-sm font-bold text-white truncate mt-0.5">{selectedMall}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl">
                <div className="text-[11px] text-blue-200 font-semibold uppercase">NETWORK STATUS</div>
                <div className="text-sm font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl">
                <div className="text-[11px] text-blue-200 font-semibold uppercase">CONNECTED DEVICES</div>
                <div className="text-sm font-bold text-white mt-0.5">{connectedDevicesDisplay}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl">
                <div className="text-[11px] text-blue-200 font-semibold uppercase">TODAY'S VISITORS</div>
                <div className="text-sm font-bold text-white mt-0.5">{todaysVisitorsDisplay}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onSelectView('campaigns')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4 text-blue-600" />
              Broadcast Campaign
            </button>

            <button
              onClick={() => onOpenReportModal('Daily Mall Operations')}
              className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white border border-white/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-200" />
              Generate Report
            </button>

            <button
              onClick={() => onSelectView('store-directory')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Stores
            </button>
          </div>

        </div>
      </div>

      {/* 2. KPI SECTION (8 PREMIUM CARDS) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Key Performance Indicators ({timeframeFilter})
          </h2>
          
          {/* Timeframe Comparison Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTimeframeFilter('Today')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframeFilter === 'Today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today (Live)
            </button>
            <button
              onClick={() => setTimeframeFilter('Yesterday')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframeFilter === 'Yesterday'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setTimeframeFilter('Last Week')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframeFilter === 'Last Week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicKpiData.map((kpi) => (
            <KpiCard
              key={kpi.id}
              item={kpi}
              onClick={() => {
                const t = kpi.title.toLowerCase();
                if (t.includes('users') || kpi.id === 'connected-users') onSelectView('connected-users');
                else if (t.includes('visitor') || t.includes('store') || kpi.id === 'todays-visitors' || kpi.id === 'store-visits') onSelectView('store-directory');
                else if (t.includes('reservation') || kpi.id === 'reservations') onSelectView('reservations');
                else if (t.includes('revenue') || kpi.id === 'revenue') onSelectView('analytics');
                else if (t.includes('coupon') || kpi.id === 'coupon-redemptions') onSelectView('coupons');
                else onSelectView('analytics');
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Chart: Hourly Connected Users */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hourly Connected WiFi Users</h3>
              <p className="text-xs text-slate-500">Live comparison vs yesterday's bandwidth load</p>
            </div>
            <button 
              onClick={() => onSelectView('analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Analytics
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72">
            <Line 
              data={HOURLY_CONNECTED_USERS}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, usePointStyle: true, font: { size: 11, weight: 'bold' } }
                  },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                  y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>

        {/* Donut Chart: Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Category Footfall Share</h3>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Today</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Footfall distribution by store category</p>

            <div className="h-48 flex items-center justify-center">
              <Doughnut 
                data={categoryDistributionChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } }
                  },
                  cutout: '65%'
                }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium mt-2">
            <span>Highest Dwell Zone:</span>
            <strong className="text-slate-900 font-bold">{highestDwellZone}</strong>
          </div>
        </div>

      </div>

      {/* 4. LOWER CHARTS & LIVE STREAM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Footfall Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Footfall Trend</h3>
              <p className="text-xs text-slate-500">Weekly total visitors (Mon - Sun)</p>
            </div>
          </div>

          <div className="h-56">
            <Bar 
              data={DAILY_FOOTFALL}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#F1F5F9' } }
                }
              }}
            />
          </div>
        </div>

        {/* Top Performing Stores Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Stores by Revenue</h3>
              <p className="text-xs text-slate-500">Tenant POS sales (in ₹ Thousands)</p>
            </div>
            <button 
              onClick={() => onSelectView('store-directory')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Directory
            </button>
          </div>

          <div className="h-56">
            <Bar 
              data={topStoresChart}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: '#F1F5F9' } },
                  y: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* LIVE ACTIVITY TIMELINE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
              </div>
              
              <button
                onClick={() => setIsLivePaused(!isLivePaused)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${!isLivePaused ? 'animate-spin' : ''}`} />
                {isLivePaused ? 'Resume Stream' : 'Live Stream'}
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {activityFeed.map((item) => (
                <div key={item.id} className="pt-2 text-xs flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {item.userName}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        item.badgeType === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                        item.badgeType === 'purple' ? 'bg-purple-100 text-purple-800' :
                        item.badgeType === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onSelectView('connected-users')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All Connected WiFi Journeys &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 5. NETWORK HEALTH & CAMPAIGN SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Network Health Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">WiFi Gateway Network Health</h3>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              HEALTHY • 99.98%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">WiFi Uptime</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">99.98%</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Throughput</div>
              <div className="text-base font-extrabold text-blue-600 mt-1">240 Mbps</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Connected Devices</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">1,482</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Offline APs</div>
              <div className="text-base font-extrabold text-emerald-600 mt-1">0 (All 42 Live)</div>
            </div>
          </div>
        </div>

        {/* Active Campaign Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Campaign Performance Overview</h3>
            </div>
            <button
              onClick={() => onSelectView('campaigns')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Campaign Manager &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Campaigns</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">{campaignsList.length}</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Coupons Issued</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {(campaignsList.reduce((acc, c) => acc + (c.reach || 0), 0) || 8000).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Coupons Redeemed</div>
              <div className="text-base font-extrabold text-emerald-600 mt-1">
                {campaignsList.reduce((acc, c) => acc + (c.couponsRedeemed || 0), 0) > 0 
                  ? campaignsList.reduce((acc, c) => acc + (c.couponsRedeemed || 0), 0).toLocaleString() 
                  : '2,111 (26%)'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Marketing Conversion</div>
              <div className="text-base font-extrabold text-blue-600 mt-1">
                {campaignsList.length > 0 && campaignsList.some(c => c.roi > 0)
                  ? `${Math.round(campaignsList.reduce((acc, c) => acc + (c.roi || 0), 0) / campaignsList.length)}% ROI`
                  : '340% ROI'}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
