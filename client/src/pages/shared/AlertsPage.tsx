import { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, ShieldCheck, CheckCircle2, Search, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';

const mockAlerts = [
  { id: 'ALT-101', type: 'theft', severity: 'critical', title: 'Suspected Theft Detected', message: 'Current drop of 80% without corresponding voltage change detected on MTR-4092.', time: new Date(Date.now() - 1000 * 60 * 15), status: 'active', area: 'North Sector' },
  { id: 'ALT-102', type: 'overload', severity: 'high', title: 'Transformer Overload Warning', message: 'Transformer TR-04 is running at 92% capacity. Expected to exceed limits in 2 hours.', time: new Date(Date.now() - 1000 * 60 * 45), status: 'active', area: 'Downtown' },
  { id: 'ALT-103', type: 'system', severity: 'warning', title: 'Meter Disconnected', message: 'Smart meter MTR-1022 has stopped sending heartbeat signals for 15 minutes.', time: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'resolved', area: 'East Suburb' },
  { id: 'ALT-104', type: 'billing', severity: 'info', title: 'Tariff Update Applied', message: 'New peak hour tariff rates have been successfully applied to all consumer meters.', time: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'resolved', area: 'System Wide' },
  { id: 'ALT-105', type: 'theft', severity: 'critical', title: 'Tamper Alert', message: 'Physical case open detected on meter MTR-8812. Immediate inspection required.', time: new Date(Date.now() - 1000 * 60 * 60 * 26), status: 'active', area: 'West Zone' },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  
  const filteredAlerts = filter === 'all' 
    ? mockAlerts 
    : mockAlerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Alerts & Notifications Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time system alerts, theft warnings, and infrastructure health notifications.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-sm text-slate-500 mr-2 shrink-0">
            <Filter className="w-4 h-4" /> Severity:
          </div>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'warning', label: 'Warning' },
            { id: 'info', label: 'Information' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === c.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary-500 w-64 transition-colors"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${alert.status === 'active' ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50 opacity-75'}`}>
              <div className="flex gap-4">
                <div className={`p-3 rounded-full h-fit shrink-0 ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                  alert.severity === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {alert.severity === 'critical' ? <ShieldAlert className="w-6 h-6" /> :
                   alert.severity === 'high' ? <AlertTriangle className="w-6 h-6" /> :
                   alert.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                   <Info className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {alert.title}
                        {alert.status === 'active' && <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      </h3>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        ID: {alert.id} • {alert.area}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {format(alert.time, 'MMM d, yyyy • hh:mm a')}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {alert.message}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {alert.status === 'active' ? (
                      <>
                        <button className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
                          Acknowledge
                        </button>
                        <button className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          Create Ticket
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
