import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Flame, Eye, MapPin } from 'lucide-react';

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

interface ZoneDefinition {
  id: string;
  name: string;
  code: string;
  title: string;
  rect: { x: number; y: number; width: number; height: number; rx: number };
  labelX: number;
  labelY: number;
  baseColor: string;
  strokeColor: string;
  tag?: { text: string; x: number; y: number; isVertical?: boolean };
  badge?: { text: string; x: number; y: number };
  aliases: string[];
}

const FLOOR_ZONES_CONFIG: ZoneDefinition[] = [
  {
    id: 'zone-d',
    name: 'Zone D (Auditorium)',
    code: 'Zone D',
    title: 'Auditorium',
    rect: { x: 230, y: 150, width: 240, height: 105, rx: 16 },
    labelX: 350,
    labelY: 195,
    baseColor: '#3b82f6',
    strokeColor: '#3b82f6',
    tag: { text: 'Entrance 1', x: 300, y: 138 },
    badge: { text: 'NK', x: 350, y: 190 },
    aliases: ['zone d', 'auditorium', 'north wing', 'north gallery', 'food court north', 'multiplex arena']
  },
  {
    id: 'entrance-2',
    name: 'Entrance 2 (West Wing)',
    code: 'Entrance 2',
    title: 'Entrance 2',
    rect: { x: 90, y: 215, width: 140, height: 60, rx: 14 },
    labelX: 160,
    labelY: 245,
    baseColor: '#ef4444',
    strokeColor: '#f87171',
    tag: { text: 'Entrance 2', x: 105, y: 233 },
    aliases: ['entrance 2', 'west wing', 'west arcade']
  },
  {
    id: 'zone-c',
    name: 'Zone C (Exhibition)',
    code: 'Zone C',
    title: 'Exhibition',
    rect: { x: 300, y: 280, width: 210, height: 65, rx: 14 },
    labelX: 405,
    labelY: 312,
    baseColor: '#64748b',
    strokeColor: '#64748b',
    aliases: ['zone c', 'exhibition', 'central atrium', 'fashion atrium', 'dining hub', 'entertainment atrium']
  },
  {
    id: 'zone-a',
    name: 'Zone A (Stands)',
    code: 'Zone A',
    title: 'Stands',
    rect: { x: 195, y: 380, width: 280, height: 140, rx: 16 },
    labelX: 335,
    labelY: 450,
    baseColor: '#64748b',
    strokeColor: '#94a3b8',
    tag: { text: 'Entrance 3', x: 215, y: 368 },
    aliases: ['zone a', 'stands', 'south wing', 'south terrace']
  },
  {
    id: 'zone-b',
    name: 'Zone B (Hall)',
    code: 'Zone B',
    title: 'Hall',
    rect: { x: 545, y: 340, width: 175, height: 165, rx: 16 },
    labelX: 630,
    labelY: 420,
    baseColor: '#d97706',
    strokeColor: '#c29b7a',
    badge: { text: 'TAG', x: 630, y: 412 },
    tag: { text: 'Entrance 4', x: 672, y: 370, isVertical: true },
    aliases: ['zone b', 'hall', 'east wing', 'east concourse', 'east promenade']
  }
];

