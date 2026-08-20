import { Store, ConnectedUser, ActivityLog, Order, Reservation, Coupon, Campaign, SystemAlert, KpiItem } from '../types';

export const MALL_LIST = [
  'Phoenix Marketcity Bengaluru',
  'Lulu Mall Bengaluru',
  'Orion Mall Rajajinagar',
  'Forum South Bengaluru',
  'Select CITYWALK Delhi',
  'DLF Mall of India Noida'
];

export const LOCATION_METRICS: Record<string, {
  connectedUsers: string;
  visitors: string;
  storeVisits: string;
  orders: string;
  revenue: string;
  coupons: string;
  scans: string;
}> = {
  'Phoenix Marketcity Bengaluru': {
    connectedUsers: '1,482',
    visitors: '6,824',
    storeVisits: '18,420',
    orders: '1,245',
    revenue: '₹14,85,200',
    coupons: '894',
    scans: '3,150'
  },
  'Lulu Mall Bengaluru': {
    connectedUsers: '2,150',
    visitors: '9,410',
    storeVisits: '24,800',
    orders: '1,890',
    revenue: '₹21,40,500',
    coupons: '1,120',
    scans: '4,280'
  },
  'Orion Mall Rajajinagar': {
    connectedUsers: '1,120',
    visitors: '4,950',
    storeVisits: '14,100',
    orders: '840',
    revenue: '₹11,20,800',
    coupons: '640',
    scans: '2,110'
  },
  'Forum South Bengaluru': {
    connectedUsers: '1,640',
    visitors: '7,320',
    storeVisits: '19,850',
    orders: '1,380',
    revenue: '₹16,90,400',
    coupons: '980',
    scans: '3,450'
  },
  'Select CITYWALK Delhi': {
    connectedUsers: '2,890',
    visitors: '11,250',
    storeVisits: '31,400',
    orders: '2,450',
    revenue: '₹34,50,000',
    coupons: '1,650',
    scans: '5,890'
  },
  'DLF Mall of India Noida': {
    connectedUsers: '3,120',
    visitors: '13,800',
    storeVisits: '38,900',
    orders: '2,980',
    revenue: '₹42,10,000',
    coupons: '2,110',
    scans: '6,720'
  }
};

export const getLocationKpiData = (mallName: string): KpiItem[] => {
  const metrics = LOCATION_METRICS[mallName] || LOCATION_METRICS['Phoenix Marketcity Bengaluru'];
  return [
    { id: 'kpi-1', title: 'Connected Users', value: metrics.connectedUsers, change: '+12.4%', isPositive: true, subtext: 'vs yesterday', sparklineData: [920, 1050, 1180, 1290, 1340, 1420, parseInt(metrics.connectedUsers.replace(/\D/g, ''))], iconName: 'Wifi' },
    { id: 'kpi-2', title: "Today's Visitors", value: metrics.visitors, change: '+8.7%', isPositive: true, subtext: 'vs average weekday', sparklineData: [3200, 4100, 4800, 5600, 6100, 6500, parseInt(metrics.visitors.replace(/\D/g, ''))], iconName: 'Users' },
    { id: 'kpi-3', title: 'Store Visits', value: metrics.storeVisits, change: '+15.2%', isPositive: true, subtext: 'cumulative footfall', sparklineData: [11000, 13200, 14500, 15900, 16800, 17500, parseInt(metrics.storeVisits.replace(/\D/g, ''))], iconName: 'ShoppingBag' },
    { id: 'kpi-4', title: 'Orders', value: metrics.orders, change: '+6.3%', isPositive: true, subtext: 'digital & counter orders', sparklineData: [600, 750, 890, 980, 1100, 1190, parseInt(metrics.orders.replace(/\D/g, ''))], iconName: 'Receipt' },
    { id: 'kpi-5', title: 'Reservations', value: '382', change: '+18.9%', isPositive: true, subtext: 'dining & services booked', sparklineData: [180, 220, 260, 290, 330, 360, 382], iconName: 'CalendarCheck' },
    { id: 'kpi-6', title: 'Revenue', value: metrics.revenue, change: '+14.1%', isPositive: true, subtext: 'gross mall sales today', sparklineData: [620000, 810000, 990000, 1150000, 1310000, 1410000, 1485200], iconName: 'IndianRupee' },
    { id: 'kpi-7', title: 'Coupon Redemptions', value: metrics.coupons, change: '+22.5%', isPositive: true, subtext: 'via AXIONIX app & SMS', sparklineData: [310, 420, 540, 630, 720, 810, parseInt(metrics.coupons.replace(/\D/g, ''))], iconName: 'Ticket' },
    { id: 'kpi-8', title: 'QR Code Scans', value: metrics.scans, change: '+9.8%', isPositive: true, subtext: 'interactive signage', sparklineData: [1400, 1750, 2100, 2450, 2750, 2980, parseInt(metrics.scans.replace(/\D/g, ''))], iconName: 'QrCode' }
  ];
};

