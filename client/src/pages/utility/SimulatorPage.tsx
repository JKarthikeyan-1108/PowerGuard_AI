import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RefreshCcw, Activity, AlertTriangle, Zap, Radio, Settings2, Cpu } from 'lucide-react';
import { useSimulator } from '../../hooks/useSimulator';
import StatCard from '../../components/cards/StatCard';

export default function SimulatorPage() {
  const { isRunning, currentReading, readingsHistory, start, pause, reset } = useSimulator();
  const [anomalyType, setAnomalyType] = useState<string>('none');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-500" />
            Smart Meter Simulator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control the hardware simulator to generate live data and test ML anomaly detection.
          </p>
        </div>
        
        {/* Simulator Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {!isRunning ? (
            <button 
              onClick={start}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" /> Start Simulator
            </button>
          ) : (
            <button 
              onClick={pause}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-amber-500/20"
            >
              <Square className="w-4 h-4" /> Pause
            </button>
          )}
          <button 
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Reset Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              title="Live Voltage"
              value={`${currentReading.voltage.toFixed(1)} V`}
              icon={<Zap className="w-5 h-5" />}
              color="blue"
              delay={0}
              trend={{ value: 0, direction: 'up' }}
            />
            <StatCard
              title="Live Current"
              value={`${currentReading.current.toFixed(2)} A`}
              icon={<Activity className="w-5 h-5" />}
              color="green"
              delay={0.1}
            />
            <StatCard
              title="Power Output"
              value={`${(currentReading.power / 1000).toFixed(2)} kW`}
              icon={<Settings2 className="w-5 h-5" />}
              color="amber"
              delay={0.2}
            />
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 font-mono text-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <span className="text-slate-400">Terminal Output (MTR-001)</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="h-64 overflow-y-auto space-y-1.5 scrollbar-hide">
              {readingsHistory.length === 0 ? (
                <div className="text-slate-500 italic">Waiting for simulator to start...</div>
              ) : (
                readingsHistory.slice().reverse().map((r, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-slate-500">[{new Date(r.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-emerald-400">DATA:</span>
                    <span className="text-blue-300">V:{r.voltage.toFixed(1)}</span>
                    <span className="text-amber-300">I:{r.current.toFixed(2)}</span>
                    <span className="text-purple-300">P:{r.power.toFixed(0)}</span>
                    <span className="text-cyan-300">PF:{r.powerFactor.toFixed(2)}</span>
                    {r.isAnomaly && <span className="text-red-400 font-bold ml-auto">[ANOMALY]</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Inject Anomalies
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Force the simulator to generate abnormal patterns to test the ML Engine.
            </p>
            
            <div className="space-y-3">
              {[
                { id: 'none', label: 'Normal Operation', desc: 'Standard load profile', color: 'emerald' },
                { id: 'theft', label: 'Simulate Theft', desc: 'Sudden drop in recorded current', color: 'red' },
                { id: 'overload', label: 'Simulate Overload', desc: 'Current exceeds sanctioned load', color: 'amber' },
                { id: 'voltage', label: 'Voltage Fluctuations', desc: 'Unstable grid voltage', color: 'purple' },
              ].map(anomaly => (
                <label 
                  key={anomaly.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    anomalyType === anomaly.id 
                      ? `border-${anomaly.color}-500 bg-${anomaly.color}-50 dark:bg-${anomaly.color}-900/10` 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  onClick={() => setAnomalyType(anomaly.id)}
                >
                  <input 
                    type="radio" 
                    name="anomaly" 
                    className={`mt-1 accent-${anomaly.color}-500`} 
                    checked={anomalyType === anomaly.id}
                    readOnly
                  />
                  <div>
                    <div className={`font-semibold text-sm ${
                      anomalyType === anomaly.id ? `text-${anomaly.color}-700 dark:text-${anomaly.color}-400` : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {anomaly.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{anomaly.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Apply Injection
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <Radio className={`w-8 h-8 mb-3 ${isRunning ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <div className="text-sm font-semibold text-slate-900 dark:text-white">MQTT Broker Status</div>
            <div className="text-xs text-slate-500 mt-1">
              {isRunning ? 'Connected to ws://localhost:3001' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
