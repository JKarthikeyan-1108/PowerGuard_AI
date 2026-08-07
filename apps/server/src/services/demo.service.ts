// ─────────────────────────────────────────────────────────
// PowerGuard — Demo Mode Engine
// Generates realistic smart meter data and simulates
// presentation-ready scenarios for all AI/IoT features
// ─────────────────────────────────────────────────────────

import prisma from '../config/database';
import logger from '../config/logger';
import { getIO } from '../socket';
import { MeterStatus, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';

// ── Types ────────────────────────────────────────────────

export type DemoScenario =
  | 'ELECTRICITY_THEFT'
  | 'METER_TAMPERING'
  | 'TRANSFORMER_FAILURE'
  | 'VOLTAGE_DROP'
  | 'CURRENT_SPIKE'
  | 'HIGH_BILL'
  | 'POWER_OUTAGE'
  | 'DEMAND_FORECAST'
  | 'ENERGY_RECOMMENDATIONS'
  | 'NORMAL_OPERATION';

interface DemoState {
  enabled: boolean;
  activeScenarios: DemoScenario[];
  startedAt: string | null;
  generatedReadings: number;
  generatedAlerts: number;
  intervalId: ReturnType<typeof setInterval> | null;
  speed: 'SLOW' | 'NORMAL' | 'FAST'; // 5s, 2s, 500ms
}

interface ScenarioConfig {
  name: DemoScenario;
  label: string;
  description: string;
  icon: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'THEFT' | 'INFRASTRUCTURE' | 'BILLING' | 'AI';
}

// ── Scenario Definitions ────────────────────────────────

export const SCENARIO_CONFIGS: ScenarioConfig[] = [
  {
    name: 'ELECTRICITY_THEFT',
    label: 'Electricity Theft Detection',
    description: 'Simulates energy diversion patterns — sudden consumption drops, bypass signatures, and AI-flagged anomalies.',
    icon: '🔴',
    severity: 'CRITICAL',
    category: 'THEFT',
  },
  {
    name: 'METER_TAMPERING',
    label: 'Meter Tampering Alert',
    description: 'Simulates physical tampering — erratic voltage readings, magnetic interference, broken seal alerts.',
    icon: '🟠',
    severity: 'HIGH',
    category: 'THEFT',
  },
  {
    name: 'TRANSFORMER_FAILURE',
    label: 'Transformer Overload / Failure',
    description: 'Simulates transformer capacity overload progressing to failure — cascading meter disconnections.',
    icon: '⚡',
    severity: 'CRITICAL',
    category: 'INFRASTRUCTURE',
  },
  {
    name: 'VOLTAGE_DROP',
    label: 'Voltage Drop Anomaly',
    description: 'Simulates low-voltage events on the feeder — brownout conditions affecting multiple meters.',
    icon: '📉',
    severity: 'MEDIUM',
    category: 'INFRASTRUCTURE',
  },
  {
    name: 'CURRENT_SPIKE',
    label: 'Current Spike Detection',
    description: 'Simulates dangerous current spikes — overload protection triggers and safety alerts.',
    icon: '⚠️',
    severity: 'HIGH',
    category: 'INFRASTRUCTURE',
  },
  {
    name: 'HIGH_BILL',
    label: 'High Bill Prediction',
    description: 'Simulates progressive usage increase — AI predicts unusually high upcoming bills and generates recommendations.',
    icon: '💰',
    severity: 'MEDIUM',
    category: 'BILLING',
  },
  {
    name: 'POWER_OUTAGE',
    label: 'Power Outage Simulation',
    description: 'Simulates area-wide power outage — meters go offline in sequence, restoration timeline.',
    icon: '🔌',
    severity: 'CRITICAL',
    category: 'INFRASTRUCTURE',
  },
  {
    name: 'DEMAND_FORECAST',
    label: 'Demand Forecast Visualization',
    description: 'Generates time-series demand data with seasonal patterns, peaks, and AI forecast overlays.',
    icon: '📊',
    severity: 'LOW',
    category: 'AI',
  },
  {
    name: 'ENERGY_RECOMMENDATIONS',
    label: 'Energy Saving Recommendations',
    description: 'Generates personalized energy-saving tips based on AI consumer clustering and usage patterns.',
    icon: '💡',
    severity: 'LOW',
    category: 'AI',
  },
  {
    name: 'NORMAL_OPERATION',
    label: 'Normal Operation',
    description: 'Generates healthy meter readings with natural daily consumption patterns — baseline for comparison.',
    icon: '✅',
    severity: 'LOW',
    category: 'INFRASTRUCTURE',
  },
];

// ── Helper Functions ────────────────────────────────────

function gaussRandom(mean: number, stddev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hourOfDay(): number {
  return new Date().getHours();
}

// Daily consumption pattern multiplier (peaks at 7-9am and 6-10pm)
function dailyPatternMultiplier(): number {
  const h = hourOfDay();
  if (h >= 6 && h <= 9) return 1.4;   // Morning peak
  if (h >= 18 && h <= 22) return 1.6;  // Evening peak
  if (h >= 23 || h <= 5) return 0.5;   // Night valley
  return 1.0;                           // Daytime baseline
}

// ── Demo Engine ─────────────────────────────────────────

class DemoService {
  private state: DemoState = {
    enabled: false,
    activeScenarios: [],
    startedAt: null,
    generatedReadings: 0,
    generatedAlerts: 0,
    intervalId: null,
    speed: 'NORMAL',
  };

  getState() {
    return {
      ...this.state,
      intervalId: undefined, // Don't expose internal timer
    };
  }

  getScenarios() {
    return SCENARIO_CONFIGS;
  }

  // ── Enable/Disable ──────────────────────────────────

  async enable(scenarios: DemoScenario[] = ['NORMAL_OPERATION'], speed: 'SLOW' | 'NORMAL' | 'FAST' = 'NORMAL') {
    if (this.state.enabled) {
      this.disable();
    }

    this.state.enabled = true;
    this.state.activeScenarios = scenarios;
    this.state.startedAt = new Date().toISOString();
    this.state.generatedReadings = 0;
    this.state.generatedAlerts = 0;
    this.state.speed = speed;

    const intervalMs = speed === 'SLOW' ? 5000 : speed === 'NORMAL' ? 2000 : 500;

    logger.info(`🎭 Demo Mode ENABLED — Scenarios: [${scenarios.join(', ')}], Speed: ${speed} (${intervalMs}ms)`);

    // Run first tick immediately
    await this.tick();

    // Schedule recurring ticks
    this.state.intervalId = setInterval(() => {
      this.tick().catch(err => logger.error(`Demo tick error: ${err.message}`));
    }, intervalMs);

    // Broadcast demo state change
    this.broadcastState();

    return this.getState();
  }

  disable() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    const stats = {
      readings: this.state.generatedReadings,
      alerts: this.state.generatedAlerts,
      duration: this.state.startedAt
        ? `${Math.round((Date.now() - new Date(this.state.startedAt).getTime()) / 1000)}s`
        : '0s',
    };

    this.state.enabled = false;
    this.state.activeScenarios = [];
    this.state.startedAt = null;

    logger.info(`🎭 Demo Mode DISABLED — Generated ${stats.readings} readings, ${stats.alerts} alerts in ${stats.duration}`);
    this.broadcastState();

    return stats;
  }

  // ── Core Tick ─────────────────────────────────────────

  private async tick() {
    if (!this.state.enabled) return;

    const meters = await this.getDemoMeters();
    if (meters.length === 0) {
      logger.warn('Demo: No meters found in database for simulation');
      return;
    }

    for (const scenario of this.state.activeScenarios) {
      // Pick a meter based on scenario
      const meter = meters[Math.floor(Math.random() * meters.length)];
      await this.executeScenario(scenario, meter);
    }
  }

  private async getDemoMeters() {
    return prisma.meter.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        serialNumber: true,
        type: true,
        status: true,
        consumerId: true,
        transformerId: true,
      },
      take: 50,
    });
  }

  // ── Scenario Execution ────────────────────────────────

  private async executeScenario(scenario: DemoScenario, meter: any) {
    switch (scenario) {
      case 'NORMAL_OPERATION':
        await this.simulateNormalReading(meter);
        break;
      case 'ELECTRICITY_THEFT':
        await this.simulateElectricityTheft(meter);
        break;
      case 'METER_TAMPERING':
        await this.simulateMeterTampering(meter);
        break;
      case 'TRANSFORMER_FAILURE':
        await this.simulateTransformerFailure(meter);
        break;
      case 'VOLTAGE_DROP':
        await this.simulateVoltageDrop(meter);
        break;
      case 'CURRENT_SPIKE':
        await this.simulateCurrentSpike(meter);
        break;
      case 'HIGH_BILL':
        await this.simulateHighBill(meter);
        break;
      case 'POWER_OUTAGE':
        await this.simulatePowerOutage(meter);
        break;
      case 'DEMAND_FORECAST':
        await this.simulateDemandForecast(meter);
        break;
      case 'ENERGY_RECOMMENDATIONS':
        await this.simulateRecommendations(meter);
        break;
    }
  }

  // ── Scenario Generators ───────────────────────────────

  /** Normal healthy reading with daily pattern */
  private async simulateNormalReading(meter: any) {
    const multiplier = dailyPatternMultiplier();
    const baseKwh = meter.type === 'INDUSTRIAL' ? 45 : meter.type === 'COMMERCIAL' ? 20 : 8;

    const reading = {
      value: clamp(gaussRandom(baseKwh * multiplier, baseKwh * 0.1), 0.5, baseKwh * 3),
      voltage: clamp(gaussRandom(230, 2), 218, 242),
      current: clamp(gaussRandom(10, 1.5), 2, 25),
      powerFactor: clamp(gaussRandom(0.95, 0.02), 0.8, 1.0),
      frequency: clamp(gaussRandom(50.0, 0.05), 49.8, 50.2),
    };

    await this.insertReading(meter, reading, false);
  }

  /** Electricity theft — sudden drop, bypass pattern */
  private async simulateElectricityTheft(meter: any) {
    const phase = Math.random();

    // Phase 1: Normal readings, then sudden drop (energy diversion)
    const reading = {
      value: phase < 0.3
        ? clamp(gaussRandom(2, 0.5), 0.1, 4)           // Suspiciously low
        : clamp(gaussRandom(8, 1), 5, 12),               // Normal
      voltage: clamp(gaussRandom(230, 3), 220, 240),
      current: phase < 0.3
        ? clamp(gaussRandom(15, 2), 10, 22)               // Current normal but energy low = bypass
        : clamp(gaussRandom(10, 1), 7, 14),
      powerFactor: phase < 0.3 ? clamp(gaussRandom(0.5, 0.1), 0.3, 0.7) : 0.95, // Abnormal PF during theft
      frequency: clamp(gaussRandom(50.0, 0.1), 49.7, 50.3),
    };

    const isAnomaly = phase < 0.3;
    await this.insertReading(meter, reading, isAnomaly);

    if (isAnomaly) {
      await this.createAlert(meter, {
        type: AlertType.THEFT_DETECTED,
        severity: AlertSeverity.CRITICAL,
        title: 'AI Theft Detection: Energy Diversion',
        description: `Meter ${meter.serialNumber} shows energy bypass signature. Current draw ${reading.current.toFixed(1)}A but only ${reading.value.toFixed(1)}kWh registered. Power factor ${reading.powerFactor.toFixed(2)} indicates meter bypass. AI confidence: ${(85 + Math.random() * 12).toFixed(1)}%.`,
      });

      await this.createTheftPrediction(meter, 0.87 + Math.random() * 0.1, 'CRITICAL');
    }
  }

  /** Meter tampering — erratic readings, magnetic interference */
  private async simulateMeterTampering(meter: any) {
    const tampered = Math.random() < 0.4;

    const reading = {
      value: tampered
        ? Math.random() < 0.5 ? 0 : clamp(gaussRandom(100, 20), 50, 200) // Zero or wildly high
        : clamp(gaussRandom(8, 1), 5, 12),
      voltage: tampered
        ? clamp(gaussRandom(230, 25), 180, 280)  // Unstable
        : clamp(gaussRandom(230, 2), 225, 235),
      current: tampered
        ? clamp(gaussRandom(10, 8), 0, 30)       // Erratic
        : clamp(gaussRandom(10, 1), 7, 14),
      powerFactor: tampered ? clamp(Math.random(), 0.1, 0.6) : 0.95,
      frequency: tampered
        ? clamp(gaussRandom(50, 1), 47, 53)       // Unstable
        : 50.0,
    };

    await this.insertReading(meter, reading, tampered);

    if (tampered) {
      await this.createAlert(meter, {
        type: AlertType.METER_TAMPER,
        severity: AlertSeverity.HIGH,
        title: 'Meter Tampering Detected',
        description: `Meter ${meter.serialNumber} showing erratic readings consistent with physical tampering. Voltage instability: ${reading.voltage.toFixed(1)}V, frequency deviation: ${reading.frequency.toFixed(2)}Hz. Possible magnetic interference or seal breach.`,
      });

      // Update meter status
      await prisma.meter.update({
        where: { id: meter.id },
        data: { status: MeterStatus.TAMPERED },
      });
    }
  }

  /** Transformer overload leading to failure */
  private async simulateTransformerFailure(meter: any) {
    if (!meter.transformerId) {
      await this.simulateNormalReading(meter);
      return;
    }

    const phase = this.state.generatedReadings % 10; // Progression through failure

    if (phase < 5) {
      // Overload building — load increasing
      const loadPercent = 80 + phase * 5 + Math.random() * 5;
      await prisma.transformer.update({
        where: { id: meter.transformerId },
        data: {
          loadPercent: Math.min(loadPercent, 120),
          currentLoad: loadPercent * 5,
          status: loadPercent > 100 ? 'OVERLOADED' : 'ACTIVE',
        },
      }).catch(() => {});

      const reading = {
        value: clamp(gaussRandom(12, 2), 8, 18),
        voltage: clamp(gaussRandom(220 - phase * 3, 3), 195, 230), // Voltage sag
        current: clamp(gaussRandom(15 + phase * 2, 2), 10, 30),
        powerFactor: clamp(0.95 - phase * 0.03, 0.7, 0.95),
        frequency: clamp(gaussRandom(50, 0.1 + phase * 0.05), 49.5, 50.5),
      };
      await this.insertReading(meter, reading, phase >= 3);

      if (phase === 4) {
        await this.createAlert(meter, {
          type: AlertType.TRANSFORMER_OVERLOAD,
          severity: AlertSeverity.CRITICAL,
          title: 'Transformer Overload — Failure Imminent',
          description: `Transformer serving meter ${meter.serialNumber} at ${loadPercent.toFixed(0)}% capacity. Voltage sag to ${reading.voltage.toFixed(1)}V detected. Immediate load shedding required.`,
        });
      }
    } else {
      // Post-failure — cascading disconnection
      await this.createAlert(meter, {
        type: AlertType.OUTAGE,
        severity: AlertSeverity.CRITICAL,
        title: 'Transformer Failure — Meters Offline',
        description: `Transformer failure confirmed. Meter ${meter.serialNumber} lost power. Estimated restoration: ${Math.floor(Math.random() * 4 + 1)} hours.`,
      });
    }
  }

  /** Low voltage / brownout event */
  private async simulateVoltageDrop(meter: any) {
    const severity = Math.random();
    const droppedVoltage = severity < 0.3 ? gaussRandom(190, 5) : gaussRandom(210, 5);

    const reading = {
      value: clamp(gaussRandom(6, 1), 3, 10), // Reduced consumption during brownout
      voltage: clamp(droppedVoltage, 170, 215),
      current: clamp(gaussRandom(12, 2), 8, 18), // Higher current to compensate
      powerFactor: clamp(gaussRandom(0.85, 0.05), 0.7, 0.95),
      frequency: clamp(gaussRandom(49.8, 0.15), 49.5, 50.0),
    };

    const isAnomaly = reading.voltage < 200;
    await this.insertReading(meter, reading, isAnomaly);

    if (isAnomaly) {
      await this.createAlert(meter, {
        type: AlertType.ANOMALY_DETECTED,
        severity: reading.voltage < 185 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        title: 'Voltage Drop Anomaly',
        description: `Meter ${meter.serialNumber} reading ${reading.voltage.toFixed(1)}V (nominal 230V). ${((1 - reading.voltage / 230) * 100).toFixed(1)}% below nominal. Potential feeder issue or grid instability.`,
      });
    }
  }

  /** Dangerous current spike */
  private async simulateCurrentSpike(meter: any) {
    const spiking = Math.random() < 0.35;
    const spikedCurrent = spiking ? gaussRandom(35, 5) : gaussRandom(10, 1.5);

    const reading = {
      value: clamp(gaussRandom(15, 3), 8, 25),
      voltage: clamp(gaussRandom(spiking ? 225 : 230, 3), 218, 240),
      current: clamp(spikedCurrent, 5, 50),
      powerFactor: clamp(gaussRandom(spiking ? 0.7 : 0.95, 0.05), 0.5, 1.0),
      frequency: clamp(gaussRandom(50, 0.08), 49.8, 50.2),
    };

    await this.insertReading(meter, reading, spiking);

    if (spiking) {
      await this.createAlert(meter, {
        type: AlertType.ANOMALY_DETECTED,
        severity: reading.current > 40 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        title: 'Current Spike Detected',
        description: `Meter ${meter.serialNumber} current spike: ${reading.current.toFixed(1)}A (normal ~10A). ${reading.current > 40 ? 'DANGER: Circuit breaker threshold exceeded.' : 'Investigate load source immediately.'} Power factor dropped to ${reading.powerFactor.toFixed(2)}.`,
      });
    }
  }

  /** Progressively high consumption leading to big bill */
  private async simulateHighBill(meter: any) {
    const multiplier = 2.5 + Math.random() * 1.5; // 2.5x to 4x normal

    const reading = {
      value: clamp(gaussRandom(8 * multiplier, 2), 15, 50),
      voltage: clamp(gaussRandom(230, 2), 225, 235),
      current: clamp(gaussRandom(10 * multiplier, 2), 15, 50),
      powerFactor: clamp(gaussRandom(0.92, 0.03), 0.85, 0.98),
      frequency: 50.0,
    };

    await this.insertReading(meter, reading, false);

    // Occasionally emit a bill prediction alert
    if (Math.random() < 0.2 && meter.consumerId) {
      const predictedBill = reading.value * 30 * 5.5; // ~monthly estimate
      await this.createAlert(meter, {
        type: AlertType.HIGH_CONSUMPTION,
        severity: AlertSeverity.MEDIUM,
        title: 'High Bill Prediction Alert',
        description: `Consumer's usage at meter ${meter.serialNumber} is ${(multiplier * 100 - 100).toFixed(0)}% above average. AI predicts monthly bill of ₹${predictedBill.toFixed(0)} (avg ₹${(predictedBill / multiplier).toFixed(0)}). Energy-saving recommendations generated.`,
      });

      // Generate bill prediction
      if (meter.consumerId) {
        await prisma.billPrediction.create({
          data: {
            consumerId: meter.consumerId,
            month: new Date(),
            predictedAmount: predictedBill,
            predictedUsage: reading.value * 30,
            modelVersion: 'demo-v1.0',
            confidence: 0.82 + Math.random() * 0.1,
          },
        }).catch(() => {});
      }
    }
  }

  /** Area-wide power outage — meters go offline */
  private async simulatePowerOutage(meter: any) {
    // Mark meter as offline
    await prisma.meter.update({
      where: { id: meter.id },
      data: { status: MeterStatus.INACTIVE },
    });

    // Log disconnection
    await prisma.connectionLog.create({
      data: {
        meterId: meter.id,
        event: 'DISCONNECT',
        reason: 'Demo: Simulated power outage',
      },
    });

    // Heartbeat showing offline
    await prisma.heartbeatLog.create({
      data: {
        meterId: meter.id,
        status: 'OFFLINE',
        firmwareVersion: 'v2.1.0',
      },
    });

    await this.createAlert(meter, {
      type: AlertType.OUTAGE,
      severity: AlertSeverity.CRITICAL,
      title: 'Power Outage — Meter Offline',
      description: `Meter ${meter.serialNumber} went offline. Last heartbeat lost. Area-wide outage suspected. Emergency crews dispatched. ETA restoration: ${Math.floor(Math.random() * 3 + 1)}h ${Math.floor(Math.random() * 59)}m.`,
    });

    // Broadcast offline event
    try {
      const io = getIO();
      io.of('/readings').emit('meter:offline', {
        serialNumber: meter.serialNumber,
        status: 'INACTIVE',
        timestamp: new Date(),
      });
      io.of('/admin').emit('system:update', {
        type: 'outage',
        data: { meterId: meter.id, serialNumber: meter.serialNumber },
      });
    } catch {}
  }

  /** Generate demand forecast data points */
  private async simulateDemandForecast(meter: any) {
    // Generate a reading that contributes to demand
    await this.simulateNormalReading(meter);

    // Occasionally create a forecast record
    if (Math.random() < 0.15) {
      const basedemand = 1500 + Math.random() * 500;
      const seasonalFactor = 1 + 0.3 * Math.sin((new Date().getMonth() / 12) * 2 * Math.PI);

      await prisma.energyForecast.create({
        data: {
          forecastDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          period: 'DAILY',
          predictedDemand: basedemand * seasonalFactor,
          peakDemand: basedemand * seasonalFactor * 1.4,
          modelVersion: 'demo-v1.0',
          confidence: 0.85 + Math.random() * 0.1,
        },
      }).catch(() => {});
    }
  }

  /** Generate energy saving recommendations */
  private async simulateRecommendations(meter: any) {
    await this.simulateNormalReading(meter);

    if (Math.random() < 0.1 && meter.consumerId) {
      const recommendations = [
        { type: 'SHIFT_USAGE', title: 'Shift Heavy Appliances to Off-Peak', content: 'Running washing machines and dryers between 10PM-6AM can save up to 15% on your bill. Your peak-hour usage is 40% above optimal.', savings: 350 },
        { type: 'HVAC_OPTIMIZE', title: 'Optimize AC Temperature', content: 'Setting AC to 24°C instead of 20°C reduces cooling costs by ~25%. Your cooling load accounts for 45% of total consumption.', savings: 600 },
        { type: 'STANDBY_POWER', title: 'Eliminate Standby Power Drain', content: 'Your nighttime base load of 1.2kW suggests significant standby consumption. Smart power strips could save ₹200/month.', savings: 200 },
        { type: 'SOLAR_CANDIDATE', title: 'Solar Panel Recommendation', content: 'Based on your consumption pattern (avg 18kWh/day), a 3kW rooftop solar system could offset 60% of your electricity bill.', savings: 1500 },
        { type: 'APPLIANCE_UPGRADE', title: 'Upgrade to 5-Star Appliances', content: 'Your usage pattern suggests old-model refrigerator/AC. Upgrading to BEE 5-star rated appliances can reduce consumption by 30%.', savings: 800 },
      ];

      const rec = recommendations[Math.floor(Math.random() * recommendations.length)];
      await prisma.recommendation.create({
        data: {
          consumerId: meter.consumerId,
          type: rec.type,
          title: rec.title,
          content: rec.content,
          estimatedSavings: rec.savings,
          priority: Math.floor(Math.random() * 3) + 1,
        },
      }).catch(() => {});
    }
  }

  // ── Data Insertion Helpers ────────────────────────────

  private async insertReading(
    meter: any,
    data: { value: number; voltage: number; current: number; powerFactor: number; frequency: number },
    isAnomaly: boolean
  ) {
    try {
      const reading = await prisma.meterReading.create({
        data: {
          meterId: meter.id,
          value: Math.round(data.value * 100) / 100,
          voltage: Math.round(data.voltage * 100) / 100,
          current: Math.round(data.current * 100) / 100,
          powerFactor: Math.round(data.powerFactor * 1000) / 1000,
          frequency: Math.round(data.frequency * 100) / 100,
          timestamp: new Date(),
          source: 'SMART_METER',
          isAnomaly,
        },
      });

      this.state.generatedReadings++;

      // Broadcast via Socket.IO
      try {
        const io = getIO();
        const broadcastData = {
          ...reading,
          serialNumber: meter.serialNumber,
          consumerId: meter.consumerId,
          isDemo: true,
        };
        io.of('/readings').emit('meter:new-reading', broadcastData);
        io.of('/dashboard').emit('dashboard:update', { type: 'reading', data: broadcastData });
        if (meter.consumerId) {
          io.of('/consumer').to(`consumer:${meter.consumerId}`).emit('meter:new-reading', broadcastData);
        }
      } catch {}

      return reading;
    } catch (error: any) {
      logger.error(`Demo: Failed to insert reading: ${error.message}`);
    }
  }

  private async createAlert(
    meter: any,
    data: { type: AlertType; severity: AlertSeverity; title: string; description: string }
  ) {
    try {
      const alert = await prisma.alert.create({
        data: {
          meterId: meter.id,
          type: data.type,
          severity: data.severity,
          status: AlertStatus.NEW,
          title: data.title,
          description: data.description,
          metadata: { demo: true },
        },
      });

      this.state.generatedAlerts++;

      // Broadcast via Socket.IO
      try {
        const io = getIO();
        const broadcastData = {
          ...alert,
          serialNumber: meter.serialNumber,
          consumerId: meter.consumerId,
          isDemo: true,
        };
        io.of('/alerts').emit('alert:new', broadcastData);
        io.of('/dashboard').emit('dashboard:update', { type: 'alert', data: broadcastData });
      } catch {}

      return alert;
    } catch (error: any) {
      logger.error(`Demo: Failed to create alert: ${error.message}`);
    }
  }

  private async createTheftPrediction(meter: any, probability: number, riskLevel: string) {
    try {
      await prisma.theftPrediction.create({
        data: {
          meterId: meter.id,
          probability,
          riskLevel: riskLevel as any,
          modelVersion: 'demo-v1.0',
          features: {
            voltage_anomaly: Math.random() > 0.5,
            current_mismatch: true,
            power_factor_drop: true,
            consumption_pattern: 'irregular',
          },
          flags: {
            bypass_detected: true,
            magnetic_interference: Math.random() > 0.6,
            time_pattern_anomaly: Math.random() > 0.4,
          },
          verified: false,
        },
      });
    } catch {}
  }

  private broadcastState() {
    try {
      const io = getIO();
      io.of('/admin').emit('demo:state', this.getState());
    } catch {}
  }

  // ── Batch Scenario Runner (for presentations) ─────────

  async runPresentationSequence(): Promise<{ status: string; timeline: string[] }> {
    const timeline: string[] = [];

    // 1. Normal operation baseline (10 ticks)
    timeline.push('Phase 1: Establishing normal baseline...');
    await this.enable(['NORMAL_OPERATION'], 'FAST');
    await this.wait(5000);
    this.disable();

    // 2. Theft detection scenario
    timeline.push('Phase 2: Electricity theft detection...');
    await this.enable(['ELECTRICITY_THEFT'], 'FAST');
    await this.wait(6000);
    this.disable();

    // 3. Meter tampering
    timeline.push('Phase 3: Meter tampering alerts...');
    await this.enable(['METER_TAMPERING'], 'FAST');
    await this.wait(4000);
    this.disable();

    // 4. Infrastructure events
    timeline.push('Phase 4: Infrastructure monitoring...');
    await this.enable(['VOLTAGE_DROP', 'CURRENT_SPIKE'], 'FAST');
    await this.wait(5000);
    this.disable();

    // 5. Power outage
    timeline.push('Phase 5: Power outage simulation...');
    await this.enable(['POWER_OUTAGE'], 'NORMAL');
    await this.wait(4000);
    this.disable();

    // 6. AI features
    timeline.push('Phase 6: AI predictions & recommendations...');
    await this.enable(['HIGH_BILL', 'DEMAND_FORECAST', 'ENERGY_RECOMMENDATIONS'], 'FAST');
    await this.wait(6000);
    this.disable();

    timeline.push('Presentation sequence complete.');

    return { status: 'completed', timeline };
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const demoService = new DemoService();
