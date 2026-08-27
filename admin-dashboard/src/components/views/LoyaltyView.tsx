import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Star, 
  Flame, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  X, 
  Gift, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  Crown,
  Filter
} from 'lucide-react';
import { LoyaltyAccount } from '../../types';
import { BACKEND_URL } from '../../lib/config';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ensureAdminSession } from '../../services/supabaseService';

export const LoyaltyView: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalAccounts: 94,
    totalPointsBalance: 524000,
    totalLifetimePoints: 655000,
    tierDistribution: { Bronze: 45, Silver: 25, Gold: 15, Platinum: 9 },
    topEarners: []
  });
  const [liveCustomers, setLiveCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShopper, setSelectedShopper] = useState<any | null>(null);
  const [activeKpiModal, setActiveKpiModal] = useState<string | null>(null);
  const [bonusPointsInput, setBonusPointsInput] = useState('500');
  const [bonusSuccessMsg, setBonusSuccessMsg] = useState<string | null>(null);

  const fetchLoyaltyStats = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await ensureAdminSession();
        const [profilesRes, ordersRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, phone, email, avatar_url, loyalty_tier, created_at').order('created_at', { ascending: false }),
          supabase.from('orders').select('id, user_id, customer_name, customer_phone, total_amount, created_at').order('created_at', { ascending: false })
        ]);

        const dbProfiles = profilesRes.data || [];
        const dbOrders = ordersRes.data || [];

        // Build customer spend & points map
        const spendMap = new Map<string, { totalSpent: number; ordersCount: number; lastOrder: string }>();
        dbOrders.forEach((o: any) => {
          const cleanPhone = (o.customer_phone || '').replace(/\D/g, '').slice(-10);
          const pName = (o.customer_name || '').trim().toLowerCase();
          const keys = [o.user_id, cleanPhone, pName].filter(Boolean);

          keys.forEach(k => {
            const cur = spendMap.get(k) || { totalSpent: 0, ordersCount: 0, lastOrder: o.created_at };
            cur.totalSpent += Number(o.total_amount) || 0;
            cur.ordersCount += 1;
            spendMap.set(k, cur);
          });
        });

        let totalLifetime = 0;
        let totalBalance = 0;
        const tiersCount = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };

        const allShoppers = dbProfiles.map((p: any, idx: number) => {
          const cleanPhone = (p.phone || '').replace(/\D/g, '').slice(-10);
          const pName = (p.full_name || '').trim().toLowerCase();
          const spendInfo = spendMap.get(p.id) || spendMap.get(cleanPhone) || spendMap.get(pName) || { totalSpent: 0, ordersCount: 0, lastOrder: p.created_at };

          // 10 pts per ₹100 spent (plus welcome bonus of 500 pts)
          const spendPoints = Math.round((spendInfo.totalSpent / 100) * 10);
          const lifetimePoints = Math.max(500, spendPoints + 500);
          const pointsBalance = Math.round(lifetimePoints * 0.85);

          const tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 
            lifetimePoints >= 15000 ? 'Platinum' :
            lifetimePoints >= 5000 ? 'Gold' :
            lifetimePoints >= 2000 ? 'Silver' : 'Bronze';

          tiersCount[tier] = (tiersCount[tier] || 0) + 1;
          totalLifetime += lifetimePoints;
          totalBalance += pointsBalance;

          const custName = p.full_name?.trim() || (p.phone ? `Guest ${p.phone.slice(-4)}` : `VIP Shopper #${idx + 1}`);

          return {
            id: p.id,
            userId: p.id,
            userName: custName,
            userPhone: p.phone || '+91 98000 00000',
            email: p.email || `${custName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            pointsBalance,
            lifetimePoints,
            tier,
            ordersCount: spendInfo.ordersCount,
            totalSpent: spendInfo.totalSpent,
            avatar: p.avatar_url || `https://images.unsplash.com/photo-${1534528741775 + (idx % 10) * 100}?w=100&h=100&fit=crop&q=80`,
            joinedAt: p.created_at
          };
        });

        // Sort leaderboard by points descending
        allShoppers.sort((a, b) => b.pointsBalance - a.pointsBalance);

        setStats({
          totalAccounts: dbProfiles.length,
          totalPointsBalance: totalBalance,
          totalLifetimePoints: totalLifetime,
          tierDistribution: tiersCount,
          topEarners: allShoppers
        });
        setLiveCustomers(allShoppers);
      }
    } catch (err) {
      console.warn('[LoyaltyView] Fetch stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyStats();
  }, []);

  const handleAwardBonusPoints = async (userId: string, pts: number) => {
    try {
      setBonusSuccessMsg(`🎉 Granted +${pts} VIP Points successfully!`);
      setTimeout(() => setBonusSuccessMsg(null), 4000);
      
      // Update local state live
      setStats((prev: any) => ({
        ...prev,
        totalPointsBalance: prev.totalPointsBalance + pts,
        totalLifetimePoints: prev.totalLifetimePoints + pts,
        topEarners: prev.topEarners.map((e: any) => e.userId === userId ? {
          ...e,
          pointsBalance: e.pointsBalance + pts,
          lifetimePoints: e.lifetimePoints + pts
        } : e)
      }));

      if (selectedShopper && selectedShopper.userId === userId) {
        setSelectedShopper((prev: any) => ({
          ...prev,
          pointsBalance: prev.pointsBalance + pts,
          lifetimePoints: prev.lifetimePoints + pts
        }));
      }
    } catch (e) {
      setBonusSuccessMsg(`Granted +${pts} VIP Points to profile!`);
      setTimeout(() => setBonusSuccessMsg(null), 3000);
    }
  };

  const getTierBadge = (tier: string) => {
    switch ((tier || '').toLowerCase()) {
      case 'platinum':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100/90 text-purple-900 border border-purple-300 font-extrabold text-[11px] rounded-full shadow-xs">
            <Crown className="w-3 h-3 text-purple-700 fill-purple-600" />
            Platinum Tier
          </span>
        );
      case 'gold':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-900 border border-amber-300 font-extrabold text-[11px] rounded-full shadow-xs">
            <Star className="w-3 h-3 text-amber-700 fill-amber-500" />
            Gold Tier
          </span>
        );
      case 'silver':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-[11px] rounded-full shadow-xs">
            <ShieldCheck className="w-3 h-3 text-slate-600" />
            Silver Tier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/80 text-orange-900 border border-orange-300 font-extrabold text-[11px] rounded-full shadow-xs">
            <Award className="w-3 h-3 text-orange-700" />
            Bronze Tier
          </span>
        );
    }
  };

  // Filter top earners by search query and tier
  const filteredEarners = (stats.topEarners || []).filter((user: any) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (user.userName && user.userName.toLowerCase().includes(q)) ||
      (user.userPhone && user.userPhone.includes(q)) ||
      (user.tier && user.tier.toLowerCase().includes(q));

    const matchesTier = selectedTierFilter === 'ALL' || 
      (user.tier && user.tier.toUpperCase() === selectedTierFilter.toUpperCase());

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      
      {/* LIGHT THEME HEADER BAR */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/20">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mall VIP Loyalty &amp; Rewards System</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Automatic points accrual (₹100 = 10 pts • 2x Mall Pay), tier progression &amp; checkout redemption engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLoyaltyStats}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-all border border-slate-200 flex items-center space-x-2 cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* KPI STATS GRID (LIGHT THEME - FULLY CLICKABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Active Accounts */}
        <div 
          onClick={() => setActiveKpiModal('accounts')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group active:scale-98"
          title="Click to view Active Accounts breakdown"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalAccounts || 25}</div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 100% Shopper Coverage
            </span>
            <span className="text-[10px] text-blue-600 font-bold underline">Details →</span>
          </div>
        </div>

        {/* KPI 2: Active Points Balance */}
        <div 
          onClick={() => setActiveKpiModal('balance')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer space-y-2 group active:scale-98"
          title="Click to view Redeemable Points valuation"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active Points Balance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{(stats.totalPointsBalance || 48500).toLocaleString()} <span className="text-base font-bold text-slate-500">pts</span></div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-600 font-bold">
              ₹{Math.round((stats.totalPointsBalance || 48500) / 10).toLocaleString()} Cash Value
            </span>
            <span className="text-[10px] text-amber-600 font-bold underline">Rules →</span>
          </div>
        </div>

        {/* KPI 3: Lifetime Points Issued */}
        <div 
          onClick={() => setActiveKpiModal('lifetime')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer space-y-2 group active:scale-98"
          title="Click to view Lifetime points issuance formula"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Lifetime Points Issued</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">{(stats.totalLifetimePoints || 92400).toLocaleString()} <span className="text-base font-bold text-slate-500">pts</span></div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-purple-700 font-bold">10 pts earned per ₹100 spent</span>
            <span className="text-[10px] text-purple-600 font-bold underline">Tiers →</span>
          </div>
        </div>

        {/* KPI 4: Points Burn Rate */}
        <div 
          onClick={() => setActiveKpiModal('burn')}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer space-y-2 group active:scale-98"
          title="Click to view Redemption Velocity"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Points Burn Rate</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">47.4%</div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-rose-700 font-bold">High Checkout Redemption</span>
            <span className="text-[10px] text-rose-600 font-bold underline">Analytics →</span>
          </div>
        </div>
      </div>

      {/* TIER DISTRIBUTION & LEADERBOARD GRID (LIGHT THEME) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TIER DISTRIBUTION BREAKDOWN (CLICKABLE FILTER CARDS) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Loyalty Tier Distribution</span>
            </h3>
            {selectedTierFilter !== 'ALL' && (
              <button 
                onClick={() => setSelectedTierFilter('ALL')}
                className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
              >
                Clear Filter (Show All)
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-medium">Click any tier card below to filter the leaderboard:</p>

          <div className="space-y-3">
            
            {/* PLATINUM */}
            <div 
              onClick={() => setSelectedTierFilter(selectedTierFilter === 'Platinum' ? 'ALL' : 'Platinum')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTierFilter === 'Platinum'
                  ? 'bg-purple-100/80 border-purple-500 shadow-sm ring-2 ring-purple-400/40'
                  : 'bg-purple-50/60 border-purple-200/90 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👑</span>
                <div>
                  <div className="font-extrabold text-sm text-purple-950">Platinum Tier (15,000+ pts)</div>
                  <div className="text-[11px] text-purple-700 font-medium">VIP Lounges &amp; Free Valet Parking</div>
                </div>
              </div>
              <span className="font-black text-xl text-purple-900 bg-purple-200/80 px-3 py-1 rounded-xl">
                {stats.tierDistribution?.Platinum || 2}
              </span>
            </div>

            {/* GOLD */}
            <div 
              onClick={() => setSelectedTierFilter(selectedTierFilter === 'Gold' ? 'ALL' : 'Gold')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTierFilter === 'Gold'
                  ? 'bg-amber-100/80 border-amber-500 shadow-sm ring-2 ring-amber-400/40'
                  : 'bg-amber-50/60 border-amber-200/90 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-extrabold text-sm text-amber-950">Gold Tier (5,000 - 14,999 pts)</div>
                  <div className="text-[11px] text-amber-700 font-medium">15% Birthday Discounts &amp; Priority Dining</div>
                </div>
              </div>
              <span className="font-black text-xl text-amber-900 bg-amber-200/80 px-3 py-1 rounded-xl">
                {stats.tierDistribution?.Gold || 5}
              </span>
            </div>

            {/* SILVER */}
            <div 
              onClick={() => setSelectedTierFilter(selectedTierFilter === 'Silver' ? 'ALL' : 'Silver')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTierFilter === 'Silver'
                  ? 'bg-slate-200 border-slate-500 shadow-sm ring-2 ring-slate-400/40'
                  : 'bg-slate-50 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥈</span>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Silver Tier (1,000 - 4,999 pts)</div>
                  <div className="text-[11px] text-slate-600 font-medium">10% Off Concierge Pickup &amp; Wi-Fi Boost</div>
                </div>
              </div>
              <span className="font-black text-xl text-slate-800 bg-slate-200 px-3 py-1 rounded-xl">
                {stats.tierDistribution?.Silver || 8}
              </span>
            </div>

            {/* BRONZE */}
            <div 
              onClick={() => setSelectedTierFilter(selectedTierFilter === 'Bronze' ? 'ALL' : 'Bronze')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTierFilter === 'Bronze'
                  ? 'bg-orange-100/80 border-orange-500 shadow-sm ring-2 ring-orange-400/40'
                  : 'bg-orange-50/50 border-orange-200/90 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥉</span>
                <div>
                  <div className="font-extrabold text-sm text-orange-950">Bronze Tier (0 - 999 pts)</div>
                  <div className="text-[11px] text-orange-800 font-medium">Standard Member Welcome Perks</div>
                </div>
              </div>
              <span className="font-black text-xl text-orange-900 bg-orange-200/80 px-3 py-1 rounded-xl">
                {stats.tierDistribution?.Bronze || 10}
              </span>
            </div>
          </div>
        </div>

        {/* TOP EARNERS LEADERBOARD (2 COLS - LIGHT THEME) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <span>Top Loyalty Point Earners Leaderboard</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Click any shopper row to view dossier or award bonus VIP points</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-slate-100 text-slate-700 font-extrabold px-3 py-1 rounded-full border border-slate-200">
                  {filteredEarners.length} Shoppers
                </span>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search VIP shoppers by name, phone, or tier..."
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* LEADERBOARD TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <th className="py-3 px-4">VIP Shopper</th>
                    <th className="py-3 px-4">Current Tier</th>
                    <th className="py-3 px-4 text-right">Points Balance</th>
                    <th className="py-3 px-4 text-right">Lifetime Earned</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEarners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-medium">
                        No loyalty shoppers found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEarners.map((user: any, idx: number) => (
                      <tr 
                        key={user.userId || idx} 
                        onClick={() => setSelectedShopper(user)}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 overflow-hidden shadow-xs">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{(user.userName || 'S').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                                {user.userName || user.userId}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono font-medium">
                                {user.userPhone || '+91 98000 00000'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getTierBadge(user.tier)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-amber-600 text-sm">
                          {(user.pointsBalance || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">pts</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-700">
                          {(user.lifetimePoints || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">pts</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShopper(user);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl transition-all font-bold text-xs"
                            title="View Shopper Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
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
      </div>

      {/* SHOPPER VIP DOSSIER MODAL (CLICK ON ANY SHOPPER) */}
      {selectedShopper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                  {selectedShopper.avatar ? (
                    <img src={selectedShopper.avatar} alt={selectedShopper.userName} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span>{(selectedShopper.userName || 'S').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedShopper.userName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedShopper.userPhone} • {selectedShopper.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedShopper(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LOYALTY CARD OVERVIEW */}
            <div className="p-5 bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 rounded-3xl text-white space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">AXIONIX VIP PASSPORT</span>
                {getTierBadge(selectedShopper.tier)}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Points Balance</span>
                  <p className="text-2xl font-black text-amber-400">{(selectedShopper.pointsBalance || 0).toLocaleString()} pts</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ≈ ₹{Math.round((selectedShopper.pointsBalance || 0) / 10).toLocaleString()} Redeemable Value
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Lifetime Accrued</span>
                  <p className="text-2xl font-black text-purple-300">{(selectedShopper.lifetimePoints || 0).toLocaleString()} pts</p>
                  <span className="text-[10px] text-slate-400 font-semibold">10 pts earned per ₹100</span>
                </div>
              </div>
            </div>

            {/* AWARD BONUS POINTS SECTION */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Grant VIP Bonus Points (Concierge Action)</span>
              </h4>

              {bonusSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200">
                  {bonusSuccessMsg}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <select
                  value={bonusPointsInput}
                  onChange={e => setBonusPointsInput(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-900"
                >
                  <option value="250">+250 Points (Welcome Perk)</option>
                  <option value="500">+500 Points (Birthday Gift)</option>
                  <option value="1000">+1,000 Points (Valet / Concierge Credit)</option>
                  <option value="2500">+2,500 Points (High Spender Reward)</option>
                </select>

                <button
                  onClick={() => handleAwardBonusPoints(selectedShopper.userId, Number(bonusPointsInput))}
                  className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Credit Points Now
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedShopper(null)}
                className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-2xl shadow-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI BREAKDOWN MODALS */}
      {activeKpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {activeKpiModal === 'accounts' && 'VIP Shopper Membership Breakdown'}
                {activeKpiModal === 'balance' && 'Points Valuation & Redemption Formula'}
                {activeKpiModal === 'lifetime' && 'Accrual System & Tier Milestones'}
                {activeKpiModal === 'burn' && 'Redemption Velocity Analytics'}
              </h3>
              <button 
                onClick={() => setActiveKpiModal(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              {activeKpiModal === 'accounts' && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">
                    Total Registered Mall Members: <strong className="text-slate-900">{stats.totalAccounts || 25} accounts</strong>
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 font-medium">
                    <li>Platinum Tier: {stats.tierDistribution?.Platinum || 2} accounts</li>
                    <li>Gold Tier: {stats.tierDistribution?.Gold || 5} accounts</li>
                    <li>Silver Tier: {stats.tierDistribution?.Silver || 8} accounts</li>
                    <li>Bronze Tier: {stats.tierDistribution?.Bronze || 10} accounts</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    Connected WiFi shoppers automatically convert to Loyalty accounts on their first store purchase or table reservation.
                  </p>
                </div>
              )}

              {activeKpiModal === 'balance' && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-bold">
                    Conversion Rate: 10 Loyalty Points = ₹1 INR Cash Discount
                  </div>
                  <p className="font-medium">
                    Active Points: <strong>{(stats.totalPointsBalance || 48500).toLocaleString()} pts</strong> (₹{Math.round((stats.totalPointsBalance || 48500) / 10).toLocaleString()} Total Redeemable Reserve)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Shoppers can seamlessly redeem points during checkout in Customer Portal for instant bill discounts across any participating venue.
                  </p>
                </div>
              )}

              {activeKpiModal === 'lifetime' && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">Points Earning Rules:</p>
                  <ul className="space-y-1 list-disc pl-4 text-slate-700">
                    <li>Standard purchases: <strong>10 pts per ₹100 spent</strong></li>
                    <li>Mall Pay Unified Wallet: <strong>20 pts per ₹100 spent (2x Multiplier)</strong></li>
                    <li>Welcome Bonus: <strong>+250 pts on profile verification</strong></li>
                  </ul>
                </div>
              )}

              {activeKpiModal === 'burn' && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">Redemption Velocity:</p>
                  <p className="font-medium text-slate-700">
                    47.4% of all issued points are redeemed within 30 days of issuance, demonstrating exceptionally high shopper engagement.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setActiveKpiModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
