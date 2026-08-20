import React from 'react';
import { 
  Wifi, 
  Users, 
  ShoppingBag, 
  Receipt, 
  CalendarCheck, 
  IndianRupee, 
  Ticket, 
  QrCode,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { KpiItem } from '../types';

interface KpiCardProps {
  item: KpiItem;
  onClick?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wifi,
  Users,
  ShoppingBag,
  Receipt,
  CalendarCheck,
  IndianRupee,
  Ticket,
  QrCode
};

export const KpiCard: React.FC<KpiCardProps> = ({ item, onClick }) => {
  const IconComponent = ICON_MAP[item.iconName] || Users;

  // Calculate SVG sparkline points
  const maxVal = Math.max(...item.sparklineData);
  const minVal = Math.min(...item.sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 30;

  const points = item.sparklineData.map((val, idx) => {
    const x = (idx / (item.sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Mini Sparkline Graph */}
        <div className="shrink-0">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={item.isPositive ? '#2563EB' : '#E11D48'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {item.title}
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
          {item.value}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1 font-bold ${
          item.isPositive ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {item.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{item.change}</span>
        </div>
        <span className="text-slate-400 font-medium">{item.subtext}</span>
      </div>
    </div>
  );
};
