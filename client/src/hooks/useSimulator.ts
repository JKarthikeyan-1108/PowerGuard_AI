// ============================================================
// PowerGuard - Smart Meter Simulator Hook
// Generates realistic meter readings at configurable intervals
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { MeterReading, SimulatorState, SimulatorConfig } from '../types';

const defaultConfig: SimulatorConfig = {
  meterId: 'MTR-SIM-001',
  voltageRange: [220, 240],
  currentRange: [0.5, 10],
  powerRange: [100, 5000],
  frequencyRange: [49.5, 50.5],
  powerFactorRange: [0.7, 1.0],
  intervalMs: 5000,
  anomalyRate: 0.05,
  isRunning: false,
};

function generateReading(config: SimulatorConfig, isAnomaly: boolean): MeterReading {
  let voltage: number, current: number, powerFactor: number;

  if (isAnomaly) {
    // Generate anomalous readings
    const anomalyType = Math.random();
    if (anomalyType < 0.33) {
      // Voltage anomaly
      voltage = Math.random() < 0.5 ? 180 + Math.random() * 20 : 250 + Math.random() * 20;
      current = config.currentRange[0] + Math.random() * (config.currentRange[1] - config.currentRange[0]);
      powerFactor = config.powerFactorRange[0] + Math.random() * (config.powerFactorRange[1] - config.powerFactorRange[0]);
    } else if (anomalyType < 0.66) {
      // Current spike
      voltage = config.voltageRange[0] + Math.random() * (config.voltageRange[1] - config.voltageRange[0]);
      current = 15 + Math.random() * 30; // Abnormally high
      powerFactor = 0.3 + Math.random() * 0.3; // Poor power factor
    } else {
      // Theft pattern - very low reading despite expected high
      voltage = config.voltageRange[0] + Math.random() * (config.voltageRange[1] - config.voltageRange[0]);
      current = 0.01 + Math.random() * 0.1; // Suspiciously low
      powerFactor = 0.1 + Math.random() * 0.2;
    }
  } else {
    voltage = config.voltageRange[0] + Math.random() * (config.voltageRange[1] - config.voltageRange[0]);
    current = config.currentRange[0] + Math.random() * (config.currentRange[1] - config.currentRange[0]);
    powerFactor = config.powerFactorRange[0] + Math.random() * (config.powerFactorRange[1] - config.powerFactorRange[0]);
  }

  const power = voltage * current * powerFactor;
  const frequency = config.frequencyRange[0] + Math.random() * (config.frequencyRange[1] - config.frequencyRange[0]);
  const energy = 100 + Math.random() * 200; // Cumulative kWh

  return {
    id: `RD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    meterId: config.meterId,
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 10) / 10,
    energy: Math.round(energy * 100) / 100,
    frequency: Math.round(frequency * 100) / 100,
    powerFactor: Math.round(powerFactor * 100) / 100,
    timestamp: new Date().toISOString(),
    isAnomaly,
  };
}

export function useSimulator(initialConfig?: Partial<SimulatorConfig>) {
  const [state, setState] = useState<SimulatorState>({
    config: { ...defaultConfig, ...initialConfig },
    currentReading: null,
    readings: [],
    isRunning: false,
    totalReadings: 0,
    anomaliesGenerated: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateNewReading = useCallback(() => {
    setState(prev => {
      const isAnomaly = Math.random() < prev.config.anomalyRate;
      const reading = generateReading(prev.config, isAnomaly);
      const newReadings = [...prev.readings.slice(-99), reading]; // Keep last 100

      return {
        ...prev,
        currentReading: reading,
        readings: newReadings,
        totalReadings: prev.totalReadings + 1,
        anomaliesGenerated: prev.anomaliesGenerated + (isAnomaly ? 1 : 0),
      };
    });
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    
    setState(prev => ({ ...prev, isRunning: true, config: { ...prev.config, isRunning: true } }));
    generateNewReading(); // Generate first reading immediately
    intervalRef.current = setInterval(generateNewReading, state.config.intervalMs);
  }, [generateNewReading, state.config.intervalMs]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false, config: { ...prev.config, isRunning: false } }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      config: { ...defaultConfig, ...initialConfig },
      currentReading: null,
      readings: [],
      isRunning: false,
      totalReadings: 0,
      anomaliesGenerated: 0,
    });
  }, [initialConfig]);

  const updateConfig = useCallback((updates: Partial<SimulatorConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    start,
    pause,
    reset,
    updateConfig,
  };
}
