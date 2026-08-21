import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Building2, 
  Bell, 
  Wifi, 
  Calendar, 
  Clock, 
  ChevronDown, 
  Menu,
  X,
  Store as StoreIcon,
  User as UserIcon,
  Receipt,
  Ticket,
  CheckCircle2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { MALL_LIST, MOCK_STORES, MOCK_USERS, MOCK_ORDERS, MOCK_ALERTS } from '../data/mockData';
import { ViewType, Store, ConnectedUser, Order, SystemAlert, AdminUser } from '../types';

interface HeaderProps {
  selectedMall: string;
  onSelectMall: (mall: string) => void;
  onOpenMobileSidebar: () => void;
  onSelectView: (view: ViewType) => void;
  unreadCount: number;
  stores?: Store[];
  users?: ConnectedUser[];
  orders?: Order[];
  alerts?: SystemAlert[];
  currentUser?: any;
  currentAdmin?: AdminUser | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMall,
  onSelectMall,
  onOpenMobileSidebar,
  onSelectView,
  unreadCount,
  stores = MOCK_STORES,
  users = MOCK_USERS,
  orders = MOCK_ORDERS,
  alerts = MOCK_ALERTS,
  currentUser,
  currentAdmin,
  onSignOut
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mallDropdownOpen, setMallDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const mallRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (mallRef.current && !mallRef.current.contains(e.target as Node)) {
        setMallDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter global search results
  const matchingStores = searchQuery.trim() 
    ? stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchingUsers = searchQuery.trim()
    ? users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery))
    : [];

  const matchingOrders = searchQuery.trim()
    ? orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasResults = matchingStores.length > 0 || matchingUsers.length > 0 || matchingOrders.length > 0;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* LEFT: Mobile Toggle + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg border border-[#E5E7EB] text-slate-600 hover:bg-slate-50"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Box */}
          <div ref={searchRef} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stores, users, orders, coupons..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full pl-10 pr-9 py-2 bg-[#F6F8FB] hover:bg-slate-100/80 focus:bg-white border border-[#E5E7EB] rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2 divide-y divide-slate-100">
                    {matchingStores.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <StoreIcon className="w-3 h-3 text-blue-600" />
                          Stores ({matchingStores.length})
                        </div>
                        {matchingStores.slice(0, 3).map(store => (
                          <button
                            key={store.id}
                            onClick={() => {
                              onSelectView('store-directory');
                              setSearchOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm text-slate-800"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={store.logo} alt={store.name} className="w-6 h-6 rounded-md object-cover" />
                              <span className="font-medium">{store.name}</span>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{store.floor}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchingUsers.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-blue-600" />
                          Connected WiFi Users ({matchingUsers.length})
                        </div>
                        {matchingUsers.slice(0, 3).map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSelectView('connected-users');
                              setSearchOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm text-slate-800"
                          >
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-slate-400">{user.phone}</div>
                            </div>
                            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Connected</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchingOrders.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-blue-600" />
                          Orders ({matchingOrders.length})
                        </div>
                        {matchingOrders.slice(0, 3).map(order => (
                          <button
                            key={order.id}
                            onClick={() => {
                              onSelectView('orders');
                              setSearchOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm text-slate-800"
                          >
                            <div>
                              <div className="font-medium text-blue-600">{order.orderNumber} • {order.storeName}</div>
                              <div className="text-xs text-slate-500">{order.customerName}</div>
                            </div>
                            <span className="text-xs font-semibold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Mall Selector + Date/Time + Gateway + Notifications */}
        <div className="flex items-center gap-3">
          

          {/* Date & Time display */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(time)}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 font-mono text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatTime(time)}</span>
            </div>
          </div>

          {/* WiFi Gateway Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
            <span className="hidden xs:inline">ONLINE</span>
          </div>

          {/* Notification Bell Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Bell className="w-4 h-4 text-blue-600" />
                    System Alerts
                  </div>
                  <button
                    onClick={() => {
                      onSelectView('notifications');
                      setNotificationsOpen(false);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View All
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {MOCK_ALERTS.map(alert => (
                    <div key={alert.id} className={`p-3.5 transition-colors ${alert.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{alert.timestamp}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1.5">{alert.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Quick Menu */}
          <div ref={profileRef} className="relative flex items-center gap-2 pl-1 border-l border-slate-200">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-9 h-9 rounded-xl border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-600/30 transition-all flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs"
              aria-label="Admin Profile Menu"
            >
              {currentAdmin?.name ? currentAdmin.name.slice(0, 2).toUpperCase() : (currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'AD')}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 p-2 space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {currentAdmin?.name || 'Administrator'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {currentUser?.email || currentAdmin?.email || 'admin@phoenixmall.com'}
                  </div>
                  <div className="pt-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                      {currentAdmin?.role || 'Super Admin'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Active
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      onSelectView('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    System Settings
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out of Admin Console
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
