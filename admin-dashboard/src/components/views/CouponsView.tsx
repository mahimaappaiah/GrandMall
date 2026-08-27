import React, { useState, useEffect } from 'react';
import { Ticket, Search, Plus, Copy, Users, Calendar, Download, Eye, X, UserCheck, Smartphone, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { Coupon, CouponRedemption } from '../../types';
import { downloadCouponsCSV, downloadRedeemedCustomersCSV } from '../../utils/exportUtils';
import { fetchCouponsFromSupabase, recordAuditLog } from '../../services/supabaseService';
import { BACKEND_URL } from '../../lib/config';
import { MOCK_COUPONS } from '../../data/mockData';

// WEBSITE ACTIVE COUPONS DATABASE MAPPED STRICTLY TO CUSTOMER PORTAL & ALL MALL BRANDS
const WEBSITE_WEBSITE_COUPONS: Coupon[] = MOCK_COUPONS;

const OLD_UNUSED_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'NIKEVIP15',
    title: '15% Off Nike Apparel & Shoes',
    discount: '15% OFF',
    storeName: 'Nike Flagship',
    category: 'Fashion',
    issuedCount: 1500,
    redeemedCount: 342,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'All Mall Guests',
    redeemedCustomers: [
      { id: 'rdm-101', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '12 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹2,549 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1090', vipStatus: true },
      { id: 'rdm-102', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', redeemedAt: '25 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹2,379 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true }
    ]
  },
  {
    id: 'cpn-2',
    code: 'ZARASUMMER10',
    title: '10% Off Zara Summer Collection',
    discount: '10% OFF',
    storeName: 'Zara Flagship',
    category: 'Fashion',
    issuedCount: 2000,
    redeemedCount: 520,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Fashion Lovers',
    redeemedCustomers: [
      { id: 'rdm-201', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', redeemedAt: '18 mins ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹499 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true },
      { id: 'rdm-202', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '35 mins ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹359 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: true }
    ]
  },
  {
    id: 'cpn-3',
    code: 'GUCCIEXCLUSIVE',
    title: 'Flat ₹10,000 Off Luxury Orders',
    discount: '₹10,000 OFF',
    storeName: 'Gucci Boutique',
    category: 'Luxury',
    issuedCount: 500,
    redeemedCount: 88,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'VIP Shoppers',
    redeemedCustomers: [
      { id: 'rdm-301', couponId: 'cpn-3', couponCode: 'GUCCIEXCLUSIVE', customerName: 'Priya Sharma', customerPhone: '+91 98345 67890', redeemedAt: '30 mins ago', storeName: 'Gucci Boutique', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1085', vipStatus: true }
    ]
  },
  {
    id: 'cpn-4',
    code: 'PRADAVIP15',
    title: '15% Off Prada Haute Couture',
    discount: '15% OFF',
    storeName: 'Prada Atelier',
    category: 'Luxury',
    issuedCount: 450,
    redeemedCount: 64,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'VIP Shoppers',
    redeemedCustomers: [
      { id: 'rdm-401', couponId: 'cpn-4', couponCode: 'PRADAVIP15', customerName: 'Claire Montrose', customerPhone: '+91 98111 22334', redeemedAt: '15 mins ago', storeName: 'Prada Atelier', discountApplied: '15% OFF', savingsAmount: '₹12,750 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1092', vipStatus: true }
    ]
  },
  {
    id: 'cpn-5',
    code: 'USPOLOVIP20',
    title: '20% Off U.S. Polo Heritage Collection',
    discount: '20% OFF',
    storeName: 'U.S. Polo Assn.',
    category: 'Fashion',
    issuedCount: 1600,
    redeemedCount: 310,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Preppy & Sports Fashion',
    redeemedCustomers: [
      { id: 'rdm-1301', couponId: 'cpn-5', couponCode: 'USPOLOVIP20', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: '8 mins ago', storeName: 'U.S. Polo Assn.', discountApplied: '20% OFF', savingsAmount: '₹880 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1099', vipStatus: true }
    ]
  },
  {
    id: 'cpn-6',
    code: 'HMESSENTIALS20',
    title: '20% Off H&M Modern Apparel',
    discount: '20% OFF',
    storeName: 'H&M Everyday Fashion',
    category: 'Fashion',
    issuedCount: 2100,
    redeemedCount: 540,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Everyday Fashion',
    redeemedCustomers: [
      { id: 'rdm-1401', couponId: 'cpn-6', couponCode: 'HMESSENTIALS20', customerName: 'Sanya Gupta', customerPhone: '+91 98112 33445', redeemedAt: '14 mins ago', storeName: 'H&M Everyday Fashion', discountApplied: '20% OFF', savingsAmount: '₹599 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1091', vipStatus: false }
    ]
  },
  {
    id: 'cpn-7',
    code: 'STARBUCKSFREE',
    title: 'Flat ₹300 Off Starbucks Brunch',
    discount: '₹300 OFF',
    storeName: 'Starbucks Reserve',
    category: 'Food',
    issuedCount: 2200,
    redeemedCount: 680,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Coffee & Brunch Diners',
    redeemedCustomers: [
      { id: 'rdm-501', couponId: 'cpn-7', couponCode: 'STARBUCKSFREE', customerName: 'Mahima Roy', customerPhone: '+91 98123 45678', redeemedAt: '5 mins ago', storeName: 'Starbucks Reserve', discountApplied: '₹300 OFF', savingsAmount: '₹300 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1095', vipStatus: true }
    ]
  },
  {
    id: 'cpn-8',
    code: 'DINTAIFUNG20',
    title: '20% Off Asian Fine Dining',
    discount: '20% OFF',
    storeName: 'Din Tai Fung',
    category: 'Food',
    issuedCount: 1200,
    redeemedCount: 310,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Fine Diners',
    redeemedCustomers: [
      { id: 'rdm-601', couponId: 'cpn-8', couponCode: 'DINTAIFUNG20', customerName: 'Chen Wei', customerPhone: '+91 98111 99887', redeemedAt: '14 mins ago', storeName: 'Din Tai Fung', discountApplied: '20% OFF', savingsAmount: '₹1,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1091', vipStatus: true }
    ]
  },
  {
    id: 'cpn-9',
    code: 'PIZZAEXPRESS15',
    title: '15% Off PizzaExpress Gourmet Dining',
    discount: '15% OFF',
    storeName: 'PizzaExpress Gourmet',
    category: 'Food',
    issuedCount: 1400,
    redeemedCount: 380,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Italian Dining Lovers',
    redeemedCustomers: [
      { id: 'rdm-1501', couponId: 'cpn-9', couponCode: 'PIZZAEXPRESS15', customerName: 'Rohan Malhotra', customerPhone: '+91 98444 55667', redeemedAt: '20 mins ago', storeName: 'PizzaExpress Gourmet', discountApplied: '15% OFF', savingsAmount: '₹345 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1089', vipStatus: true }
    ]
  },
  {
    id: 'cpn-10',
    code: 'COFFEEDAY100',
    title: 'Flat ₹100 Off Artisanal Coffee & Bakery',
    discount: '₹100 OFF',
    storeName: 'Coffee Day',
    category: 'Food',
    issuedCount: 1900,
    redeemedCount: 620,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Coffee & Cafe Diners',
    redeemedCustomers: [
      { id: 'rdm-1601', couponId: 'cpn-10', couponCode: 'COFFEEDAY100', customerName: 'Kriti Verma', customerPhone: '+91 98666 77889', redeemedAt: '30 mins ago', storeName: 'Coffee Day', discountApplied: '₹100 OFF', savingsAmount: '₹100 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1081', vipStatus: false }
    ]
  },
  {
    id: 'cpn-11',
    code: 'SUBWAYFRESH15',
    title: '15% Off Subway Fresh Subs & Combos',
    discount: '15% OFF',
    storeName: 'Subway Fresh Gourmet',
    category: 'Food',
    issuedCount: 1750,
    redeemedCount: 490,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Quick Bites & Combos',
    redeemedCustomers: [
      { id: 'rdm-1701', couponId: 'cpn-11', couponCode: 'SUBWAYFRESH15', customerName: 'Aman Deep', customerPhone: '+91 98777 11223', redeemedAt: '12 mins ago', storeName: 'Subway Fresh Gourmet', discountApplied: '15% OFF', savingsAmount: '₹120 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1094', vipStatus: false }
    ]
  },
  {
    id: 'cpn-12',
    code: 'HAAGEN20',
    title: '20% Off Gourmet Ice Cream & Waffles',
    discount: '20% OFF',
    storeName: 'Häagen-Dazs',
    category: 'Food',
    issuedCount: 1300,
    redeemedCount: 310,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Dessert Lovers',
    redeemedCustomers: [
      { id: 'rdm-1801', couponId: 'cpn-12', couponCode: 'HAAGEN20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '16 mins ago', storeName: 'Häagen-Dazs', discountApplied: '20% OFF', savingsAmount: '₹280 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1090', vipStatus: true }
    ]
  },
  {
    id: 'cpn-13',
    code: 'LVMAISON10',
    title: '10% Off LV Monogram Leather & Bags',
    discount: '10% OFF',
    storeName: 'Louis Vuitton Maison',
    category: 'Accessories',
    issuedCount: 600,
    redeemedCount: 112,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Luxury Accessories',
    redeemedCustomers: [
      { id: 'rdm-801', couponId: 'cpn-13', couponCode: 'LVMAISON10', customerName: 'Charlotte Dubois', customerPhone: '+91 98777 88990', redeemedAt: '28 mins ago', storeName: 'Louis Vuitton Maison', discountApplied: '10% OFF', savingsAmount: '₹16,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1084', vipStatus: true }
    ]
  },
  {
    id: 'cpn-14',
    code: 'HERMESLUX10',
    title: '10% Off Hermès Leather & Birkin',
    discount: '10% OFF',
    storeName: 'Hermès Leather Lounge',
    category: 'Accessories',
    issuedCount: 300,
    redeemedCount: 45,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Ultra Luxury Shoppers',
    redeemedCustomers: [
      { id: 'rdm-1401', couponId: 'cpn-14', couponCode: 'HERMESLUX10', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: '15 mins ago', storeName: 'Hermès Leather Lounge', discountApplied: '10% OFF', savingsAmount: '₹45,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1097', vipStatus: true }
    ]
  },
  {
    id: 'cpn-15',
    code: 'COACHNEWYORK20',
    title: '20% Off Coach Leather Bags & Totes',
    discount: '20% OFF',
    storeName: 'Coach New York',
    category: 'Accessories',
    issuedCount: 950,
    redeemedCount: 195,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Designer Bags',
    redeemedCustomers: [
      { id: 'rdm-1501', couponId: 'cpn-15', couponCode: 'COACHNEWYORK20', customerName: 'Ananya Roy', customerPhone: '+91 98222 33445', redeemedAt: '32 mins ago', storeName: 'Coach New York', discountApplied: '20% OFF', savingsAmount: '₹7,900 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1083', vipStatus: false }
    ]
  },
  {
    id: 'cpn-16',
    code: 'BOTTEGAVIP15',
    title: '15% Off Intrecciato Woven Leather',
    discount: '15% OFF',
    storeName: 'Bottega Veneta',
    category: 'Accessories',
    issuedCount: 420,
    redeemedCount: 68,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Luxury Bags',
    redeemedCustomers: [
      { id: 'rdm-1601', couponId: 'cpn-16', couponCode: 'BOTTEGAVIP15', customerName: 'Marco Bellini', customerPhone: '+91 98111 88990', redeemedAt: '40 mins ago', storeName: 'Bottega Veneta', discountApplied: '15% OFF', savingsAmount: '₹22,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1079', vipStatus: true }
    ]
  },
  {
    id: 'cpn-17',
    code: 'TIFFANYDIAMOND',
    title: 'Flat ₹15,000 Off Fine Jewelry',
    discount: '₹15,000 OFF',
    storeName: 'Tiffany & Co.',
    category: 'Accessories',
    issuedCount: 400,
    redeemedCount: 95,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Fine Jewelry Buyers',
    redeemedCustomers: [
      { id: 'rdm-1701', couponId: 'cpn-17', couponCode: 'TIFFANYDIAMOND', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: 'Just now', storeName: 'Tiffany & Co.', discountApplied: '₹15,000 OFF', savingsAmount: '₹15,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1098', vipStatus: true }
    ]
  },
  {
    id: 'cpn-18',
    code: 'CARTIERLUX20',
    title: 'Flat ₹20,000 Off Diamond Jewelry',
    discount: '₹20,000 OFF',
    storeName: 'Cartier High Jewelry',
    category: 'Accessories',
    issuedCount: 350,
    redeemedCount: 58,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'High Net Worth Shoppers',
    redeemedCustomers: [
      { id: 'rdm-1801', couponId: 'cpn-18', couponCode: 'CARTIERLUX20', customerName: 'Elena Rossi', customerPhone: '+91 98765 43236', redeemedAt: '19 mins ago', storeName: 'Cartier High Jewelry', discountApplied: '₹20,000 OFF', savingsAmount: '₹20,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1086', vipStatus: true }
    ]
  },
  {
    id: 'cpn-19',
    code: 'BVLGARI25',
    title: 'Flat ₹25,000 Off Serpenti & B.zero1',
    discount: '₹25,000 OFF',
    storeName: 'Bvlgari Haute Joaillerie',
    category: 'Accessories',
    issuedCount: 380,
    redeemedCount: 52,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Haute Joaillerie',
    redeemedCustomers: [
      { id: 'rdm-1901', couponId: 'cpn-19', couponCode: 'BVLGARI25', customerName: 'Gianluca Conti', customerPhone: '+91 98450 99001', redeemedAt: '22 mins ago', storeName: 'Bvlgari Haute Joaillerie', discountApplied: '₹25,000 OFF', savingsAmount: '₹25,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1087', vipStatus: true }
    ]
  },
  {
    id: 'cpn-20',
    code: 'SWAROVSKI20',
    title: '20% Off Crystal Jewelry & Sets',
    discount: '20% OFF',
    storeName: 'Swarovski Crystal Pavilion',
    category: 'Accessories',
    issuedCount: 1100,
    redeemedCount: 260,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Crystal Jewelry',
    redeemedCustomers: [
      { id: 'rdm-2001', couponId: 'cpn-20', couponCode: 'SWAROVSKI20', customerName: 'Natasha Fernandez', customerPhone: '+91 98999 11122', redeemedAt: '11 mins ago', storeName: 'Swarovski Crystal Pavilion', discountApplied: '20% OFF', savingsAmount: '₹3,780 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1093', vipStatus: false }
    ]
  },
  {
    id: 'cpn-21',
    code: 'TANISHQGOLD',
    title: 'Flat ₹10,000 Off Kundan & 22k Gold',
    discount: '₹10,000 OFF',
    storeName: 'Tanishq Royal Heritage',
    category: 'Accessories',
    issuedCount: 850,
    redeemedCount: 180,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Bridal & Gold Jewelry',
    redeemedCustomers: [
      { id: 'rdm-2101', couponId: 'cpn-21', couponCode: 'TANISHQGOLD', customerName: 'Pooja Iyer', customerPhone: '+91 98444 33221', redeemedAt: '35 mins ago', storeName: 'Tanishq Royal Heritage', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1081', vipStatus: true }
    ]
  },
  {
    id: 'cpn-22',
    code: 'MALABARVIP',
    title: 'Flat ₹12,000 Off Solitaire Diamonds',
    discount: '₹12,000 OFF',
    storeName: 'Malabar Gold & Diamonds',
    category: 'Accessories',
    issuedCount: 780,
    redeemedCount: 145,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Solitaire & Gold Shoppers',
    redeemedCustomers: [
      { id: 'rdm-2201', couponId: 'cpn-22', couponCode: 'MALABARVIP', customerName: 'Kavita Menon', customerPhone: '+91 98333 77665', redeemedAt: '44 mins ago', storeName: 'Malabar Gold & Diamonds', discountApplied: '₹12,000 OFF', savingsAmount: '₹12,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1074', vipStatus: true }
    ]
  },
  {
    id: 'cpn-23',
    code: 'RAYBAN20',
    title: '20% Off Designer Eyewear',
    discount: '20% OFF',
    storeName: 'Ray-Ban Sunglass Hut',
    category: 'Accessories',
    issuedCount: 1500,
    redeemedCount: 290,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Lifestyle & Sunglasses',
    redeemedCustomers: [
      { id: 'rdm-2301', couponId: 'cpn-23', couponCode: 'RAYBAN20', customerName: 'Kavita B.', customerPhone: '+91 98765 43247', redeemedAt: '33 mins ago', storeName: 'Ray-Ban Sunglass Hut', discountApplied: '20% OFF', savingsAmount: '₹2,498 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: false }
    ]
  },
  {
    id: 'cpn-24',
    code: 'SUNGLASSHUT15',
    title: '15% Off Versace & Designer Shades',
    discount: '15% OFF',
    storeName: 'Sunglass Hut Premier',
    category: 'Accessories',
    issuedCount: 900,
    redeemedCount: 175,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Luxury Eyewear',
    redeemedCustomers: [
      { id: 'rdm-2401', couponId: 'cpn-24', couponCode: 'SUNGLASSHUT15', customerName: 'Arjun Sen', customerPhone: '+91 98111 66554', redeemedAt: '27 mins ago', storeName: 'Sunglass Hut Premier', discountApplied: '15% OFF', savingsAmount: '₹4,125 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1085', vipStatus: false }
    ]
  },
  {
    id: 'cpn-25',
    code: 'OAKLEYSPORT20',
    title: '20% Off Polarized & Prizm Vision',
    discount: '20% OFF',
    storeName: 'Oakley Performance Vision',
    category: 'Accessories',
    issuedCount: 1200,
    redeemedCount: 230,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Sports & Active Eyewear',
    redeemedCustomers: [
      { id: 'rdm-2501', couponId: 'cpn-25', couponCode: 'OAKLEYSPORT20', customerName: 'Rohan Deshmukh', customerPhone: '+91 98777 44332', redeemedAt: '16 mins ago', storeName: 'Oakley Performance Vision', discountApplied: '20% OFF', savingsAmount: '₹2,840 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1090', vipStatus: true }
    ]
  },
  {
    id: 'cpn-26',
    code: 'TOMFORDVIP',
    title: 'Flat ₹5,000 Off Luxury Eyewear',
    discount: '₹5,000 OFF',
    storeName: 'Tom Ford Eyewear',
    category: 'Accessories',
    issuedCount: 650,
    redeemedCount: 95,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Vintage Luxury Shades',
    redeemedCustomers: [
      { id: 'rdm-2601', couponId: 'cpn-26', couponCode: 'TOMFORDVIP', customerName: 'Edward Kingston', customerPhone: '+91 98222 55443', redeemedAt: '39 mins ago', storeName: 'Tom Ford Eyewear', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1080', vipStatus: true }
    ]
  },
  {
    id: 'cpn-27',
    code: 'LENSKART500',
    title: 'Flat ₹500 Off John Jacobs Titanium',
    discount: '₹500 OFF',
    storeName: 'Lenskart Gold Lounge',
    category: 'Accessories',
    issuedCount: 2200,
    redeemedCount: 640,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Eyewear & Optical Shoppers',
    redeemedCustomers: [
      { id: 'rdm-2701', couponId: 'cpn-27', couponCode: 'LENSKART500', customerName: 'Sneha Patel', customerPhone: '+91 98444 88776', redeemedAt: '9 mins ago', storeName: 'Lenskart Gold Lounge', discountApplied: '₹500 OFF', savingsAmount: '₹500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1096', vipStatus: false }
    ]
  },
  {
    id: 'cpn-28',
    code: 'ROLEX5000',
    title: 'Flat ₹5,000 Off Luxury Timepieces',
    discount: '₹5,000 OFF',
    storeName: 'Rolex Boutique',
    category: 'Accessories',
    issuedCount: 300,
    redeemedCount: 42,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Watch Enthusiasts',
    redeemedCustomers: [
      { id: 'rdm-2801', couponId: 'cpn-28', couponCode: 'ROLEX5000', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '10:42 AM', storeName: 'Rolex Boutique', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1089', vipStatus: true }
    ]
  },
  {
    id: 'cpn-29',
    code: 'OMEGACHRONO',
    title: 'Flat ₹15,000 Off Speedmaster & Seamaster',
    discount: '₹15,000 OFF',
    storeName: 'Omega Watch Atelier',
    category: 'Accessories',
    issuedCount: 350,
    redeemedCount: 56,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Swiss Chronometer Lovers',
    redeemedCustomers: [
      { id: 'rdm-2901', couponId: 'cpn-29', couponCode: 'OMEGACHRONO', customerName: 'Jean-Luc Picard', customerPhone: '+91 98111 44332', redeemedAt: '18 mins ago', storeName: 'Omega Watch Atelier', discountApplied: '₹15,000 OFF', savingsAmount: '₹15,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true }
    ]
  },
  {
    id: 'cpn-30',
    code: 'TAGHEUERVIP',
    title: 'Flat ₹10,000 Off Carrera Chronographs',
    discount: '₹10,000 OFF',
    storeName: 'TAG Heuer Flagship',
    category: 'Accessories',
    issuedCount: 400,
    redeemedCount: 62,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Motorsport Watch Fans',
    redeemedCustomers: [
      { id: 'rdm-3001', couponId: 'cpn-30', couponCode: 'TAGHEUERVIP', customerName: 'Vikram Seth', customerPhone: '+91 98333 11223', redeemedAt: '24 mins ago', storeName: 'TAG Heuer Flagship', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1086', vipStatus: true }
    ]
  },
  {
    id: 'cpn-31',
    code: 'APPLEVIP5',
    title: 'Flat ₹5,000 Off Apple Watch & Vision',
    discount: '₹5,000 OFF',
    storeName: 'Apple Experience Store',
    category: 'Accessories',
    issuedCount: 1800,
    redeemedCount: 420,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Tech Lovers',
    redeemedCustomers: [
      { id: 'rdm-3101', couponId: 'cpn-31', couponCode: 'APPLEVIP5', customerName: 'David Miller', customerPhone: '+91 98333 44556', redeemedAt: '10 mins ago', storeName: 'Apple Experience Store', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1093', vipStatus: true }
    ]
  },
  {
    id: 'cpn-32',
    code: 'TISSOTSWISS',
    title: '15% Off Tissot PRX Powermatic 80',
    discount: '15% OFF',
    storeName: 'Tissot Swiss Watches',
    category: 'Accessories',
    issuedCount: 950,
    redeemedCount: 185,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Swiss Automatic Watches',
    redeemedCustomers: [
      { id: 'rdm-3201', couponId: 'cpn-32', couponCode: 'TISSOTSWISS', customerName: 'Aditya Rao', customerPhone: '+91 98777 99887', redeemedAt: '31 mins ago', storeName: 'Tissot Swiss Watches', discountApplied: '15% OFF', savingsAmount: '₹10,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: false }
    ]
  },
  {
    id: 'cpn-33',
    code: 'NEBULA18K',
    title: 'Flat ₹20,000 Off 18k Solid Gold Watches',
    discount: '₹20,000 OFF',
    storeName: 'Titan Nebula Gold Watches',
    category: 'Accessories',
    issuedCount: 300,
    redeemedCount: 38,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: '18k Gold Timepieces',
    redeemedCustomers: [
      { id: 'rdm-3301', couponId: 'cpn-33', couponCode: 'NEBULA18K', customerName: 'Rajeshwar K.', customerPhone: '+91 98444 22110', redeemedAt: '47 mins ago', storeName: 'Titan Nebula Gold Watches', discountApplied: '₹20,000 OFF', savingsAmount: '₹20,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1072', vipStatus: true }
    ]
  },
  {
    id: 'cpn-34',
    code: 'GRANDMALL20',
    title: '20% Off Concierge First Order',
    discount: '20% OFF',
    storeName: 'The Grand Mall',
    category: 'All Stores',
    issuedCount: 3000,
    redeemedCount: 890,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'WiFi Captive Portal Users',
    redeemedCustomers: [
      { id: 'rdm-3401', couponId: 'cpn-34', couponCode: 'GRANDMALL20', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: '45 mins ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹3,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1080', vipStatus: true },
      { id: 'rdm-3402', couponId: 'cpn-34', couponCode: 'GRANDMALL20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹2,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1065', vipStatus: true }
    ]
  },
  {
    id: 'cpn-35',
    code: 'MALLVIP25',
    title: 'Flat 25% Off VIP Mall Shopping',
    discount: '25% OFF',
    storeName: 'The Grand Mall',
    category: 'All Stores',
    issuedCount: 2500,
    redeemedCount: 670,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'VIP Shoppers',
    redeemedCustomers: [
      { id: 'rdm-3501', couponId: 'cpn-35', couponCode: 'MALLVIP25', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '30 mins ago', storeName: 'The Grand Mall', discountApplied: '25% OFF', savingsAmount: '₹4,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1085', vipStatus: true }
    ]
  }
];

interface CouponsViewProps {
  couponsList?: Coupon[];
}

export const CouponsView: React.FC<CouponsViewProps> = ({ couponsList }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const base = [...WEBSITE_WEBSITE_COUPONS];
    if (couponsList && couponsList.length > 0) {
      const existingCodes = new Set(base.map(c => c.code.toLowerCase()));
      for (const c of couponsList) {
        if (!existingCodes.has(c.code.toLowerCase())) {
          base.push(c);
        }
      }
    }
    return base;
  });

  useEffect(() => {
    if (couponsList && couponsList.length > 0) {
      setCoupons(prev => {
        const merged = [...WEBSITE_WEBSITE_COUPONS];
        const existingCodes = new Set(merged.map(c => c.code.toLowerCase()));
        for (const c of couponsList) {
          if (!existingCodes.has(c.code.toLowerCase())) {
            merged.push(c);
          }
        }
        return merged;
      });
    }
  }, [couponsList]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [redemptionSearch, setRedemptionSearch] = useState('');

  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDiscount, setNewDiscount] = useState('20% OFF');
  const [newStore, setNewStore] = useState('Nike Flagship');

  const fetchLiveRedemptions = async () => {
    let allRedemptions: any[] = [];

    // 1. Fetch from backend REST endpoint
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/coupon-redemptions`);
      const data = await res.json();
      if (data.success && Array.isArray(data.redemptions)) {
        allRedemptions.push(...data.redemptions);
      }
    } catch (err) {}

    // 2. Fetch local coupon redemptions from LocalStorage
    try {
      const localRdm = JSON.parse(localStorage.getItem('axionix_coupon_redemptions') || '[]');
      if (Array.isArray(localRdm)) {
        allRedemptions.push(...localRdm);
      }
    } catch (e) {}

    // 3. Fetch orders from backend REST to extract any order placed with a coupon
    try {
      const ordRes = await fetch(`${BACKEND_URL}/api/orders`);
      const ordData = await ordRes.json();
      if (ordData.success && Array.isArray(ordData.orders)) {
        for (const o of ordData.orders) {
          if (o.appliedCoupon) {
            allRedemptions.push({
              id: `ord-cpn-${o.id || o.orderNumber}`,
              couponCode: o.appliedCoupon,
              customerName: o.customerName || 'Shopper',
              customerPhone: o.customerPhone || '+91 84950 93170',
              redeemedAt: o.timestamp || 'Just now',
              storeName: o.storeName,
              savingsAmount: o.discountAmount ? `₹${Number(o.discountAmount).toLocaleString()} Saved` : '₹1,500 Saved',
              orderNumber: o.orderNumber
            });
          }
        }
      }
    } catch (e) {}

    // 4. Extract orders from LocalStorage
    try {
      const localOrders = JSON.parse(localStorage.getItem('axionix_orders_list') || '[]');
      if (Array.isArray(localOrders)) {
        for (const o of localOrders) {
          if (o.appliedCoupon) {
            allRedemptions.push({
              id: `local-cpn-${o.orderNumber || Math.random()}`,
              couponCode: o.appliedCoupon,
              customerName: o.customerName || 'Valued Guest',
              customerPhone: o.customerPhone || '+91 84950 93170',
              redeemedAt: 'Just now',
              storeName: o.storeName,
              savingsAmount: o.discountAmount ? `₹${Number(o.discountAmount).toLocaleString()} Saved` : '₹2,000 Saved',
              orderNumber: o.orderNumber
            });
          }
        }
      }
    } catch (e) {}

    if (allRedemptions.length === 0) return;

    setCoupons(prevCoupons => {
      let updated = false;
      const nextCoupons = prevCoupons.map(cpn => {
        const matches = allRedemptions.filter(r => 
          (r.couponCode && r.couponCode.toUpperCase() === cpn.code.toUpperCase()) ||
          (r.storeName && r.storeName.toLowerCase() === cpn.storeName.toLowerCase() && r.couponCode)
        );

        if (matches.length > 0) {
          const existingIds = new Set((cpn.redeemedCustomers || []).map(rc => rc.id));
          const newEntries: CouponRedemption[] = [];

          for (const m of matches) {
            const entryId = m.id || `rdm-${m.couponCode}-${m.customerName}`;
            if (!existingIds.has(entryId)) {
              newEntries.push({
                id: entryId,
                couponId: cpn.id,
                couponCode: cpn.code,
                customerName: m.customerName || 'Valued Guest',
                customerPhone: m.customerPhone || '+91 84950 93170',
                redeemedAt: m.redeemedAt || 'Just now',
                storeName: cpn.storeName,
                discountApplied: cpn.discount,
                savingsAmount: m.savingsAmount || '₹1,500 Saved',
                channel: 'WiFi Captive Portal',
                orderNumber: m.orderNumber || '#AX-LIVE',
                vipStatus: true
              });
            }
          }

          if (newEntries.length > 0) {
            updated = true;
            const updatedCpn = {
              ...cpn,
              redeemedCount: cpn.redeemedCount + newEntries.length,
              redeemedCustomers: [...newEntries, ...(cpn.redeemedCustomers || [])]
            };

            setSelectedCoupon(prev => {
              if (prev && (prev.id === cpn.id || prev.code.toUpperCase() === cpn.code.toUpperCase())) {
                return updatedCpn;
              }
              return prev;
            });

            return updatedCpn;
          }
        }
        return cpn;
      });

      return updated ? nextCoupons : prevCoupons;
    });
  };

  React.useEffect(() => {
    fetchLiveRedemptions();
    const interval = setInterval(fetchLiveRedemptions, 1500);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('axionix_events');
      bc.onmessage = () => fetchLiveRedemptions();
    } catch (e) {}

    let es: EventSource | null = null;
    try {
      es = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'COUPON_REDEEMED' || data.type === 'NEW_ORDER') {
            fetchLiveRedemptions();
          }
        } catch (e) {}
      };
    } catch (e) {}

    window.addEventListener('storage', fetchLiveRedemptions);
    window.addEventListener('axionix_order_added', fetchLiveRedemptions);
    window.addEventListener('axionix_coupon_redeemed', fetchLiveRedemptions);

    return () => {
      clearInterval(interval);
      bc?.close();
      es?.close();
      window.removeEventListener('storage', fetchLiveRedemptions);
      window.removeEventListener('axionix_order_added', fetchLiveRedemptions);
      window.removeEventListener('axionix_coupon_redeemed', fetchLiveRedemptions);
    };
  }, []);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    const created: Coupon = {
      id: `cpn-${Date.now()}`,
      code: newCode.toUpperCase(),
      title: newTitle,
      discount: newDiscount,
      storeName: newStore,
      category: 'Fashion',
      issuedCount: 1000,
      redeemedCount: 0,
      expiryDate: '2026-08-31',
      status: 'Active',
      targetSegment: 'All Mall Guests',
      redeemedCustomers: []
    };

    setCoupons([created, ...coupons]);
    recordAuditLog('COUPON_CREATED', 'coupon', created.code, { title: created.title, storeName: created.storeName, discount: created.discount });
    setShowCreateModal(false);
    setNewCode('');
    setNewTitle('');
  };

  const handleDeleteCoupon = (couponId: string, couponCode: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId && c.code.toUpperCase() !== couponCode.toUpperCase()));
    if (selectedCoupon?.id === couponId || selectedCoupon?.code.toUpperCase() === couponCode.toUpperCase()) {
      setSelectedCoupon(null);
    }
    recordAuditLog('COUPON_DELETED', 'coupon', couponCode, { couponId, code: couponCode, reason: 'Manually deleted by admin user' });
  };

  const activeCouponForModal = selectedCoupon
    ? coupons.find(c => c.id === selectedCoupon.id || c.code.toUpperCase() === selectedCoupon.code.toUpperCase()) || selectedCoupon
    : null;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center border border-blue-200">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mall Digital Coupons & Instant Vouchers</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Issue targeted promo codes across connected WiFi captive portal and SMS push channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadCouponsCSV(coupons)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Coupons (CSV)</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Issue New Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => {
          const redemptionRate = Math.round(((coupon.redeemedCount || 0) / (coupon.issuedCount || 1000)) * 100);

          return (
            <div
              key={coupon.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                    {coupon.category || 'Offer'}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {coupon.discount}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">{coupon.title}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-4">{coupon.storeName}</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between font-mono mb-4">
                  <span className="font-extrabold text-slate-900 tracking-wider text-sm">{coupon.code}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(coupon.code)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-sans font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Redemptions: {coupon.redeemedCount} / {coupon.issuedCount}</span>
                    <span className="text-blue-600">{redemptionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, redemptionRate)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCoupon(coupon)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer mb-4"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>View Redeemed Customers ({coupon.redeemedCount})</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-600" />{coupon.targetSegment || 'All Guests'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Exp {coupon.expiryDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redeemed Customers Modal */}
      {selectedCoupon && activeCouponForModal && (() => {
        const rawRedeemedList = activeCouponForModal.redeemedCustomers || [];
        const uniqueMap = new Map();
        rawRedeemedList.forEach(c => {
          const key = ((c.customerPhone ? c.customerPhone.replace(/\D/g, '') : '') || c.customerName || 'guest').toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, c);
          }
        });
        const currentRedeemedList = Array.from(uniqueMap.values());

        const filteredRedeemedCustomers = currentRedeemedList.filter(c => {
          const q = redemptionSearch.toLowerCase();
          const name = (c.customerName || 'Valued Guest').toLowerCase();
          const phone = (c.customerPhone || '').toLowerCase();
          const ord = (c.orderNumber || '').toLowerCase();
          const ch = (c.channel || '').toLowerCase();
          return name.includes(q) || phone.includes(q) || ord.includes(q) || ch.includes(q);
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg tracking-wider">
                      {activeCouponForModal.code}
                    </span>
                    <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {activeCouponForModal.discount}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{activeCouponForModal.storeName}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-1.5 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    Redeemed Customers for "{activeCouponForModal.title}"
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing customer profiles, redemption channels, order numbers, and discount savings for this offer.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCoupon(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Action Toolbar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search redeemed customer by name, phone, order #, channel..."
                    value={redemptionSearch}
                    onChange={(e) => setRedemptionSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadRedeemedCustomersCSV(activeCouponForModal.code, currentRedeemedList)}
                    disabled={currentRedeemedList.length === 0}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Customer List (CSV)
                  </button>
                </div>
              </div>

              {/* Modal Summary Pill */}
              <div className="px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 font-semibold">
                <div className="flex items-center gap-2">
                  <span>Total Redemptions Logged:</span>
                  <span className="font-extrabold text-blue-700">{activeCouponForModal.redeemedCount} Guests</span>
                  <span className="text-slate-400">|</span>
                  <span>Target Segment: {activeCouponForModal.targetSegment}</span>
                </div>
                <div className="text-xs text-emerald-700 font-extrabold">
                  Active Offer • Exp {activeCouponForModal.expiryDate}
                </div>
              </div>

              {/* Customer List Content */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {filteredRedeemedCustomers.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-2.5 px-3">Customer Profile</th>
                          <th className="py-2.5 px-3">Order Ref</th>
                          <th className="py-2.5 px-3">Acquisition Channel</th>
                          <th className="py-2.5 px-3">Redemption Time</th>
                          <th className="py-2.5 px-3 text-right">Savings Given</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {filteredRedeemedCustomers.map((c) => {
                          const nameStr = c.customerName || 'Valued Guest';
                          const initialChar = nameStr.trim() ? nameStr.trim().charAt(0).toUpperCase() : 'G';
                          const phoneStr = c.customerPhone || 'N/A';
                          const orderNumStr = c.orderNumber || '';
                          const savingsStr = c.savingsAmount || '₹1,500 Saved';

                          return (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                    {initialChar}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                      {nameStr}
                                      {c.vipStatus && (
                                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                          <ShieldCheck className="w-2.5 h-2.5" /> VIP
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">{phoneStr}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">
                                {orderNumStr ? (
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-[11px]">
                                    {orderNumStr}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Counter Scan</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                                  <Smartphone className="w-3 h-3 text-blue-600" />
                                  {c.channel || 'WiFi Captive Portal'}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-slate-500 font-medium text-[11px]">
                                {c.redeemedAt || 'Just now'}
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs">
                                  {savingsStr.includes('Saved') ? savingsStr : `${savingsStr} Saved`}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : currentRedeemedList.length > 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Search className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No customers matched "{redemptionSearch}"</p>
                    <p className="text-xs text-slate-400">Try searching by another name, phone number, or order ID.</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No customer redemptions recorded yet</p>
                    <p className="text-xs text-slate-400">Redemptions will automatically appear here as customers use this promo code.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  AXIONIX Real-time Mall Campaign Audit Log
                </span>

                <button
                  onClick={() => setSelectedCoupon(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Close Customer List
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleCreateCoupon} className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Issue New Mall Coupon</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Promo Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title Description</label>
              <input
                type="text"
                placeholder="e.g. 25% Off Flat Weekend Discount"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Value</label>
                <input
                  type="text"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Tenant</label>
                <select
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Nike Flagship">Nike Flagship</option>
                  <option value="Starbucks Reserve">Starbucks Reserve</option>
                  <option value="Apple Store">Apple Store</option>
                  <option value="Zara">Zara</option>
                  <option value="Taco Bell">Taco Bell</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
              >
                Publish Coupon
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
