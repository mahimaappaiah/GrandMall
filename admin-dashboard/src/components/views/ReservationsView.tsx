import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Utensils,
  Sparkles,
  Plus,
  Download,
  X,
  Calendar as CalendarIcon,
  List,
  Sliders,
  UserX,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  UserCheck,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { MOCK_RESERVATIONS } from '../../data/mockData';
import { downloadReservationsCSV } from '../../utils/exportUtils';
import { Reservation } from '../../types';
import { fetchReservationsFromSupabase } from '../../services/supabaseService';

interface ReservationsViewProps {
  reservationsList?: Reservation[];
}

interface SlotCapacityMap {
  [storeName: string]: {
    default: number;
    [timeSlot: string]: number;
  };
}

interface WaitlistEntry {
  id: string;
  storeName: string;
  date: string;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  specialNotes?: string;
  status: 'Waiting' | 'Notified' | 'Booked';
  createdAt: string;
}

const STANDARD_TIME_SLOTS = ['12:00 PM', '14:00 PM', '16:00 PM', '17:00 PM', '18:30 PM', '20:00 PM', '21:30 PM'];
const STORES_LIST = [
  'All Stores',
  'Starbucks Reserve',
  'Häagen-Dazs',
  'Din Tai Fung',
  'PizzaExpress Gourmet',
  'Coffee Drama Cafe',
  'Subway Fresh Gourmet',
  'Nike Flagship',
  'Zara Flagship',
  'Zara Boutique',
  'Gucci Boutique',
  'Prada Atelier',
  'U.S. Polo Assn.',
  'H&M Flagship',
  'Rolex Boutique',
  'Louis Vuitton Maison',
  'Tiffany & Co.',
  'Cartier High Jewelry',
  'Apple Experience Store',
  'Ray-Ban Sunglass Hut',
  'Sephora Beauty',
  "PVR Director's Cut"
];

