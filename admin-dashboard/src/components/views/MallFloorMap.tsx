import React, { useState } from 'react';
import { Layers, MapPin, ZoomIn, ZoomOut, RotateCcw, Flame, Eye } from 'lucide-react';

export interface StoreMapPin {
  id: string;
  name: string;
  category: string;
  floor: string;
  zone: string;
  revenueToday: number;
  visitorsToday: number;
  ordersCount: number;
  status: string;
  rating?: number;
  logo?: string;
  logoVariant?: string;
  x?: number;
  y?: number;
}

interface MallFloorMapProps {
  currentFloor: string;
  brands: StoreMapPin[];
  onSelectStore?: (storeId: string) => void;
  onSelectZone?: (zoneName: string) => void;
}

interface ZonePolygon {
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  baseColor: string;
}

export const normalizeFloorName = (f?: string): string => {
  const s = (f || '').toLowerCase().trim();
  if (s.includes('ground') || s === 'g' || s === 'g floor') return 'Ground Floor';
  if (s.includes('1') || s.includes('first')) return '1st Floor';
  if (s.includes('2') || s.includes('second')) return '2nd Floor';
  if (s.includes('3') || s.includes('third')) return '3rd Floor';
  if (s.includes('4') || s.includes('fourth')) return '4th Floor';
  if (s.includes('5') || s.includes('fifth')) return '5th Floor';
  return f || 'Ground Floor';
};

const FLOOR_ZONES: Record<string, ZonePolygon[]> = {
  'Ground Floor': [
    { name: 'Central Atrium', path: 'M 300 200 L 500 200 L 500 350 L 300 350 Z', labelX: 400, labelY: 275, baseColor: '#3b82f6' },
    { name: 'North Wing', path: 'M 200 60 L 600 60 L 600 170 L 200 170 Z', labelX: 400, labelY: 115, baseColor: '#10b981' },
    { name: 'East Wing', path: 'M 530 190 L 740 190 L 740 430 L 530 430 Z', labelX: 635, labelY: 310, baseColor: '#f59e0b' },
    { name: 'South Wing', path: 'M 200 380 L 600 380 L 600 480 L 200 480 Z', labelX: 400, labelY: 430, baseColor: '#8b5cf6' },
    { name: 'West Wing', path: 'M 60 190 L 270 190 L 270 430 L 60 430 Z', labelX: 165, labelY: 310, baseColor: '#ec4899' }
  ],
  '1st Floor': [
    { name: 'Fashion Atrium', path: 'M 300 200 L 500 200 L 500 350 L 300 350 Z', labelX: 400, labelY: 275, baseColor: '#3b82f6' },
    { name: 'North Gallery', path: 'M 200 60 L 600 60 L 600 170 L 200 170 Z', labelX: 400, labelY: 115, baseColor: '#10b981' },
    { name: 'East Concourse', path: 'M 530 190 L 740 190 L 740 430 L 530 430 Z', labelX: 635, labelY: 310, baseColor: '#f59e0b' },
    { name: 'South Terrace', path: 'M 200 380 L 600 380 L 600 480 L 200 480 Z', labelX: 400, labelY: 430, baseColor: '#8b5cf6' },
    { name: 'West Wing', path: 'M 60 190 L 270 190 L 270 430 L 60 430 Z', labelX: 165, labelY: 310, baseColor: '#ec4899' }
  ],
  '2nd Floor': [
    { name: 'Dining Hub', path: 'M 300 200 L 500 200 L 500 350 L 300 350 Z', labelX: 400, labelY: 275, baseColor: '#f59e0b' },
    { name: 'Food Court North', path: 'M 200 60 L 600 60 L 600 170 L 200 170 Z', labelX: 400, labelY: 115, baseColor: '#10b981' },
    { name: 'East Promenade', path: 'M 530 190 L 740 190 L 740 430 L 530 430 Z', labelX: 635, labelY: 310, baseColor: '#3b82f6' },
    { name: 'South Wing', path: 'M 200 380 L 600 380 L 600 480 L 200 480 Z', labelX: 400, labelY: 430, baseColor: '#8b5cf6' },
    { name: 'West Wing', path: 'M 60 190 L 270 190 L 270 430 L 60 430 Z', labelX: 165, labelY: 310, baseColor: '#ec4899' }
  ],
  '3rd Floor': [
    { name: 'Entertainment Atrium', path: 'M 300 200 L 500 200 L 500 350 L 300 350 Z', labelX: 400, labelY: 275, baseColor: '#8b5cf6' },
    { name: 'Multiplex Arena', path: 'M 200 60 L 600 60 L 600 170 L 200 170 Z', labelX: 400, labelY: 115, baseColor: '#ec4899' },
    { name: 'East Wing', path: 'M 530 190 L 740 190 L 740 430 L 530 430 Z', labelX: 635, labelY: 310, baseColor: '#f59e0b' },
    { name: 'South Wing', path: 'M 200 380 L 600 380 L 600 480 L 200 480 Z', labelX: 400, labelY: 430, baseColor: '#3b82f6' },
    { name: 'West Arcade', path: 'M 60 190 L 270 190 L 270 430 L 60 430 Z', labelX: 165, labelY: 310, baseColor: '#10b981' }
  ]
};

