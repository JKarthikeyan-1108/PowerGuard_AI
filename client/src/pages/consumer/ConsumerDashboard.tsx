// ============================================================
// PowerGuard - Consumer Dashboard
// Live metrics, consumption charts, bill prediction,
// energy score, recommendations, and alerts
// ============================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import {
  Zap, Activity, Gauge, DollarSign, TrendingUp,
  Leaf, ThermometerSun, Lightbulb, Battery, Clock,
  Download, Calendar, AlertTriangle, Bell
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import ChartCard from '../../components/cards/ChartCard';
import {
  generateMeterReading, generateConsumptionHistory,
  generateMonthlyConsumption, generateVoltageHistory,
  mockRecommendations, mockAlerts, mockNotifications
} from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import type { MeterReading } from '../../types';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const energyScoreData = [
  { name: 'Score', value: 78 },
  { name: 'Remaining', value: 22 },
];

export default function ConsumerDashboard() {
  const [liveData, setLiveData] = useState<MeterReading>(generateMeterReading());
  const [consumptionData] = useState(generateConsumptionHistory());
  const [monthlyData] = useState(generateMonthlyConsumption());
  const [voltageData] = useState(generateVoltageHistory());
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Live data update every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(generateMeterReading());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Consumer Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, Rajesh Kumar • Last updated: Just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-lg text-xs font-medium">
            <div className="live-dot !w-2 !h-2" />
            Live Monitoring
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Live Meter Readings - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Voltage"
          value={`${liveData.voltage} V`}
          icon={<Zap className="w-5 h-5" />}
          color="blue"
          delay={0}
          trend={{ value: 2.1, direction: liveData.voltage > 235 ? 'up' : 'down' }}
        />
        <StatCard
          title="Current"
          value={`${liveData.current} A`}
          icon={<Activity className="w-5 h-5" />}
          color="green"
          delay={0.05}
          trend={{ value: 1.5, direction: 'up' }}
        />
        <StatCard
          title="Power"
          value={`${(liveData.power / 1000).toFixed(2)} kW`}
          icon={<Gauge className="w-5 h-5" />}
          color="amber"
          delay={0.1}
          trend={{ value: 3.2, direction: 'up' }}
        />
        <StatCard
          title="Energy"
          value={`${liveData.energy} kWh`}
          icon={<Battery className="w-5 h-5" />}
          color="purple"
          delay={0.15}
        />
        <StatCard
          title="Frequency"
          value={`${liveData.frequency} Hz`}
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
          delay={0.2}
        />
        <StatCard
          title="Power Factor"
          value={liveData.powerFactor.toFixed(2)}
          icon={<Gauge className="w-5 h-5" />}
          color={liveData.powerFactor > 0.85 ? 'green' : 'red'}
          delay={0.25}
        />
      </div>

      {/* Bill & Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Usage"
          value="18.5 kWh"
          subtitle="Target: 20 kWh"
          icon={<ThermometerSun className="w-5 h-5" />}
          color="blue"
          delay={0.3}
          trend={{ value: 5.2, direction: 'down', label: 'vs yesterday' }}
        />
        <StatCard
          title="Monthly Usage"
          value="342 kWh"
          subtitle="Billing cycle: Jul 1-31"
          icon={<Calendar className="w-5 h-5" />}
          color="green"
          delay={0.35}
          trend={{ value: 8.1, direction: 'up' }}
        />
        <StatCard
          title="Current Bill"
          value={formatCurrency(2450)}
          subtitle="Due: Aug 15, 2026"
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
          delay={0.4}
          trend={{ value: 12.3, direction: 'up' }}
        />
        <StatCard
          title="Next Month (Est.)"
          value={formatCurrency(2680)}
          subtitle="Predicted by AI"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          delay={0.45}
          trend={{ value: 9.4, direction: 'up' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Consumption Chart */}
        <ChartCard
          title="Electricity Consumption"
          subtitle="Today's hourly usage (kWh)"
          delay={0.5}
          className="lg:col-span-2"
          actions={
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              {(['daily', 'weekly', 'monthly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedPeriod === p
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={consumptionData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorUsage)"
                name="Usage (kWh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Energy Score */}
        <ChartCard title="Energy Score" subtitle="Your efficiency rating" delay={0.55}>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={energyScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="rgba(148,163,184,0.1)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">78</span>
                <span className="text-xs text-accent-500 font-medium">Good</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">12.5 kg</div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Leaf className="w-3 h-3 text-accent-500" />
                  Carbon Footprint
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">₹7.5/kWh</div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-500" />
                  Avg. Cost
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Bill History & Voltage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Bill History" subtitle="Last 12 months (₹)" delay={0.6}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
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
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Usage (kWh)" />
              <Bar dataKey="value2" fill="#10b981" radius={[4, 4, 0, 0]} name="Bill (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Voltage Trend" subtitle="Last 60 minutes" delay={0.65}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={voltageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <YAxis domain={[215, 245]} tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} name="Voltage (V)" />
              {/* Reference lines for safe range */}
              <Line type="monotone" dataKey={() => 220} stroke="rgba(239,68,68,0.3)" strokeDasharray="5 5" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey={() => 240} stroke="rgba(239,68,68,0.3)" strokeDasharray="5 5" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recommendations & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Energy Saving Recommendations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">AI-generated suggestions to reduce your bill</p>
            </div>
            <span className="text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-2 py-1 rounded-lg">
              Est. savings: ₹3,400/mo
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockRecommendations.slice(0, 4).map((rec, i) => (
              <div key={rec.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                  rec.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                  'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                }`}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{rec.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{rec.description}</div>
                </div>
                <div className="text-xs font-medium text-accent-600 dark:text-accent-400 whitespace-nowrap">
                  Save ₹{rec.estimatedSavings}/mo
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" />
              Recent Notifications
            </h3>
            <span className="text-xs text-slate-500">{mockNotifications.filter(n => !n.isRead).length} unread</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockNotifications.map(notif => (
              <div
                key={notif.id}
                className={`px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  !notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === 'info' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' :
                  notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                  notif.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                  'bg-accent-50 dark:bg-accent-900/20 text-accent-500'
                }`}>
                  {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notif.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