export const MOCK_KPI_DATA: KpiItem[] = [
  {
    id: 'kpi-1',
    title: 'Connected Users',
    value: '1,482',
    change: '+12.4%',
    isPositive: true,
    subtext: 'vs yesterday',
    sparklineData: [920, 1050, 1180, 1290, 1340, 1420, 1482],
    iconName: 'Wifi'
  },
  {
    id: 'kpi-2',
    title: "Today's Visitors",
    value: '6,824',
    change: '+8.7%',
    isPositive: true,
    subtext: 'vs average weekday',
    sparklineData: [3200, 4100, 4800, 5600, 6100, 6500, 6824],
    iconName: 'Users'
  },
  {
    id: 'kpi-3',
    title: 'Store Visits',
    value: '18,420',
    change: '+15.2%',
    isPositive: true,
    subtext: 'cumulative footfall',
    sparklineData: [11000, 13200, 14500, 15900, 16800, 17500, 18420],
    iconName: 'ShoppingBag'
  },
  {
    id: 'kpi-4',
    title: 'Orders',
    value: '1,245',
    change: '+6.3%',
    isPositive: true,
    subtext: 'digital & counter orders',
    sparklineData: [600, 750, 890, 980, 1100, 1190, 1245],
    iconName: 'Receipt'
  },
  {
    id: 'kpi-5',
    title: 'Reservations',
    value: '382',
    change: '+18.9%',
    isPositive: true,
    subtext: 'dining & services booked',
    sparklineData: [180, 220, 260, 290, 330, 360, 382],
    iconName: 'CalendarCheck'
  },
  {
    id: 'kpi-6',
    title: 'Revenue',
    value: '₹14,85,200',
    change: '+14.1%',
    isPositive: true,
    subtext: 'gross mall sales today',
    sparklineData: [620000, 810000, 990000, 1150000, 1310000, 1410000, 1485200],
    iconName: 'IndianRupee'
  },
  {
    id: 'kpi-7',
    title: 'Coupon Redemptions',
    value: '894',
    change: '+22.5%',
    isPositive: true,
    subtext: 'via AXIONIX app & SMS',
    sparklineData: [310, 420, 540, 630, 720, 810, 894],
    iconName: 'Ticket'
  },
  {
    id: 'kpi-8',
    title: 'QR Code Scans',
    value: '3,150',
    change: '+9.8%',
    isPositive: true,
    subtext: 'interactive signage',
    sparklineData: [1400, 1750, 2100, 2450, 2750, 2980, 3150],
    iconName: 'QrCode'
  }
];

