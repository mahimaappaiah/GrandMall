import React, { useState } from 'react';
import { Settings as SettingsIcon, Building2, Wifi, ShieldCheck, Key, Save, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  selectedMall: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ selectedMall }) => {
  const [mallName, setMallName] = useState(selectedMall);
  const [wifiSsid, setWifiSsid] = useState('AXIONIX_HighSpeed_Guest_WiFi');
  const [gatewayIp, setGatewayIp] = useState('10.0.0.1');
  const [maxBandwidth, setMaxBandwidth] = useState('1000 Mbps');
  const [sessionTimeLimit, setSessionTimeLimit] = useState('120 mins');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            AXIONIX Mall & WiFi Gateway Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage captive portal parameters, administrator security credentials, and network QoS rules.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings and gateway configuration updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Mall Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" /> Mall Facility Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mall Property Name</label>
              <input
                type="text"
                value={mallName}
                onChange={(e) => setMallName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Operations Contact Email</label>
              <input
                type="email"
                defaultValue="ops@phoenixmall.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>
        </div>

        {/* WiFi Gateway Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Wifi className="w-4 h-4 text-blue-600" /> Captive Portal & Gateway QoS Rules
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Public Broadcast SSID</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Gateway IP</label>
              <input
                type="text"
                value={gatewayIp}
                onChange={(e) => setGatewayIp(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session Limit per Device</label>
              <input
                type="text"
                value={sessionTimeLimit}
                onChange={(e) => setSessionTimeLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Bandwidth Allocation</label>
              <input
                type="text"
                value={maxBandwidth}
                onChange={(e) => setMaxBandwidth(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Administration Settings
          </button>
        </div>

      </form>

    </div>
  );
};