const STORE_COORDINATES: Record<string, { x: number; y: number }> = {
  'nike flagship': { x: 395, y: 190 },
  'nike': { x: 395, y: 190 },
  'adidas': { x: 430, y: 220 },
  'adidas originals': { x: 430, y: 220 },
  'gucci': { x: 280, y: 190 },
  'gucci boutique': { x: 280, y: 190 },
  'h&m flagship': { x: 280, y: 305 },
  'h&m': { x: 280, y: 305 },
  'zara flagship': { x: 160, y: 245 },
  'zara': { x: 160, y: 245 },
  'ray-ban sunglass hut': { x: 130, y: 245 },
  'ray-ban': { x: 130, y: 245 },
  'starbucks reserve': { x: 360, y: 312 },
  'starbucks': { x: 360, y: 312 },
  'brew & bean': { x: 450, y: 312 },
  'rolex boutique': { x: 470, y: 295 },
  'louis vuitton': { x: 340, y: 295 },
  'din tai fung': { x: 335, y: 440 },
  'prada atelier': { x: 410, y: 440 },
  'prada': { x: 410, y: 440 },
  'pvr cinemas': { x: 335, y: 480 },
  'sephora': { x: 420, y: 480 },
  'apple experience store': { x: 630, y: 365 },
  'apple store': { x: 630, y: 365 }
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

  const zones = FLOOR_ZONES_CONFIG;
  const filteredBrands = brands.filter(b => 
    (b.floor || '').toLowerCase().includes(currentFloor.toLowerCase().replace('floor', '').trim())
  );

  const getZoneDensity = (zoneName: string): number => {
    const targetZone = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase() || z.code.toLowerCase() === zoneName.toLowerCase());
    const zoneAliases = targetZone ? targetZone.aliases : [zoneName.toLowerCase()];

    const zoneStores = filteredBrands.filter(b => {
      const bZone = (b.zone || '').toLowerCase();
      return zoneAliases.some(alias => bZone.includes(alias));
    });

    if (!zoneStores.length) return 38;
    const totalVisits = zoneStores.reduce((acc, s) => acc + (s.visitorsToday || 0), 0);
    return Math.min(98, Math.max(30, Math.floor(totalVisits / 10)));
  };

  const getHeatmapColor = (density: number): string => {
    if (density >= 75) return 'rgba(239, 68, 68, 0.45)'; // High Heat (Red)
    if (density >= 50) return 'rgba(245, 158, 11, 0.35)'; // Moderate (Amber)
    return 'rgba(16, 185, 129, 0.3)'; // Low (Green)
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
      
      {/* MAP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Interactive Spatial Floor Twin &amp; Heatmap — {currentFloor}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
              Live Sensor Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Architectural CAD layout with real-time zone footfall density heatmap overlay
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
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
      <div className="relative w-full overflow-hidden bg-white rounded-2xl border border-slate-700/60 min-h-[460px] flex items-center justify-center p-2 shadow-inner">
        <div
          className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg viewBox="0 0 800 560" className="w-full max-w-[800px] h-auto select-none">
            <defs>
              <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f8fafc" strokeWidth="0.8" />
              </pattern>
              <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Base Canvas */}
            <rect width="800" height="560" fill="#ffffff" />
            <rect width="800" height="560" fill="url(#archGrid)" />

            {/* ── ARCHITECTURAL CAD BLUEPRINT BASE LAYER ── */}
            {/* Left vertical guideline */}
            <line x1="130" y1="90" x2="130" y2="480" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 130 430 A 25 25 0 0 0 130 480" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Room E & Room F under Entrance 2 on left */}
            <rect x="230" y="175" width="45" height="42" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" rx="2" />
            <text x="252" y="200" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">E</text>

            <rect x="230" y="225" width="45" height="42" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" rx="2" />
            <text x="252" y="250" fill="#f87171" fontSize="13" fontWeight="bold" textAnchor="middle">F</text>

            {/* Auditorium Background geometry in Zone D */}
            <path d="M 275 175 L 470 175 L 470 245 L 440 245 L 440 220 L 275 220 Z" fill="#cbd5e1" fillOpacity="0.35" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="350" y="160" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">1 Entrance</text>

            {/* Central Corridor & Walkway geometry */}
            <path d="M 275 260 L 530 260 L 530 350 L 275 350 Z" fill="#e2e8f0" fillOpacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 330 270 L 485 270 L 485 295 L 330 295 Z" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Entrance 3 background walkway */}
            <path d="M 245 350 L 295 350 L 295 440 L 245 440 Z" fill="#e2e8f0" fillOpacity="0.3" stroke="#cbd5e1" strokeWidth="1" />
            <text x="270" y="325" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">3 Entrance</text>

            {/* Hall B corridor connection & Entrance 4 text */}
            <path d="M 530 280 L 590 280 L 590 340 L 530 340" fill="none" stroke="#cbd5e1" strokeWidth="4" />
            <text x="610" y="275" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">4 Entrance</text>

            {/* Seats matrix column in corridor */}
            <g transform="translate(508, 320)">
              <text x="14" y="-8" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Seats</text>
              {[0, 1].map(col =>
                [0, 1, 2, 3, 4, 5].map(row => (
                  <rect key={`${col}-${row}`} x={col * 14} y={row * 12} width="8" height="8" rx="2" fill="#cbd5e1" />
                ))
              )}
            </g>

            {/* Stands / Zone A background room A */}
            <rect x="250" y="375" width="220" height="135" fill="#cbd5e1" fillOpacity="0.25" stroke="#94a3b8" strokeWidth="1" rx="4" />
            <rect x="290" y="405" width="80" height="45" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x="445" y="490" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">A</text>

            {/* Hall B background room & curved auditorium fan seating */}
            <rect x="545" y="340" width="175" height="165" fill="#cbd5e1" fillOpacity="0.2" stroke="#94a3b8" strokeWidth="1" rx="4" />
            <text x="565" y="370" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">B</text>
            <text x="565" y="388" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Hall</text>

            {/* Fan-shaped seating clusters in Hall B */}
            <g transform="translate(630, 445)">
              <path d="M -35 -20 A 40 40 0 0 1 35 -20" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="6 4" />
              <path d="M -50 -5 A 55 55 0 0 1 50 -5" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="8 5" />
              <path d="M -65 10 A 70 70 0 0 1 65 10" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="10 6" />
              {[-25, 0, 25].map((sx, i) => (
                <rect key={i} x={sx - 5} y="-35" width="10" height="8" rx="2" fill="#cbd5e1" />
              ))}
            </g>

            {/* Bottom-right floor boundary tick */}
            <rect x="675" y="525" width="8" height="25" fill="#cbd5e1" rx="2" />

            {/* ── 5 THEMED SPATIAL OVERLAY ZONES ── */}

            {/* 1. ZONE D (AUDITORIUM - TOP BLUE ZONE) */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                const next = selectedZone === 'Zone D (Auditorium)' ? null : 'Zone D (Auditorium)';
                setSelectedZone(next);
                if (onSelectZone) onSelectZone(next || 'All');
              }}
            >
              <rect
                x="230"
                y="150"
                width="240"
                height="105"
                rx="16"
                fill={
                  showHeatmap 
                    ? getHeatmapColor(getZoneDensity('Zone D (Auditorium)')) 
                    : (selectedZone === 'Zone D (Auditorium)' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.12)')
                }
                stroke={selectedZone === 'Zone D (Auditorium)' ? '#1d4ed8' : '#3b82f6'}
                strokeWidth={selectedZone === 'Zone D (Auditorium)' ? 3 : 1.8}
                className="transition-all duration-300 group-hover:fill-opacity-80"
              />

              <text x="350" y="192" fill="#2563eb" fontSize="18" fontWeight="800" textAnchor="middle" className="pointer-events-none font-sans">
                Auditorium
              </text>
              <text x="350" y="214" fill="#3b82f6" fontSize="14" fontWeight="600" textAnchor="middle" className="pointer-events-none font-sans">
                Zone D
              </text>
              <text x="350" y="234" fill="#93c5fd" fontSize="9" fontWeight="500" textAnchor="middle" className="pointer-events-none">
                Auditorium
              </text>

              {/* Entrance 1 Pill Tag */}
              <g transform="translate(300, 138)">
                <rect x="0" y="0" width="100" height="24" rx="6" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" filter="url(#shadowFilter)" />
                <path d="M 12 12 L 18 12 M 16 9 L 19 12 L 16 15" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <text x="24" y="16" fill="#0f172a" fontSize="11" fontWeight="800">Entrance 1</text>
              </g>

              {/* Solid Black Badge "NK" */}
              <g transform="translate(350, 188)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">NK</text>
              </g>
            </g>

            {/* 2. ENTRANCE 2 (WEST WING / PINK-RED ZONE) */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                const next = selectedZone === 'Entrance 2 (West Wing)' ? null : 'Entrance 2 (West Wing)';
                setSelectedZone(next);
                if (onSelectZone) onSelectZone(next || 'All');
              }}
            >
              <rect
                x="90"
                y="215"
                width="140"
                height="60"
                rx="14"
                fill={
                  showHeatmap 
                    ? getHeatmapColor(getZoneDensity('Entrance 2 (West Wing)')) 
                    : (selectedZone === 'Entrance 2 (West Wing)' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)')
                }
                stroke={selectedZone === 'Entrance 2 (West Wing)' ? '#dc2626' : '#f87171'}
                strokeWidth={selectedZone === 'Entrance 2 (West Wing)' ? 3 : 1.5}
                className="transition-all duration-300 group-hover:fill-opacity-80"
              />

              <g transform="translate(105, 233)">
                <rect x="0" y="0" width="100" height="24" rx="6" fill="#ffffff" stroke="#fca5a5" strokeWidth="1.5" filter="url(#shadowFilter)" />
                <path d="M 12 12 L 18 12 M 16 9 L 19 12 L 16 15" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <text x="24" y="16" fill="#0f172a" fontSize="11" fontWeight="800">Entrance 2</text>
              </g>

              <text x="160" y="266" fill="#fca5a5" fontSize="9" fontWeight="500" textAnchor="middle" className="pointer-events-none">
                Entrance
              </text>
            </g>

            {/* 3. SOLID BLACK BADGE "HM" (BETWEEN ENTRANCE 2 & ZONE C/A) */}
            <g transform="translate(280, 305)" className="cursor-pointer group">
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#ffffff" strokeWidth="2" filter="url(#shadowFilter)" />
              <text x="0" y="4.5" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">HM</text>
            </g>

            {/* 4. ZONE C (EXHIBITION - CENTER SLATE ZONE) */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                const next = selectedZone === 'Zone C (Exhibition)' ? null : 'Zone C (Exhibition)';
                setSelectedZone(next);
                if (onSelectZone) onSelectZone(next || 'All');
              }}
            >
              <rect
                x="300"
                y="280"
                width="210"
                height="65"
                rx="14"
                fill={
                  showHeatmap 
                    ? getHeatmapColor(getZoneDensity('Zone C (Exhibition)')) 
                    : (selectedZone === 'Zone C (Exhibition)' ? 'rgba(100, 116, 139, 0.25)' : 'rgba(100, 116, 139, 0.12)')
                }
                stroke={selectedZone === 'Zone C (Exhibition)' ? '#334155' : '#64748b'}
                strokeWidth={selectedZone === 'Zone C (Exhibition)' ? 3 : 1.8}
                className="transition-all duration-300 group-hover:fill-opacity-80"
              />

              <text x="405" y="308" fill="#334155" fontSize="16" fontWeight="800" textAnchor="middle" className="pointer-events-none font-sans">
                Exhibition
              </text>
              <text x="405" y="330" fill="#64748b" fontSize="13" fontWeight="600" textAnchor="middle" className="pointer-events-none font-sans">
                Zone C
              </text>
            </g>

            {/* 5. ZONE A (STANDS - BOTTOM SLATE ZONE) */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                const next = selectedZone === 'Zone A (Stands)' ? null : 'Zone A (Stands)';
                setSelectedZone(next);
                if (onSelectZone) onSelectZone(next || 'All');
              }}
            >
              <rect
                x="195"
                y="380"
                width="280"
                height="140"
                rx="16"
                fill={
                  showHeatmap 
                    ? getHeatmapColor(getZoneDensity('Zone A (Stands)')) 
                    : (selectedZone === 'Zone A (Stands)' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.12)')
                }
                stroke={selectedZone === 'Zone A (Stands)' ? '#334155' : '#94a3b8'}
                strokeWidth={selectedZone === 'Zone A (Stands)' ? 3 : 1.8}
                className="transition-all duration-300 group-hover:fill-opacity-80"
              />

              {/* Entrance 3 Pill Tag */}
              <g transform="translate(215, 368)">
                <rect x="0" y="0" width="100" height="24" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#shadowFilter)" />
                <path d="M 12 12 L 18 12 M 16 9 L 19 12 L 16 15" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <text x="24" y="16" fill="#0f172a" fontSize="11" fontWeight="800">Entrance 3</text>
              </g>

              <text x="335" y="440" fill="#1e293b" fontSize="17" fontWeight="800" textAnchor="middle" className="pointer-events-none font-sans">
                Stands
              </text>
              <text x="335" y="465" fill="#64748b" fontSize="14" fontWeight="600" textAnchor="middle" className="pointer-events-none font-sans">
                Zone A
              </text>
              <text x="335" y="485" fill="#94a3b8" fontSize="9" fontWeight="500" textAnchor="middle" className="pointer-events-none">
                Stands
              </text>

              {/* Toilet Icon & Text at Bottom-Left */}
              <g transform="translate(208, 485)">
                <path d="M 6 3 A 2 2 0 1 1 6 7 A 2 2 0 1 1 6 3 Z M 4 8 L 8 8 L 8 13 L 7 13 L 7 18 L 5 18 L 5 13 L 4 13 Z" fill="#64748b" />
                <path d="M 14 3 A 2 2 0 1 1 14 7 A 2 2 0 1 1 14 3 Z M 11.5 8 L 16.5 8 L 18 13 L 15.5 13 L 15.5 18 L 12.5 18 L 12.5 13 L 10 13 Z" fill="#64748b" />
                <text x="22" y="14" fill="#64748b" fontSize="14" fontWeight="700" className="font-sans">Toilet</text>
              </g>
            </g>

            {/* 6. ZONE B (HALL - RIGHT AMBER ZONE) */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                const next = selectedZone === 'Zone B (Hall)' ? null : 'Zone B (Hall)';
                setSelectedZone(next);
                if (onSelectZone) onSelectZone(next || 'All');
              }}
            >
              <rect
                x="545"
                y="340"
                width="175"
                height="165"
                rx="16"
                fill={
                  showHeatmap 
                    ? getHeatmapColor(getZoneDensity('Zone B (Hall)')) 
                    : (selectedZone === 'Zone B (Hall)' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(217, 119, 6, 0.12)')
                }
                stroke={selectedZone === 'Zone B (Hall)' ? '#9a3412' : '#c29b7a'}
                strokeWidth={selectedZone === 'Zone B (Hall)' ? 3 : 1.8}
                className="transition-all duration-300 group-hover:fill-opacity-80"
              />

              <text x="630" y="405" fill="#9a3412" fontSize="18" fontWeight="800" textAnchor="middle" className="pointer-events-none font-sans">
                Hall
              </text>
              <text x="630" y="435" fill="#b45309" fontSize="14" fontWeight="600" textAnchor="middle" className="pointer-events-none font-sans">
                Zone B
              </text>

              {/* TAG Badge */}
              <g transform="translate(630, 412)">
                <rect x="-19" y="-11" width="38" height="22" rx="11" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">TAG</text>
              </g>

              {/* Vertical Entrance 4 Tag */}
              <g transform="translate(672, 370)">
                <rect x="0" y="0" width="24" height="100" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#shadowFilter)" />
                <g transform="translate(12, 50) rotate(90)">
                  <path d="M -30 0 L -24 0 M -26 -3 L -23 0 L -26 3" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="-18" y="4" fill="#0f172a" fontSize="11" fontWeight="800" textAnchor="start">Entrance 4</text>
                </g>
              </g>
            </g>

            {/* ── LIVE STORE PINS ON THE NEW MAP ── */}
            {filteredBrands.map(store => {
              const nameLower = store.name.toLowerCase();
              let pos = STORE_COORDINATES[nameLower];
              if (!pos) {
                const matchKey = Object.keys(STORE_COORDINATES).find(k => nameLower.includes(k));
                if (matchKey) {
                  pos = STORE_COORDINATES[matchKey];
                } else {
                  // Fallback based on store zone
                  const sZone = (store.zone || '').toLowerCase();
                  if (sZone.includes('d') || sZone.includes('north') || sZone.includes('auditorium')) {
                    pos = { x: 380, y: 190 };
                  } else if (sZone.includes('b') || sZone.includes('east') || sZone.includes('hall')) {
                    pos = { x: 630, y: 365 };
                  } else if (sZone.includes('a') || sZone.includes('south') || sZone.includes('stands')) {
                    pos = { x: 340, y: 440 };
                  } else if (sZone.includes('west') || sZone.includes('entrance 2')) {
                    pos = { x: 160, y: 245 };
                  } else {
                    pos = { x: 405, y: 312 };
                  }
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
                  <circle
                    r="18"
                    fill="#0f172a"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="shadow-lg group-hover:scale-110 transition-transform"
                  />
                  <text y="4" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
                    {store.logo || store.name.slice(0, 2).toUpperCase()}
                  </text>
                  
                  {/* Revenue badge */}
                  <g transform="translate(0, 24)">
                    <rect x="-24" y="-8" width="48" height="15" rx="7.5" fill="#10b981" />
                    <text x="0" y="2.5" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">
                      ₹{revK}k
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* MAP FOOTER LEGEND */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 gap-3">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-300">Footfall Density:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;50%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (50-75%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Peak (&gt;75%)</span>
        </div>
        <div>
          Showing <span className="font-bold text-white">{filteredBrands.length}</span> stores on {currentFloor}
        </div>
      </div>
    </div>
  );
};
