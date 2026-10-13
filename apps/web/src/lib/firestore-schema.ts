/**
 * PowerGuard AI — Cloud Firestore Schemas & Data Models
 * Strict typed definitions for all 8 collections.
 */

export type UserRole = 'CONSUMER' | 'UTILITY_OPERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type MeterStatus = 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'SUSPENDED';
export type DataSource = 'ESP32_PZEM004T' | 'SIMULATOR_NORMAL' | 'SIMULATOR_THEFT' | 'BENCHMARK';

// ── 1. Users Collection ('users') ──────────────────────────────
export interface FirestoreUser {
  id: string; // Auth UID
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  meterIds?: string[];
  isVerified: boolean;
  createdAt: string; // ISO-8601
  updatedAt: string;
}

// ── 2. Meters Collection ('meters') ────────────────────────────
export interface FirestoreMeter {
  id: string; // Serial / Meter ID (e.g., MTR-001)
  serialNumber: string;
  consumerId: string;
  consumerName: string;
  transformerId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  installationDate: string;
  status: MeterStatus;
  tariffPlan: 'DOMESTIC_SLAB' | 'COMMERCIAL_TOU' | 'INDUSTRIAL_FLAT';
  baseTariffRate: number; // e.g. $0.14 or ₹7.50 per kWh
  lastReadingTimestamp?: string;
  lastVoltage?: number;
  lastCurrent?: number;
  lastPower?: number;
  cumulativeEnergyKwh: number;
  apiKeyHash?: string; // Hashed key for hardware authentication
  createdAt: string;
  updatedAt: string;
}

// ── 3. Meter Readings ('readings') ─────────────────────────────
export interface FirestoreReading {
  id?: string;
  meterId: string;
  consumerId?: string;
  timestamp: string; // ISO-8601 UTC
  voltage: number; // Volts (RMS)
  current: number; // Amperes (RMS)
  power: number; // Active Power in Watts
  cumulativeEnergyKwh: number; // kWh
  frequency: number; // Hz (nominal 50Hz)
  powerFactor: number; // 0.05 to 1.00
  apparentPowerKva?: number; // kVA
  dataSource: DataSource;
  isSimulated: boolean;
  validationStatus: 'VALID' | 'SUSPICIOUS' | 'ANOMALOUS' | 'REJECTED';
  metadata?: {
    firmwareVersion?: string;
    wifiRssi?: number;
    sensorStatus?: string;
  };
}

// ── 4. Alerts ('alerts') ───────────────────────────────────────
export interface FirestoreAlert {
  id: string;
  meterId: string;
  consumerId?: string;
  consumerName?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: 'TAMPER_BYPASS' | 'VOLTAGE_SAG' | 'CURRENT_SURGE' | 'PHASE_SHIFT' | 'COMM_LOSS';
  anomalyScore: number; // Anomaly score from ML model
  detectedAt: string;
  resolvedAt?: string;
  assignedOperatorId?: string;
  investigationNotes?: string;
  readingsSnapshot?: {
    voltage: number;
    current: number;
    power: number;
    powerFactor: number;
  };
}

// ── 5. Predictions ('predictions') ─────────────────────────────
export interface FirestorePrediction {
  id?: string;
  meterId: string;
  consumerId?: string;
  timestamp: string;
  modelVersion: string;
  isAnomaly: boolean;
  anomalyScore: number; // negative score indicates anomaly in Isolation Forest
  riskLevel: 'NORMAL' | 'SUSPICIOUS' | 'HIGH_RISK';
  confidenceScore: number;
  featureImportance?: Record<string, number>;
  explanation: string;
  featuresUsed: {
    voltage: number;
    current: number;
    power: number;
    powerFactor: number;
    frequency: number;
    apparentPower: number;
    hourSin: number;
    hourCos: number;
  };
}

// ── 6. Reports ('reports') ─────────────────────────────────────
export interface FirestoreReport {
  id: string;
  title: string;
  type: 'CONSUMPTION_AUDIT' | 'THEFT_INVESTIGATION' | 'BILLING_SUMMARY' | 'SYSTEM_HEALTH';
  generatedBy: string; // user ID or SYSTEM
  meterId?: string;
  periodStart: string;
  periodEnd: string;
  metrics: {
    totalConsumptionKwh: number;
    estimatedCost: number;
    anomalyCount: number;
    peakDemandKw: number;
    averagePowerFactor: number;
  };
  downloadUrl?: string;
  createdAt: string;
}

// ── 7. Device Status ('deviceStatus') ──────────────────────────
export interface FirestoreDeviceStatus {
  meterId: string;
  isOnline: boolean;
  lastHeartbeat: string;
  ipAddress?: string;
  firmwareVersion: string;
  freeHeapBytes?: number;
  wifiSignalStrengthDbm?: number;
  uptimeSeconds?: number;
  activeErrors?: string[];
}

// ── 8. Model Metadata ('modelMetadata') ────────────────────────
export interface FirestoreModelMetadata {
  id: string; // e.g. "v1.0"
  modelName: string;
  algorithm: string;
  featureList: string[];
  threshold: number;
  contaminationRate: number;
  trainingSamples: number;
  trainedAt: string;
  validationMetrics: {
    rocAuc: number;
    f1Score: number;
    precision: number;
    recall: number;
  };
  isActive: boolean;
}