const STORE_COORDINATES: Record<string, { x: number; y: number }> = {
  'starbucks reserve': { x: 380, y: 250 },
  'starbucks': { x: 380, y: 250 },
  'häagen-dazs': { x: 440, y: 250 },
  'haagen-dazs': { x: 440, y: 250 },
  'haagen dazs': { x: 440, y: 250 },
  'din tai fung': { x: 420, y: 430 },
  'brew & bean': { x: 350, y: 115 },
  'nike flagship': { x: 380, y: 115 },
  'nike': { x: 380, y: 115 },
  'zara flagship': { x: 165, y: 280 },
  'zara': { x: 165, y: 280 },
  'gucci boutique': { x: 450, y: 115 },
  'gucci': { x: 450, y: 115 },
  'prada atelier': { x: 400, y: 430 },
  'prada': { x: 400, y: 430 },
  'louis vuitton': { x: 480, y: 270 },
  'rolex boutique': { x: 340, y: 270 },
  'rolex': { x: 340, y: 270 },
  'h&m flagship': { x: 165, y: 350 },
  'h&m': { x: 165, y: 350 },
  'u.s. polo': { x: 380, y: 115 },
  'us polo': { x: 380, y: 115 },
  'adidas': { x: 480, y: 115 },
  'apple experience store': { x: 635, y: 280 },
  'apple store': { x: 635, y: 280 },
  'apple': { x: 635, y: 280 },
  'ray-ban sunglass hut': { x: 165, y: 250 },
  'ray-ban': { x: 165, y: 250 },
  'pvr cinemas': { x: 400, y: 115 },
  'sephora': { x: 635, y: 350 },
  'pizzaexpress': { x: 420, y: 115 },
  'coffee day': { x: 380, y: 250 },
  'subway': { x: 320, y: 115 },
  'tiffany': { x: 400, y: 250 },
  'cartier': { x: 400, y: 115 }
};

