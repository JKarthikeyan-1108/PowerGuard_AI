// ─────────────────────────────────────────────────────
// PowerGuard TypeScript Types
// ─────────────────────────────────────────────────────

export type UserRole = 'CONSUMER' | 'UTILITY_OFFICER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type MeterType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
export type MeterStatus = 'ACTIVE' | 'INACTIVE' | 'FAULTY' | 'TAMPERED' | 'MAINTENANCE';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_ALARM';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  consumerProfile?: ConsumerProfile;
  utilityOfficer?: UtilityOfficer;
}

export interface ConsumerProfile {
  id: string;
  userId: string;
  accountNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  areaId?: string;
  tariffRate: number;
  connectionType: MeterType;
  area?: Area;
  meters?: Meter[];
}

export interface UtilityOfficer {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  designation: string;
  jurisdiction?: string;
}

export interface Meter {
  id: string;
  serialNumber: string;
  type: MeterType;
  status: MeterStatus;
  consumerId?: string;
  transformerId?: string;
  latitude?: number;
  longitude?: number;
  installDate: string;
  lastReadingAt?: string;
  firmwareVersion?: string;
  consumer?: ConsumerProfile;
  transformer?: Transformer;
  _count?: { readings: number; alerts: number };
}

export interface MeterReading {
  id: string;
  meterId: string;
  value: number;
  voltage?: number;
  current?: number;
  powerFactor?: number;
  frequency?: number;
  timestamp: string;
  source: string;
  isAnomaly: boolean;
}

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  meterId?: string;
  userId?: string;
  createdAt: string;
  resolvedAt?: string;
  meter?: { serialNumber: string; type: string };
  user?: { firstName: string; lastName: string; email: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Transformer {
  id: string;
  name: string;
  serialNumber: string;
  capacity: number;
  currentLoad: number;
  loadPercent: number;
  latitude: number;
  longitude: number;
  areaId?: string;
  status: string;
  area?: Area;
  _count?: { meters: number };
}

export interface Area {
  id: string;
  name: string;
  code: string;
  riskLevel: RiskLevel;
  population?: number;
  totalMeters: number;
  _count?: { consumers: number; transformers: number };
}

export interface BillPrediction {
  id: string;
  consumerId: string;
  month: string;
  predictedAmount: number;
  actualAmount?: number;
  predictedUsage: number;
  actualUsage?: number;
  modelVersion: string;
  confidence?: number;
}

export interface TheftPrediction {
  id: string;
  meterId: string;
  probability: number;
  riskLevel: RiskLevel;
  modelVersion: string;
  flags?: Record<string, boolean>;
  createdAt: string;
}

export interface EnergyForecast {
  id: string;
  areaId?: string;
  forecastDate: string;
  period: string;
  predictedDemand: number;
  actualDemand?: number;
  peakDemand?: number;
  confidence?: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
  user?: { email: string; firstName: string; lastName: string; role: string };
}

export interface DashboardStats {
  totalConsumers?: number;
  totalMeters?: number;
  activeMeters?: number;
  totalAlerts?: number;
  newAlerts?: number;
  criticalAlerts?: number;
  theftDetections?: number;
  monthlyConsumption?: number;
  totalConsumption?: number;
  avgDailyUsage?: number;
  activeAlerts?: number;
  predictedBill?: number;
  readings?: MeterReading[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Sidebar navigation
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}
