import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { SystemAlert } from '../../types';

interface NotificationsViewProps {
  alerts: SystemAlert[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ alerts, onDismiss, onMarkAllRead }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.severity === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            AXIONIX System Notifications &amp; Security Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts for high atrium footfall spikes, access point packet loss, and tenant inventory feeds.
          </p>
        </div>

        <button
          onClick={onMarkAllRead}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          Mark All As Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        {(['all', 'critical', 'warning', 'info'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f === 'all' ? 'All Alerts' : f}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-semibold text-sm">
            ✅ No alerts in this category
          </div>
        )}
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              !alert.read ? 'ring-2 ring-blue-200/60' : ''
            } ${
              alert.severity === 'critical' ? 'bg-rose-50/40 border-rose-200' :
              alert.severity === 'warning' ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl text-white shrink-0 font-bold ${
                alert.severity === 'critical' ? 'bg-rose-600' :
                alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
              }`}>
                {alert.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                 alert.severity === 'warning' ? <ShieldAlert className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    alert.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                    alert.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity} • {alert.category}
                  </span>
                  {!alert.read && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">NEW</span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">{alert.timestamp}</span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 mt-1">{alert.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{alert.description}</p>
                {alert.location && (
                  <div className="text-[11px] font-semibold text-slate-500 mt-2">
                    Location: {alert.location}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
