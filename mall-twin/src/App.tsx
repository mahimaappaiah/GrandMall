import React, { useState } from 'react';
import { MallFloorMap, StoreMapPin } from './MallFloorMap';
import { Layers, MapPin, Activity, Flame, Shield, Search, Sparkles, Building2, Store } from 'lucide-react';

const MOCK_MALL_BRANDS: StoreMapPin[] = [
  // Ground Floor
  { id: '1', name: 'Starbucks Reserve', category: 'Food', floor: 'Ground Floor', zone: 'Central Atrium', revenueToday: 480000, visitorsToday: 950, ordersCount: 420, status: 'Open', rating: 4.8, logo: '☕' },
  { id: '2', name: 'Häagen-Dazs', category: 'Food', floor: 'Ground Floor', zone: 'Central Atrium', revenueToday: 198000, visitorsToday: 820, ordersCount: 340, status: 'Open', rating: 4.7, logo: '🍨' },
  { id: '7', name: 'Nike Flagship', category: 'Fashion', floor: 'Ground Floor', zone: 'North Wing', revenueToday: 2450000, visitorsToday: 1850, ordersCount: 890, status: 'Open', rating: 4.9, logo: '👟' },
  { id: '8', name: 'Zara Flagship', category: 'Fashion', floor: 'Ground Floor', zone: 'West Wing', revenueToday: 1890000, visitorsToday: 1420, ordersCount: 610, status: 'Open', rating: 4.8, logo: '👗' },
  { id: '9', name: 'Gucci Boutique', category: 'Luxury', floor: 'Ground Floor', zone: 'North Wing', revenueToday: 4200000, visitorsToday: 410, ordersCount: 95, status: 'Open', rating: 4.95, logo: '👜' },

  // 1st Floor
  { id: '10', name: 'Prada Atelier', category: 'Luxury', floor: '1st Floor', zone: 'South Terrace', revenueToday: 3850000, visitorsToday: 380, ordersCount: 78, status: 'Open', rating: 4.9, logo: '🕶️' },
  { id: '11', name: 'H&M Everyday Fashion', category: 'Fashion', floor: '1st Floor', zone: 'West Wing', revenueToday: 1250000, visitorsToday: 1100, ordersCount: 520, status: 'Open', rating: 4.6, logo: '👕' },
  { id: '12', name: 'U.S. Polo Assn.', category: 'Fashion', floor: '1st Floor', zone: 'North Gallery', revenueToday: 980000, visitorsToday: 890, ordersCount: 380, status: 'Open', rating: 4.7, logo: '🏇' },
  { id: '13', name: 'Rolex Boutique', category: 'Luxury', floor: '1st Floor', zone: 'Fashion Atrium', revenueToday: 8900000, visitorsToday: 290, ordersCount: 42, status: 'Open', rating: 4.98, logo: '⌚' },

  // 2nd Floor
  { id: '3', name: 'Din Tai Fung', category: 'Food', floor: '2nd Floor', zone: 'Dining Hub', revenueToday: 1280000, visitorsToday: 680, ordersCount: 290, status: 'Open', rating: 4.9, logo: '🥟' },
  { id: '4', name: 'PizzaExpress Gourmet', category: 'Food', floor: '2nd Floor', zone: 'Food Court North', revenueToday: 620000, visitorsToday: 610, ordersCount: 220, status: 'Open', rating: 4.7, logo: '🍕' },
  { id: '5', name: 'Coffee Day', category: 'Food', floor: '2nd Floor', zone: 'Dining Hub', revenueToday: 390000, visitorsToday: 540, ordersCount: 195, status: 'Open', rating: 4.8, logo: '☕' },
  { id: '6', name: 'Subway Fresh Gourmet', category: 'Food', floor: '2nd Floor', zone: 'Food Court North', revenueToday: 310000, visitorsToday: 490, ordersCount: 180, status: 'Open', rating: 4.6, logo: '🥪' },

  // 3rd Floor
  { id: '14', name: 'Louis Vuitton Maison', category: 'Luxury', floor: '3rd Floor', zone: 'East Wing', revenueToday: 6500000, visitorsToday: 520, ordersCount: 110, status: 'Open', rating: 4.95, logo: '👜' },
  { id: '15', name: 'Tiffany & Co.', category: 'Luxury', floor: '3rd Floor', zone: 'Entertainment Atrium', revenueToday: 5100000, visitorsToday: 340, ordersCount: 65, status: 'Open', rating: 4.9, logo: '💎' },
  { id: '16', name: 'Cartier High Jewelry', category: 'Luxury', floor: '3rd Floor', zone: 'Multiplex Arena', revenueToday: 7400000, visitorsToday: 260, ordersCount: 38, status: 'Open', rating: 4.96, logo: '👑' },
  { id: '17', name: 'Apple Experience Store', category: 'Accessories', floor: '3rd Floor', zone: 'East Wing', revenueToday: 9800000, visitorsToday: 2100, ordersCount: 840, status: 'Open', rating: 4.9, logo: '🍎' },
  { id: '18', name: 'Ray-Ban Sunglass Hut', category: 'Accessories', floor: '3rd Floor', zone: 'West Arcade', revenueToday: 750000, visitorsToday: 630, ordersCount: 210, status: 'Open', rating: 4.7, logo: '🕶️' }
];

export default function App() {
  const [currentFloor, setCurrentFloor] = useState<string>('Ground Floor');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedStore = MOCK_MALL_BRANDS.find(b => b.id === selectedStoreId);

  const filteredBrands = MOCK_MALL_BRANDS.filter(b => {
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
              brands={MOCK_MALL_BRANDS}
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
              {filteredBrands.map(b => (
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