// Stores are synced from the Customer Portal (ALL_STORES in customer-portal/src/App.tsx)
export const MOCK_STORES: Store[] = [
  // FOOD & DINING
  {
    "id": "store-food-1",
    "name": "Starbucks Reserve",
    "logo": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 950,
    "ordersCount": 420,
    "reservationsCount": 15,
    "conversionRate": 65,
    "revenueToday": 480000,
    "status": "Open",
    "manager": "Ananya Sharma",
    "phone": "+91 98555 66778",
    "openHours": "08:00 AM - 11:00 PM",
    "rating": 4.8
  },
  {
    "id": "store-food-2",
    "name": "Häagen-Dazs",
    "logo": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 820,
    "ordersCount": 340,
    "reservationsCount": 8,
    "conversionRate": 52,
    "revenueToday": 198000,
    "status": "Open",
    "manager": "Rahul K.",
    "phone": "+91 98222 11990",
    "openHours": "10:00 AM - 11:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-food-3",
    "name": "Din Tai Fung",
    "logo": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Dining Hub North",
    "visitorsToday": 680,
    "ordersCount": 290,
    "reservationsCount": 28,
    "conversionRate": 48,
    "revenueToday": 1280000,
    "status": "Open",
    "manager": "Chen Wei",
    "phone": "+91 98111 99887",
    "openHours": "11:00 AM - 10:30 PM",
    "rating": 4.9
  },
  {
    "id": "store-food-4",
    "name": "PizzaExpress Gourmet",
    "logo": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Food Court South",
    "visitorsToday": 610,
    "ordersCount": 220,
    "reservationsCount": 14,
    "conversionRate": 41.5,
    "revenueToday": 620000,
    "status": "Open",
    "manager": "Marco Rossi",
    "phone": "+91 98333 77112",
    "openHours": "11:00 AM - 11:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-food-5",
    "name": "Coffee Drama Cafe",
    "logo": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Dining Hub North",
    "visitorsToday": 540,
    "ordersCount": 195,
    "reservationsCount": 6,
    "conversionRate": 39,
    "revenueToday": 390000,
    "status": "Open",
    "manager": "Siddharth M.",
    "phone": "+91 98495 09317",
    "openHours": "09:00 AM - 10:30 PM",
    "rating": 4.8
  },
  {
    "id": "store-food-6",
    "name": "Subway Fresh Gourmet",
    "logo": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Food Court South",
    "visitorsToday": 710,
    "ordersCount": 310,
    "reservationsCount": 0,
    "conversionRate": 46.2,
    "revenueToday": 280000,
    "status": "Open",
    "manager": "Vikram S.",
    "phone": "+91 98888 12345",
    "openHours": "10:00 AM - 11:00 PM",
    "rating": 4.6
  },

  // FASHION & APPAREL
  {
    "id": "fashion-1",
    "name": "Nike Flagship",
    "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 640,
    "ordersCount": 185,
    "reservationsCount": 12,
    "conversionRate": 42.1,
    "revenueToday": 845000,
    "status": "Open",
    "manager": "Marcus Vance",
    "phone": "+91 98222 33445",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8
  },
  {
    "id": "fashion-2",
    "name": "Zara Flagship",
    "logo": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "South Wing",
    "visitorsToday": 720,
    "ordersCount": 210,
    "reservationsCount": 6,
    "conversionRate": 34.2,
    "revenueToday": 620000,
    "status": "Open",
    "manager": "Elena Rostova",
    "phone": "+91 98444 55667",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6
  },
  {
    "id": "fashion-3",
    "name": "Gucci Boutique",
    "logo": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "Ground Floor",
    "zone": "North Wing",
    "visitorsToday": 210,
    "ordersCount": 18,
    "reservationsCount": 14,
    "conversionRate": 22,
    "revenueToday": 2150000,
    "status": "Open",
    "manager": "Fabrizio Rossi",
    "phone": "+91 98666 77889",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "fashion-4",
    "name": "Prada Atelier",
    "logo": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 205,
    "ordersCount": 14,
    "reservationsCount": 11,
    "conversionRate": 21,
    "revenueToday": 1980000,
    "status": "Open",
    "manager": "Matteo Bellini",
    "phone": "+91 98234 56789",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "fashion-5",
    "name": "U.S. Polo Assn.",
    "logo": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 510,
    "ordersCount": 145,
    "reservationsCount": 4,
    "conversionRate": 31.8,
    "revenueToday": 450000,
    "status": "Open",
    "manager": "Rajesh K.",
    "phone": "+91 98444 88112",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6
  },
  {
    "id": "fashion-6",
    "name": "H&M Flagship",
    "logo": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 890,
    "ordersCount": 260,
    "reservationsCount": 3,
    "conversionRate": 35.5,
    "revenueToday": 340000,
    "status": "Open",
    "manager": "Sophie Lindqvist",
    "phone": "+91 98111 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.5
  },

  // ACCESSORIES, LUXURY & WATCHES
  {
    "id": "store-acc-1",
    "name": "Louis Vuitton Maison",
    "logo": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 480,
    "ordersCount": 38,
    "reservationsCount": 19,
    "conversionRate": 24.1,
    "revenueToday": 3400000,
    "status": "Open",
    "manager": "Charlotte Dubois",
    "phone": "+91 98777 88990",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-2",
    "name": "Hermès Leather Lounge",
    "logo": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 230,
    "ordersCount": 16,
    "reservationsCount": 14,
    "conversionRate": 18.5,
    "revenueToday": 4850000,
    "status": "Open",
    "manager": "Antoine Laurent",
    "phone": "+91 98888 12345",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 5.0
  },
  {
    "id": "store-acc-3",
    "name": "Coach New York",
    "logo": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 410,
    "ordersCount": 52,
    "reservationsCount": 8,
    "conversionRate": 31.0,
    "revenueToday": 1350000,
    "status": "Open",
    "manager": "Sarah Jenkins",
    "phone": "+91 98450 55667",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-acc-4",
    "name": "Bottega Veneta",
    "logo": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 260,
    "ordersCount": 22,
    "reservationsCount": 12,
    "conversionRate": 21.5,
    "revenueToday": 2890000,
    "status": "Open",
    "manager": "Matteo Rinaldi",
    "phone": "+91 98450 77889",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-5",
    "name": "Tiffany & Co.",
    "logo": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "North Wing",
    "visitorsToday": 320,
    "ordersCount": 26,
    "reservationsCount": 22,
    "conversionRate": 25.0,
    "revenueToday": 3890000,
    "status": "Open",
    "manager": "Eleanor Vance",
    "phone": "+91 98123 45678",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-6",
    "name": "Cartier High Jewelry",
    "logo": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 380,
    "ordersCount": 32,
    "reservationsCount": 24,
    "conversionRate": 20.0,
    "revenueToday": 4120000,
    "status": "Open",
    "manager": "Elena Rossi",
    "phone": "+91 98765 43236",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-7",
    "name": "Bvlgari Haute Joaillerie",
    "logo": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 210,
    "ordersCount": 18,
    "reservationsCount": 16,
    "conversionRate": 19.0,
    "revenueToday": 3650000,
    "status": "Open",
    "manager": "Marco V.",
    "phone": "+91 98222 99887",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-8",
    "name": "Swarovski Crystal Pavilion",
    "logo": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 490,
    "ordersCount": 85,
    "reservationsCount": 5,
    "conversionRate": 28.0,
    "revenueToday": 680000,
    "status": "Open",
    "manager": "Clara M.",
    "phone": "+91 98111 88776",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-acc-9",
    "name": "Tanishq Royal Heritage",
    "logo": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "West Wing",
    "visitorsToday": 620,
    "ordersCount": 110,
    "reservationsCount": 28,
    "conversionRate": 32.5,
    "revenueToday": 5400000,
    "status": "Open",
    "manager": "Ramesh Kumar",
    "phone": "+91 98450 11223",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-10",
    "name": "Malabar Gold & Diamonds",
    "logo": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "West Wing",
    "visitorsToday": 580,
    "ordersCount": 98,
    "reservationsCount": 20,
    "conversionRate": 30.0,
    "revenueToday": 4890000,
    "status": "Open",
    "manager": "Suresh Menon",
    "phone": "+91 98450 44556",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.8
  },
  {
    "id": "store-acc-11",
    "name": "Ray-Ban Sunglass Hut",
    "logo": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "West Wing",
    "visitorsToday": 530,
    "ordersCount": 68,
    "reservationsCount": 0,
    "conversionRate": 23.4,
    "revenueToday": 210000,
    "status": "Open",
    "manager": "Kavita B.",
    "phone": "+91 98765 43247",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.7
  },
  {
    "id": "store-acc-12",
    "name": "Sunglass Hut Premier",
    "logo": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 410,
    "ordersCount": 55,
    "reservationsCount": 0,
    "conversionRate": 22.0,
    "revenueToday": 390000,
    "status": "Open",
    "manager": "Amitabh R.",
    "phone": "+91 98222 33441",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6
  },
  {
    "id": "store-acc-13",
    "name": "Oakley Performance Vision",
    "logo": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 380,
    "ordersCount": 42,
    "reservationsCount": 0,
    "conversionRate": 21.0,
    "revenueToday": 280000,
    "status": "Open",
    "manager": "Rohan D.",
    "phone": "+91 98111 22338",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-acc-14",
    "name": "Tom Ford Eyewear",
    "logo": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 290,
    "ordersCount": 28,
    "reservationsCount": 10,
    "conversionRate": 20.0,
    "revenueToday": 890000,
    "status": "Open",
    "manager": "Vanessa L.",
    "phone": "+91 98450 99001",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-15",
    "name": "Lenskart Gold Lounge",
    "logo": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 650,
    "ordersCount": 180,
    "reservationsCount": 0,
    "conversionRate": 34.0,
    "revenueToday": 420000,
    "status": "Open",
    "manager": "Pooja V.",
    "phone": "+91 98888 77665",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6
  },
  {
    "id": "store-acc-16",
    "name": "Rolex Boutique",
    "logo": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 310,
    "ordersCount": 24,
    "reservationsCount": 8,
    "conversionRate": 28.5,
    "revenueToday": 2900000,
    "status": "Open",
    "manager": "Claire Montrose",
    "phone": "+91 98111 22334",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-17",
    "name": "Omega Watch Atelier",
    "logo": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 280,
    "ordersCount": 20,
    "reservationsCount": 12,
    "conversionRate": 22.0,
    "revenueToday": 2450000,
    "status": "Open",
    "manager": "Julian Thorne",
    "phone": "+91 98333 11223",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-18",
    "name": "TAG Heuer Flagship",
    "logo": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 340,
    "ordersCount": 26,
    "reservationsCount": 10,
    "conversionRate": 21.0,
    "revenueToday": 1890000,
    "status": "Open",
    "manager": "Lukas Weber",
    "phone": "+91 98222 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8
  },
  {
    "id": "store-acc-19",
    "name": "Apple Experience Store",
    "logo": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 890,
    "ordersCount": 142,
    "reservationsCount": 35,
    "conversionRate": 38.6,
    "revenueToday": 4120000,
    "status": "Open",
    "manager": "David Miller",
    "phone": "+91 98333 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9
  },
  {
    "id": "store-acc-20",
    "name": "Tissot Swiss Watches",
    "logo": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "West Wing",
    "visitorsToday": 420,
    "ordersCount": 38,
    "reservationsCount": 5,
    "conversionRate": 24.0,
    "revenueToday": 980000,
    "status": "Open",
    "manager": "Felix B.",
    "phone": "+91 98765 11223",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7
  },
  {
    "id": "store-acc-21",
    "name": "Titan Nebula Gold Watches",
    "logo": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 390,
    "ordersCount": 32,
    "reservationsCount": 8,
    "conversionRate": 23.5,
    "revenueToday": 1450000,
    "status": "Open",
    "manager": "Venkat R.",
    "phone": "+91 98450 66778",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8
  }
];

