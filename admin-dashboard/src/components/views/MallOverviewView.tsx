import React, { useState } from 'react';
import { MapPin, Users, Flame, Building2, CheckCircle2, Navigation, Wifi, AlertTriangle, ChevronDown, ChevronUp, X, TrendingUp, ThermometerSun, Radio } from 'lucide-react';
import { MOCK_STORES } from '../../data/mockData';
import { Store, MallFloor, MallZone } from '../../types';
import { fetchFloorsAndZonesFromSupabase, fetchStoresFromSupabase } from '../../services/supabaseService';
import { BrandLogo } from '../BrandLogo';
import { MallFloorMap } from './MallFloorMap';

interface MallOverviewViewProps {
  onSelectStore: (store: Store) => void;
  stores?: Store[];
}

type ActivePanel = 'floor' | 'footfall' | 'heat' | 'access' | null;

const FLOOR_INFO: Record<string, { stores: number; zones: string[]; category: string; icon: string }> = {
  'Ground Floor': { stores: 4, zones: ['Luxury Fashion Zone', 'Main Entrance'], category: 'Fashion & Luxury', icon: '🏪' },
  'First Floor':  { stores: 4, zones: ['Fashion Zone', 'Lifestyle Zone'], category: 'Fashion & Lifestyle', icon: '👔' },
  'Second Floor': { stores: 4, zones: ['Food & Dining Zone', 'Entertainment Zone'], category: 'Dining & Entertainment', icon: '🍜' },
  'Third Floor':  { stores: 4, zones: ['Luxury Dining Zone', 'Premium Retail Zone'], category: 'Luxury Retail & Dining', icon: '✨' },
  'Fourth Floor': { stores: 3, zones: ['Technology Zone', 'Services Zone'], category: 'Technology & Services', icon: '💻' },
  'Fifth Floor':  { stores: 1, zones: ['VIP Lounge', 'Events Zone'], category: 'VIP Lounge & Events', icon: '👑' },
  '1st Floor':    { stores: 6, zones: ['East Wing', 'West Wing', 'Central Atrium'], category: 'Electronics & Tech', icon: '💻' },
  '2nd Floor':    { stores: 5, zones: ['North Wing', 'South Wing'], category: 'Lifestyle & Sports', icon: '🏋️' },
  '3rd Floor':    { stores: 4, zones: ['East Wing', 'West Wing'], category: 'Kids & Toys', icon: '🧸' },
  'Food Court':   { stores: 12, zones: ['Central Food Hub', 'East Dining'], category: 'Food & Beverages', icon: '🍜' },
  'Multiplex':    { stores: 3, zones: ['Screen Zone A', 'Screen Zone B'], category: 'Entertainment', icon: '🎬' },
};

