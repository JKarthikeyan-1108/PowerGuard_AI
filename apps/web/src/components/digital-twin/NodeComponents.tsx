import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MapPin, Zap, Gauge, AlertTriangle, MonitorSmartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Area Node ───────────────────────────────────────────
export const AreaNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-3 min-w-[180px] shadow-lg shadow-slate-900/50">
      <div className="flex items-center gap-2 mb-2 text-slate-200">
        <MapPin className="h-5 w-5 text-indigo-400" />
        <span className="font-bold">{data.label}</span>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Risk:</span>
        <Badge variant="outline" className={
          data.riskLevel === 'CRITICAL' ? 'text-red-400 border-red-500/30' :
          data.riskLevel === 'HIGH' ? 'text-orange-400 border-orange-500/30' :
          'text-emerald-400 border-emerald-500/30'
        }>
          {data.riskLevel}
        </Badge>
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Meters:</span>
        <span className="font-medium text-slate-200">{data.meterCount}</span>
      </div>
      
      {/* Target handle from nowhere (top level) but source handle to transformers */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-slate-900" />
    </div>
  );
};

// ── Transformer Node ────────────────────────────────────
export const TransformerNode = ({ data }: { data: any }) => {
  const isOverloaded = data.loadPercent > 90;
  const isWarning = data.loadPercent > 75;

  return (
    <div className={`border-2 rounded-lg p-3 min-w-[200px] shadow-lg transition-colors ${
      isOverloaded ? 'bg-red-950/80 border-red-500/80 shadow-red-900/50' : 
      isWarning ? 'bg-orange-950/80 border-orange-500/80 shadow-orange-900/50' : 
      'bg-slate-900 border-slate-700 shadow-slate-900/50'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 border-2 border-slate-900" />
      
      <div className="flex items-center gap-2 mb-2 text-slate-200">
        <Zap className={`h-5 w-5 ${isOverloaded ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
        <span className="font-bold truncate">{data.label}</span>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Load:</span>
          <span className={`font-medium ${isOverloaded ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-emerald-400'}`}>
            {data.loadPercent.toFixed(1)}%
          </span>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${isOverloaded ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(data.loadPercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{data.status}</span>
          <span>{data.capacity} kVA</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-slate-900" />
    </div>
  );
};

// ── Meter Node ──────────────────────────────────────────
export const MeterNode = ({ data }: { data: any }) => {
  const isFaulty = data.status === 'FAULTY' || data.status === 'TAMPERED';
  const isOffline = data.status === 'INACTIVE';
  
  // Custom flash animation state driven by React Flow data updates
  const isFlashing = data.recentlyUpdated;

  return (
    <div className={`border-2 rounded-lg p-2.5 min-w-[160px] shadow-lg transition-all duration-300 ${
      isFlashing ? 'bg-emerald-950/80 border-emerald-400/80 scale-105 shadow-emerald-900/50' :
      isFaulty ? 'bg-red-950/80 border-red-500/80 shadow-red-900/50' : 
      isOffline ? 'bg-slate-900/50 border-slate-800 shadow-none opacity-60' : 
      'bg-slate-900 border-slate-700 shadow-slate-900/50'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-blue-500 border-2 border-slate-900" />
      
      <div className="flex items-center gap-2 mb-1.5">
        {isFaulty ? <AlertTriangle className="h-4 w-4 text-red-400" /> : 
         isOffline ? <MonitorSmartphone className="h-4 w-4 text-slate-500" /> :
         <Gauge className={`h-4 w-4 ${isFlashing ? 'text-emerald-400' : 'text-emerald-500'}`} />}
        <span className={`font-semibold text-xs truncate ${isOffline ? 'text-slate-500' : 'text-slate-200'}`}>
          {data.label}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${
          isFaulty ? 'text-red-400 border-red-500/30' :
          isOffline ? 'text-slate-500 border-slate-700' :
          'text-emerald-400 border-emerald-500/30'
        }`}>
          {data.status}
        </Badge>
        {data.currentPower !== undefined && (
          <span className="text-xs font-medium text-slate-300">{data.currentPower.toFixed(1)} kW</span>
        )}
      </div>
    </div>
  );
};
