// ============================================================
// PowerGuard - Admin Dashboard
// User management, system health, ML models, logs, analytics
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Cpu, Database, Activity, Shield, Brain,
  Server, HardDrive, Wifi, AlertTriangle, CheckCircle,
  XCircle, Clock, TrendingUp, Download, RefreshCw,
  Settings, Layers, BarChart3
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import ChartCard from '../../components/cards/ChartCard';
import { mockSystemLogs, mockUsers } from '../../data/mockData';

const userGrowthData = [
  { name: 'Jan', consumers: 6200, officers: 85, admins: 5 },
  { name: 'Feb', consumers: 6450, officers: 88, admins: 5 },
  { name: 'Mar', consumers: 6780, officers: 90, admins: 6 },
  { name: 'Apr', consumers: 7100, officers: 92, admins: 6 },
  { name: 'May', consumers: 7500, officers: 95, admins: 6 },
  { name: 'Jun', consumers: 8100, officers: 98, admins: 7 },
  { name: 'Jul', consumers: 8750, officers: 102, admins: 7 },
];

const alertTrendsData = [
  { name: 'Mon', theft: 3, voltage: 5, offline: 2, overload: 1 },
  { name: 'Tue', theft: 2, voltage: 3, offline: 4, overload: 2 },
  { name: 'Wed', theft: 5, voltage: 4, offline: 1, overload: 3 },
  { name: 'Thu', theft: 1, voltage: 6, offline: 3, overload: 1 },
  { name: 'Fri', theft: 4, voltage: 2, offline: 2, overload: 4 },
  { name: 'Sat', theft: 2, voltage: 3, offline: 1, overload: 2 },
  { name: 'Sun', theft: 1, voltage: 1, offline: 5, overload: 1 },
];

const mlModelData = [
  { name: 'Isolation Forest', accuracy: 94.2, status: 'active', version: 'v2.3', lastTrained: '2 days ago', predictions: 12450 },
  { name: 'Random Forest', accuracy: 91.8, status: 'active', version: 'v3.1', lastTrained: '1 day ago', predictions: 8920 },
  { name: 'XGBoost', accuracy: 96.1, status: 'active', version: 'v2.7', lastTrained: '3 hours ago', predictions: 15680 },
  { name: 'Prophet (Forecast)', accuracy: 89.5, status: 'active', version: 'v1.4', lastTrained: '6 hours ago', predictions: 3240 },
  { name: 'K-Means (Segment)', accuracy: 87.3, status: 'training', version: 'v1.2', lastTrained: 'In progress', predictions: 5100 },
];

const roleDistribution = [
  { name: 'Consumers', value: 8750, color: '#3b82f6' },
  { name: 'Officers', value: 102, color: '#10b981' },
  { name: 'Admins', value: 7, color: '#f59e0b' },
];

