import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, Search, Filter, Eye, Edit3, BarChart3, Star, MapPin, Download } from 'lucide-react';
import { MOCK_STORES } from '../../data/mockData';
import { Store } from '../../types';
import { downloadStoresCSV } from '../../utils/exportUtils';
import { fetchStoresFromSupabase, fetchOrdersFromSupabase, fetchConnectedUsersFromSupabase } from '../../services/supabaseService';
import { BrandLogo } from '../BrandLogo';

interface StoreDirectoryViewProps {
  onSelectStore: (store: Store) => void;
  onSelectStoreAnalytics: (store: Store) => void;
  storesList?: Store[];
}

export const StoreDirectoryView: React.FC<StoreDirectoryViewProps> = ({
  onSelectStore,
  onSelectStoreAnalytics,
  storesList = MOCK_STORES
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [allStores, setAllStores] = useState<Store[]>(storesList);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);

  useEffect(() => {
    if (storesList && storesList.length > 0) {
      setAllStores(storesList);
    }
  }, [storesList]);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveData = async () => {
      try {
        const [storesRes, ordersRes, usersRes] = await Promise.all([
          fetchStoresFromSupabase().catch(() => ({ data: MOCK_STORES, isLive: false })),
          fetchOrdersFromSupabase().catch(() => ({ data: [], isLive: false })),
          fetchConnectedUsersFromSupabase().catch(() => ({ data: [], isLive: false }))
        ]);

        if (isMounted) {
          if (storesRes.data && storesRes.data.length > 0) {
            setAllStores(storesRes.data);
          }
          if (ordersRes.data) {
            setLiveOrders(ordersRes.data);
          }
          if (usersRes.data) {
            setLiveUsers(usersRes.data);
          }
        }
      } catch (e) {
        console.warn('[StoreDirectoryView] Data sync note:', e);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stores = allStores.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          (s.manager || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.zone || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesFloor = floorFilter === 'All' || s.floor === floorFilter;
    return matchesSearch && matchesCat && matchesFloor;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-blue-600" />
            Mall Store Directory & Tenant Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {allStores.length} Verified Flagships across Food, Fashion, Luxury, Tech, and Mall Services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadStoresCSV(stores)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Directory (CSV)
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Store Name, Category, or Zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Fashion">Fashion & Apparel</option>
            <option value="Accessories">Accessories & Tech</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Services">Services</option>
          </select>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Floors</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="3rd Floor">3rd Floor</option>
          </select>
        </div>
      </div>

      {/* Stores Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Store Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Floor & Zone</th>
                <th className="px-5 py-3.5">Visitors Today</th>
                <th className="px-5 py-3.5">Orders</th>
                <th className="px-5 py-3.5">Bookings</th>
                <th className="px-5 py-3.5">Conversion %</th>
                <th className="px-5 py-3.5">Revenue Today</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-400">
                    No stores found matching selected filters.
                  </td>
                </tr>
              ) : (
                stores.map(store => {
                  const sClean = store.name.toLowerCase().trim();
                  const sId = String(store.id || '');

                  const totalVisitors = Number(store.visitorsToday) || 0;
                  const totalOrders = Number(store.ordersCount) || 0;
                  const totalRevenue = Number(store.revenueToday) || 0;
                  const bookingsCount = Number(store.reservationsCount) || 0;
                  const convRate = Number(store.conversionRate) || 45.0;

                  return (
                    <tr 
                      key={store.id} 
                      onClick={() => onSelectStore(store)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <BrandLogo logoVariant={store.logoVariant} logoImg={store.logo || (store as any).logoImg} storeName={store.name} className="w-9 h-9 rounded-xl shadow-2xs" />
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{store.name}</div>
                            <div className="text-xs text-slate-400 font-normal">{store.manager || 'Store Manager'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          {store.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-800 font-medium">
                        <div className="font-bold text-slate-900">{store.floor}</div>
                        <div className="text-slate-400 text-[11px]">{store.zone}</div>
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-900">
                        {totalVisitors.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-900">
                        {totalOrders.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-900">
                        {bookingsCount}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-emerald-600">
                        {convRate}%
                      </td>

                      <td className="px-5 py-4 text-xs font-black text-blue-700">
                        ₹{totalRevenue.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          store.status === 'Peak' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          store.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {store.status || 'Open'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStore(store);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg font-bold transition-all cursor-pointer"
                            title="View Store Details & POS Feed"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStoreAnalytics(store);
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg font-bold transition-all cursor-pointer"
                            title="View Store Analytics"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
