'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DigitalTwinCanvas } from '@/components/digital-twin/DigitalTwinCanvas';
import api from '@/lib/api';
import { useSocket } from '@/providers/SocketProvider';

export default function DigitalTwinPage() {
  const [topology, setTopology] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Streaming state for the canvas to flash/pulse nodes
  const [liveReadings, setLiveReadings] = useState<any[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  // Use the dashboard-level socket context
  const { socket } = useSocket();

  // Fetch initial topology
  const fetchTopology = useCallback(async () => {
    try {
      const res = await api.get('/grid/topology');
      setTopology(res.data.data);
    } catch (error) {
      console.error('Failed to fetch grid topology:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopology();
    // Optional: Refresh topology periodically to pick up new meters/transformers
    const interval = setInterval(fetchTopology, 60000);
    return () => clearInterval(interval);
  }, [fetchTopology]);

  // Socket.IO Integration for Live Power Flow Animations
  useEffect(() => {
    if (!socket) return;
    
    // Batch readings to prevent React from re-rendering too fast
    let readingBatch: any[] = [];
    
    const handleNewReading = (reading: any) => {
      readingBatch.push(reading);
    };

    socket.on('meter:new-reading', handleNewReading);

    const flushInterval = setInterval(() => {
      if (readingBatch.length > 0) {
        setLiveReadings([...readingBatch]);
        readingBatch = [];
      }
    }, 500); // Flush every 500ms for smooth animations

    return () => {
      socket.off('meter:new-reading', handleNewReading);
      clearInterval(flushInterval);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewAlert = (alert: any) => {
      setLiveAlerts(prev => [...prev, alert]);
      // A serious alert might require a full topology refresh to change node colors
      if (alert.severity === 'CRITICAL') {
        setTimeout(fetchTopology, 1000);
      }
    };

    socket.on('alert:new', handleNewAlert);

    return () => {
      socket.off('alert:new', handleNewAlert);
    };
  }, [socket, fetchTopology]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Smart Grid Digital Twin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Live interactive topology of the electrical network. Powered by React Flow and Socket.IO.
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <DigitalTwinCanvas 
          topology={topology} 
          loading={loading}
          liveReadingEvents={liveReadings}
          liveAlertEvents={liveAlerts}
        />
      </div>
    </div>
  );
}
