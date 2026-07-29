import { useState, useEffect } from 'react';
import { Server, Activity, Database, Cpu, HardDrive, Wifi, ShieldAlert, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockCpuData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}s ago`,
  usage: Math.floor(Math.random() * 30) + 20,
}));

const mockMemoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}s ago`,
  usage: Math.floor(Math.random() * 15) + 60,
}));

export default function SystemHealthPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-500" />
            System Health & Infrastructure
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring of Docker containers, APIs, and database performance.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'API Server', status: 'Healthy', ping: '12ms', icon: Activity, color: 'emerald' },
          { name: 'ML Engine', status: 'Healthy', ping: '45ms', icon: Cpu, color: 'emerald' },
          { name: 'MySQL Database', status: 'Healthy', ping: '8ms', icon: Database, color: 'emerald' },
          { name: 'WebSocket Broker', status: 'Degraded', ping: '150ms', icon: Wifi, color: 'amber' },
        ].map((service, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${service.color}-100 dark:bg-${service.color}-900/30 text-${service.color}-600 dark:text-${service.color}-400`}>
              <service.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{service.name}</div>
              <div className="flex items-center gap-2 text-xs font-medium mt-1">
                <span className={`text-${service.color}-600 dark:text-${service.color}-400`}>{service.status}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{service.ping}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-500" /> CPU Utilization
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg">
              Avg: 28%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockCpuData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-500" /> Memory Usage
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
              Avg: 6.2 GB / 8 GB
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMemoryData}>
                <defs>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="usage" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#memGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