const ZONE_HEAT: { zone: string; density: number; level: string; color: string }[] = [
  { zone: 'Luxury Fashion Zone', density: 82, level: 'High', color: 'text-red-600 bg-red-50 border-red-200' },
  { zone: 'Food & Dining Zone',  density: 74, level: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { zone: 'Fashion Zone',        density: 61, level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { zone: 'Technology Zone',     density: 53, level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { zone: 'Main Entrance',       density: 48, level: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { zone: 'VIP Lounge',          density: 27, level: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

const ACCESS_POINTS: { id: string; location: string; users: number; signal: string; status: 'Online' | 'Degraded' | 'Offline'; floor: string }[] = [
  { id: 'AP-G01', location: 'Ground Floor — Luxury Fashion Zone', users: 142, signal: '5 GHz / -48 dBm', status: 'Online', floor: 'Ground Floor' },
  { id: 'AP-G02', location: 'Ground Floor — Main Entrance',       users: 87,  signal: '5 GHz / -52 dBm', status: 'Online', floor: 'Ground Floor' },
  { id: 'AP-1F1', location: 'First Floor — Fashion Zone',         users: 63,  signal: '2.4 GHz / -61 dBm', status: 'Online', floor: 'First Floor' },
  { id: 'AP-2F1', location: 'Second Floor — Food & Dining Hub',   users: 118, signal: '5 GHz / -49 dBm', status: 'Online', floor: 'Second Floor' },
  { id: 'AP-3F1', location: 'Third Floor — Luxury Dining Zone',   users: 54,  signal: '5 GHz / -55 dBm', status: 'Online', floor: 'Third Floor' },
  { id: 'AP-4F1', location: 'Fourth Floor — Technology Zone',     users: 76,  signal: '2.4 GHz / -63 dBm', status: 'Degraded', floor: 'Fourth Floor' },
  { id: 'AP-5F1', location: 'Fifth Floor — VIP Lounge',           users: 29,  signal: '5 GHz / -57 dBm', status: 'Online', floor: 'Fifth Floor' },
];

export const MallOverviewView: React.FC<MallOverviewViewProps> = ({ onSelectStore, stores = MOCK_STORES }) => {
  const [mallFloors, setMallFloors] = useState<MallFloor[]>([]);
  const [mallZones, setMallZones] = useState<MallZone[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [liveStores, setLiveStores] = useState<Store[]>(stores);

  React.useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchStoresFromSupabase(),
      fetchFloorsAndZonesFromSupabase()
    ]).then(([storesRes, floorsZonesRes]) => {
      if (isMounted) {
        if (storesRes.data && storesRes.data.length > 0) {
          setLiveStores(storesRes.data);
        }
        if (floorsZonesRes.floors && floorsZonesRes.floors.length > 0) {
          setMallFloors(floorsZonesRes.floors);
        }
        if (floorsZonesRes.zones && floorsZonesRes.zones.length > 0) {
          setMallZones(floorsZonesRes.zones);
        }
      }
    }).catch(err => {
      console.warn('[MallOverviewView] Load error:', err);
    });

    return () => { isMounted = false; };
  }, []);

  const fallbackFloors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Fifth Floor'];
  const floors = mallFloors.length > 0
    ? mallFloors.map(f => f.floor_name)
    : fallbackFloors;

  const activeFloorObj = mallFloors.find(f => f.floor_name === selectedFloor);
  const activeFloorZones = activeFloorObj
    ? mallZones.filter(z => z.floor_id === activeFloorObj.id)
    : mallZones.filter(z => (FLOOR_INFO[selectedFloor]?.zones || []).includes(z.zone_name));

  const availableZoneNames = activeFloorZones.length > 0
    ? activeFloorZones.map(z => z.zone_name)
    : (FLOOR_INFO[selectedFloor]?.zones || ['Luxury Fashion Zone', 'Main Entrance']);

  const floorStores = liveStores.filter(s => {
    const matchesFloor = s.floor === selectedFloor;
    const matchesZone = selectedZone === 'All' || s.zone === selectedZone;
    return matchesFloor && matchesZone;
  });

  const totalVisitorsFloor = floorStores.reduce((acc, s) => acc + (s.visitorsToday || 0), 0);

  const togglePanel = (panel: ActivePanel) => setActivePanel(prev => prev === panel ? null : panel);

  const floorCategory = activeFloorObj?.description || FLOOR_INFO[selectedFloor]?.category || 'Retail & Lifestyle';

  const dynamicZoneHeat = mallZones.length > 0
    ? mallZones.map((z, idx) => {
        const matchingStatic = ZONE_HEAT.find(zh => zh.zone.toLowerCase() === z.zone_name.toLowerCase());
        if (matchingStatic) return matchingStatic;

        const isHigh = z.zone_type === 'Dining' || z.zone_type === 'Entrance' || idx % 3 === 0;
        const isMed = z.zone_type === 'Retail' || z.zone_type === 'Electronics' || idx % 3 === 1;
        const density = isHigh ? 82 - (idx * 4) : isMed ? 62 - (idx * 3) : 38 + (idx * 2);
        const level = density >= 70 ? 'High' : density >= 50 ? 'Medium' : 'Low';
        const color = density >= 70
          ? 'text-red-600 bg-red-50 border-red-200'
          : density >= 50
          ? 'text-amber-600 bg-amber-50 border-amber-200'
          : 'text-emerald-600 bg-emerald-50 border-emerald-200';

        return {
          zone: z.zone_name,
          density,
          level,
          color
        };
      })
    : ZONE_HEAT;

  const topZone = dynamicZoneHeat[0] || ZONE_HEAT[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Interactive Mall Floorplan &amp; Heatmap
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time zone density and tenant occupancy layout map for Phoenix Mall Bengaluru.
          </p>
        </div>

        {/* Floor selector pill tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => { setSelectedFloor(floor); setSelectedZone('All'); setActivePanel('floor'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedFloor === floor
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — all clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Selected Floor */}
        <button
          onClick={() => togglePanel('floor')}
          className={`bg-white p-4 rounded-2xl border text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activePanel === 'floor' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Selected Floor</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{selectedFloor}</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">{floorStores.length} Active Stores</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            {activePanel === 'floor' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
          </div>
        </button>

        {/* 2. Current Floor Footfall */}
        <button
          onClick={() => togglePanel('footfall')}
          className={`bg-white p-4 rounded-2xl border text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activePanel === 'footfall' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Current Floor Footfall</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{totalVisitorsFloor.toLocaleString()} Visitors</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">+14% vs avg hourly</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            {activePanel === 'footfall' ? <ChevronUp className="w-3 h-3 text-emerald-400" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
          </div>
        </button>

        {/* 3. Heat Density */}
        <button
          onClick={() => togglePanel('heat')}
          className={`bg-white p-4 rounded-2xl border text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activePanel === 'heat' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Heat Density</div>
            <div className="text-lg font-extrabold text-amber-600 mt-0.5">{topZone.level} Density ({topZone.density}%)</div>
            <div className="text-xs text-slate-500 font-medium mt-1 truncate">{topZone.zone}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            {activePanel === 'heat' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
          </div>
        </button>

        {/* 4. Access Points */}
        <button
          onClick={() => togglePanel('access')}
          className={`bg-white p-4 rounded-2xl border text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activePanel === 'access' ? 'border-purple-400 ring-2 ring-purple-100' : 'border-slate-200/80 hover:border-purple-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Access Points</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">8 WiFi APs</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">7 Online · 1 Degraded</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            {activePanel === 'access' ? <ChevronUp className="w-3 h-3 text-purple-400" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
          </div>
        </button>
      </div>

      {/* ── Drill-Down Panels ── */}

      {/* Floor Detail Panel */}
      {activePanel === 'floor' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {selectedFloor} — Floor Details
            </h3>
            <button onClick={() => setActivePanel(null)} className="text-blue-400 hover:text-blue-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Stores</div>
              <div className="text-xl font-extrabold text-blue-600">{floorStores.length}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Category Focus</div>
              <div className="text-sm font-extrabold text-slate-900 truncate">{floorCategory}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Zones</div>
              <div className="text-xl font-extrabold text-slate-900">{availableZoneNames.length}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Floor Visitors</div>
              <div className="text-xl font-extrabold text-emerald-600">{totalVisitorsFloor.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableZoneNames.map(z => (
              <span key={z} className="px-3 py-1 bg-white border border-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                📍 {z}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footfall Detail Panel */}
      {activePanel === 'footfall' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2">
              <Users className="w-4 h-4" /> {selectedFloor} — Footfall Breakdown
            </h3>
            <button onClick={() => setActivePanel(null)} className="text-emerald-400 hover:text-emerald-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total This Floor</div>
              <div className="text-xl font-extrabold text-emerald-600">{totalVisitorsFloor.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Peak Hour</div>
              <div className="text-sm font-extrabold text-slate-900">5 PM – 7 PM</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Dwell Time</div>
              <div className="text-xl font-extrabold text-slate-900">54 min</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">vs Yesterday</div>
              <div className="text-xl font-extrabold text-emerald-600">+14%</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-emerald-800 uppercase mb-2">Top Stores by Visitors</div>
            {floorStores.sort((a, b) => b.visitorsToday - a.visitorsToday).slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-emerald-100">
                <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-emerald-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (s.visitorsToday / totalVisitorsFloor) * 300)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 w-16 text-right">{s.visitorsToday.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heat Density Detail Panel */}
      {activePanel === 'heat' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Zone Heat Density Map (Live)
            </h3>
            <button onClick={() => setActivePanel(null)} className="text-amber-400 hover:text-amber-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {dynamicZoneHeat.map(z => (
              <div key={z.zone} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${z.color}`}>{z.level}</span>
                  <span className="text-sm font-semibold text-slate-800">{z.zone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${z.density >= 70 ? 'bg-red-500' : z.density >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${z.density}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 w-12 text-right">{z.density}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-700 mt-3 flex items-center gap-1">
            <ThermometerSun className="w-3 h-3" /> Density above 70% may require crowd management. Updated every 30 seconds.
          </p>
        </div>
      )}

      {/* Access Points Detail Panel */}
      {activePanel === 'access' && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              <Wifi className="w-4 h-4" /> WiFi Access Points — Live Status
            </h3>
            <button onClick={() => setActivePanel(null)} className="text-purple-400 hover:text-purple-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total APs</div>
              <div className="text-xl font-extrabold text-purple-600">8</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Online</div>
              <div className="text-xl font-extrabold text-emerald-600">7</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-100 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Degraded</div>
              <div className="text-xl font-extrabold text-amber-600">1</div>
            </div>
          </div>
          <div className="space-y-2">
            {ACCESS_POINTS.map(ap => (
              <div key={ap.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${ap.status === 'Online' ? 'bg-emerald-500' : ap.status === 'Degraded' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{ap.id} — {ap.location}</div>
                    <div className="text-[10px] text-slate-400">{ap.signal} · {ap.floor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-purple-700">{ap.users} users</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    ap.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    ap.status === 'Degraded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>{ap.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 2D Spatial Floor Map (Mall Twin) */}
      <MallFloorMap
        currentFloor={selectedFloor}
        brands={liveStores}
        onSelectStore={(id) => {
          const matched = liveStores.find(s => s.id === id);
          if (matched) onSelectStore(matched);
        }}
        onSelectZone={(zName) => {
          setSelectedZone(prev => prev === zName ? 'All' : zName);
        }}
      />

      {/* Zone Filter & Stores Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Stores &amp; Tenants on {selectedFloor}</h2>
            <p className="text-xs text-slate-500">Click any store card to open detailed performance drawer</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Zones</option>
              {availableZoneNames.map(zName => (
                <option key={zName} value={zName}>{zName}</option>
              ))}
            </select>
          </div>
        </div>

        {floorStores.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No store listings for this specific zone selection.</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting "All Zones" or switching floors above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {floorStores.map(store => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BrandLogo logoVariant={store.logoVariant} logoImg={store.logo || (store as any).logoImg} storeName={store.name} className="w-12 h-12 rounded-2xl" />
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{store.name}</h3>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {store.zone}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    store.status === 'Peak' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {store.status}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Visitors</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">{store.visitorsToday.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Orders</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">{store.ordersCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Revenue</div>
                    <div className="text-xs font-extrabold text-blue-600 mt-0.5">₹{(store.revenueToday / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
