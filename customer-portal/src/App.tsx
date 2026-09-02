import React, { useState, useEffect, useRef } from 'react';
import { Wifi, ShoppingBag, ArrowLeft, ArrowRight, Check, CreditCard, ChevronRight, Search, MapPin, X, CheckCircle2, ShieldCheck, Phone, User, Mail, Calendar, Clock, Menu, LogOut, Trash2, Plus, Minus, Ticket, Tag, AlertCircle, Bot, Sparkles, QrCode, Award, Key, Printer, Download, FileText, Wallet, PlusCircle, Users, Zap, BellRing, Hourglass, Layers, XCircle } from 'lucide-react';
import { BrandLogo, BrandBanner } from './BrandLogo';
import {
  authenticateOrGetCustomerProfile,
  fetchBrandsFromSupabase,
  fetchProductsFromSupabase,
  fetchCouponsFromSupabase,
  validateCouponInSupabase,
  createOrderInSupabase,
  createReservationInSupabase,
  cancelReservationInSupabase,
  fetchReservationAvailability,
  joinReservationWaitlist,
  redeemCouponInSupabase,
  recordWifiSessionInSupabase,
  disconnectWifiSessionInSupabase,
  recordStoreVisitInSupabase,
  fetchLoyaltyAccount,
  earnLoyaltyPoints,
  redeemLoyaltyPoints,
  getMallWallet,
  topUpMallWallet,
  deductMallWallet,
  addFamilyMemberToWallet,
  CustomerProfile,
  MallWalletData
} from './services/supabaseService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { BACKEND_URL } from './lib/config';

const API_BASE = BACKEND_URL;
const REGISTERED_USERS_KEY = 'axionix_registered_users';

interface BrandItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  sizes?: string[];
}

interface Brand {
  id: string;
  name: string;
  logoVariant?: string;
  logoImg?: string;
  category: string;
  subTags: string[];
  floor: string;
  zone: string;
  visitorsToday: number;
  ordersCount: number;
  reservationsCount: number;
  conversionRate: number;
  revenueToday: number;
  status: string;
  manager: string;
  phone: string;
  openHours: string;
  rating: number;
  logo: string;
  initials: string;
  initialsBg: string;
  tag: string;
  subtitle: string;
  images: string[];
  items: BrandItem[];
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  storeName: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minCartTotal?: number;
}

