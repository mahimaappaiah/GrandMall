import { Order, ConnectedUser, Store, Reservation, Coupon, Campaign, CouponRedemption } from '../types';

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadOrdersCSV(orders: Order[]) {
  const headers = ['Order Number', 'Customer Name', 'Phone', 'Store Tenant', 'Category', 'Order Type', 'Payment Method', 'Items Count', 'Total Amount (INR)', 'Timestamp', 'Status'];
  const rows = orders.map(o => [
    o.orderNumber,
    o.customerName,
    o.customerPhone,
    o.storeName,
    o.storeCategory,
    o.orderType,
    o.paymentMethod,
    o.itemsCount,
    o.totalAmount,
    o.timestamp,
    o.status
  ]);
  downloadCSV(`AXIONIX_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadOrderReceiptTXT(order: Order) {
  const content = `================================================
            AXIONIX DIGITAL MALL RECEIPT
================================================
Order ID:       ${order.orderNumber}
Date/Time:      ${order.timestamp}
Mall Property:  Phoenix Mall Bengaluru
------------------------------------------------
CUSTOMER DETAILS:
Name:           ${order.customerName}
Phone:          ${order.customerPhone}

STORE / TENANT DETAILS:
Store Name:     ${order.storeName}
Category:       ${order.storeCategory}
Order Type:     ${order.orderType}
Payment Mode:   ${order.paymentMethod}
Status:         ${order.status}
------------------------------------------------
PURCHASED ITEMS (${order.itemsCount}):
${order.itemsList.map(item => `  - ${item}`).join('\n')}
------------------------------------------------
TOTAL AMOUNT PAID: ₹${order.totalAmount.toLocaleString()}
================================================
        Thank you for shopping at AXIONIX!
================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Receipt_${order.orderNumber}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadUsersCSV(users: ConnectedUser[]) {
  const headers = ['User ID', 'Name', 'Phone', 'MAC Address', 'IP Address', 'Connection Time', 'Session Duration', 'Zone', 'Device Type', 'Data Used', 'Status', 'VIP Status', 'Visited Stores'];
  const rows = users.map(u => [
    u.id,
    u.name,
    u.phone,
    u.macAddress,
    u.ipAddress,
    u.connectionTime,
    u.sessionDuration,
    u.zone,
    u.deviceType,
    u.dataUsed,
    u.status,
    u.vipStatus ? 'VIP' : 'Standard',
    u.visitedStores.join('; ')
  ]);
  downloadCSV(`AXIONIX_Connected_Users_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadStoresCSV(stores: Store[]) {
  const headers = ['Store ID', 'Store Name', 'Category', 'Floor', 'Zone', 'Manager', 'Phone', 'Open Hours', 'Visitors Today', 'Orders Count', 'Reservations Count', 'Conversion Rate (%)', 'Revenue Today (INR)', 'Status'];
  const rows = stores.map(s => [
    s.id,
    s.name,
    s.category,
    s.floor,
    s.zone,
    s.manager,
    s.phone,
    s.openHours,
    s.visitorsToday,
    s.ordersCount,
    s.reservationsCount,
    s.conversionRate,
    s.revenueToday,
    s.status
  ]);
  downloadCSV(`AXIONIX_Store_Directory_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadReservationsCSV(reservations: Reservation[]) {
  const headers = ['Ref Code', 'Guest Name', 'Phone', 'Store Tenant', 'Party Size', 'Time Slot', 'Date', 'Status', 'Special Notes'];
  const rows = reservations.map(r => [
    r.refCode,
    r.guestName,
    r.guestPhone,
    r.storeName,
    r.partySize,
    r.timeSlot,
    r.date || 'Today',
    r.status,
    r.specialNotes || r.specialRequest || ''
  ]);
  downloadCSV(`AXIONIX_Reservations_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadCouponsCSV(coupons: Coupon[]) {
  const headers = ['ID', 'Code', 'Title', 'Discount', 'Store Name', 'Category', 'Issued', 'Redeemed', 'Expiry Date', 'Target Segment', 'Status'];
  const rows = coupons.map(c => [
    c.id,
    c.code,
    c.title,
    c.discount,
    c.storeName,
    c.category,
    c.issuedCount,
    c.redeemedCount,
    c.expiryDate,
    c.targetSegment,
    c.status
  ]);
  downloadCSV(`AXIONIX_Coupons_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadCampaignsCSV(campaigns: Campaign[]) {
  const headers = ['ID', 'Title', 'Type', 'Reach', 'Impressions', 'QR Scans', 'Coupons Redeemed', 'Revenue Generated (INR)', 'ROI (%)', 'Status', 'Start Date', 'End Date'];
  const rows = campaigns.map(c => [
    c.id,
    c.title,
    c.type,
    c.reach,
    c.impressions,
    c.qrScans,
    c.couponsRedeemed,
    c.revenueGenerated,
    c.roi,
    c.status,
    c.startDate,
    c.endDate
  ]);
  downloadCSV(`AXIONIX_Campaigns_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadRedeemedCustomersCSV(couponCode: string, customers: CouponRedemption[]) {
  const headers = ['Redemption ID', 'Coupon Code', 'Customer Name', 'Phone', 'VIP Status', 'Redeemed At', 'Store Tenant', 'Discount', 'Savings Amount', 'Acquisition Channel', 'Order Number'];
  const rows = customers.map(c => [
    c.id,
    c.couponCode,
    c.customerName,
    c.customerPhone,
    c.vipStatus ? 'VIP Member' : 'Standard Guest',
    c.redeemedAt,
    c.storeName,
    c.discountApplied,
    c.savingsAmount,
    c.channel,
    c.orderNumber || 'N/A'
  ]);
  downloadCSV(`Redeemed_Customers_${couponCode}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadDailyOperationsCSV() {
  const headers = ['Metric Category', 'Metric Name', 'Current Value', 'Target / Capacity', 'Status / Trend', 'Notes'];
  const rows = [
    ['Footfall Telemetry', 'Total Daily Visitors', '6,824', '10,000 Cap', '+12.4% vs Avg', 'Real-time LiDAR & Optical Sensors'],
    ['WiFi Infrastructure', 'Active Connected Guests', '1,482', '5,000 AP Cap', 'Optimal', 'HighSpeed Captive Portal Online'],
    ['POS Financials', 'Gross Mall POS Revenue', '₹19,500,000', '₹20,000,000', 'Exceeding Target', 'Real-time POS Sync Active'],
    ['Digital Orders', 'Concierge & In-Store Orders', '1,245', '1,500 Target', '+8.6% Conversion', 'Store Pickup & VIP Concierge'],
    ['Store Network', 'Active Operating Stores', '18 Flagships', '18 Total', '100% Operational', 'Ground, 1st, 2nd, 3rd Floors'],
    ['VIP Reservations', 'Fitting Suites & Dining', '45 Bookings', '50 Suites', '90% Capacity', 'VIP Guest Concierge Active'],
    ['Campaigns & Deals', 'Active Promotion Claims', '894 Claims', '1,500 Issued', '59.6% Claim Rate', 'WiFi Captive Gateway Promotions'],
    ['Network Traffic', 'Total Data Consumed', '480.5 GB', '2.0 TB Cap', 'Healthy Uptime', 'AXIONIX Enterprise Gateway']
  ];
  downloadCSV(`AXIONIX_Daily_Operations_Summary_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadLoyaltyCSV() {
  const headers = ['Member ID', 'Customer Name', 'Phone Number', 'Loyalty Tier', 'Points Balance', 'Lifetime Points', 'Tier Upgrade Date', 'Status'];
  const rows = [
    ['LYL-1001', 'yoshi', '+91 84950 93170', 'VIP Platinum', 16400, 22100, '2026-08-01', 'Active'],
    ['LYL-1002', 'Aastha Sharma', '+91 98123 98765', 'VIP Gold', 6200, 9800, '2026-08-05', 'Active'],
    ['LYL-1003', 'Priya Sharma', '+91 98345 67890', 'VIP Platinum', 18900, 25400, '2026-07-28', 'Active'],
    ['LYL-1004', 'Reynold Ricky', '+91 98987 65432', 'VIP Platinum', 14200, 19800, '2026-08-02', 'Active'],
    ['LYL-1005', 'Mahima Roy', '+91 98123 45678', 'VIP Silver', 1850, 3450, '2026-08-10', 'Active'],
    ['LYL-1006', 'Fabrizio Rossi', '+91 98666 77889', 'VIP Gold', 7400, 11200, '2026-08-04', 'Active'],
    ['LYL-1007', 'Claire Montrose', '+91 98111 22334', 'VIP Platinum', 21000, 31500, '2026-07-15', 'Active']
  ];
  downloadCSV(`AXIONIX_Loyalty_Rewards_Audit_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadSpatialFootfallCSV() {
  const headers = ['Floor Level', 'Zone Name', 'Current Density', 'Total Visitors Today', 'Active Stores', 'Peak Traffic Hour', 'Zone Conversion Rate (%)', 'Dwell Time (mins)'];
  const rows = [
    ['Ground Floor', 'North Wing', 'High (Red)', 1420, 4, '04:00 PM - 06:00 PM', '42.5%', '38 mins'],
    ['Ground Floor', 'Central Atrium', 'Peak (Blue)', 2150, 6, '01:00 PM - 03:00 PM', '51.2%', '45 mins'],
    ['Ground Floor', 'East Wing', 'Medium (Amber)', 980, 3, '05:00 PM - 07:00 PM', '36.8%', '32 mins'],
    ['1st Floor', 'Fashion Promenade', 'High (Pink)', 1120, 3, '02:00 PM - 05:00 PM', '39.4%', '41 mins'],
    ['1st Floor', 'South Atrium Deck', 'Medium (Blue)', 640, 2, '03:00 PM - 06:00 PM', '28.1%', '25 mins'],
    ['2nd Floor', 'Dining Hub North', 'Peak (Gold)', 1890, 4, '12:30 PM - 03:30 PM', '58.6%', '52 mins'],
    ['2nd Floor', 'Food Court South', 'Medium (Blue)', 920, 2, '01:00 PM - 03:00 PM', '46.0%', '35 mins'],
    ['3rd Floor', 'Multiplex & Entertainment', 'High (Purple)', 1350, 1, '06:00 PM - 09:30 PM', '62.1%', '115 mins']
  ];
  downloadCSV(`AXIONIX_Spatial_Footfall_Analytics_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadMasterAuditCSV(stores: Store[], users: ConnectedUser[], orders: Order[], reservations: Reservation[], coupons: Coupon[], campaigns: Campaign[]) {
  const headers = ['Entity Type', 'ID / Ref', 'Name / Title', 'Phone / Category', 'Primary Metric', 'Secondary Metric', 'Timestamp / Expiry', 'Status'];
  const rows: (string | number)[][] = [];

  stores.forEach(s => {
    rows.push(['Store Tenant', s.id, s.name, `${s.category} (${s.floor})`, `₹${s.revenueToday.toLocaleString()} Rev`, `${s.ordersCount} Orders`, s.openHours, s.status]);
  });
  users.forEach(u => {
    rows.push(['Connected User', u.id, u.name, u.phone, u.vipStatus ? 'VIP Member' : 'Standard Guest', `Data: ${u.dataUsed}`, u.connectionTime, u.status]);
  });
  orders.forEach(o => {
    rows.push(['Store Order', o.orderNumber, o.customerName, o.storeName, `₹${o.totalAmount.toLocaleString()}`, `${o.itemsCount} Items (${o.paymentMethod})`, o.timestamp, o.status]);
  });
  reservations.forEach(r => {
    rows.push(['VIP Reservation', r.refCode, r.guestName, r.storeName, `Party of ${r.partySize}`, r.timeSlot, r.date || 'Today', r.status]);
  });
  coupons.forEach(c => {
    rows.push(['Coupon Campaign', c.code, c.title, c.storeName, c.discount, `${c.redeemedCount}/${c.issuedCount} Redeemed`, c.expiryDate, c.status]);
  });
  campaigns.forEach(cmp => {
    rows.push(['Marketing Campaign', cmp.id, cmp.title, cmp.type, `Reach: ${cmp.reach}`, `ROI: ${cmp.roi}%`, cmp.endDate, cmp.status]);
  });

  downloadCSV(`AXIONIX_Master_System_Audit_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadAuditLogsCSV(logs: any[]) {
  const headers = ['Audit ID', 'Timestamp', 'Admin User', 'Action Event', 'Resource Type', 'Resource ID', 'Details / Payload', 'Tamper Status'];
  const rows = logs.map(l => [
    l.id,
    l.createdAt || l.timestamp || new Date().toISOString(),
    l.adminEmail || l.actor || 'admin@thegrandmall.com',
    l.action,
    l.resourceType || l.resource || 'system',
    l.resourceId || '-',
    typeof l.details === 'object' ? JSON.stringify(l.details) : l.details || '-',
    l.status || 'Recorded ✓'
  ]);
  downloadCSV(`AXIONIX_Admin_Audit_Logs_Export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

export function downloadMallPayLedgerCSV(txs: any[]) {
  const headers = ['Transaction ID', 'Timestamp', 'Customer / Wallet Phone', 'Customer Name', 'Type', 'Description / Channel', 'Amount (INR)', 'Cashback Multiplier'];
  const rows = txs.map(t => [
    t.id,
    t.timestamp,
    t.phone,
    t.customerName || 'Valued Guest',
    t.type,
    t.description,
    t.amount,
    t.multiplier
  ]);
  downloadCSV(`AXIONIX_Mall_Pay_Unified_Wallet_Ledger_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