export const MOCK_ACTIVITY_FEED: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: 'Just now',
    userName: 'Mahima Roy',
    action: 'connected',
    detail: 'Connected to AXIONIX HighSpeed WiFi',
    badgeType: 'blue'
  },
  {
    id: 'act-2',
    timestamp: '2 mins ago',
    userName: 'Aarav Patel',
    action: 'visited',
    detail: 'Entered Nike Flagship Store',
    storeName: 'Nike Flagship',
    badgeType: 'green'
  },
  {
    id: 'act-3',
    timestamp: '4 mins ago',
    userName: 'Priya Sharma',
    action: 'scanned_qr',
    detail: 'Scanned Summer Sale QR Code in Central Atrium',
    badgeType: 'purple'
  },
  {
    id: 'act-4',
    timestamp: '6 mins ago',
    userName: 'Rohan Deshmukh',
    action: 'redeemed_coupon',
    detail: 'Redeemed coupon STARBUCKSBOGO at Starbucks Reserve',
    storeName: 'Starbucks Reserve',
    badgeType: 'emerald'
  },
  {
    id: 'act-5',
    timestamp: '9 mins ago',
    userName: 'Kavya Menon',
    action: 'reserved',
    detail: 'Reserved a table for 4 at Taco Bell',
    storeName: 'Taco Bell',
    badgeType: 'amber'
  },
  {
    id: 'act-6',
    timestamp: '12 mins ago',
    userName: 'Siddharth Varma',
    action: 'ordered',
    detail: 'Placed Click&Collect order #AX-9421 at Apple Store',
    storeName: 'Apple Store',
    badgeType: 'emerald'
  },
  {
    id: 'act-7',
    timestamp: '15 mins ago',
    userName: 'Sneha Kulkarni',
    action: 'visited',
    detail: 'Entered Sephora Beauty (Ground Floor)',
    storeName: 'Sephora Beauty',
    badgeType: 'green'
  },
  {
    id: 'act-8',
    timestamp: '18 mins ago',
    userName: 'Vikramjit Singh',
    action: 'scanned_qr',
    detail: 'Scanned PVR Movie Premiere QR Banner',
    badgeType: 'purple'
  },
  {
    id: 'act-9',
    timestamp: '21 mins ago',
    userName: 'Ananya Roy',
    action: 'redeemed_coupon',
    detail: 'Redeemed NIKE20 coupon at Nike Flagship',
    storeName: 'Nike Flagship',
    badgeType: 'emerald'
  },
  {
    id: 'act-10',
    timestamp: '25 mins ago',
    userName: 'Devansh Malhotra',
    action: 'connected',
    detail: 'Connected to Mall Guest WiFi (AP-Central-04)',
    badgeType: 'blue'
  }
];