export const ReservationsView: React.FC<ReservationsViewProps> = ({ reservationsList = MOCK_RESERVATIONS }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'capacity' | 'waitlist'>('calendar');
  const [calendarMode, setCalendarMode] = useState<'week' | 'day'>('week');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [liveReservations, setLiveReservations] = useState<Reservation[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [slotCapacities, setSlotCapacities] = useState<SlotCapacityMap>({
    // Food & Dining
    'Starbucks Reserve': { default: 8, '16:00 PM': 8, '17:00 PM': 8, '18:30 PM': 6, '20:00 PM': 6 },
    'Häagen-Dazs': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6 },
    'Din Tai Fung': { default: 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6, '21:30 PM': 4 },
    'PizzaExpress Gourmet': { default: 8, '17:00 PM': 8, '18:30 PM': 8, '20:00 PM': 8 },
    'Coffee Drama Cafe': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6 },
    'Subway Fresh Gourmet': { default: 6, '12:00 PM': 6, '14:00 PM': 6, '17:00 PM': 6 },

    // Fashion & Apparel
    'Nike Flagship': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 3 },
    'Zara Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
    'Zara Boutique': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
    'Gucci Boutique': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Prada Atelier': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'U.S. Polo Assn.': { default: 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 4 },
    'H&M Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 5 },

    // Accessories, Watches & Luxury
    'Rolex Boutique': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
    'Louis Vuitton Maison': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Tiffany & Co.': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
    'Cartier High Jewelry': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
    'Apple Experience Store': { default: 6, '14:00 PM': 6, '16:00 PM': 6, '17:00 PM': 6 },
    'Ray-Ban Sunglass Hut': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
    'Sephora Beauty': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
    "PVR Director's Cut": { default: 10, '17:00 PM': 10, '20:00 PM': 10 }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [draggedResId, setDraggedResId] = useState<string | null>(null);

  // Date Navigation State (Today is Aug 19, 2026 or Current Date)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Form State for Create Reservation Modal
  const [newGuestName, setNewGuestName] = useState('yoshima');
  const [newGuestPhone, setNewGuestPhone] = useState('8495093170');
  const [newStoreName, setNewStoreName] = useState('Starbucks Reserve');
  const [newPartySize, setNewPartySize] = useState(2);
  const [newTimeSlot, setNewTimeSlot] = useState('17:00 PM');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSpecialNotes, setNewSpecialNotes] = useState('VIP Window Seat / Fitting Suite');

  // Capacity Form State
  const [selectedCapStore, setSelectedCapStore] = useState('Starbucks Reserve');
  const [editingCapacities, setEditingCapacities] = useState<{ [slot: string]: number }>({
    default: 8,
    '12:00 PM': 8,
    '14:00 PM': 8,
    '16:00 PM': 8,
    '17:00 PM': 8,
    '18:30 PM': 6,
    '20:00 PM': 6,
    '21:30 PM': 6
  });

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastNotice(msg);
    setToastType(type);
    setTimeout(() => setToastNotice(null), 4500);
  };

  // Helper to generate dates for current week view
  const getWeekDates = (offsetWeeks: number = 0) => {
    const today = new Date();
    const curr = new Date(today.getTime() + offsetWeeks * 7 * 24 * 60 * 60 * 1000);
    const firstDayOfWeek = curr.getDate() - curr.getDay() + 1; // Monday start
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(firstDayOfWeek + i));
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      week.push({ iso, dayName, dayNum, monthName, isToday: iso === today.toISOString().split('T')[0] });
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeekOffset);

  const fetchBackendData = async () => {
    let backendItems: any[] = [];
    let localItems: any[] = [];
    let supaItems: any[] = [];

    // 1. Fetch live reservations from backend
    try {
      const res = await fetch('http://localhost:5000/api/reservations');
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        backendItems = data.reservations;
      }
    } catch (e) {}

    // 2. Fetch capacities
    try {
      const capRes = await fetch('http://localhost:5000/api/reservations/capacity');
      const capData = await capRes.json();
      if (capData.success && capData.capacities) {
        setSlotCapacities(capData.capacities);
      }
    } catch (e) {}

    // 3. Fetch waitlist
    try {
      const wtRes = await fetch('http://localhost:5000/api/reservations/waitlist');
      const wtData = await wtRes.json();
      if (wtData.success && Array.isArray(wtData.waitlist)) {
        setWaitlistEntries(wtData.waitlist);
      }
    } catch (e) {}

    // 4. LocalStorage & Supabase fallback
    try {
      const local = JSON.parse(localStorage.getItem('axionix_reservations_list') || '[]');
      if (Array.isArray(local)) localItems = local;
    } catch (e) {}

    try {
      const supaRes = await fetchReservationsFromSupabase();
      if (supaRes.data && supaRes.isLive) supaItems = supaRes.data;
    } catch (e) {}

    const combined = [...backendItems, ...localItems, ...supaItems, ...reservationsList];
    const seenRefs = new Set();
    const seenIds = new Set();
    const seenSemanticKeys = new Set();
    const formatted: Reservation[] = [];

    for (const r of combined) {
      const storeName = r.storeName || r.venue || r.store_name || (r.brand ? r.brand.name : 'Starbucks Reserve');
      const guestName = r.guestName || r.user_name || r.guest_name || 'Valued Guest';
      const guestPhone = r.guestPhone || r.user_phone || r.guest_phone || '+91 84950 93170';
      const stableId = String(r.id || r.refCode || r.ref_code || '');
      const refCode = r.refCode || r.ref_code || (`RES-${storeName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()}-${stableId.replace(/\D/g, '').slice(-3) || '082'}`);
      const partySize = Number(r.partySize || r.guest_count || r.party_size || 2);
      const timeSlot = r.timeSlot || r.preferred_time || r.reservation_time || '17:00 PM';
      const date = r.date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
      const specialNotes = r.specialNotes || r.special_notes || r.specialRequest || r.special_request || 'Priority Suite / Dining';
      const resIdStr = String(r.id || refCode);
      const savedOverride = localStorage.getItem(`axionix_res_status_${resIdStr}`) || localStorage.getItem(`axionix_res_status_${refCode}`);
      const rawStatus = savedOverride || r.status || 'Confirmed';
      const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

      // Semantic deduplication key across guest, store, date, and slot
      const cleanDate = date === 'Today' ? new Date().toISOString().split('T')[0] : date;
      const cleanSlot = (timeSlot || '').replace(' PM', '').replace(' AM', '').trim();
      const semanticKey = `${guestName.toLowerCase().trim()}_${storeName.toLowerCase().trim()}_${cleanDate}_${cleanSlot}`;

      const isSeen = seenRefs.has(refCode) || (r.id && seenIds.has(String(r.id))) || seenSemanticKeys.has(semanticKey);

      if (!isSeen) {
        seenRefs.add(refCode);
        if (r.id) seenIds.add(String(r.id));
        seenSemanticKeys.add(semanticKey);

        formatted.push({
          id: String(r.id || `res-${Date.now()}-${Math.random()}`),
          refCode,
          guestName,
          guestPhone,
          storeName,
          partySize,
          timeSlot,
          date,
          specialNotes,
          specialRequest: specialNotes,
          status: status as any
        });
      }
    }

    setLiveReservations(formatted);
  };

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 2500);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://localhost:5000/api/realtime/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'NEW_RESERVATION' ||
            data.type === 'RESERVATION_CREATED' ||
            data.type === 'RESERVATION_STATUS_UPDATE' ||
            data.type === 'RESERVATION_NO_SHOW' ||
            data.type === 'RESERVATION_SLOT_FREED' ||
            data.type === 'WAITLIST_JOINED' ||
            data.type === 'WAITLIST_PROMOTED' ||
            data.type === 'RESERVATION_RESCHEDULED' ||
            data.type === 'CAPACITY_UPDATED'
          ) {
            fetchBackendData();
            if (data.type === 'WAITLIST_PROMOTED') {
              showToast(`🎉 Waitlist guest auto-notified: ${data.data?.guestName || 'Shopper'} (+91 ${data.data?.guestPhone})`, 'info');
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = (evt) => {
        if (evt.data && evt.data.type?.includes('RESERVATION')) {
          fetchBackendData();
        }
      };
    } catch (e) {}

    window.addEventListener('axionix_reservation_added', fetchBackendData);
    return () => {
      clearInterval(interval);
      eventSource?.close();
      bc?.close();
      window.removeEventListener('axionix_reservation_added', fetchBackendData);
    };
  }, []);

  // Sync editing capacities when store selection changes in capacity tab
  useEffect(() => {
    const storeCaps = slotCapacities[selectedCapStore] || { default: 6 };
    const merged: { [slot: string]: number } = { default: storeCaps.default || 6 };
    STANDARD_TIME_SLOTS.forEach(slot => {
      merged[slot] = storeCaps[slot] !== undefined ? storeCaps[slot] : (storeCaps.default || 6);
    });
    setEditingCapacities(merged);
  }, [selectedCapStore, slotCapacities]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = 'RES-' + newStoreName.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 899);

    const newResPayload: Reservation = {
      id: 'res-' + Date.now(),
      refCode,
      guestName: newGuestName || 'yoshima',
      guestPhone: newGuestPhone || '+91 84950 93170',
      storeName: newStoreName,
      partySize: Number(newPartySize || 2),
      timeSlot: newTimeSlot,
      date: newDate,
      specialNotes: newSpecialNotes,
      specialRequest: newSpecialNotes,
      status: 'Confirmed'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('axionix_reservations_list') || '[]');
      localStorage.setItem('axionix_reservations_list', JSON.stringify([newResPayload, ...existing]));
    } catch (e) {}

    try {
      await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResPayload)
      });
    } catch (e) {}

    setLiveReservations(prev => [newResPayload, ...prev]);
    setShowCreateModal(false);
    showToast(`Reservation ${refCode} created successfully!`);
  };

  const handleUpdateStatus = (resId: string, nextStatus: string) => {
    try {
      localStorage.setItem(`axionix_res_status_${resId}`, nextStatus);
    } catch (e) {}

    setLiveReservations(prev => prev.map(r => {
      if (r.id === resId || r.refCode === resId) {
        try {
          localStorage.setItem(`axionix_res_status_${r.refCode}`, nextStatus);
        } catch (e) {}
        return { ...r, status: nextStatus as any };
      }
      return r;
    }));

    showToast(`Reservation status updated to ${nextStatus}`);

    fetch(`http://localhost:5000/api/reservations/${resId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});
  };

  // Feature 08 — No-Show Action
  const handleMarkNoShow = async (resId: string, refCode: string, storeName: string, timeSlot: string) => {
    try {
      localStorage.setItem(`axionix_res_status_${resId}`, 'No Show');
      localStorage.setItem(`axionix_res_status_${refCode}`, 'No Show');
    } catch (e) {}

    setLiveReservations(prev => prev.map(r => (r.id === resId || r.refCode === resId ? { ...r, status: 'No Show' as any } : r)));

    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${resId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        if (data.waitlistNotified) {
          showToast(`❌ Marked ${refCode} as No-Show. Slot freed & auto-notified waitlist guest ${data.waitlistNotified.guestName}!`, 'warning');
        } else {
          showToast(`❌ Marked ${refCode} as No-Show. Slot ${timeSlot} at ${storeName} is now freed!`, 'warning');
        }
      }
    } catch (e) {
      showToast(`Marked ${refCode} as No-Show.`, 'warning');
    }
  };

  // Feature 08 — Drag and Drop Rescheduling
  const handleDragStart = (e: React.DragEvent, resId: string) => {
    e.dataTransfer.setData('text/plain', resId);
    setDraggedResId(resId);
  };

  const handleDropReschedule = async (targetDate: string, targetTimeSlot: string) => {
    setDragOverCell(null);
    if (!draggedResId) return;

    const targetRes = liveReservations.find(r => r.id === draggedResId || r.refCode === draggedResId);
    if (!targetRes) return;

    // Optimistic Update
    setLiveReservations(prev =>
      prev.map(r => (r.id === draggedResId || r.refCode === draggedResId ? { ...r, date: targetDate, timeSlot: targetTimeSlot } : r))
    );

    showToast(`📅 Rescheduled ${targetRes.refCode} to ${targetTimeSlot} on ${targetDate}`);

    try {
      await fetch(`http://localhost:5000/api/reservations/${draggedResId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: targetDate, timeSlot: targetTimeSlot })
      });
    } catch (e) {}

    setDraggedResId(null);
  };

  // Feature 08 — Save Capacity Settings
  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promises = Object.entries(editingCapacities).map(([slot, cap]) => {
        if (slot === 'default') {
          return fetch('http://localhost:5000/api/reservations/capacity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storeName: selectedCapStore, defaultCapacity: cap })
          });
        }
        return fetch('http://localhost:5000/api/reservations/capacity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storeName: selectedCapStore, timeSlot: slot, capacity: cap })
        });
      });
      await Promise.all(promises);
      showToast(`✅ Slot capacity limits saved for ${selectedCapStore}!`);
      fetchBackendData();
    } catch (err) {
      showToast('Error saving capacities', 'warning');
    }
  };

  // Feature 08 — Confirm Waitlist Entry
  const handleConfirmWaitlistEntry = async (entry: WaitlistEntry) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/waitlist/${entry.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Waitlisted guest ${entry.guestName} confirmed for ${entry.storeName} at ${entry.timeSlot}!`);
        fetchBackendData();
      }
    } catch (e) {
      showToast('Could not confirm waitlist entry', 'warning');
    }
  };

  const activeReservationsList = liveReservations.length > 0 ? liveReservations : reservationsList;

  const filteredReservations = activeReservationsList.filter(r => {
    const matchesSearch =
      (r.refCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.storeName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesStore = selectedStore === 'All Stores' || r.storeName === selectedStore;
    return matchesSearch && matchesStatus && matchesStore;
  });

  // Calculate Slot Capacity and Booked Count for a specific date and time slot
  const getSlotOccupancy = (storeName: string, dateStr: string, slotStr: string) => {
    const storeCaps = slotCapacities[storeName] || { default: 6 };
    const maxCap = storeCaps[slotStr] !== undefined ? storeCaps[slotStr] : (storeCaps.default || 6);

    const slotReservations = activeReservationsList.filter(r => {
      const matchesStore = storeName === 'All Stores' || r.storeName === storeName;
      const matchesDate = r.date === dateStr || (r.date === 'Today' && dateStr === new Date().toISOString().split('T')[0]);
      const cleanSlot = slotStr.replace(' PM', '').replace(' AM', '');
      const matchesSlot = (r.timeSlot || '').includes(cleanSlot) || r.timeSlot === slotStr;
      const isNotCancelled = r.status !== 'Cancelled' && r.status !== 'No Show';
      return matchesStore && matchesDate && matchesSlot && isNotCancelled;
    });

    const bookedCount = slotReservations.reduce((sum, r) => sum + (Number(r.partySize) || 1), 0);
    const available = Math.max(0, maxCap - bookedCount);
    const isFull = available <= 0;

    return { maxCap, bookedCount, available, isFull, reservations: slotReservations };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border animate-in slide-in-from-bottom-4 duration-200 ${
            toastType === 'warning'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : toastType === 'info'
              ? 'bg-indigo-900 text-indigo-100 border-indigo-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastType === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : toastType === 'info' ? (
            <BellRing className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span className="font-extrabold text-xs">{toastNotice}</span>
        </div>
      )}

      {/* HEADER CONTROLS & TAB SWITCHER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Main Mode Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar Grid View</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View ({filteredReservations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'capacity' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Slot Capacity Limits</span>
            </button>

            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${
                activeTab === 'waitlist' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Live Waitlist</span>
              {waitlistEntries.filter(w => w.status === 'Waiting').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-2" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => downloadReservationsCSV(filteredReservations)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              + New Reservation
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Ref Code, Guest Name, or Store..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Store Venue Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Venue:</span>
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {STORES_LIST.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-in">Checked-in</option>
                <option value="Completed">Completed</option>
                <option value="No Show">No Show</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CALENDAR GRID VIEW (FEATURE 08)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Header Navigation */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentWeekOffset(0)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {weekDates[0]?.monthName} {weekDates[0]?.dayNum} – {weekDates[6]?.monthName} {weekDates[6]?.dayNum}, 2026
                </h3>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <MoveHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Drag &amp; drop any reservation card between time slots to reschedule instantly</span>
                </p>
              </div>
            </div>

            {/* Week / Day View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              <button
                onClick={() => setCalendarMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  calendarMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Week Grid
              </button>
              <button
                onClick={() => setCalendarMode('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  calendarMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Day Grid
              </button>
            </div>
          </div>

          {/* WEEK GRID VIEW */}
          {calendarMode === 'week' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3.5 text-left text-[11px] font-black uppercase text-slate-400 w-28 border-r border-slate-200">
                        Time Slot
                      </th>
                      {weekDates.map(day => (
                        <th
                          key={day.iso}
                          className={`p-3.5 text-center text-xs font-extrabold border-r border-slate-200 last:border-r-0 ${
                            day.isToday ? 'bg-blue-50/70 text-blue-700' : 'text-slate-800'
                          }`}
                        >
                          <div className="uppercase text-[10px] tracking-wider text-slate-400 font-bold">{day.dayName}</div>
                          <div className="text-base font-black mt-0.5">
                            {day.monthName} {day.dayNum}
                          </div>
                          {day.isToday && (
                            <span className="inline-block mt-1 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              TODAY
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {STANDARD_TIME_SLOTS.map(slot => (
                      <tr key={slot} className="hover:bg-slate-50/40 transition-colors">
                        {/* Time Slot Label */}
                        <td className="p-3 bg-slate-50/60 font-black text-xs text-slate-700 border-r border-slate-200 align-top">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{slot}</span>
                          </div>
                        </td>

                        {/* Days Columns */}
                        {weekDates.map(day => {
                          const occupancy = getSlotOccupancy(selectedStore, day.iso, slot);
                          const cellId = `${day.iso}_${slot}`;
                          const isHovered = dragOverCell === cellId;

                          return (
                            <td
                              key={day.iso}
                              onDragOver={e => {
                                e.preventDefault();
                                setDragOverCell(cellId);
                              }}
                              onDragLeave={() => setDragOverCell(null)}
                              onDrop={e => {
                                e.preventDefault();
                                handleDropReschedule(day.iso, slot);
                              }}
                              className={`p-2 border-r border-slate-200 last:border-r-0 align-top min-w-[130px] transition-all ${
                                isHovered ? 'bg-blue-100/70 ring-2 ring-blue-500 ring-inset' : day.isToday ? 'bg-blue-50/20' : 'bg-white'
                              }`}
                            >
                              {/* Slot Capacity Meter */}
                              <div className="flex items-center justify-between mb-1.5 px-1 text-[10px] font-bold">
                                <span
                                  className={`px-1.5 py-0.5 rounded-md font-extrabold ${
                                    occupancy.isFull
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : occupancy.bookedCount > 0
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {occupancy.isFull ? 'FULL' : `${occupancy.bookedCount}/${occupancy.maxCap}`}
                                </span>
                                <span className="text-slate-400 font-mono text-[9px]">
                                  {occupancy.available} open
                                </span>
                              </div>

                              {/* Reservations Cards */}
                              <div className="space-y-1.5 min-h-[60px]">
                                {occupancy.reservations.map(res => (
                                  <div
                                    key={res.id}
                                    draggable
                                    onDragStart={e => handleDragStart(e, res.id)}
                                    className={`p-2 rounded-xl border text-xs shadow-xs transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                                      res.status === 'No Show'
                                        ? 'bg-rose-50 border-rose-200 text-rose-900 opacity-70'
                                        : res.status === 'Checked-in'
                                        ? 'bg-blue-50 border-blue-200 text-blue-950'
                                        : res.status === 'Completed'
                                        ? 'bg-purple-50 border-purple-200 text-purple-950'
                                        : 'bg-white border-slate-200 text-slate-900'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-slate-900 truncate max-w-[85px]">
                                        {res.guestName}
                                      </span>
                                      <span className="text-[10px] font-black text-blue-600 font-mono">
                                        x{res.partySize}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                                      {res.storeName}
                                    </div>

                                    {/* Action Buttons inside Card */}
                                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                                          res.status === 'Checked-in'
                                            ? 'bg-blue-200/60 text-blue-800'
                                            : res.status === 'Confirmed'
                                            ? 'bg-emerald-200/60 text-emerald-800'
                                            : res.status === 'No Show'
                                            ? 'bg-rose-200/60 text-rose-800'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {res.status}
                                      </span>

                                      {res.status === 'Confirmed' && (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleUpdateStatus(res.id, 'Checked-in')}
                                            title="Check-In Guest"
                                            className="p-1 hover:bg-blue-100 text-blue-700 rounded-md cursor-pointer transition-colors"
                                          >
                                            <UserCheck className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleMarkNoShow(res.id, res.refCode, res.storeName, res.timeSlot)}
                                            title="Mark No-Show & Free Slot"
                                            className="p-1 hover:bg-rose-100 text-rose-600 rounded-md cursor-pointer transition-colors"
                                          >
                                            <UserX className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {occupancy.reservations.length === 0 && (
                                  <div className="h-full border border-dashed border-slate-200/80 rounded-xl flex items-center justify-center p-2 text-[10px] text-slate-300 font-medium">
                                    Drop here
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DAY GRID VIEW */}
          {calendarMode === 'day' && (
            <div className="space-y-4">
              {/* Day Selector Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {weekDates.map((day, idx) => (
                  <button
                    key={day.iso}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      selectedDayIndex === idx
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{day.dayName}, {day.monthName} {day.dayNum}</span>
                    {day.isToday && <span className="bg-white/30 text-white text-[9px] px-1.5 rounded-full font-black">TODAY</span>}
                  </button>
                ))}
              </div>

              {/* Day Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STANDARD_TIME_SLOTS.map(slot => {
                  const targetDay = weekDates[selectedDayIndex] || weekDates[0];
                  const occupancy = getSlotOccupancy(selectedStore, targetDay.iso, slot);
                  const cellId = `${targetDay.iso}_${slot}`;

                  return (
                    <div
                      key={slot}
                      onDragOver={e => {
                        e.preventDefault();
                        setDragOverCell(cellId);
                      }}
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={e => {
                        e.preventDefault();
                        handleDropReschedule(targetDay.iso, slot);
                      }}
                      className={`bg-white rounded-3xl p-5 border transition-all ${
                        dragOverCell === cellId
                          ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/50'
                          : 'border-slate-200/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2 font-black text-slate-900 text-sm">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{slot}</span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            occupancy.isFull
                              ? 'bg-rose-100 text-rose-800'
                              : occupancy.bookedCount > 0
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {occupancy.isFull ? 'FULL' : `${occupancy.bookedCount} / ${occupancy.maxCap} Booked`}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {occupancy.reservations.length > 0 ? (
                          occupancy.reservations.map(res => (
                            <div
                              key={res.id}
                              draggable
                              onDragStart={e => handleDragStart(e, res.id)}
                              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition-all"
                            >
                              <div>
                                <div className="font-extrabold text-slate-900">{res.guestName}</div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {res.storeName} • {res.partySize} Guests • <span className="font-mono text-blue-600 font-bold">{res.refCode}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                {res.status === 'Confirmed' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(res.id, 'Checked-in')}
                                      className="px-2 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                                    >
                                      Check In
                                    </button>
                                    <button
                                      onClick={() => handleMarkNoShow(res.id, res.refCode, res.storeName, res.timeSlot)}
                                      className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-[10px] cursor-pointer hover:bg-rose-100"
                                    >
                                      No Show
                                    </button>
                                  </>
                                )}
                                {res.status === 'Checked-in' && (
                                  <button
                                    onClick={() => handleUpdateStatus(res.id, 'Completed')}
                                    className="px-2 py-1 bg-purple-600 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                            No reservations for this time slot.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIST VIEW & NO-SHOW ACTIONS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Ref Code</th>
                  <th className="px-5 py-4">Guest Details</th>
                  <th className="px-5 py-4">Venue / Store</th>
                  <th className="px-5 py-4">Party Size</th>
                  <th className="px-5 py-4">Reserved Slot</th>
                  <th className="px-5 py-4">Special Notes</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-xs font-medium">
                      No reservations match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-black text-blue-600 text-xs">
                        {res.refCode}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900">{res.guestName}</div>
                        <div className="text-xs text-slate-400 font-normal">{res.guestPhone}</div>
                      </td>

                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        {res.storeName}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-900">
                        {res.partySize} {res.partySize === 1 ? 'Guest' : 'Guests'}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        <div className="font-extrabold">{res.timeSlot}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{res.date || 'Today'}</div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 italic max-w-xs truncate">
                        {res.specialNotes || res.specialRequest || 'Priority Suite / Dining'}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                            res.status === 'Checked-in'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : res.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : res.status === 'Completed'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : res.status === 'No Show'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'Confirmed' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'Checked-in')}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs text-[11px] cursor-pointer"
                              >
                                Check-In
                              </button>
                              <button
                                onClick={() => handleMarkNoShow(res.id, res.refCode, res.storeName, res.timeSlot)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-all text-[11px] cursor-pointer"
                              >
                                Mark No-Show
                              </button>
                            </>
                          )}
                          {res.status === 'Checked-in' && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'Completed')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-xs text-[11px] cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                          {res.status === 'Completed' && (
                            <span className="text-emerald-600 font-extrabold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                          {res.status === 'No Show' && (
                            <span className="text-rose-600 font-extrabold text-xs inline-flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5" /> Slot Freed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SLOT CAPACITY MANAGEMENT (FEATURE 08)                              */}
      {/* ========================================================================= */}
      {activeTab === 'capacity' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900">Store Slot Capacity &amp; Table Limit Management</h3>
              <p className="text-xs text-slate-500 font-medium">Configure maximum table / fitting suite bookings allowed per time slot for each brand venue.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Select Store:</span>
              <select
                value={selectedCapStore}
                onChange={e => setSelectedCapStore(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer"
              >
                {STORES_LIST.filter(s => s !== 'All Stores').map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSaveCapacity} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-800 block">Default Capacity per Slot</span>
                <span className="text-[11px] text-slate-500">Applies to any unconfigured time window</span>
              </div>
              <input
                type="number"
                min={1}
                max={50}
                value={editingCapacities.default || 6}
                onChange={e => setEditingCapacities(prev => ({ ...prev, default: Number(e.target.value) }))}
                className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-center text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {STANDARD_TIME_SLOTS.map(slot => (
                <div key={slot} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{slot}</span>
                    <span className="text-[10px] text-blue-600 font-bold">Max Tables</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={editingCapacities[slot] !== undefined ? editingCapacities[slot] : (editingCapacities.default || 6)}
                    onChange={e => setEditingCapacities(prev => ({ ...prev, [slot]: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 text-center font-medium">e.g. Starbucks max {editingCapacities[slot] || 8} tables</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 cursor-pointer active:scale-98 transition-all"
              >
                SAVE SLOT CAPACITIES FOR {selectedCapStore.toUpperCase()}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE WAITLIST QUEUE (FEATURE 08)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Live Reservation Waitlist Queue</h3>
              <p className="text-xs text-slate-500 font-medium">Guests waiting for fully booked slots. When an admin marks a no-show or cancels, waitlisted guests are automatically notified via SSE.</p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1.5 rounded-full border border-amber-200">
              {waitlistEntries.filter(w => w.status === 'Waiting').length} Guests in Queue
            </span>
          </div>

          <div className="space-y-3">
            {waitlistEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No guests are currently on the waitlist.
              </div>
            ) : (
              waitlistEntries.map((w, idx) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 font-black text-sm flex items-center justify-center border border-amber-400/20">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{w.guestName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            w.status === 'Notified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : w.status === 'Booked'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {w.storeName} • {w.timeSlot} • {w.partySize} Guests • {w.guestPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.status !== 'Booked' && (
                      <button
                        onClick={() => handleConfirmWaitlistEntry(w)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Confirm Booking
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE RESERVATION MODAL                                                  */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Create New Reservation</h3>
                <p className="text-xs text-slate-500">Book table or VIP fitting suite for guest</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={e => setNewGuestName(e.target.value)}
                  placeholder="e.g. yoshima"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={newGuestPhone}
                  onChange={e => setNewGuestPhone(e.target.value)}
                  placeholder="e.g. 8495093170"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Store</label>
                <select
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  {STORES_LIST.filter(s => s !== 'All Stores').map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newPartySize}
                    onChange={e => setNewPartySize(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={newTimeSlot}
                  onChange={e => setNewTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  {STANDARD_TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Notes / Requests</label>
                <input
                  type="text"
                  value={newSpecialNotes}
                  onChange={e => setNewSpecialNotes(e.target.value)}
                  placeholder="e.g. Quiet window seat near outlet"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition active:scale-98 cursor-pointer"
              >
                CONFIRM &amp; CREATE RESERVATION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
