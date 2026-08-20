import React from 'react';
import { 
  LayoutDashboard, 
  Wifi, 
  Store as StoreIcon, 
  Receipt, 
  CalendarCheck, 
  Ticket, 
  Megaphone, 
  BarChart3, 
  FileText, 
  Bell, 
  Settings, 
  Building2, 
  ShieldCheck, 
  X,
  Users,
  Sparkles,
  Building,
  ChevronRight,
  Award,
  LogOut
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  unreadCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut?: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  unreadCount,
  mobileOpen,
  onCloseMobile,
  onSignOut
}) => {
  const mainModules: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'tenant-dashboard', label: 'Tenant Store Inventory', icon: StoreIcon, badge: 'Live' },
    { id: 'customer-crm', label: 'Customer CRM', icon: Users, badge: '1.4k' },
    { id: 'store-management', label: 'Store Management', icon: Building2 },
    { id: 'campaigns', label: 'Campaign Builder', icon: Megaphone },
    { id: 'notifications', label: 'Notification Hub', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'super-admin', label: 'Super Admin', icon: ShieldCheck },
  ];

  const secondaryModules: NavItem[] = [
    { id: 'connected-users', label: 'Connected Users', icon: Wifi },
    { id: 'store-directory', label: 'Store Directory', icon: Building },
    { id: 'orders', label: 'All Orders', icon: Receipt },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
    { id: 'coupons', label: 'Coupons & Offers', icon: Ticket },
    { id: 'loyalty', label: 'Loyalty & Rewards', icon: Award },
    { id: 'analytics', label: 'Mall Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports Export', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200 w-64 select-none">
      {/* BRAND HEADER */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xl tracking-wider">
            AX
          </div>
          <div>
            <div className="font-extrabold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
              AXIONIX
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60 uppercase">
                OS
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" />
              Smart Mall Platform
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVIGATION MENU */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        
        {/* CORE OPERATING MODULES SECTION */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Operating Modules
          </div>

          {mainModules.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'AI'
                        ? 'bg-purple-100 text-purple-700'
                        : item.badge === 'Wi-Fi'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ANALYTICS & DIRECTORIES SECTION */}
        <div className="space-y-1 border-t border-slate-100 pt-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Analytics & Operations
          </div>

          {secondaryModules.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* SYSTEM STATUS FOOTER */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-700 text-[11px]">SSE Synchronized</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">AXIONIX Enterprise v2.4</span>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign Out of Admin Console"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
