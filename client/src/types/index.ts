// ============================================================
// PowerGuard - Core TypeScript Types
// ============================================================

/** User roles in the system */
export type UserRole = 'consumer' | 'utility' | 'admin';

/** Theme modes */
export type ThemeMode = 'light' | 'dark';

/** Alert severity levels */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Meter status */
export type MeterStatus = 'active' | 'inactive' | 'maintenance' | 'tampered';

/** Risk level for theft detection */
export type RiskLevel = 'low' | 'medium' | 'high';

/** Consumer category from segmentation */
export type ConsumerCategory = 'efficient' | 'normal' | 'heavy' | 'suspicious';

// ============================================================
// Authentication
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  area?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// ============================================================
// Smart Meter
// ============================================================

export interface SmartMeter {
  id: string;
  meterId: string;
  consumerId: string;
  consumerName: string;
  area: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: MeterStatus;
  installedDate: string;
  lastReading?: MeterReading;
}

export interface MeterReading {
  id: string;
  meterId: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;
  timestamp: string;
  isAnomaly?: boolean;
}

// ============================================================
// Dashboard Data
// ============================================================

export interface ConsumerDashboard {
  liveData: MeterReading;
  todayUsage: number;
  monthlyUsage: number;
  currentBill: number;
  nextMonthBill: number;
  energyScore: number;
  carbonFootprint: number;
  electricityCost: number;
  consumptionHistory: ChartDataPoint[];
  voltageHistory: ChartDataPoint[];
  currentHistory: ChartDataPoint[];
  powerHistory: ChartDataPoint[];
  recommendations: Recommendation[];
  alerts: Alert[];
  notifications: Notification[];
}

export interface UtilityDashboard {
  totalConsumers: number;
  activeConsumers: number;
  liveMeters: number;
  todayTheftAlerts: number;
  areaConsumption: AreaConsumption[];
  transformerStatus: TransformerStatus[];
  inspectionQueue: InspectionItem[];
  highRiskConsumers: HighRiskConsumer[];
  energyDemandForecast: ChartDataPoint[];
  monthlyReports: MonthlyReport[];
}

export interface AdminDashboard {
  totalUsers: number;
  totalConsumers: number;
  totalOfficers: number;
  totalMeters: number;
  activeMeters: number;
  systemHealth: SystemHealth;
  recentLogs: SystemLog[];
  userGrowth: ChartDataPoint[];
  alertTrends: ChartDataPoint[];
}

// ============================================================
// Analytics & Charts
// ============================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  timestamp?: string;
}

export interface AreaConsumption {
  area: string;
  consumption: number;
  consumers: number;
  avgUsage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TransformerStatus {
  id: string;
  name: string;
  area: string;
  load: number;
  capacity: number;
  status: 'normal' | 'warning' | 'critical';
  temperature: number;
}

// ============================================================
// Alerts & Notifications
// ============================================================

export interface Alert {
  id: string;
  type: 'high_usage' | 'possible_theft' | 'meter_offline' | 'transformer_overload' | 'abnormal_voltage' | 'abnormal_current';
  title: string;
  message: string;
  severity: AlertSeverity;
  meterId?: string;
  consumerId?: string;
  area?: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
}

// ============================================================
// AI / ML
// ============================================================

export interface TheftDetection {
  consumerId: string;
  meterId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
  detectedAt: string;
  model: 'isolation_forest' | 'random_forest' | 'xgboost';
}

export interface BillPrediction {
  consumerId: string;
  currentBill: number;
  nextMonthBill: number;
  expectedUnits: number;
  savings: number;
  predictedAt: string;
}

export interface DemandForecast {
  period: 'tomorrow' | 'next_week' | 'next_month';
  predictions: ChartDataPoint[];
  peakDemand: number;
  avgDemand: number;
  confidence: number;
}

export interface ConsumerSegment {
  consumerId: string;
  category: ConsumerCategory;
  avgUsage: number;
  score: number;
  cluster: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'appliance' | 'behavior' | 'schedule' | 'equipment';
  estimatedSavings: number;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

// ============================================================
// Utility Specific
// ============================================================

export interface InspectionItem {
  id: string;
  consumerId: string;
  consumerName: string;
  meterId: string;
  area: string;
  riskLevel: RiskLevel;
  riskScore: number;
  reason: string;
  scheduledDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface HighRiskConsumer {
  consumerId: string;
  name: string;
  meterId: string;
  area: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MonthlyReport {
  month: string;
  totalConsumption: number;
  totalRevenue: number;
  theftDetected: number;
  newConnections: number;
  disconnections: number;
}

// ============================================================
// Admin Specific
// ============================================================

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  apiLatency: number;
  dbConnections: number;
  activeWebSockets: number;
  mlServiceStatus: 'online' | 'offline' | 'degraded';
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// Reports
// ============================================================

export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  generatedAt: string;
  generatedBy: string;
  downloadUrl: string;
  size: number;
}

// ============================================================
// Simulator
// ============================================================

export interface SimulatorConfig {
  meterId: string;
  voltageRange: [number, number];
  currentRange: [number, number];
  powerRange: [number, number];
  frequencyRange: [number, number];
  powerFactorRange: [number, number];
  intervalMs: number;
  anomalyRate: number;
  isRunning: boolean;
}

export interface SimulatorState {
  config: SimulatorConfig;
  currentReading: MeterReading | null;
  readings: MeterReading[];
  isRunning: boolean;
  totalReadings: number;
  anomaliesGenerated: number;
}
