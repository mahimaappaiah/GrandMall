import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Check, 
  X,
  Search,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { MOCK_STORES } from '../../data/mockData';
import { fetchStoresFromSupabase, createBrandInSupabase, recordAuditLog } from '../../services/supabaseService';
import { Store } from '../../types';

export const StoreManagementView: React.FC = () => {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newCategory, setNewCategory] = useState('Fashion');
  const [newFloor, setNewFloor] = useState('Ground Floor');
  const [newPackage, setNewPackage] = useState('Platinum Flagship');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetchStoresFromSupabase().then(res => {
      if (isMounted && res.data && res.data.length > 0) {
        setStores(res.data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;

    const newStore: any = {
      name: newStoreName,
      logo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop',
      category: newCategory,
      floor: newFloor,
      zone: 'Central Atrium',
      visitorsToday: 0,
      ordersCount: 0,
      reservationsCount: 0,
      conversionRate: 0,
      revenueToday: 0,
      status: 'Open',
      manager: 'New Boutique Manager',
      phone: '+91 98765 00000',
      openHours: '10:00 AM - 10:00 PM',
      rating: 4.8
    };

    const res = await createBrandInSupabase(newStore);
    const assignedId = res.data?.id || 'store-' + (stores.length + 1);
    const storeObj = { ...newStore, id: assignedId };

    setStores([storeObj, ...stores]);
    recordAuditLog('STORE_APPROVED', 'store', assignedId, { storeName: newStoreName, category: newCategory, floor: newFloor, package: newPackage });
    setShowRegisterModal(false);
    setNewStoreName('');
    showToast(`Store '${newStoreName}' registered & approved for ${newFloor}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Store Directory & Boutique Onboarding</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage tenant applications, package subscriptions, floor assignments, and operating hours</p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Store</span>
        </button>
      </div>

      {/* TIER PACKAGE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 space-y-2">
          <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Tier 1</span>
          <h3 className="font-bold text-slate-800 text-sm">Platinum Flagship</h3>
          <p className="text-xs text-slate-600">Top-tier atrium placement, priority ranking algorithm, unlimited fitting room bookings.</p>
          <div className="pt-2 text-xs font-bold text-indigo-700">₹75,000 / month • 12 Active Stores</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 space-y-2">
          <span className="bg-amber-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Tier 2</span>
          <h3 className="font-bold text-slate-800 text-sm">Gold Tier Boutique</h3>
          <p className="text-xs text-slate-600">Mid-floor placement, concierge order processing, category search priority.</p>
          <div className="pt-2 text-xs font-bold text-amber-700">₹45,000 / month • 24 Active Stores</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 space-y-2">
          <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Tier 3</span>
          <h3 className="font-bold text-slate-800 text-sm">Silver Retailer</h3>
          <p className="text-xs text-slate-600">Standard directory listing, QR code scan analytics, basic campaign features.</p>
          <div className="pt-2 text-xs font-bold text-emerald-700">₹25,000 / month • 18 Active Stores</div>
        </div>
      </div>

      {/* REGISTERED STORES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Store Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Floor & Zone</th>
                <th className="p-3.5">Manager Contact</th>
                <th className="p-3.5">Operating Hours</th>
                <th className="p-3.5">Package</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img src={store.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-50 border p-0.5" />
                      <span className="font-bold text-slate-800">{store.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">{store.category}</td>
                  <td className="p-3.5 font-medium">{store.floor} ({store.zone})</td>
                  <td className="p-3.5">{store.manager} ({store.phone})</td>
                  <td className="p-3.5">{store.openHours}</td>
                  <td className="p-3.5">
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      Platinum Flagship
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {store.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER STORE MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Register Tenant Boutique</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleRegisterStore} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  placeholder="e.g. Gucci Flagship"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Accessories">Accessories & Jewelry</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Floor</label>
                <select
                  value={newFloor}
                  onChange={e => setNewFloor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Ground Floor">Ground Floor Atrium</option>
                  <option value="1st Floor">1st Floor Fashion Wing</option>
                  <option value="2nd Floor">2nd Floor Dining</option>
                  <option value="3rd Floor">3rd Floor Multiplex</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tier Package</label>
                <select
                  value={newPackage}
                  onChange={e => setNewPackage(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Platinum Flagship">Platinum Flagship (₹75k/mo)</option>
                  <option value="Gold Tier">Gold Tier Boutique (₹45k/mo)</option>
                  <option value="Silver Boutique">Silver Retailer (₹25k/mo)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm"
                >
                  Approve & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