export const MallFloorMap: React.FC<MallFloorMapProps> = ({
  currentFloor,
  brands,
  onSelectStore,
  onSelectZone
}) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const normalizedCurrentFloor = normalizeFloorName(currentFloor);
  const zones = FLOOR_ZONES[normalizedCurrentFloor] || FLOOR_ZONES['Ground Floor'];
  const filteredBrands = brands.filter(b => normalizeFloorName(b.floor) === normalizedCurrentFloor);

  const getZoneDensity = (zoneName: string): number => {
    const zoneStores = filteredBrands.filter(b => 
      (b.zone || '').toLowerCase().includes(zoneName.toLowerCase()) ||
      zoneName.toLowerCase().includes((b.zone || '').toLowerCase())
    );
    if (!zoneStores.length) return 35;
    const totalVisits = zoneStores.reduce((acc, s) => acc + (s.visitorsToday || 0), 0);
    const totalOrders = zoneStores.reduce((acc, s) => acc + (s.ordersCount || 0), 0);
    return Math.min(98, Math.max(25, Math.floor(totalVisits / 12) + (totalOrders * 2)));
  };

  const getHeatmapColor = (density: number): string => {
    if (density >= 75) return 'rgba(239, 68, 68, 0.65)';
    if (density >= 50) return 'rgba(245, 158, 11, 0.55)';
    return 'rgba(16, 185, 129, 0.45)';
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
      
      {/* MAP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Interactive 2D Spatial Floor Twin — {currentFloor}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest animate-pulse">
              Live Data Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any zone to filter stores or toggle live footfall density heatmap overlay
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              showHeatmap
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Heatmap Overlay {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <div className="bg-slate-800 p-1 rounded-xl flex items-center space-x-1 border border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.6))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setSelectedZone(null); }}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG SPATIAL MAP CONTAINER */}
      <div className="relative w-full overflow-hidden bg-slate-950/80 rounded-2xl border border-slate-800/80 min-h-[440px] flex items-center justify-center p-2">
        <div
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg viewBox="0 0 800 540" className="w-full h-auto select-none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <radialGradient id="atriumGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="800" height="540" fill="url(#grid)" />

            <rect x="40" y="40" width="720" height="460" rx="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />

            <path d="M 280 60 L 280 480 M 520 60 L 520 480 M 60 180 L 740 180 M 60 360 L 740 360" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />

            {zones.map(z => {
              const density = getZoneDensity(z.name);
              const isSelected = selectedZone === z.name;
              const fill = showHeatmap ? getHeatmapColor(density) : (isSelected ? z.baseColor : `${z.baseColor}33`);

              return (
                <g key={z.name} className="cursor-pointer group" onClick={() => {
                  setSelectedZone(isSelected ? null : z.name);
                  if (onSelectZone) onSelectZone(z.name);
                }}>
                  <path
                    d={z.path}
                    fill={fill}
                    stroke={isSelected ? '#ffffff' : z.baseColor}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-300 group-hover:fill-opacity-80"
                  />
                  <text
                    x={z.labelX}
                    y={z.labelY - 10}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="800"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md tracking-wider uppercase font-sans"
                  >
                    {z.name}
                  </text>
                  <text
                    x={z.labelX}
                    y={z.labelY + 12}
                    fill={density >= 70 ? '#fca5a5' : '#93c5fd'}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    ⚡ {density}% Density
                  </text>
                </g>
              );
            })}

            <circle cx="400" cy="275" r="90" fill="url(#atriumGlow)" className="animate-pulse" />

            {filteredBrands.map((store, idx) => {
              const nameLower = store.name.toLowerCase();
              let pos = STORE_COORDINATES[nameLower];
              if (!pos) {
                const matchKey = Object.keys(STORE_COORDINATES).find(k => nameLower.includes(k) || k.includes(nameLower));
                if (matchKey) {
                  pos = STORE_COORDINATES[matchKey];
                } else {
                  const matchingZone = zones.find(z => 
                    (store.zone || '').toLowerCase().includes(z.name.toLowerCase()) || 
                    z.name.toLowerCase().includes((store.zone || '').toLowerCase())
                  );
                  const baseCenter = matchingZone ? { x: matchingZone.labelX, y: matchingZone.labelY } : { x: 400, y: 275 };
                  const offsetX = ((idx % 3) - 1) * 60;
                  const offsetY = Math.floor(idx / 3) * 35 + 10;
                  pos = { x: baseCenter.x + offsetX, y: baseCenter.y + offsetY };
                }
              }

              const revK = Math.floor((store.revenueToday || 0) / 1000);

              return (
                <g
                  key={store.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectStore && onSelectStore(store.id)}
                >
                  <circle r="22" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" className="shadow-lg group-hover:scale-110 transition-transform" />
                  <text y="4" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
                    {store.logo && !store.logo.startsWith('http') ? store.logo : store.name.slice(0, 2).toUpperCase()}
                  </text>
                  
                  <g transform="translate(0, 28)">
                    <rect x="-30" y="-10" width="60" height="18" rx="9" fill="#10b981" />
                    <text x="0" y="2" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
                      ₹{revK}k
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 gap-3">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-300">Footfall Density:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;50%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (50-75%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Peak (&gt;75%)</span>
        </div>
        <div>
          Showing <span className="font-bold text-white">{filteredBrands.length}</span> live stores on {currentFloor}
        </div>
      </div>
    </div>
  );
};
