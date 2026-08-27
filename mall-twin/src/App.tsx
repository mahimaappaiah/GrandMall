import React, { useState, useEffect } from 'react';
import { MallFloorMap, StoreMapPin } from './MallFloorMap';
import { Layers, MapPin, Activity, Flame, Shield, Search, Sparkles, Building2, Store } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

/** Category → default emoji when no logo_variant / logo_url is provided by Supabase. */
function defaultLogoForCategory(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat === 'food' || cat === 'food & beverage' || cat === 'f&b') return '🍽️';
  if (cat === 'luxury') return '👑';
  if (cat === 'fashion') return '👗';
  if (cat === 'accessories') return '💎';
  if (cat === 'electronics' || cat === 'tech') return '📱';
  if (cat === 'beauty' || cat === 'wellness') return '💄';
  if (cat === 'sports' || cat === 'fitness') return '🏋️';
  if (cat === 'entertainment') return '🎭';
  return '🏬';
}

/** Map a raw Supabase brands row → StoreMapPin used by the Mall Twin. */
function mapSupabaseBrand(b: any, idx: number): StoreMapPin {
  return {
    id: String(b.id || `brand-${idx + 1}`),
    name: b.name || 'Store Tenant',
    category: b.category || 'Retail',
    floor: b.floor || 'Ground Floor',
    zone: b.zone || 'Central Atrium',
    revenueToday: Number(b.revenue_today) || 0,
    visitorsToday: Number(b.visitors_today) || 0,
    ordersCount: Number(b.orders_count) || 0,
    status: b.status || 'Open',
    rating: typeof b.rating === 'number' ? b.rating : (parseFloat(b.rating) || 4.5),
    // Use logo_variant (emoji) from Supabase first, then fall back to category default
    logo: b.logo_variant || defaultLogoForCategory(b.category),
  };
}

