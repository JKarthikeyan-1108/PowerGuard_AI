// ============================================================
// PowerGuard - Utility Dashboard
// Overview, theft alerts, area consumption, transformers,
// high-risk consumers, inspection queue, and demand forecast
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Activity, Cpu, Shield, AlertTriangle,
  MapPin, TrendingUp, Download, Eye, ChevronRight,
  Radio, Thermometer, ArrowUpRight, BarChart3
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import ChartCard from '../../components/cards/ChartCard';
import {
  mockAreaConsumption, mockTransformerStatus,
  mockHighRiskConsumers, mockInspectionQueue,
  mockAlerts, generateDemandForecast
} from '../../data/mockData';
import { formatNumber } from '../../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const areaChartData = mockAreaConsumption.map(a => ({
  name: a.area.replace(/\s+/g, '\n'),
  consumption: a.consumption / 1000,
  consumers: a.consumers,
}));

const transformerPieData = [
  { name: 'Normal', value: 4, color: '#10b981' },
  { name: 'Warning', value: 1, color: '#f59e0b' },
  { name: 'Critical', value: 1, color: '#ef4444' },
];

export default function UtilityDashboard() {
  const [forecastPeriod, setForecastPeriod] = useState<'tomorrow' | 'next_week' | 'next_month'>('tomorrow');
  const [forecastData] = useState(() => ({
    tomorrow: generateDemandForecast('tomorrow'),
    next_week: generateDemandForecast('next_week'),
    next_month: generateDemandForecast('next_month'),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utility Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Electricity Board Overview • Real-time Grid Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Consumers"
          value={formatNumber(8750, 0)}
          icon={<Users className="w-5 h-5" />}
          color="blue"
          delay={0}
          trend={{ value: 3.2, direction: 'up' }}
          subtitle="+45 this month"
        />
        <StatCard
          title="Active Consumers"
          value={formatNumber(8420, 0)}
          icon={<Activity className="w-5 h-5" />}
          color="green"
          delay={0.05}
          subtitle="96.2% active rate"
        />
        <StatCard
          title="Live Smart Meters"
          value={formatNumber(7890, 0)}
          icon={<Cpu className="w-5 h-5" />}
          color="cyan"
          delay={0.1}
          subtitle="90.2% online"
        />
        <StatCard
          title="Today's Theft Alerts"
          value="12"
          icon={<Shield className="w-5 h-5" />}
          color="red"
          delay={0.15}
          trend={{ value: 25, direction: 'up' }}
          subtitle="6 high priority"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area-wise Consumption */}
        <ChartCard
          title="Area-wise Consumption"
          subtitle="Total consumption by area (MWh)"
          delay={0.2}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="rgba(148,163,184,0.5)" width={80} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="consumption" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Consumption (MWh)">
                {areaChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Transformer Status */}
        <ChartCard title="Transformer Status" subtitle="Overview of all transformers" delay={0.25}>
          <div className="flex flex-col items-center justify-center h-full">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={transformerPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                >
                  {transformerPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              {transformerPieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>

            {/* Transformer List */}
            <div className="w-full mt-3 space-y-2 px-2">
              {mockTransformerStatus.slice(0, 3).map(tr => (
                <div key={tr.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-3.5 h-3.5 ${
                      tr.status === 'normal' ? 'text-emerald-500' :
                      tr.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                    }`} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{tr.name}</span>
                  </div>
                  <span className={`font-semibold ${
                    tr.load > 85 ? 'text-red-500' : tr.load > 70 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {tr.load}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Energy Demand Forecast */}
      <ChartCard
        title="Energy Demand Forecast"
        subtitle="AI-powered demand prediction"
        delay={0.3}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(['tomorrow', 'next_week', 'next_month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setForecastPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  forecastPeriod === p
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p === 'tomorrow' ? 'Tomorrow' : p === 'next_week' ? 'Next Week' : 'Next Month'}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData[forecastPeriod]}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorForecast)" name="Predicted (kW)" />
            <Area type="monotone" dataKey="value2" stroke="#10b981" strokeWidth={1.5} fill="url(#colorPrev)" name="Previous Period (kW)" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* High Risk Consumers & Inspection Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* High Risk Consumers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              High Risk Consumers
            </h3>
            <span className="text-xs text-slate-500">AI Risk Ranking</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockHighRiskConsumers.map(consumer => (
              <div key={consumer.consumerId} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {consumer.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{consumer.name}</span>
                      <div className="text-[10px] text-slate-500">{consumer.area} • {consumer.meterId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      consumer.riskLevel === 'high' ? 'risk-high' :
                      consumer.riskLevel === 'medium' ? 'risk-medium' : 'risk-low'
                    }`}>
                      {consumer.riskScore}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-9">
                  {consumer.reasons.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Inspection Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              Inspection Queue
            </h3>
            <span className="text-xs text-slate-500">{mockInspectionQueue.filter(i => i.status === 'pending').length} pending</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockInspectionQueue.map(item => (
              <div key={item.id} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'pending' ? 'bg-amber-500' :
                      item.status === 'in_progress' ? 'bg-primary-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.consumerName}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                    item.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                    item.status === 'in_progress' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' :
                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 ml-4">
                  {item.area} • {item.meterId} • Risk: {item.riskScore}%
                </div>
                <div className="text-xs text-slate-400 ml-4 mt-0.5">{item.reason}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Recent Alerts
          </h3>
          <button className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Alert</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Severity</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Area</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Meter</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Time</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockAlerts.map(alert => (
                <tr key={alert.id}>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{alert.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{alert.message}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      alert.severity === 'critical' ? 'risk-critical' :
                      alert.severity === 'high' ? 'risk-high' :
                      alert.severity === 'medium' ? 'risk-medium' : 'risk-low'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{alert.area || '-'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono text-xs">{alert.meterId || '-'}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${alert.isResolved ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {alert.isResolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