export const MOCK_USERS: ConnectedUser[] = [
  {
    id: 'usr-101',
    name: 'Mahima Roy',
    phone: '+91 98123 45678',
    macAddress: '7A:4E:3F:11:8B:C2',
    ipAddress: '192.168.10.142',
    connectionTime: '10:42 AM',
    sessionDuration: '1h 24m',
    visitedStores: ['Nike Flagship', 'Starbucks Reserve', 'Zara'],
    dataUsed: '480 MB',
    status: 'Active',
    vipStatus: true,
    zone: 'Central Atrium',
    deviceType: 'iOS'
  },
  {
    id: 'usr-102',
    name: 'Aarav Patel',
    phone: '+91 98234 56789',
    macAddress: 'BC:8F:90:D4:21:E5',
    ipAddress: '192.168.10.188',
    connectionTime: '11:15 AM',
    sessionDuration: '52m',
    visitedStores: ['Nike Flagship', 'Apple Store'],
    dataUsed: '230 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'North Wing',
    deviceType: 'Android'
  },
  {
    id: 'usr-103',
    name: 'Priya Sharma',
    phone: '+91 98345 67890',
    macAddress: '48:D7:05:89:12:3F',
    ipAddress: '192.168.10.201',
    connectionTime: '11:30 AM',
    sessionDuration: '38m',
    visitedStores: ['Sephora Beauty', 'H&M'],
    dataUsed: '190 MB',
    status: 'Active',
    vipStatus: true,
    zone: 'South Wing',
    deviceType: 'iOS'
  },
  {
    id: 'usr-104',
    name: 'Rohan Deshmukh',
    phone: '+91 98456 78901',
    macAddress: 'DE:AD:BE:EF:88:11',
    ipAddress: '192.168.10.105',
    connectionTime: '09:50 AM',
    sessionDuration: '2h 15m',
    visitedStores: ['Starbucks Reserve', 'Crossword Bookstore'],
    dataUsed: '850 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'North Wing',
    deviceType: 'macOS'
  },
  {
    id: 'usr-105',
    name: 'Kavya Menon',
    phone: '+91 98567 89012',
    macAddress: '90:B1:12:34:56:78',
    ipAddress: '192.168.10.222',
    connectionTime: '12:05 PM',
    sessionDuration: '18m',
    visitedStores: ['Taco Bell'],
    dataUsed: '95 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'Food Court',
    deviceType: 'Android'
  },
  {
    id: 'usr-106',
    name: 'Siddharth Varma',
    phone: '+91 98678 90123',
    macAddress: '33:44:55:66:77:88',
    ipAddress: '192.168.10.150',
    connectionTime: '10:10 AM',
    sessionDuration: '1h 55m',
    visitedStores: ['Apple Store', 'Dyson Demo Store', 'McDonald\'s'],
    dataUsed: '620 MB',
    status: 'Active',
    vipStatus: true,
    zone: 'Central Atrium',
    deviceType: 'iOS'
  },
  {
    id: 'usr-107',
    name: 'Sneha Kulkarni',
    phone: '+91 98789 01234',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    ipAddress: '192.168.10.112',
    connectionTime: '11:45 AM',
    sessionDuration: '28m',
    visitedStores: ['Sephora Beauty', 'Bath & Body Works'],
    dataUsed: '140 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'West Wing',
    deviceType: 'iOS'
  },
  {
    id: 'usr-108',
    name: 'Vikramjit Singh',
    phone: '+91 98890 12345',
    macAddress: '11:22:33:44:55:66',
    ipAddress: '192.168.10.199',
    connectionTime: '01:10 PM',
    sessionDuration: '12m',
    visitedStores: ['PVR Director’s Cut'],
    dataUsed: '75 MB',
    status: 'Active',
    vipStatus: true,
    zone: 'Multiplex',
    deviceType: 'Android'
  },
  {
    id: 'usr-109',
    name: 'Ananya Roy',
    phone: '+91 98901 23456',
    macAddress: '77:88:99:00:11:22',
    ipAddress: '192.168.10.231',
    connectionTime: '11:00 AM',
    sessionDuration: '1h 10m',
    visitedStores: ['Nike Flagship', 'Decathlon Sports'],
    dataUsed: '410 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'Central Atrium',
    deviceType: 'iOS'
  },
  {
    id: 'usr-110',
    name: 'Devansh Malhotra',
    phone: '+91 99012 34567',
    macAddress: '55:66:77:88:99:00',
    ipAddress: '192.168.10.245',
    connectionTime: '01:20 PM',
    sessionDuration: '5m',
    visitedStores: [],
    dataUsed: '15 MB',
    status: 'Active',
    vipStatus: false,
    zone: 'Central Atrium',
    deviceType: 'Windows'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '#AX-9421',
    customerName: 'Siddharth Varma',
    customerPhone: '+91 98678 90123',
    storeName: 'Apple Store',
    storeCategory: 'Accessories',
    itemsCount: 2,
    itemsList: ['AirPods Pro (2nd Gen)', 'MagSafe Wallet Leather'],
    totalAmount: 28900,
    orderType: 'Click & Collect',
    paymentMethod: 'UPI / GPay',
    timestamp: '12 mins ago',
    status: 'Completed'
  },
  {
    id: 'ord-1002',
    orderNumber: '#AX-9422',
    customerName: 'Rohan Deshmukh',
    customerPhone: '+91 98456 78901',
    storeName: 'Starbucks Reserve',
    storeCategory: 'Food',
    itemsCount: 3,
    itemsList: ['Hazelnut Cold Brew (L)', 'Blueberry Muffin', 'Flat White (M)'],
    totalAmount: 1150,
    orderType: 'Dine-in',
    paymentMethod: 'Mall Pay',
    timestamp: '18 mins ago',
    status: 'Completed'
  },
  {
    id: 'ord-1003',
    orderNumber: '#AX-9423',
    customerName: 'Aarav Patel',
    customerPhone: '+91 98234 56789',
    storeName: 'Nike Flagship',
    storeCategory: 'Fashion',
    itemsCount: 1,
    itemsList: ['Nike Air Zoom Pegasus 40'],
    totalAmount: 11895,
    orderType: 'Store Pickup',
    paymentMethod: 'Credit Card',
    timestamp: '25 mins ago',
    status: 'Completed'
  },
  {
    id: 'ord-1004',
    orderNumber: '#AX-9424',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98345 67890',
    storeName: 'Sephora Beauty',
    storeCategory: 'Accessories',
    itemsCount: 4,
    itemsList: ['Fenty Hydrating Primer', 'Rare Beauty Blush', 'Dior Lip Oil', 'Mini Perfume Set'],
    totalAmount: 14200,
    orderType: 'Click & Collect',
    paymentMethod: 'Apple Pay',
    timestamp: '32 mins ago',
    status: 'Processing'
  },
  {
    id: 'ord-1005',
    orderNumber: '#AX-9425',
    customerName: 'Kavya Menon',
    customerPhone: '+91 98567 89012',
    storeName: 'Taco Bell',
    storeCategory: 'Food',
    itemsCount: 2,
    itemsList: ['Crunchwrap Supreme Combo', 'Cheesy Gordita Crunch'],
    totalAmount: 680,
    orderType: 'Dine-in',
    paymentMethod: 'UPI / GPay',
    timestamp: '45 mins ago',
    status: 'Completed'
  },
  {
    id: 'ord-1006',
    orderNumber: '#AX-9426',
    customerName: 'Vikramjit Singh',
    customerPhone: '+91 98890 12345',
    storeName: 'PVR Director’s Cut',
    storeCategory: 'Entertainment',
    itemsCount: 2,
    itemsList: ['2x Recliner Movie Tickets', 'Large Cheese Popcorn & Gourmet Soda'],
    totalAmount: 3200,
    orderType: 'Express Delivery',
    paymentMethod: 'Credit Card',
    timestamp: '1 hour ago',
    status: 'Completed'
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-501',
    refCode: 'RES-STB-082',
    guestName: 'Rohan Deshmukh',
    guestPhone: '+91 98456 78901',
    storeName: 'Starbucks Reserve',
    partySize: 2,
    timeSlot: '02:30 PM Today',
    date: '2026-08-03',
    specialRequest: 'Quiet window seat near outlet',
    status: 'Confirmed'
  },
  {
    id: 'res-502',
    refCode: 'RES-PVR-109',
    guestName: 'Vikramjit Singh',
    guestPhone: '+91 98890 12345',
    storeName: 'PVR Director’s Cut',
    partySize: 4,
    timeSlot: '05:00 PM Today',
    date: '2026-08-03',
    specialRequest: 'VIP Recliner Row D',
    status: 'Checked-in'
  },
  {
    id: 'res-503',
    refCode: 'RES-SEP-044',
    guestName: 'Priya Sharma',
    guestPhone: '+91 98345 67890',
    storeName: 'Sephora Beauty',
    partySize: 1,
    timeSlot: '04:00 PM Today',
    date: '2026-08-03',
    specialRequest: 'Bridal makeover trial session',
    status: 'Confirmed'
  },
  {
    id: 'res-504',
    refCode: 'RES-SPA-012',
    guestName: 'Natasha Fernandez',
    guestPhone: '+91 98999 11122',
    storeName: 'Urban Salon & Spa',
    partySize: 1,
    timeSlot: '06:00 PM Today',
    date: '2026-08-03',
    specialRequest: 'Aromatherapy Full Body Massage',
    status: 'Confirmed'
  }
];

