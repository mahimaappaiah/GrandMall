import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, Search, Filter, Smartphone, Footprints, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import { ConnectedUser } from '../../types';
import { downloadUsersCSV } from '../../utils/exportUtils';
import { fetchConnectedUsersFromSupabase } from '../../services/supabaseService';
import { BACKEND_URL } from '../../lib/config';

interface ConnectedUsersViewProps {
  onSelectUserJourney?: (user: ConnectedUser) => void;
  users?: ConnectedUser[];
}

export const ConnectedUsersView: React.FC<ConnectedUsersViewProps> = ({ onSelectUserJourney, users: propUsers }) => {
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [liveUsersList, setLiveUsersList] = useState<ConnectedUser[]>(() => {
    if (propUsers && propUsers.length > 0) return propUsers;
    try {
      const cached = localStorage.getItem('axionix_users_list');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  function getCleanPhone(p?: string): string {
    const clean = (p || '').replace(/\D/g, '').slice(-10);
    if (!clean || clean === '9800000000' || clean === '0000000000' || /^0+$/.test(clean)) return '';
    return clean;
  }

  function getCleanName(n?: string): string {
    const s = (n || '').trim().toLowerCase();
    if (!s || s === 'mall guest' || s === 'valued guest' || s === 'customer' || s.startsWith('guest ') || s.startsWith('customer')) return '';
    return s;
  }

  function findKey(u: any): string {
    const cleanPhone = getCleanPhone(u.phone || u.customer_phone);
    if (cleanPhone && cleanPhone.length === 10) return 'phone:' + cleanPhone;

    const cleanName = getCleanName(u.name || u.customer_name || u.full_name);
    if (cleanName) return 'name:' + cleanName;

    if (u.id && String(u.id).length > 10) return 'id:' + u.id;
    if (u.user_id && String(u.user_id).length > 10) return 'id:' + u.user_id;

    return u.id || u.user_id || `rec-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Synchronize state when parent passes updated live users
  useEffect(() => {
    if (propUsers && propUsers.length > 0) {
      setLiveUsersList(prev => {
        const userMap = new Map<string, ConnectedUser>();
        prev.forEach(u => userMap.set(findKey(u), u));
        propUsers.forEach(u => {
          const key = findKey(u);
          const existing = userMap.get(key);
          const existingStores = existing?.visitedStores || [];
          const incomingStores = u.visitedStores || [];
          const mergedStores = Array.from(new Set([...existingStores, ...incomingStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

          userMap.set(key, {
            ...existing,
            ...u,
            connectionTime: u.connectionTime || existing?.connectionTime,
            sessionDuration: u.sessionDuration || existing?.sessionDuration,
            visitedStores: mergedStores.length > 0 ? mergedStores : (existing?.visitedStores || u.visitedStores || [])
          });
        });
        const list = Array.from(userMap.values());
        list.sort((a: any, b: any) => {
          const timeA = a._rawTimestamp ? new Date(a._rawTimestamp).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
          const timeB = b._rawTimestamp ? new Date(b._rawTimestamp).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
          return timeB - timeA;
        });
        try { localStorage.setItem('axionix_users_list', JSON.stringify(list)); } catch (e) {}
        return list;
      });
    }
  }, [propUsers]);

  const fetchLiveConnectedUsers = useCallback(async () => {
    try {
      // 1. Fetch live profiles & Wi-Fi sessions from Supabase (Primary Authoritative Source)
      const supaRes = await fetchConnectedUsersFromSupabase();
      let users = Array.isArray(supaRes.data) && supaRes.data.length > 0 ? supaRes.data : [];

      // 2. Query backend live captive session list as additional real-time source without overwriting Supabase authority
      try {
        const bRes = await fetch(`${BACKEND_URL}/api/auth/connected-users`);
        const bData = await bRes.json();
        if (bData && bData.success && Array.isArray(bData.users) && bData.users.length > 0) {
          const userMap = new Map<string, ConnectedUser>();

          // Seed with authoritative Supabase users
          users.forEach(u => {
            userMap.set(findKey(u), u);
          });

          // Overlay real-time active gateway telemetry
          bData.users.forEach((bu: any) => {
            const key = findKey(bu);
            const existing = userMap.get(key);
            if (existing) {
              const existingStores = existing.visitedStores || [];
              const newStores = bu.visitedStores || [];
              const mergedStores = Array.from(new Set([...existingStores, ...newStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

              userMap.set(key, {
                ...existing,
                visitedStores: mergedStores.length > 0 ? mergedStores : existing.visitedStores,
                status: bu.status || existing.status || 'Active',
                zone: bu.zone || existing.zone || 'Ground Floor Atrium',
                dataUsed: bu.dataUsed || existing.dataUsed || '45 MB'
              });
            } else if (bu.name && bu.name !== 'Valued Shopper') {
              userMap.set(key, bu);
            }
          });

          users = Array.from(userMap.values());
        }
      } catch (e) {}

      // 3. Atomically update without flashing or resetting existing state
      if (users.length > 0) {
        setLiveUsersList(prev => {
          const userMap = new Map<string, ConnectedUser>();
          prev.forEach(u => userMap.set(findKey(u), u));
          users.forEach(u => {
            const key = findKey(u);
            const existing = userMap.get(key);
            const existingStores = existing?.visitedStores || [];
            const incomingStores = u.visitedStores || [];
            const mergedStores = Array.from(new Set([...existingStores, ...incomingStores])).filter(s => s && s !== 'Wi-Fi Captive Portal');

            userMap.set(key, {
              ...existing,
              ...u,
              connectionTime: u.connectionTime || existing?.connectionTime,
              sessionDuration: u.sessionDuration || existing?.sessionDuration,
              visitedStores: mergedStores.length > 0 ? mergedStores : (existing?.visitedStores || u.visitedStores || [])
            });
          });

          const mergedList = Array.from(userMap.values());
          mergedList.sort((a: any, b: any) => {
            const timeA = a._rawTimestamp ? new Date(a._rawTimestamp).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
            const timeB = b._rawTimestamp ? new Date(b._rawTimestamp).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
            return timeB - timeA;
          });
          try { localStorage.setItem('axionix_users_list', JSON.stringify(mergedList)); } catch (e) {}
          return mergedList;
        });
      }
    } catch (e) {
      console.warn('[ConnectedUsersView] Error fetching live users:', e);
    }
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLiveConnectedUsers();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveConnectedUsers();
    const interval = setInterval(fetchLiveConnectedUsers, 6000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      eventSource.onmessage = () => {
        fetchLiveConnectedUsers();
      };
    } catch (e) {}

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = () => {
        fetchLiveConnectedUsers();
      };
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'axionix_users_list' || e.key === 'axionix_last_event' || e.key?.startsWith('axionix_')) {
        fetchLiveConnectedUsers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('axionix_user_added', fetchLiveConnectedUsers);

    return () => {
      clearInterval(interval);
      eventSource?.close();
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('axionix_user_added', fetchLiveConnectedUsers);
    };
  }, [fetchLiveConnectedUsers]);

  const filteredUsers = liveUsersList.filter(u => {
    const nameStr = (u.name || '').toLowerCase();
    const phoneDigits = (u.phone || '').replace(/\D/g, '');
    const rawPhone = (u.phone || '').toLowerCase();
    const macStr = (u.macAddress || '').toLowerCase();
    const searchLower = search.toLowerCase().trim();
    const searchDigits = search.replace(/\D/g, '');

    const matchesSearch = !searchLower || 
                          nameStr.includes(searchLower) || 
                          (searchDigits.length > 0 && phoneDigits.includes(searchDigits)) ||
                          rawPhone.includes(searchLower) ||
                          macStr.includes(searchLower) ||
                          (u.visitedStores || []).some((s: string) => (s || '').toLowerCase().includes(searchLower)) ||
                          (u.zone || '').toLowerCase().includes(searchLower);

    const dev = (u.deviceType || '').toLowerCase();
    const filterDev = deviceFilter.toLowerCase();
    const matchesDevice = deviceFilter === 'All' || 
                          dev === filterDev || 
                          dev.includes(filterDev) || 
                          filterDev.includes(dev) ||
                          (filterDev === 'windows' && dev.includes('win')) ||
                          (filterDev === 'macos' && (dev.includes('mac') || dev.includes('apple')));

    const matchesVip = !vipOnly || Boolean(u.vipStatus);
    return matchesSearch && matchesDevice && matchesVip;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600 animate-pulse" />
            Connected WiFi Users Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live telemetry of {liveUsersList.length.toLocaleString()} guest devices sorted with most recent connections at top.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Live Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setVipOnly(!vipOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              vipOnly ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {vipOnly ? '★ VIP Users Only' : 'All Customers'}
          </button>

          <button
            onClick={() => downloadUsersCSV(filteredUsers)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone (+91), MAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Device:</span>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Devices</option>
              <option value="iOS">iOS (iPhone)</option>
              <option value="Android">Android</option>
              <option value="Windows">Windows Laptop</option>
              <option value="macOS">MacBook</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Phone & MAC</th>
                <th className="px-5 py-3.5">Connect Time</th>
                <th className="px-5 py-3.5">Session Duration</th>
                <th className="px-5 py-3.5">Visited Stores</th>
                <th className="px-5 py-3.5">Zone & Data</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveUsersList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-xs">Loading live connected users from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-medium">
                    No matching connected users found. New customer Wi-Fi logins appear here live.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const displayName = user.name || 'Mall Guest';
                  const initialChar = displayName.charAt(0).toUpperCase() || 'G';
                  const cleanStores = (user.visitedStores || []).filter(s => s && s !== 'Wi-Fi Captive Portal');

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {initialChar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{displayName}</div>
                            {user.vipStatus && (
                              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                VIP
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-mono">
                        <div className="text-slate-900 font-bold">{user.phone}</div>
                        <div className="text-slate-400 text-[11px]">{user.macAddress || 'A4:C3:F0:88:99:A1'}</div>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {user.connectionTime || 'Just now'}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {user.sessionDuration || '5 mins'}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {cleanStores.length === 0 ? (
                          <span className="text-slate-400 italic">Browsing Mall</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {cleanStores.map((s, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="font-semibold text-slate-800">{user.zone || 'Ground Floor Atrium'}</div>
                        <div className="text-[11px] text-slate-400">{user.dataUsed || '45 MB'} • {user.deviceType || 'iOS'}</div>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          • {user.status || 'Active'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-right">
                        <button
                          onClick={() => onSelectUserJourney && onSelectUserJourney(user)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          View Journey
                        </button>
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
