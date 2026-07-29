import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ThermometerSun, Leaf, Clock, Settings, ArrowRight, Zap, Filter, CheckCircle2 } from 'lucide-react';
import { mockRecommendations } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export default function RecommendationsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredRecs = filter === 'all' 
    ? mockRecommendations 
    : mockRecommendations.filter(r => r.category === filter);

  const totalSavings = mockRecommendations.reduce((acc, curr) => acc + curr.estimatedSavings, 0);

  const categories = [
    { id: 'all', label: 'All Recommendations' },
    { id: 'appliance', label: 'Appliances' },
    { id: 'behavior', label: 'Behavioral' },
    { id: 'schedule', label: 'Scheduling' },
    { id: 'equipment', label: 'Equipment Upgrade' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            AI Energy Recommendations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized insights to reduce your carbon footprint and save money.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-emerald-50">Potential Monthly Savings</h3>
          </div>
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalSavings)}</div>
          <p className="text-sm text-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Based on 6 recommendations
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Leaf className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold">Carbon Reduction</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">125 kg CO₂</div>
          <p className="text-sm text-slate-500">Equivalent to planting 6 trees</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Peak Hour Usage</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">34%</div>
          <p className="text-sm text-amber-500 font-medium">Higher than average</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 text-sm text-slate-500 mr-2 shrink-0">
          <Filter className="w-4 h-4" /> Filter by:
        </div>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === c.id 
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/50 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    rec.category === 'appliance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    rec.category === 'behavior' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    rec.category === 'schedule' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  }`}>
                    {rec.category === 'appliance' ? <ThermometerSun className="w-6 h-6" /> :
                     rec.category === 'behavior' ? <Leaf className="w-6 h-6" /> :
                     rec.category === 'schedule' ? <Clock className="w-6 h-6" /> :
                     <Settings className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {rec.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {rec.category}
                    </span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  rec.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {rec.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Est. Monthly Savings</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(rec.estimatedSavings)}
                  </span>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg transition-colors">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