export const MOCK_COUPONS: Coupon[] = [
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
      { id: 'rdm-102', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', redeemedAt: '25 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹2,379 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true },
      { id: 'rdm-103', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'Mahima Roy', customerPhone: '+91 98123 45678', redeemedAt: '42 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹1,850 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1075', vipStatus: true }
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
      { id: 'rdm-202', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '35 mins ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹359 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: true },
      { id: 'rdm-203', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'Natasha Fernandez', customerPhone: '+91 98999 11122', redeemedAt: '1 hour ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹459 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1060', vipStatus: false }
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
      { id: 'rdm-301', couponId: 'cpn-3', couponCode: 'GUCCIEXCLUSIVE', customerName: 'Priya Sharma', customerPhone: '+91 98345 67890', redeemedAt: '30 mins ago', storeName: 'Gucci Boutique', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1085', vipStatus: true },
      { id: 'rdm-302', couponId: 'cpn-3', couponCode: 'GUCCIEXCLUSIVE', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '50 mins ago', storeName: 'Gucci Boutique', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1078', vipStatus: true }
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
      { id: 'rdm-401', couponId: 'cpn-4', couponCode: 'PRADAVIP15', customerName: 'Claire Montrose', customerPhone: '+91 98111 22334', redeemedAt: '15 mins ago', storeName: 'Prada Atelier', discountApplied: '15% OFF', savingsAmount: '₹12,750 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1092', vipStatus: true },
      { id: 'rdm-402', couponId: 'cpn-4', couponCode: 'PRADAVIP15', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '40 mins ago', storeName: 'Prada Atelier', discountApplied: '15% OFF', savingsAmount: '₹13,800 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1081', vipStatus: true }
    ]
  },
  {
    id: 'cpn-5',
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
      { id: 'rdm-501', couponId: 'cpn-5', couponCode: 'STARBUCKSFREE', customerName: 'Mahima Roy', customerPhone: '+91 98123 45678', redeemedAt: '5 mins ago', storeName: 'Starbucks Reserve', discountApplied: '₹300 OFF', savingsAmount: '₹300 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1095', vipStatus: true },
      { id: 'rdm-502', couponId: 'cpn-5', couponCode: 'STARBUCKSFREE', customerName: 'Ananya Sharma', customerPhone: '+91 98555 66778', redeemedAt: '22 mins ago', storeName: 'Starbucks Reserve', discountApplied: '₹300 OFF', savingsAmount: '₹300 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1087', vipStatus: false }
    ]
  },
  {
    id: 'cpn-6',
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
      { id: 'rdm-601', couponId: 'cpn-6', couponCode: 'DINTAIFUNG20', customerName: 'Chen Wei', customerPhone: '+91 98111 99887', redeemedAt: '14 mins ago', storeName: 'Din Tai Fung', discountApplied: '20% OFF', savingsAmount: '₹1,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1091', vipStatus: true },
      { id: 'rdm-602', couponId: 'cpn-6', couponCode: 'DINTAIFUNG20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '45 mins ago', storeName: 'Din Tai Fung', discountApplied: '20% OFF', savingsAmount: '₹1,440 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1077', vipStatus: true }
    ]
  },
  {
    id: 'cpn-7',
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
      { id: 'rdm-701', couponId: 'cpn-7', couponCode: 'ROLEX5000', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '10:42 AM', storeName: 'Rolex Boutique', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1089', vipStatus: true }
    ]
  },
  {
    id: 'cpn-8',
    code: 'LVMAISON10',
    title: '10% Off LV Monogram Leather',
    discount: '10% OFF',
    storeName: 'Louis Vuitton Maison',
    category: 'Accessories',
    issuedCount: 600,
    redeemedCount: 112,
    expiryDate: '2026-08-31',
    status: 'Active',
    targetSegment: 'Luxury Accessories',
    redeemedCustomers: [
      { id: 'rdm-801', couponId: 'cpn-8', couponCode: 'LVMAISON10', customerName: 'Charlotte Dubois', customerPhone: '+91 98777 88990', redeemedAt: '28 mins ago', storeName: 'Louis Vuitton Maison', discountApplied: '10% OFF', savingsAmount: '₹16,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1084', vipStatus: true },
      { id: 'rdm-802', couponId: 'cpn-8', couponCode: 'LVMAISON10', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'Louis Vuitton Maison', discountApplied: '10% OFF', savingsAmount: '₹18,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1062', vipStatus: true }
    ]
  },
  {
    id: 'cpn-9',
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
      { id: 'rdm-901', couponId: 'cpn-9', couponCode: 'TIFFANYDIAMOND', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: 'Just now', storeName: 'Tiffany & Co.', discountApplied: '₹15,000 OFF', savingsAmount: '₹15,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1098', vipStatus: true },
      { id: 'rdm-902', couponId: 'cpn-9', couponCode: 'TIFFANYDIAMOND', customerName: 'Eleanor Vance', customerPhone: '+91 98123 45678', redeemedAt: '38 mins ago', storeName: 'Tiffany & Co.', discountApplied: '₹15,000 OFF', savingsAmount: '₹15,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1083', vipStatus: true }
    ]
  },
  {
    id: 'cpn-10',
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
      { id: 'rdm-1001', couponId: 'cpn-10', couponCode: 'CARTIERLUX20', customerName: 'Elena Rossi', customerPhone: '+91 98765 43236', redeemedAt: '19 mins ago', storeName: 'Cartier High Jewelry', discountApplied: '₹20,000 OFF', savingsAmount: '₹20,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1086', vipStatus: true },
      { id: 'rdm-1002', couponId: 'cpn-10', couponCode: 'CARTIERLUX20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'Cartier High Jewelry', discountApplied: '₹20,000 OFF', savingsAmount: '₹20,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1055', vipStatus: true }
    ]
  },
  {
    id: 'cpn-11',
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
      { id: 'rdm-1101', couponId: 'cpn-11', couponCode: 'APPLEVIP5', customerName: 'David Miller', customerPhone: '+91 98333 44556', redeemedAt: '10 mins ago', storeName: 'Apple Experience Store', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1093', vipStatus: true },
      { id: 'rdm-1102', couponId: 'cpn-11', couponCode: 'APPLEVIP5', customerName: 'Aarav Patel', customerPhone: '+91 98234 56789', redeemedAt: '48 mins ago', storeName: 'Apple Experience Store', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1076', vipStatus: false }
    ]
  },
  {
    id: 'cpn-12',
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
      { id: 'rdm-1201', couponId: 'cpn-12', couponCode: 'RAYBAN20', customerName: 'Kavita B.', customerPhone: '+91 98765 43247', redeemedAt: '33 mins ago', storeName: 'Ray-Ban Sunglass Hut', discountApplied: '20% OFF', savingsAmount: '₹2,498 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: false },
      { id: 'rdm-1202', couponId: 'cpn-12', couponCode: 'RAYBAN20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'Ray-Ban Sunglass Hut', discountApplied: '20% OFF', savingsAmount: '₹2,998 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1052', vipStatus: true }
    ]
  },
  {
    id: 'cpn-13',
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
      { id: 'rdm-1301', couponId: 'cpn-13', couponCode: 'GRANDMALL20', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: '45 mins ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹3,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1080', vipStatus: true },
      { id: 'rdm-1302', couponId: 'cpn-13', couponCode: 'GRANDMALL20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹2,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1065', vipStatus: true }
    ]
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-1',
    title: 'Summer Mega Shopping Fest 2026',
    type: 'Omnichannel Mall Fest',
    reach: 48500,
    impressions: 124000,
    qrScans: 8400,
    couponsRedeemed: 2450,
    revenueGenerated: 4280000,
    roi: 380,
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-08-15'
  },
  {
    id: 'cmp-2',
    title: 'Monsoon Gourmet Dining Delight',
    type: 'Food Court & Dining Push',
    reach: 22100,
    impressions: 56000,
    qrScans: 4100,
    couponsRedeemed: 1320,
    revenueGenerated: 1850000,
    roi: 290,
    status: 'Active',
    startDate: '2026-07-25',
    endDate: '2026-08-10'
  },
  {
    id: 'cmp-3',
    title: 'Back to School & Tech Expo',
    type: 'Electronics & Kids',
    reach: 18900,
    impressions: 42000,
    qrScans: 2800,
    couponsRedeemed: 640,
    revenueGenerated: 2950000,
    roi: 410,
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-08-20'
  },
  {
    id: 'cmp-4',
    title: 'Weekend Midnight Blockbuster Drive',
    type: 'Multiplex & Night Dining',
    reach: 15400,
    impressions: 38000,
    qrScans: 2200,
    couponsRedeemed: 810,
    revenueGenerated: 1210000,
    roi: 240,
    status: 'Completed',
    startDate: '2026-07-28',
    endDate: '2026-07-31'
  }
];

