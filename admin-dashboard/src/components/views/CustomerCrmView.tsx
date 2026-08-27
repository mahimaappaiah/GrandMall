import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Calendar, 
  Heart,
  RefreshCw,
  Loader2,
  X,
  Wifi,
  Footprints,
  CheckCircle2
} from 'lucide-react';
import { ConnectedUser } from '../../types';
import { fetchConnectedUsersFromSupabase } from '../../services/supabaseService';

interface CustomerCrmViewProps {
  users?: ConnectedUser[];
}

export const CustomerCrmView: React.FC<CustomerCrmViewProps> = ({ users = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [liveUsers, setLiveUsers] = useState<ConnectedUser[]>(users);
  const [isLoading, setIsLoading] = useState(false);

  const loadLiveCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchConnectedUsersFromSupabase();
      if (res.data && res.data.length > 0) {
        setLiveUsers(res.data);
      }
    } catch (err) {
      console.warn('[CustomerCrmView] Supabase customers load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveCustomers();
  }, []);

  useEffect(() => {
    if (users && users.length > 0) {
      setLiveUsers(users);
    }
  }, [users]);

  const segments = ['All', 'VIP Concierge', 'Frequent Shoppers', 'Dining Enthusiasts', 'First-Time Visitors'];

  const filteredUsers = liveUsers.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (user.phone || '').includes(searchQuery) ||
                          (user.macAddress || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === 'All' || 
                           (segmentFilter === 'VIP Concierge' && user.vipStatus) ||
                           (segmentFilter === 'Frequent Shoppers' && (user.visitedStores || []).length > 2);
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Customer CRM & Visitor Profiles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time captive session monitoring, customer lifetime value, and segment affinity</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadLiveCustomers}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Live Customer List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="text-xs font-bold text-slate-500">Live Captive Profiles:</span>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
            ● {liveUsers.length} Active Records
          </span>
        </div>
      </div>

      {/* SEARCH & SEGMENT FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, phone, or MAC..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {segments.map(seg => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                segmentFilter === seg ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone & MAC</th>
                <th className="p-4">Current Zone</th>
                <th className="p-4">Device</th>
                <th className="p-4">Visited Stores</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                        {(user.name || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          {user.vipStatus && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Connected {user.connectionTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    <div className="font-bold text-slate-800">{user.phone}</div>
                    <span className="text-[10px] text-slate-400">{user.macAddress}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{user.zone}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    <span className="flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.deviceType}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(user.visitedStores || []).slice(0, 3).map(store => (
                        <span key={store} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {store}
                        </span>
                      ))}
                      {(user.visitedStores || []).length > 3 && (
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">
                          +{(user.visitedStores || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap">
                      ● {user.status} ({user.sessionDuration})
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER PROFILE MODAL - PROPERLY CONSTRAINED & BEAUTIFULLY ALIGNED */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                  {(selectedUser.name || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-white text-base">
                      {selectedUser.name}
                    </h3>
                    {selectedUser.vipStatus && (
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        VIP Concierge
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{selectedUser.phone} • {selectedUser.macAddress}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              
              {/* Connection & Network Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" /> Duration
                  </span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">{selectedUser.sessionDuration}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-blue-600" /> Data Consumed
                  </span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">{selectedUser.dataUsed}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" /> Active Zone
                  </span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block truncate">{selectedUser.zone}</span>
                </div>
              </div>

              {/* Device Metadata */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Device IP & Handset</span>
                    <span className="font-bold text-slate-800">{selectedUser.ipAddress} ({selectedUser.deviceType})</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                  Authenticated Session
                </span>
              </div>

              {/* Visited Stores Timeline */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-blue-600" /> Visited Stores Trajectory
                  </span>
                  <span className="text-[11px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {(selectedUser.visitedStores || []).length} Venues Visited
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {(selectedUser.visitedStores || []).length > 0 ? (
                    selectedUser.visitedStores.map((store: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{store}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Checked-in
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-3">No store check-ins recorded yet</div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
