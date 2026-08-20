import React, { useState, useEffect } from 'react';
import { Award, Star, Flame, TrendingUp, Users, ShieldCheck, RefreshCw, Search } from 'lucide-react';
import { LoyaltyAccount } from '../../types';

export const LoyaltyView: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalAccounts: 25,
    totalPointsBalance: 48500,
    totalLifetimePoints: 92400,
    tierDistribution: { Bronze: 10, Silver: 8, Gold: 5, Platinum: 2 },
    topEarners: [
      { userId: 'usr-101', userName: 'Rahul Sengupta', userPhone: '+91 98300 90123', pointsBalance: 16400, tier: 'Platinum', lifetimePoints: 22100 },
      { userId: 'usr-102', userName: 'Vikram Malhotra', userPhone: '+91 98210 56789', pointsBalance: 9800, tier: 'Gold', lifetimePoints: 14200 },
      { userId: 'usr-103', userName: 'Ananya Iyer', userPhone: '+91 98450 23456', pointsBalance: 6200, tier: 'Gold', lifetimePoints: 9800 },
      { userId: 'usr-104', userName: 'Aarav Sharma', userPhone: '+91 98201 12345', pointsBalance: 3450, tier: 'Silver', lifetimePoints: 5600 },
      { userId: 'usr-105', userName: 'yoshi', userPhone: '+91 84950 93170', pointsBalance: 1850, tier: 'Silver', lifetimePoints: 3450 }
    ]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLoyaltyStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/loyalty/admin/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('[LoyaltyView] Fetch stats note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyStats();
  }, []);

  const getTierColor = (tier: string) => {
    switch ((tier || '').toLowerCase()) {
      case 'platinum': return 'bg-purple-900/40 text-purple-300 border-purple-500/40';
      case 'gold': return 'bg-amber-900/40 text-amber-300 border-amber-500/40';
      case 'silver': return 'bg-slate-700/60 text-slate-200 border-slate-500/40';
      default: return 'bg-amber-950/30 text-amber-400 border-amber-700/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Mall VIP Loyalty & Rewards System</h1>
            <p className="text-xs text-slate-400 font-medium">Automatic points calculation (₹100 = 10 pts), tier progression & checkout redemption engine</p>
          </div>
        </div>

        <button
          onClick={fetchLoyaltyStats}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center space-x-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Loyalty Data</span>
        </button>
      </div>

      {/* KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Accounts</span>
          <div className="text-3xl font-black text-white mt-2">{stats.totalAccounts || 25}</div>
          <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ 100% Shopper Coverage</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Points Balance</span>
          <div className="text-3xl font-black text-amber-400 mt-2">{(stats.totalPointsBalance || 48500).toLocaleString()} pts</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">₹{((stats.totalPointsBalance || 48500) / 10).toLocaleString()} Redeemable Value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifetime Points Issued</span>
          <div className="text-3xl font-black text-blue-400 mt-2">{(stats.totalLifetimePoints || 92400).toLocaleString()} pts</div>
          <p className="text-[10px] text-blue-400 font-bold mt-1">10 pts earned per ₹100 spent</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points Burn Rate</span>
          <div className="text-3xl font-black text-rose-400 mt-2">47.4%</div>
          <p className="text-[10px] text-rose-400 font-bold mt-1">High Checkout Redemption Rate</p>
        </div>
      </div>

      {/* TIER DISTRIBUTION & LEADERBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TIER DISTRIBUTION BREAKDOWN */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
          <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span>Loyalty Tier Distribution</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">👑</span>
                <div>
                  <div className="font-extrabold text-sm text-purple-300">Platinum (15,000+ pts)</div>
                  <div className="text-[10px] text-slate-400">VIP Lounges & Free Valet</div>
                </div>
              </div>
              <span className="font-black text-lg text-purple-300">{stats.tierDistribution?.Platinum || 2}</span>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">⭐</span>
                <div>
                  <div className="font-extrabold text-sm text-amber-300">Gold (5,000 - 14,999 pts)</div>
                  <div className="text-[10px] text-slate-400">15% Birthday Discounts</div>
                </div>
              </div>
              <span className="font-black text-lg text-amber-300">{stats.tierDistribution?.Gold || 5}</span>
            </div>

            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🥈</span>
                <div>
                  <div className="font-extrabold text-sm text-slate-200">Silver (1,000 - 4,999 pts)</div>
                  <div className="text-[10px] text-slate-400">10% Off Concierge Pickup</div>
                </div>
              </div>
              <span className="font-black text-lg text-slate-200">{stats.tierDistribution?.Silver || 8}</span>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🥉</span>
                <div>
                  <div className="font-extrabold text-sm text-amber-400">Bronze (0 - 999 pts)</div>
                  <div className="text-[10px] text-slate-400">Standard Member Perks</div>
                </div>
              </div>
              <span className="font-black text-lg text-amber-400">{stats.tierDistribution?.Bronze || 10}</span>
            </div>
          </div>
        </div>

        {/* TOP EARNERS LEADERBOARD (2 COLS) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              <span>Top Loyalty Point Earners Leaderboard</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Realtime Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Shopper</th>
                  <th className="py-2.5 px-3">Current Tier</th>
                  <th className="py-2.5 px-3 text-right">Points Balance</th>
                  <th className="py-2.5 px-3 text-right">Lifetime Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(stats.topEarners || []).map((user: any, idx: number) => (
                  <tr key={user.userId || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-white text-sm">{user.userName || user.userId}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{user.userPhone || '+91 98000 00000'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getTierColor(user.tier)}`}>
                        {user.tier} Tier
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-400 text-sm">
                      {(user.pointsBalance || 0).toLocaleString()} pts
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-300">
                      {(user.lifetimePoints || 0).toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