export const MOCK_ALERTS: SystemAlert[] = [
  {
    id: 'alt-1',
    title: 'High Footfall Spike Detected',
    description: 'Central Atrium occupancy crossed 85% capacity threshold (1,400 visitors). Security alerted.',
    timestamp: '10 mins ago',
    severity: 'warning',
    category: 'Footfall',
    read: false,
    location: 'Central Atrium Ground Floor'
  },
  {
    id: 'alt-2',
    title: 'WiFi AP-3 Gateway Offline Warning',
    description: 'Access Point AP-South-02 in South Wing reported temporary packet loss.',
    timestamp: '25 mins ago',
    severity: 'critical',
    category: 'Network',
    read: false,
    location: 'South Wing 1st Floor'
  },
  {
    id: 'alt-3',
    title: 'Low Coupon Stock Alert',
    description: 'STARBUCKSBOGO coupon claims reached 80% limit. Consider extending allotment.',
    timestamp: '1 hour ago',
    severity: 'info',
    category: 'Campaign',
    read: true,
    location: 'Starbucks Reserve'
  },
  {
    id: 'alt-4',
    title: 'Store Inventory Sync Delay',
    description: 'Zara inventory POS feed experiencing 5-minute update delay.',
    timestamp: '2 hours ago',
    severity: 'info',
    category: 'Inventory',
    read: true,
    location: 'Zara 1st Floor'
  }
];

