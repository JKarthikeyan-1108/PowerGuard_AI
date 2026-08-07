'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Zap } from 'lucide-react';

interface HeatmapData {
  id: string;
  lat: number;
  lng: number;
  riskScore: number;
  type: 'THEFT_SUSPICION' | 'OVERLOAD_RISK';
}

const mockData: HeatmapData[] = [
  { id: '1', lat: 40.7128, lng: -74.0060, riskScore: 0.85, type: 'THEFT_SUSPICION' },
  { id: '2', lat: 40.7200, lng: -74.0100, riskScore: 0.92, type: 'THEFT_SUSPICION' },
  { id: '3', lat: 40.7150, lng: -73.9900, riskScore: 0.75, type: 'OVERLOAD_RISK' },
  { id: '4', lat: 40.7050, lng: -74.0150, riskScore: 0.65, type: 'THEFT_SUSPICION' },
  { id: '5', lat: 40.7300, lng: -73.9950, riskScore: 0.88, type: 'OVERLOAD_RISK' },
  { id: '6', lat: 40.7250, lng: -74.0050, riskScore: 0.45, type: 'THEFT_SUSPICION' },
  { id: '7', lat: 40.7100, lng: -73.9800, riskScore: 0.95, type: 'OVERLOAD_RISK' },
];

const getMarkerColor = (score: number, type: string) => {
  if (score > 0.8) return '#ef4444'; // Red
  if (score > 0.6) return '#f59e0b'; // Amber
  return '#3b82f6'; // Blue
};

// Component to handle map resize
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

export default function RiskMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix for Leaflet default icons in Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
      iconUrl: require('leaflet/dist/images/marker-icon.png').default,
      shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    });
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">Loading map...</div>;
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[40.7128, -74.0060]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapResizer />
        
        {mockData.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={point.riskScore * 15 + 5}
            pathOptions={{ 
              color: getMarkerColor(point.riskScore, point.type),
              fillColor: getMarkerColor(point.riskScore, point.type),
              fillOpacity: 0.6,
              weight: 1
            }}
          >
            <Tooltip>
              <div className="p-1">
                <div className="font-bold text-sm mb-1">{point.type === 'THEFT_SUSPICION' ? 'Theft Risk' : 'Overload Risk'}</div>
                <div className="text-xs">Risk Score: {(point.riskScore * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Location: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[400] bg-background/90 backdrop-blur border border-border/50 rounded-lg p-3 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444] opacity-80" />
            <span className="text-xs">Critical Risk (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b] opacity-80" />
            <span className="text-xs">High Risk (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] opacity-80" />
            <span className="text-xs">Moderate Risk (&lt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
