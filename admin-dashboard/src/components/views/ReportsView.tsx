import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Users, 
  ShoppingBag, 
  CalendarCheck, 
  TrendingUp, 
  Award, 
  MapPin, 
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface ReportsViewProps {
  onOpenReportModal: (type: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenReportModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const reportTemplates = [
    {
      title: 'Daily Mall Operations Summary',
      description: 'Comprehensive report on total footfall, active WiFi users, gateway load, tenant sales, and operational KPIs.',
      category: 'Operations',
      icon: FileText,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Tenant Revenue & POS Statement',
      description: 'Detailed revenue statement per store tenant with conversion rates, order counts, and digital order receipts.',
      category: 'Financial',
      icon: FileSpreadsheet,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Customer CRM & VIP Member Audit',
      description: 'Complete database report of registered mall guests, contact details, VIP loyalty status, total spend, and visit frequencies.',
      category: 'Customer CRM',
      icon: Users,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      title: 'Concierge & In-Store Digital Orders Audit',
      description: 'Full audit trail of all store orders, payment gateway channels (UPI/Card/Cash), customer details, items count, and order status.',
      category: 'Sales & Orders',
      icon: ShoppingBag,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'VIP Suite & Fitting Room Reservations Log',
      description: 'Complete schedule of store fitting room bookings, VIP concierge suite reservations, party sizes, time slots, and special requests.',
      category: 'Reservations',
      icon: CalendarCheck,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Marketing Campaign & Coupon ROI',
      description: 'Performance breakdown of active campaigns, coupon redemptions, customer acquisition channels, and marketing ROI.',
      category: 'Marketing',
      icon: TrendingUp,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      title: 'WiFi Gateway & Bandwidth Telemetry Log',
      description: 'Technical access log detailing MAC connections, average dwell times, AP uptime, bandwidth load, and data consumption.',
      category: 'IT & Infrastructure',
      icon: FileCode,
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      title: 'Loyalty Points & Rewards Program Report',
      description: 'Audit log of member loyalty point balances, lifetime points, tier upgrades (Silver/Gold/Platinum), and voucher redemptions.',
      category: 'Loyalty & Rewards',
      icon: Award,
      badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    },
    {
      title: 'Spatial Footfall & Floor Traffic Analytics',
      description: 'Spatial telemetry breakdown of floor-by-floor footfall, zone densities, peak traffic hours, heatmaps, and floor conversion.',
      category: 'Analytics',
      icon: MapPin,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      title: 'Executive Master System Audit Report',
      description: 'Unified master audit report exporting all operational, financial, CRM, order, reservation, loyalty, and infrastructure telemetry data.',
      category: 'Executive Overview',
      icon: ShieldCheck,
      badgeColor: 'bg-violet-50 text-violet-800 border-violet-200'
    }
  ];

  const categories = ['All', 'Operations', 'Financial', 'Customer CRM', 'Sales & Orders', 'Reservations', 'Marketing', 'IT & Infrastructure', 'Loyalty & Rewards', 'Analytics'];

  const filteredReports = selectedCategory === 'All' 
    ? reportTemplates 
    : reportTemplates.filter(r => r.category === selectedCategory || (selectedCategory === 'Operations' && r.category === 'Executive Overview'));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Executive Reports & Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download formatted Excel (.xls), PDF documents & CSV management files with live Supabase telemetry.
          </p>
        </div>

        <button
          onClick={() => onOpenReportModal('Executive Master System Audit Report')}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          Export Master Audit (.xls / .pdf)
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((rep, idx) => {
          const Icon = rep.icon;

          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${rep.badgeColor}`}>
                    {rep.category}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{rep.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Format: <strong className="text-slate-700">Excel (.xls), PDF & CSV</strong>
                </span>
                <button
                  onClick={() => onOpenReportModal(rep.title)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
