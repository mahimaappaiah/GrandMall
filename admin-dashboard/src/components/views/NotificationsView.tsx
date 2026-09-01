import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, ShieldAlert, CheckCheck, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { SystemAlert } from '../../types';

interface NotificationsViewProps {
  alerts: SystemAlert[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onMarkAlertRead?: (id: string) => void;
  onTriggerTestAlert?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  alerts,
  onDismiss,
  onMarkAllRead,
  onMarkAlertRead,
  onTriggerTestAlert
}) => {
  const [filter, setFilter] = useState<'active' | 'critical' | 'warning' | 'info' | 'all'>('active');

  const unreadAlerts = alerts.filter(a => !a.read && !a.is_read);
  
  const displayAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.read && !a.is_read;
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const activeCount = unreadAlerts.length;

  return (
    <div className="space-y-6">
      
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

        <div className="flex items-center gap-2.5 flex-wrap">
          {onTriggerTestAlert && (
            <button
              onClick={onTriggerTestAlert}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Simulate Live Alert
            </button>
          )}

          <button
            onClick={onMarkAllRead}
            disabled={activeCount === 0 && alerts.length === 0}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCount > 0 || alerts.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-default'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            Mark All As Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-x-auto">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Unread {activeCount > 0 && `(${activeCount})`}
        </button>
        {(['critical', 'warning', 'info'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              filter === f
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All History ({alerts.length})
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All notifications have been marked as seen and cleared. New security events, gateway alerts, and campaign triggers will automatically appear here.
            </p>
            {onTriggerTestAlert && (
              <button
                onClick={onTriggerTestAlert}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Trigger Sample Alert
              </button>
            )}
          </div>
        ) : (
          displayAlerts.map(alert => {
            const isUnread = !alert.read && !alert.is_read;
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread ? 'ring-2 ring-blue-500/20 bg-blue-50/20' : 'bg-white'
                } ${
                  alert.severity === 'critical' ? 'border-rose-200' :
                  alert.severity === 'warning' ? 'border-amber-200' : 'border-slate-200/80'
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
                      {isUnread && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">NEW</span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">{alert.timestamp}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{alert.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.description || alert.message}</p>
                    {alert.location && (
                      <div className="text-[11px] font-semibold text-slate-500 mt-2">
                        Location: {alert.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onMarkAlertRead && isUnread && (
                    <button
                      onClick={() => onMarkAlertRead(alert.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark Seen
                    </button>
                  )}
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
