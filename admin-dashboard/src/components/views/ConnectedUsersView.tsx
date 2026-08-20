import React, { useState, useEffect } from 'react';
import { Wifi, Search, Filter, Smartphone, Footprints, ShieldCheck, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { ConnectedUser } from '../../types';
import { downloadUsersCSV } from '../../utils/exportUtils';
import { fetchConnectedUsersFromSupabase } from '../../services/supabaseService';
import { BACKEND_URL } from '../../lib/config';

interface ConnectedUsersViewProps {
  onSelectUserJourney: (user: ConnectedUser) => void;
  users?: ConnectedUser[];
}

export const ConnectedUsersView: React.FC<ConnectedUsersViewProps> = ({ onSelectUserJourney, users = MOCK_USERS }) => {
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [liveUsersList, setLiveUsersList] = useState<ConnectedUser[]>(users);

  const fetchLiveConnectedUsers = async () => {
    let mergedUsers: ConnectedUser[] = [];

    // 1. Fetch from Supabase
    try {
      const supaRes = await fetchConnectedUsersFromSupabase();
      if (supaRes.data && supaRes.isLive) {
        mergedUsers.push(...supaRes.data);
      }
    } catch (e) {}

    // 2. LocalStorage Fallback
    try {
      const local = JSON.parse(localStorage.getItem('axionix_users_list') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        mergedUsers.push(...local);
      }
    } catch (e) {}

    // 3. Fetch from Shared Backend Port 5000
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/connected-users`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        mergedUsers.push(...data.users);
      }
    } catch (e) {}

    // 3. Fallback to passed prop or mock data if empty
    if (mergedUsers.length === 0) {
      mergedUsers = [...users];
    } else {
      mergedUsers = [...mergedUsers, ...users];
    }

    // Deduplicate by phone or id, preserving active status and latest visited stores
    const seen = new Set();
    const formatted: ConnectedUser[] = [];

    for (const u of mergedUsers) {
      const anyU = u as any;
      const phoneClean = (u.phone || anyU.phone_number || '').replace(/\D/g, '').slice(-10);
      const nameClean = (u.name || 'Valued Guest').trim();
      const key = phoneClean || nameClean;

      if (!seen.has(key)) {
        seen.add(key);
        formatted.push({
          id: String(u.id || `usr-${Date.now()}`),
          name: nameClean,
          phone: u.phone || anyU.phone_number || '+91 84950 93170',
          macAddress: u.macAddress || 'FE:88:99:A1:B2:C3',
          ipAddress: u.ipAddress || '192.168.10.142',
          connectionTime: u.connectionTime || 'Just now',
          sessionDuration: u.sessionDuration || '1m',
          visitedStores: Array.isArray(u.visitedStores) ? u.visitedStores : [],
          dataUsed: u.dataUsed || '15 MB',
          status: String(u.status).toLowerCase() === 'active' ? 'Active' : 'Disconnected',
          vipStatus: true,
          zone: u.zone || anyU.floor_detected || 'Ground Floor (Lobby & Luxury)',
          deviceType: u.deviceType || 'iOS'
        });
      }
    }

    setLiveUsersList(formatted);
  };

  useEffect(() => {
    fetchLiveConnectedUsers();
    const interval = setInterval(fetchLiveConnectedUsers, 1500);

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
      if (e.key === 'axionix_users_list' || e.key === 'axionix_last_event') {
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
  }, []);

  const currentUsers = liveUsersList.length > 0 ? liveUsersList : users;

  const filteredUsers = currentUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.phone.includes(search) || 
                          u.macAddress.toLowerCase().includes(search.toLowerCase());
    const matchesDevice = deviceFilter === 'All' || u.deviceType === deviceFilter;
    const matchesVip = !vipOnly || u.vipStatus;
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
            Real-time list of {currentUsers.length.toLocaleString()} connected devices across AXIONIX HighSpeed WiFi gateways.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Customer Name, Phone, or MAC address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Device:</span>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Devices</option>
            <option value="iOS">iOS / Apple</option>
            <option value="Android">Android</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No matching connected users found for current search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          {user.vipStatus && (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              VIP
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      <div className="text-slate-800 font-semibold">{user.phone}</div>
                      <div className="text-slate-400">{user.macAddress}</div>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {user.connectionTime}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-900">
                      {user.sessionDuration}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {(() => {
                        const cleanStores = user.visitedStores.filter(s => s !== 'Wi-Fi Captive Portal');
                        if (cleanStores.length === 0) {
                          return <span className="text-slate-400 italic">No stores visited yet</span>;
                        }
                        return (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {cleanStores.map((st, i) => (
                              <span key={i} className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                                {st}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <div className="font-semibold text-slate-800">{user.zone}</div>
                      <div className="text-slate-400">{user.dataUsed} • {user.deviceType}</div>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm'
                      }`}>
                        ● {user.status === 'Active' ? 'Active' : 'Disconnected'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-right">
                      <button
                        onClick={() => onSelectUserJourney(user)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        View Journey
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
