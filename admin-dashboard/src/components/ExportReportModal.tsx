import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, FileSpreadsheet, Calendar } from 'lucide-react';
import { 
  downloadStoresCSV, 
  downloadUsersCSV, 
  downloadOrdersCSV, 
  downloadReservationsCSV, 
  downloadCampaignsCSV, 
  downloadCouponsCSV,
  downloadDailyOperationsCSV,
  downloadLoyaltyCSV,
  downloadSpatialFootfallCSV,
  downloadMasterAuditCSV
} from '../utils/exportUtils';
import { MOCK_STORES, MOCK_USERS, MOCK_ORDERS, MOCK_RESERVATIONS, MOCK_COUPONS, MOCK_CAMPAIGNS } from '../data/mockData';
import { recordAuditLog } from '../services/supabaseService';

interface ExportReportModalProps {
  reportType?: string;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ reportType = 'Daily Mall Operations', onClose }) => {
  const [dateRange, setDateRange] = useState('Today (Aug 03, 2026)');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);
    recordAuditLog('CUSTOMER_DATA_EXPORTED', 'report', reportType, { reportName: reportType, format: 'CSV', dateRange });
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);

      const titleLower = reportType.toLowerCase();

      if (titleLower.includes('tenant revenue') || titleLower.includes('pos statement')) {
        downloadStoresCSV(MOCK_STORES);
      } else if (titleLower.includes('customer crm') || titleLower.includes('vip member')) {
        downloadUsersCSV(MOCK_USERS);
      } else if (titleLower.includes('concierge') || titleLower.includes('orders audit')) {
        downloadOrdersCSV(MOCK_ORDERS);
      } else if (titleLower.includes('reservations') || titleLower.includes('fitting room')) {
        downloadReservationsCSV(MOCK_RESERVATIONS);
      } else if (titleLower.includes('marketing') || titleLower.includes('campaign')) {
        downloadCampaignsCSV(MOCK_CAMPAIGNS);
      } else if (titleLower.includes('loyalty') || titleLower.includes('rewards')) {
        downloadLoyaltyCSV();
      } else if (titleLower.includes('wifi') || titleLower.includes('bandwidth')) {
        downloadUsersCSV(MOCK_USERS);
      } else if (titleLower.includes('spatial') || titleLower.includes('traffic')) {
        downloadSpatialFootfallCSV();
      } else if (titleLower.includes('master')) {
        downloadMasterAuditCSV(MOCK_STORES, MOCK_USERS, MOCK_ORDERS, MOCK_RESERVATIONS, MOCK_COUPONS, MOCK_CAMPAIGNS);
      } else {
        downloadDailyOperationsCSV();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Management Report</h2>
              <p className="text-xs text-slate-500">{reportType}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Report successfully generated and downloaded as CSV!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date Period Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="Today (Aug 03, 2026)">Today (Aug 03, 2026)</option>
              <option value="Yesterday (Aug 02, 2026)">Yesterday (Aug 02, 2026)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days (July 2026)">Last 30 Days (July 2026)</option>
              <option value="Custom Fiscal Quarter Q3">Custom Fiscal Quarter Q3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Export File Format</label>
            <div className="p-3.5 rounded-xl border border-blue-600/40 bg-blue-50/60 text-blue-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-extrabold text-slate-900">Standard CSV Data (.csv)</div>
                  <div className="text-[11px] text-slate-500 font-medium">Comma-separated values for Excel, BI & Analytics</div>
                </div>
              </div>
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                CSV Enabled
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="font-bold text-slate-800">Included Analytics Metrics:</div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500">
              <li>Footfall hourly distribution & store conversion rate</li>
              <li>WiFi gateway connection logs & MAC dwell times</li>
              <li>POS Tenant gross revenue & digital order receipts</li>
              <li>Campaign ROI & coupon redemption summary</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {isExporting ? 'Exporting CSV...' : 'Download CSV Report'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
