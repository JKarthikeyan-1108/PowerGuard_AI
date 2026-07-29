import { useState } from 'react';
import { BrainCircuit, Play, RotateCcw, AlertCircle, CheckCircle2, History } from 'lucide-react';

const mlModels = [
  {
    id: 'IF-01',
    name: 'Isolation Forest',
    purpose: 'Theft Anomaly Detection',
    status: 'active',
    accuracy: '94.2%',
    lastTrained: '2 hours ago',
    latency: '15ms',
    dataPoints: '1.2M',
  },
  {
    id: 'XGB-01',
    name: 'XGBoost Classifier',
    purpose: 'Theft Probability Scoring',
    status: 'active',
    accuracy: '96.1%',
    lastTrained: '12 hours ago',
    latency: '35ms',
    dataPoints: '3.4M',
  },
  {
    id: 'PRO-01',
    name: 'Prophet Time-Series',
    purpose: 'Energy Demand Forecasting',
    status: 'training',
    accuracy: '89.5%',
    lastTrained: 'In Progress (45%)',
    latency: '-',
    dataPoints: '8.1M',
  },
  {
    id: 'KM-01',
    name: 'K-Means Clustering',
    purpose: 'Consumer Segmentation',
    status: 'idle',
    accuracy: '87.3%',
    lastTrained: '2 days ago',
    latency: '12ms',
    dataPoints: '450K',
  },
];

export default function MlModelsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            Machine Learning Models
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, monitor, and retrain the AI models powering the platform.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
          <RotateCcw className="w-4 h-4" /> Retrain All Active Models
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mlModels.map((model) => (
          <div key={model.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            
            {/* Background Glow */}
            <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none ${
              model.status === 'active' ? 'bg-emerald-500' :
              model.status === 'training' ? 'bg-amber-500' : 'bg-slate-500'
            }`} />

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{model.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    model.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    model.status === 'training' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{model.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{model.purpose}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{model.accuracy}</div>
                <div className="text-xs text-slate-500">Current Accuracy</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Latency</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{model.latency}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Data Points</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{model.dataPoints}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Last Trained</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{model.lastTrained}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
                <History className="w-4 h-4" /> View Logs
              </button>
              <button 
                disabled={model.status === 'training'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {model.status === 'training' ? (
                  <><RotateCcw className="w-4 h-4 animate-spin" /> Training...</>
                ) : (
                  <><Play className="w-4 h-4" /> Force Retrain</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
