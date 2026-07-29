import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, Search, Filter, ShieldAlert, CheckCircle2, ChevronRight, BrainCircuit } from 'lucide-react';
import { mockHighRiskConsumers } from '../../data/mockData';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export default function TheftDetectionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConsumers = mockHighRiskConsumers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.meterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            AI Theft Detection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Machine Learning analysis of smart meter consumption patterns to detect electricity theft.
          </p>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary-400 mb-6 font-medium text-sm">
              <BrainCircuit className="w-5 h-5" /> Active Ensemble Model
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-slate-400 text-xs mb-1">XGBoost Accuracy</div>
                <div className="text-2xl font-bold text-emerald-400">96.1%</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Isolation Forest</div>
                <div className="text-2xl font-bold text-emerald-400">94.2%</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Random Forest</div>
                <div className="text-2xl font-bold text-emerald-400">91.8%</div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Model Status: <span className="text-emerald-400">Online & Actively Monitoring</span></div>
                <div className="text-xs text-slate-400 mt-1">Last retrained: 3 hours ago • Processed 1.2M readings today</div>
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors">
                View ML Metrics
              </button>
            </div>
          </div>
        </div>

        {/* Feature Importance Radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Theft Indicators Weightage</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                { subject: 'Voltage Drop', A: 85, fullMark: 100 },
                { subject: 'Usage Drop', A: 95, fullMark: 100 },
                { subject: 'PF Anomaly', A: 70, fullMark: 100 },
                { subject: 'Freq Shift', A: 40, fullMark: 100 },
                { subject: 'Harmonics', A: 60, fullMark: 100 },
              ]}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Importance" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flagged Meters List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Flagged Suspicious Meters</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search meter or consumer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary-500 w-full sm:w-64 transition-colors text-slate-900 dark:text-white"
              />
            </div>
            <button className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Consumer Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Meter ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ML Confidence</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Anomalies Detected</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredConsumers.map((consumer, idx) => (
                <motion.tr 
                  key={consumer.consumerId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        {consumer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{consumer.name}</div>
                        <div className="text-xs text-slate-500">{consumer.area}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{consumer.meterId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            consumer.riskScore > 80 ? 'bg-red-500' : 
                            consumer.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${consumer.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${
                        consumer.riskScore > 80 ? 'text-red-600 dark:text-red-400' : 
                        consumer.riskScore > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {consumer.riskScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      94.5%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {consumer.reasons.map((reason, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded-md border border-slate-200 dark:border-slate-700">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Investigate <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredConsumers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No suspicious meters found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
