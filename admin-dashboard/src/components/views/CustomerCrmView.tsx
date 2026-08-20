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
  ChevronRight,
  UserCheck,
  Calendar,
  Heart
} from 'lucide-react';
import { MOCK_USERS, MOCK_ORDERS } from '../../data/mockData';
import { ConnectedUser } from '../../types';
import { fetchCustomersFromSupabase } from '../../services/supabaseService';

interface CustomerCrmViewProps {
  users?: ConnectedUser[];
}

export const CustomerCrmView: React.FC<CustomerCrmViewProps> = ({ users = MOCK_USERS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [liveUsers, setLiveUsers] = useState<ConnectedUser[]>(users);

  useEffect(() => {
    let isMounted = true;
    fetchCustomersFromSupabase().then(res => {
      if (isMounted && res.data && res.data.length > 0) {
        setLiveUsers(res.data);
      }
    }).catch(err => {
      console.warn('[CustomerCrmView] Supabase customers load error:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const segments = ['All', 'VIP Concierge', 'Frequent Shoppers', 'Dining Enthusiasts', 'First-Time Visitors'];

  const filteredUsers = liveUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.phone.includes(searchQuery) ||
                          user.macAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === 'All' || 
                           (segmentFilter === 'VIP Concierge' && user.vipStatus) ||
                           (segmentFilter === 'Frequent Shoppers' && user.visitedStores.length > 2);
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Customer CRM & Visitor Profiles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time captive session monitoring, customer lifetime value, and segment affinity</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-500">Live Captive Users:</span>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            ● 1,482 Active Sessions
          </span>
        </div>
      </div>

      {/* SEARCH & SEGMENT FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or MAC..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {segments.map(seg => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                segmentFilter === seg ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Phone & MAC</th>
                <th className="p-3.5">Current Zone</th>
                <th className="p-3.5">Device</th>
                <th className="p-3.5">Visited Stores</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center space-x-1">
                          <span>{user.name}</span>
                          {user.vipStatus && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">VIP</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Connected {user.connectionTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    <div>{user.phone}</div>
                    <span className="text-[10px] text-slate-400">{user.macAddress}</span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{user.zone}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      <span>{user.deviceType}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {user.visitedStores.map(store => (
                        <span key={store} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                          {store}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {user.status} ({user.sessionDuration})
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-xs"
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

      {/* USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                    <span>{selectedUser.name}</span>
                    {selectedUser.vipStatus && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">VIP Concierge</span>}
                  </h3>
                  <span className="text-xs text-slate-500">{selectedUser.phone} • {selectedUser.macAddress}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Device IP & Type</span>
                <span className="font-bold text-slate-800">{selectedUser.ipAddress} ({selectedUser.deviceType})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Wi-Fi Data Used</span>
                <span className="font-bold text-slate-800">{selectedUser.dataUsed}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Visited Stores Timeline</h4>
              <div className="space-y-2">
                {selectedUser.visitedStores.map((store: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{store}</span>
                    <span className="text-[10px] text-slate-400">Scanned QR & Checked-in</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