// CHART DATASETS
export const HOURLY_CONNECTED_USERS = {
  labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  datasets: [
    {
      label: 'Connected Users (Today)',
      data: [320, 580, 890, 1120, 1280, 1180, 1250, 1380, 1482, 1410, 1320, 980, 510],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    },
    {
      label: 'Connected Users (Yesterday)',
      data: [290, 510, 780, 990, 1150, 1080, 1120, 1210, 1310, 1280, 1190, 840, 420],
      borderColor: '#94A3B8',
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 2
    }
  ]
};

export const DAILY_FOOTFALL = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Total Footfall (Thousands)',
      data: [14.2, 15.8, 16.5, 17.2, 22.4, 38.6, 42.1],
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      borderSkipped: false
    }
  ]
};

export const CATEGORY_DISTRIBUTION = {
  labels: ['Food & Dining', 'Fashion', 'Accessories & Tech', 'Entertainment', 'Services'],
  datasets: [
    {
      data: [32, 28, 18, 12, 10],
      backgroundColor: [
        '#2563EB', // Primary Blue
        '#3B82F6', // Accent Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#8B5CF6'  // Purple
      ],
      borderWidth: 2,
      borderColor: '#FFFFFF'
    }
  ]
};

export const TOP_PERFORMING_STORES_CHART = {
  labels: ['Apple Store', 'PVR Cinemas', 'Zara', 'Nike Flagship', 'Starbucks', 'Decathlon'],
  datasets: [
    {
      label: 'Revenue Today (in ₹ Thousands)',
      data: [890, 580, 412, 384, 198, 310],
      backgroundColor: 'rgba(37, 99, 235, 0.85)',
      borderRadius: 6
    }
  ]
};