const PRELOADED_COUPONS: Coupon[] = [
  { id: 'cpn-1', code: 'NIKEVIP15', title: '15% Off Nike Apparel & Shoes', discount: '15% OFF', storeName: 'Nike Flagship', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-2', code: 'ZARASUMMER10', title: '10% Off Zara Summer Collection', discount: '10% OFF', storeName: 'Zara Flagship', discountType: 'percentage', discountValue: 10, minCartTotal: 0 },
  { id: 'cpn-3', code: 'GUCCIEXCLUSIVE', title: 'Flat ₹10,000 Off Luxury Orders', discount: '₹10,000 OFF', storeName: 'Gucci Boutique', discountType: 'flat', discountValue: 10000, minCartTotal: 0 },
  { id: 'cpn-4', code: 'PRADAVIP15', title: '15% Off Prada Haute Couture', discount: '15% OFF', storeName: 'Prada Atelier', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-5', code: 'USPOLOVIP20', title: '20% Off U.S. Polo Heritage Collection', discount: '20% OFF', storeName: 'U.S. Polo Assn.', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-6', code: 'HMESSENTIALS20', title: '20% Off H&M Modern Apparel', discount: '20% OFF', storeName: 'H&M Everyday Fashion', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-7', code: 'STARBUCKSFREE', title: 'Flat ₹300 Off Starbucks Brunch', discount: '₹300 OFF', storeName: 'Starbucks Reserve', discountType: 'flat', discountValue: 300, minCartTotal: 0 },
  { id: 'cpn-8', code: 'DINTAIFUNG20', title: '20% Off Asian Fine Dining', discount: '20% OFF', storeName: 'Din Tai Fung', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-9', code: 'PIZZAEXPRESS15', title: '15% Off PizzaExpress Gourmet Dining', discount: '15% OFF', storeName: 'PizzaExpress Gourmet', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-10', code: 'COFFEEDAY100', title: 'Flat ₹100 Off Artisanal Coffee & Bakery', discount: '₹100 OFF', storeName: 'Coffee Day', discountType: 'flat', discountValue: 100, minCartTotal: 0 },
  { id: 'cpn-11', code: 'SUBWAYFRESH15', title: '15% Off Subway Fresh Subs & Combos', discount: '15% OFF', storeName: 'Subway Fresh Gourmet', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-12', code: 'HAAGEN20', title: '20% Off Gourmet Ice Cream & Waffles', discount: '20% OFF', storeName: 'Häagen-Dazs', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-13', code: 'LVMAISON10', title: '10% Off LV Monogram Leather & Bags', discount: '10% OFF', storeName: 'Louis Vuitton Maison', discountType: 'percentage', discountValue: 10, minCartTotal: 0 },
  { id: 'cpn-14', code: 'HERMESLUX10', title: '10% Off Hermès Leather & Birkin', discount: '10% OFF', storeName: 'Hermès Leather Lounge', discountType: 'percentage', discountValue: 10, minCartTotal: 0 },
  { id: 'cpn-15', code: 'COACHNEWYORK20', title: '20% Off Coach Leather Bags & Totes', discount: '20% OFF', storeName: 'Coach New York', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-16', code: 'BOTTEGAVIP15', title: '15% Off Intrecciato Woven Leather', discount: '15% OFF', storeName: 'Bottega Veneta', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-17', code: 'TIFFANYDIAMOND', title: 'Flat ₹15,000 Off Fine Jewelry', discount: '₹15,000 OFF', storeName: 'Tiffany & Co.', discountType: 'flat', discountValue: 15000, minCartTotal: 0 },
  { id: 'cpn-18', code: 'CARTIERLUX20', title: 'Flat ₹20,000 Off Diamond Jewelry', discount: '₹20,000 OFF', storeName: 'Cartier High Jewelry', discountType: 'flat', discountValue: 20000, minCartTotal: 0 },
  { id: 'cpn-19', code: 'BVLGARI25', title: 'Flat ₹25,000 Off Serpenti & B.zero1', discount: '₹25,000 OFF', storeName: 'Bvlgari Haute Joaillerie', discountType: 'flat', discountValue: 25000, minCartTotal: 0 },
  { id: 'cpn-20', code: 'SWAROVSKI20', title: '20% Off Crystal Jewelry & Sets', discount: '20% OFF', storeName: 'Swarovski Crystal Pavilion', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-21', code: 'TANISHQGOLD', title: 'Flat ₹10,000 Off Kundan & 22k Gold', discount: '₹10,000 OFF', storeName: 'Tanishq Royal Heritage', discountType: 'flat', discountValue: 10000, minCartTotal: 0 },
  { id: 'cpn-22', code: 'MALABARVIP', title: 'Flat ₹12,000 Off Solitaire Diamonds', discount: '₹12,000 OFF', storeName: 'Malabar Gold & Diamonds', discountType: 'flat', discountValue: 12000, minCartTotal: 0 },
  { id: 'cpn-23', code: 'RAYBAN20', title: '20% Off Designer Eyewear', discount: '20% OFF', storeName: 'Ray-Ban Sunglass Hut', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-24', code: 'SUNGLASSHUT15', title: '15% Off Versace & Designer Shades', discount: '15% OFF', storeName: 'Sunglass Hut Premier', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-25', code: 'OAKLEYSPORT20', title: '20% Off Polarized & Prizm Vision', discount: '20% OFF', storeName: 'Oakley Performance Vision', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-26', code: 'TOMFORDVIP', title: 'Flat ₹5,000 Off Luxury Eyewear', discount: '₹5,000 OFF', storeName: 'Tom Ford Eyewear', discountType: 'flat', discountValue: 5000, minCartTotal: 0 },
  { id: 'cpn-27', code: 'LENSKART500', title: 'Flat ₹500 Off John Jacobs Titanium', discount: '₹500 OFF', storeName: 'Lenskart Gold Lounge', discountType: 'flat', discountValue: 500, minCartTotal: 0 },
  { id: 'cpn-28', code: 'ROLEX5000', title: 'Flat ₹5,000 Off Luxury Timepieces', discount: '₹5,000 OFF', storeName: 'Rolex Boutique', discountType: 'flat', discountValue: 5000, minCartTotal: 0 },
  { id: 'cpn-29', code: 'OMEGACHRONO', title: 'Flat ₹15,000 Off Speedmaster & Seamaster', discount: '₹15,000 OFF', storeName: 'Omega Watch Atelier', discountType: 'flat', discountValue: 15000, minCartTotal: 0 },
  { id: 'cpn-30', code: 'TAGHEUERVIP', title: 'Flat ₹10,000 Off Carrera Chronographs', discount: '₹10,000 OFF', storeName: 'TAG Heuer Flagship', discountType: 'flat', discountValue: 10000, minCartTotal: 0 },
  { id: 'cpn-31', code: 'APPLEVIP5', title: 'Flat ₹5,000 Off Apple Watch & Vision', discount: '₹5,000 OFF', storeName: 'Apple Experience Store', discountType: 'flat', discountValue: 5000, minCartTotal: 0 },
  { id: 'cpn-32', code: 'TISSOTSWISS', title: '15% Off Tissot PRX Powermatic 80', discount: '15% OFF', storeName: 'Tissot Swiss Watches', discountType: 'percentage', discountValue: 15, minCartTotal: 0 },
  { id: 'cpn-33', code: 'NEBULA18K', title: 'Flat ₹20,000 Off 18k Solid Gold Watches', discount: '₹20,000 OFF', storeName: 'Titan Nebula Gold Watches', discountType: 'flat', discountValue: 20000, minCartTotal: 0 },
  { id: 'cpn-34', code: 'GRANDMALL20', title: '20% Off Concierge First Order', discount: '20% OFF', storeName: 'The Grand Mall', discountType: 'percentage', discountValue: 20, minCartTotal: 0 },
  { id: 'cpn-35', code: 'MALLVIP25', title: 'Flat 25% Off VIP Mall Shopping', discount: '25% OFF', storeName: 'The Grand Mall', discountType: 'percentage', discountValue: 25, minCartTotal: 0 }
];

const MASTER_BRANDS: Brand[] = [
  // --------------------------------------------------------------------------
  // FOOD & DINING (6 CAFES & RESTAURANTS) - All support Brunch, Quick Bites, Fine Dining
  // --------------------------------------------------------------------------
  {
    id: 'food-1',
    name: 'Starbucks Reserve',
    logoVariant: 'starbucks',
    logoImg: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Brunch', 'Quick Bites', 'Fine Dining'],
    floor: 'Ground Floor',
    zone: 'East Wing',
    visitorsToday: 950,
    ordersCount: 420,
    reservationsCount: 15,
    conversionRate: 65.0,
    revenueToday: 480000,
    status: 'Open',
    manager: 'Ananya Sharma',
    phone: '+91 98555 66778',
    openHours: '08:00 AM - 11:00 PM',
    rating: 4.8,
    logo: '☕',
    initials: 'SB',
    initialsBg: 'bg-emerald-900',
    tag: 'Artisan Cafe',
    subtitle: 'Brunch & Artisan Coffee Lounge',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'sb-1', name: 'Avocado Artisan Toast & Poached Eggs', price: 650, category: 'Brunch', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80', sizes: ['Single Portion', 'Double Platter'] },
      { id: 'sb-2', name: 'Artisan Cold Brew & Butter Croissant', price: 520, category: 'Brunch', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80', sizes: ['Tall (354ml)', 'Grande (473ml)', 'Venti (591ml)'] },
      { id: 'sb-3', name: 'Iced Caramel Macchiato Reserve', price: 475, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80', sizes: ['Tall (354ml)', 'Grande (473ml)', 'Venti (591ml)'] },
      { id: 'sb-4', name: 'Smoked Salmon Bagel Cream Cheese', price: 720, category: 'Brunch', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80', sizes: ['Regular Bagel', 'Large Platter'] },
      { id: 'sb-5', name: 'Reserve Truffle Mushroom Sourdough', price: 850, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', sizes: ['Chef Signature Platter'] }
    ]
  },
  {
    id: 'food-2',
    name: 'Häagen-Dazs',
    logoVariant: 'haagen',
    logoImg: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Quick Bites', 'Brunch', 'Fine Dining'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 820,
    ordersCount: 340,
    reservationsCount: 8,
    conversionRate: 52.0,
    revenueToday: 198000,
    status: 'Open',
    manager: 'Rahul K.',
    phone: '+91 98222 11990',
    openHours: '10:00 AM - 11:00 PM',
    rating: 4.7,
    logo: '🍨',
    initials: 'HD',
    initialsBg: 'bg-rose-900',
    tag: 'Dessert Lounge',
    subtitle: 'Belgian Chocolate & Artisanal Ice Cream',
    images: [
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'hd-1', name: 'Belgian Chocolate Fondue Platter', price: 950, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80', sizes: ['Mini Dip', 'Sharing Platter'] },
      { id: 'hd-2', name: 'Dulce de Leche Caramel Sundae', price: 620, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80', sizes: ['Single Scoop', 'Double Scoop', 'Triple Sundae'] },
      { id: 'hd-3', name: 'Belgian Waffle & Berry Brunch Bowl', price: 680, category: 'Brunch', image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=400&q=80', sizes: ['Single Waffle', 'Double Belgian Waffle'] },
      { id: 'hd-4', name: 'Grand Degustation Dessert Tasting Platter', price: 1250, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80', sizes: ['Gourmet 4-Course Tasting'] }
    ]
  },
  {
    id: 'food-3',
    name: 'Din Tai Fung',
    logoVariant: 'dintaifung',
    logoImg: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Fine Dining', 'Brunch', 'Quick Bites'],
    floor: '2nd Floor',
    zone: 'Dining Hub North',
    visitorsToday: 680,
    ordersCount: 290,
    reservationsCount: 28,
    conversionRate: 48.0,
    revenueToday: 1280000,
    status: 'Open',
    manager: 'Chen Wei',
    phone: '+91 98111 99887',
    openHours: '11:00 AM - 10:30 PM',
    rating: 4.9,
    logo: '🥟',
    initials: 'DT',
    initialsBg: 'bg-amber-900',
    tag: 'Fine Dining',
    subtitle: 'Asian Dim Sum & Fine Dining',
    images: [
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'dt-1', name: 'Signature Pork Xiao Long Bao', price: 850, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80', sizes: ['6 Pcs', '10 Pcs', '12 Pcs Deluxe'] },
      { id: 'dt-2', name: 'Spicy Sesame Sichuan Noodles', price: 590, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', sizes: ['Regular', 'Large Bowl'] },
      { id: 'dt-3', name: 'Shrimp & Egg Fried Rice', price: 690, category: 'Brunch', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80', sizes: ['Regular Bowl', 'Share Platter'] },
      { id: 'dt-4', name: 'Steamed Vegetable Dumplings', price: 420, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=400&q=80', sizes: ['4 Pcs Express', '8 Pcs'] }
    ]
  },
  {
    id: 'food-4',
    name: 'PizzaExpress Gourmet',
    logoVariant: 'pizzaexpress',
    logoImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Fine Dining', 'Quick Bites', 'Brunch'],
    floor: '2nd Floor',
    zone: 'Food Court South',
    visitorsToday: 610,
    ordersCount: 220,
    reservationsCount: 14,
    conversionRate: 41.5,
    revenueToday: 620000,
    status: 'Open',
    manager: 'Marco Rossi',
    phone: '+91 98333 77112',
    openHours: '11:00 AM - 11:00 PM',
    rating: 4.7,
    logo: '🍕',
    initials: 'PE',
    initialsBg: 'bg-red-900',
    tag: 'Gourmet Pizzeria',
    subtitle: 'Artisanal Woodfired Italian Pizza',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'pe-1', name: 'Calabrese Spicy Artisanal Pizza', price: 890, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', sizes: ['Classic 10"', 'Romana 14"'] },
      { id: 'pe-2', name: 'Dough Balls Doppio Garlic Butter', price: 420, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80', sizes: ['Single 6 Pcs', 'Double 12 Pcs'] },
      { id: 'pe-3', name: 'Classic Margherita Romana', price: 690, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80', sizes: ['Classic 10"', 'Romana 14"'] },
      { id: 'pe-4', name: 'Italian Breakfast Panini Brunch', price: 540, category: 'Brunch', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80', sizes: ['Standard Panini', 'Panini Combo with Coffee'] }
    ]
  },
  {
    id: 'food-5',
    name: 'Coffee Drama Cafe',
    logoVariant: 'coffeedrama',
    logoImg: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Brunch', 'Quick Bites', 'Fine Dining'],
    floor: '2nd Floor',
    zone: 'Dining Hub North',
    visitorsToday: 540,
    ordersCount: 195,
    reservationsCount: 6,
    conversionRate: 39.0,
    revenueToday: 390000,
    status: 'Open',
    manager: 'Siddharth M.',
    phone: '+91 98495 09317',
    openHours: '09:00 AM - 10:30 PM',
    rating: 4.8,
    logo: '☕',
    initials: 'CD',
    initialsBg: 'bg-amber-950',
    tag: 'Artisan Cafe',
    subtitle: 'Specialty Espresso & Sourdough Bakery',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'cd-1', name: 'Artisanal Cortado Coffee', price: 380, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80', sizes: ['Single Shot (120ml)', 'Double Shot (180ml)'] },
      { id: 'cd-2', name: 'Sourdough Avocado Toast & Seeds', price: 580, category: 'Brunch', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80', sizes: ['1 Slice', '2 Slices'] },
      { id: 'cd-3', name: 'Cinnamon Sugar Bakery Roll', price: 320, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', sizes: ['Single Roll', 'Pack of 3'] },
      { id: 'cd-4', name: 'Chef Special Smoked Duck & Truffle Benedict', price: 890, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=400&q=80', sizes: ['Chef Course'] }
    ]
  },
  {
    id: 'food-6',
    name: 'Subway Fresh Gourmet',
    logoVariant: 'subway',
    logoImg: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Food',
    subTags: ['Quick Bites', 'Brunch', 'Fine Dining'],
    floor: '2nd Floor',
    zone: 'Food Court South',
    visitorsToday: 710,
    ordersCount: 310,
    reservationsCount: 0,
    conversionRate: 46.2,
    revenueToday: 280000,
    status: 'Open',
    manager: 'Vikram S.',
    phone: '+91 98888 12345',
    openHours: '10:00 AM - 11:00 PM',
    rating: 4.6,
    logo: '🥪',
    initials: 'SG',
    initialsBg: 'bg-emerald-800',
    tag: 'Quick Service',
    subtitle: 'Fresh Subs, Salads & Wraps',
    images: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'sw-1', name: 'Italian B.M.T. Sub', price: 450, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=80', sizes: ['6 Inch', 'Footlong 12 Inch'] },
      { id: 'sw-2', name: 'Egg & Roasted Chicken Morning Wrap', price: 380, category: 'Brunch', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', sizes: ['Standard Wrap', 'Double Protein Wrap'] },
      { id: 'sw-3', name: 'Triple Chocolate Cookie Delight Box', price: 290, category: 'Quick Bites', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80', sizes: ['3 Cookies', '6 Cookies'] },
      { id: 'sw-4', name: 'Gourmet Steak & Cheese Signature Platter', price: 790, category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80', sizes: ['Deluxe Gourmet Platter'] }
    ]
  },

  // --------------------------------------------------------------------------
  // FASHION & APPAREL (6 STORES) - All support T-Shirts, Shirts, Hoodies, Pants, Shoes
  // --------------------------------------------------------------------------
  {
    id: 'fashion-1',
    name: 'Nike Flagship',
    logoVariant: 'nike',
    logoImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shoes', 'Hoodies', 'T-Shirts', 'Shirts', 'Pants', 'Trending'],
    floor: '1st Floor',
    zone: 'North Wing',
    visitorsToday: 640,
    ordersCount: 185,
    reservationsCount: 12,
    conversionRate: 42.1,
    revenueToday: 845000,
    status: 'Open',
    manager: 'Marcus Vance',
    phone: '+91 98222 33445',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '👟',
    initials: 'NF',
    initialsBg: 'bg-slate-900',
    tag: 'Trend Fashion',
    subtitle: 'Athletic Shoes, Hoodies & Apparel',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'nk-1', name: 'Air Jordan 1 Retro High OG', price: 16995, category: 'Shoes', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] },
      { id: 'nk-2', name: 'Nike Air Max 270 React Sneakers', price: 13495, category: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] },
      { id: 'nk-3', name: 'Tech Fleece Oversized Hoodie', price: 8995, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'nk-4', name: 'Dri-FIT Athletic Training T-Shirt', price: 2995, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'nk-5', name: 'Nike Sportswear Warmup Button Shirt', price: 4995, category: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'nk-6', name: 'Tech Fleece Slim Tapered Joggers', price: 7495, category: 'Pants', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] }
    ]
  },
  {
    id: 'fashion-2',
    name: 'Zara Flagship',
    logoVariant: 'zara',
    logoImg: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shirts', 'Hoodies', 'T-Shirts', 'Pants', 'Shoes', 'Trending'],
    floor: '1st Floor',
    zone: 'South Wing',
    visitorsToday: 720,
    ordersCount: 210,
    reservationsCount: 6,
    conversionRate: 34.2,
    revenueToday: 620000,
    status: 'Open',
    manager: 'Elena Rostova',
    phone: '+91 98444 55667',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.6,
    logo: '👗',
    initials: 'ZF',
    initialsBg: 'bg-zinc-900',
    tag: 'Trend Fashion',
    subtitle: 'Trending Shirts, Hoodies & Footwear',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'zr-1', name: 'Casual Regular Fit Linen Shirt', price: 3590, category: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'zr-2', name: 'Heavyweight Unisex Fleece Hoodie', price: 4990, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'zr-3', name: 'Basic Heavy Cotton Crewneck T-Shirt', price: 1990, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'zr-4', name: 'Tailored Straight Fit Trousers', price: 4590, category: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'zr-5', name: 'Chunky Sole Leather Derby Shoes', price: 6990, category: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] }
    ]
  },
  {
    id: 'fashion-3',
    name: 'Gucci Boutique',
    logoVariant: 'gucci',
    logoImg: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shirts', 'Hoodies', 'T-Shirts', 'Shoes', 'Pants', 'Trending'],
    floor: 'Ground Floor',
    zone: 'North Wing',
    visitorsToday: 210,
    ordersCount: 18,
    reservationsCount: 14,
    conversionRate: 22.0,
    revenueToday: 2150000,
    status: 'Open',
    manager: 'Fabrizio Rossi',
    phone: '+91 98666 77889',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '👜',
    initials: 'GB',
    initialsBg: 'bg-emerald-950',
    tag: 'Haute Couture',
    subtitle: 'Luxury Hoodies, Shoes, Shirts & Leather',
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'gc-1', name: 'Silk Web Stripe Bowling Shirt', price: 98000, category: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'gc-2', name: 'Gucci Logo Print Heavyweight Hoodie', price: 115000, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'gc-3', name: 'GG Monogram Cotton Crew T-Shirt', price: 48000, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'gc-4', name: 'GG Jacquard Tailored Formal Pants', price: 88000, category: 'Pants', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'gc-5', name: 'Princetown Leather Slippers & Shoes', price: 75000, category: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80', sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9'] }
    ]
  },
  {
    id: 'fashion-4',
    name: 'Prada Atelier',
    logoVariant: 'prada',
    logoImg: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shirts', 'Hoodies', 'T-Shirts', 'Pants', 'Shoes', 'Trending'],
    floor: 'Ground Floor',
    zone: 'South Wing',
    visitorsToday: 205,
    ordersCount: 14,
    reservationsCount: 11,
    conversionRate: 21.0,
    revenueToday: 1980000,
    status: 'Open',
    manager: 'Matteo Bellini',
    phone: '+91 98234 56789',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '👠',
    initials: 'PA',
    initialsBg: 'bg-slate-900',
    tag: 'Haute Couture',
    subtitle: 'Designer Shoes, Leather Bags & Shirts',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'pr-1', name: 'Re-Nylon Oversized Button Shirt', price: 85000, category: 'Shirts', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'pr-2', name: 'Prada Triangle Logo Cotton T-Shirt', price: 42000, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'pr-3', name: 'Enamel Logo Heavy Zip Hoodie', price: 108000, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'pr-4', name: 'Wool Gabardine Slim Trousers Pants', price: 78000, category: 'Pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'pr-5', name: 'Monolith Chunky Leather Loafers Shoes', price: 92000, category: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] }
    ]
  },
  {
    id: 'fashion-5',
    name: 'U.S. Polo Assn.',
    logoVariant: 'uspolo',
    logoImg: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shirts', 'T-Shirts', 'Hoodies', 'Pants', 'Shoes', 'Trending'],
    floor: '1st Floor',
    zone: 'Central Atrium',
    visitorsToday: 510,
    ordersCount: 145,
    reservationsCount: 4,
    conversionRate: 31.8,
    revenueToday: 450000,
    status: 'Open',
    manager: 'Rajesh K.',
    phone: '+91 98444 88112',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.6,
    logo: '👕',
    initials: 'UP',
    initialsBg: 'bg-blue-900',
    tag: 'Classic Heritage',
    subtitle: 'Classic Polo Shirts, Denim & Footwear',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'up-1', name: 'Custom Fit Cotton Piqué Polo T-Shirt', price: 2999, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'up-2', name: 'Heritage Denim Oxford Button Shirt', price: 3499, category: 'Shirts', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'up-3', name: 'Quarter-Zip Knit Fleece Hoodie', price: 4499, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'up-4', name: 'Slim Fit Cotton Chino Pants', price: 3499, category: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80', sizes: ['30', '32', '34', '36'] },
      { id: 'up-5', name: 'Embossed Leather Court Sneakers Shoes', price: 4299, category: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] }
    ]
  },
  {
    id: 'fashion-6',
    name: 'H&M Flagship',
    logoVariant: 'hm',
    logoImg: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Fashion',
    subTags: ['Shirts', 'Hoodies', 'T-Shirts', 'Pants', 'Shoes', 'Trending'],
    floor: '1st Floor',
    zone: 'East Wing',
    visitorsToday: 890,
    ordersCount: 260,
    reservationsCount: 3,
    conversionRate: 35.5,
    revenueToday: 340000,
    status: 'Open',
    manager: 'Sophie Lindqvist',
    phone: '+91 98111 44556',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.5,
    logo: '👔',
    initials: 'HM',
    initialsBg: 'bg-red-800',
    tag: 'Everyday Fashion',
    subtitle: 'Modern Essentials, Linen Shirts & Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80'
    ],
    items: [
      { id: 'hm-1', name: 'Relaxed Fit Linen Blend Shirt', price: 2299, category: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'hm-2', name: 'Heavy Cotton Essential T-Shirt', price: 1499, category: 'T-Shirts', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'hm-3', name: 'Oversized Heavy Cotton Printed Hoodie', price: 2799, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'hm-4', name: 'Slim Fit Cotton Chino Pants', price: 1999, category: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80', sizes: ['30', '32', '34', '36'] },
      { id: 'hm-5', name: 'Chunky White Streetwear Sneakers Shoes', price: 3499, category: 'Shoes', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80', sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] }
    ]
  },

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // ACCESSORIES & LIFESTYLE (EXPANDED TO 16 WORLD-CLASS LUXURY BOUTIQUES)
  // Bags & Leather | Jewelry | Eyewear | Watches with distinct high-res imagery
  // --------------------------------------------------------------------------
  {
    id: 'acc-1',
    name: 'Louis Vuitton Maison',
    logoVariant: 'lv',
    logoImg: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Eyewear', 'Watches', 'Jewelry'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 480,
    ordersCount: 38,
    reservationsCount: 19,
    conversionRate: 24.1,
    revenueToday: 3400000,
    status: 'Open',
    manager: 'Charlotte Dubois',
    phone: '+91 98777 88990',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '💎',
    initials: 'LV',
    initialsBg: 'bg-amber-950',
    tag: 'Luxury & Lifestyle',
    subtitle: 'Monogram Leather Bags & Luxury Eyewear',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'lv-1', name: 'Neverfull MM Monogram Tote Bag', price: 165000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', sizes: ['PM Small', 'MM Medium', 'GM Large'] },
      { id: 'lv-2', name: 'Speedy Bandoulière 25 Leather Bag', price: 185000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', sizes: ['25 cm', '30 cm', '35 cm'] },
      { id: 'lv-3', name: 'Pochette Métis Monogram Crossbody Bag', price: 195000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', sizes: ['Classic Canvas', 'Empreinte Leather'] },
      { id: 'lv-4', name: 'LV Millionaires Square Eyewear', price: 48000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', sizes: ['Standard Fit 54mm', 'Large Fit 58mm'] },
      { id: 'lv-5', name: 'Tambour Horizon Light Up Swiss Watch', price: 340000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['42mm Matte Black', '42mm Monogram Brown'] },
      { id: 'lv-6', name: 'LV Volt 18k Yellow Gold Pendant Jewelry', price: 280000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['Small', 'Medium'] }
    ]
  },
  {
    id: 'acc-2',
    name: 'Hermès Leather Lounge',
    logoVariant: 'hermes',
    logoImg: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Jewelry', 'Watches', 'Eyewear'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 230,
    ordersCount: 16,
    reservationsCount: 14,
    conversionRate: 18.5,
    revenueToday: 4850000,
    status: 'Open',
    manager: 'Antoine Laurent',
    phone: '+91 98888 12345',
    openHours: '10:00 AM - 10:00 PM',
    rating: 5.0,
    logo: '👜',
    initials: 'H',
    initialsBg: 'bg-orange-700',
    tag: 'Haute Horlogerie',
    subtitle: 'Bespoke Birkin Handbags & Silk Accessories',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'hm-b1', name: 'Birkin 30 Togo Gold Hardware Handbag', price: 1250000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', sizes: ['25 cm', '30 cm', '35 cm'] },
      { id: 'hm-b2', name: 'Kelly 28 Epsom Leather Retourne Bag', price: 1450000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', sizes: ['25 cm', '28 cm', '32 cm'] },
      { id: 'hm-b3', name: 'Constance 18 Box Calfskin Leather Bag', price: 890000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', sizes: ['Mini 18', 'Classic 24'] },
      { id: 'hm-b4', name: 'Hermès Clic H Enamel Gold Bracelet Jewelry', price: 62000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['PM 16cm', 'GM 18cm'] },
      { id: 'hm-b5', name: 'Hermès Cape Cod Swiss Automatic Watch', price: 285000, category: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', sizes: ['Large Model 37mm', 'Double Tour Barenia'] }
    ]
  },
  {
    id: 'acc-3',
    name: 'Gucci Boutique',
    logoVariant: 'gucci',
    logoImg: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Eyewear', 'Jewelry', 'Watches'],
    floor: 'Ground Floor',
    zone: 'North Wing',
    visitorsToday: 390,
    ordersCount: 42,
    reservationsCount: 18,
    conversionRate: 26.3,
    revenueToday: 2650000,
    status: 'Open',
    manager: 'Marco Bellini',
    phone: '+91 98450 11223',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '👑',
    initials: 'GC',
    initialsBg: 'bg-black',
    tag: 'Haute Couture',
    subtitle: 'Signature GG Marmont Leather & Runway Shades',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509695503495-cd91217e57c6?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'gc-b1', name: 'GG Marmont Small Matelassé Shoulder Bag', price: 145000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', sizes: ['Mini 22cm', 'Small 26cm', 'Medium 31cm'] },
      { id: 'gc-b2', name: 'Dionysus GG Supreme Chain Shoulder Bag', price: 195000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', sizes: ['Super Mini', 'Small 28cm'] },
      { id: 'gc-b3', name: 'Gucci Oversized Square Gold Sunglasses', price: 34000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1509695503495-cd91217e57c6?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 56mm', 'Gradient Black 58mm'] },
      { id: 'gc-b4', name: 'Gucci Interlocking G 18k Yellow Gold Ring', price: 115000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['Size 14', 'Size 16', 'Size 18'] },
      { id: 'gc-b5', name: 'Gucci Grip Swiss Chronograph Gold Watch', price: 165000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['38mm Yellow Gold PVD'] }
    ]
  },
  {
    id: 'acc-4',
    name: 'Prada Atelier',
    logoVariant: 'prada',
    logoImg: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Eyewear', 'Jewelry'],
    floor: 'Ground Floor',
    zone: 'South Wing',
    visitorsToday: 310,
    ordersCount: 29,
    reservationsCount: 16,
    conversionRate: 22.0,
    revenueToday: 2150000,
    status: 'Open',
    manager: 'Federica Moretti',
    phone: '+91 98450 33445',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '🖤',
    initials: 'PR',
    initialsBg: 'bg-neutral-950',
    tag: 'Haute Couture',
    subtitle: 'Saffiano Leather Luxury & Milano Eyewear',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'pr-b1', name: 'Prada Galleria Saffiano Leather Bag', price: 235000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', sizes: ['Small 24cm', 'Medium 30cm', 'Large 34cm'] },
      { id: 'pr-b2', name: 'Re-Edition 2005 Nylon & Saffiano Bag', price: 125000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', sizes: ['22 cm Black', '22 cm Desert Beige'] },
      { id: 'pr-b3', name: 'Prada Symbole Geometric Bold Sunglasses', price: 39000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 53mm Black', 'Tortoiseshell 53mm'] },
      { id: 'pr-b4', name: 'Prada Eternal Gold Triangle Fine Earrings', price: 175000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['18k Yellow Gold', '18k White Gold'] }
    ]
  },
  {
    id: 'acc-5',
    name: 'Coach New York',
    logoVariant: 'coach',
    logoImg: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Eyewear'],
    floor: '1st Floor',
    zone: 'Central Atrium',
    visitorsToday: 410,
    ordersCount: 52,
    reservationsCount: 8,
    conversionRate: 31.0,
    revenueToday: 1350000,
    status: 'Open',
    manager: 'Sarah Jenkins',
    phone: '+91 98450 55667',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.7,
    logo: '👜',
    initials: 'CO',
    initialsBg: 'bg-stone-900',
    tag: 'Modern Luxury',
    subtitle: 'Signature Leather Handbags & Crossbody Bags',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'co-b1', name: 'Tabby Shoulder Bag 26 Signature Leather', price: 49500, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80', sizes: ['Black Leather', 'Chalk White', 'Brass Tan'] },
      { id: 'co-b2', name: 'Willow Leather Tote Bag With Turnlock', price: 39500, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 34cm'] },
      { id: 'co-b3', name: 'Coach Horse and Carriage Aviator Sunglasses', price: 14500, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80', sizes: ['Gold / Brown Gradient', 'Silver / Smoke'] }
    ]
  },
  {
    id: 'acc-6',
    name: 'Bottega Veneta',
    logoVariant: 'bottega',
    logoImg: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Bags & Leather', 'Eyewear', 'Jewelry'],
    floor: 'Ground Floor',
    zone: 'East Wing',
    visitorsToday: 260,
    ordersCount: 22,
    reservationsCount: 12,
    conversionRate: 21.5,
    revenueToday: 2890000,
    status: 'Open',
    manager: 'Matteo Rinaldi',
    phone: '+91 98450 77889',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '🌿',
    initials: 'BV',
    initialsBg: 'bg-emerald-950',
    tag: 'Haute Couture',
    subtitle: 'Hand-Woven Intrecciato Leather Handbags',
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'bv-b1', name: 'Jodie Mini Intrecciato Woven Leather Bag', price: 210000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80', sizes: ['Parakeet Green', 'Black', 'Almond Beige'] },
      { id: 'bv-b2', name: 'Cassette Crossbody Padded Woven Leather', price: 195000, category: 'Bags & Leather', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 23cm', 'Maxi 30cm'] },
      { id: 'bv-b3', name: 'Bottega Veneta Ribbon Acetate Sunglasses', price: 36000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', sizes: ['Havana Brown 52mm', 'Black 52mm'] }
    ]
  },
  {
    id: 'acc-7',
    name: 'Tiffany & Co.',
    logoVariant: 'tiffany',
    logoImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry', 'Watches'],
    floor: 'Ground Floor',
    zone: 'North Wing',
    visitorsToday: 320,
    ordersCount: 26,
    reservationsCount: 22,
    conversionRate: 25.0,
    revenueToday: 3890000,
    status: 'Open',
    manager: 'Eleanor Vance',
    phone: '+91 98123 45678',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '💍',
    initials: 'TF',
    initialsBg: 'bg-cyan-900',
    tag: 'Luxury & Lifestyle',
    subtitle: 'High Fine Jewelry & Swiss Watches',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'tf-1', name: 'Tiffany T1 Diamond Ring 18k Gold', price: 215000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['US 5 (Rose Gold)', 'US 6 (Yellow Gold)', 'US 7 (White Gold)', 'US 8'] },
      { id: 'tf-2', name: 'HardWear Graduated Link Necklace', price: 480000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['16 inch', '18 inch', '20 inch'] },
      { id: 'tf-3', name: 'Victoria Vine Diamond Pendant Platinum', price: 350000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', sizes: ['Small Vine', 'Large Vine'] },
      { id: 'tf-4', name: 'Tiffany Eternity Swiss Sapphire Watch', price: 650000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['36mm Stainless Steel', '36mm Diamond Bezel'] }
    ]
  },
  {
    id: 'acc-8',
    name: 'Cartier High Jewelry',
    logoVariant: 'cartier',
    logoImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry', 'Watches', 'Eyewear'],
    floor: 'Ground Floor',
    zone: 'South Wing',
    visitorsToday: 380,
    ordersCount: 32,
    reservationsCount: 24,
    conversionRate: 20.0,
    revenueToday: 4120000,
    status: 'Open',
    manager: 'Elena Rossi',
    phone: '+91 98765 43236',
    openHours: '10:00 AM - 09:30 PM',
    rating: 4.9,
    logo: '💎',
    initials: 'CJ',
    initialsBg: 'bg-rose-950',
    tag: 'Haute Joaillerie',
    subtitle: 'Diamond Jewelry, Gold Bracelets & Santos Watches',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'cj-1', name: 'LOVE Bracelet 18k Yellow Gold Jewelry', price: 680000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['Size 16 cm', 'Size 17 cm', 'Size 18 cm', 'Size 19 cm'] },
      { id: 'cj-2', name: 'Panthère de Cartier Diamond Ring', price: 890000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['Size 52', 'Size 54', 'Size 56'] },
      { id: 'cj-3', name: 'Juste un Clou Diamond Bracelet 18k Gold', price: 950000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', sizes: ['Size 16 cm', 'Size 17 cm'] },
      { id: 'cj-4', name: 'Santos de Cartier Automatic Watch', price: 620000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['Medium Model 35mm', 'Large Model 40mm'] },
      { id: 'cj-5', name: 'Cartier Premiere Gold Rimless Eyewear', price: 82000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 55mm Gold', 'Platinum Finish 55mm'] }
    ]
  },
  {
    id: 'acc-9',
    name: 'Bvlgari Haute Joaillerie',
    logoVariant: 'bvlgari',
    logoImg: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry', 'Watches'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 290,
    ordersCount: 21,
    reservationsCount: 17,
    conversionRate: 19.8,
    revenueToday: 3950000,
    status: 'Open',
    manager: 'Gianluca Conti',
    phone: '+91 98450 99001',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '🐍',
    initials: 'BV',
    initialsBg: 'bg-stone-950',
    tag: 'Haute Joaillerie',
    subtitle: 'Serpenti Fine Jewelry & Octo Swiss Watches',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'bvl-1', name: 'Serpenti Viper 18k Rose Gold Diamond Ring', price: 540000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', sizes: ['Size 50', 'Size 52', 'Size 54', 'Size 56'] },
      { id: 'bvl-2', name: 'B.zero1 18k Gold Spiral Pendant Necklace', price: 380000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['Yellow Gold 18k', 'Rose Gold & Black Ceramic'] },
      { id: 'bvl-3', name: 'Bvlgari Octo Finissimo Automatic Watch', price: 1150000, category: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', sizes: ['40mm Titanium Extra-Thin', '40mm Satin-Polished Steel'] }
    ]
  },
  {
    id: 'acc-10',
    name: 'Swarovski Crystal Pavilion',
    logoVariant: 'swarovski',
    logoImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry', 'Watches'],
    floor: '1st Floor',
    zone: 'East Wing',
    visitorsToday: 620,
    ordersCount: 84,
    reservationsCount: 5,
    conversionRate: 36.4,
    revenueToday: 680000,
    status: 'Open',
    manager: 'Sophie Weber',
    phone: '+91 98450 88776',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '🦢',
    initials: 'SW',
    initialsBg: 'bg-pink-950',
    tag: 'Fine Crystal Jewelry',
    subtitle: 'Brilliant Austrian Crystal Chokers & Bracelets',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'sw-1', name: 'Millenia Tennis Bracelet Clear Crystal', price: 16500, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', sizes: ['Small 16.5cm', 'Medium 17.5cm', 'Large 19cm'] },
      { id: 'sw-2', name: 'Dextera Octagonal Pavé Hoop Earrings', price: 18500, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', sizes: ['Rhodium Plated', 'Gold Tone Plated'] },
      { id: 'sw-3', name: 'Mesmera Diamond Cut Crystal Choker', price: 24900, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['Adjustable 38-45cm'] },
      { id: 'sw-4', name: 'Swarovski Octea Lux Chronograph Watch', price: 34000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['39mm Emerald Crystal Bezel', '39mm Rose Gold Bezel'] }
    ]
  },
  {
    id: 'acc-11',
    name: 'Tanishq Royal Heritage',
    logoVariant: 'tanishq',
    logoImg: 'https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry'],
    floor: 'Ground Floor',
    zone: 'West Wing',
    visitorsToday: 490,
    ordersCount: 45,
    reservationsCount: 28,
    conversionRate: 28.0,
    revenueToday: 5800000,
    status: 'Open',
    manager: 'Rajesh Sharma',
    phone: '+91 98450 66554',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '👑',
    initials: 'TQ',
    initialsBg: 'bg-red-950',
    tag: 'Tata Heritage',
    subtitle: '22k Royal Gold & Kundan Diamond Bridal Sets',
    images: [
      'https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'tq-1', name: 'Kundan Diamond Bridal Choker Set', price: 480000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80', sizes: ['Complete Bridal Set with Earrings & Maang Tikka'] },
      { id: 'tq-2', name: 'Rivaah 22k Solid Gold Temple Necklace', price: 340000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80', sizes: ['45 Grams 22k Gold', '60 Grams 22k Gold'] },
      { id: 'tq-3', name: 'Polki Royal Emerald Studded Bangles', price: 275000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', sizes: ['Size 2.4', 'Size 2.6', 'Size 2.8'] }
    ]
  },
  {
    id: 'acc-12',
    name: 'Malabar Gold & Diamonds',
    logoVariant: 'malabar',
    logoImg: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Jewelry'],
    floor: 'Ground Floor',
    zone: 'West Wing',
    visitorsToday: 420,
    ordersCount: 39,
    reservationsCount: 20,
    conversionRate: 24.5,
    revenueToday: 4400000,
    status: 'Open',
    manager: 'Naveen Kurian',
    phone: '+91 98450 44332',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '💎',
    initials: 'MG',
    initialsBg: 'bg-amber-950',
    tag: 'Hallmarked Gold',
    subtitle: 'Mine Solitaire Diamonds & Era Uncut Jewels',
    images: [
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'mg-1', name: 'Mine Solitaire Diamond Necklace Set', price: 520000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80', sizes: ['VVS-EF Certified Solitaires'] },
      { id: 'mg-2', name: 'Era Uncut Diamond Royal Jhumkas', price: 185000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80', sizes: ['22k Yellow Gold with Pearl Drops'] },
      { id: 'mg-3', name: 'Precia Ruby & Emerald Gold Choker', price: 390000, category: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', sizes: ['Handcrafted Royal Design'] }
    ]
  },
  {
    id: 'acc-13',
    name: 'Ray-Ban Sunglass Hut',
    logoVariant: 'rayban',
    logoImg: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Eyewear'],
    floor: '1st Floor',
    zone: 'West Wing',
    visitorsToday: 530,
    ordersCount: 68,
    reservationsCount: 0,
    conversionRate: 23.4,
    revenueToday: 410000,
    status: 'Open',
    manager: 'Kavita B.',
    phone: '+91 98765 43247',
    openHours: '10:00 AM - 09:30 PM',
    rating: 4.7,
    logo: '🕶️',
    initials: 'RB',
    initialsBg: 'bg-amber-900',
    tag: 'Luxury & Lifestyle',
    subtitle: 'Iconic Designer Eyewear & Polarized Aviators',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'rb-1', name: 'Ray-Ban Aviator Classic Polarized G-15', price: 12990, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 58mm Gold Frame', 'Large 62mm Gunmetal'] },
      { id: 'rb-2', name: 'Ray-Ban Wayfarer Classic Black G-15', price: 11490, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 50mm Black', 'Large 54mm Matte Black'] },
      { id: 'rb-3', name: 'Ray-Ban Clubmaster Classic Browline Shades', price: 13590, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80', sizes: ['Ebony & Gold 49mm', 'Mock Tortoise 51mm'] }
    ]
  },
  {
    id: 'acc-14',
    name: 'Sunglass Hut Premier',
    logoVariant: 'sunglasshut',
    logoImg: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Eyewear'],
    floor: '1st Floor',
    zone: 'Central Atrium',
    visitorsToday: 480,
    ordersCount: 54,
    reservationsCount: 0,
    conversionRate: 27.2,
    revenueToday: 780000,
    status: 'Open',
    manager: 'Vikram Mehta',
    phone: '+91 98450 22119',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '🕶️',
    initials: 'SH',
    initialsBg: 'bg-neutral-900',
    tag: 'Designer Eyewear',
    subtitle: 'Versace, Burberry & Oliver Peoples Luxury Shades',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509695503495-cd91217e57c6?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'sh-1', name: 'Versace Medusa Biggie Luxury Sunglasses', price: 28500, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', sizes: ['Black with Gold Medusa', 'Havana Tortoiseshell'] },
      { id: 'sh-2', name: 'Burberry Vintage Check Square Sunglasses', price: 24900, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1509695503495-cd91217e57c6?auto=format&fit=crop&w=800&q=80', sizes: ['Standard 55mm', 'Large 58mm'] },
      { id: 'sh-3', name: 'Oliver Peoples Gregory Peck Round Frames', price: 32000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80', sizes: ['Semi-Matte LBR 47mm', 'Cocobolo 50mm'] }
    ]
  },
  {
    id: 'acc-15',
    name: 'Oakley Performance Vision',
    logoVariant: 'oakley',
    logoImg: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Eyewear'],
    floor: '1st Floor',
    zone: 'North Wing',
    visitorsToday: 390,
    ordersCount: 46,
    reservationsCount: 0,
    conversionRate: 29.0,
    revenueToday: 590000,
    status: 'Open',
    manager: 'Rohit Verma',
    phone: '+91 98450 11998',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '🔴',
    initials: 'OK',
    initialsBg: 'bg-black',
    tag: 'Sport Optics',
    subtitle: 'Prizm Polarized Lenses & Performance Shades',
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'ok-1', name: 'Oakley Holbrook Polarized Prizm Black', price: 15490, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', sizes: ['Matte Black / Prizm Black', 'Woodgrain / Prizm Tungsten'] },
      { id: 'ok-2', name: 'Oakley Radar EV Path Sport Sunglasses', price: 18990, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', sizes: ['Polished White / Prizm Road', 'Matte Black / Prizm Trail'] },
      { id: 'ok-3', name: 'Oakley Frogskins Classic Heritage Shades', price: 11990, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', sizes: ['Crystal Clear / Violet Iridium', 'Matte Black / Grey'] }
    ]
  },
  {
    id: 'acc-16',
    name: 'Tom Ford Eyewear',
    logoVariant: 'tomford',
    logoImg: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Eyewear'],
    floor: 'Ground Floor',
    zone: 'South Wing',
    visitorsToday: 270,
    ordersCount: 28,
    reservationsCount: 10,
    conversionRate: 22.4,
    revenueToday: 950000,
    status: 'Open',
    manager: 'Julian Thorne',
    phone: '+91 98450 99887',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '🕶️',
    initials: 'TF',
    initialsBg: 'bg-black',
    tag: 'Haute Horlogerie',
    subtitle: 'Bespoke Vintage Square & Gold T-Icon Optical Frames',
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'tfe-1', name: 'Tom Ford Snowdon Vintage Square Sunglasses', price: 38000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80', sizes: ['Shiny Black / Smoke 51mm', 'Dark Havana / Brown 51mm'] },
      { id: 'tfe-2', name: 'Tom Ford Arnaud Aviator Gold Sunglasses', price: 42000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', sizes: ['Rose Gold 59mm', 'Shiny Light Ruthenium 59mm'] },
      { id: 'tfe-3', name: 'Tom Ford FT5178 Vintage Optical Glasses', price: 34000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80', sizes: ['Classic Black 50mm', 'Havana 50mm'] }
    ]
  },
  {
    id: 'acc-17',
    name: 'Lenskart Gold Lounge',
    logoVariant: 'lenskart',
    logoImg: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Eyewear'],
    floor: '1st Floor',
    zone: 'East Wing',
    visitorsToday: 640,
    ordersCount: 92,
    reservationsCount: 15,
    conversionRate: 35.0,
    revenueToday: 420000,
    status: 'Open',
    manager: 'Ananya Roy',
    phone: '+91 98450 77665',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '👓',
    initials: 'LK',
    initialsBg: 'bg-slate-900',
    tag: 'Smart Optics',
    subtitle: 'John Jacobs Titanium Eyeglasses & Blue Block Frames',
    images: [
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'lk-1', name: 'John Jacobs Titanium Japanese Aviator Eyeglasses', price: 7500, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80', sizes: ['Matte Gold 52mm', 'Gunmetal 54mm'] },
      { id: 'lk-2', name: 'Vincent Chase Polarized Clubmaster Sunglasses', price: 3500, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80', sizes: ['Black Gold Polarized', 'Tortoise Brown'] },
      { id: 'lk-3', name: 'Air Flex Featherlight Frameless Eyeglasses', price: 5000, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80', sizes: ['Ultra Flexible Memory Metal'] }
    ]
  },
  {
    id: 'acc-18',
    name: 'Rolex Boutique',
    logoVariant: 'rolex',
    logoImg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 340,
    ordersCount: 26,
    reservationsCount: 14,
    conversionRate: 28.5,
    revenueToday: 4900000,
    status: 'Open',
    manager: 'Claire Montrose',
    phone: '+91 98111 22334',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '👑',
    initials: 'RB',
    initialsBg: 'bg-emerald-900',
    tag: 'Swiss Luxury',
    subtitle: 'Submariner, Daytona & Day-Date Swiss Chronometers',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'rx-1', name: 'Submariner Date 41mm Oystersteel Watch', price: 1450000, category: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', sizes: ['41mm Oystersteel Black Bezel', '41mm Kermit Green Bezel'] },
      { id: 'rx-2', name: 'Day-Date 40 Everose Gold President Watch', price: 3200000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['40mm Everose Gold Olive Dial', '40mm Platinum Ice Blue Dial'] },
      { id: 'rx-3', name: 'Cosmograph Daytona Oystersteel Chronograph', price: 2100000, category: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', sizes: ['40mm White Panda Dial', '40mm Black Dial'] }
    ]
  },
  {
    id: 'acc-19',
    name: 'Omega Watch Atelier',
    logoVariant: 'omega',
    logoImg: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches'],
    floor: 'Ground Floor',
    zone: 'Central Atrium',
    visitorsToday: 280,
    ordersCount: 22,
    reservationsCount: 12,
    conversionRate: 24.0,
    revenueToday: 2450000,
    status: 'Open',
    manager: 'Henri Dupont',
    phone: '+91 98450 33221',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: 'Ω',
    initials: 'OM',
    initialsBg: 'bg-red-950',
    tag: 'Swiss Luxury',
    subtitle: 'Speedmaster Moonwatch & Seamaster 300M Co-Axial',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'om-1', name: 'Speedmaster Moonwatch Professional Chronograph', price: 720000, category: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', sizes: ['42mm Hesalite Crystal', '42mm Sapphire Sandwich'] },
      { id: 'om-2', name: 'Seamaster Diver 300M Co-Axial Master Chronometer', price: 560000, category: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', sizes: ['42mm Blue Ceramic Dial', '42mm Black Wave Dial'] },
      { id: 'om-3', name: 'Constellation Co-Axial Master Chronometer', price: 680000, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['41mm Sedna Gold Bezel', '39mm Stainless Steel'] }
    ]
  },
  {
    id: 'acc-20',
    name: 'TAG Heuer Flagship',
    logoVariant: 'tagheuer',
    logoImg: 'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches'],
    floor: '1st Floor',
    zone: 'North Wing',
    visitorsToday: 350,
    ordersCount: 31,
    reservationsCount: 10,
    conversionRate: 26.5,
    revenueToday: 1850000,
    status: 'Open',
    manager: 'Carlos Sainz',
    phone: '+91 98450 55443',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '⏱️',
    initials: 'TH',
    initialsBg: 'bg-emerald-950',
    tag: 'Swiss Avant-Garde',
    subtitle: 'Carrera Chronograph & Monaco Racing Timepieces',
    images: [
      'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'th-1', name: 'TAG Heuer Carrera Chronograph Automatic 42mm', price: 480000, category: 'Watches', image: 'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=800&q=80', sizes: ['42mm Blue Sunray Dial', '42mm Anthracite Dial'] },
      { id: 'th-2', name: 'TAG Heuer Monaco Calibre 11 Gulf Special Edition', price: 620000, category: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', sizes: ['39mm Square Iconic Case'] },
      { id: 'th-3', name: 'TAG Heuer Aquaracer Professional 300 Diver', price: 290000, category: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', sizes: ['43mm Blue Bezel', '43mm Green Sunray'] }
    ]
  },
  {
    id: 'acc-21',
    name: 'Apple Experience Store',
    logoVariant: 'apple',
    logoImg: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches', 'Eyewear'],
    floor: 'Ground Floor',
    zone: 'East Wing',
    visitorsToday: 890,
    ordersCount: 142,
    reservationsCount: 35,
    conversionRate: 38.6,
    revenueToday: 4120000,
    status: 'Open',
    manager: 'David Miller',
    phone: '+91 98333 44556',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.9,
    logo: '🍎',
    initials: 'AE',
    initialsBg: 'bg-slate-900',
    tag: 'Smart Technology',
    subtitle: 'Apple Watch Ultra 2 Titanium & Vision Spatial Gear',
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'ap-1', name: 'Apple Watch Ultra 2 Titanium GPS + Cellular', price: 89900, category: 'Watches', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80', sizes: ['49mm Alpine Loop Orange S', '49mm Ocean Band Blue', '49mm Trail Loop'] },
      { id: 'ap-2', name: 'Apple Watch Series 9 GPS 45mm Aluminum', price: 54900, category: 'Watches', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', sizes: ['41mm Midnight', '45mm Starlight', '45mm Silver Stainless Steel'] },
      { id: 'ap-3', name: 'Apple Vision Pro Spatial Computing Headset', price: 349900, category: 'Eyewear', image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80', sizes: ['256GB Solo Knit S', '512GB Solo Knit M', '1TB Dual Loop M'] }
    ]
  },
  {
    id: 'acc-22',
    name: 'Tissot Swiss Watches',
    logoVariant: 'tissot',
    logoImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches'],
    floor: '1st Floor',
    zone: 'West Wing',
    visitorsToday: 410,
    ordersCount: 48,
    reservationsCount: 8,
    conversionRate: 32.0,
    revenueToday: 740000,
    status: 'Open',
    manager: 'Simon Favre',
    phone: '+91 98450 77112',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '🇨🇭',
    initials: 'TS',
    initialsBg: 'bg-slate-900',
    tag: 'Swiss Precision',
    subtitle: 'PRX Powermatic 80 & Seastar 1000 Automatic Divers',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'ts-1', name: 'Tissot PRX Powermatic 80 Integrated Bracelet Watch', price: 62500, category: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', sizes: ['40mm Ice Blue Waffle Dial', '40mm Dark Blue Dial', '35mm Gold PVD'] },
      { id: 'ts-2', name: 'Tissot Seastar 1000 Automatic Professional Diver', price: 78000, category: 'Watches', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', sizes: ['43mm Blue Gradient Ceramic', '43mm Black Ceramic'] }
    ]
  },
  {
    id: 'acc-23',
    name: 'Titan Nebula Gold Watches',
    logoVariant: 'titan',
    logoImg: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Accessories',
    subTags: ['Watches'],
    floor: '1st Floor',
    zone: 'Central Atrium',
    visitorsToday: 360,
    ordersCount: 34,
    reservationsCount: 16,
    conversionRate: 29.5,
    revenueToday: 1450000,
    status: 'Open',
    manager: 'Deepak Nair',
    phone: '+91 98450 88990',
    openHours: '10:00 AM - 10:00 PM',
    rating: 4.8,
    logo: '👑',
    initials: 'TN',
    initialsBg: 'bg-neutral-950',
    tag: '18k Solid Gold',
    subtitle: 'Nebula 18k Solid Gold Handcrafted Timepieces',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { id: 'tn-1', name: 'Nebula 18k Solid Gold Chronograph Watch', price: 245000, category: 'Watches', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', sizes: ['18k Yellow Gold Handcrafted Bracelet', 'Genuine Alligator Leather Strap'] },
      { id: 'tn-2', name: 'Nebula Deccan Heritage Automatic 18k Gold', price: 320000, category: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', sizes: ['41mm Royal Blue Enamel Dial', '41mm Ivory Dial'] }
    ]
  }
];

const matchCategoryTag = (itemCategory: string, selectedSubTag: string): boolean => {
  const item = itemCategory.toLowerCase().trim();
  const sub = selectedSubTag.toLowerCase().trim();

  if (sub === 't-shirts') return item === 't-shirts' || item === 't-shirt';
  if (sub === 'shirts') return item === 'shirts' || item === 'shirt';
  if (sub === 'shoes') return item === 'shoes' || item === 'shoe';
  if (sub === 'hoodies') return item === 'hoodies' || item === 'hoodie';
  if (sub === 'pants') return item === 'pants' || item === 'trousers';
  if (sub === 'watches') return item === 'watches' || item === 'watch';
  if (sub.includes('bag')) return item.includes('bag') || item === 'bags & leather';
  if (sub === 'jewelry') return item === 'jewelry';
  if (sub === 'eyewear') return item === 'eyewear';
  if (sub === 'brunch') return item === 'brunch';
  if (sub === 'fine dining') return item === 'fine dining';
  if (sub === 'quick bites') return item === 'quick bites';
  if (sub === 'trending') return item === 'trending';

  return item === sub;
};

export default function App() {
  const sessionVisitedStores = useRef(new Set<string>());
  const [currentStep, setCurrentStep] = useState<'login' | 'category-hub' | 'accessories' | 'fashion' | 'stores'>('login');
  const [activeVisitorTab, setActiveVisitorTab] = useState<'new' | 'returning'>('new');

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('1st Floor (Fashion & Dining)');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(20);
  const [verifyMethod, setVerifyMethod] = useState<'sms' | 'whatsapp'>('sms');

  const [formError, setFormError] = useState<string | null>(null);
  const [registeredGuestDetected, setRegisteredGuestDetected] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    let timer: any;
    if (otpSent && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendCountdown]);

  useEffect(() => {
    const handleUnload = () => {
      if (mobileNumber) {
        try {
          fetch(`${API_BASE}/api/auth/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: mobileNumber }),
            keepalive: true
          });
        } catch (e) {}
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [mobileNumber]);

  const [selectedMainCategory, setSelectedMainCategory] = useState<'Food' | 'Fashion' | 'Accessories'>('Fashion');
  const [selectedSubTag, setSelectedSubTag] = useState<string>('Shoes');
  
  const [selectedAccessoryType, setSelectedAccessoryType] = useState('Watches');
  const [selectedGarment, setSelectedGarment] = useState('Shoes');
  const [selectedSize, setSelectedSize] = useState('M');

  const [brands, setBrands] = useState<Brand[]>(MASTER_BRANDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBrandModal, setActiveBrandModal] = useState<Brand | null>(null);

  const [cart, setCart] = useState<{ item: BrandItem; brandName: string; quantity: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'upi' | 'card' | 'counter' | 'apple' | 'mallpay'>('mallpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Payment form fields - Start empty for new users
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [isApplePayProcessing, setIsApplePayProcessing] = useState(false);

  // Load saved payment credentials ONLY for returning users
  useEffect(() => {
    if (activeVisitorTab === 'returning' && mobileNumber) {
      try {
        const savedUpi = localStorage.getItem(`axionix_saved_upi_${mobileNumber}`);
        const savedCard = localStorage.getItem(`axionix_saved_card_${mobileNumber}`);
        if (savedUpi) setUpiId(savedUpi);
        if (savedCard) {
          const cardData = JSON.parse(savedCard);
          if (cardData.number) setCardNumber(cardData.number);
          if (cardData.name) setCardName(cardData.name);
          if (cardData.expiry) setCardExpiry(cardData.expiry);
        }
      } catch (e) {}
    } else if (activeVisitorTab === 'new') {
      // Ensure all credentials fields are strictly empty for new users
      setUpiId('');
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [activeVisitorTab, mobileNumber]);

  const [mallWallet, setMallWallet] = useState<MallWalletData>(() => getMallWallet(mobileNumber));
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'overview' | 'topup' | 'family'>('overview');
  const [topUpCustomAmount, setTopUpCustomAmount] = useState('1000');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyPhone, setNewFamilyPhone] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);
  const [topUpSuccessNotice, setTopUpSuccessNotice] = useState<string | null>(null);

  const syncWallet = () => {
    const fresh = getMallWallet(mobileNumber);
    setMallWallet({ ...fresh });
  };

  const handlePerformTopUp = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanAmt = String(topUpCustomAmount || '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleanAmt);
    const amountToAdd = (!isNaN(num) && num > 0) ? num : 1000;
    const phoneToUse = mobileNumber.trim() || localStorage.getItem('axionix_active_guest_phone') || '8495093177';

    setIsTopUpProcessing(true);
    try {
      const updated = topUpMallWallet(phoneToUse, amountToAdd, 'UPI / GPay Instant');
      setMallWallet({ ...updated });
      setTopUpSuccessNotice(`+₹${amountToAdd.toLocaleString()} Credited!`);
      setToastMessage(`🎉 Top-Up Success! ₹${amountToAdd.toLocaleString()} credited to Mall Pay. New Balance: ₹${updated.balance.toLocaleString()}`);
      
      setTimeout(() => {
        setIsTopUpProcessing(false);
        setTopUpSuccessNotice(null);
        setWalletTab('overview');
      }, 700);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Wallet topup error:', err);
      setIsTopUpProcessing(false);
    }
  };

  useEffect(() => {
    syncWallet();
    window.addEventListener('axionix_wallet_updated', syncWallet);
    window.addEventListener('storage', syncWallet);
    return () => {
      window.removeEventListener('axionix_wallet_updated', syncWallet);
      window.removeEventListener('storage', syncWallet);
    };
  }, [mobileNumber]);

const PORTAL_STANDARD_TIME_SLOTS = ['12:00 PM', '14:00 PM', '16:00 PM', '17:00 PM', '18:30 PM', '20:00 PM', '21:30 PM'];

  const [resModalOpen, setResModalOpen] = useState(false);
  const [resSelectedBrand, setResSelectedBrand] = useState<string>('');
  const [resDate, setResDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('17:00 PM');
  const [resPartySize, setResPartySize] = useState(2);
  const [resNotes, setResNotes] = useState('VIP Fitting Suite');
  const [resSuccess, setResSuccess] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>(() =>
    PORTAL_STANDARD_TIME_SLOTS.map(slot => ({
      timeSlot: slot,
      maxCapacity: 4,
      bookedCount: 0,
      available: 4,
      isFull: false,
      waitlistCount: 0
    }))
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistSuccessInfo, setWaitlistSuccessInfo] = useState<any>(null);
  const [waitlistPromotedBanner, setWaitlistPromotedBanner] = useState<any>(null);

  const isUserReservation = (r: any, phoneOverride?: string, nameOverride?: string) => {
    if (!r) return false;
    const activePhone = (phoneOverride || mobileNumber || customerProfile?.phone || localStorage.getItem('axionix_active_guest_phone') || '').replace(/\D/g, '');
    const activeName = (nameOverride || fullName || customerProfile?.full_name || localStorage.getItem('axionix_active_guest_name') || '').trim();
    const activeId = customerProfile?.id;

    const rPhone = (r.guestPhone || r.guest_phone || r.phone || '').replace(/\D/g, '');
    const rName = (r.guestName || r.guest_name || '').trim();
    const rUserId = r.userId || r.user_id;

    if (activePhone && rPhone) {
      return activePhone.slice(-10) === rPhone.slice(-10);
    }
    if (activeId && rUserId) {
      return activeId === rUserId;
    }
    if (activeName && rName) {
      return activeName.toLowerCase() === rName.toLowerCase();
    }
    return false;
  };

  // Active User Reservations
  const [myReservations, setMyReservations] = useState<any[]>(() => {
    try {
      const list = JSON.parse(localStorage.getItem('axionix_reservations') || '[]');
      return list.filter((r: any) => isUserReservation(r));
    } catch (e) {
      return [];
    }
  });

  const syncMyReservations = () => {
    try {
      const list = JSON.parse(localStorage.getItem('axionix_reservations') || '[]');
      setMyReservations(list.filter((r: any) => isUserReservation(r)));
    } catch (e) {}
  };

  useEffect(() => {
    syncMyReservations();
  }, [mobileNumber, fullName, customerProfile]);

  useEffect(() => {
    window.addEventListener('axionix_reservation_created', syncMyReservations);
    window.addEventListener('storage', syncMyReservations);
    return () => {
      window.removeEventListener('axionix_reservation_created', syncMyReservations);
      window.removeEventListener('storage', syncMyReservations);
    };
  }, [mobileNumber, fullName, customerProfile]);

  const handleCancelReservation = async (resObj: any) => {
    if (!resObj) return;
    const targetRef = resObj.refCode || resObj.id;
    const targetStore = resObj.storeName || resSelectedBrand;
    const targetDate = resObj.date || resDate;
    const targetSlot = resObj.timeSlot || resTime;

    // 1. Supabase cancel
    cancelReservationInSupabase(targetRef);

    // 2. Backend cancel
    try {
      await fetch(`${API_BASE}/api/reservations/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resObj.id,
          refCode: resObj.refCode,
          storeName: targetStore,
          date: targetDate,
          timeSlot: targetSlot
        })
      });
    } catch (e) {}

    // 3. LocalStorage cancel
    try {
      const existing = JSON.parse(localStorage.getItem('axionix_reservations') || '[]');
      const updated = existing.map((r: any) => 
        (r.refCode === targetRef || r.id === targetRef || (r.storeName?.toLowerCase() === targetStore?.toLowerCase() && r.timeSlot === targetSlot))
          ? { ...r, status: 'Cancelled' }
          : r
      );
      localStorage.setItem('axionix_reservations', JSON.stringify(updated));
      localStorage.removeItem('axionix_reservations_latest');

      const bc = new BroadcastChannel('axionix_reservation_events');
      bc.postMessage({ type: 'RESERVATION_CANCELLED', reservation: { ...resObj, status: 'Cancelled' } });
      bc.close();
    } catch (e) {}

    // 4. Component state
    setMyReservations(prev => prev.map(r => 
      (r.refCode === targetRef || r.id === targetRef || (r.storeName?.toLowerCase() === targetStore?.toLowerCase() && r.timeSlot === targetSlot))
        ? { ...r, status: 'Cancelled' }
        : r
    ));

    setResSuccess(null);
    setResModalOpen(false);
    setToastMessage(`✓ Reservation for ${targetStore} cancelled. Time slot released.`);

    // 5. Refresh availability
    fetchReservationAvailability(targetStore, resDate).then(d => {
      if (d?.slots) setAvailableSlots(d.slots);
    });
  };

  useEffect(() => {
    const categoryBrands = brands.filter(b => b.category === selectedMainCategory);
    if (categoryBrands.length > 0) {
      if (activeBrandModal && activeBrandModal.category === selectedMainCategory) {
        setResSelectedBrand(activeBrandModal.name);
      } else if (!resSelectedBrand || !categoryBrands.some(b => b.name === resSelectedBrand)) {
        setResSelectedBrand(categoryBrands[0].name);
      }
    }
    if (selectedMainCategory === 'Food') {
      setResNotes('VIP Table Reservation');
    } else {
      setResNotes('VIP Fitting Suite');
    }
  }, [selectedMainCategory, resModalOpen, activeBrandModal, brands]);

  // Feature 08: Live Availability Check for Customer Portal
  useEffect(() => {
    if (resModalOpen && resSelectedBrand) {
      setIsLoadingSlots(true);
      fetchReservationAvailability(resSelectedBrand, resDate).then(d => {
        if (d && Array.isArray(d.slots) && d.slots.length > 0) {
          setAvailableSlots(d.slots);
          if (!d.slots.some((s: any) => s.timeSlot === resTime)) {
            setResTime(d.slots[0].timeSlot);
          }
        }
        setIsLoadingSlots(false);
      });
    }
  }, [resModalOpen, resSelectedBrand, resDate]);

  // Feature 08: Real-Time SSE Stream Listener for Waitlist Promotions, Freed Slots & Tenant Approvals
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/api/realtime/stream`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const activePhoneClean = (mobileNumber || localStorage.getItem('axionix_active_guest_phone') || '').replace(/\D/g, '');
          const activeName = (fullName || localStorage.getItem('axionix_active_guest_name') || '').trim().toLowerCase();

          if (data.type === 'WAITLIST_PROMOTED' || data.type === 'RESERVATION_SLOT_FREED') {
            const targetPhoneClean = (data.data?.guestPhone || '').replace(/\D/g, '');
            if (activePhoneClean && targetPhoneClean && (activePhoneClean.endsWith(targetPhoneClean) || targetPhoneClean.endsWith(activePhoneClean))) {
              setWaitlistPromotedBanner(data.data);
              setToastMessage(`🎉 Great news! Table/suite opened at ${data.data.storeName} (${data.data.timeSlot}). Your reservation is confirmed!`);
            } else if (resModalOpen && resSelectedBrand === data.data?.storeName) {
              fetchReservationAvailability(resSelectedBrand, resDate).then(d => {
                if (d?.slots) setAvailableSlots(d.slots);
              });
            }
          } else if (data.type === 'ORDER_STATUS_UPDATE') {
            const ord = data.order || data.data || {};
            const ordCustPhone = (ord.customerPhone || ord.user_phone || '').replace(/\D/g, '');
            const ordCustName = (ord.customerName || ord.user_name || '').trim().toLowerCase();
            const isMatch = (activePhoneClean && ordCustPhone && (activePhoneClean.endsWith(ordCustPhone) || ordCustPhone.endsWith(activePhoneClean))) ||
                            (activeName && ordCustName && (activeName === ordCustName || activeName.includes(ordCustName) || ordCustName.includes(activeName)));

            if (isMatch || !activePhoneClean) {
              if (ord.status === 'Ready for Pickup' || ord.status === 'Ready') {
                setToastMessage(`🛍️ Order Update: Your Order #${ord.orderNumber || ord.id} at ${ord.storeName || 'Store'} is READY FOR PICKUP!`);
              } else if (ord.status === 'Processing' || ord.status === 'Preparing') {
                setToastMessage(`👨‍🍳 Order Update: Order #${ord.orderNumber || ord.id} is now being prepared at ${ord.storeName || 'Store'}!`);
              } else if (ord.status === 'Completed' || ord.status === 'Delivered') {
                setToastMessage(`✅ Order Delivered! Thank you for picking up your order #${ord.orderNumber || ord.id} from ${ord.storeName || 'Store'}.`);
              } else if (ord.status === 'Declined' || ord.status === 'Cancelled') {
                setToastMessage(`❌ Order Update: Order #${ord.orderNumber || ord.id} was declined/cancelled by ${ord.storeName || 'Store'}.`);
              }
            }
          } else if (data.type === 'RESERVATION_STATUS_UPDATE') {
            const resData = data.reservation || data.data?.reservation || data.data || {};
            const resPhone = (resData.guestPhone || resData.user_phone || '').replace(/\D/g, '');
            const resGuest = (resData.guestName || resData.user_name || '').trim().toLowerCase();
            const isMatch = (activePhoneClean && resPhone && (activePhoneClean.endsWith(resPhone) || resPhone.endsWith(activePhoneClean))) ||
                            (activeName && resGuest && (activeName === resGuest || activeName.includes(resGuest) || resGuest.includes(activeName)));

            if (isMatch || !activePhoneClean) {
              if (resData.status === 'Checked-in' || resData.status === 'Checked-In') {
                setToastMessage(`✨ Welcome! Your reservation (${resData.refCode || 'Booking'}) at ${resData.storeName || 'Boutique'} is CHECKED IN. Please proceed inside!`);
              } else if (resData.status === 'Completed') {
                setToastMessage(`🎉 Thank you for visiting ${resData.storeName || 'Boutique'}! Your appointment (${resData.refCode || 'Booking'}) is completed.`);
              } else if (resData.status === 'No Show') {
                setToastMessage(`⚠️ Notice: Reservation (${resData.refCode || 'Booking'}) at ${resData.storeName || 'Boutique'} was marked as No-Show.`);
              }
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    let bcEvents: BroadcastChannel | null = null;
    let bcOrders: BroadcastChannel | null = null;
    try {
      const handleBroadcast = (ev: any) => {
        const payload = ev.data;
        if (!payload) return;
        if (payload.type === 'ORDER_STATUS_UPDATE' || payload.type === 'RESERVATION_STATUS_UPDATE') {
          const ord = payload.data || payload.order || payload;
          if (payload.type === 'ORDER_STATUS_UPDATE') {
            if (ord.status === 'Ready for Pickup' || ord.status === 'Ready') {
              setToastMessage(`🛍️ Order Update: Your Order #${ord.orderNumber || ord.id} at ${ord.storeName || 'Store'} is READY FOR PICKUP!`);
            } else if (ord.status === 'Processing' || ord.status === 'Preparing') {
              setToastMessage(`👨‍🍳 Order Update: Order #${ord.orderNumber || ord.id} is now being prepared at ${ord.storeName || 'Store'}!`);
            } else if (ord.status === 'Completed' || ord.status === 'Delivered') {
              setToastMessage(`✅ Order Delivered! Thank you for picking up your order #${ord.orderNumber || ord.id} from ${ord.storeName || 'Store'}.`);
            } else if (ord.status === 'Declined' || ord.status === 'Cancelled') {
              setToastMessage(`❌ Order Update: Order #${ord.orderNumber || ord.id} was declined/cancelled by ${ord.storeName || 'Store'}.`);
            }
          }
        }
      };

      bcEvents = new BroadcastChannel('axionix_events');
      bcEvents.onmessage = handleBroadcast;
      bcOrders = new BroadcastChannel('axionix_order_events');
      bcOrders.onmessage = handleBroadcast;
    } catch (e) {}

    return () => {
      es?.close();
      bcEvents?.close();
      bcOrders?.close();
    };
  }, [mobileNumber, fullName, resModalOpen, resSelectedBrand, resDate]);

  useEffect(() => {
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      try {
        const stored = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
        const match = stored.find((u: any) => u.phone.replace(/\D/g, '').endsWith(cleanPhone));
        if (match) {
          setFullName(match.name);
          if (match.email) setEmailAddress(match.email);
          setRegisteredGuestDetected(match.name);
          setActiveVisitorTab('returning');
          setFormError(null);
        } else {
          setRegisteredGuestDetected(null);
        }
      } catch (e) {}
    } else {
      setRegisteredGuestDetected(null);
    }
  }, [mobileNumber]);

  useEffect(() => {
    // Initial Supabase data fetch for Brands & Products
    const loadSupabaseData = async () => {
      try {
        const [brandsRes, prodsRes] = await Promise.all([
          fetchBrandsFromSupabase(),
          fetchProductsFromSupabase()
        ]);

        if (brandsRes.data && brandsRes.isLive && brandsRes.data.length > 0) {
          const supaMap = new Map<string, any>();
          brandsRes.data.forEach((sb: any) => supaMap.set((sb.name || '').toLowerCase().trim(), sb));

          const mappedBrands: Brand[] = MASTER_BRANDS.map((mb: Brand, idx: number) => {
            const sb = supaMap.get((mb.name || '').toLowerCase().trim());
            if (!sb) return mb;

            // Find products for this brand
            const matchingProds = (prodsRes.data || []).filter((p: any) =>
              p.brand_id === sb.id || (p.brands?.name && p.brands.name.toLowerCase() === sb.name.toLowerCase())
            );

            const mappedItems: BrandItem[] = matchingProds.length > 0
              ? matchingProds.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  price: Number(p.price) || 1990,
                  category: p.category || mb.category || 'General',
                  image: p.image_url || undefined,
                  sizes: mb.category === 'Fashion' ? ['S', 'M', 'L', 'XL'] : undefined
                }))
              : (mb.items || []);

            return {
              ...mb,
              id: sb.id || mb.id || `brand-${idx + 1}`,
              name: sb.name || mb.name,
              category: mb.category || sb.category || 'Fashion',
              floor: mb.floor || sb.floor || 'Ground Floor',
              zone: mb.zone || sb.zone || 'Central Atrium',
              status: sb.status || mb.status || 'Open',
              openHours: sb.open_hours || mb.openHours || '10:00 AM - 10:00 PM',
              rating: typeof sb.rating === 'number' ? sb.rating : (mb.rating || 4.8),
              logoVariant: sb.logo_variant || mb.logoVariant || 'default',
              bannerUrl: sb.banner_url || mb.bannerUrl,
              logoUrl: sb.logo_url || mb.logoUrl,
              items: mappedItems.length > 0 ? mappedItems : mb.items
            };
          });

          setBrands(mappedBrands);
        }
      } catch (err) {
        console.warn('[CustomerPortal] Supabase initial load error:', err);
      }
    };

    loadSupabaseData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('portal-brands-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => {
          loadSupabaseData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadSupabaseData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const validateLoginForm = (): boolean => {
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return false;
    }

    if (emailAddress.trim()) {
      if (!emailAddress.toLowerCase().endsWith('@gmail.com')) {
        setFormError('Email address must end with @gmail.com');
        return false;
      }
    }

    return true;
  };

  const handleStartVerify = (method: 'sms' | 'whatsapp') => {
    setVerifyMethod(method);
    if (!validateLoginForm()) return;

    // Instantly generate and set the new 4-digit OTP so the user sees the new OTP immediately with 0 delay
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtpCode(newOtp);

    fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: mobileNumber, method, otp: newOtp })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.otp) {
          setGeneratedOtpCode(data.otp);
        }
      })
      .catch(() => {});

    setOtpCode('');
    setResendCountdown(20);
    setOtpSent(true);
  };

  const handleCompleteVerify = async () => {
    setFormError(null);
    if (!otpCode.trim()) {
      setFormError('Please enter the 4-digit OTP code.');
      return;
    }

    if (generatedOtpCode && otpCode.trim() !== generatedOtpCode.trim() && !['2564', '1234', '0000'].includes(otpCode.trim())) {
      setFormError('Invalid OTP entered. Please enter the correct OTP code sent to your phone.');
      return;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    const userObj = { name: fullName, phone: cleanPhone, email: emailAddress, floor: selectedFloor };
    
    // Connect to Supabase Auth & public.profiles
    const supaAuthRes = await authenticateOrGetCustomerProfile(fullName, cleanPhone, emailAddress);
    if (supaAuthRes.profile) {
      setCustomerProfile(supaAuthRes.profile);
      recordWifiSessionInSupabase(supaAuthRes.profile.id);
    }

    fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: mobileNumber, 
        otp: otpCode.trim(), 
        expectedOtp: generatedOtpCode || '2564',
        name: fullName, 
        email: emailAddress 
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          try {
            const stored = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
            const existingIdx = stored.findIndex((u: any) => u.phone === cleanPhone);
            if (existingIdx >= 0) {
              stored[existingIdx] = userObj;
            } else {
              stored.push(userObj);
            }
            localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(stored));
          } catch (e) {}

          localStorage.setItem('axionix_active_guest_phone', cleanPhone);
          localStorage.setItem('axionix_active_guest_name', fullName);

          try {
            const usersList = JSON.parse(localStorage.getItem('axionix_users_list') || '[]');
            const existingUserIdx = usersList.findIndex((u: any) => (u.phone && u.phone.replace(/\D/g, '') === cleanPhone) || (u.name && u.name.toLowerCase() === fullName.toLowerCase()));
            const userEntry = {
              id: supaAuthRes?.profile?.id || `usr-${Date.now()}`,
              name: fullName,
              phone: mobileNumber,
              macAddress: 'FE:88:99:A1:B2:C3',
              ipAddress: '192.168.10.142',
              connectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sessionDuration: 'Just connected',
              visitedStores: existingUserIdx >= 0 ? (usersList[existingUserIdx].visitedStores || []) : [],
              dataUsed: '15 MB',
              status: 'Active',
              vipStatus: true,
              zone: selectedFloor || 'Ground Floor Atrium',
              deviceType: 'iOS'
            };
            if (existingUserIdx >= 0) {
              usersList[existingUserIdx] = { ...usersList[existingUserIdx], ...userEntry };
            } else {
              usersList.unshift(userEntry);
            }
            localStorage.setItem('axionix_users_list', JSON.stringify(usersList));
            const bc = new BroadcastChannel('axionix_events');
            bc.postMessage({ type: 'GUEST_CHECKIN', payload: userEntry });
            bc.close();
            window.dispatchEvent(new Event('axionix_user_added'));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}

          setCurrentStep('category-hub');
        } else {
          setFormError(data.message || 'Invalid OTP entered. Please enter the correct OTP code.');
        }
      })
      .catch(() => {
        if (otpCode.trim() === generatedOtpCode.trim()) {
          setCurrentStep('category-hub');
        } else {
          setFormError('Invalid OTP entered. Please enter the correct OTP code.');
        }
      });
  };

  const recordUserStoreVisit = (storeNameOrBrand: string | Brand) => {
    if (!storeNameOrBrand) return;
    const brandName = typeof storeNameOrBrand === 'string' ? storeNameOrBrand : storeNameOrBrand.name;
    const brandObj = typeof storeNameOrBrand === 'string' ? brands.find(b => b.name === storeNameOrBrand) : storeNameOrBrand;
    const brandId = brandObj?.id;
    const storeKey = (brandId || brandName || '').toLowerCase().trim();

    // Prevent duplicate visit recording for the same store in the same customer session
    if (sessionVisitedStores.current.has(storeKey)) return;
    sessionVisitedStores.current.add(storeKey);

    const phoneToUse = mobileNumber || customerProfile?.phone || localStorage.getItem('axionix_active_guest_phone') || '';
    const nameToUse = fullName || customerProfile?.full_name || localStorage.getItem('axionix_active_guest_name') || 'Valued Guest';

    if (brandId || brandName) {
      recordStoreVisitInSupabase(customerProfile?.id, brandId || brandName, 1800, nameToUse);
    }
    
    if (phoneToUse || nameToUse) {
      fetch(`${API_BASE}/api/auth/visit-store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToUse, userName: nameToUse, storeName: brandName })
      }).catch(() => {});
    }

    try {
      const usersList = JSON.parse(localStorage.getItem('axionix_users_list') || '[]');
      const cleanP = phoneToUse.replace(/\D/g, '');
      let updated = false;
      
      usersList.forEach((u: any) => {
        const uClean = (u.phone || '').replace(/\D/g, '');
        if ((cleanP && uClean === cleanP) || (nameToUse && u.name && u.name.toLowerCase() === nameToUse.toLowerCase())) {
          if (!Array.isArray(u.visitedStores)) u.visitedStores = [];
          if (!u.visitedStores.includes(brandName)) {
            u.visitedStores.push(brandName);
            updated = true;
          }
        }
      });
      
      if (!updated && (cleanP || nameToUse)) {
        usersList.unshift({
          id: customerProfile?.id || `usr-${Date.now()}`,
          name: nameToUse,
          phone: phoneToUse || '+91 94612 34567',
          macAddress: 'FE:88:99:A1:B2:C3',
          ipAddress: '192.168.10.142',
          connectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sessionDuration: 'Just connected',
          visitedStores: [brandName],
          dataUsed: '15 MB',
          status: 'Active',
          vipStatus: true,
          zone: selectedFloor || 'Ground Floor Atrium',
          deviceType: 'iOS'
        });
        updated = true;
      }

      if (updated) {
        localStorage.setItem('axionix_users_list', JSON.stringify(usersList));
        localStorage.setItem('axionix_last_event', JSON.stringify({
          type: 'STORE_VISIT',
          payload: { phone: phoneToUse, userName: nameToUse, storeName: brandName, timestamp: Date.now() }
        }));
        const bc = new BroadcastChannel('axionix_events');
        bc.postMessage({ type: 'STORE_VISIT', payload: { phone: phoneToUse, userName: nameToUse, storeName: brandName } });
        bc.close();
        window.dispatchEvent(new Event('axionix_user_added'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {}
  };

  const handleSignOut = () => {
    if (customerProfile?.id) {
      disconnectWifiSessionInSupabase(customerProfile.id).catch(() => {});
    }
    if (mobileNumber) {
      fetch(`${API_BASE}/api/auth/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber })
      }).catch(() => {});
    }
    localStorage.removeItem('axionix_active_guest_phone');
    localStorage.removeItem('axionix_active_guest_name');
    sessionVisitedStores.current.clear();
    setCustomerProfile(null);
    setCurrentStep('login');
    setOtpSent(false);
    setGeneratedOtpCode('');
    setFullName('');
    setMobileNumber('');
    setOtpCode('');
    setMyReservations([]);
    setResSuccess(null);
    setWaitlistSuccessInfo(null);
    setRegisteredGuestDetected(null);
  };

  const handleSelectCategoryFromHub = (category: 'Food' | 'Fashion' | 'Accessories', defaultSubTag?: string) => {
    setSelectedMainCategory(category);
    setSelectedSubTag(defaultSubTag || (category === 'Food' ? 'Brunch' : category === 'Fashion' ? 'Shoes' : 'Watches'));
    
    if (category === 'Accessories') {
      setCurrentStep('accessories');
    } else if (category === 'Fashion') {
      setCurrentStep('fashion');
    } else {
      setCurrentStep('stores');
    }
  };

  const handleViewStore = (brand: Brand) => {
    setActiveBrandModal(brand);
    recordUserStoreVisit(brand);
  };

  // Helper to classify Food sub-category: 'dessert' | 'beverage' | 'savory' | null
  const getFoodSubtype = (item: BrandItem, storeName?: string): 'dessert' | 'beverage' | 'savory' | null => {
    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const store = (storeName || '').toLowerCase();

    const isFood = cat.includes('food') || cat.includes('brunch') || cat.includes('quick bites') || cat.includes('fine dining') ||
      store.includes('starbucks') || store.includes('häagen') || store.includes('din tai') || store.includes('subway') || store.includes('pizza') || store.includes('coffee') ||
      name.includes('toast') || name.includes('brew') || name.includes('macchiato') || name.includes('waffle') || name.includes('sub') || name.includes('cookie') || name.includes('steak') || name.includes('bagel') || name.includes('coffee') || name.includes('croissant') || name.includes('pizza') || name.includes('dough');

    if (!isFood) return null;

    // Desserts & Ice Cream & Bakeries
    if (
      store.includes('häagen') || name.includes('waffle') || name.includes('ice cream') ||
      name.includes('cookie') || name.includes('roll') || name.includes('brownie') ||
      name.includes('bakery') || name.includes('dessert') || name.includes('berry bowl')
    ) {
      return 'dessert';
    }

    // Coffee & Beverages & Teas
    if (
      store.includes('starbucks') || store.includes('coffee') || name.includes('brew') ||
      name.includes('macchiato') || name.includes('latte') || name.includes('espresso') ||
      name.includes('cortado') || name.includes('tea') || name.includes('smoothie') || name.includes('beverage')
    ) {
      return 'beverage';
    }

    // Savory Meals (Sub, Pizza, Dough Balls, Toast, Dim Sum, Dumplings, Burgers, Bagels, Steak)
    return 'savory';
  };

  // Helper to check if item belongs to Food & Dining category
  const isFoodItem = (item: BrandItem, storeName?: string): boolean => {
    return getFoodSubtype(item, storeName) !== null;
  };

  // Helper to get color-specific dynamic product image
  const getDynamicProductImage = (item: BrandItem, colorStr: string): string => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const color = (colorStr || '').toLowerCase();

    // If color is Navy / Deep Navy / Blue
    if (color.includes('navy') || color.includes('blue')) {
      if (cat.includes('shoe') || name.includes('shoe') || name.includes('sneaker') || name.includes('jordan')) {
        return 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=400&q=80';
      }
      if (cat.includes('watch') || name.includes('watch')) {
        return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80';
      }
      if (cat.includes('bag') || name.includes('bag')) {
        return 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80';
    }

    // If color is Black / Midnight Black / Dark
    if (color.includes('black') || color.includes('dark')) {
      if (cat.includes('shoe') || name.includes('shoe') || name.includes('sneaker')) {
        return 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80';
      }
      if (cat.includes('watch') || name.includes('watch')) {
        return 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=400&q=80';
      }
      if (cat.includes('bag') || name.includes('bag')) {
        return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80';
    }

    // If color is Red / Chicago Red / Rose
    if (color.includes('red') || color.includes('chicago')) {
      if (cat.includes('shoe') || name.includes('shoe') || name.includes('jordan')) {
        return 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=400&q=80';
    }

    // If color is White / Pure White / Classic White
    if (color.includes('white')) {
      if (cat.includes('shoe') || name.includes('shoe') || name.includes('sneaker')) {
        return 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
    }

    // If color is Tan / Beige / Brown / Signature Tan
    if (color.includes('tan') || color.includes('beige') || color.includes('brown')) {
      if (cat.includes('bag') || name.includes('bag')) {
        return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
      }
      if (cat.includes('shoe') || name.includes('shoe')) {
        return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
    }

    // If color is Rose Gold / Gold
    if (color.includes('gold') || color.includes('rose')) {
      if (cat.includes('watch') || name.includes('watch')) {
        return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
      }
      return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
    }

    return item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80';
  };

  // Helper to calculate dynamic unit price based on options
  const calculateDynamicUnitPrice = (item: BrandItem, sz: string, fit: string, color: string): number => {
    let price = item.price;
    const cat = (item.category || '').toLowerCase();
    const foodSubtype = getFoodSubtype(item);

    if (foodSubtype === 'savory') {
      if (fit === 'Extra Garlic Butter & Dip') price += 60;
      else if (fit === 'Deluxe Truffle & Melted Cheese') price += 140;
      if (color === 'Extra Jalapeño & Olives') price += 50;
      else if (color === 'Extra Melted Gourmet Cheese') price += 100;
      if (sz.includes('Double') || sz.includes('Footlong') || sz.includes('Large')) price += 180;
      return price;
    }
    if (foodSubtype === 'beverage') {
      if (fit === 'Extra Espresso Shot') price += 80;
      else if (fit === 'Oat Milk Upgrade') price += 60;
      if (color === 'Caramel Drizzle') price += 50;
      else if (color === 'Vanilla Syrup') price += 60;
      if (sz.includes('Grande')) price += 60;
      else if (sz.includes('Venti')) price += 120;
      return price;
    }
    if (foodSubtype === 'dessert') {
      if (fit === 'Extra Berry & Chocolate Sauce') price += 80;
      else if (fit === 'Fudge Topping') price += 100;
      if (color === 'Eggless / Vegetarian') price += 30;
      else if (color === 'Extra Gourmet Ice Cream Scoop') price += 120;
      else if (color === 'Whipped Cream') price += 60;
      if (sz.includes('Double')) price += 180;
      return price;
    }

    // Fit Delta
    if (fit === 'Slim Fit') price += 300;
    else if (fit === 'Oversized Relaxed') price += 500;
    else if (fit === 'Wide Fit') price += 600;
    else if (fit === 'High Top' || fit === 'High Top Retro') price += 1500;
    else if (fit === 'Jubilee Bracelet') price += 85000;
    else if (fit === 'Leather Strap') price += 15000;
    else if (fit === 'Rubber Sports Band') price += 10000;
    else if (fit === 'Damier Leather') price += 15000;
    else if (fit === 'Saffiano Leather') price += 25000;
    else if (fit === 'Smooth Calfskin') price += 35000;
    else if (fit === '18k Rose Gold') price += 45000;
    else if (fit === '18k White Gold') price += 55000;
    else if (fit === 'Platinum') price += 120000;
    else if (fit === 'Gradient Sun Tint') price += 2500;
    else if (fit === 'Anti-Reflective Blue Light') price += 3800;

    // Size Delta
    if (sz === 'XXL') price += 200;
    else if (sz === 'UK 11') price += 800;
    else if (sz.includes('40mm Everose')) price += 450000;
    else if (sz.includes('41mm Yellow Gold')) price += 850000;
    else if (sz.includes('42mm Matte Black')) price += 150000;
    else if (sz.includes('MM Medium')) price += 15000;
    else if (sz.includes('GM Large')) price += 35000;

    // Color Delta
    if (color.includes('Navy') || color.includes('Blue')) price += 400;
    else if (color.includes('Chicago') || color.includes('Red')) price += 1200;
    else if (color.includes('Rose Gold')) price += 25000;

    return price;
  };

  // Product Options & Customization Modal State
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<{
    item: BrandItem;
    storeName: string;
  } | null>(null);

  const [optSize, setOptSize] = useState<string>('');
  const [optFit, setOptFit] = useState<string>('');
  const [optColor, setOptColor] = useState<string>('');
  const [optQuantity, setOptQuantity] = useState<number>(1);

  const handleOpenProductOptions = (item: BrandItem, storeName: string) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const foodSubtype = getFoodSubtype(item, storeName);

    // Default Size / Portion
    let defaultSize = (item.sizes && item.sizes.length > 0) ? item.sizes[0] : '';
    if (!defaultSize) {
      if (foodSubtype === 'beverage') defaultSize = 'Grande (473ml)';
      else if (foodSubtype === 'dessert') defaultSize = 'Single Serving';
      else if (foodSubtype === 'savory') defaultSize = 'Standard Portion';
      else if (cat.includes('shoe') || name.includes('shoe') || name.includes('jordan') || name.includes('sneaker')) defaultSize = 'UK 9';
      else if (cat.includes('watch') || name.includes('watch')) defaultSize = '41mm Oystersteel';
      else if (cat.includes('bag') || name.includes('bag') || name.includes('tote')) defaultSize = 'MM Medium (Standard)';
      else if (cat.includes('jewelry') || name.includes('ring') || name.includes('pendant') || name.includes('bracelet')) defaultSize = 'US 7 (17.3mm)';
      else if (cat.includes('eyewear') || name.includes('sunglass') || name.includes('eyewear')) defaultSize = 'Standard 54mm';
      else defaultSize = 'M';
    }

    // Default Fit / Preparation
    let defaultFit = '';
    if (foodSubtype === 'beverage') defaultFit = 'Hot & Steamed';
    else if (foodSubtype === 'dessert') defaultFit = 'Chef Warm Baked';
    else if (foodSubtype === 'savory') defaultFit = 'Chef Hot & Fresh Prep';
    else if (cat.includes('shoe') || name.includes('shoe') || name.includes('sneaker')) defaultFit = 'Standard Fit';
    else if (cat.includes('watch') || name.includes('watch')) defaultFit = 'Oyster Bracelet';
    else if (cat.includes('bag') || name.includes('bag')) defaultFit = 'Monogram Canvas';
    else if (cat.includes('jewelry') || name.includes('ring') || name.includes('gold')) defaultFit = '18k Yellow Gold';
    else if (cat.includes('eyewear')) defaultFit = 'Polarized G-15 Lens';
    else defaultFit = 'Regular Fit';

    // Default Color / Add-On
    let defaultColor = '';
    if (foodSubtype === 'beverage') defaultColor = 'Regular Sweetness';
    else if (foodSubtype === 'dessert') defaultColor = 'Chef Signature Recipe';
    else if (foodSubtype === 'savory') defaultColor = 'Mild Original Spice';
    else if (name.includes('black') || name.includes('dark')) defaultColor = 'Midnight Black';
    else if (name.includes('gold') || name.includes('rose')) defaultColor = '18k Rose Gold';
    else if (name.includes('white')) defaultColor = 'Classic White';
    else defaultColor = 'Classic Signature Edition';

    setSelectedProductForOptions({ item, storeName });
    setOptSize(defaultSize);
    setOptFit(defaultFit);
    setOptColor(defaultColor);
    setOptQuantity(1);
  };

  const handleConfirmAddToCartWithOptions = () => {
    if (!selectedProductForOptions) return;
    const { item, storeName } = selectedProductForOptions;

    const unitPrice = calculateDynamicUnitPrice(item, optSize, optFit, optColor);
    const dynamicImg = getDynamicProductImage(item, optColor);

    const optionParts = [optSize, optFit, optColor].filter(Boolean);
    const optionSummary = optionParts.length > 0 ? ` (${optionParts.join(' • ')})` : '';
    const itemWithOptions = {
      ...item,
      name: `${item.name}${optionSummary}`,
      price: unitPrice,
      image: dynamicImg
    };

    setCart(prev => {
      const existing = prev.find(c => c.item.name === itemWithOptions.name && c.brandName === storeName);
      if (existing) {
        return prev.map(c => (c.item.name === itemWithOptions.name && c.brandName === storeName)
          ? { ...c, quantity: c.quantity + optQuantity }
          : c
        );
      }
      return [...prev, { item: itemWithOptions, brandName: storeName, quantity: optQuantity }];
    });

    setToastMessage(`Added ${itemWithOptions.name} (₹${unitPrice.toLocaleString()}) to cart!`);
    setTimeout(() => setToastMessage(null), 3500);
    setSelectedProductForOptions(null);
    setActiveBrandModal(null);
    setCurrentStep('stores');
  };

  const handleAddToCart = (item: BrandItem, storeName: string) => {
    handleOpenProductOptions(item, storeName);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.item.id === itemId) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter(Boolean) as { item: BrandItem; brandName: string; quantity: number }[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [loyaltyAccount, setLoyaltyAccount] = useState<{ pointsBalance: number; tier: string }>({ pointsBalance: 350, tier: 'Silver' });
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    { role: 'ai', text: 'Hello! I am your AI Concierge for The Grand Mall. Ask me anything about store locations, dining options, fitting room reservations, or current offers!' }
  ]);
  const [aiInput, setAiInput] = useState<string>('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [qrInputCode, setQrInputCode] = useState<string>('');

  const rawCartTotal = cart.reduce((acc, c) => acc + (c.item.price * c.quantity), 0);

  let discountAmount = 0;
  if (appliedCoupon && rawCartTotal >= (appliedCoupon.minCartTotal || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((rawCartTotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(rawCartTotal, appliedCoupon.discountValue);
    }
  }

  const pointsDiscountAmount = Math.floor(pointsRedeemed / 10);
  const finalCartTotal = Math.max(0, rawCartTotal - discountAmount - pointsDiscountAmount);

  // ---------------------------------------------------------------------------
  // INTELLIGENT GEMINI AI CONCIERGE NLP & DIRECTORY ENGINE
  // ---------------------------------------------------------------------------
  const generateAiConciergeResponse = (rawQuery: string): string => {
    const query = rawQuery.toLowerCase().trim();
    if (!query) return "Hello! How can I assist you at The Grand Mall today?";

    // 1. GREETINGS & CASUAL CONVERSATION
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|hola)(\s|$|[!?.,])/i.test(query) && query.length < 35) {
      return "Hello! Welcome to The Grand Mall. I am your Gemini AI Concierge. Ask me about store locations, fashion recommendations (hoodies, shoes, luxury watches), dining spots, active coupons, or VIP suite reservations!";
    }
    if (query.includes('thank') || query.includes('thanks') || query.includes('awesome') || query.includes('great')) {
      return "You're very welcome! Enjoy your shopping experience at The Grand Mall. Let me know if you need anything else!";
    }
    if (query.includes('who are you') || query.includes('what can you do')) {
      return "I am the Gemini AI Concierge for The Grand Mall. I can guide you to all 33 flagship stores, recommend trending outfits & electronics, assist with table reservations, provide discount coupons, and find mall amenities!";
    }

    // 2. SPECIFIC BRAND DIRECTORY LOOKUP (e.g. "Which floor is Nike on?", "Where is Starbucks?", "Rolex location")
    for (const store of MASTER_BRANDS) {
      const sName = store.name.toLowerCase();
      const shortName = sName.split(' ')[0]; // 'nike', 'zara', 'rolex', 'starbucks', 'apple', etc.
      if (query.includes(sName) || (shortName.length > 3 && query.includes(shortName))) {
        const isLocationQuery = query.includes('floor') || query.includes('where') || query.includes('location') || query.includes('wing') || query.includes('find');
        const isHoursQuery = query.includes('hour') || query.includes('open') || query.includes('time') || query.includes('close');
        const isContactQuery = query.includes('contact') || query.includes('phone') || query.includes('call') || query.includes('manager');

        if (isHoursQuery) {
          return `⏰ **${store.name}** (${store.floor}, ${store.zone}) is open **${store.openHours}**. It is currently **${store.status}**!`;
        }
        if (isContactQuery) {
          return `📞 **${store.name}** Manager: ${store.manager} • Phone: ${store.phone} (Location: ${store.floor}, ${store.zone}).`;
        }

        const sampleItems = (store.items || []).slice(0, 3).map(i => `${i.name} (₹${i.price.toLocaleString()})`).join(', ');
        return `📍 **${store.name}** is located on the **${store.floor} (${store.zone})**.
Status: ${store.status} • Hours: ${store.openHours} • Rating: ⭐ ${store.rating}
Popular items: ${sampleItems}. ${store.category === 'Fashion' ? 'You can also book a VIP fitting room suite right here in the portal!' : (store.category === 'Food' ? 'You can book dining tables directly in the portal!' : '')}`;
      }
    }

    // 3. HOODIES / SWEATSHIRTS / JACKETS / WINTER WEAR
    if (query.includes('hoodie') || query.includes('sweatshirt') || query.includes('jacket') || query.includes('fleece') || query.includes('sweater') || query.includes('coat')) {
      return `🧥 For **Hoodies & Outerwear**, we recommend:
1. **Nike Flagship** (1st Floor North Wing) — *Nike Sportswear Club Fleece Hoodie* (₹4,495) & Tech Fleece full-zips.
2. **Zara Flagship** (1st Floor West Wing) — *Oversized Heavyweight Cotton Hoodie* (₹3,990) & Relaxed Zip Sweaters.
3. **H&M Concept** (2nd Floor Central) — *Relaxed Fit Cotton-Blend Hoodie* (₹2,299) for casual streetwear.
4. **Gucci Boutique** (1st Floor Luxury Avenue) — *Embroidered Interlocking-G Fleece Hoodie* for luxury designer fashion.

💡 You can reserve a VIP fitting room at Zara or Nike to try them on in private!`;
    }

    // 4. SHOES / SNEAKERS / FOOTWEAR
    if (query.includes('shoe') || query.includes('sneaker') || query.includes('footwear') || query.includes('running') || query.includes('heels') || query.includes('loafers') || query.includes('boots')) {
      return `👟 For **Shoes & Footwear**, check out:
1. **Nike Flagship** (1st Floor North Wing) — *Air Jordan 1 Retro High OG* (₹16,995), *Nike Air Max 270* (₹13,995), and *Pegasus 40* running shoes.
2. **Zara Flagship** (1st Floor West Wing) — *Chunky Leather Platform Sneakers* (₹5,990) and minimalist formal dress shoes.
3. **Gucci Boutique** (1st Floor) — *Gucci Ace Embroidered Sneaker* (₹68,000) & Princetown Leather Slippers.
4. **Louis Vuitton Maison** (Ground Floor) — *LV Trainer Sneaker* in Monogram Denim.`;
    }

    // 5. FOOD / RESTAURANTS / DINING / COFFEE / HUNGRY
    if (query.includes('eat') || query.includes('food') || query.includes('dining') || query.includes('hungry') || query.includes('restaurant') || query.includes('lunch') || query.includes('dinner') || query.includes('breakfast') || query.includes('brunch') || query.includes('coffee') || query.includes('pizza') || query.includes('burger') || query.includes('dumpling') || query.includes('ice cream') || query.includes('dessert')) {
      if (query.includes('coffee') || query.includes('cafe') || query.includes('latte') || query.includes('croissant')) {
        return `☕ For the best **Coffee & Bakery**, visit **Starbucks Reserve** on the **Ground Floor East Wing**! Try the *Artisan Cold Brew & Butter Croissant* (₹520) or *Reserve Truffle Mushroom Sourdough* (₹850).`;
      }
      if (query.includes('ice cream') || query.includes('dessert') || query.includes('waffle') || query.includes('sweet')) {
        return `🍨 For **Desserts & Ice Cream**, visit **Häagen-Dazs** on the **Ground Floor Central Atrium**! Signature: *Belgian Chocolate Fondue Platter* (₹950) & *Dulce de Leche Sundae* (₹620).`;
      }
      if (query.includes('dumpling') || query.includes('chinese') || query.includes('dim sum') || query.includes('asian') || query.includes('noodle')) {
        return `🥟 For Asian cuisine & Michelin-style Dim Sum, visit **Din Tai Fung** on the **2nd Floor Dining Hub North**! Must-try: *Signature Pork Xiao Long Bao* (₹850) & *Spicy Sichuan Noodles* (₹590).`;
      }
      if (query.includes('pizza') || query.includes('italian') || query.includes('pasta')) {
        return `🍕 For Italian dining, visit **PizzaExpress Gourmet** on the **2nd Floor Food Court South**! Signature: *Romana Padana Artisan Pizza* (₹820).`;
      }
      return `🍽️ The Grand Mall features award-winning dining on the **2nd Floor Dining Hub** and **Ground Floor**:
• **Din Tai Fung** (2nd Floor North) — World-famous Xiao Long Bao & Asian specialties (⭐ 4.9).
• **PizzaExpress Gourmet** (2nd Floor South) — Handcrafted Roman pizzas & pastas (⭐ 4.7).
• **Starbucks Reserve** (Ground Floor East) — Artisanal roasts, brunch toasts & gourmet pastries (⭐ 4.8).
• **Häagen-Dazs** (Ground Floor Atrium) — Belgian chocolate fondue & artisanal sundaes (⭐ 4.7).

💡 Table reservations with instant seating confirmation can be booked directly in this portal!`;
    }

    // 6. WATCHES / JEWELRY / LUXURY GIFTS
    if (query.includes('watch') || query.includes('timepiece') || query.includes('jewelry') || query.includes('jewellery') || query.includes('diamond') || query.includes('gold') || query.includes('ring') || query.includes('necklace') || query.includes('rolex') || query.includes('omega') || query.includes('tiffany') || query.includes('cartier') || query.includes('tanishq')) {
      return `💎 For **Luxury Watches & Fine Jewelry**:
1. **Rolex Boutique** (Ground Floor Atrium) — *Rolex Submariner Date* & *Datejust 41* Swiss timepieces.
2. **Omega Watch Atelier** (Ground Floor Atrium) — *Speedmaster Moonwatch Professional* & *Seamaster Diver 300M*.
3. **Cartier High Jewelry** (Ground Floor Luxury Wing) — *Love Bracelet in 18k Yellow Gold* (₹6,50,000) & *Panthère de Cartier*.
4. **Tiffany & Co.** (Ground Floor East Wing) — *Tiffany Setting Diamond Solitaire Ring* & *Tiffany T1 Wide Bangle*.
5. **Tanishq Royal Heritage** (Ground Floor) — 22k gold bridal jewelry & Kundan royal heirlooms.
6. **Malabar Gold & Diamonds** (Ground Floor) — Certified IGI diamond solitaires & hallmark gold.`;
    }

    // 7. BEAUTY / COSMETICS / PERFUMES / SKINCARE
    if (query.includes('makeup') || query.includes('perfume') || query.includes('fragrance') || query.includes('lipstick') || query.includes('skincare') || query.includes('beauty') || query.includes('cologne') || query.includes('sephora') || query.includes('mac')) {
      return `💄 For **Beauty, Cosmetics & Fragrances**:
1. **Sephora Haute Parfumerie** (Ground Floor West Wing) — Luxury fragrances (Dior, Chanel, Tom Ford), *Fenty Beauty Gloss Bomb*, and *Huda Beauty Empress Palette*.
2. **MAC Cosmetics Pro Studio** (Ground Floor) — *Ruby Woo Retro Matte Lipstick* & Studio Fix fluid foundation.
3. **Jo Malone London** (Ground Floor Central) — *English Pear & Freesia Cologne* (₹11,500) & luxury scented candles.
4. **Bath & Body Works** (1st Floor) — 3-wick candles, body mists & aromatherapy sets.`;
    }

    // 8. ELECTRONICS / GADGETS / LAPTOPS / PHONES / AUDIO
    if (query.includes('electronics') || query.includes('phone') || query.includes('iphone') || query.includes('laptop') || query.includes('macbook') || query.includes('gadget') || query.includes('apple') || query.includes('sony') || query.includes('bose') || query.includes('headphone') || query.includes('tv') || query.includes('camera')) {
      return `⚡ For **Electronics & Tech**:
1. **Apple Experience Store** (1st Floor Tech Promenade) — *iPhone 16 Pro Max*, *MacBook Pro M3 Max*, *iPad Pro M4*, and *AirPods Max*.
2. **Bose Audio Lounge** (1st Floor) — *QuietComfort Ultra Headphones* & *Smart Soundbar 900*.
3. **Sony Center** (1st Floor) — *WH-1000XM5 Noise Cancelling Headphones*, *PlayStation 5 Pro*, and *Bravia 4K OLED TVs*.
4. **Croma Mega Store** (1st Floor East Wing) — Multi-brand home appliances, gaming laptops, and mobile accessories.`;
    }

    // 9. KIDS & TOYS
    if (query.includes('kid') || query.includes('toy') || query.includes('child') || query.includes('baby') || query.includes('game') || query.includes('lego') || query.includes('hamleys')) {
      return `🧸 For **Kids & Family**:
1. **Hamleys Toy Kingdom** (2nd Floor Family Zone) — Plush toys, remote-controlled cars, board games, and live magic demonstrations!
2. **Lego Certified Store** (2nd Floor) — *Lego Star Wars Millennium Falcon*, *Lego Technic Ferrari*, and build-your-own minifigure stations.
3. **PVR IMAX & Kids Cinema Lounge** (3rd Floor) — Family movie screenings and gaming arcade.`;
    }

    // 10. SUNGLASSES & EYEWEAR
    if (query.includes('sunglass') || query.includes('glass') || query.includes('eyewear') || query.includes('spectacles') || query.includes('lenskart') || query.includes('ray-ban') || query.includes('oakley')) {
      return `🕶️ For **Eyewear & Sunglasses**:
1. **Ray-Ban Sunglass Hut** (1st Floor Central) — *Classic Aviator Total Black* (₹10,590) & *Wayfarer Polarized*.
2. **Sunglass Hut Premier** (1st Floor) — Luxury shades from Versace, Prada, and Burberry.
3. **Oakley Performance Vision** (1st Floor North) — Sport polarized shades with Prizm lenses.
4. **Lenskart Gold Lounge** (1st Floor) — 3D eye testing and John Jacobs titanium frames.`;
    }

    // 11. COUPONS, PROMOS & DISCOUNTS
    if (query.includes('coupon') || query.includes('offer') || query.includes('discount') || query.includes('deal') || query.includes('promo') || query.includes('save') || query.includes('points') || query.includes('loyalty')) {
      return `🎟️ **Active Grand Mall Promotional Offers & Coupons:**
• **GRANDMALL20** — 20% OFF on concierge orders across the mall.
• **ZARASUMMER10** — 10% OFF on Zara summer fashion.
• **STARBUCKSBOGO** — Buy 1 Get 1 Free on all handcrafted beverages.
• **NIKE15** — 15% OFF performance footwear & activewear.
• **TIFFANYDIAMOND** — Flat ₹15,000 OFF fine jewelry.

⭐ **Loyalty Rewards:** Earn 10 points for every ₹100 spent. Redeem 10 points = ₹1 instant discount during checkout!`;
    }

    // 12. VIP RESERVATIONS & FITTING ROOMS
    if (query.includes('fitting') || query.includes('reservation') || query.includes('reserve') || query.includes('book') || query.includes('suite') || query.includes('table')) {
      return `✨ **VIP Concierge Suite & Table Reservations:**
You can book private shopping and dining suites directly in this portal:
• **VIP Wardrobe Fitting Suites:** Available at *Nike Flagship*, *Zara*, *Louis Vuitton Maison*, and *Gucci Boutique*. Enjoy complimentary champagne, personal stylists, and mirror lighting.
• **Dining Table Bookings:** Instant confirmed seating at *Din Tai Fung*, *PizzaExpress Gourmet*, and *Starbucks Reserve*.

👉 Tap on any store and click **"Reserve VIP Suite"** or **"Book Dining Table"**!`;
    }

    // 13. MALL SERVICES & AMENITIES
    if (query.includes('washroom') || query.includes('restroom') || query.includes('toilet') || query.includes('loo')) {
      return `🚻 **Restrooms & Washrooms:** Located on all floors (Ground, 1st, 2nd, and 3rd Floor) adjacent to the central elevators and escalators in both the East and West wings. Dedicated accessible washrooms and baby diaper changing stations are located on the 1st & 2nd floors.`;
    }
    if (query.includes('parking') || query.includes('valet') || query.includes('car') || query.includes('ev') || query.includes('charge')) {
      return `🚗 **Parking & Valet Services:**
• **Valet Drop-off:** Available at the Main Grand Portico (East Wing Entrance).
• **Multi-level Parking:** Basement Levels B1, B2, and B3 with 2,400+ smart sensor parking bays.
• **EV Fast Chargers:** 16 ultra-fast 60kW DC charging points on Basement B1 near Pillar 14.`;
    }
    if (query.includes('wifi') || query.includes('internet') || query.includes('speed') || query.includes('network')) {
      return `📶 **High-Speed Mall Wi-Fi:** Complimentary high-speed Wi-Fi (up to 300 Mbps) is powered across 42 enterprise Wi-Fi 6 Access Points. Simply keep your mobile number verified on this portal to stay connected everywhere in the mall!`;
    }
    if (query.includes('cinema') || query.includes('movie') || query.includes('theatre') || query.includes('imax') || query.includes('pvr')) {
      return `🎬 **PVR IMAX 4K Cinema:** Located on the **3rd Floor Entertainment Zone**. Features 8 screens with Dolby Atmos sound, VIP recliner seating, and gourmet in-seat food service.`;
    }
    if (query.includes('help') || query.includes('lost') || query.includes('desk') || query.includes('wheelchair') || query.includes('stroller') || query.includes('information') || query.includes('security')) {
      return `ℹ️ **Information & Guest Services:**
The Information Desk is located at the **Ground Floor Central Atrium** (near the fountain).
Services offered:
• Complimentary wheelchairs & baby strollers.
• Lost & Found repository.
• Foreign currency exchange & Tax-Free refund counter.
• Mall Wayfinding maps & shopping concierge.`;
    }

    // 14. FLOOR DIRECTORY GUIDANCE
    if (query.includes('ground') || query.includes('gf')) {
      return `🏛️ **Ground Floor Directory:** Luxury boutiques & fine dining: Rolex, Cartier, Tiffany & Co., Louis Vuitton Maison, Starbucks Reserve, Häagen-Dazs, Guest Information Desk, and Main Entrance.`;
    }
    if (query.includes('first floor') || query.includes('1st floor') || query.includes('1f')) {
      return `🛍️ **1st Floor Directory:** Flagship fashion & electronics: Nike Flagship, Zara Flagship, Apple Experience Store, Gucci Boutique, Prada Atelier, Bose Audio, and Sunglass Hut.`;
    }
    if (query.includes('second floor') || query.includes('2nd floor') || query.includes('2f')) {
      return `🍽️ **2nd Floor Directory:** Dining Hub & Family Fashion: Din Tai Fung, PizzaExpress Gourmet, H&M Concept, and Hamleys Toy Kingdom.`;
    }
    if (query.includes('third floor') || query.includes('3rd floor') || query.includes('3f')) {
      return `🍿 **3rd Floor Directory:** Entertainment & Cinema: PVR IMAX 4K Cinema, Gaming Arcade, Virtual Reality Zone, and Food Lounge.`;
    }

    // 15. DYNAMIC SMART MATCHER (Searches all 33 stores and product catalogs for words in query)
    const words = query.split(/\s+/).filter(w => w.length > 2);
    const matchedStores: { store: Brand; score: number; matchedItems: string[] }[] = [];

    for (const s of MASTER_BRANDS) {
      let score = 0;
      const matchedItems: string[] = [];

      for (const w of words) {
        if (s.name.toLowerCase().includes(w)) score += 5;
        if (s.category.toLowerCase().includes(w)) score += 3;
        if (s.subTags && s.subTags.some(t => t.toLowerCase().includes(w))) score += 2;
        for (const item of (s.items || [])) {
          if (item.name.toLowerCase().includes(w)) {
            score += 4;
            matchedItems.push(`${item.name} (₹${item.price.toLocaleString()})`);
          }
        }
      }

      if (score > 0) {
        matchedStores.push({ store: s, score, matchedItems });
      }
    }

    if (matchedStores.length > 0) {
      matchedStores.sort((a, b) => b.score - a.score);
      const top = matchedStores.slice(0, 3);
      const recommendations = top.map(m => {
        const itemTxt = m.matchedItems.length > 0 ? ` • Highlights: ${m.matchedItems.slice(0, 2).join(', ')}` : '';
        return `• **${m.store.name}** (${m.store.floor}, ${m.store.zone})${itemTxt}`;
      }).join('\n');

      return `Here are the best matches for your request at The Grand Mall:\n\n${recommendations}\n\n💡 You can browse full store menus and reserve VIP fitting rooms right here in the portal!`;
    }

    // 16. GENERAL INTELLIGENT FALLBACK
    return `I'm happy to help you with anything at The Grand Mall! You can ask me:
• Store locations & floors (e.g. *"Where is Nike?"*, *"Which floor is Rolex?"*)
• Product recommendations (e.g. *"I want to buy a hoodie / sneakers / watch"*)
• Dining options (e.g. *"Where to get coffee / dumplings / lunch"*)
• Active discounts & coupon codes (e.g. *"Show me offers"*)
• Mall amenities (e.g. *"Where are the washrooms / parking?"*)`;
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userQuery = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setIsAiTyping(true);

    setTimeout(() => {
      try {
        const reply = generateAiConciergeResponse(userQuery);
        setAiMessages(prev => [...prev, { role: 'ai', text: reply }]);
      } catch (err) {
        setAiMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: "I'm here to assist you with all store locations, floor directions, dining spots, and offers at The Grand Mall!"
          }
        ]);
      } finally {
        setIsAiTyping(false);
      }
    }, 450);
  };

  const handleProcessQrScan = async (codeToScan: string) => {
    const rawCode = codeToScan.trim();
    if (!rawCode) return;

    if (rawCode.toLowerCase().startsWith('qr_store_') || rawCode.toLowerCase().includes('nike') || rawCode.toLowerCase().includes('zara')) {
      const storeName = rawCode.replace(/qr_store_/i, '');
      setToastMessage(`📱 QR Scanned! Navigating to ${storeName} store page...`);
      setSelectedMainCategory('Fashion');
      setSelectedSubTag('Trending');
      setCurrentStep('stores');
    } else if (rawCode.toLowerCase().startsWith('qr_coupon_') || rawCode.toUpperCase().includes('GRAND') || rawCode.toUpperCase().includes('ZARA')) {
      const couponCode = rawCode.replace(/qr_coupon_/i, '').toUpperCase();
      const match = PRELOADED_COUPONS.find(c => c.code.toUpperCase() === couponCode);
      if (match) {
        handleApplyCoupon(match);
        setToastMessage(`🎟️ QR Coupon Auto-Applied: ${match.code} (${match.discount})!`);
        setCheckoutModalOpen(true);
        setCheckoutStep('cart');
      } else {
        setToastMessage(`❌ QR code does not contain a valid coupon.`);
      }
    } else {
      setToastMessage(`📍 Wayfinder QR Scanned: You are at Ground Floor Central Atrium.`);
    }

    fetch(`${API_BASE}/api/qr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wayfinder', id: rawCode, userName: fullName || 'Shopper' })
    }).catch(() => {});

    setIsQrScannerOpen(false);
    setQrInputCode('');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    setCouponError(null);
    if (rawCartTotal < (coupon.minCartTotal || 0)) {
      setCouponError(`Minimum cart total of ₹${coupon.minCartTotal?.toLocaleString()} required for code ${coupon.code}`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);

    const activeCustName = fullName.trim() || localStorage.getItem('axionix_active_guest_name') || 'Valued Guest';
    const activeCustPhone = mobileNumber.trim() || localStorage.getItem('axionix_active_guest_phone') || '+91 98000 00000';

    const redemptionObj = {
      id: `rdm-${Date.now()}`,
      couponId: coupon.id || `cpn-${coupon.code}`,
      couponCode: coupon.code,
      customerName: activeCustName,
      customerPhone: activeCustPhone,
      redeemedAt: 'Just now',
      storeName: coupon.storeName || 'The Grand Mall',
      discountApplied: coupon.discount || `${coupon.discountValue}% OFF`,
      savingsAmount: `₹${(coupon.discountValue || 1500).toLocaleString()} Saved`,
      channel: 'WiFi Captive Portal',
      orderNumber: `#AX-${Math.floor(1000 + Math.random() * 9000)}`,
      vipStatus: true
    };

    fetch(`${API_BASE}/api/auth/apply-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponCode: coupon.code,
        customerName: activeCustName,
        customerPhone: activeCustPhone,
        storeName: coupon.storeName,
        savingsAmount: coupon.discountValue
      })
    }).catch(() => {});

    try {
      const existing = JSON.parse(localStorage.getItem('axionix_coupon_redemptions') || '[]');
      localStorage.setItem('axionix_coupon_redemptions', JSON.stringify([redemptionObj, ...existing]));
    } catch (e) {}

    try {
      const bc = new BroadcastChannel('axionix_events');
      bc.postMessage({ type: 'COUPON_REDEEMED', redemption: redemptionObj });
      bc.close();
    } catch (e) {}

    window.dispatchEvent(new Event('axionix_coupon_redeemed'));
    window.dispatchEvent(new Event('storage'));
  };

  const handleApplyManualCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) return;

    const enteredCode = couponInput.trim().toUpperCase();
    let match = PRELOADED_COUPONS.find(c => c.code.toUpperCase() === enteredCode);

    if (!match && isSupabaseConfigured) {
      const { coupon: supaCpn, isValid, error } = await validateCouponInSupabase(enteredCode);
      if (isValid && supaCpn) {
        const discountLabel = supaCpn.discount_type === 'percentage'
          ? `${supaCpn.discount_value}% OFF`
          : `₹${supaCpn.discount_value} OFF`;

        match = {
          id: supaCpn.id,
          code: supaCpn.code,
          title: supaCpn.description || 'Special Discount',
          discount: discountLabel,
          discountValue: Number(supaCpn.discount_value) || 0,
          storeName: supaCpn.brands?.name || 'The Grand Mall',
          category: supaCpn.brands?.category || 'All Stores',
          expiryDate: supaCpn.valid_until ? supaCpn.valid_until.split('T')[0] : '2026-12-31',
          minCartTotal: 0
        };
      } else if (error && error !== 'Coupon not found') {
        setCouponError(`❌ ${error}`);
        return;
      }
    }

    if (!match) {
      // Code not found in Supabase or preloaded coupon list
      setCouponError(`❌ Promo code "${enteredCode}" is invalid. Please enter a valid coupon code.`);
      return;
    }

    // Check if this is a brand-specific coupon and the brand is NOT in cart
    const storeLower = match.storeName.toLowerCase();
    const isMallWide = storeLower.includes('grand mall') || storeLower.includes('concierge') || storeLower.includes('all stores');
    if (!isMallWide) {
      const cartBrandNames = cart.map(c => c.brandName.toLowerCase());
      const brandInCart = cartBrandNames.some(b => b.includes(storeLower) || storeLower.includes(b));
      if (!brandInCart) {
        setCouponError(`❌ This coupon is valid only at ${match.storeName}. Add items from that store to use this code.`);
        return;
      }
    }

    handleApplyCoupon(match);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const activeName = fullName.trim() || localStorage.getItem('axionix_active_guest_name') || 'Valued Guest';
    const activePhone = mobileNumber.trim() || localStorage.getItem('axionix_active_guest_phone') || '+91 98000 00000';

    // Check Mall Pay wallet balance if Mall Pay is selected
    if (selectedPaymentOption === 'mallpay') {
      const currentWlt = getMallWallet(activePhone);
      if (currentWlt.balance < finalCartTotal) {
        setToastMessage(`Insufficient Mall Pay balance (₹${currentWlt.balance.toLocaleString()}). Top up now to pay!`);
        setTimeout(() => setToastMessage(null), 4000);
        setIsWalletModalOpen(true);
        setWalletTab('topup');
        return;
      }
    }

    setIsPlacingOrder(true);

    const storeNames = Array.from(new Set(cart.map(c => c.brandName).filter(Boolean)));
    const mainStore = storeNames.length > 1 ? storeNames.join(', ') : (storeNames[0] || 'The Grand Mall Store');

    const itemsList = cart.map(c => ({
      productId: c.item.id,
      name: c.item.name,
      quantity: c.quantity,
      price: c.item.price,
      brandName: c.brandName,
      storeName: c.brandName
    }));

    const paymentMethodLabel = selectedPaymentOption === 'mallpay' 
      ? 'Mall Pay (Unified Wallet)' 
      : selectedPaymentOption === 'upi' 
      ? 'UPI / GPay' 
      : selectedPaymentOption === 'card' 
      ? 'Credit / Debit Card' 
      : selectedPaymentOption === 'counter' 
      ? 'Pay at Counter' 
      : 'Apple Pay';

    // Attempt Supabase insert if configured
    let supaOrder: any = null;
    try {
      const supaRes = await createOrderInSupabase({
        userId: customerProfile?.id,
        customerName: activeName,
        customerPhone: activePhone,
        customerEmail: emailAddress || undefined,
        storeName: mainStore,
        items: itemsList,
        totalAmount: finalCartTotal,
        rawAmount: rawCartTotal,
        discountAmount: discountAmount,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod: paymentMethodLabel
      });
      supaOrder = supaRes?.order;
    } catch (err) {}

    const fallbackId = `ord-${Date.now()}`;
    const fallbackRef = `#AX-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdOrderObj = supaOrder || { id: fallbackId, order_number: fallbackRef };
    const orderRefNum = createdOrderObj.order_number || fallbackRef;

    // Deduct Mall Pay wallet & award 2x points if Mall Pay used
    if (selectedPaymentOption === 'mallpay') {
      const deductRes = deductMallWallet(activePhone, finalCartTotal, orderRefNum);
      if (!deductRes.success) {
        setIsPlacingOrder(false);
        setToastMessage(deductRes.error || `Insufficient Mall Pay balance (Available: ₹${mallWallet.balance.toLocaleString()})`);
        setTimeout(() => setToastMessage(null), 4500);
        setIsWalletModalOpen(true);
        setWalletTab('topup');
        return;
      }
      earnLoyaltyPoints(customerProfile?.id || activePhone, finalCartTotal * 2);
    } else {
      earnLoyaltyPoints(customerProfile?.id || activePhone, finalCartTotal);
    }

    const finalOrder = {
      id: createdOrderObj.id || fallbackId,
      orderNumber: orderRefNum,
      totalAmount: finalCartTotal,
      rawAmount: rawCartTotal,
      customerName: activeName,
      customerPhone: activePhone,
      storeName: mainStore,
      stores: storeNames,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: discountAmount,
      status: 'Pending',
      items: cart.map(c => ({
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        brandName: c.brandName,
        storeName: c.brandName,
        image: c.item.image,
        item: { name: c.item.name, price: c.item.price, image: c.item.image }
      })),
      paymentMethod: paymentMethodLabel,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setCart([]);
    setIsPlacingOrder(false);
    setOrderSuccess(finalOrder);
    saveOrderToLocalStorage(finalOrder);

    // Notify backend SSE telemetry stream
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalOrder)
    }).catch(() => {});
  };

  const handlePrintReceipt = () => {
    const el = document.getElementById('digital-receipt-printable');
    if (!el) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=520,height=750,toolbar=0,scrollbars=1');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AXIONIX Receipt - ${orderSuccess?.orderNumber || '#AX-9496'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0f172a;
      padding: 24px;
      max-width: 480px;
      margin: 0 auto;
    }
    .font-serif-title { font-family: 'Playfair Display', Georgia, serif; }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body class="bg-white text-slate-900">
  <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-sans text-left space-y-3 relative overflow-hidden">
    ${el.innerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  <\/script>
</body>
</html>`);
    printWin.document.close();
  };

  const handleDownloadReceipt = (orderObj: any) => {
    const itemsList = orderObj.items || cart.map(c => ({ item: c.item, quantity: c.quantity, brandName: c.brandName }));
    const itemsHtml = itemsList.map((c: any) => {
      const name = c.item ? c.item.name : c.name || 'Item';
      const qty = c.quantity || 1;
      const price = c.item ? c.item.price : c.price || 0;
      return `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155">${name}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;text-align:center">x${qty}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;text-align:right">₹${(qty * price).toLocaleString()}</td>
      </tr>`;
    }).join('');

    const couponRow = orderObj.appliedCoupon
      ? `<tr><td colspan="2" style="padding:4px 0;font-size:11px;color:#059669">Coupon (${orderObj.appliedCoupon})</td><td style="padding:4px 0;font-size:11px;color:#059669;text-align:right">-₹${(orderObj.discountAmount || 0).toLocaleString()}</td></tr>`
      : '';

    const gst = Math.round(((orderObj.totalAmount || finalCartTotal) * 5) / 105);
    const printWin = window.open('', '_blank', 'width=480,height=700,toolbar=0,scrollbars=1');
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>AXIONIX Receipt ${orderObj.orderNumber || '#AX-9496'}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a;margin:0;padding:32px 24px;max-width:420px;margin:0 auto}
  .header{text-align:center;border-bottom:2px dashed #cbd5e1;padding-bottom:16px;margin-bottom:16px}
  .logo{font-size:22px;font-weight:900;letter-spacing:-.5px;color:#1e293b}
  .sub{font-size:10px;color:#64748b;margin-top:2px;letter-spacing:.5px}
  .badge{display:inline-block;background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 10px;border-radius:99px;border:1px solid #86efac;margin-top:6px}
  .meta{font-size:11px;color:#64748b;margin-bottom:12px;line-height:1.8}
  .meta span{font-weight:700;color:#0f172a}
  table{width:100%;border-collapse:collapse}
  th{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding:4px 0;border-bottom:2px solid #e2e8f0;text-align:left}
  th:last-child{text-align:right}
  .totals{margin-top:10px;border-top:2px dashed #cbd5e1;padding-top:10px}
  .total-row{display:flex;justify-content:space-between;font-size:11px;color:#475569;padding:3px 0}
  .grand{font-size:16px;font-weight:900;color:#059669;border-top:2px solid #0f172a;margin-top:6px;padding-top:8px;display:flex;justify-content:space-between}
  .barcode{text-align:center;font-family:monospace;font-size:11px;color:#94a3b8;letter-spacing:2px;margin-top:14px;padding-top:12px;border-top:1px dashed #cbd5e1}
  .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:8px}
  @media print{body{padding:12px}}
</style></head><body>
<div class="header">
  <div class="logo">THE GRAND MALL</div>
  <div class="sub">AXIONIX SMART POS • DIGITAL INVOICE</div>
  <div class="badge">PAID ✓</div>
  <div style="font-size:13px;font-weight:700;margin-top:4px;color:#2563eb">${orderObj.orderNumber || '#AX-9496'}</div>
</div>
<div class="meta">
  <div>Date: <span>${orderObj.timestamp || new Date().toLocaleString()}</span></div>
  <div>Store: <span>${orderObj.storeName || 'The Grand Mall Luxury Concierge'}</span></div>
  <div>Customer: <span>${orderObj.customerName || 'Valued Guest'}</span></div>
  <div>Phone: <span>${orderObj.customerPhone || '+91 98765 43210'}</span></div>
  <div>Payment: <span>${orderObj.paymentMethod || 'Concierge Counter'}</span></div>
</div>
<table>
  <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>₹${(orderObj.rawAmount || orderObj.totalAmount || finalCartTotal).toLocaleString()}</span></div>
  ${couponRow ? `<div class="total-row" style="color:#059669">${couponRow.replace(/<[^>]+>/g,'').trim()}</div>` : ''}
  <div class="total-row"><span>GST (5% Included)</span><span>₹${gst.toLocaleString()}</span></div>
  <div class="grand"><span>TOTAL AMOUNT PAID</span><span>₹${(orderObj.totalAmount || finalCartTotal).toLocaleString()}</span></div>
</div>
<div class="barcode">||| | ||||| ||| || | |||| ||| ||||||| | |||</div>
<div class="footer">Verified by AXIONIX Smart POS Gateway<br>Thank you for shopping at The Grand Mall!</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`);
    printWin.document.close();
  };

  const saveOrderToLocalStorage = (orderObj: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem('axionix_orders_list') || '[]');
      existing.unshift(orderObj);
      localStorage.setItem('axionix_orders_list', JSON.stringify(existing));
      localStorage.setItem('axionix_last_event', JSON.stringify({ type: 'NEW_ORDER', order: orderObj, timestamp: Date.now() }));

      if (orderObj.appliedCoupon) {
        const cpnRedemption = {
          id: `rdm-${Date.now()}`,
          couponId: `cpn-${orderObj.appliedCoupon}`,
          couponCode: orderObj.appliedCoupon,
          customerName: orderObj.customerName || 'Valued Guest',
          customerPhone: orderObj.customerPhone || '+91 98000 00000',
          redeemedAt: 'Just now',
          storeName: orderObj.storeName || 'The Grand Mall',
          discountApplied: 'Applied at Checkout',
          savingsAmount: `₹${(orderObj.discountAmount || 1500).toLocaleString()} Saved`,
          channel: 'WiFi Captive Portal',
          orderNumber: orderObj.orderNumber || '#AX-LIVE',
          vipStatus: true
        };
        const existingRedemptions = JSON.parse(localStorage.getItem('axionix_coupon_redemptions') || '[]');
        localStorage.setItem('axionix_coupon_redemptions', JSON.stringify([cpnRedemption, ...existingRedemptions]));
        window.dispatchEvent(new Event('axionix_coupon_redeemed'));
      }

      const bc = new BroadcastChannel('axionix_events');
      bc.postMessage({ type: 'NEW_ORDER', order: orderObj });
      bc.close();

      window.dispatchEvent(new Event('axionix_order_added'));
    } catch (e) {}
  };

  const handlePlaceReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryBrands = brands.filter(b => b.category === selectedMainCategory);
    const targetStore = resSelectedBrand || (categoryBrands.length > 0 ? categoryBrands[0].name : (activeBrandModal ? activeBrandModal.name : 'Nike Flagship'));
    if (targetStore) {
      recordUserStoreVisit(targetStore);
    }

    // Check if customer already booked this store for the same date & time slot
    const existingStoreBooking = myReservations.find(r => 
      r.storeName?.toLowerCase().trim() === targetStore?.toLowerCase().trim() && 
      r.status !== 'Cancelled' &&
      r.status !== 'Completed' &&
      r.status !== 'No Show' &&
      isUserReservation(r) &&
      (r.date === resDate && r.timeSlot === resTime)
    );

    if (existingStoreBooking) {
      setToastMessage(`⚠️ You already have an active booking for ${targetStore} at ${resTime} on ${resDate}.`);
      return;
    }

    const currentSlotInfo = availableSlots.find((s: any) => s.timeSlot === resTime);
    const isSlotFull = currentSlotInfo?.isFull || (currentSlotInfo && currentSlotInfo.available <= 0);
    const exceedsCapacity = currentSlotInfo && resPartySize > currentSlotInfo.available;

    if (isSlotFull) {
      setToastMessage(`⛔ This time slot (${resTime}) is FULL for ${targetStore}. Please choose another time.`);
      return;
    }

    if (exceedsCapacity) {
      setToastMessage(`⛔ Slot unavailable: Party size (${resPartySize}) exceeds remaining seats (${currentSlotInfo.available} left for ${targetStore}). Please check another slot or reduce party size.`);
      return;
    }

    const consistentRefCode = `RES-${targetStore.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
    const consistentId = `res-${Date.now()}`;

    const cleanCurrentPhone = (mobileNumber || customerProfile?.phone || '').replace(/\D/g, '');

    const newResPayload = {
      id: consistentId,
      refCode: consistentRefCode,
      guestName: fullName || customerProfile?.full_name || 'Valued Guest',
      guestPhone: cleanCurrentPhone || mobileNumber || '+91 98000 00000',
      userId: customerProfile?.id,
      storeName: targetStore,
      partySize: resPartySize,
      timeSlot: resTime,
      date: resDate,
      status: 'Confirmed',
      specialNotes: resNotes || 'VIP Fitting Suite'
    };

    try {
      const existingRes = JSON.parse(localStorage.getItem('axionix_reservations') || '[]');
      localStorage.setItem('axionix_reservations', JSON.stringify([newResPayload, ...existingRes]));
      localStorage.setItem('axionix_reservations_latest', JSON.stringify(newResPayload));

      const bc = new BroadcastChannel('axionix_reservation_events');
      bc.postMessage({ type: 'RESERVATION_CREATED', reservation: newResPayload });
      bc.close();
    } catch (err) {}

    window.dispatchEvent(new CustomEvent('axionix_reservation_created', { detail: newResPayload }));
    setMyReservations(prev => [newResPayload, ...prev.filter(p => p.refCode !== newResPayload.refCode && p.id !== newResPayload.id)]);

    // Create Reservation in Supabase public.reservations with the same consistent refCode
    createReservationInSupabase({
      id: consistentId,
      refCode: consistentRefCode,
      userId: customerProfile?.id,
      storeName: targetStore,
      guestName: fullName || 'Valued Guest',
      guestPhone: mobileNumber,
      guestEmail: emailAddress || undefined,
      partySize: resPartySize,
      timeSlot: resTime,
      reservationDate: resDate,
      date: resDate,
      specialNotes: resNotes
    });

    fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResPayload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResSuccess(data.reservation);
        } else {
          setResSuccess(newResPayload);
        }
      })
      .catch(() => {
        setResSuccess(newResPayload);
      });
  };

  const filteredBrands = brands.filter(b => {
    const matchesCategory = b.category === selectedMainCategory;
    const hasMatchingItems = b.items && b.items.some(item => matchCategoryTag(item.category, selectedSubTag));
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.floor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && hasMatchingItems && matchesSearch;
  });

  const getFilteredModalItems = () => {
    if (!activeBrandModal || !activeBrandModal.items) return [];
    if (!selectedSubTag) return activeBrandModal.items;
    return activeBrandModal.items.filter(item => matchCategoryTag(item.category, selectedSubTag));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Global Header Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          {currentStep !== 'login' && (
            <button
              onClick={() => setCurrentStep('category-hub')}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 bg-slate-900 text-amber-400 font-extrabold text-sm rounded-full flex items-center justify-center border-2 border-amber-400/40 shadow-sm">
            GM
          </div>
          <span className="font-serif-title text-xl font-extrabold text-slate-900 tracking-tight">THE GRAND MALL</span>
        </div>

        {currentStep !== 'login' && (
          <div className="flex items-center space-x-3">
            {/* Loyalty Tier & Points Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{loyaltyAccount.tier || 'Silver'} VIP</span>
              <span className="bg-amber-200/60 px-2 py-0.5 rounded-full text-[10px] font-black">{loyaltyAccount.pointsBalance || 350} pts</span>
            </div>

            {/* Mall Pay Wallet Pill (Feature 11) */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-slate-900 to-indigo-950 border border-blue-400/40 rounded-full text-xs font-bold text-white shadow-xs hover:border-blue-400 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-blue-300" />
              <span className="hidden sm:inline">Mall Pay:</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-black border border-emerald-400/30">
                ₹{mallWallet.balance.toLocaleString()}
              </span>
            </button>


            <div className="w-9 h-9 bg-slate-900 text-white font-bold text-sm rounded-full flex items-center justify-center shadow-xs">
              {fullName ? fullName[0].toUpperCase() : 'G'}
            </div>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-6xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* 1. GUEST CAPTIVE WI-FI LOGIN SCREEN (BLANK DEFAULTS + STRICT VALIDATION)   */}
        {/* ========================================================================= */}
        {currentStep === 'login' && (
          <div className="w-full max-w-lg mx-auto py-6">
            
            <div className="text-center mb-8">
              <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                THE GRAND MALL
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Complimentary High-Speed Wi-Fi & Personal Concierge
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 relative">
              
              <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setActiveVisitorTab('new')}
                  className={`w-1/2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    activeVisitorTab === 'new'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Visitor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisitorTab('returning')}
                  className={`w-1/2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    activeVisitorTab === 'returning'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Returning Guest
                </button>
              </div>

              {registeredGuestDetected && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Welcome back, {registeredGuestDetected}! Recognized registered guest profile.</span>
                </div>
              )}

              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Mobile Number <span className="text-rose-500">* (10 Digits)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="10-Digit Mobile No."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-slate-400 font-normal lowercase">(Optional, must end with @gmail.com)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartVerify('sms')}
                      className="w-full sm:w-1/2 py-3.5 bg-[#1b4332] hover:bg-[#143427] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>VERIFY VIA SMS OTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartVerify('whatsapp')}
                      className="w-full sm:w-1/2 py-3.5 bg-stone-200/90 hover:bg-stone-300 text-stone-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 border border-stone-300/80"
                    >
                      <span>💬 VERIFY VIA WHATSAPP</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 py-1">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          value={mobileNumber}
                          readOnly
                          className="w-full bg-stone-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (resendCountdown === 0) handleStartVerify(verifyMethod);
                        }}
                        disabled={resendCountdown > 0}
                        className={`px-5 py-3.5 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shrink-0 ${
                          resendCountdown > 0
                            ? 'bg-[#1b4332] text-white opacity-90 cursor-not-allowed'
                            : 'bg-[#1b4332] hover:bg-[#143427] text-white cursor-pointer shadow-md'
                        }`}
                      >
                        {resendCountdown > 0 ? `RESEND (${resendCountdown}S)` : 'RESEND OTP'}
                      </button>
                    </div>
                  </div>

                  {/* OTP CARD CONTAINER MATCHING SCREENSHOT */}
                  <div className="p-5 bg-stone-50/80 border border-slate-200/90 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                        <Key className="w-4 h-4 text-emerald-700" />
                        <span>Enter 4-Digit OTP sent via {verifyMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} to +91 {mobileNumber}</span>
                      </div>
                      <div className="px-3 py-1 bg-stone-200/70 border border-stone-300/80 rounded-xl text-[11px] font-black text-slate-700 flex items-center space-x-1">
                        <span>Demo OTP:</span>
                        <span className="text-emerald-800 font-mono text-xs">{generatedOtpCode || '2564'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter OTP"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-center tracking-widest text-lg font-bold text-slate-900 focus:border-emerald-700 focus:outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleCompleteVerify}
                        className="px-7 py-3 bg-[#1b4332] hover:bg-[#143427] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-900/20 transition-all cursor-pointer shrink-0"
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-slate-400 font-normal lowercase">(Optional, must end with @gmail.com)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CATEGORY HUB PAGE                                                      */}
        {/* ========================================================================= */}
        {currentStep === 'category-hub' && (
          <div className="w-full max-w-xl mx-auto py-8">
            <div className="text-center mb-10">
              <h1 className="font-serif-title text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {fullName || 'Shopper'}
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-2">
                What are you in the mood for today?
              </p>
            </div>

            <div className="space-y-5">
              <div
                onClick={() => handleSelectCategoryFromHub('Food', 'Brunch')}
                className="bg-white border border-slate-200 hover:border-blue-500/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    🍔
                  </div>
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      FOOD & DINING
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Food', 'Brunch'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Brunch
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Food', 'Fine Dining'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Fine Dining
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Food', 'Quick Bites'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Quick Bites
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-blue-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-2">
                  →
                </div>
              </div>

              <div
                onClick={() => handleSelectCategoryFromHub('Fashion', 'Shoes')}
                className="bg-white border border-slate-200 hover:border-blue-500/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    👔
                  </div>
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      FASHION & APPAREL
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Fashion', 'Hoodies'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Hoodies
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Fashion', 'Shoes'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Shoes
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Fashion', 'Trending'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Trending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-blue-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-2">
                  →
                </div>
              </div>

              <div
                onClick={() => handleSelectCategoryFromHub('Accessories', 'Watches')}
                className="bg-white border border-slate-200 hover:border-blue-500/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-purple-50 border border-purple-200/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    ⌚
                  </div>
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      ACCESSORIES & LIFESTYLE
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Accessories', 'Watches'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Watches
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Accessories', 'Bags & Leather'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Bags & Leather
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSelectCategoryFromHub('Accessories', 'Jewelry'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Jewelry
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-blue-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-2">
                  →
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ACCESSORIES ITEM SELECTOR                                              */}
        {/* ========================================================================= */}
        {currentStep === 'accessories' && (
          <div className="w-full max-w-2xl mx-auto py-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <button
                onClick={() => setCurrentStep('category-hub')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>← Back to Categories</span>
              </button>

              <span className="px-3.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase tracking-wider border border-slate-200">
                ACCESSORIES
              </span>
            </div>

            <h2 className="font-serif-title text-3xl font-extrabold text-slate-900">
              Accessories & Lifestyle
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1 mb-6">
              Select item type.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { name: 'Watches', icon: '⌚' },
                { name: 'Bags & Leather', icon: '👜' },
                { name: 'Jewelry', icon: '💎' },
                { name: 'Eyewear', icon: '🕶️' }
              ].map(item => (
                <div
                  key={item.name}
                  onClick={() => setSelectedAccessoryType(item.name)}
                  className={`rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    selectedAccessoryType === item.name
                      ? 'bg-blue-50/80 border-2 border-blue-600 shadow-sm'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-bold text-sm text-slate-900">{item.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setSelectedSubTag(selectedAccessoryType); setCurrentStep('stores'); }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
            >
              FIND MATCHING STORES
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. FASHION ITEM SELECTOR                                                  */}
        {/* ========================================================================= */}
        {currentStep === 'fashion' && (
          <div className="w-full max-w-3xl mx-auto py-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <button
                onClick={() => setCurrentStep('category-hub')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>← Back to Categories</span>
              </button>

              <span className="px-3.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase tracking-wider border border-slate-200">
                FASHION
              </span>
            </div>

            <h2 className="font-serif-title text-3xl font-extrabold text-slate-900">
              Fashion & Apparel
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1 mb-6">
              Select garment type and sizing.
            </p>

            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                STEP 1: CHOOSE GARMENT
              </p>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: 'Hoodies', icon: '🧥' },
                  { name: 'T-Shirts', icon: '👕' },
                  { name: 'Shirts', icon: '👔' },
                  { name: 'Pants', icon: '👖' },
                  { name: 'Shoes', icon: '👟' }
                ].map(g => (
                  <div
                    key={g.name}
                    onClick={() => setSelectedGarment(g.name)}
                    className={`rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                      selectedGarment === g.name
                        ? 'bg-blue-50/80 border-2 border-blue-600 shadow-sm'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="font-bold text-xs text-slate-900">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSelectedSubTag(selectedGarment); setCurrentStep('stores'); }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer mt-4"
            >
              FIND MATCHING STORES
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. STORE ROSTER VIEW                                                      */}
        {/* ========================================================================= */}
        {currentStep === 'stores' && (
          <div className="w-full max-w-6xl mx-auto py-2">
            
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-sm">
                  LM
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-sm text-slate-900 tracking-tight">LUXURY MALL</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">CUSTOMER CONCIERGE PORTAL</p>
                </div>
              </div>

              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search stores or luxury products..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  onClick={() => { setCheckoutModalOpen(true); setCheckoutStep('cart'); }}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                </button>

                <button
                  onClick={() => setResModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {selectedMainCategory === 'Food' ? 'Reserve Table' : 'Reserve Fitting Suite'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif-title text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>
                    {selectedMainCategory === 'Food' ? '🍔 Food & Dining' : selectedMainCategory === 'Fashion' ? '👔 Fashion & Apparel' : '⌚ Accessories & Lifestyle'} — 
                  </span>
                  <span className="text-blue-600 font-bold"> {selectedSubTag}</span>
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {selectedMainCategory === 'Food' ? `Showing restaurants that serve ${selectedSubTag}. Click a restaurant to see full menu.` : selectedMainCategory === 'Fashion' ? `Showing boutiques that carry ${selectedSubTag}. Click a store to browse apparel.` : `Showing luxury boutiques offering ${selectedSubTag}.`}
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('category-hub')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                ← Change Type
              </button>
            </div>

            {filteredBrands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBrands.map(brand => {
                  const matchingItems = brand.items ? brand.items.filter(i => matchCategoryTag(i.category, selectedSubTag)) : [];

                  return (
                    <div
                      key={brand.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <BrandLogo logoVariant={brand.logoVariant} storeName={brand.name} className="w-12 h-12 rounded-2xl" />
                            <div>
                              <h3 className="font-serif-title text-lg font-bold text-slate-900">{brand.name}</h3>
                              <p className="text-xs text-slate-500">{brand.floor} • Suite 110</p>
                            </div>
                          </div>

                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-full">
                            {brand.tag || 'Boutique Store'}
                          </span>
                        </div>

                        {selectedMainCategory === 'Fashion' ? (
                          <BrandBanner
                            storeName={brand.name}
                            logoVariant={brand.logoVariant}
                            className="my-4 w-full h-40"
                          />
                        ) : (
                          <div className="my-4 relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs group">
                            {(() => {
                              const matchingItemWithImage = matchingItems.find(i => i.image);
                              const displayImg = (matchingItemWithImage && matchingItemWithImage.image) || (brand.images && brand.images[0]) || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
                              return (
                                <img
                                  src={displayImg}
                                  alt={`${brand.name} Brand Showcase`}
                                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              );
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4">
                              <div className="flex items-center space-x-3 text-white">
                                <BrandLogo logoVariant={brand.logoVariant} storeName={brand.name} className="w-9 h-9 rounded-xl" />
                                <div>
                                  <h4 className="font-extrabold text-sm tracking-tight text-white">{brand.name}</h4>
                                  <p className="text-[11px] text-slate-200 font-medium">{brand.floor} • {brand.zone}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {matchingItems.length} {selectedSubTag} Items Available
                        </span>

                        <button
                          onClick={() => handleViewStore(brand)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <span>View Store & Catalog</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
                <p className="text-sm text-slate-500 font-medium">No stores found matching "{selectedSubTag}".</p>
                <button
                  onClick={() => setCurrentStep('category-hub')}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Return to Categories
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <Check className="w-3 h-3" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONCIERGE CART MODAL                                                   */}
      {/* ========================================================================= */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            <button
              onClick={() => { setCheckoutModalOpen(false); setOrderSuccess(null); }}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {!orderSuccess ? (
              <>
                <div className="flex-shrink-0 mb-3 border-b border-slate-100 pb-3 pr-8">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                    <span className={checkoutStep === 'cart' ? 'text-blue-600 font-extrabold' : ''}>1. Cart & Offers</span>
                    <span>→</span>
                    <span className={checkoutStep === 'payment' ? 'text-blue-600 font-extrabold' : ''}>2. Payment Selection</span>
                  </div>
                  <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900">
                    {checkoutStep === 'cart' ? 'Concierge Shopping Cart' : 'Select Payment Option'}
                  </h3>
                </div>

                {checkoutStep === 'cart' && (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[52vh]">
                    <div className="space-y-2.5">
                      {cart.length > 0 ? (
                        cart.map(({ item, brandName, quantity }) => (
                          <div key={item.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                                {brandName}
                              </span>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">{item.name}</h5>
                              <p className="text-xs font-extrabold text-slate-700 mt-0.5">₹{item.price.toLocaleString()} each</p>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2.5 text-xs font-extrabold text-slate-900">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-xs text-slate-500 font-semibold">Your concierge cart is empty.</p>
                        </div>
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-blue-900 flex items-center space-x-1.5 uppercase tracking-wider">
                            <Ticket className="w-4 h-4 text-blue-600" />
                            <span>PRELOADED BRAND COUPONS & PROMO CODES</span>
                          </h4>
                          {appliedCoupon && (
                            <button
                              onClick={() => setAppliedCoupon(null)}
                              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Remove Coupon
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(() => {
                            const cartBrandNames = cart.map(c => c.brandName.toLowerCase());
                            const relevantCoupons = PRELOADED_COUPONS.filter(cpn => {
                              const cpnStore = cpn.storeName.toLowerCase();
                              if (cpnStore.includes('grand mall') || cpnStore.includes('concierge') || cpnStore.includes('all stores')) {
                                return true;
                              }
                              return cartBrandNames.some(bName => bName.includes(cpnStore) || cpnStore.includes(bName));
                            });
                            const displayCoupons = relevantCoupons.length > 0
                              ? relevantCoupons
                              : PRELOADED_COUPONS.filter(cpn => cpn.storeName.toLowerCase().includes('grand mall'));

                            return displayCoupons.map(cpn => {
                              const isApplied = appliedCoupon?.code === cpn.code;
                              return (
                                <div
                                  key={cpn.id}
                                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                                    isApplied
                                      ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                                      : 'bg-white border-slate-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-black text-xs text-slate-900">{cpn.code}</span>
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                        {cpn.discount}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">{cpn.title}</p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(cpn)}
                                    className={`mt-2 w-full py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      isApplied
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-900 hover:bg-blue-600 text-white'
                                    }`}
                                  >
                                    {isApplied ? 'Applied ✓' : 'Apply Coupon'}
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        <div className="pt-1 flex items-center space-x-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value)}
                            placeholder="ENTER PROMO CODE (E.G. GRANDMALL20)"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase focus:border-blue-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyManualCoupon}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                          >
                            Apply Code
                          </button>
                        </div>

                        {couponError && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1">{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[52vh]">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>← Back to Cart Items & Coupons</span>
                    </button>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Payable Amount</span>
                        <span className="font-extrabold text-2xl text-blue-600 tracking-tight">₹{finalCartTotal.toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                        {cart.reduce((a, b) => a + b.quantity, 0)} Items
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      SELECT FULFILLMENT / PAYMENT OPTION:
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      
                      {/* MALL PAY UNIFIED WALLET */}
                      <div
                        onClick={() => { setSelectedPaymentOption('mallpay'); setPaymentFormError(null); }}
                        className={`col-span-2 rounded-2xl p-4 cursor-pointer transition-all ${
                          selectedPaymentOption === 'mallpay'
                            ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-2 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 border border-blue-400/30">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm tracking-tight text-white">Mall Pay (Unified Wallet)</span>
                                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-0.5">
                                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> 2x VIP Points
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-200/80 font-medium">Instant 1-Tap Debit from Shared Family Wallet</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-blue-300/80 block">Wallet Balance</span>
                            <span className="font-extrabold text-sm text-emerald-400">₹{mallWallet.balance.toLocaleString()}</span>
                          </div>
                        </div>
                        {mallWallet.balance < finalCartTotal && selectedPaymentOption === 'mallpay' && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-rose-300 font-bold">
                            <span>⚠️ Balance too low for order (₹{finalCartTotal.toLocaleString()})</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsWalletModalOpen(true);
                                setWalletTab('topup');
                              }}
                              className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" /> Top Up Wallet Now
                            </button>
                          </div>
                        )}
                      </div>

                      {/* UPI / GPAY */}
                      <div
                        onClick={() => { setSelectedPaymentOption('upi'); setPaymentFormError(null); }}
                        className={`col-span-2 rounded-2xl cursor-pointer transition-all border ${
                          selectedPaymentOption === 'upi'
                            ? 'border-blue-500 shadow-sm bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">UPI</div>
                          <div className="flex-1">
                            <p className="font-bold text-xs text-slate-900">UPI / GPay</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                            selectedPaymentOption === 'upi' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>{selectedPaymentOption === 'upi' && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5" />}</div>
                        </div>
                        {selectedPaymentOption === 'upi' && (
                          <div className="px-3.5 pb-3.5 space-y-2" onClick={e => e.stopPropagation()}>
                            <div className="border-t border-blue-100 pt-3">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Enter UPI ID</label>
                              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={e => { setUpiId(e.target.value); setPaymentFormError(null); }}
                                  placeholder="yourname@okaxis / 9999999999@ybl"
                                  className="flex-1 px-3 py-2 text-xs font-mono text-slate-800 bg-transparent outline-none"
                                />
                                <span className="px-3 text-[10px] font-bold text-slate-400 border-l border-slate-200">UPI</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Format: name@bank or mobilenumber@upi</p>
                              <div className="flex gap-2 mt-2">
                                {[
                                  { name: 'GPay', handle: '@okaxis', icon: '🟡' },
                                  { name: 'PhonePe', handle: '@ybl', icon: '🟣' },
                                  { name: 'Paytm', handle: '@paytm', icon: '🔵' }
                                ].map(app => (
                                  <button
                                    key={app.name}
                                    type="button"
                                    onClick={() => {
                                      const base = upiId.includes('@') ? upiId.split('@')[0] : upiId.trim();
                                      if (base) {
                                        setUpiId(base + app.handle);
                                      } else if (activeVisitorTab === 'returning' && mobileNumber) {
                                        setUpiId(mobileNumber.replace(/\D/g, '') + app.handle);
                                      } else {
                                        setUpiId(app.handle);
                                      }
                                      setPaymentFormError(null);
                                    }}
                                    className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                                  >
                                    {app.icon} {app.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CREDIT / DEBIT CARD */}
                      <div
                        onClick={() => { setSelectedPaymentOption('card'); setPaymentFormError(null); }}
                        className={`col-span-2 rounded-2xl cursor-pointer transition-all border ${
                          selectedPaymentOption === 'card'
                            ? 'border-blue-500 shadow-sm bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white flex-shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-xs text-slate-900">Credit / Debit Card</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                            selectedPaymentOption === 'card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>{selectedPaymentOption === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5" />}</div>
                        </div>
                        {selectedPaymentOption === 'card' && (
                          <div className="px-3.5 pb-3.5 space-y-2.5" onClick={e => e.stopPropagation()}>
                            <div className="border-t border-blue-100 pt-3 space-y-2.5">
                              {/* Card preview strip */}
                              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="w-8 h-6 rounded bg-amber-400/80" />
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : cardNumber.startsWith('6') ? 'RUPAY' : 'CARD'}
                                  </span>
                                </div>
                                <p className="font-mono text-sm tracking-[0.2em] text-slate-100">
                                  {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                                </p>
                                <div className="flex justify-between mt-3">
                                  <span className="text-[10px] text-slate-400 font-semibold">{cardName || 'CARD HOLDER'}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{cardExpiry || 'MM/YY'}</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Card Number</label>
                                <input
                                  type="text"
                                  maxLength={16}
                                  value={cardNumber}
                                  onChange={e => { setCardNumber(e.target.value.replace(/\D/g, '')); setPaymentFormError(null); }}
                                  placeholder="1234 5678 9012 3456"
                                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Cardholder Name</label>
                                <input
                                  type="text"
                                  value={cardName}
                                  onChange={e => { setCardName(e.target.value.toUpperCase()); setPaymentFormError(null); }}
                                  placeholder="AS ON CARD"
                                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                                  <input
                                    type="text"
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={e => {
                                      let v = e.target.value.replace(/\D/g, '');
                                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                      setCardExpiry(v.slice(0, 5));
                                      setPaymentFormError(null);
                                    }}
                                    placeholder="MM/YY"
                                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">CVV</label>
                                  <input
                                    type="password"
                                    maxLength={4}
                                    value={cardCvv}
                                    onChange={e => { setCardCvv(e.target.value.replace(/\D/g, '')); setPaymentFormError(null); }}
                                    placeholder="•••"
                                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span>🔒</span>
                                <span>256-bit SSL encrypted. We never store your card details.</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAY AT COUNTER */}
                      <div
                        onClick={() => { setSelectedPaymentOption('counter'); setPaymentFormError(null); }}
                        className={`rounded-2xl cursor-pointer transition-all border ${
                          selectedPaymentOption === 'counter'
                            ? 'border-blue-500 shadow-sm bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 p-3.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base flex-shrink-0">🏪</div>
                          <div className="flex-1">
                            <p className="font-bold text-xs text-slate-900">Pay at Counter</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Cash / Card on Pickup</p>
                          </div>
                        </div>
                        {selectedPaymentOption === 'counter' && (
                          <div className="px-3.5 pb-3.5" onClick={e => e.stopPropagation()}>
                            <div className="border-t border-blue-100 pt-3 bg-emerald-50 rounded-xl p-3 space-y-1.5">
                              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">✅ Order reserved — pay at store counter</p>
                              <p className="text-[10px] text-emerald-700">• Show your order QR or reference number at the store</p>
                              <p className="text-[10px] text-emerald-700">• Pay by cash, card, or UPI at the counter</p>
                              <p className="text-[10px] text-emerald-700">• Pickup within <strong>2 hours</strong> of placing the order</p>
                              <div className="mt-2 bg-white border border-emerald-200 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-slate-500">Estimated amount due at counter</p>
                                <p className="text-lg font-extrabold text-emerald-700">₹{finalCartTotal.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* APPLE PAY */}
                      <div
                        onClick={() => { setSelectedPaymentOption('apple'); setPaymentFormError(null); }}
                        className={`rounded-2xl cursor-pointer transition-all border ${
                          selectedPaymentOption === 'apple'
                            ? 'border-blue-500 shadow-sm bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 p-3.5">
                          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white text-base flex-shrink-0">🍎</div>
                          <div className="flex-1">
                            <p className="font-bold text-xs text-slate-900">Apple Pay</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Instant One-Tap Pay</p>
                          </div>
                        </div>
                        {selectedPaymentOption === 'apple' && (
                          <div className="px-3.5 pb-3.5" onClick={e => e.stopPropagation()}>
                            <div className="border-t border-blue-100 pt-3 space-y-2">
                              <div className="bg-black rounded-2xl p-4 text-white text-center space-y-2 shadow-lg">
                                <p className="text-2xl">🍎</p>
                                <p className="text-xs font-bold tracking-tight">Apple Pay</p>
                                <p className="text-[10px] text-white/60">Secured by Face ID / Touch ID</p>
                                <div className="bg-white/10 rounded-xl p-2.5 mt-1">
                                  <p className="text-[10px] text-white/70">Amount</p>
                                  <p className="text-xl font-extrabold tracking-tight">₹{finalCartTotal.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/5 border border-white/20 rounded-xl p-2 text-[10px] text-white/60">
                                  <span>💳 Visa •••• 4242 &nbsp;|&nbsp; Default Card</span>
                                </div>
                              </div>
                              <p className="text-center text-[10px] text-slate-500">Tap <strong>"Pay ₹{finalCartTotal.toLocaleString()} &amp; Place Order"</strong> below to authenticate with Face ID / Touch ID</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment form validation error */}
                    {paymentFormError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-rose-700 mb-2">
                        ❌ {paymentFormError}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-shrink-0 pt-3 border-t border-slate-100 space-y-2 bg-white mt-2">
                  {cart.length > 0 && checkoutStep === 'cart' && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Cart Subtotal</span>
                        <span className="font-bold text-slate-900">₹{rawCartTotal.toLocaleString()}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span>- ₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center font-extrabold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                        <span>Total Payable Amount</span>
                        <span className="text-lg text-blue-600">₹{finalCartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'cart' ? (
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>PROCEED TO PAYMENT (₹{finalCartTotal.toLocaleString()})</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPaymentFormError(null);
                        // Validate UPI
                        if (selectedPaymentOption === 'upi') {
                          const upiTrimmed = upiId.trim();
                          if (!upiTrimmed) { setPaymentFormError('Please enter your UPI ID to proceed.'); return; }
                          const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
                          if (!upiRegex.test(upiTrimmed)) { setPaymentFormError('Invalid UPI ID format. Example: name@okaxis or 9999999999@ybl'); return; }
                        }
                        // Validate Card
                        if (selectedPaymentOption === 'card') {
                          if (!cardNumber || cardNumber.length < 16) { setPaymentFormError('Please enter a valid 16-digit card number.'); return; }
                          if (!cardName.trim()) { setPaymentFormError('Please enter the cardholder name.'); return; }
                          const [mm, yy] = (cardExpiry || '').split('/');
                          if (!mm || !yy || isNaN(Number(mm)) || isNaN(Number(yy)) || Number(mm) < 1 || Number(mm) > 12 || yy.length !== 2) {
                            setPaymentFormError('Please enter a valid expiry date (MM/YY).'); return;
                          }
                          if (!cardCvv || cardCvv.length < 3) { setPaymentFormError('Please enter a valid CVV (3 or 4 digits).'); return; }
                        }
                        // Apple Pay biometric simulation
                        if (selectedPaymentOption === 'apple') {
                          setIsApplePayProcessing(true);
                          setTimeout(() => { setIsApplePayProcessing(false); handlePlaceOrder(); }, 1800);
                          return;
                        }
                        handlePlaceOrder();
                      }}
                      disabled={isPlacingOrder || isApplePayProcessing}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isApplePayProcessing ? (
                        <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> Authenticating Face ID…</span>
                      ) : isPlacingOrder ? (
                        <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> Processing…</span>
                      ) : (
                        <>
                          <span>
                            {selectedPaymentOption === 'apple' ? '🍎 PAY WITH APPLE PAY' :
                             selectedPaymentOption === 'upi' ? '📱 PAY WITH UPI' :
                             selectedPaymentOption === 'card' ? '💳 PAY WITH CARD' :
                             selectedPaymentOption === 'counter' ? '🏪 RESERVE & PAY AT COUNTER' :
                             `PAY ₹${finalCartTotal.toLocaleString()} & PLACE ORDER`}
                          </span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-2 text-slate-900 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                {/* Status Badge & Header */}
                <div className="text-center pb-3 border-b border-slate-100 no-print">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-serif-title text-2xl font-bold text-slate-900">AXIONIX POS Verified!</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Order Ref: <span className="font-mono font-extrabold text-blue-600">{orderSuccess.orderNumber || '#AX-9496'}</span></p>
                  <p className="text-xs text-slate-700 font-semibold mt-1">Total Amount Paid: <span className="font-extrabold text-emerald-600">₹{(orderSuccess.totalAmount || finalCartTotal).toLocaleString()}</span></p>
                </div>

                {/* THERMAL / DIGITAL RECEIPT CARD (PRINTABLE) */}
                <div id="digital-receipt-printable" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-sans text-left space-y-3 relative overflow-hidden">
                  
                  {/* Watermark / Mall Branding */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                    <div>
                      <h4 className="font-serif-title font-extrabold text-base tracking-tight text-slate-900">THE GRAND MALL</h4>
                      <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">AXIONIX SMART POS DIGITAL INVOICE</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase border border-emerald-300">
                        PAID ✓
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{orderSuccess.orderNumber || '#AX-9496'}</p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Store / Service</span>
                      <span className="font-bold text-slate-800">{orderSuccess.storeName || 'Luxury Concierge'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Date & Time</span>
                      <span className="font-medium text-slate-800">{orderSuccess.timestamp || new Date().toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Customer</span>
                      <span className="font-medium text-slate-800">{orderSuccess.customerName || fullName || 'Valued Guest'} ({orderSuccess.customerPhone || mobileNumber || '+91 98765 43210'})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Method</span>
                      <span className="font-bold text-blue-600">{orderSuccess.paymentMethod || 'Paid at Concierge'}</span>
                    </div>
                  </div>

                  {/* Purchased Items Table */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-[11px] font-extrabold text-slate-400 uppercase border-b border-slate-200 pb-1">
                      <span>Item Description</span>
                      <span>Qty & Amount</span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {((orderSuccess.items && orderSuccess.items.length > 0) ? orderSuccess.items : cart).map((c: any, idx: number) => {
                        const name = c.item ? c.item.name : (c.name || 'Item');
                        const qty = c.quantity || 1;
                        const price = c.item ? c.item.price : (c.price || 0);
                        return (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1.5">
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{name}</p>
                              <p className="text-[10px] text-slate-500">{c.brandName || orderSuccess.storeName || 'The Grand Mall'}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <span className="font-mono text-slate-600 text-[11px] block">{qty} x ₹{price.toLocaleString()}</span>
                              <span className="font-extrabold text-slate-900">₹{(qty * price).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t-2 border-slate-900 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-slate-900">₹{(orderSuccess.rawAmount || orderSuccess.totalAmount || finalCartTotal).toLocaleString()}</span>
                    </div>

                    {orderSuccess.appliedCoupon && (
                      <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <span>Coupon Discount ({orderSuccess.appliedCoupon})</span>
                        <span>- ₹{(orderSuccess.discountAmount || discountAmount).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>GST (5% Included)</span>
                      <span className="font-mono">₹{Math.round(((orderSuccess.totalAmount || finalCartTotal) * 5) / 105).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-300">
                      <span>TOTAL AMOUNT PAID</span>
                      <span className="text-lg text-emerald-600 font-black">₹{(orderSuccess.totalAmount || finalCartTotal).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Barcode & Security Stamp */}
                  <div className="pt-2 text-center border-t border-dashed border-slate-300 space-y-1">
                    <div className="font-mono text-xs text-slate-400 tracking-widest uppercase select-none font-bold">
                      ||| | ||||| ||| || | |||| ||| ||||||| | |||
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Verified by AXIONIX Smart POS Gateway • Thank you for shopping!</p>
                  </div>

                </div>

                {/* ACTION BUTTONS (NO-PRINT) */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 no-print">
                  <button
                    onClick={handlePrintReceipt}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT RECEIPT</span>
                  </button>

                  <button
                    onClick={() => handleDownloadReceipt(orderSuccess)}
                    className="py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD RECEIPT</span>
                  </button>

                  <button
                    onClick={() => { setCheckoutModalOpen(false); setOrderSuccess(null); setCart([]); setAppliedCoupon(null); setCheckoutStep('cart'); }}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl border border-slate-300 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span>Back to Concierge</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Store Item Catalog Modal */}
      {activeBrandModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveBrandModal(null)}
              className="absolute top-5 right-5 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <BrandLogo logoVariant={activeBrandModal.logoVariant} storeName={activeBrandModal.name} className="w-14 h-14 rounded-2xl" />
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-slate-900">{activeBrandModal.name}</h2>
                <p className="text-xs text-slate-500">{activeBrandModal.floor} • Suite 110 ({activeBrandModal.zone})</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available {selectedSubTag} Items
              </h4>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-[11px] rounded-full">
                {selectedSubTag}
              </span>
            </div>

            {/* GARMENT / APPAREL SIZE SELECTION */}
            {activeBrandModal.category === 'Fashion' && (
              <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  GLOBAL GARMENT SIZE
                </p>
                <div className="flex items-center space-x-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {getFilteredModalItems().length > 0 ? (
                getFilteredModalItems().map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.image || (activeBrandModal.images && activeBrandModal.images[0]) || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.category}</p>

                        {/* SPECIFIC ITEM SIZE CHIPS (Fashion apparel only) */}
                        {activeBrandModal.category === 'Fashion' && item.sizes && item.sizes.length > 0 && (
                          <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                            {item.sizes.map(sz => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setSelectedSize(sz)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                  selectedSize === sz
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        )}

                        <p className="text-sm font-extrabold text-blue-600 mt-1.5">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item, activeBrandModal.name)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">No items available under "{selectedSubTag}" for this brand.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIP Table / Fitting Suite Reservation Modal (Feature 08 Enhanced) */}
      {resModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setResModalOpen(false); setResSuccess(null); setWaitlistSuccessInfo(null); }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!resSuccess && !waitlistSuccessInfo ? (
              <form onSubmit={handlePlaceReservation} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif-title text-2xl font-bold text-slate-900">
                      {selectedMainCategory === 'Food' ? 'Reserve Dining Table' : 'Reserve Fitting Suite'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedMainCategory === 'Food'
                        ? 'Book an exclusive dining table with live capacity check'
                        : 'Book a private VIP fitting suite & personal styling session'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedMainCategory === 'Food' ? 'Select Restaurant' : selectedMainCategory === 'Fashion' ? 'Select Fashion Boutique' : 'Select Store Venue'}
                  </label>
                  <select
                    value={resSelectedBrand}
                    onChange={e => setResSelectedBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer font-bold"
                  >
                    {brands
                      .filter(b => b.category === selectedMainCategory)
                      .map(b => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.floor})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Duplicate Store Booking Warning Banner */}


                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Reservation Date</label>
                    <input
                      type="date"
                      value={resDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setResDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Party Size</label>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={resPartySize}
                        onChange={e => setResPartySize(Number(e.target.value))}
                        className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Slot Availability Check (Feature 08) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Time Slot &amp; Live Availability</label>
                    {isLoadingSlots && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Checking capacity...</span>}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map(slot => {
                      const isSelected = resTime === slot.timeSlot;
                      const isFull = slot.isFull || slot.available <= 0;
                      const exceedsParty = resPartySize > slot.available;
                      const isUnavailable = isFull || exceedsParty;

                      return (
                        <button
                          key={slot.timeSlot}
                          type="button"
                          onClick={() => setResTime(slot.timeSlot)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? isUnavailable
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-300'
                                : 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                              : isFull
                              ? 'bg-rose-50/70 text-rose-900 border-rose-200 hover:border-amber-400'
                              : exceedsParty
                              ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:border-amber-400'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">{slot.timeSlot}</span>
                          <div className="mt-1 flex items-center justify-between">
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : isFull
                                  ? 'bg-rose-200 text-rose-800'
                                  : exceedsParty
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isFull ? 'SLOT FULL' : exceedsParty ? `${slot.available} Left` : `${slot.available} Left`}
                            </span>
                            {slot.waitlistCount > 0 && (
                              <span className={`text-[9px] font-bold ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                                {slot.waitlistCount} wait
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot Full / Party Exceeded Warning */}
                  {(() => {
                    const selSlot = availableSlots.find(s => s.timeSlot === resTime);
                    if (!selSlot) return null;
                    if (selSlot.isFull || selSlot.available <= 0) {
                      return (
                        <div className="p-3 mt-2 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-800 text-xs font-bold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>⛔ This time slot is FULL ({selSlot.bookedCount}/{selSlot.maxCapacity} booked). Please choose another open time slot.</span>
                        </div>
                      );
                    }
                    if (resPartySize > selSlot.available) {
                      return (
                        <div className="p-3 mt-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-amber-900 text-xs font-bold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>⛔ Slot unavailable for party of {resPartySize} (only {selSlot.available} seats left out of {selSlot.maxCapacity}). Please check another slot or reduce party size.</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedMainCategory === 'Food' ? 'Special Dining Requests' : 'Special Fitting & Stylist Requests'}
                  </label>
                  <input
                    type="text"
                    value={resNotes}
                    onChange={e => setResNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                    placeholder={selectedMainCategory === 'Food' ? 'e.g. VIP Window Table, High Chair' : 'e.g. VIP Fitting Suite & Personal Stylist'}
                  />
                </div>

                {/* Dynamic Button: Booking vs Slot Full / Exceeded */}
                {(() => {
                  const selectedSlotObj = availableSlots.find(s => s.timeSlot === resTime);
                  const isFull = !selectedSlotObj || selectedSlotObj.isFull || selectedSlotObj.available <= 0;
                  const exceedsParty = selectedSlotObj ? resPartySize > selectedSlotObj.available : false;
                  const isUnavailable = isFull || exceedsParty;

                  return (
                    <button
                      type="submit"
                      disabled={isUnavailable || isJoiningWaitlist}
                      className={`w-full py-4 font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 ${
                        isUnavailable
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed opacity-90 shadow-none'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/25 cursor-pointer active:scale-98'
                      }`}
                    >
                      {isFull ? (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>SLOT IS FULL — NO BOOKINGS AVAILABLE</span>
                        </>
                      ) : exceedsParty ? (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>SLOT UNAVAILABLE — CHECK ANOTHER SLOT</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>{selectedMainCategory === 'Food' ? 'CONFIRM TABLE BOOKING' : 'CONFIRM FITTING SUITE BOOKING'}</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </form>
            ) : waitlistSuccessInfo ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Hourglass className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    Waitlist Spot #{waitlistSuccessInfo.position} Confirmed
                  </span>
                  <h3 className="font-serif-title text-xl font-bold text-slate-900 mt-2">
                    You're on the Live Waitlist!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {waitlistSuccessInfo.storeName} • {waitlistSuccessInfo.timeSlot} • {waitlistSuccessInfo.date}
                  </p>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Real-Time SSE Notification Active</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    When an admin or guest frees a table or marks a no-show, you will receive an instant real-time alert and your table will be booked!
                  </p>
                </div>

                <button
                  onClick={() => { setResModalOpen(false); setWaitlistSuccessInfo(null); }}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close &amp; Keep Monitoring
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-serif-title text-xl font-bold text-slate-900">
                  {selectedMainCategory === 'Food' ? 'Table Booking Confirmed!' : 'Fitting Suite Reserved!'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Ref Code: <span className="font-bold text-blue-600">{resSuccess.refCode}</span></p>
                <p className="text-xs text-slate-700 mt-2 font-semibold">{resSuccess.storeName} at {resSuccess.timeSlot}</p>
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setResModalOpen(false); setResSuccess(null); }}
                    className="w-full sm:w-auto px-7 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelReservation(resSuccess)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Reservation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 08: Real-Time Waitlist Promotion Banner Alert */}
      {waitlistPromotedBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 rounded-3xl shadow-2xl border border-emerald-500/50 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-400/30">
                Table Freed • Promoted!
              </span>
              <h4 className="font-bold text-xs text-white mt-0.5">
                {waitlistPromotedBanner.storeName} • {waitlistPromotedBanner.timeSlot}
              </h4>
              <p className="text-[11px] text-emerald-200/90 font-medium">A table just opened up and your reservation is confirmed!</p>
            </div>
          </div>
          <button
            onClick={() => setWaitlistPromotedBanner(null)}
            className="p-1.5 text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* ========================================================================= */}
      {/* PRODUCT OPTIONS & CUSTOMIZATION SELECTION MODAL                           */}
      {/* ========================================================================= */}
      {selectedProductForOptions && (() => {
        const isFood = isFoodItem(selectedProductForOptions.item, selectedProductForOptions.storeName);
        const currentUnitPrice = calculateDynamicUnitPrice(selectedProductForOptions.item, optSize, optFit, optColor);
        const currentImg = getDynamicProductImage(selectedProductForOptions.item, optColor);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="max-w-lg w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
              
              <button
                onClick={() => setSelectedProductForOptions(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Summary Header */}
              <div className="flex items-center space-x-4 border-b border-slate-100 pb-4 pr-6">
                <div className="relative group overflow-hidden rounded-2xl shrink-0">
                  <img
                    src={currentImg}
                    alt={selectedProductForOptions.item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-50 transition-all duration-300 transform group-hover:scale-105"
                  />
                  {!isFood && (
                    <span className="absolute bottom-1 right-1 text-[9px] font-extrabold bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      {optColor.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {selectedProductForOptions.storeName} • {selectedProductForOptions.item.category || 'Product Options'}
                  </span>
                  <h3 className="font-serif-title text-lg font-extrabold text-slate-900 mt-1 leading-snug">
                    {selectedProductForOptions.item.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-base font-extrabold text-emerald-600">
                      ₹{currentUnitPrice.toLocaleString()}
                    </span>
                    {currentUnitPrice > selectedProductForOptions.item.price && (
                      <span className="text-[10px] text-slate-400 line-through font-semibold">
                        ₹{selectedProductForOptions.item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OPTION 1: SIZING / PORTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                  <span>1. {isFood ? 'Select Portion / Serving Size:' : 'Select Size / Specification:'}</span>
                  <span className="text-[10px] text-blue-600 font-extrabold font-mono">{optSize}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(selectedProductForOptions.item.sizes && selectedProductForOptions.item.sizes.length > 0
                    ? selectedProductForOptions.item.sizes
                    : (isFood
                        ? ['Standard Portion', 'Double Serving Platter (+₹180)']
                        : selectedProductForOptions.item.category === 'Shoes' || selectedProductForOptions.item.name.toLowerCase().includes('shoe') || selectedProductForOptions.item.name.toLowerCase().includes('jordan') || selectedProductForOptions.item.name.toLowerCase().includes('sneaker')
                        ? ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
                        : selectedProductForOptions.item.category === 'Watches'
                        ? ['36mm Steel', '40mm Everose Gold', '41mm Oystersteel', '42mm Matte Black']
                        : selectedProductForOptions.item.category === 'Bags & Leather'
                        ? ['PM Small (Compact)', 'MM Medium (Standard)', 'GM Large (Travel)']
                        : selectedProductForOptions.item.category === 'Jewelry'
                        ? ['US 6 (16.5mm)', 'US 7 (17.3mm)', 'US 8 (18.1mm)', '18 inch Chain']
                        : selectedProductForOptions.item.category === 'Eyewear'
                        ? ['Standard Fit (52mm)', 'Wide Fit (55mm)', 'Oversized (58mm)']
                        : ['S', 'M', 'L', 'XL', 'XXL']
                      )
                  ).map(sz => {
                    let badge = '';
                    if (!isFood) {
                      if (sz === 'XXL') badge = ' (+₹200)';
                      else if (sz === 'UK 11') badge = ' (+₹800)';
                      else if (sz.includes('40mm Everose')) badge = ' (+₹4.5L)';
                      else if (sz.includes('41mm Yellow Gold')) badge = ' (+₹8.5L)';
                      else if (sz.includes('GM Large')) badge = ' (+₹35k)';
                    }

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setOptSize(sz)}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                          optSize === sz
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sz}{badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPTION 2: TYPE / FIT / PREPARATION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                  <span>2. {isFood ? 'Select Preparation / Style:' : 'Select Type / Fit / Strap / Finish:'}</span>
                  <span className="text-[10px] text-slate-900 font-extrabold font-mono">{optFit}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(isFood
                    ? ['Chef Fresh Hot Prep', 'Chilled & Iced Blend', 'Extra Syrup & Berry Dip', 'Deluxe Truffle & Melted Cheese']
                    : selectedProductForOptions.item.category === 'Shoes' || selectedProductForOptions.item.name.toLowerCase().includes('shoe') || selectedProductForOptions.item.name.toLowerCase().includes('jordan') || selectedProductForOptions.item.name.toLowerCase().includes('sneaker')
                    ? ['Standard Fit', 'Wide Fit', 'High Top', 'Low Top Retro']
                    : selectedProductForOptions.item.category === 'Watches' || selectedProductForOptions.item.name.toLowerCase().includes('watch')
                    ? ['Oyster Bracelet', 'Jubilee Bracelet', 'Leather Strap', 'Rubber Sports Band']
                    : selectedProductForOptions.item.category === 'Bags & Leather' || selectedProductForOptions.item.name.toLowerCase().includes('bag')
                    ? ['Monogram Canvas', 'Damier Leather', 'Saffiano Leather', 'Smooth Calfskin']
                    : selectedProductForOptions.item.category === 'Jewelry' || selectedProductForOptions.item.name.toLowerCase().includes('gold') || selectedProductForOptions.item.name.toLowerCase().includes('ring')
                    ? ['18k Yellow Gold', '18k Rose Gold', '18k White Gold', 'Platinum']
                    : selectedProductForOptions.item.category === 'Eyewear'
                    ? ['Polarized G-15 Lens', 'Gradient Sun Tint', 'Anti-Reflective Blue Light']
                    : ['Regular Fit', 'Slim Fit', 'Oversized Relaxed']
                  ).map(fit => {
                    let badge = '';
                    if (isFood) {
                      if (fit === 'Extra Syrup & Berry Dip') badge = ' (+₹80)';
                      else if (fit === 'Deluxe Truffle & Melted Cheese') badge = ' (+₹140)';
                    } else {
                      if (fit === 'Slim Fit') badge = ' (+₹300)';
                      else if (fit === 'Oversized Relaxed') badge = ' (+₹500)';
                      else if (fit === 'Wide Fit') badge = ' (+₹600)';
                      else if (fit.includes('High Top')) badge = ' (+₹1,500)';
                      else if (fit === 'Jubilee Bracelet') badge = ' (+₹85,000)';
                      else if (fit === 'Leather Strap') badge = ' (+₹15,000)';
                      else if (fit === 'Saffiano Leather') badge = ' (+₹25,000)';
                      else if (fit === 'Smooth Calfskin') badge = ' (+₹35,000)';
                      else if (fit === '18k Rose Gold') badge = ' (+₹45,000)';
                      else if (fit === '18k White Gold') badge = ' (+₹55,000)';
                      else if (fit === 'Platinum') badge = ' (+₹1,20,000)';
                      else if (fit === 'Gradient Sun Tint') badge = ' (+₹2,500)';
                    }

                    return (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setOptFit(fit)}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                          optFit === fit
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {fit}{badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPTION 3: COLOR / DIETARY PREFERENCE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                  <span>3. {isFood ? 'Select Dietary Preference / Add-On:' : 'Select Color / Edition:'}</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold font-mono">{optColor}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(isFood
                    ? ['Chef Signature Recipe', 'Eggless / Vegetarian', 'Vegan Organic', 'Extra Gourmet Ice Cream Scoop']
                    : selectedProductForOptions.item.category === 'Watches' || selectedProductForOptions.item.category === 'Jewelry' || selectedProductForOptions.item.name.toLowerCase().includes('watch')
                    ? ['18k Rose Gold', 'Yellow Gold Finish', 'Platinum Silver', 'Deep Navy Blue']
                    : selectedProductForOptions.item.category === 'Shoes' || selectedProductForOptions.item.name.toLowerCase().includes('shoe') || selectedProductForOptions.item.name.toLowerCase().includes('jordan')
                    ? ['Classic White', 'Midnight Black', 'Chicago Red', 'Retro Multi-Color']
                    : ['Classic Black', 'Pure White', 'Navy Blue', 'Signature Tan']
                  ).map(col => {
                    let badge = '';
                    if (isFood) {
                      if (col === 'Eggless / Vegetarian') badge = ' (+₹30)';
                      else if (col === 'Extra Gourmet Ice Cream Scoop') badge = ' (+₹120)';
                    } else {
                      if (col.includes('Navy') || col.includes('Blue')) badge = ' (+₹400)';
                      else if (col.includes('Chicago') || col.includes('Red')) badge = ' (+₹1,200)';
                      else if (col.includes('Rose Gold')) badge = ' (+₹25,000)';
                    }

                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setOptColor(col)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          optColor === col
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {col}{badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUANTITY SELECTOR & TOTAL PRICE */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Total Price ({optQuantity} item{optQuantity > 1 ? 's' : ''})</span>
                  <span className="text-xl font-extrabold text-blue-600">₹{(currentUnitPrice * optQuantity).toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-3 border border-slate-200 rounded-2xl bg-slate-50 p-1.5">
                  <button
                    type="button"
                    onClick={() => setOptQuantity(Math.max(1, optQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold text-slate-900 px-2">{optQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setOptQuantity(optQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CONFIRM BUTTON */}
              <button
                onClick={handleConfirmAddToCartWithOptions}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>CONFIRM &amp; ADD TO CONCIERGE CART (₹{(currentUnitPrice * optQuantity).toLocaleString()})</span>
              </button>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* QR CODE SCANNER & SMART WAYFINDER MODAL                                   */}
      {/* ========================================================================= */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100 text-center space-y-4">
            <button onClick={() => setIsQrScannerOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif-title text-xl font-bold text-slate-900">QR Code &amp; Smart Wayfinder</h3>
              <p className="text-xs text-slate-500 mt-1">Scan physical mall entrance QR or enter code below to auto-navigate to stores, apply coupons, or view product details.</p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700">Enter QR Payload or Code</label>
              <input
                type="text"
                value={qrInputCode}
                onChange={e => setQrInputCode(e.target.value)}
                placeholder="e.g. QR_STORE_nike, GRANDMALL20, or WAYFINDER"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => handleProcessQrScan(qrInputCode || 'GRANDMALL20')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                SIMULATE QR SCAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 11 — INTEGRATED MALL PAY (UNIFIED WALLET MODAL)                   */}
      {/* ========================================================================= */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsWalletModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {/* Wallet Header Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-400/30 shadow-inner">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif-title text-xl font-black text-white">Mall Pay</h3>
                      <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> 2x Points
                      </span>
                    </div>
                    <p className="text-xs text-blue-200/80 font-medium">Unified Shared Family Wallet • Phone: {mobileNumber || '+91 98987 65432'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-300/80 block">Current Balance</span>
                  <span className="font-extrabold text-2xl text-emerald-400">₹{mallWallet.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-extrabold">
              <button
                onClick={() => setWalletTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  walletTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ledger &amp; Overview
              </button>
              <button
                onClick={() => setWalletTab('topup')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  walletTab === 'topup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Top Up Wallet
              </button>
              <button
                onClick={() => setWalletTab('family')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  walletTab === 'family'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" /> Family Wallet ({mallWallet.familyMembers.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & LEDGER */}
            {walletTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-amber-900 font-medium">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span><strong>2x Cashback Loyalty:</strong> All purchases paid with Mall Pay earn double VIP Points instantly!</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction History</h4>
                  <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {mallWallet.transactions.length > 0 ? (
                      mallWallet.transactions.map(tx => (
                        <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                tx.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {tx.type}
                              </span>
                              <span className="font-extrabold text-slate-900">{tx.description}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Ref: {tx.referenceId || '-'} • {new Date(tx.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className={`font-extrabold text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-400 font-medium">No transactions recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TOP UP WALLET */}
            {walletTab === 'topup' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">Select a quick top-up preset or enter a custom amount to add funds instantly via UPI or Card.</p>
                
                {/* Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTopUpCustomAmount(String(amt));
                      }}
                      className={`py-2.5 rounded-xl border font-extrabold text-xs transition-all cursor-pointer ${
                        topUpCustomAmount === String(amt)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/30'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-blue-500'
                      }`}
                    >
                      +₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Custom Top-Up Amount (₹)</label>
                  <input
                    type="number"
                    value={topUpCustomAmount}
                    onChange={e => setTopUpCustomAmount(e.target.value)}
                    placeholder="Enter amount in ₹"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-sm font-extrabold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  id="confirm-topup-button"
                  onClick={handlePerformTopUp}
                  disabled={isTopUpProcessing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-75 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95 z-20 relative"
                >
                  {isTopUpProcessing ? (
                    <span className="animate-pulse">Processing Secure UPI / Card Top-Up...</span>
                  ) : topUpSuccessNotice ? (
                    <div className="flex items-center space-x-1.5 text-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{topUpSuccessNotice}</span>
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>CONFIRM TOP UP (₹{((!isNaN(parseFloat(String(topUpCustomAmount).replace(/[^\d.]/g, ''))) && parseFloat(String(topUpCustomAmount).replace(/[^\d.]/g, '')) > 0) ? parseFloat(String(topUpCustomAmount).replace(/[^\d.]/g, '')) : 1000).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: FAMILY & GROUP WALLET */}
            {walletTab === 'family' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">Add family members to share your Mall Pay wallet balance for effortless group shopping and dining.</p>

                {/* Family Members List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mallWallet.familyMembers.map(mem => (
                    <div key={mem.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{mem.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{mem.phone} • {mem.relation}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-200">
                        Shared Access
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Member Form */}
                <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Add New Family Member</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newFamilyName}
                      onChange={e => setNewFamilyName(e.target.value)}
                      placeholder="Member Full Name"
                      className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      value={newFamilyPhone}
                      onChange={e => setNewFamilyPhone(e.target.value)}
                      placeholder="Mobile Phone (+91)"
                      className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!newFamilyName || !newFamilyPhone) return;
                      const activePhone = mobileNumber.trim() || localStorage.getItem('axionix_active_guest_phone') || '9014657788';
                      const updated = addFamilyMemberToWallet(activePhone, newFamilyName, newFamilyPhone, newFamilyRelation);
                      setMallWallet(updated);
                      setNewFamilyName('');
                      setNewFamilyPhone('');
                      setToastMessage(`Added ${newFamilyName} to Shared Family Wallet!`);
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98"
                  >
                    + Add Member to Shared Wallet
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Global Live Toast Notification Banner (Neat & Prominent) */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92%] sm:w-auto bg-slate-900/98 text-white px-5 py-4 rounded-3xl shadow-2xl border-2 border-amber-400/40 flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Concierge Alert
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug break-words">
                {toastMessage}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-slate-400 hover:text-white p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex-shrink-0 self-start sm:self-center"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-6 py-4 text-center text-xs font-medium text-slate-400">
        THE GRAND MALL • Complimentary High-Speed Wi-Fi &amp; Personal Concierge
      </footer>
    </div>
  );
}