const systemMetrics = {
  cpu: 42,
  memory: 67,
  disk: 54,
  uptime: '99.97%',
  apiLatency: 45,
  dbConnections: 18,
  activeWebSockets: 234,
  mlServiceStatus: 'online' as const,
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System Administration • Full Control Panel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 btn-accent text-white rounded-lg text-xs font-medium">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="8,859"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          delay={0}
          trend={{ value: 4.5, direction: 'up' }}
        />
        <StatCard
          title="Smart Meters"
          value="7,890"
          subtitle="Active: 7,120 • Inactive: 770"
          icon={<Cpu className="w-5 h-5" />}
          color="green"
          delay={0.05}
        />
        <StatCard
          title="ML Predictions Today"
          value="45,390"
          icon={<Brain className="w-5 h-5" />}
          color="purple"
          delay={0.1}
          trend={{ value: 12.3, direction: 'up' }}
        />
        <StatCard
          title="System Uptime"
          value={systemMetrics.uptime}
          subtitle="Last restart: 45 days ago"
          icon={<Server className="w-5 h-5" />}
          color="cyan"
          delay={0.15}
        />
      </div>

      {/* System Health Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-primary-500" />
            System Health Monitor
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <div className="live-dot !w-2 !h-2" />
            All Systems Operational
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'CPU', value: systemMetrics.cpu, icon: <Cpu className="w-4 h-4" />, unit: '%' },
            { label: 'Memory', value: systemMetrics.memory, icon: <HardDrive className="w-4 h-4" />, unit: '%' },
            { label: 'Disk', value: systemMetrics.disk, icon: <Database className="w-4 h-4" />, unit: '%' },
            { label: 'API Latency', value: systemMetrics.apiLatency, icon: <Activity className="w-4 h-4" />, unit: 'ms' },
            { label: 'DB Conns', value: systemMetrics.dbConnections, icon: <Database className="w-4 h-4" />, unit: '/20' },
            { label: 'WebSockets', value: systemMetrics.activeWebSockets, icon: <Wifi className="w-4 h-4" />, unit: '' },
            { label: 'ML Service', value: 100, icon: <Brain className="w-4 h-4" />, unit: '%', status: 'online' },
            { label: 'Uptime', value: 99.97, icon: <Clock className="w-4 h-4" />, unit: '%' },
          ].map((metric, i) => (
            <div key={i} className="text-center">
              <div className={`mx-auto w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                typeof metric.value === 'number' && metric.value > 80 && metric.label !== 'Uptime' && metric.label !== 'ML Service'
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                  : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
              }`}>
                {metric.icon}
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {metric.value}{metric.unit}
              </div>
              <div className="text-[10px] text-slate-500">{metric.label}</div>
              {/* Progress bar */}
              {typeof metric.value === 'number' && metric.unit === '%' && metric.label !== 'Uptime' && (
                <div className="mt-1.5 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metric.value > 80 ? 'bg-amber-500' : metric.value > 60 ? 'bg-primary-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth */}
        <ChartCard title="User Growth" subtitle="Monthly registered users" delay={0.25}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorConsumers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <YAxis tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="consumers" stroke="#3b82f6" strokeWidth={2} fill="url(#colorConsumers)" name="Consumers" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alert Trends */}
        <ChartCard title="Alert Trends" subtitle="This week by category" delay={0.3}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alertTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <YAxis tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="theft" fill="#ef4444" radius={[2, 2, 0, 0]} name="Theft" stackId="a" />
              <Bar dataKey="voltage" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Voltage" stackId="a" />
              <Bar dataKey="offline" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Offline" stackId="a" />
              <Bar dataKey="overload" fill="#06b6d4" radius={[2, 2, 0, 0]} name="Overload" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ML Models & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ML Models */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              ML Models
            </h3>
            <button className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Manage
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mlModelData.map(model => (
              <div key={model.name} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {model.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                    )}
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{model.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{model.version}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 ml-6">
                  <span>Accuracy: <strong className="text-emerald-500">{model.accuracy}%</strong></span>
                  <span>{model.predictions.toLocaleString()} predictions</span>
                  <span>Trained: {model.lastTrained}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              System Logs
            </h3>
            <button className="text-xs text-primary-600 dark:text-primary-400 font-medium">View All →</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {mockSystemLogs.map(log => (
              <div key={log.id} className="px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-mono text-xs">
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded font-semibold uppercase ${
                    log.level === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    log.level === 'warn' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    log.level === 'debug' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                    'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  }`}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-700 dark:text-slate-300 break-all">{log.message}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {log.source} • {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="User Distribution" subtitle="By role" delay={0.45}>
          <div className="flex flex-col items-center justify-center h-full">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  stroke="none"
                >
                  {roleDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              {roleDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add User', icon: <Users className="w-5 h-5" />, color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
              { label: 'Register Meter', icon: <Cpu className="w-5 h-5" />, color: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400' },
              { label: 'Train Model', icon: <Brain className="w-5 h-5" />, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
              { label: 'Export Logs', icon: <Download className="w-5 h-5" />, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
              { label: 'System Config', icon: <Settings className="w-5 h-5" />, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' },
              { label: 'View Reports', icon: <BarChart3 className="w-5 h-5" />, color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
              { label: 'Notifications', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
              { label: 'Database', icon: <Database className="w-5 h-5" />, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
            ].map((action, i) => (
              <button
                key={i}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} border border-transparent hover:border-current/20 transition-all hover:scale-105`}
              >
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
