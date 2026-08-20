import React, { useState } from 'react';
import { 
  Wifi, 
  CheckCircle2, 
  MapPin, 
  ShoppingBag, 
  Calendar, 
  Sparkles, 
  Tag, 
  QrCode, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Search,
  Star
} from 'lucide-react';
import { MOCK_STORES, MOCK_COUPONS } from '../../data/mockData';

interface CaptivePortalViewProps {
  onCheckinSuccess?: (user: { name: string; phone: string; floor: string }) => void;
}

export const CaptivePortalView: React.FC<CaptivePortalViewProps> = ({ onCheckinSuccess }) => {
  const [step, setStep] = useState<'welcome' | 'otp' | 'connected'>('welcome');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'concierge' | 'coupons'>('explore');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Booking
  const [selectedStoreForModal, setSelectedStoreForModal] = useState<any | null>(null);
  const [bookingType, setBookingType] = useState<'order' | 'fitting'>('fitting');
  const [fittingTime, setFittingTime] = useState('14:30');
  const [fittingParty, setFittingParty] = useState(2);
  const [orderItem, setOrderItem] = useState('Flagship VIP Access Item');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPhone) return;
    setStep('otp');
    showToast('OTP sent to ' + guestPhone + ' via SMS/WhatsApp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('connected');
    if (onCheckinSuccess) {
      onCheckinSuccess({ name: guestName || 'Valued Guest', phone: guestPhone, floor: 'Ground Floor Atrium' });
    }
    showToast('Wi-Fi Connected! Welcome to Phoenix Marketcity Bengaluru');
  };

  const categories = ['All', 'Fashion', 'Food', 'Accessories', 'Entertainment'];

  const filteredStores = MOCK_STORES.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.floor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleConfirmBooking = () => {
    if (!selectedStoreForModal) return;
    if (bookingType === 'fitting') {
      showToast(`VIP Fitting Room Reserved at ${selectedStoreForModal.name} for ${fittingTime}!`);
    } else {
      showToast(`Concierge Order placed for ${orderItem} at ${selectedStoreForModal.name}!`);
    }
    setSelectedStoreForModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-up border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
              <span>Smart Captive Wi-Fi Concierge</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Phoenix Marketcity Guest Portal</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Experience seamless Wi-Fi connectivity, luxury boutique discovery, instant fitting room reservations, and in-mall concierge delivery.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
            <MapPin className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-200 uppercase font-semibold">Detected Location</p>
              <p className="text-sm font-bold text-white">Ground Floor Atrium • Main Entry</p>
            </div>
          </div>
        </div>
      </div>

      {/* WI-FI CHECK-IN STEP CARDS */}
      {step !== 'connected' ? (
        <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Wifi className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Connect to High-Speed Wi-Fi</h2>
            <p className="text-xs text-slate-500">Free 1 Gbps Gigabit Access for Mall Visitors</p>
          </div>

          {step === 'welcome' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    placeholder="Enter 10-Digit Mobile Number"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="Enter Email Address"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-700 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Verification code sent to <strong>{guestPhone}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-lg py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Verify & Connect Wi-Fi</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      ) : (
        /* CONNECTED DASHBOARD EXPERIENCE */
        <div className="space-y-6">
          
          {/* NAVIGATION TABS */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm max-w-lg">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-2 ${
                activeTab === 'explore' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Stores</span>
            </button>

            <button
              onClick={() => setActiveTab('concierge')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-2 ${
                activeTab === 'concierge' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Wardrobe Concierge</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-2 ${
                activeTab === 'coupons' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>My Coupons ({MOCK_COUPONS.length})</span>
            </button>
          </div>

          {activeTab === 'explore' && (
            <div className="space-y-6">
              
              {/* SEARCH & CATEGORY FILTER */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search stores or brands..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* STORE CATALOG GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStores.map(store => (
                  <div 
                    key={store.id} 
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1" 
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">{store.name}</h3>
                            <span className="text-xs text-slate-500">{store.category} • {store.floor}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{store.rating}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visitors</span>
                          <span className="font-bold text-slate-700">{store.visitorsToday} Today</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                          <span className={`font-bold ${store.status === 'Peak' ? 'text-emerald-600' : 'text-blue-600'}`}>{store.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedStoreForModal(store);
                          setBookingType('fitting');
                        }}
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reserve Fitting</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStoreForModal(store);
                          setBookingType('order');
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Concierge Order</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'concierge' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 max-w-2xl">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">In-Mall Wardrobe Care & Personal Styling</h3>
                  <p className="text-xs text-slate-500">Book garment care or dedicated personal styling suite in advance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                  <span className="bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">Express Care</span>
                  <h4 className="font-bold text-slate-800 text-sm">Wardrobe Steam & Press</h4>
                  <p className="text-xs text-slate-600">Complimentary 15-minute garment refresh service while you enjoy dining.</p>
                  <button 
                    onClick={() => showToast('Wardrobe Steam Service requested for Ground Floor Atrium!')}
                    className="w-full py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    Request Steam Care
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <span className="bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">VIP Suite</span>
                  <h4 className="font-bold text-slate-800 text-sm">Personal Stylist Session</h4>
                  <p className="text-xs text-slate-600">Private 1-on-1 consultation with curated collections delivered directly.</p>
                  <button 
                    onClick={() => showToast('VIP Stylist appointment booked!')}
                    className="w-full py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                  >
                    Book Stylist
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOCK_COUPONS.map(coupon => (
                <div key={coupon.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                    {coupon.discount}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium">{coupon.storeName}</span>
                    <h4 className="font-bold text-slate-800 text-sm">{coupon.title}</h4>
                    <span className="inline-block bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded-md border border-slate-200 mt-2">
                      CODE: <strong>{coupon.code}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Expires: {coupon.expiryDate}</span>
                    <button 
                      onClick={() => showToast(`Coupon ${coupon.code} saved to your wallet!`)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Apply Coupon →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* BOOKING MODAL OVERLAY */}
      {selectedStoreForModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <img src={selectedStoreForModal.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-50 border p-0.5" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedStoreForModal.name}</h3>
                  <span className="text-xs text-slate-500">{selectedStoreForModal.floor}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStoreForModal(null)} 
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {bookingType === 'fitting' ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Reserve VIP Fitting Room</h4>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Time Slot</label>
                  <input 
                    type="time" 
                    value={fittingTime} 
                    onChange={e => setFittingTime(e.target.value)} 
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Party Size</label>
                  <select 
                    value={fittingParty} 
                    onChange={e => setFittingParty(Number(e.target.value))}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests (Private Lounge)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase">In-Mall Concierge Delivery Order</h4>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Select Boutique Item</label>
                  <input 
                    type="text" 
                    value={orderItem} 
                    onChange={e => setOrderItem(e.target.value)} 
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedStoreForModal(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