export default function App() {
  // Start empty — the Mall Twin shows ONLY live Supabase data when configured.
  // If Supabase is not configured at all the list stays empty (no stale mocks).
  const [brands, setBrands] = useState<StoreMapPin[]>([]);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [currentFloor, setCurrentFloor] = useState<string>('Ground Floor');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLiveBrands = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [brandsRes, visitsRes, ordersRes] = await Promise.all([
        supabase
          .from('brands')
          .select('id, name, category, floor, zone, logo_url, logo_variant, rating, status, revenue_today, visitors_today, orders_count')
          .order('name', { ascending: true }),
        supabase
          .from('store_visits')
          .select('brand_id, customer_name, brands(name)'),
        supabase
          .from('orders')
          .select('id, total_amount, subtotal, order_items(*, products(*, brands(*)))')
      ]);

      if (brandsRes.error) {
        console.warn('[MallTwin] Supabase fetch error:', brandsRes.error.message);
        return;
      }

      const visitsData = visitsRes.data || [];
      const ordersData = ordersRes.data || [];

      const liveBrands: StoreMapPin[] = (brandsRes.data || []).map((b: any, idx: number) => {
        const bId = String(b.id || '');
        const bName = (b.name || '').toLowerCase().trim();

        let liveRevenue = 0;
        const storeOrderIds = new Set<string>();

        ordersData.forEach((ord: any) => {
          (ord.order_items || []).forEach((oi: any) => {
            const itemBrandId = String(oi.products?.brand_id || oi.products?.brands?.id || '');
            const itemBrandName = (oi.products?.brands?.name || '').toLowerCase().trim();

            if (itemBrandId === bId || (itemBrandName && itemBrandName === bName)) {
              storeOrderIds.add(ord.id);
              const itemAmt = Number(oi.subtotal) || (Number(oi.unit_price || 0) * Number(oi.quantity || 1));
              liveRevenue += itemAmt;
            }
          });
        });

        const brandVisits = visitsData.filter((v: any) => String(v.brand_id) === bId);

        return {
          id: String(b.id || `brand-${idx + 1}`),
          name: b.name || 'Store Tenant',
          category: b.category || 'Retail',
          floor: b.floor || 'Ground Floor',
          zone: b.zone || 'Central Atrium',
          revenueToday: (Number(b.revenue_today) || 0) + liveRevenue,
          visitorsToday: (Number(b.visitors_today) || 0) + brandVisits.length,
          ordersCount: (Number(b.orders_count) || 0) + storeOrderIds.size,
          status: b.status || 'Open',
          rating: typeof b.rating === 'number' ? b.rating : (parseFloat(b.rating) || 4.5),
          logo: b.logo_variant || defaultLogoForCategory(b.category),
        };
      });

      setBrands(liveBrands);
    } catch (e) {
      console.warn('[MallTwin] Supabase fetch exception:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBrands();
    const interval = setInterval(fetchLiveBrands, 2000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = () => {
        fetchLiveBrands();
      };
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('axionix_')) {
        fetchLiveBrands();
      }
    };
    window.addEventListener('storage', handleStorage);

    let sse: EventSource | null = null;
    try {
      sse = new EventSource('https://axionix-backend-sage.vercel.app/api/realtime/stream');
      sse.onmessage = () => {
        fetchLiveBrands();
      };
    } catch (e) {}

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('mall-twin-live-telemetry-react')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchLiveBrands(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => { fetchLiveBrands(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_visits' }, () => { fetchLiveBrands(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => { fetchLiveBrands(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { fetchLiveBrands(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => { fetchLiveBrands(); })
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      bc?.close();
      window.removeEventListener('storage', handleStorage);
      sse?.close();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const selectedStore = brands.find(b => b.id === selectedStoreId);

  const filteredBrands = brands.filter(b => {
    if (searchQuery) {
      return b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return b.floor === currentFloor;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-black text-lg">
            3D
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              THE GRAND MALL <span className="text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-md border border-blue-500/30">SPATIAL DIGITAL TWIN</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Real-Time Spatial Footfall &amp; IoT Telemetry Network</p>
          </div>
        </div>

        {/* SEARCH & LIVE STATS */}
        <div className="flex items-center space-x-4">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search store or category..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>IoT Live Telemetry Active</span>
          </div>
        </div>
      </header>

      {/* MAIN SPATIAL WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT / TOP 3D SPATIAL CANVAS */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* FLOOR SELECTOR BUTTONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center space-x-2">
              {['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'].map(floor => (
                <button
                  key={floor}
                  onClick={() => { setCurrentFloor(floor); setSelectedZone(null); }}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    currentFloor === floor
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>

            {selectedZone && (
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-lg">
                Selected Zone: {selectedZone}
              </span>
            )}
          </div>

          {/* SVG SPATIAL MAP COMPONENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
            <MallFloorMap
              currentFloor={currentFloor}
              brands={brands}
              onSelectStore={(id) => setSelectedStoreId(id)}
              onSelectZone={(z) => setSelectedZone(z)}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR - STORE ROSTER & DETAILS */}
        <div className="space-y-4">
          
          {/* SELECTED STORE INFOCARD */}
          {selectedStore ? (
            <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{selectedStore.logo || '🏬'}</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {selectedStore.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{selectedStore.name}</h3>
                <p className="text-xs text-blue-400 font-semibold">{selectedStore.floor} • {selectedStore.zone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Revenue Today</span>
                  <span className="text-emerald-400 font-black">₹{selectedStore.revenueToday.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Visitors Today</span>
                  <span className="text-blue-400 font-black">{selectedStore.visitorsToday.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStoreId(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Close Store Card
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 text-center text-slate-500 space-y-2">
              <Store className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium">Click on any store pin or zone on the map to inspect live spatial metrics.</p>
            </div>
          )}

          {/* FLOOR BRAND LIST */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Stores on {currentFloor}</span>
              <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{filteredBrands.length} Stores</span>
            </h4>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <span className="animate-pulse">⟳ Loading live store data…</span>
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-xs">
                  No stores on {currentFloor}
                </div>
              ) : filteredBrands.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedStoreId(b.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStoreId === b.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{b.logo || '🏬'}</span>
                    <div>
                      <h5 className="text-xs font-extrabold text-white">{b.name}</h5>
                      <span className="text-[10px] text-slate-400">{b.zone}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">
                    ₹{(b.revenueToday / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        AXIONIX Mall Operations • 3D Spatial Twin &amp; IoT Telemetry Console
      </footer>

    </div>
  );
}
