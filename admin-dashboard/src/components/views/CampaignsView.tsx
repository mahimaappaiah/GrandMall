import React, { useState } from 'react';
import { Megaphone, Search, Plus, TrendingUp, Users, QrCode, Ticket, IndianRupee, BarChart2, Download } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../../data/mockData';
import { Campaign } from '../../types';
import { downloadCampaignsCSV } from '../../utils/exportUtils';
import { fetchCampaignsFromSupabase, createCampaignInSupabase } from '../../services/supabaseService';

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Omnichannel Mall Fest');

  React.useEffect(() => {
    let isMounted = true;
    fetchCampaignsFromSupabase().then(res => {
      if (isMounted && res.data && res.data.length > 0) {
        setCampaigns(res.data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesSearch = (camp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (camp.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (camp.storeName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const campaignPayload: Partial<Campaign> = {
      title,
      name: title,
      type,
      campaign_type: type,
      reach: 12000,
      impressions: 34000,
      qrScans: 1500,
      couponsRedeemed: 450,
      revenueGenerated: 850000,
      roi: 310,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-08-31'
    };

    const res = await createCampaignInSupabase(campaignPayload);
    const created = res.data || {
      id: `cmp-${Date.now()}`,
      ...campaignPayload
    } as Campaign;

    setCampaigns([created, ...campaigns]);
    setShowCreateModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Mall Marketing Campaigns & ROI Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track reach, impressions, QR signage scans, and tenant revenue impact across all active mall promotions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCampaignsCSV(campaigns)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Campaigns (CSV)
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Launch New Campaign
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by title or type..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Active', 'Completed', 'Draft'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map(camp => (
          <div
            key={camp.id}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  camp.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  ● {camp.status}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">{camp.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{camp.type} • {camp.startDate} to {camp.endDate}</p>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Return On Ad Spend</div>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{camp.roi}% ROI</div>
              </div>
            </div>

            {/* Campaign Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" /> Reach
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">{camp.reach.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-purple-600" /> QR Scans
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">{camp.qrScans.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-emerald-600" /> Redeemed
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">{camp.couponsRedeemed.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-blue-600" /> Revenue
                </div>
                <div className="text-sm font-extrabold text-blue-700 mt-1">₹{(camp.revenueGenerated / 100000).toFixed(1)}L</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleCreate} className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Launch New Mall Campaign</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Autumn Fashion Festival"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campaign Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Omnichannel Mall Fest">Omnichannel Mall Fest</option>
                <option value="Food Court & Dining Push">Food Court & Dining Push</option>
                <option value="Electronics & Kids">Electronics & Kids</option>
                <option value="Multiplex & Night Dining">Multiplex & Night Dining</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Launch Campaign
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
