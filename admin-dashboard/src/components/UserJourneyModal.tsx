import React, { useState, useEffect } from 'react';
import { X, Wifi, Smartphone, MapPin, Clock, ShieldCheck, Footprints, Ticket, Send, RefreshCw } from 'lucide-react';
import { ConnectedUser, CustomerJourney } from '../types';
import { fetchCustomerJourneyFromSupabase } from '../services/supabaseService';

interface UserJourneyModalProps {
  user: ConnectedUser | null;
  onClose: () => void;
}

export const UserJourneyModal: React.FC<UserJourneyModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const [dbJourney, setDbJourney] = useState<CustomerJourney[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const uid = user.user_id || user.id;
    if (uid) {
      setJourneyLoading(true);
      fetchCustomerJourneyFromSupabase(uid).then(res => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setDbJourney(res.data);
          }
          setJourneyLoading(false);
        }
      }).catch(() => {
        if (isMounted) setJourneyLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [user?.id, user?.user_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                {user.vipStatus && (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                    VIP Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{user.phone} • {user.macAddress}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Connection Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" /> Duration
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1">{user.sessionDuration}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Wifi className="w-3 h-3 text-blue-600" /> Data Used
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1">{user.dataUsed}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" /> Current Zone
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">{user.zone}</div>
            </div>
          </div>

          {/* Journey Footprint Timeline */}
          {(() => {
            const realStores = user.visitedStores.filter(s => s !== 'Wi-Fi Captive Portal');
            const totalCount = dbJourney.length > 0 ? dbJourney.length : realStores.length;

            return (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 font-extrabold">
                    <Footprints className="w-4 h-4 text-blue-600" /> In-Mall Footprint Trajectory
                  </span>
                  <span className="text-[11px] text-blue-600 font-extrabold">{totalCount} Stores Visited</span>
                </div>

                <div className="relative pl-6 border-l-2 border-blue-200 space-y-4 py-2">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                    <div className="text-xs font-extrabold text-slate-900">Wi-Fi Network Connected</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Authenticated via Captive Portal • AP-{user.zone || 'Ground Floor'}</div>
                  </div>

                  {journeyLoading ? (
                    <div className="text-xs text-slate-400 py-1 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> Loading trajectory...
                    </div>
                  ) : dbJourney.length > 0 ? (
                    dbJourney.map((j, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <div className="text-sm font-extrabold text-slate-900">{j.brands?.name || j.name || 'Store Visit'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Dwell: ~{Math.max(1, Math.round((j.duration_seconds || 600) / 60))} mins • {j.brands?.zone || j.brands?.floor || 'Main Mall'}
                        </div>
                      </div>
                    ))
                  ) : realStores.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-1">No tenant store visits recorded yet for this session.</div>
                  ) : (
                    realStores.map((store, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <div className="text-sm font-extrabold text-slate-900">{store}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Dwell time: ~{(idx + 1) * 10} mins • Visited Store Catalog & Concierge Offers</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* Target Push Offer Action */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-blue-600" /> Send Target Coupon
              </div>
              <div className="text-xs text-blue-700 mt-0.5">Push instant 15% discount SMS based on current location ({user.zone})</div>
            </div>
            <button
              onClick={() => alert(`Targeted push SMS sent to ${user.phone} for nearby offers in ${user.zone}!`)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Push SMS
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
